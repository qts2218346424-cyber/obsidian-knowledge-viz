// ============================================================================
// CoreForge 研核 · 全景视觉使用手册与备考秘籍数据字典 (v2.0 焕新版)
// 用直观大白话讲透每个功能「干嘛用的、在哪找到、怎么一步步操作、顺手提效窍门」
// ============================================================================

export type ManualCategoryKey =
  | 'all'
  | 'quick_start'
  | 'spectrum_graph'
  | 'study_flashcard'
  | 'courseware_tools'
  | 'ai_agent'
  | 'system_collab'

export type ManualColorTheme =
  | 'rose'
  | 'purple'
  | 'amber'
  | 'emerald'
  | 'blue'
  | 'teal'
  | 'cyan'
  | 'indigo'
  | 'slate'

export interface FeatureManualItem {
  id: string
  name: string
  category: Exclude<ManualCategoryKey, 'all'>
  categoryName: string
  badge: string
  color: ManualColorTheme
  iconName: string
  isNew?: boolean // 标记近期重磅升级或新上线特性
  tags?: string[] // 辅助搜索关键词
  whereToFind: string // 明确告诉用户在界面哪里能找到它
  summary: string // 一句话大白话说明它干嘛用
  problemSolved: string // 适合什么场景 / 帮你解决什么麻烦
  howToUse: string[] // 一看就懂的分步操作说明
  proTips: string[] // 顺手提效的小窍门
  shortcuts?: string[] // 快捷键（如有）
  route?: string // 一键跳转目标页
  routeText?: string // 跳转按钮文字
}

export interface QuickScenarioItem {
  id: string
  title: string
  subtitle: string
  iconName: string
  color: ManualColorTheme
  featureId?: string
  route?: string
  actionLabel: string
}

export interface ShortcutGroup {
  id: string
  title: string
  subtitle: string
  iconName: string
  items: Array<{
    keys: string[]
    macKeys?: string[]
    action: string
    scope: string
  }>
}

export interface StageRoadmapItem {
  stage: string
  period: string
  title: string
  goal: string
  color: 'indigo' | 'amber' | 'rose'
  recommendedModules: Array<{
    label: string
    tip: string
    route: string
  }>
}

export const MANUAL_CATEGORIES: Array<{
  key: ManualCategoryKey
  label: string
  shortLabel: string
  iconName: string
}> = [
  { key: 'all', label: '全部功能百科', shortLabel: '全部', iconName: 'Sparkles' },
  { key: 'quick_start', label: '刷题与高频必备', shortLabel: '高频必备', iconName: 'Zap' },
  { key: 'spectrum_graph', label: '薄弱查漏与图谱', shortLabel: '查漏图谱', iconName: 'Flame' },
  { key: 'study_flashcard', label: '研学·英语·政治', shortLabel: '研学语政', iconName: 'GraduationCap' },
  { key: 'courseware_tools', label: '仿真课件与心流', shortLabel: '课件专注', iconName: 'Cpu' },
  { key: 'ai_agent', label: 'AI导师与双宠伴学', shortLabel: 'AI与桌宠', iconName: 'Bot' },
  { key: 'system_collab', label: '笔记·PDF·多端同步', shortLabel: '笔记多端', iconName: 'ShieldCheck' },
]

export const HOT_SEARCH_TAGS: string[] = [
  '手机跨端',
  '平板刷题',
  '提分急救舱',
  '大肥鱼桌宠',
  '外网穿透',
  '拼写默写',
  '史纲地图',
  '公式速插',
  'PDF提取',
  '考点色谱',
  '错题重练',
]

// 1 分钟快速上手：7 大高频备考意图罗盘
export const QUICK_SCENARIO_GUIDES: QuickScenarioItem[] = [
  {
    id: 'sc-mobile',
    title: '我想用手机 / 平板随时随地刷题',
    subtitle: '电脑作为私人微服务器，寝室/自习室躺平背词做题，免购买云服务器',
    iconName: 'Smartphone',
    color: 'teal',
    featureId: 'mobile-study-guide',
    actionLabel: '看跨端指南',
  },
  {
    id: 'sc-quiz',
    title: '我想刷历年真题 / 限时模考',
    subtitle: '408 与数学 1987–2024 整卷、专项突破，右侧自带答题卡与草稿纸',
    iconName: 'ClipboardList',
    color: 'indigo',
    route: '/quiz',
    actionLabel: '去刷真题',
  },
  {
    id: 'sc-error',
    title: '我想消灭错题 / 查错因归档',
    subtitle: '答错自动入库，支持按错因筛选、一键错题重练与 AI 同类变式出题',
    iconName: 'Flame',
    color: 'rose',
    route: '/quiz?tab=errors',
    actionLabel: '看错题本',
  },
  {
    id: 'sc-weak',
    title: '我想看哪块没学透 / 5题急救',
    subtitle: '红黄绿热力图一眼揪出高危盲区，点红点即开急救舱看课件+练5题',
    iconName: 'ShieldAlert',
    color: 'amber',
    route: '/graph',
    actionLabel: '查薄弱点',
  },
  {
    id: 'sc-vocab-eng',
    title: '我想背考研单词 / 批改英语作文',
    subtitle: '支持拼写默写、随身巡航连播、5阶词汇色谱与 20 分制 AI 四维精批',
    iconName: 'Languages',
    color: 'cyan',
    route: '/vocabulary',
    actionLabel: '去背词精批',
  },
  {
    id: 'sc-editor',
    title: '我想写公式笔记 / 同步 Obsidian',
    subtitle: '防误触优先预览、富文本与源码双模、Σ 公式速插与本地实时落盘',
    iconName: 'FileEdit',
    color: 'emerald',
    route: '/editor',
    actionLabel: '去写笔记',
  },
  {
    id: 'sc-ai-pet',
    title: '我想问大题推导 / 唤出伴学桌宠',
    subtitle: '4 大分科 AI 导师流式拆解步骤，右下角奶龙与大肥鱼随时陪学整理',
    iconName: 'Bot',
    color: 'purple',
    route: '/chat',
    actionLabel: '问 AI 导师',
  },
]

export const FEATURE_MANUAL_DATA: FeatureManualItem[] = [
  // ── 1. 刷题与高频必备 ──
  {
    id: 'quiz-modes',
    name: '刷题中心：真题整卷 · 题型专项 · 自由组卷',
    category: 'quick_start',
    categoryName: '刷题与高频必备',
    badge: '每日核心 · 刷题主阵地',
    color: 'indigo',
    iconName: 'ClipboardList',
    tags: ['真题', '模考', '408', '考研数学', '李林', '练习模式', '考试模式'],
    whereToFind: '顶部导航栏 → 刷题中心（手机端底部导航点「刷题」）',
    summary: '涵盖 1987–2024 考研数学与 2009–2024 统考 408 整卷及名师密押，支持成套掐表模考、章节专项与随机抽题。',
    problemSolved: '不同复习阶段需要不同刷法：一轮想按章节知识点打基础，二轮想攻克薄弱专题，冲刺期想掐着 180 分钟做全真模拟卷，这里一站配齐。',
    howToUse: [
      '打开「刷题中心」，顶部提供 4 大核心标签：「真题整卷」「题型专项」「自由组卷」「错题本」。',
      '想成套做历年试卷：选「真题整卷」，挑一套真题点开，可选“练习模式（做一题立刻看解析）”或“考试模式（全真计时交卷后统一出成绩单）”。',
      '想专攻某个高频难点（如 AVL 树旋转、中值定理证明、页面置换）：切到「题型专项」精准开练。',
      '想利用碎片时间抽测：在「自由组卷」勾选科目和题量，点「立即开始」秒生成随堂小测。',
    ],
    proTips: [
      '练习模式下按键盘 Enter 可快速展开/收起解析，用方向键 ← / → 丝滑切换上一题、下一题。',
      '中途有事退出不用慌，系统会自动冻结保存作答进度，下次回来点「继续上次答题」即可无缝接力。',
    ],
    shortcuts: ['Enter 看解析', '← / → 切题'],
    route: '/quiz',
    routeText: '进入刷题中心',
  },
  {
    id: 'error-diagnostic',
    name: '智能错题本：三维错因归档与 AI 变式重练',
    category: 'quick_start',
    categoryName: '刷题与高频必备',
    badge: '提分关键 · 查漏闭环',
    color: 'rose',
    iconName: 'Flame',
    tags: ['错题', '错因', '重练', '变式题', '归档'],
    whereToFind: '顶部导航栏 → 刷题中心 → 第 4 个标签「错题本」',
    summary: '刷题答错自动入库，支持按「概念混淆 / 计算失误 / 审题不清 / 思维定势」打标归因，并一键抽题重考或生成同类新题。',
    problemSolved: '做完卷子只扫一眼答案最容易产生“我看懂了”的错觉，过两周换个数又错。错题本帮你把失分点集中锁定、反复清零。',
    howToUse: [
      '进入「刷题中心 → 错题本」（手机端首页常用入口也可一键直达）。',
      '支持按学科、年份、考点和错因类型多层筛选当前未消灭的错题。',
      '点击「错题重练」，系统会将待攻克错题重新洗牌组卷；重做全对后即可标记为“已斩题”。',
      '在题目结算或详情页点击「存入错题本」可生成标准双链 Markdown 错题笔记；点击「AI 变式强化」可现场命制换汤不换药的同考点新题检验真水平。',
    ],
    proTips: [
      '做题时遇到侥幸蒙对但其实没吃透的好题，随手点右上角「星标收藏」，复盘时同样能快速调出。',
    ],
    route: '/quiz?tab=errors',
    routeText: '打开智能错题本',
  },
  {
    id: 'answer-palette-scratchpad',
    name: '考场双翼：交互答题卡 · 屏幕演草纸 · 定理速查',
    category: 'quick_start',
    categoryName: '刷题与高频必备',
    badge: '沉浸做题 · 免找纸笔',
    color: 'amber',
    iconName: 'LayoutGrid',
    tags: ['草稿纸', '答题卡', '手写', '定理速查', '演草'],
    whereToFind: '进入任意做题页面后的右侧伴随面板（手机端顶部点「答题卡」或底部点「草稿」）',
    summary: '右边看答题卡跳题号、切到屏幕草稿纸直接用鼠标或触控笔列竖式画树图，忘公式还能秒翻定理速查卡。',
    problemSolved: '做整卷经常漏看跳过的题；算二重积分、矩阵初等变换或二叉树指针调整时手边没演草纸，低头抬头还容易串行。',
    howToUse: [
      '做题界面右侧默认展示「答题卡」：已答、未答、标星复查题号分色高亮，点击任意题号瞬间定位。',
      '遇到暂时卡壳的题，点题干旁的小旗子/星标做记号，交卷前集中回头攻坚。',
      '切到第 2 个标签「草稿纸」，立刻展开顺滑演算画布，支持调画笔粗细、换色标注、橡皮擦与一键清屏。',
      '切到第 3 个标签「定理速查」，可当场查阅常用泰勒展开式、等价无穷小与 408 核心公式。',
    ],
    proTips: [
      '在电脑做题界面直接按 Ctrl + J（Mac 按 ⌘J），可把当前题目连同题干上下文一键抛给 AI 导师拆解！',
    ],
    shortcuts: ['Ctrl + J 追问当前题'],
    route: '/quiz',
    routeText: '体验做题演草面板',
  },
  {
    id: 'quick-note',
    name: '极速随手记：不打断心流的闪电灵感抽屉',
    category: 'quick_start',
    categoryName: '刷题与高频必备',
    badge: '全站呼出 · 秒记灵感',
    color: 'emerald',
    iconName: 'PenLine',
    tags: ['随手记', '便签', '速记', '灵感'],
    whereToFind: '电脑端顶栏「更多功能 → 极速随手记」；手机端首页点「随手记」或底栏「全部 → 随手速记」',
    summary: '无论正在刷题还是看视频讲义，无需跳走页面，侧边滑出便签框记下易错点或公式，自动归档进本地知识库。',
    problemSolved: '刷题中途突然悟出一个秒杀结论，如果专门切去编辑器新建文件再切回来，做题思路早断了。',
    howToUse: [
      '在任意页面唤起「随手记」抽屉，系统已按当前时间戳自动填好标题，落笔就能敲字。',
      '点击顶部学科胶囊（如 `#408数据结构`、`#高数证明`、`#错题警示`）一键打好分类标签。',
      '快捷栏自带数学公式符号、待办复选框与代码块按钮，支持直接粘贴题目截图。',
      '点「保存到知识库」，内容即刻落盘至本地 `随手记` 文件夹，也可点「保存并打开编辑器」深度扩写。',
    ],
    proTips: [
      '睡前躺在床上用手机想到明天要查的盲区考点，用随手记记一条待办，第二天电脑打开工作台直接就能看到。',
    ],
    route: '/editor',
    routeText: '查看已存笔记',
  },

  // ── 2. 薄弱查漏与图谱 ──
  {
    id: 'mastery-spectrum',
    name: '考点掌握热力色谱图（红黄绿三色雷达找盲区）',
    category: 'spectrum_graph',
    categoryName: '薄弱查漏与图谱',
    badge: '王牌诊断 · 精准排雷',
    color: 'rose',
    iconName: 'Flame',
    tags: ['热力图', '红黄绿', '盲区', '掌握度', '薄弱点'],
    whereToFind: '顶部「更多功能 → 知识图谱网络」或「研学中心 → 掌握热力」',
    summary: '根据你真实的刷题对错率与闪卡记忆反馈，将全大纲考点自动渲染为绿（稳拿）、黄（待固）、红（高危盲区）三色星图。',
    problemSolved: '复习到中后期最怕“虚假努力”——会的题反复刷得很爽，真正考场上要丢分的盲区却一直藏在死角里。',
    howToUse: [
      '打开掌握热力图，认准三色信号灯：\n  • 🟢 绿色（熟练 ≥80%）：已稳固掌握，保持常规间隔复盘即可；\n  • 🟡 黄色（巩固 50%~80%）：懂原理但易掉陷阱，建议二轮重点补强；\n  • 🔴 红色（盲区 <50%，带脉冲呼吸光圈）：高危失分点！请优先点击抢救。',
      '顶部支持切换「408 计算机」与「考研数学」，并用状态胶囊一键只筛出「🔴 盲区」集中火力歼灭。',
      '单击任意红色/黄色圆点，立即弹出【提分急救舱】，按“看历史错题 → 看动态仿真课件 → 测 5 道靶向题”三步把红灯救绿！',
    ],
    proTips: [
      '你在急救舱或刷题中心每做对一道同考点真题，热力图对应节点的颜色与分数都会实时自动回写升级！',
    ],
    route: '/graph',
    routeText: '查看热力色谱图',
  },
  {
    id: 'mastery-palette',
    name: '11 级考点色谱：408 灰阶与数学紫阶攻坚梯队',
    category: 'spectrum_graph',
    categoryName: '薄弱查漏与图谱',
    badge: '阶梯闯关 · 22大核心枢纽',
    color: 'purple',
    iconName: 'Palette',
    tags: ['考点色谱', '灰阶', '紫阶', '22核心', '自测卷'],
    whereToFind: '顶部导航「研学中心」→ 点击「考点色谱」标签',
    summary: '将 408 与数学最具区分度的 22 个压舱石考点，按由浅入深的 11 级色阶排成进阶路线，支持自建考点与一键 AI 出自测卷。',
    problemSolved: '面对厚厚的大纲分不清轻重缓急，不知道一轮先啃哪块、二轮冲刺该死磕哪些综合压轴大题。',
    howToUse: [
      '读懂双轨 11 级难度梯度（色阶越浅越偏基础必拿分，色阶越深越偏综合拉分压轴）：\n  • 🖥️ 408 灰阶（50→950）：从二叉树遍历、IEEE754，进阶到流水线冒险、页式存储、PV 同步、TCP 拥塞，直至快排手撕与跨科压轴大题；\n  • 📐 数学紫阶（50→950）：从等价无穷小、泰勒展开，进阶到中值定理、二重积分、黑塞矩阵，直至正交对角化与压轴构造证明。',
      '悬停圆点可速览命题套路；单击圆点即复制考点词，方便一键去题库检索或发给 AI 导师深挖。',
      '点击末尾虚线圆圈「+ 自建考点 / 定理」可定制个人专属攻坚目标；点击右上角「Ask AI: 生成自测卷」即刻生成针对性摸底卷。',
    ],
    proTips: [
      '「考点色谱」管宏观复习节奏（从浅色刷向深色），「掌握热力图」管微观错题排雷，双剑合璧稳步提分。',
    ],
    route: '/study?tab=mastery',
    routeText: '打开 11 级考点色谱',
  },
  {
    id: 'mastery-rescue',
    name: '提分急救舱（薄弱考点 5 题靶向抢救闭环）',
    category: 'spectrum_graph',
    categoryName: '薄弱查漏与图谱',
    badge: '靶向抢救 · 即学即测',
    color: 'amber',
    iconName: 'ShieldAlert',
    tags: ['急救舱', '5题突击', '补弱'],
    whereToFind: '在「掌握热力图」中单击任意一个考点圆点自动弹出',
    summary: '针对单个薄弱考点提供“错因复盘 → 交互动画讲透机理 → 现场 5 题实弹检验”的最短闭环抢救方案。',
    problemSolved: '发现自己某块不会（比如银行家算法或斯托克斯公式），但再去翻几百页教材太慢，急救舱 10 分钟帮你定点打通。',
    howToUse: [
      '在热力图中点开目标考点，顶部直观显示当前掌握度百分比与薄弱诊断。',
      '先看「历史错题」回顾曾踩过的坑，再点「调取配套仿真课件」亲手单步推演核心过程。',
      '彻底想通后点击「开启 5 题靶向突击」，现场完成 5 道精选真题，达标后考点圆点当场由红转绿！',
    ],
    proTips: [
      '如果你在线下刷纸质书已经把该专题啃透了，也可以直接拖动急救舱右上角滑块手动校准掌握分。',
    ],
    route: '/graph',
    routeText: '去图谱点考点体验',
  },
  {
    id: 'knowledge-graph',
    name: 'Obsidian 双链知识星空图（全局脉络与孤岛检测）',
    category: 'spectrum_graph',
    categoryName: '薄弱查漏与图谱',
    badge: '全局织网 · 跨章串联',
    color: 'indigo',
    iconName: 'Network',
    tags: ['双链', '知识图谱', '关系网', '孤立笔记'],
    whereToFind: '顶部「更多功能 → 知识图谱网络」或「研学中心 → 全景图谱」',
    summary: '将知识库中所有 Markdown 笔记通过 `[[双向链接]]` 织成交互式关系星空，核心枢纽与孤立知识盲点一目了然。',
    problemSolved: '408 四门课与高数线代知识点极度密集，单章看都懂，一到跨章节综合大题就想不起定理之间的串联桥梁。',
    howToUse: [
      '滚轮缩放星图、按住空白自由拖拽；节点体积越大代表被引用次数越多，是高频核心枢纽。',
      '顶部搜索框输入任意关键词（如 `特征值`、`死锁`），相关联的知识簇立刻聚光高亮。',
      '双击任意节点，右侧即刻滑出笔记原文抽屉就地精读，无需离开星图视野。',
    ],
    proTips: [
      '带有橙色呼吸边框的圆点说明是“孤岛笔记”，建议在复习时用 `[[关联考点]]` 把它并入主干知识网。',
    ],
    route: '/graph',
    routeText: '漫游双链星空图',
  },

  // ── 3. 研学·英语·政治 ──
  {
    id: 'vocab-cruise-dictation',
    name: '全新考研背词：拼写默写 · 随身巡航连播 · 5阶词汇色谱',
    category: 'study_flashcard',
    categoryName: '研学·英语·政治',
    badge: '重磅升级 · 听写串记一体',
    color: 'cyan',
    iconName: 'Languages',
    isNew: true,
    tags: ['背单词', '拼写默写', '巡航连播', '靶向词单', '词汇色谱', '词根', '一键存闪卡'],
    whereToFind: '顶部导航「学科专项 → 考研背词」或「研学中心 → 考研词库」（手机端底部点「背词」）',
    summary: '告别机械刷脸熟！集齐真题语境刷词、拼写默写防手生、耳机随身巡航自动连播、靶向高频词单与 5 阶词根色谱。',
    problemSolved: '看阅读好像认识单词，一写作文就拼错；通勤走路没法一直低头点屏幕，需要像听歌一样自动播报单词与释义。',
    howToUse: [
      '【拼写默写模式】：针对作文高频词与核心大纲词开启默写检验，看着中文释义与例句挖空亲手敲出英文拼写，杜绝考场提笔忘字。',
      '【随身巡航连播】：戴上耳机开启「随身巡航」，系统自动按节奏朗读英文发音、词性释义并自动翻页，食堂排队、操场散步解放双手磨耳朵。',
      '【靶向词单 & 一键存闪卡】：支持按熟词僻义、阅读高频、写作升格筛选靶向词单；遇到顽固难词点「一键存闪卡」直接汇入 SM-2 抗遗忘队列。',
      '【5 阶词汇色谱 & 词根族谱】：切到「词汇色谱」标签，用 Level 50（浅灰生词）到 Level 950（纯黑斩词）追踪记忆深度，顺着 `spec`、`tract`、`vert` 等高频词根一串记十个！',
    ],
    proTips: [
      '先把停留在 Level 50~200 的高危生词加入靶向词单，白天巡航听音混脸熟，晚上用拼写默写彻底斩词！',
    ],
    route: '/vocabulary',
    routeText: '开启全新背词系统',
  },
  {
    id: 'english-full-suite',
    name: '考研英语实战舱：全题型真题整卷 · 20分制AI精批 · 每日外刊',
    category: 'study_flashcard',
    categoryName: '研学·英语·政治',
    badge: '英一英二 · 听说读写全通',
    color: 'indigo',
    iconName: 'BookOpen',
    isNew: true,
    tags: ['考研英语', '作文批改', '完形填空', '阅读理解', '新题型', '翻译', '点词即查', '外刊精读'],
    whereToFind: '顶部导航「学科专项 → 考研英语」',
    summary: '完整覆盖英一/英二历年整卷（完形/阅读/新题型/翻译/写作），支持阅读点词即查、每日外刊精读及约 1.2 秒 20 分制四维作文精批。',
    problemSolved: '英语真题文章长难句啃不动、查生词来回切词典软件太折腾；自己写完大小作文没人指出中式英语硬伤和高分替换词。',
    howToUse: [
      '【全题型沉浸刷卷 & 点词即查】：切换完形填空、传统阅读、新题型（七选五/排序/小标题）或英译汉真题，遇到任何生词直接鼠标点按即可弹出音标、考纲义项与例句浮窗，一键收入生词本。',
      '【20 分制 AI 四维作文精批】：选用图画/图表黄金三段论模板或粘贴自己的作文草稿，点击「AI 智能批改」，系统按内容切题、逻辑连贯、语法精准、词汇丰富四维打分，逐句标出平庸词并给出高分升格表达。',
      '【每日外刊同源精读】：切到「外刊精读」，阅读《经济学人》等考研题源级别的精选短文，拆解长难句主干语法树。',
    ],
    proTips: [
      '批改生成的「平庸词 → 闪光词」升格对照卡，建议一键存入随手记，考前三天集中背熟就是你自己的独门模板！',
    ],
    route: '/english',
    routeText: '进入考研英语实战舱',
  },
  {
    id: 'politics-spacetime-map',
    name: '考研政治百炼中枢：1839–2026 史纲全景地图 & 千题遮罩精粹',
    category: 'study_flashcard',
    categoryName: '研学·英语·政治',
    badge: '重磅升级 · 时空地理联动',
    color: 'rose',
    iconName: 'Landmark',
    isNew: true,
    tags: ['考研政治', '史纲地图', '时间轴', '1000题', '十五五', '时政', '史上第一次', '遮罩背诵'],
    whereToFind: '顶部导航「学科专项 → 考研政治」',
    summary: '高精度矢量中国地图串联 1839 虎门销烟/三元里抗英至 2026“十五五”时政热点，支持同城多史实循环联动、史上第一次汇总与千题即刷即改。',
    problemSolved: '近代史会议地点多、土地政策与著作易张冠李戴，最新大思政与“十五五”规划时政考点找不到系统梳理与配套刷题。',
    howToUse: [
      '【1839–2026 史纲时空地图】：在全屏中国历史地图与底部编年时间轴间联动漫游！点击上海、瑞金、遵义、延安、北京等重镇坐标，支持「同城多史实循环切换」，彻底理清同一城市不同时期的重大会议。',
      '【“史上第一次”与时政新思想】：内置近代以来“史上第一次”高频命题点对比（如三元里人民抗英、首部资产阶级宪法等），并全面更新 2024–2026 大思政与“十五五”规划核心考点。',
      '【五大模块千题即刷即改 & 遮罩背诵】：往下滑直接按马原、毛中特、新思想、史纲、思修分类刷题，错项附深度排雷辨析；重点大题框架开启「遮罩模式」点击刮开自测背诵。',
    ],
    proTips: [
      '政治多选题最爱考“同义混淆”和“超前/滞后定性”，沿着时空轴把《天朝田亩制度》vs《资政新篇》、八七会议 vs 遵义会议对照看一遍最稳妥。',
    ],
    route: '/politics',
    routeText: '漫游史纲时空大本营',
  },
  {
    id: 'sm2-flashcard',
    name: 'SM-2 艾宾浩斯记忆闪卡（遗忘临界点智能排期）',
    category: 'study_flashcard',
    categoryName: '研学·英语·政治',
    badge: '抗遗忘引擎 · 每日15分钟',
    color: 'emerald',
    iconName: 'GraduationCap',
    tags: ['闪卡', '艾宾浩斯', 'SM-2', '记忆曲线', '背诵'],
    whereToFind: '顶部导航「研学中心」→ 点击「记忆闪卡」标签',
    summary: '从你的 Markdown 笔记、错题和生词中提取一问一答卡片，按 SM-2 记忆算法精准在即将遗忘的那天推送给你复习。',
    problemSolved: '408 计组微指令细节、计网各种头部字段、高数积分公式背了忘忘了背，从头翻书耗时极长。',
    howToUse: [
      '打开「研学中心 → 记忆闪卡」，顶部清晰展示今日到期需复习的卡片张数。',
      '先看正面问题在脑中默背答案（完美支持 KaTeX 数学公式渲染），再点击卡片丝滑翻面核对。',
      '诚实点击底部掌握度按钮：\n  • 「忘记 / 重来」：10 分钟内立刻回炉强化；\n  • 「有点模糊」：缩短间隔，明后天黄金时段再考；\n  • 「稳稳掌握」：指数级拉长间隔，省下宝贵时间攻克真难卡。',
    ],
    proTips: [
      '在笔记编辑器或背词页均可一键将核心考点/难词转成闪卡；每天早晚花 10 分钟清空到期队列，考前毫无背书焦虑。',
    ],
    route: '/study?tab=flashcards',
    routeText: '去翻今日记忆闪卡',
  },

  // ── 4. 仿真课件与心流 ──
  {
    id: 'interactive-courseware',
    name: '22+ 动态仿真课件实验室（亲手单步推演算法与微积分）',
    category: 'courseware_tools',
    categoryName: '仿真课件与心流',
    badge: '可视化黑科技 · 单步拆解',
    color: 'cyan',
    iconName: 'Cpu',
    tags: ['仿真课件', '动画', 'AVL', '红黑树', '泰勒展开', 'TCP', '页面置换', '流水线'],
    whereToFind: '顶部导航「研学中心」→ 点击「仿真课件」标签（或在急救舱一键调取）',
    summary: '把教材上抽象难懂的静态插图，变成可单步回放、同步高亮 C 代码指针、支持自定义输入测试数据的交互实验室。',
    problemSolved: 'AVL 树 LR/RL 双旋、B+ 树分裂、两级页表地址拆分、TCP 拥塞窗口慢开始切换、泰勒高阶拟合等单靠文字脑补极易卡壳。',
    howToUse: [
      '进入「研学中心 → 仿真课件」，按 408 数据结构/计组/操作系统/计网、考研高数线代或政治分类挑选实验。',
      '点击控制栏「上一步 / 下一步 / 自动推演」，对照左侧同步高亮的代码行或推导公式观察每一帧状态跃迁。',
      '在顶部参数框填入你做真题遇到的真实数字序列（如自定义插入节点或访问页号串），亲眼验证算法运行全过程！',
    ],
    proTips: [
      '考场遇到数据结构或操作系统综合大题，脑海里直接回放一遍仿真实验室的旋转/置换画面，步骤分一分不丢。',
    ],
    route: '/study?tab=coursewares',
    routeText: '进入仿真课件实验室',
  },
  {
    id: 'focus-music-pomodoro',
    name: '心流番茄钟 & 跨页不断流 Lofi 白噪音混音台',
    category: 'courseware_tools',
    categoryName: '仿真课件与心流',
    badge: '沉浸自习室 · 护眼伴学',
    color: 'purple',
    iconName: 'Music',
    tags: ['白噪音', '音乐', '电台', '番茄钟', '专注计时', '混音'],
    whereToFind: '顶部导航「更多功能」→「白噪音自习室」或「番茄专注」',
    summary: '内置雨夜书房、篝火木柴、翻书声多轨混音与精选 Lofi 电台，切去任何页面刷题音乐全程不断流，配合番茄钟沉淀每日专注热力。',
    problemSolved: '自习室周围走动杂音干扰心神，普通网页放白噪音一跳页就中断；一下午看似坐了很久却不清楚各科真实有效投入时长。',
    howToUse: [
      '在「白噪音自习室」一键点播“深夜刷高数”、“雨打窗棂”预设场景，或自由拉动多条环境音轨滑块调出专属混音。',
      '开启播放后全站右下角常驻迷你音波控制器，自由切换去刷卷、背词或写笔记均丝滑连播。',
      '打开「番茄专注」，绑定当前攻克学科开启 25 分钟心流倒计时（或设为 180 分钟全真考场计时），自动计入个人研学统计。',
    ],
    proTips: [
      '当番茄专注顺利结束时，桌面的奶龙或大肥鱼还会主动发声给你鼓掌庆祝并提醒远眺护眼哦！',
    ],
    route: '/pomodoro',
    routeText: '开启番茄专注自习室',
  },

  // ── 5. AI 导师与双宠伴学 ──
  {
    id: 'ai-tutor-studio',
    name: '分科 AI 导师工作台（思考链真流式 · 双师会诊 · 6款沉浸背景）',
    category: 'ai_agent',
    categoryName: 'AI导师与双宠伴学',
    badge: '重磅升级 · 4大名师随叫随到',
    color: 'indigo',
    iconName: 'Bot',
    isNew: true,
    tags: ['AI伴学', '导师', '研小核', '数小通', 'DeepSeek', '思考链', '双师同台', '划词追问', 'Claude', 'Codex'],
    whereToFind: '顶部导航栏「AI 伴学」，或在任意页面按快捷键 Ctrl + Shift + A',
    summary: '内置 💻研小核、📐数小通、📚英小研、🏛️政小思 四位分科导师，支持 DeepSeek 深度思考过程透明展开、划词追问、6 款护眼氛围背景与本机 CLI 智能体桥接。',
    problemSolved: '标准答案写一句“同理易证”让人抓狂；跨学科问题或复杂证明需要看清完整的破题切入点与分步推导心路历程。',
    howToUse: [
      '【四位专属导师 + 三种教学风格】：按需切换分科导师，并选择「严谨推导 / 考前冲刺 / 苏格拉底启发追问」模式，甚至开启「双师同台」交叉印证思路。',
      '【零缓冲真流式 & 思考链透视】：提问后毫秒级逐字流式输出，支持展开查看大模型完整的内部破题推理链，支持随时停止与一键重答。',
      '【划词追问 & 存笔记/转闪卡】：在导师回复中鼠标划选任意没看懂的公式或术语，即刻浮出「追问细节 / 解释概念」气泡；优质解答一键追加进 Obsidian 笔记。',
      '【6 款沉浸式聊天背景 & 本机 CLI 协同】：顶栏可切换静谧森林、暖阳纸张等 6 款氛围背景；桌面本地版还支持桥接本机 Claude Code / Codex CLI 批量治库。',
    ],
    proTips: [
      '在任何页面按 `Ctrl + Shift + A` 都能秒开悬浮伴学窗，不用离开正在看的卷子或讲义就能问清楚！',
    ],
    shortcuts: ['Ctrl + Shift + A 全局呼出'],
    route: '/chat',
    routeText: '召唤分科 AI 导师',
  },
  {
    id: 'dual-pet-companion',
    name: '🐲 奶龙 × 🐟 大肥鱼 双魂伴学桌宠与自由缩放随身聊',
    category: 'ai_agent',
    categoryName: 'AI导师与双宠伴学',
    badge: '人气新宠 · 语音互动+随身聊',
    color: 'amber',
    iconName: 'Smile',
    isNew: true,
    tags: ['桌宠', '奶龙', '大肥鱼', '飞鱼', '语音', '随身聊', '自由拖动', '八向缩放'],
    whereToFind: '屏幕右下角悬浮伴学萌宠（点击互动或唤起随身聊窗口）',
    summary: '自由领养暖心夸夸「奶龙」或傲娇干饭鲸鱼娘「大肥鱼」，内置 30+ 条真人趣味配音、投喂鸡腿/大白米饭互动，以及可自由拖拽八向缩放的随身 AI 助手窗！',
    problemSolved: '独自备考几百天枯燥压抑缺陪伴；同时看讲义时想要一个不挡视线、能随意挪位置调大小的轻量随身问答与笔记整理小助手。',
    howToUse: [
      '【双宠自由切换与投喂语音】：在右下角桌宠面板一键切换「🐲 奶龙（爱啃大烤鸡腿🍗）」与「🐟 大肥鱼（DeepSeek 干饭鲸鱼娘，狂炫大白米饭🍚补 Token）」；摸摸头、戳肚皮、连续做对题或摸鱼时都会触发专属真人语音！',
      '【自由拖动 + 八向缩放随身聊窗口】：点击桌宠打开「随身聊」浮窗，按住标题栏可拖到屏幕任意角落，拉动四周与四角边缘可自由调节窗口大小或一键最大化，边看题边问完全不遮挡！',
      '【一键治库快捷技能】：内置「大纲重构」「双链织网」「推导挖空」「错题避坑」快捷指令，让萌宠直接帮你打理当前笔记。',
    ],
    proTips: [
      '考场模拟需要极致安静时，可一键将桌宠最小化收纳贴边或静音，动静皆宜不打扰。',
    ],
    route: '/dashboard',
    routeText: '回工作台体验双宠互动',
  },

  // ── 6. 笔记·PDF·多端同步 ──
  {
    id: 'markdown-editor',
    name: '学术双链笔记系统（优先预览 · 富文本/源码 · Σ公式速插 · Obsidian同步）',
    category: 'system_collab',
    categoryName: '笔记·PDF·多端同步',
    badge: '知识大脑 · 100%本地主权',
    color: 'blue',
    iconName: 'FileEdit',
    tags: ['笔记', '编辑器', 'Markdown', 'LaTeX', '公式', 'Obsidian', '新建目录', '即学即练', '手写批注'],
    whereToFind: '顶部导航「更多功能 → 笔记编辑」（或按 Ctrl + K 搜任意笔记直达）',
    summary: '专为考研数学与 408 定制的本地优先知识大脑：默认防误触高清预览，一键切富文本/源码顺滑写作，支持多级目录创建、KaTeX 公式速插、随页手写批注与本地 Obsidian 秒级双向同步。',
    problemSolved: '解决传统笔记“翻阅易手滑改乱、富文本打字丢字符、打微积分矩阵公式太慢、封闭云端锁死数据”五大痛点。',
    howToUse: [
      '【默认优先预览，防误触阅读】：点击目录已有笔记默认呈现印刷级排版预览；点右上角「修改笔记」秒切写作态，富文本直观打字与 Markdown 源码一键互切。',
      '【多级目录管理 & 模板新建】：点「新建目录」支持一键建立多级学科文件夹；新建笔记时可在标题下方自由指定存放目录或套用“错题复盘/学习卡片”模板。',
      '【Σ 考研公式速插 & 截图粘贴 & 提笔批注】：点工具栏 Σ 秒插定积分、极限、矩阵等 LaTeX 模板；截图后直接 Ctrl + V 插入图片；点「提笔批注」可在纸面直接用荧光笔圈画重点。',
      '【即学即练 & Obsidian 实时同步】：写完总结点「即学即练」现场生成 3 道配套真题自检；所有 `.md` 文件与本机 Obsidian 双向实时监听同步，随时无损带走。',
    ],
    proTips: [
      '输入 `[[考点名]]` 即可建立双链，若目标考点笔记尚不存在，点击双链会自动为你注入考纲标准框架草稿！',
    ],
    shortcuts: ['Ctrl + S 保存', 'Ctrl + B 粗体', 'Ctrl + 1/2/3 标题'],
    route: '/editor',
    routeText: '打开双链笔记工作台',
  },
  {
    id: 'pdf-reader-extract',
    name: 'PDF 双栏高清精读器 & 真题讲义智能提取入库',
    category: 'system_collab',
    categoryName: '笔记·PDF·多端同步',
    badge: '重磅升级 · 电子书啃书神器',
    color: 'teal',
    iconName: 'Highlighter',
    isNew: true,
    tags: ['PDF', '教材', '讲义', '双栏阅读', '题库导入', '提取卡片', '电子书'],
    whereToFind: '「研学中心 → 真题教材 / 导入资源」或独立高清阅读页 `/pdf-reader`',
    summary: '内置完备中文字体支持的 PDF 高清画布渲染器，支持“左看电子原卷讲义、右记双链笔记”，并能从 PDF 教材/试卷中一键智能抽提题目与核心闪卡！',
    problemSolved: '网盘攒了几十个 G 的王道、李永乐、张宇 PDF 讲义和模拟卷，光看不练留不下痕迹，手动敲题录卡片又累到手酸。',
    howToUse: [
      '在「研学中心 → 真题教材」打开或上传你的本地 PDF 辅导书、历年真题扫描/文字卷。',
      '开启「双栏伴读视图」：左侧丝滑缩放阅读高清 PDF 原文并随手荧光笔标注，右侧同步撰写双链推导笔记。',
      '点击「智能提取知识点 / 导入题库」，AI 引擎会自动识别章节定理、公式与选择题/大题结构，一键转化为可刷题库或 SM-2 记忆闪卡！',
    ],
    proTips: [
      '把名师最后四套卷/八套卷 PDF 导入进来提取成在线题目，手机排队时也能直接刷最新押题卷！',
    ],
    route: '/study',
    routeText: '前往教材书架体验',
  },
  {
    id: 'mobile-study-guide',
    name: '📱 手机 / 平板随时随地跨端研学指南（私人研学微服务器）',
    category: 'system_collab',
    categoryName: '笔记·PDF·多端同步',
    badge: '重磅核心 · 跨端随时随地刷题',
    color: 'teal',
    iconName: 'Smartphone',
    isNew: true,
    tags: ['手机', '平板', 'iPad', '跨端', '局域网', '外网穿透', '自习室', '微服务器', 'PWA', '主屏幕', '防休眠', 'Keep-Awake', '3001端口'],
    whereToFind: '桌面端顶部常驻「📱 手机互联」胶囊按钮、设置页【📱 手机/平板跨端指南】Tab、工作台多端互联卡片',
    summary: '无需购买云服务器与域名，将本地电脑作为私人专属研学微服务器！支持寝室 Wi-Fi 局域网秒连、自习室 4G/5G 外网免费安全隧道穿透，以及 iOS / Android PWA 全屏沉浸式刷题。',
    problemSolved: '不想整天被拴在电脑椅前，想在自习室、图书馆、床上用手机/平板随时刷题背单词，但又希望题库、错题与双链笔记完全落在自己本地电脑上，且免去购买和配置云服务器的高昂门槛。',
    howToUse: [
      '【场景 A：同寝室 / 同 Wi-Fi 局域网秒连】：确保手机与电脑连入同一 Wi-Fi 或手机热点；点击桌面端顶栏「📱 手机互联」，手机相机扫码即开。若手机提示无法访问，99% 为 Windows 防火墙阻断，在电脑终端执行一键放行脚本：`npm run lan:allow` 即可彻底放行。',
      '【场景 B：自习室 / 图书馆异地外网远程刷题】：电脑开在宿舍/家中，在电脑端运行免费安全隧道命令：`npm run remote`；控制台秒级生成端到端加密专属 HTTPS 网址，手机在自习室用 4G/5G 流量也能随时秒连，免公网 IP、免买域名。',
      '【场景 C：手机桌面全屏沉浸（PWA）】：iOS 手机在 Safari 浏览器中点击底部「分享」图标，选择「添加到主屏幕」；安卓手机在 Chrome/Edge 浏览器中点击右上角三点菜单，选择「添加到主屏幕」或「安装应用」；彻底消除浏览器地址栏，获得比肩原生 App 的极致全屏沉浸感！',
      '【后台常驻与防休眠保护】：电脑作为微服务器时，去自习室前请确保电脑接通电源。系统内置 Keep-Awake 防休眠心跳守护；Windows 笔记本合盖前可在控制面板电源选项中将“合上盖子时的操作”设为“不采取任何操作”，人离开电脑手机依然随时在线。',
    ],
    proTips: [
      '在局域网内无法连接时，直接在电脑端运行：npm run lan:allow （自动配置 Windows 防火墙入站规则放行 TCP 3001 端口）。',
      '外出到自习室前，运行：npm run remote （启动免费安全穿透隧道，获取公网临时访问链接并生成终端二维码）。',
    ],
    shortcuts: ['顶栏「📱 手机互联」一键弹窗'],
    route: '/settings?tab=mobile',
    routeText: '打开手机跨端设置与二维码',
  },
  {
    id: 'search-theme-multidevice',
    name: '全站秒搜 (Ctrl+K) · 护眼四主题 · 知识库健康体检',
    category: 'system_collab',
    categoryName: '笔记·PDF·多端同步',
    badge: '全局基建 · 极速专注',
    color: 'slate',
    iconName: 'Zap',
    tags: ['搜索', 'Ctrl+K', '护眼', '暗黑模式', '主题', '知识整理', '体检'],
    whereToFind: '顶栏右侧搜索框 / 风格主题胶囊 / 智能体与环境体检面板 / 系统设置',
    summary: '按 Ctrl+K 一秒搜遍全站真题与笔记；一键切换极简/鲜艳/护眼/暗黑 4 大主题；支持笔记库健康体检与智能体环境一键诊断。',
    problemSolved: '深夜刷题白底刺眼；笔记多了断链乱标；想快速了解本地环境与智能体状态。',
    howToUse: [
      '【全站极速搜索】：任何界面按 `Ctrl + K`（Mac 按 `⌘K`），输入关键词或 `#标签名` 秒速定位真题、公式与笔记。',
      '【全站护眼视觉统一】：点击顶栏风格按钮，在「极简白 / 鲜艳活力 / 暖调护眼 / 深邃暗黑」4 种精心调校的主题间一键切换。',
      '【知识整理工作流 (`/workflow`)】：定期给笔记库打健康分，一键清理空文件、修复断链并合并同义杂乱标签。',
      '【智能体与环境体检】：在设置页随时查看本地端口、知识库状态与 AI 接口连通度。',
    ],
    proTips: [
      '使用快捷键 Ctrl+K 搜索时，输入以“#”开头可快速按考点标签检索，输入以“/”开头可快速查找命令。',
    ],
    shortcuts: ['Ctrl + K 全局秒搜', 'Esc 关闭浮层'],
    route: '/settings',
    routeText: '打开系统与主题设置',
  },
]

// 第 3 标签页：全站效率快捷键速查矩阵
export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    id: 'global',
    title: '全局效率指挥官',
    subtitle: '在全站任意页面均可瞬间响应',
    iconName: 'Zap',
    items: [
      {
        keys: ['Ctrl', 'K'],
        macKeys: ['⌘', 'K'],
        action: '秒开全站极速搜索（查真题 / 查笔记 / 按 #标签 过滤）',
        scope: '全站通用',
      },
      {
        keys: ['Ctrl', 'Shift', 'A'],
        macKeys: ['⌘', 'Shift', 'A'],
        action: '随时呼出 / 收起分科 AI 伴学导师悬浮窗',
        scope: '全站通用',
      },
      {
        keys: ['Esc'],
        action: '一键关闭当前弹窗、搜索面板或退出全屏试玩沙盒',
        scope: '弹窗与浮层',
      },
    ],
  },
  {
    id: 'quiz',
    title: '考场刷题加速键',
    subtitle: '双手不离键盘，行云流水推进真题',
    iconName: 'ClipboardList',
    items: [
      {
        keys: ['←'],
        action: '切换到上一道题目',
        scope: '刷题作答页',
      },
      {
        keys: ['→'],
        action: '切换到下一道题目',
        scope: '刷题作答页',
      },
      {
        keys: ['Enter'],
        action: '练习模式下快速展开或折叠本题标准解析',
        scope: '刷题练习模式',
      },
      {
        keys: ['Ctrl', 'J'],
        macKeys: ['⌘', 'J'],
        action: '将当前正在做的真题直接发给 AI 导师拆解追问',
        scope: '刷题作答页',
      },
    ],
  },
  {
    id: 'editor',
    title: 'Markdown 与公式排版',
    subtitle: '像飞一样撰写双链数学与 408 笔记',
    iconName: 'FileEdit',
    items: [
      {
        keys: ['Ctrl', 'S'],
        macKeys: ['⌘', 'S'],
        action: '立即落盘保存笔记并同步至本地 Obsidian 目录',
        scope: '笔记编辑器',
      },
      {
        keys: ['Ctrl', 'B'],
        macKeys: ['⌘', 'B'],
        action: '将选中文本设为粗体强调（Ctrl + I 为斜体）',
        scope: '写作模式',
      },
      {
        keys: ['Ctrl', '1 / 2 / 3'],
        macKeys: ['⌘', '1 / 2 / 3'],
        action: '一键将当前段落切换为一/二/三级章节标题',
        scope: '写作模式',
      },
      {
        keys: ['Ctrl', 'V'],
        macKeys: ['⌘', 'V'],
        action: '剪贴板截图秒速自动上传并转为 Markdown 图片嵌入',
        scope: '写作模式',
      },
    ],
  },
]

// 第 3 标签页：考研三阶段研核黄金通关路线图
export const STAGE_ROADMAP_DATA: StageRoadmapItem[] = [
  {
    stage: '第一阶段 · 基础筑基期',
    period: '3 月 – 6 月 · 啃透概念，织起主干网',
    title: '看动画破抽象难点，建双链笔记树',
    goal: '把 408 四科机理与高数三大计算底子打牢，大纲核心词过完首轮认知。',
    color: 'indigo',
    recommendedModules: [
      {
        label: 'PDF 双栏精读 + 双链笔记',
        tip: '左看辅导讲义右写推导，用 [[双链]] 串起定理上下文',
        route: '/editor',
      },
      {
        label: '22+ 动态仿真课件',
        tip: '单步推演 AVL 树、页面置换与泰勒拟合，彻底告别死记硬背',
        route: '/study?tab=coursewares',
      },
      {
        label: '考研背词（巡航 + 词根色谱）',
        tip: '每天早晚词根串记 + 走路随身巡航磨耳朵，消灭基础生词',
        route: '/vocabulary',
      },
    ],
  },
  {
    stage: '第二阶段 · 强化攻坚期',
    period: '7 月 – 10 月 · 狂刷真题，精准拔除红灯盲区',
    title: '专题突破 + 红黄绿热力图靶向排雷',
    goal: '吃透历年统考真题套路，把所有高频失分点在错题本与热力图上逐个救绿。',
    color: 'amber',
    recommendedModules: [
      {
        label: '刷题中心（题型专项 + 历年真题）',
        tip: '分章强攻重难点，卡壳直接按 Ctrl+J 让分科 AI 导师启发点拨',
        route: '/quiz',
      },
      {
        label: '掌握热力图 & 提分急救舱',
        tip: '每周盯紧闪烁红点，点开做 5 题靶向突击把盲区清零',
        route: '/graph',
      },
      {
        label: '1839–2026 史纲全景地图',
        tip: '结合中国历史地图与同城史实联动，刷透政治千题易混项',
        route: '/politics',
      },
    ],
  },
  {
    stage: '第三阶段 · 冲刺密押期',
    period: '11 月 – 12 月考前 · 限时模考，抗遗忘锁分',
    title: '180 分钟全真整卷 + SM-2 闪卡与作文精批',
    goal: '完全对齐考场生物钟，稳住客观题手感，主观大题与大小作文踩准每一个得分点。',
    color: 'rose',
    recommendedModules: [
      {
        label: '真题/李林密押整卷限时模考',
        tip: '严格开启 180 分钟考试模式，右侧屏幕草稿纸实战演练时间分配',
        route: '/quiz',
      },
      {
        label: '英语 20 分制 AI 四维精批 + 单词默写',
        tip: '打磨个人高分作文模板，开启核心写作词拼写默写杜绝笔误',
        route: '/english',
      },
      {
        label: 'SM-2 每日到期闪卡清零',
        tip: '每天 15 分钟复盘易忘公式、408 协议细节与“十五五”时政热点',
        route: '/study?tab=flashcards',
      },
    ],
  },
]
