// ============================================================================
// CoreForge 研核 · 全功能通俗使用手册数据字典
// 用大白话讲清楚每个功能「干嘛用的、在哪找到、怎么操作、实用技巧」
// ============================================================================

export type ManualCategoryKey =
  | 'all'
  | 'quick_start'
  | 'spectrum_graph'
  | 'study_flashcard'
  | 'courseware_tools'
  | 'ai_agent'
  | 'system_collab'

export interface FeatureManualItem {
  id: string
  name: string
  category: Exclude<ManualCategoryKey, 'all'>
  categoryName: string
  badge: string
  color: 'rose' | 'purple' | 'amber' | 'emerald' | 'blue' | 'teal' | 'cyan' | 'indigo' | 'slate'
  iconName: string
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
  color: 'indigo' | 'rose' | 'emerald' | 'amber'
  featureId?: string
  route?: string
  actionLabel: string
}

export const MANUAL_CATEGORIES: Array<{
  key: ManualCategoryKey
  label: string
  iconName: string
}> = [
  { key: 'all', label: '全部功能', iconName: 'Sparkles' },
  { key: 'quick_start', label: '高频必备', iconName: 'Zap' },
  { key: 'spectrum_graph', label: '查漏与图谱', iconName: 'Flame' },
  { key: 'study_flashcard', label: '闪卡·英语·政治', iconName: 'GraduationCap' },
  { key: 'courseware_tools', label: '仿真课件与专注', iconName: 'Cpu' },
  { key: 'ai_agent', label: 'AI伴学与助手', iconName: 'Bot' },
  { key: 'system_collab', label: '整理·搜索·多端', iconName: 'ShieldCheck' },
]

// 1 分钟快速上手：按“我想做什么”直达对应功能
export const QUICK_SCENARIO_GUIDES: QuickScenarioItem[] = [
  {
    id: 'sc-quiz',
    title: '我想刷历年真题 / 按题型专项练',
    subtitle: '进入刷题中心，选历年整卷、专项突破或自由抽题',
    iconName: 'ClipboardList',
    color: 'indigo',
    route: '/quiz',
    actionLabel: '去刷题',
  },
  {
    id: 'sc-error',
    title: '我想重练做错的题 / 找错题原因',
    subtitle: '错题本自动收录每道错题，支持一键组卷重做',
    iconName: 'Flame',
    color: 'rose',
    route: '/quiz?tab=errors',
    actionLabel: '看错题本',
  },
  {
    id: 'sc-weak',
    title: '我想看自己哪一块学得不牢',
    subtitle: '红黄绿热力图一眼看出薄弱点，点开直接 5 题急救',
    iconName: 'ShieldAlert',
    color: 'amber',
    route: '/graph',
    actionLabel: '查薄弱点',
  },
  {
    id: 'sc-study',
    title: '我想看讲义、背闪卡或看动画课件',
    subtitle: '研学中心集合全部讲义、抗遗忘闪卡与 408 动画演示',
    iconName: 'GraduationCap',
    color: 'emerald',
    route: '/study',
    actionLabel: '进研学中心',
  },
]

export const FEATURE_MANUAL_DATA: FeatureManualItem[] = [
  // ── 1. 高频必备 ──
  {
    id: 'quiz-modes',
    name: '刷题中心：真题整卷 · 题型专项 · 自由组卷',
    category: 'quick_start',
    categoryName: '高频必备',
    badge: '每天必用 · 刷题主阵地',
    color: 'indigo',
    iconName: 'ClipboardList',
    whereToFind: '顶部导航栏 → 刷题中心（手机端底部导航点「刷题」）',
    summary: '支持做历年真题整卷、按题型分类专攻，或者自己挑科目随机抽题练手。',
    problemSolved: '不同复习阶段需要不同刷法：前期想按知识点专项打基础，后期想成套做真题掐表模拟，这里全都有。',
    howToUse: [
      '打开「刷题中心」，顶部有 4 个切换标签：「真题整卷」「题型专项」「自由组卷」「错题本」。',
      '想成套做历年试卷：选「真题整卷」，挑一份试卷点开，支持选“练习模式（做一题看一题解析）”或“考试模式（交卷后统一出成绩）”。',
      '想专门攻克某个薄弱章（如二叉树、极限计算）：切到「题型专项」直接开练。',
      '想混合多科随便刷几道：在「自由组卷」勾选科目和题数，点「立即开始」。',
    ],
    proTips: [
      '练习模式下按键盘 Enter 可以快速展开/收起解析，用方向键 ← / → 切换上一题、下一题。',
      '如果一次没做完退出了，系统会自动保留进度，下次进来点「继续上次答题」就能接着做。',
    ],
    route: '/quiz',
    routeText: '去刷题中心',
  },
  {
    id: 'error-diagnostic',
    name: '错题本：自动收集错题与重练巩固',
    category: 'quick_start',
    categoryName: '高频必备',
    badge: '提分关键 · 查漏闭环',
    color: 'rose',
    iconName: 'Flame',
    whereToFind: '顶部导航栏 → 刷题中心 → 第 4 个标签「错题本」',
    summary: '刷题答错的题自动收进这里，可以重做错题、记下错因，还能让 AI 给你出几道同类题防再错。',
    problemSolved: '做完卷子只看一眼答案很容易过几天又做错，错题本帮你把错题聚到一起反复消灭。',
    howToUse: [
      '打开「刷题中心」切换到「错题本」（或者在手机首页常用功能里直接点「错题本」）。',
      '可以看到当前还没消灭的错题列表，支持按科目筛选。',
      '点「错题重练」，系统会把错题组合成一份专属小测验，重做全对后可标记为“已掌握”。',
      '在结算页遇到没懂的错题，点「存入错题本」保存到笔记，或者点「AI 变式强化」生成类似新题检验是否真会了。',
    ],
    proTips: [
      '平时遇到某道好题想多看两眼，做题时点右上角星星收藏图标，也能方便回头检索。',
    ],
    route: '/quiz?tab=errors',
    routeText: '打开错题本',
  },
  {
    id: 'answer-palette-scratchpad',
    name: '做题好帮手：答题卡 & 屏幕草稿纸',
    category: 'quick_start',
    categoryName: '高频必备',
    badge: '刷题小工具 · 演草跳转',
    color: 'amber',
    iconName: 'LayoutGrid',
    whereToFind: '进入任意做题页面后的右侧面板（手机端在顶部点「答题卡」或底部点「草稿」）',
    summary: '不用低头翻找纸笔，答题卡颜色一眼看清哪题没做，切到草稿纸直接用鼠标或触控笔打草稿。',
    problemSolved: '做大卷子经常忘了哪道题跳过了、哪题有点拿不准；算数学微积分或进制转换手边一时没草稿纸。',
    howToUse: [
      '做题时看右侧工作台，默认显示「答题卡」：已答的题号变色，未答的留空，点题号就能瞬间跳过去。',
      '遇到拿不准的题，点一下题目旁的小旗子/星标做记号，交卷前方便集中复查。',
      '需要算式推导时，把右侧面板切到「草稿纸」，就能像真纸一样画图演算，支持换笔粗细、橡皮和一键清空。',
      '做公式题突然忘了某个定理？切到第 3 个小标签「定理速查」就能当场查阅常用结论。',
    ],
    proTips: [
      '在电脑做题界面按快捷键 ⌘J（或 Ctrl+J），随时把当前这道题直接发给 AI 导师讲解。',
    ],
    shortcuts: ['Ctrl + J / ⌘J'],
    route: '/quiz',
    routeText: '去体验做题面板',
  },
  {
    id: 'quick-note',
    name: '随手记：不打断复习的闪电便签',
    category: 'quick_start',
    categoryName: '高频必备',
    badge: '全站可用 · 秒速记灵感',
    color: 'emerald',
    iconName: 'PenLine',
    whereToFind: '电脑端点击顶栏「更多功能 → 极速随手记」；手机端首页点「随手记」或底栏「全部 → 随手速记」',
    summary: '不管在刷题还是看讲义，不用切走页面，点一下就能弹出小窗口记下公式、灵感或待办，自动存进笔记库。',
    problemSolved: '做到一半突然想到一个易错点，如果专门打开笔记软件新建文件再回来，思路早就被打断了。',
    howToUse: [
      '在任何页面打开「随手记」抽屉，系统已自动按时间起好标题，直接打字就行。',
      '上方有一排学科标签按钮（如 408、高数、错题复盘），点一下就能自动打好分类标签。',
      '工具栏自带常见数学符号、待办勾选框和代码块快捷按钮，点一下直接插入。',
      '写完点「保存到知识库」，笔记会自动存到你的 `随手记` 文件夹里，不用担心弄丢。',
    ],
    proTips: [
      '手机拍了草稿或题目照片，也能直接传进随手记里变成图片笔记；如果想长篇精修，点「保存并打开编辑器」即可跳转。',
    ],
    route: '/editor',
    routeText: '去看看保存的笔记',
  },

  // ── 2. 薄弱查漏与图谱 ──
  {
    id: 'mastery-spectrum',
    name: '考点掌握热力图（红黄绿一眼找盲区）',
    category: 'spectrum_graph',
    categoryName: '查漏与图谱',
    badge: '核心亮点 · 精准查漏',
    color: 'rose',
    iconName: 'Flame',
    whereToFind: '「研学中心 → 掌握热力 / 考点色谱」或「更多功能 → 知识图谱网络」',
    summary: '根据你平时刷题对错和闪卡复习情况，用红、黄、绿三种颜色自动标出每个考点的掌握程度。',
    problemSolved: '复习到中后期往往觉得什么都看了，但不知道哪块是“假会”、哪块真正在丢分。',
    howToUse: [
      '打开热力图后，重点盯紧颜色变化：\n  • 绿色（≥80%）：掌握得挺稳，偶尔复习巩固就行；\n  • 黄色（50%~80%）：有点掌握但不算牢，建议抽空多练几道；\n  • 红色（<50%）：高危薄弱点！红色圆点还会一闪一闪提醒你优先攻克。',
      '把鼠标移到任意圆点上，能看到这个考点的具体得分、做过几次、错过几次。',
      '直接点击红色或黄色圆点，会立刻弹出【提分急救舱】。',
    ],
    proTips: [
      '颜色和分数不是死板的，每次刷完题、背完闪卡或者在急救舱做完 5 道测验题，热力图颜色都会立刻自动变好。',
    ],
    route: '/graph',
    routeText: '查看掌握热力图',
  },
  {
    id: 'mastery-rescue',
    name: '提分急救舱（点薄弱点立刻急救 5 题）',
    category: 'spectrum_graph',
    categoryName: '查漏与图谱',
    badge: '急救工具 · 靶向突破',
    color: 'amber',
    iconName: 'ShieldAlert',
    whereToFind: '在掌握热力图里，单击任意一个考点圆点即可弹出',
    summary: '发现一个不会的考点后，在这里一次搞定“看以前错哪了 → 看动画课件理解原理 → 现场做 5 题检验”。',
    problemSolved: '知道自己某一章学得差，却不知道该从看书还是找题开始下手，急救舱直接给你排好最短补救路线。',
    howToUse: [
      '在热力图点开某个红色或黄色考点，急救弹窗顶部会显示掌握分和薄弱诊断提示。',
      '切到「错题记录」标签，先看一眼自己之前在这个考点都踩过什么坑。',
      '原理没搞懂的（比如红黑树旋转、内存分页），点「调取配套仿真课件」看动态动画演示。',
      '感觉弄明白了，点「开启 5 题靶向突击」，现场做 5 道针对性真题，做对就能把考点从红灯救成黄灯或绿灯。',
    ],
    proTips: [
      '如果你是自己看纸质书搞懂了这个知识点，也可以直接在弹窗右上角拖动滑块手动调高掌握分。',
    ],
    route: '/graph',
    routeText: '打开图谱点考点体验',
  },
  {
    id: 'knowledge-graph',
    name: '知识点关系网（双链图谱）',
    category: 'spectrum_graph',
    categoryName: '查漏与图谱',
    badge: '全局视角 · 理清脉络',
    color: 'purple',
    iconName: 'Network',
    whereToFind: '顶部导航「更多功能 → 知识图谱网络」或「研学中心 → 全景图谱」',
    summary: '把你所有的笔记用线连成一张关系星空图，谁跟谁有联系、哪个考点最核心、哪篇笔记落单了，一目了然。',
    problemSolved: '408 和数学章节一多容易学成一盘散沙，遇到跨章节大题想不起它们之间有什么关联。',
    howToUse: [
      '图谱里每个圆点代表一篇笔记或考点，鼠标滚轮可以放大缩小，按住空白处可以拖动整张图。',
      '圆点越大，说明引用和关联越多，往往是整门课的关键枢纽概念。',
      '在顶部搜索框输入关键字，相关节点会立刻亮起来，方便在几百篇笔记里一秒定位。',
      '双击任意圆点，右边会直接滑出这篇笔记的完整内容，不用跳页就能就地阅读。',
    ],
    proTips: [
      '如果看到带有橙色边框的孤单圆点，说明这篇笔记还没和其他知识连上线，抽空在文章里用 `[[相关笔记名]]` 串起来会记得更牢。',
    ],
    route: '/graph',
    routeText: '浏览关系图谱',
  },

  // ── 3. 研学中心、闪卡与语政 ──
  {
    id: 'study-hub',
    name: '研学中心一站式工作台（讲义·真题·进度）',
    category: 'study_flashcard',
    categoryName: '记忆闪卡与语政',
    badge: '学练结合 · 8合1工作台',
    color: 'blue',
    iconName: 'BookOpen',
    whereToFind: '顶部导航栏 → 研学中心（手机端底部点「研学」）',
    summary: '把核心讲义、真题教材 PDF、仿真动画课件、闪卡和研学进度全聚在一起，边学边练不用来回找页面。',
    problemSolved: '找讲义要开一个网页，看教材 PDF 要开阅读器，看复习进度又不知道去哪看，非常零碎。',
    howToUse: [
      '进入「研学中心」后，上方一排清晰标签可随时切换：',
      '「核心讲义」：按科目浏览图文并茂的重点精讲，可顺手做笔记；',
      '「真题教材」：查看导入的电子书和 PDF 讲义，还支持一键从书里提取知识点卡片；',
      '「全景图谱 / 掌握热力 / 考点色谱」：直观总览知识点网络与强弱分布；',
      '「研学进度」：查看全科推进百分比、薄弱科目提醒和已学统计。',
    ],
    proTips: [
      '看讲义或材料时如果突然有重点想标出，直接点右上角「记批注」就能在屏幕上圈画。',
    ],
    route: '/study',
    routeText: '进入研学中心',
  },
  {
    id: 'sm2-flashcard',
    name: '记忆闪卡：快忘记时自动提醒你复习',
    category: 'study_flashcard',
    categoryName: '记忆闪卡与语政',
    badge: '抗遗忘 · 每天15分钟',
    color: 'emerald',
    iconName: 'GraduationCap',
    whereToFind: '顶部导航「研学中心」→ 点击「记忆闪卡」标签',
    summary: '像随身小卡片一样一问一答，记不住的频繁推给你，已经背熟的隔很多天再复习，省时又防忘。',
    problemSolved: '408 协议细节、计组指令流程和数学公式背了总忘，从头到尾重背又太浪费时间。',
    howToUse: [
      '进入「研学中心 → 记忆闪卡」，顶部会告诉你今天有多少张到期需要复习的卡片。',
      '看卡片正面问题（如“TCP 拥塞控制分为哪几个阶段？”），先在脑子里想答案。',
      '点击卡片翻面核对解析，然后诚实选一个反馈：\n  • 「忘记 / 重来」：说明还没记住，待会儿再推给你看；\n  • 「有点模糊」：过一两天再加强一次；\n  • 「完全掌握」：自动帮你拉长间隔，过很久再抽查。',
      '在笔记页也可以点击「生成闪卡」，把重点笔记自动拆成问答卡片。',
    ],
    proTips: [
      '建议每天早起或睡前花 10~15 分钟把今日到期卡片清零，比考前突击背书轻松得多。',
    ],
    route: '/study?tab=flashcards',
    routeText: '去背记忆闪卡',
  },
  {
    id: 'vocab-english',
    name: '考研英语：大纲背词 & 作文批改',
    category: 'study_flashcard',
    categoryName: '记忆闪卡与语政',
    badge: '英语提分 · 词根+批改',
    color: 'indigo',
    iconName: 'Languages',
    whereToFind: '顶部导航「学科专项 → 考研英语 / 考研背词」或手机端「背词」',
    summary: '按红黄绿掌握度背考研 5500 大纲词、顺带看词根衍生家族，还支持粘贴英语作文让 AI 逐句批改。',
    problemSolved: '背单词按字母顺序背前面忘后面；写完大小作文没人帮忙找语法错误和润色高级句型。',
    howToUse: [
      '打开「考研背词」，可以专门筛选“高危生词”集中攻坚，点开单词卡片能看真题例句、搭配和词根衍生图。',
      '点「考研英语」进入英语工作舱，左边可用高频写作模板与真题长难句拆解。',
      '写好作文贴进去，点「AI 智能批改」，系统会按考研阅卷标准打分，标出语法硬伤并给升级改写建议。',
    ],
    proTips: [
      '每个单词卡片都支持点击发声朗读，边听边记更容易记住拼写。',
    ],
    route: '/english',
    routeText: '打开考研英语中心',
  },
  {
    id: 'politics-timeline',
    name: '考研政治：史纲时间轴 & 1000 题专项',
    category: 'study_flashcard',
    categoryName: '记忆闪卡与语政',
    badge: '政治专项 · 脉络记忆',
    color: 'rose',
    iconName: 'Landmark',
    whereToFind: '顶部导航「学科专项 → 考研政治」',
    summary: '把近代史纲重要事件和会议按时间线串成一张画卷，下面紧跟马原、史纲、思修、毛中特精选 1000 题库。',
    problemSolved: '政治会议时间、著作名称老搞混，单靠刷题记不住前因后果。',
    howToUse: [
      '打开「考研政治」，上方是一条可左右拖动的时间线，从 1840 年一路串到现代重要会议。',
      '点击任意年份节点（比如遵义会议、七大），就能看清背景、核心内容和考点提醒。',
      '往下滑直接挑选马原/史纲/毛中特/思修分类刷题，做错同样自动进错题本。',
    ],
    proTips: [
      '背分析题前沿着时间轴从头到尾点一遍重大转折点，大题历史脉络题基本不会跑偏。',
    ],
    route: '/politics',
    routeText: '打开考研政治中心',
  },

  // ── 4. 仿真课件与专注 ──
  {
    id: 'interactive-courseware',
    name: '动态仿真课件（看动画学懂 408 算法与机理）',
    category: 'courseware_tools',
    categoryName: '仿真课件与专注',
    badge: '可视化神器 · 单步演示',
    color: 'cyan',
    iconName: 'Cpu',
    whereToFind: '顶部导航「研学中心」→ 点击「仿真课件」标签（或在急救舱里点开）',
    summary: '把书上死板的静态插图变成可以“一步一步暂停播放、甚至自己改输入数据”的交互动画。',
    problemSolved: '像 AVL 平衡旋转、红黑树插入、LRU 页面置换、TCP 滑动窗口和 KMP 匹配，光看书本文字真的太绕了。',
    howToUse: [
      '进入「研学中心 → 仿真课件」，挑一个你卡壳的模块点开。',
      '目前已涵盖高频难点：平衡二叉树/红黑树、快排/KMP/Dijkstra、内存分页转换与置换、TCP 握手及拥塞控制、矩阵变换等。',
      '点击下方播放条的「上一步 / 下一步 / 自动播放」，像放电影一样盯着指针、队列和树形怎么一帧帧变化。',
      '还可以在输入框自己填一组数字或页号序列，看看算法会怎么一步步跑完。',
    ],
    proTips: [
      '动画旁边同步高亮对应的代码行和考点解释，特别适合备考 408 最后两道代码与机制大题。',
    ],
    route: '/study?tab=coursewares',
    routeText: '去体验仿真课件',
  },
  {
    id: 'focus-music-ambience',
    name: '白噪音自习室（切页面不停播）',
    category: 'courseware_tools',
    categoryName: '仿真课件与专注',
    badge: '沉浸伴学 · 跨页不中断',
    color: 'purple',
    iconName: 'Music',
    whereToFind: '顶部导航「更多功能 → 效率工具 / 白噪音」（手机端首页或底部点「白噪音」）',
    summary: '提供雨声、林间自习室、轻音乐电台与多轨自由混音，开启后底部有迷你控制条，切去刷题也不停。',
    problemSolved: '图书馆或宿舍太吵静不下心，普通网页放音乐只要点去别的页面就会突然断掉。',
    howToUse: [
      '打开「白噪音」，可以直接点播“雨夜自习室”“精选学习电台”等现成套餐。',
      '喜欢自己调音色的话，可以同时打开雨声、翻书声、炉火声并分别拉滑块调音量。',
      '播放后全站右下角会出现迷你悬浮播放器，无论切去刷题、背词还是写笔记，声音全程不断流，随时可点暂停。',
    ],
    proTips: [
      '推数学证明题可以试试搭配平稳雨声或纯音乐电台，背英语单词建议选轻柔低音量环境音。',
    ],
    route: '/music',
    routeText: '打开白噪音自习室',
  },
  {
    id: 'pomodoro-timer',
    name: '番茄专注计时与学习时长统计',
    category: 'courseware_tools',
    categoryName: '仿真课件与专注',
    badge: '告别走神 · 记录付出',
    color: 'rose',
    iconName: 'Timer',
    whereToFind: '顶部导航「更多功能」→「番茄专注」（手机端首页点「番茄专注」）',
    summary: '经典 25 分钟专注 + 5 分钟休息倒计时，按科目记录你每天真真正正学了几个番茄钟。',
    problemSolved: '坐在桌前一下午感觉学了很久，回头一想其实中间老看手机，缺乏清晰的计时约束和成果统计。',
    howToUse: [
      '打开「番茄专注」，选一下这轮准备学什么科目（408 / 数学 / 英语 / 政治）。',
      '点「开始专注」，界面会变成清清爽爽的大字倒计时，帮你进入专心状态。',
      '时间到点会轻轻响铃提示休息 5 分钟，同时把刚刚完成的专注时长自动记入学习档案。',
    ],
    proTips: [
      '准备做一套完整数学或 408 模考时，可以把单次时长直接调成 180 分钟当考场倒计时用。',
    ],
    route: '/pomodoro',
    routeText: '开启番茄专注',
  },
  {
    id: 'screen-annotation',
    name: '屏幕随手批注画板（随时在页面上圈画）',
    category: 'courseware_tools',
    categoryName: '仿真课件与专注',
    badge: '交互小工具 · 看书勾重点',
    color: 'amber',
    iconName: 'Highlighter',
    whereToFind: '研学中心顶栏右侧点击「记批注」按钮',
    summary: '在看讲义、教材或题目时直接在当前屏幕上拉起透明画板，用荧光笔、红笔或箭头圈画重点。',
    problemSolved: '看电子版讲义想随手划一下题干条件、画个小箭头推导一下，不想特意截图再去别的软件画。',
    howToUse: [
      '在「研学中心」点「记批注」打开半透明画板。',
      '选好荧光笔、画笔颜色、矩形框或箭头工具，直接在屏幕内容上画线做标记。',
      '画完还能点按钮把带批注的当前画面直接保存成图片，或者点「清空」恢复干净界面。',
    ],
    proTips: [
      '用平板或带手写笔的触控笔记本打开这个功能，做标记的手感最顺手。',
    ],
    route: '/study',
    routeText: '去研学中心试试批注',
  },

  // ── 5. AI 伴学与助手 ──
  {
    id: 'ai-assistant-modal',
    name: 'AI 伴学导师（随时呼出讲题与推导）',
    category: 'ai_agent',
    categoryName: 'AI伴学与助手',
    badge: '随时召唤 · 分步讲透',
    color: 'indigo',
    iconName: 'Bot',
    whereToFind: '顶部导航栏「AI 伴学」，或在任意页面按快捷键 Ctrl + Shift + A',
    summary: '像身边坐着一位懂考研套路的助教，随时丢给它数学大题证明、408 错因疑问，甚至一键把回答存进笔记。',
    problemSolved: '看答案解析经常遇到“由上式显然可得”却完全没看懂中间怎么跨过去的，问普通聊天工具又太啰嗦。',
    howToUse: [
      '点击顶栏「AI 伴学」进入完整对话工作台，或者在做题时直接点题目旁的「追问 AI」。',
      '在任何界面按 `Ctrl + Shift + A` 也能弹出快捷提问框。',
      '发问后，导师会按“结论先行 + 分步推导 + 考场避坑”的清晰格式回复。',
      '觉得这段总结太棒了，可以直接点按钮把它追加存进你的某篇笔记里，或者转成闪卡。',
    ],
    proTips: [
      '对话页面左上角还能切换不同的智能体身份和模型引擎，甚至开启双导师互评对比思路。',
    ],
    shortcuts: ['Ctrl + Shift + A'],
    route: '/chat',
    routeText: '去和 AI 导师聊聊',
  },
  {
    id: 'pet-assistant',
    name: '桌面伴学小助手（右下角萌宠帮整理笔记）',
    category: 'ai_agent',
    categoryName: 'AI伴学与助手',
    badge: '趣味助手 · 自动整理',
    color: 'emerald',
    iconName: 'Smile',
    whereToFind: '屏幕右下角悬浮的小萌宠图标（可点开抽屉）',
    summary: '平时陪你在右下角加油打气，点开它还能一键帮你整理笔记大纲、挖空自测和排查近期易错点。',
    problemSolved: '一个人备考容易闷，而且大量笔记的排版、关联检查自己一条条做很费时间。',
    howToUse: [
      '点击右下角的小萌宠头像打开伴学助手窗口，可以给它换不同的形象皮肤。',
      '窗口上方内置了快捷技能按钮：比如「大纲重构」「图谱双链」「推导挖空」「错题避坑」等。',
      '点一下对应技能按钮，它会读取你的笔记库帮忙干活，改之前也会给你看清楚清单。',
    ],
    proTips: [
      '做题累了点一下小萌宠互动一下解解压，如果遮挡视野随时可以把它收起来。',
    ],
  },

  // ── 6. 整理·搜索·多端 ──
  {
    id: 'markdown-editor',
    name: '笔记编辑器（支持数学公式与双向链接）',
    category: 'system_collab',
    categoryName: '整理·搜索·多端',
    badge: '知识沉淀 · 本地安全',
    color: 'blue',
    iconName: 'FileEdit',
    whereToFind: '顶部导航「更多功能 → Markdown 笔记编辑器」（或手机端「全部 → 笔记编辑」）',
    summary: '专门适配考研公式排版和 `[[双链]]` 的笔记本，支持一边写、一边实时看排版效果。',
    problemSolved: '普通记事本打不了复杂的微积分和矩阵公式，也不好建立不同章节笔记之间的超链接跳转。',
    howToUse: [
      '左侧是笔记文件夹树，点开任意文件即可查看；上面按钮可以随时切换「只写」「分栏对照」「只读预览」。',
      '写公式时用 `$...$` 括起来（整行居中公式用 `$$...$$`），右边立刻渲染出印刷级公式。',
      '写到某个相关知识点时敲两个左中括号 `[[`，系统会自动联想提示相关笔记名，回车就连上了。',
      '写完别忘了点顶部「保存」，如果当前笔记想当场考考自己，还能点「即学即练」根据笔记出 3 道题！',
    ],
    proTips: [
      '如果是普通学员账号登录，公开共享讲义默认开启防误删保护，可以放心翻阅不怕手滑改乱。',
    ],
    route: '/editor',
    routeText: '打开笔记编辑器',
  },
  {
    id: 'vault-workflow',
    name: '知识整理（笔记健康体检与自动整理）',
    category: 'system_collab',
    categoryName: '整理·搜索·多端',
    badge: '定期清理 · 保持整洁',
    color: 'teal',
    iconName: 'Workflow',
    whereToFind: '顶部导航「更多功能 → 知识库整理工作流」（手机端「全部 → 知识整理」）',
    summary: '给你的整个笔记库做一次全面体检：查出空文件、没写标签、没人连线的孤立笔记，还能一键合并乱标签。',
    problemSolved: '记了几百篇笔记之后，标签五花八门（比如一会儿写 `#高数` 一会儿写 `#高等数学`），找起来乱糟糟。',
    howToUse: [
      '进入「知识整理」，最上面直接给你打出当前笔记库的健康分数。',
      '往下看问题清单：比如哪些笔记缺标题、哪些断链了、哪些是空文件，点击提示项就能处理或一键修复。',
      '用「标签治理」功能，把意思一样的杂乱标签统一合并成一个标准名称。',
    ],
    proTips: [
      '每周做一次小整理，你的知识关系图谱会干净漂亮很多，找资料也更快。',
    ],
    route: '/workflow',
    routeText: '去整理笔记库',
  },
  {
    id: 'command-search',
    name: '全站极速搜索（搜笔记 / 搜真题 / 搜公式）',
    category: 'system_collab',
    categoryName: '整理·搜索·多端',
    badge: '秒速定位 · 全库直达',
    color: 'blue',
    iconName: 'Search',
    whereToFind: '顶部导航栏右侧「搜索...」按钮，或在任意页面按 Ctrl + K（Mac 按 ⌘K）',
    summary: '不管想找哪篇笔记、哪道真题或哪个章节标题，一个搜索框输几个字一秒跳过去。',
    problemSolved: '文件目录和题库越积越多，一层层点文件夹太浪费时间。',
    howToUse: [
      '点击顶栏的搜索框，或者键盘直接按 `Ctrl + K`。',
      '输入关键字（比如 `特征值`、`页表`、`中值定理`），结果会按笔记、题目分类列出来。',
      '用键盘上下键选择目标，按回车（或直接鼠标点一下）立刻跳转打开。',
    ],
    proTips: [
      '输入 `#` 开头可以专门按标签找笔记；按 `Esc` 键可以立刻关掉搜索框。',
    ],
    shortcuts: ['Ctrl + K / ⌘K'],
  },
  {
    id: 'theme-and-mobile',
    name: '视觉主题切换、积分打卡与手机扫码同步',
    category: 'system_collab',
    categoryName: '整理·搜索·多端',
    badge: '个性舒适 · 多端同步',
    color: 'slate',
    iconName: 'Smartphone',
    whereToFind: '顶栏右侧主题切换按钮 / 算力积分胶囊 / 头像菜单 → 系统设置',
    summary: '一键切换 极简、鲜艳、护眼、暗黑 4 种界面风格；每日打卡领积分；手机平板扫码就能无缝接着学。',
    problemSolved: '晚上刷题白屏刺眼；电脑不在身边（比如在图书馆或食堂），想拿手机刷几道题背几个单词。',
    howToUse: [
      '点击顶栏右上角的风格胶囊（或手机首页右上角主题按钮），可在「极简 / 鲜艳 / 护眼 / 暗黑」之间循环切换，白天夜晚都舒服。',
      '每天记得点顶栏的「算力积分」小徽章签到打卡，记录连续学习天数并领取伴学积分。',
      '在电脑端点击头像菜单里的「手机互联（或系统设置）」扫描二维码，手机无需装 App 打开网页就能和电脑进度同步。',
    ],
    proTips: [
      '在手机浏览器里选择“添加到主屏幕”，桌面会出现图标，点开就像原生 App 一样全屏顺滑。',
      '所有笔记均以标准纯文本 Markdown 存在硬盘中，哪怕断网或换软件也能完全带走。',
    ],
    route: '/settings',
    routeText: '查看系统设置',
  },
]
