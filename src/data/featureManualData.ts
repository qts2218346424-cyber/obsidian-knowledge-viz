// ============================================================================
// CoreForge 研核 · 系统全功能与小功能完全使用说明手册数据字典
// 包含所有大功能、小功能的作用、使用说明、提效技巧与快捷键
// ============================================================================

export interface FeatureManualItem {
  id: string
  name: string
  category: 'spectrum_graph' | 'quicknote_editor' | 'quiz_error' | 'study_flashcard' | 'courseware_tools' | 'ai_agent' | 'system_collab'
  categoryName: string
  badge: string
  color: string // 标签与徽章主题色风格
  iconName: string
  summary: string // 一句话核心定位与作用
  problemSolved: string // 解决了备考什么核心痛点
  howToUse: string[] // 详细使用步骤与操作说明
  proTips: string[] // 进阶提效与实战技巧
  shortcuts?: string[] // 关联快捷键
  route?: string // 对应页面路由
  routeText?: string // 页面直达按钮文字
}

export const MANUAL_CATEGORIES = [
  { key: 'all', label: '全部功能速查', emoji: '🌟' },
  { key: 'spectrum_graph', label: '色谱图与知识图谱', emoji: '🕸️' },
  { key: 'quicknote_editor', label: '随手记与笔记编辑', emoji: '⚡' },
  { key: 'quiz_error', label: '刷题·答题卡·错题归因', emoji: '📝' },
  { key: 'study_flashcard', label: '闪卡·英语·政治', emoji: '🧠' },
  { key: 'courseware_tools', label: '仿真课件·专注·画板', emoji: '🔬' },
  { key: 'ai_agent', label: 'AI导师·伴学萌宠·Skills', emoji: '🤖' },
  { key: 'system_collab', label: '知识治理·权限·多端', emoji: '🛡️' },
] as const

export const FEATURE_MANUAL_DATA: FeatureManualItem[] = [
  // ── 1. 色谱图与知识图谱 ──
  {
    id: 'mastery-spectrum',
    name: '考点掌握度热力色谱图 (Mastery Spectrum)',
    category: 'spectrum_graph',
    categoryName: '色谱图与知识图谱',
    badge: '核心小功能 · 提分色谱',
    color: 'rose',
    iconName: 'Flame',
    summary: '基于红、黄、绿三级认知色谱动态映射 408 与考研数学考纲考点熟练度，一秒透视盲区死角。',
    problemSolved: '考纲考点繁多上百个，考生难以客观感知哪些掌握牢固、哪些频频出错，传统复习容易在已会知识上浪费时间。',
    howToUse: [
      '进入「知识图谱」页面，在顶部切换栏中选中「考点掌握度热力图 (Mastery Graph)」模式；',
      '观察全库考点的三色色谱分布：绿色（掌握度 ≥ 80%，稳固掌握）、黄色（50% ~ 80%，巩固中）、红色（< 50%，高危薄弱/错题集中区）；',
      '红色薄弱考点带有专属的「动态呼吸脉冲光晕」，提示优先复习；',
      '鼠标悬停于任意节点，可在左下角微卡片查看该考点的掌握分、真题练习次数与累计错误次数；',
      '单击红色或黄色节点，立即呼出【考点诊断与提分急救舱】，查看关联错题并开始 5 题靶向速测。',
    ],
    proTips: [
      '在「学习中心 /study」的「考纲热力图」子标签中，同样可以按学科（高数、线代、概率、408 四科）平铺查阅色谱图；',
      '热力色谱分数与您的真实做题战绩和闪卡自评双向联动，完成 5 题速测或真题练习后会自动更新颜色。',
    ],
    route: '/graph',
    routeText: '查看掌握度色谱图',
  },
  {
    id: 'knowledge-graph',
    name: '全库双链星系知识图谱 (Knowledge Graph)',
    category: 'spectrum_graph',
    categoryName: '色谱图与知识图谱',
    badge: '核心大功能 · D3拓扑',
    color: 'purple',
    iconName: 'Network',
    summary: '基于 D3 物理力导向引擎，将本地 Obsidian 笔记的双向链接 ([[链接]]) 转化为交互式网状星系。',
    problemSolved: '消除碎片化单点笔记孤岛，看清高等数学微积分与 408 操作系统/计算机网络之间的深层知识拓扑脉络。',
    howToUse: [
      '进入「知识图谱」页面，默认呈现力导向布局，滚轮可平滑缩放，拖拽画布可平移漫游；',
      '节点大小与出入度双向引用频次正比：节点越大，说明该考点是跨章节核心概念（如虚拟内存、特征值）；',
      '顶部搜索框支持输入关键词即时高亮匹配考点，非相关节点自动半透明虚化；',
      '点击顶部「全部标签 / 智能标签」可切换文本 LOD 显示级别，避免视野遮挡；',
      '双击任意笔记节点，右侧即刻滑出「笔记属性检查器」，无需离开图谱即可阅读 Markdown 正文与大纲。',
    ],
    proTips: [
      '点击「适配全景」按钮可一键根据当前屏幕几何尺寸居中并缩放至最佳视野；',
      '图中孤立点（Orphan Nodes）带有橙色边框警示，提示二轮复习时使用 [[双链]] 将其与主干体系连接。',
    ],
    route: '/graph',
    routeText: '打开知识图谱',
  },
  {
    id: 'mastery-rescue',
    name: '考点诊断与提分急救舱 (Mastery Rescue Hub)',
    category: 'spectrum_graph',
    categoryName: '色谱图与知识图谱',
    badge: '急救小功能 · 靶向提分',
    color: 'amber',
    iconName: 'ShieldAlert',
    summary: '点击图谱薄弱考点唤起的弹窗，集成历年出错题溯源、5题专项突击与仿真算法课件。',
    problemSolved: '发现薄弱考点后无从下手，急救舱提供从“查错因 ➔ 看课件 ➔ 练变式 ➔ 提分数”的一站式治疗方案。',
    howToUse: [
      '在图谱掌握度模式下，单击任意考点节点即可呼出提分急救舱；',
      '急救舱顶部清晰显示当前掌握度评级、近 7 日练习正确率及薄弱诊断结论；',
      '切换至「关联错题档案」标签，回顾自己曾因何种错因在此考点失分；',
      '点击「开启 5 题靶向突击」，系统从题库中抽取该考点的精选题，做完立即出分并回写色谱；',
      '对于抽象数据结构或计组机理，点击「调取配套仿真课件」可直达交互式动画演示。',
    ],
    proTips: [
      '支持在急救舱右上角手动滑块修改掌握度，灵活契合线下自习做题后的自我评估。',
    ],
    route: '/graph',
    routeText: '体验急救舱交互',
  },

  // ── 2. 随手记与笔记编辑 ──
  {
    id: 'quick-note',
    name: '极速随手记抽屉 (Quick Note Drawer)',
    category: 'quicknote_editor',
    categoryName: '随手记与笔记编辑',
    badge: '核心小功能 · 碎片入库',
    color: 'emerald',
    iconName: 'Sparkles',
    summary: '常驻顶栏的闪电速记抽屉，做题或看书时无需跳出当前界面，碎片推导与灵感一秒入库。',
    problemSolved: '刷题或看解析时偶有顿悟或草稿推导，传统做法需中断做题去开编辑器新建笔记，打断心流且极繁琐。',
    howToUse: [
      '在全站任意界面的顶部导航栏，点击「随手记」胶囊按钮（带闪电图标）；',
      '右侧滑出速记抽屉，自动根据当前时间生成笔记默认标题（如「考点速记_1112_2030」）；',
      '点击上方学科预设标签（408·计算机、数学·高数、数学·线代、错题复盘、核心考点等）一键注入标签；',
      '利用工具栏快捷插入 LaTeX 公式符号（$\\sum$ 等）、待办清单、粗体或代码块；',
      '点击「保存到知识库」：速记将直接写入本地 Obsidian Vault 的 `随手记/YYYY-MM/` 目录下；',
      '如需进一步长篇排版，可点击「保存并打开完整编辑器」无缝跳转。',
    ],
    proTips: [
      '支持手机平板端拍照或本地截图拖入上传，自动生成 Markdown 图床语法并归档本地附件目录；',
      '所有随手记保存后，会自动接入全局搜索 (Ctrl+K) 以及知识图谱的动态索引。',
    ],
    route: '/editor',
    routeText: '查看随手记目录',
  },
  {
    id: 'markdown-editor',
    name: '沉浸式 Markdown & LaTeX 笔记编辑器',
    category: 'quicknote_editor',
    categoryName: '随手记与笔记编辑',
    badge: '编辑大功能 · LaTeX双链',
    color: 'blue',
    iconName: 'FileEdit',
    summary: '针对工科考研优化的专业编辑器，深度支持 KaTeX 数学公式块、Obsidian 双链与多栏对照。',
    problemSolved: '普通笔记工具无法良好渲染复杂考研数学证明公式与计算机汇编代码块，且缺乏大纲导航。',
    howToUse: [
      '进入「笔记编辑」页面，左侧为 Vault 目录文件树，支持按层级展开与模糊搜索；',
      '支持三种视图模式自由切换：纯源码编辑、分栏实时对照、纯沉浸阅读模式；',
      '行内公式书写 `$f(x) = \\int_0^x e^{-t^2} dt$`，块级公式书写 `$$...$$`，实时高保真渲染；',
      '输入 `[[笔记名称]]` 即可建立知识双向链接，编辑器支持候选词联想补全；',
      '点击右侧「大纲树」可直观浏览 H1~H4 标题层级，点击快速锚点平滑滚动。',
    ],
    proTips: [
      '学生身份（student）登录时启用安全只读保护锁，避免手滑误改他人公开讲义；',
      '顶部显示实时字数统计与预计考研精读时长，助你科学规划复习番茄钟。',
    ],
    route: '/editor',
    routeText: '打开笔记编辑器',
  },

  // ── 3. 刷题·答题卡·错题归因 ──
  {
    id: 'answer-palette',
    name: '答题卡矩阵调色板 (Answer Palette)',
    category: 'quiz_error',
    categoryName: '刷题·答题卡·错题归因',
    badge: '刷题小功能 · 色彩答题卡',
    color: 'amber',
    iconName: 'Palette',
    summary: '真题演练界面的悬浮色板矩阵，仿粉笔/LeetCode 风格，通过题号颜色掌控整卷作答节奏。',
    problemSolved: '全卷几十道选择与大题难以全局把握哪道题做过、哪道题存疑，翻页查找耗时费力。',
    howToUse: [
      '在「做题中心 /quiz」开始模考或专项练习时，右侧边栏默认激活「答题卡矩阵」选项卡；',
      '观察题号格子的色彩语义：\n  • 白色/灰色：尚未作答题目；\n  • 绿色：已选定答案并暂存的题目；\n  • 黄色：标记为「存疑待复查」的题目；\n  • 红色：交卷批改后判错的题目；',
      '点击任意题号圆圈，试卷主体区域将瞬间平滑滚动直达该题；',
      '做完后可在调色板底部一键点击「交卷并智能批改」。',
    ],
    proTips: [
      '在做不确定的题目时，点击题号旁的「旗帜标记」图标，调色板中该题号会立刻变成醒目黄色，方便交卷前集中复核。',
    ],
    route: '/quiz',
    routeText: '体验答题卡调色板',
  },
  {
    id: 'quiz-scratchpad',
    name: '做题草稿纸与手写板 (Quiz Scratchpad)',
    category: 'quiz_error',
    categoryName: '刷题·答题卡·错题归因',
    badge: '刷题小功能 · 屏幕演练',
    color: 'teal',
    iconName: 'PenTool',
    summary: '试卷右侧一键唤起的手写演算草稿板，支持压感画笔、橡皮擦与一键清空。',
    problemSolved: '考研数学微积分积分推导与 408 二进制转换需要随手演练，手边没有纸笔或分心找草稿纸。',
    howToUse: [
      '在做题界面右侧边栏，切换到「草稿纸 (Scratchpad)」标签页；',
      '使用鼠标、电磁笔或触控屏直接在画布上进行分步运算与草图绘制；',
      '支持切换笔刷粗细、橡皮擦擦除局部或一键清空整页草稿；',
      '支持将演练草稿直接导出为图片或一键复制存入当前错题的复盘备注中。',
    ],
    proTips: [
      '全屏模式下体验更佳，配合压感手写板可完全模拟考场演草纸流程。',
    ],
    route: '/quiz',
    routeText: '打开做题界面',
  },
  {
    id: 'error-diagnostic',
    name: '多学科错题智能归因与变式强化',
    category: 'quiz_error',
    categoryName: '刷题·答题卡·错题归因',
    badge: '提分大功能 · 错因闭环',
    color: 'rose',
    iconName: 'AlertTriangle',
    summary: '自动收录真题练习错题，多维度分类「概念混淆/审题疏漏/计算失误」，并生成同考点变式题。',
    problemSolved: '传统做错题只看答案“对了就过”，缺少错因归因与同类变式检验，下次换个问法依然出错。',
    howToUse: [
      '交卷批改后，所有答错的题目自动同步至「错题本」；',
      '错题卡片上标注了你的错误作答、标准答案与步骤详解；',
      '手动勾选错因标签（如「计算失误」、「审题未看清前提」、「定理适用条件混淆」）；',
      '点击「双链跳转讲义」直接在知识库中打开对应章节的 Markdown 讲义重点加固；',
      '点击「AI 生成同考点变式题」，导师立即生成 3 道解法相近的变式小题检验巩固效果。',
    ],
    proTips: [
      '错题本数据自动归档在本地知识库 `错题本/YYYY-MM-DD.md` 格式文件中，支持导出与打印复习。',
    ],
    route: '/study',
    routeText: '查看错题本中心',
  },

  // ── 4. 闪卡·英语·政治 ──
  {
    id: 'sm2-flashcard',
    name: 'SM-2 艾宾浩斯抗遗忘记忆闪卡',
    category: 'study_flashcard',
    categoryName: '闪卡·英语·政治',
    badge: '记忆核心 · 认知算法',
    color: 'emerald',
    iconName: 'GraduationCap',
    summary: '基于认知心理学 SM-2 间隔重复算法，在即将遗忘的临界点精准推送核心定理与协议细节。',
    problemSolved: '408 繁杂的计算机网络端口协议与高等数学导数积分公式容易遗忘，死记硬背效率极低。',
    howToUse: [
      '在「学习中心 /study」进入「闪卡复习」模块，查看今日待复习卡片总数；',
      '卡片正面显示问题（如「TCP 拥塞控制四阶段及快重传机制」）；',
      '在大脑中回顾思考后，点击卡片翻转至背面查看标准解析；',
      '根据自身回忆难易度选择评价：\n  •「完全忘记 (0~2分)」：卡片重置进入今日循环；\n  •「勉强想起 (3分)」：缩短复习间隔；\n  •「熟练掌握 (4~5分)」：算法自动延长下一次复习至数天/数周后；',
      '支持从笔记讲义中点击「AI 一键提取闪卡」，自动将大篇幅文章转为问答卡片。',
    ],
    proTips: [
      '坚持每天早晚各 15 分钟清空今日到期队列，高频核心概念定理考试终身不忘。',
    ],
    route: '/study',
    routeText: '开始闪卡记忆',
  },
  {
    id: 'vocab-spectrum',
    name: '考研英语大纲词汇与掌握度色谱 (Vocabulary)',
    category: 'study_flashcard',
    categoryName: '闪卡·英语·政治',
    badge: '英语专项 · 词根衍生',
    color: 'indigo',
    iconName: 'BookOpen',
    summary: '聚合考研大纲 5500 核心词汇，结合词根词缀衍生树与三色熟练度色谱，高效背词。',
    problemSolved: '孤立按字母表死记单词易枯燥且容易忘记衍生词，无法把握单词熟练度状态。',
    howToUse: [
      '进入「考研英语 /english」或「大纲词汇 /vocabulary」页面；',
      '词汇列表直观展示红黄绿掌握度色谱圆点，支持按「高危生词 / 巩固词 / 熟词」筛选；',
      '点击单词卡片可展开释义、考研真题长难句原句出处及高频固定搭配；',
      '点击「词根词缀衍生树」可透视前缀、词根、后缀派生出的所有考研派生家族。',
    ],
    proTips: [
      '支持一键调用 AI 朗读标准发音与生成长难句翻译拆解。',
    ],
    route: '/english',
    routeText: '进入考研英语中心',
  },
  {
    id: 'politics-timeline',
    name: '近代史纲全屏沉浸时空轴与 1000 题',
    category: 'study_flashcard',
    categoryName: '闪卡·英语·政治',
    badge: '政治专项 · 历史时空轴',
    color: 'rose',
    iconName: 'Landmark',
    summary: '以时间轴串联 1840 鸦片战争至现代重要会议文献，内置肖秀荣 1000 题专项模拟。',
    problemSolved: '近代史纲时间线杂乱、重要著作发表时间容易记混，政治刷题无法体系化联想。',
    howToUse: [
      '进入「考研政治 /politics」页面，上方为可横向滑动的近代史纲时空轴；',
      '点击时空轴节点（如遵义会议、瓦窑堡会议、《新民主主义论》）查看事件背景与历史意义；',
      '下方直接切换马原、毛中特、史纲、思修四大模块的精选 1000 题刷题矩阵；',
      '做题支持考点收藏与错误自动归入政治专属错题本。',
    ],
    proTips: [
      '利用时空轴横向对比同一时期中共与国民党的方针变化，大题分析题思路瞬间通透。',
    ],
    route: '/politics',
    routeText: '进入考研政治中心',
  },

  // ── 5. 仿真课件·专注·画板 ──
  {
    id: 'interactive-courseware',
    name: '交互式算法与机理仿真课件 (Courseware & Sandbox)',
    category: 'courseware_tools',
    categoryName: '仿真课件·专注·画板',
    badge: '考研黑科技 · 动态仿真',
    color: 'cyan',
    iconName: 'Cpu',
    summary: '针对 408 核心重难点打造的高保真动态课件，支持单步调试、输入自定义与状态机推演。',
    problemSolved: '红黑树旋转、LRU 页面置换、TCP 滑动窗口等抽象机理静态看书难以看懂，动态演算一目了然。',
    howToUse: [
      '在图谱提分急救舱、或从「仿真微课」入口打开仿真课件视窗；',
      '课件库覆盖：\n  • 平衡二叉树 (AVL) 与红黑树 (RBT) 插入旋转动画；\n  • 虚拟内存两级分页地址转换与页面置换算法 (LRU/FIFO/CLOCK)；\n  • TCP 三次握手四次挥手及滑动窗口拥塞控制过程；\n  • 快速排序、KMP 字符串匹配与 Dijkstra 最短路径；\n  • 线性代数矩阵特征值几何变换与施密特正交化；',
      '使用下方控制条：支持播放、暂停、单步前进 (Step+)、单步后退 (Step-)；',
      '支持在输入框修改待插入的数据或页号序列，观察算法内部数据结构的实时流转。',
    ],
    proTips: [
      '课件右侧配有详细的伪代码行高亮与考研考点解析，是大题算法题的高分利器。',
    ],
    route: '/graph',
    routeText: '在图谱中调取课件',
  },
  {
    id: 'focus-music-ambience',
    name: '声学专注氛围与多轨白噪音混音 (Focus Ambience)',
    category: 'courseware_tools',
    categoryName: '仿真课件·专注·画板',
    badge: '专注提效 · 全局悬浮',
    color: 'purple',
    iconName: 'Music',
    summary: '双耳节拍、考研自习室与自然白噪音自由混音，全站底部常驻悬浮迷你播放器。',
    problemSolved: '自习时外界环境嘈杂或容易分心，普通音乐播放器切换页面即打断播放。',
    howToUse: [
      '进入「声学专注氛围 /music」页面，可挑选预设白噪音预设（雨夜自习室、林中书房、海浪篝火等）；',
      '支持自由混音：多轨独立调节雨声、雷声、咖啡厅人声、翻书声与双耳 Alpha 波音量；',
      '播放后，全站底部右下角会出现常驻「悬浮迷你播放器 (MiniPlayer)」；',
      '无论在做题、背单词、编辑笔记还是看图谱，音乐流绝不中断，随时可在底部点击暂停或调节音量。',
    ],
    proTips: [
      '建议复习数学推导时配合 40Hz Gamma 专注脑波，记忆英语时配合 10Hz Alpha 学习脑波。',
    ],
    route: '/music',
    routeText: '配置白噪音混音',
  },
  {
    id: 'pomodoro-timer',
    name: '专注番茄钟与心流时间切片 (Pomodoro)',
    category: 'courseware_tools',
    categoryName: '仿真课件·专注·画板',
    badge: '时间管理 · 专注自习',
    color: 'rose',
    iconName: 'Timer',
    summary: '25分钟专注+5分钟休息的番茄钟节奏，统计每日各科目深度学习时长。',
    problemSolved: '长达几小时的自习容易疲劳懈怠，缺乏结构化的时间切片与备考投入量化数据。',
    howToUse: [
      '进入「专注番茄钟 /pomodoro」模块，选择当前专注的备考科目（408 / 数学 / 英语 / 政治）；',
      '点击「开始专注」，全屏进入极简大字倒计时，屏蔽杂乱通知干扰；',
      '倒计时结束后播放轻柔磬声提醒进入 5 分钟课间休息；',
      '自动汇总每日番茄钟完成个数并沉淀为热力图表，记录备考每一步付出。',
    ],
    proTips: [
      '支持在设置中自定义单次专注时长（如考研数学单场模拟可设置为 180 分钟）。',
    ],
    route: '/pomodoro',
    routeText: '开启专注番茄钟',
  },
  {
    id: 'screen-annotation',
    name: '全屏屏幕批注与手写画板 (Annotation Overlay)',
    category: 'courseware_tools',
    categoryName: '仿真课件·专注·画板',
    badge: '交互小功能 · 随心圈画',
    color: 'amber',
    iconName: 'Highlighter',
    summary: '在任意网页、讲义或做题界面上直接拉起半透明画板，圈画重点与推导演算。',
    problemSolved: '看题解或讲义时想即兴勾画关键词或画流程图，传统网页无法随心批注。',
    howToUse: [
      '在屏幕右上方点击画笔图标激活「全屏屏幕批注」浮层；',
      '悬浮工具栏支持：高亮荧光笔、直线/箭头工具、矩形与椭圆框、文本标注与颜色调色板；',
      '点击「清空批注」可一键擦除当前标注；点击「保存截图」可将当前带批注界面保存为本地图片；',
      '再次点击收起图标退出标注模式，恢复页面正常点击操作。',
    ],
    proTips: [
      '针对大屏平板或带触控笔的二合一电脑，批注体验媲美专业电子手账。',
    ],
  },

  // ── 6. AI导师·伴学萌宠·Skills ──
  {
    id: 'ai-assistant-modal',
    name: '全局 AI 伴学导师 (Ctrl + Shift + A)',
    category: 'ai_agent',
    categoryName: 'AI导师·伴学萌宠·Skills',
    badge: 'AI 大功能 · 随时召唤',
    color: 'indigo',
    iconName: 'Bot',
    summary: '多模型（DeepSeek / Claude / OpenAI）无缝直连，随时唤起解答数学定理证明与 408 难点。',
    problemSolved: '遇到疑难考点翻书找不到答案，常规 AI 废话连篇、不符合考研命题风格。',
    howToUse: [
      '在全站任意位置按下快捷键 `Ctrl + Shift + A`，或点击顶栏「AI 伴学」图标；',
      '屏幕即刻浮现 AI 导师对话视窗，自动挂载当前正在浏览的笔记或试卷作为上下文；',
      '直接向导师发送你的疑问（如「帮我证明柯西中值定理并指出考研常见考法」）；',
      '导师按照考研阅卷规范给出分步证明、避坑指南并推荐相关关联笔记；',
      '支持一键将导师生成的推导结论「追加写入当前笔记」或「存为闪卡」。',
    ],
    proTips: [
      '支持在设置中切换模型厂商与温度参数，或配置本机 Claude Code / Codex 本地 Agent。',
    ],
    shortcuts: ['Ctrl + Shift + A'],
    route: '/chat',
    routeText: '进入 AI 伴学对话',
  },
  {
    id: 'pet-assistant',
    name: '伴学小萌宠与专属考研 Skills (Pet Assistant)',
    category: 'ai_agent',
    categoryName: 'AI导师·伴学萌宠·Skills',
    badge: '伴学小功能 · 萌宠Agent',
    color: 'emerald',
    iconName: 'Smile',
    summary: '屏幕右下角的桌面伴学小萌宠（奶龙/小猫/狐狸），具备真实读写知识库的自主 Agent 权限。',
    problemSolved: '备考漫长枯燥孤独，传统助手缺乏趣味交互，萌宠不仅解压还能自主替你整理笔记。',
    howToUse: [
      '点击屏幕右下角的萌宠形象展开「伴学小萌宠」抽屉；',
      '萌宠支持在奶龙、可爱小猫、灵动狐狸等多种人设之间自由切换外观与语音；',
      '抽屉顶部提供「考研专属 Skills」工具箱：\n  • `大纲重构`：自动分析章节逻辑重理 Markdown 目录；\n  • `图谱双链`：自动检索全库孤立词条并建立 `[[双链]]`；\n  • `推导挖空`：将证明大题关键步骤挖空做填空自测；\n  • `错题避坑`：针对近 3 天错题归纳易错套路清单；\n  • `全库治理`：批量修复格式错误与规范标签；',
      '点击任意 Skill 即可一键下发指令，萌宠自动在后台执行并汇报成果。',
    ],
    proTips: [
      '萌宠可以直接读取您本地 Obsidian 库的文件，执行操作前会清晰展示修改计划，安全放心。',
    ],
  },

  // ── 7. 知识治理·权限·多端 ──
  {
    id: 'vault-workflow',
    name: '知识库整理与 Vault 健康体检工作流 (Workflow)',
    category: 'system_collab',
    categoryName: '知识治理·权限·多端',
    badge: '治理大功能 · 知识巡检',
    color: 'teal',
    iconName: 'Workflow',
    summary: '8项健康度指标实时巡检，智能识别孤立笔记、断链、空笔记，支持标签批量重命名合并。',
    problemSolved: '知识库随着复习深入越堆越多、标签杂乱冗余、存在大量没有链接的死笔记。',
    howToUse: [
      '进入「知识库整理 /workflow」页面，顶部清晰展示 Vault 综合健康评分；',
      '查看检测详情列表：包括未命名笔记、无标签笔记、孤立断链、空文件等；',
      '针对问题项点击「一键快速修复」，系统自动重构文件结构；',
      '使用「标签治理」工具，将碎片化的多个同义标签（如 `#高数` 和 `#高等数学`）合并为单一标准标签；',
      '开启「后台定时巡检」：夜间自动检测并输出体检报告，无需人工时刻打理。',
    ],
    proTips: [
      '配合 D3 知识图谱使用，整理完成后图谱中的橙色孤立警告点将全部消除。',
    ],
    route: '/workflow',
    routeText: '打开知识库整理',
  },
  {
    id: 'command-search',
    name: '全局智能穿梭搜索 (Ctrl + K)',
    category: 'system_collab',
    categoryName: '知识治理·权限·多端',
    badge: '提效小功能 · 键盘流',
    color: 'blue',
    iconName: 'Search',
    summary: '极速毫秒级全局搜索框，支持在笔记、真题、章节标题、错题本中跨维度闪电直达。',
    problemSolved: '要找一个定理或题目需要在多个页面来回点击，查找效率低下。',
    howToUse: [
      '在任何页面按下键盘快捷键 `Ctrl + K`（或点击顶栏搜索框）；',
      '输入关键词或拼音首字母，搜索结果瞬间聚合并按笔记、考题、章节分类排列；',
      '使用方向键上下移动，按 Enter 键瞬间跳转打开目标笔记或题目；',
      '按 `Esc` 键极速关闭搜索窗口。',
    ],
    proTips: [
      '输入 `#` 前缀可专门筛选标签，输入 `$` 前缀可专门搜索数学公式定义。',
    ],
    shortcuts: ['Ctrl + K'],
  },
  {
    id: 'user-roles-safety',
    name: '多用户角色权限与本地优先安全',
    category: 'system_collab',
    categoryName: '知识治理·权限·多端',
    badge: '系统基石 · 本地安全',
    color: 'slate',
    iconName: 'ShieldCheck',
    summary: '超级管理员、助教编辑者与学生只读多级分权，数据 100% 存储于本地 Obsidian Vault。',
    problemSolved: '多人团队或师生共同复习时误改讲义、云端笔记平台数据泄露与格式绑架。',
    howToUse: [
      '**超级管理员 (`admin`)**：掌控全局存储路径、管理用户列表、配置各端 AI 密钥与全库大纲；',
      '**研学编辑者 (`editor`)**：全权限阅读与编辑 Markdown 讲义，录入自选新题目；',
      '**研学学员 (`student`)**：默认自主注册角色，享受全量真题演练、错题本沉淀、闪卡复习与 AI 伴学，讲义笔记享有防篡改只读保护；',
      '在右上角点击个人头像，可进入「多用户管理」与「修改密码」面板。',
    ],
    proTips: [
      '所有笔记、做题记录与错题档案均以纯文本 Markdown 保存在您电脑的硬盘中，即使断网或离线也能完整使用。',
    ],
  },
  {
    id: 'mobile-access',
    name: '局域网移动端互联与扫码即用',
    category: 'system_collab',
    categoryName: '知识治理·权限·多端',
    badge: '多端协同 · 扫码直连',
    color: 'indigo',
    iconName: 'Smartphone',
    summary: '同一 Wi-Fi 下手机或平板扫描二维码，无需安装 APP，浏览器即插即用协同刷题背词。',
    problemSolved: '出门在图书馆、食堂或床上不想带沉重电脑，需要利用碎片时间用手机或 iPad 背词刷题。',
    howToUse: [
      '在电脑端右上角点击「手机互联」图标，弹出局域网访问二维码与局域网 IP 地址；',
      '手机或 iPad 连入同一无线局域网，使用相机或微信扫码打开；',
      '移动端自动适配触摸屏交互，支持在大纲词汇、艾宾浩斯闪卡、随手记与选择题练习间流畅自习；',
      '手机上的复习进度与作答结果实时通过网络秒级同步到电脑端。',
    ],
    proTips: [
      '可以在手机 Safari / Chrome 浏览器中选择「添加到主屏幕」，即可获得类似独立原生 APP 的全屏沉浸体验。',
    ],
  },
]
