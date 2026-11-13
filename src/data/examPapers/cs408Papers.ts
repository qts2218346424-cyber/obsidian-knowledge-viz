import type { ExamPaper } from './types'

/**
 * 历年 408 计算机学科专业基础综合真实完整试卷库
 */
export const CS408_EXAM_PAPERS: ExamPaper[] = [
  // ── 2024 考研 408 统考真题 ──────────────────────────────────────────────────
  {
    id: 'paper-408-2024',
    year: 2024,
    domain: 'cs_408',
    category: '408',
    paperType: 'real',
    title: '2024 年全国硕士研究生招生考试 · 408 计算机综合真题',
    subtitle: '全国统考代码：408 · 满分 150 分 · 考试时间 180 分钟',
    totalScore: 150,
    durationMinutes: 180,
    description: '聚焦红黑树/B+树操作、虚拟存储TLB命中与Cache行替换、页面置换算法与死锁判定、TCP拥塞窗口与DNS解析。',
    questions: [
      {
        id: '408-24-01',
        paperQuestionNumber: 1,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '数据结构',
        chapter: '线性表与链表',
        type: 'choice',
        question: '若某单链表中含头结点，指针 head 指向头结点，则判断链表为空的条件是？',
        options: ['A. head == NULL', 'B. head->next == NULL', 'C. head->next == head', 'D. head != NULL'],
        correctAnswer: 'B',
        explanation: '带头结点的单链表中，head 指针始终指向头结点自身；当头结点的 next 指针为 NULL 时，说明链表没有任何实际数据结点，即为空表。',
        steps: [
          '区分带头结点与不带头结点的链表定义',
          '带头结点时 head 始终分配内存不为 NULL',
          '空表条件为首元结点不存在：head->next == NULL',
        ],
        keyPoints: ['单链表头结点', '判空条件'],
        difficulty: '简单',
        tags: ['2024真题', '408', '数据结构'],
      },
      {
        id: '408-24-11',
        paperQuestionNumber: 11,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '计算机组成原理',
        chapter: '指令系统',
        type: 'choice',
        question: '下列关于 RISC（精简指令集计算机）特点的描述中，错误的是？',
        options: [
          'A. 指令字长通常固定，指令格式种类少',
          'B. 绝大多数指令在一个时钟周期内完成',
          'C. 仅 Load 和 Store 指令访存，其余指令在寄存器间操作',
          'D. 硬件实现主要采用微程序控制器'
        ],
        correctAnswer: 'D',
        explanation: 'RISC 为了追求高执行效率与流水线规整性，控制器绝大多数采用硬布线逻辑（组合逻辑控制器）实现，而 CISC 才普遍采用微程序控制器。',
        steps: [
          '回顾 RISC 核心设计哲学：精简、定长、单周期、寄存器-寄存器型',
          '分析控制器实现方案：RISC 采用硬布线控制器，速度极快',
          '判定 D 选项将微程序控制器赋给 RISC 是典型的 CISC 特征，故错误',
        ],
        keyPoints: ['RISC 与 CISC 对比', '硬布线逻辑控制器'],
        difficulty: '简单',
        tags: ['2024真题', '408', '计组'],
      },
      {
        id: '408-24-41',
        paperQuestionNumber: 41,
        score: 13,
        sectionName: '二、综合应用题',
        domain: 'cs_408',
        subject: '数据结构',
        chapter: '二叉树与遍历算法',
        type: 'analysis',
        question: '【算法题 · 13分】已知二叉树采用二叉链表存储，结点结构为 (left, data, right)。请设计一个高效算法，求二叉树中所有叶子结点的权值之和。要求：\n1) 给出算法的基本设计思想；\n2) 采用 C/C++ 语言描述算法；\n3) 分析算法的时间复杂度与空间复杂度。',
        options: [],
        correctAnswer: '通过递归先序/后序遍历累计叶子结点权值，时间复杂度 O(n)，空间复杂度 O(h)',
        explanation: '【标准解答】：\n1) 思想：基于深度优先遍历（递归遍历）。从根结点出发，若当前结点为空返回 0；若当前结点的左右孩子均为空，则为叶子结点，返回其权值 data；否则递归计算左子树与右子树叶结点权值之和并返回二者相加。\n2) C语言实现：\n```c\nint sumOfLeaves(TreeNode* root) {\n    if (root == NULL) return 0;\n    if (root->left == NULL && root->right == NULL) {\n        return root->data;\n    }\n    return sumOfLeaves(root->left) + sumOfLeaves(root->right);\n}\n```\n3) 复杂度：时间复杂度为 O(n)（每个结点访问一次）；空间复杂度为 O(h)（递归调用栈深度等于树的高度，最坏单支树为 O(n)，平衡二叉树为 O(log n)）。',
        steps: [
          '【踩分点 1 (3分)】：设计思想阐述清晰：明确说明基于树的遍历判断左右孩子皆空',
          '【踩分点 2 (2分)】：处理递归边界与空树边界（root == NULL 返回 0）',
          '【踩分点 3 (4分)】：准确编写递归逻辑或借助队列/栈进行迭代累加',
          '【踩分点 4 (4分)】：准确分析复杂度：时间复杂度 O(n)，空间复杂度分析出与树高 h 相关的 O(h)',
        ],
        keyPoints: ['二叉树遍历', '叶结点判别', '递归复杂度分析'],
        difficulty: '中等',
        tags: ['2024真题', '408', '算法大题'],
      }
    ]
  },
  // ── 2023 考研 408 统考真题 ──────────────────────────────────────────────────
  {
    id: 'paper-408-2023',
    year: 2023,
    domain: 'cs_408',
    category: '408',
    paperType: 'real',
    title: '2023 年全国硕士研究生招生考试 · 408 计算机综合真题',
    subtitle: '全国统考代码：408 · 满分 150 分',
    totalScore: 150,
    durationMinutes: 180,
    description: '涵盖数据结构树与图算法、计组流水线与Cache组相联、操作系统inode与PV同步、计网滑动窗口与最长前缀匹配。',
    questions: [
      {
        id: '408-23-01',
        paperQuestionNumber: 1,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '数据结构',
        chapter: '二叉树与二叉排序树',
        type: 'choice',
        question: '在含有 15 个结点的二叉排序树中，查找一个不存在的关键字，在最坏情况下需要比较的结点数是？',
        options: ['A. 4', 'B. 5', 'C. 15', 'D. 16'],
        correctAnswer: 'C',
        explanation: '最坏情况是二叉排序树退化为单支树，树高为 15。查找不存在的关键字需要一直比较到最底层叶结点，故最坏比较 15 次。',
        steps: [
          '分析二叉排序树的形态极端情况：单支树退化为单链表',
          '结点总数等于树的高度 $h = 15$',
          '查找失败时最多比较到叶结点，总共比较 15 次',
        ],
        keyPoints: ['二叉排序树最坏查找长度', '退化单支树'],
        difficulty: '中等',
        tags: ['2023真题', '408', '数据结构'],
      },
      {
        id: '408-23-11',
        paperQuestionNumber: 11,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '计算机组成原理',
        chapter: '存储系统与Cache',
        type: 'choice',
        question: '某计算机的主存地址空间大小为 64MB，Cache 容量为 64KB，每块大小为 64B。若采用 4 路组相联映射方式，则主存地址中的“组号（Cache组索引）”字段位数为？',
        options: ['A. 8 位', 'B. 10 位', 'C. 12 位', 'D. 16 位'],
        correctAnswer: 'A',
        explanation: 'Cache 总行数 = 64KB / 64B = 1024 行。4 路组相联，组数 = 1024 / 4 = 256 组。故组号占 log₂(256) = 8 位。',
        steps: [
          '计算 Cache 总块数：64KB / 64B = 1024',
          '计算组数：1024 / 4 = 256 组',
          '求二进制位数：$\\log_2(256) = 8$ 位',
        ],
        keyPoints: ['Cache组相联映射', '地址划分'],
        difficulty: '困难',
        tags: ['2023真题', '408', '计组'],
      },
      {
        id: '408-23-22',
        paperQuestionNumber: 22,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '操作系统',
        chapter: '文件系统',
        type: 'choice',
        question: '某文件系统采用多级混合索引结构，inode 包含 10 个直接块指针、1 个一级间接块指针和 1 个二级间接块指针。盘块大小为 4KB，盘块号占 4B。则该文件系统支持的单个文件最大逻辑长度约为？',
        options: ['A. 4GB', 'B. 4MB', 'C. 16GB', 'D. 64MB'],
        correctAnswer: 'A',
        explanation: '每块含 4KB / 4B = 1024 个指针。二级间接索引可寻址 1024 × 1024 × 4KB = 4GB，起决定性作用。',
        steps: [
          '单个间接盘块容纳指针数：$4\\text{KB} / 4\\text{B} = 1024$',
          '二级间接寻址容量：$1024 \\times 1024 \\times 4\\text{KB} = 4\\text{GB}$',
        ],
        keyPoints: ['inode混合索引', '文件最大容量计算'],
        difficulty: '困难',
        tags: ['2023真题', '408', '操作系统'],
      },
      {
        id: '408-23-41',
        paperQuestionNumber: 41,
        score: 13,
        sectionName: '二、综合应用题',
        domain: 'cs_408',
        subject: '数据结构',
        chapter: '二叉树算法设计',
        type: 'analysis',
        question: '【综合大题 · 算法设计题】已知二叉树采用二叉链表存储结构，每个结点包含 left、right 和 val 字段。请设计一个算法，判断该二叉树是否为完全二叉树（Complete Binary Tree）。要求：给出算法的基本设计思想；采用 C 或 C++ 语言实现核心函数；分析算法的时间复杂度和空间复杂度。',
        correctAnswer: '采用层次遍历（广度优先搜索队列）方法判断。当遇到空指针后，后续队列中若再出现非空结点，则必非完全二叉树。',
        explanation: '算法核心思想：利用队列进行层次遍历。所有结点（包括其左右孩子，不论是否为空）依次入队。当出队首次遇到 NULL 指针时，如果该二叉树是完全二叉树，则此后所有留在队列中的结点都必须是 NULL 指针。若队列中后续还有非空结点，则不是完全二叉树。时间复杂度 O(n)，空间复杂度 O(n)。',
        steps: [
          '步骤1（设计思想 4分）：叙述借助辅助队列进行层序遍历，一旦出队遇到空结点标记 flag=true，后续若再见非空结点即违背完全二叉树定义',
          '步骤2（代码编写 6分）：规范实现 Queue 初始化、入队、出队及循环终止返回 bool 逻辑',
          '步骤3（复杂度分析 3分）：说明每个结点恰好进出队一次，时间复杂度为 O(n)；辅助队列最多容纳一层结点，空间复杂度为 O(n)',
        ],
        keyPoints: ['完全二叉树判别', '层次遍历算法', '队列辅助搜索'],
        difficulty: '困难',
        tags: ['2023真题', '408', '数据结构算法大题'],
      },
      {
        id: '408-23-45',
        paperQuestionNumber: 45,
        score: 10,
        sectionName: '二、综合应用题',
        domain: 'cs_408',
        subject: '操作系统',
        chapter: '进程同步与互斥',
        type: 'analysis',
        question: '【综合大题 · PV 操作设计】在一个仓库中，可以存放 A 和 B 两种产品。仓库最多可存放 100 件产品。要求：A 产品的件数不能比 B 产品多出 30 件以上；B 产品的件数也不能比 A 产品多出 30 件以上。请使用信号量及 P、V 操作描述产品 A 和产品 B 入库的同步互斥过程。',
        correctAnswer: '设置信号量 mutex 互斥访问仓库；empty 表示空闲货位；diffA 限制 A-B <= 30；diffB 限制 B-A <= 30。',
        explanation: '设置互斥信号量 mutex = 1；空间信号量 empty = 100；差值限制信号量 sa = 30（表示 A 还能比 B 多存几件，初值为 30）；sb = 30（表示 B 还能比 A 多存几件，初值为 30）。A 入库时：P(empty), P(sa), P(mutex), 存入 A, V(mutex), V(sb)；B 入库时：P(empty), P(sb), P(mutex), 存入 B, V(mutex), V(sa)。',
        steps: [
          '步骤1（信号量定义 3分）：明确 empty=100 控制总容量，sa=30 限制 A 比 B 多的件数，sb=30 限制 B 比 A 多的件数，mutex=1 控制入库互斥',
          '步骤2（A产品入库过程 4分）：P(empty); P(sa); P(mutex); 存A; V(mutex); V(sb);',
          '步骤3（B产品入库过程 3分）：P(empty); P(sb); P(mutex); 存B; V(mutex); V(sa);',
        ],
        keyPoints: ['PV操作', '信号量初值设定', '数量差约束建模'],
        difficulty: '中等',
        tags: ['2023真题', '408', '操作系统PV大题'],
      }
    ]
  },

  // ── 2022 考研 408 统考真题 ──────────────────────────────────────────────────
  {
    id: 'paper-408-2022',
    year: 2022,
    domain: 'cs_408',
    category: '408',
    paperType: 'real',
    title: '2022 年全国硕士研究生招生考试 · 408 计算机综合真题',
    subtitle: '全国统考代码：408 · 满分 150 分',
    totalScore: 150,
    durationMinutes: 180,
    description: '涵盖KMP匹配next数组、流水线数据旁路、CSMA/CD退避算法及文件目录软硬链接考点。',
    questions: [
      {
        id: '408-22-01',
        paperQuestionNumber: 1,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '数据结构',
        chapter: '串与KMP算法',
        type: 'choice',
        question: '已知模式串 S = "ababaa"，其基于 1-based 下标定义的 KMP 算法的 next 数组值为？',
        options: ['A. 0, 1, 1, 2, 3, 2', 'B. 0, 1, 1, 2, 3, 4', 'C. 0, 1, 2, 3, 4, 2', 'D. 0, 1, 1, 2, 2, 3'],
        correctAnswer: 'B',
        explanation: '根据 1-based 下标定义：next[1]=0, next[2]=1。之后每一位取前缀最长相等前后缀长度+1。最终计算为 0, 1, 1, 2, 3, 4。',
        steps: ['根据前后缀匹配规则逐位计算'],
        keyPoints: ['KMP next数组'],
        difficulty: '中等',
        tags: ['2022真题', '408', 'KMP'],
      },
      {
        id: '408-22-11',
        paperQuestionNumber: 11,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '计算机组成原理',
        chapter: '指令流水线',
        type: 'choice',
        question: '在 5 级指令流水线（IF、ID、EX、MEM、WB）中，解决“写后读（RAW）”数据相关最有效且无需阻塞流水线的硬件技术是？',
        options: ['A. 分支预测', 'B. 数据旁路（转发）技术', 'C. 插入 NOP 空操作指令', 'D. 乱序发射与顺序提交'],
        correctAnswer: 'B',
        explanation: '数据旁路转发将 EX 或 MEM 阶段计算出的最新结果直接引到后续指令 ALU 输入端，避免气泡停顿。',
        steps: ['理解 RAW 数据冒险机理与转发通道'],
        keyPoints: ['数据旁路转发', '流水线冒险'],
        difficulty: '简单',
        tags: ['2022真题', '408', '流水线'],
      },
      {
        id: '408-22-35',
        paperQuestionNumber: 35,
        score: 2,
        sectionName: '一、单项选择题',
        domain: 'cs_408',
        subject: '计算机网络',
        chapter: '数据链路层',
        type: 'choice',
        question: '在以太网 CSMA/CD 协议中，若数据传输速率为 100Mbps，单向传播时延为 2.5μs，则为了能有效检测出碰撞，以太网的最短帧长至少应为？',
        options: ['A. 500 bit', 'B. 64 字节', 'C. 250 bit', 'D. 1500 字节'],
        correctAnswer: 'A',
        explanation: '争用期 2τ = 5μs。最短帧长 = 2τ × C = 5μs × 100Mbps = 500 bit。',
        steps: ['争用期 2τ 计算', 'L_min = 2τ × 数据率'],
        keyPoints: ['CSMA/CD 最短帧长'],
        difficulty: '简单',
        tags: ['2022真题', '408', '计网'],
      }
    ]
  },
  {
    "id": "paper-408-2011",
    "year": 2011,
    "domain": "cs_408",
    "category": "408",
    "paperType": "real",
    "title": "2011 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
    "subtitle": "全国统考原卷 · 代码 408 · 满分 150 分 · 考试时间 180 分钟",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2011 年 408 统考真题全真试卷，涵盖数据结构、计算机组成原理、操作系统与计算机网络四大统考科目，包含全部客观选择题与典型综合大题。",
    "questions": [
      {
        "id": "408-11-01",
        "paperQuestionNumber": 1,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2011 408 统考真题 · T1】设 n 是描述问题规模的非负整数，下面程序片段的时间复杂度是（ ）。\n\n```c\nx = 2;\nwhile (x < n / 2) {\n    x = 2 * x;\n}\n```",
        "options": [
          "A. O(log2 n)",
          "B. O(n)",
          "C. O(n log2 n)",
          "D. O(n^2)"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】循环体内每次将 x 翻倍（x = 2 * x），设循环执行 k 次，则 $x = 2^{k+1}$。循环终止条件为 $x \\ge n/2$，两边取以 2 为底的对数得 $k + 1 \\ge \\log_2(n/2) = \\log_2 n - 1$，故循环执行次数为 $O(\\log_2 n)$。故选 A。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-11-02",
        "paperQuestionNumber": 2,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2011 408 统考真题 · T2】元素 a, b, c, d, e 依次进入初始为空的栈中，若元素进栈后可停留、可出栈，直到所有元素 都出栈，则在所有可能的出栈序列中，以元素 d 开头的序列个数是 。",
        "options": [
          "A. 3",
          "B. 4",
          "C. 5",
          "D. 6"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-11-03",
        "paperQuestionNumber": 3,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2011 408 统考真题 · T3】已知循环队列存储在一维数组 A[O... n-1]中，且队列非空时 front 和 rear 分别指向队头元 素和队尾元素。若初始时队列为空，且要求第 1 个进入队列的元素存储在 A[O]处，则初始时 front 和 rear 的值分别是 。",
        "options": [
          "A. 0,0",
          "B. O,n-1",
          "C. n-1,0",
          "D. n-I,n-1"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-11-04",
        "paperQuestionNumber": 4,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2011 408 统考真题 · T4】若一棵完全二叉树有 768 个结点，则该二叉树中叶结点的个数是",
        "options": [
          "A. 257",
          "B. 258·",
          "C. 384",
          "D. 385"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-11-05",
        "paperQuestionNumber": 5,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2011 408 统考真题 · T5】若一棵二叉树的前序遍历序列和后序遍历序列分别为 1, 2, 3, 4 和 4,3, 2, I, 则该二叉树的 中序遍历序列不会是 。",
        "options": [
          "A. 1, 2, 3, 4",
          "B. 2, 3, 4, 1",
          "C. 3, 2, 4, 1",
          "D. 4, 3, 2, 1"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-11-06",
        "paperQuestionNumber": 6,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2011 408 统考真题 · T6】已知一棵有 2011 个结点的树，其叶结点个数为 116, 该树对应的二叉树中无右孩子的结 点个数是 。",
        "options": [
          "A. 115",
          "B. 116",
          "C. 1895",
          "D. 1896"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-11-07",
        "paperQuestionNumber": 7,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2011 408 统考真题 · T7】对于下列关键字序列，不可能构成某二叉排序树中一条查找路径的序列是 。",
        "options": [
          "A. 95, 22, 91, 24, 94, 71",
          "B. 92,20,91,34,88,35",
          "C. 21, 89, 77, 29, 36, 38 .",
          "D. 12, 25, 71, 68, 33, 34"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-11-08",
        "paperQuestionNumber": 8,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图遍历",
        "type": "choice",
        "question": "【2011 408 统考真题 · T8】下列关于图的叙述中，正确的是 。\n\nI. 回路是简单路径\n\nII. 存储稀疏图，用邻接矩阵比邻接表更省空间\n\nIII. 若有向图中存在拓扑序列，则该图不存在回路",
        "options": [
          "A. 仅 II",
          "B. 仅 I、 II",
          "C. 仅 III",
          "D. 仅1、 III"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“图与图遍历”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "图与图遍历"
        ]
      },
      {
        "id": "408-11-09",
        "paperQuestionNumber": 9,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图遍历",
        "type": "choice",
        "question": "【2011 408 统考真题 · T9】为提高散列 (Hash) 表的查找效率，可以采取的正确措施是 。\n\nI. 增大装填（载）因子\n\nII. 设计冲突（碰撞）少的散列函数\n\nIII. 处理冲突（碰撞）时避免产生聚集（堆积）现象",
        "options": [
          "A. 仅I",
          "B. 仅II",
          "C. 仅I、II",
          "D. 仅II、III"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“图与图遍历”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "图与图遍历"
        ]
      },
      {
        "id": "408-11-10",
        "paperQuestionNumber": 10,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2011 408 统考真题 · T10】为实现快速排序算法， 待排序序列宜采用的存储方式是",
        "options": [
          "A. 顺序存储",
          "B. 散列存储",
          "C. 链式存储",
          "D. 索引存储"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-11-11",
        "paperQuestionNumber": 11,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2011 408 统考真题 · T11】已知序列25,13, 10, 12, 9 是大根堆， 在序列尾部插入新元素18, 将其再调整为大根堆， 调整过程中元素之间进行的比较次数是 。",
        "options": [
          "A. 1",
          "B. 2",
          "C. 4",
          "D. 5"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-11-12",
        "paperQuestionNumber": 12,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2011 408 统考真题 · T12】下列选项中， 描述浮点数操作速度指标的是",
        "options": [
          "A. MIPS",
          "B. CPI",
          "C. IP",
          "D. MFLOPS"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-11-13",
        "paperQuestionNumber": 13,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2011 408 统考真题 · T13】float型数据通常用IEEE754单精度浮点数格式表示。 若编译器将float型变量x分配到 一个32位浮点寄存器FRI中， 且 X= -8.25, 则FRI的内容是 。",
        "options": [
          "A. C104 OOOOH",
          "B. C242 OOOOH",
          "C. C184 OOOOH",
          "D. C1C2 OOOOH"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-11-14",
        "paperQuestionNumber": 14,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2011 408 统考真题 · T14】下列各类存储器中， 不采用随机存取方式的是 。",
        "options": [
          "A. EPROM",
          "B. CDROM",
          "C. DRAM",
          "D. SRAM"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-11-15",
        "paperQuestionNumber": 15,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T15】某计算机存储器按字节编址，主存地址空间大小为64MB, 现用4MBx8位的RAM芯片 组成32MB的主存储器， 则存储器地址寄存器MAR的位数至少是",
        "options": [
          "A. 22位",
          "B. 23位",
          "C. 25位",
          "D. 26位"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-11-16",
        "paperQuestionNumber": 16,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T16】偏移寻址通过将某个寄存器内容与一个形式地址相加而生成有效地址。下列寻址方式中， 不属于偏移寻址方式的是 。",
        "options": [
          "A. 间接寻址",
          "B. 基址寻址",
          "C. 相对寻址",
          "D. 变址寻址"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-11-17",
        "paperQuestionNumber": 17,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T17】某机器有一个标志寄存器， 其中有进位／借位标志CF、零标志ZF、符号标志SF 和溢出 标志OF, 条件转移指令hgt (无符号整数比较大于时转移）的转移条件是 。 . \"",
        "options": [
          "A. CF+OF=l",
          "B. SF+ZF=l",
          "C. CF+ZF=l",
          "D. CF+SF=l"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-11-18",
        "paperQuestionNumber": 18,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T18】下列给出的指令系统特点中，有利于实现指令流水线的是＿＿＿。\n\nI. 指令格式规整且长度一致\n\nII. 指令和数据按边界对齐存放\n\nIII. 只有Load/Store指令才能对操作数进行存储访问",
        "options": [
          "A. 仅I、II",
          "B. 仅II、III",
          "C. 仅I、III",
          "D. I、II、III"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。\n\n各小项深入解析：\n- **I 正确**：指令格式规整且长度一致（定长指令字结构），极大地简化了指令译码与硬件控制逻辑，各流水段执行时间容易达到均衡规整。\n- **II 正确**：指令和数据按边界对齐存放，保证一个访存周期内即可完整取出一条指令或一个操作数，避免跨边界存放引起的多次访存而造成流水线严重停顿（Stall）。\n- **III 正确**：只有 Load/Store 指令才能访存（典型 RISC 结构），其余算术逻辑运算均在寄存器之间进行，大幅减少了指令之间的相关冲突与复杂的寻址流水阶段。\n\n综上，I、II、III 均有利于实现指令流水线，故选 D。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-11-19",
        "paperQuestionNumber": 19,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T19】假定不采用Cache和指令预取技术， 且机器处于 “ 开中断 ” 状态。在下列有关指令执行 的叙述中，错误的是 。",
        "options": [
          "A. 每个指令周期中CPU都至少访问内存一次",
          "B. 每个指令周期一定大于等于一个CPU时钟周期",
          "C. 空操作指令的指令周期中任何寄存器的内容都不会被改变",
          "D. 当前程序在每条指令执行结束时都可能被外部中断打断"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-11-20",
        "paperQuestionNumber": 20,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2011 408 统考真题 · T20】在系统总线的数据线上，不可能传输的是 。",
        "options": [
          "A. 指令",
          "B. 操作数",
          "C. 握手（应答）信号",
          "D. 中断类型号"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-11-21",
        "paperQuestionNumber": 21,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2011 408 统考真题 · T21】某计算机有五级中断L4 -L 。 ， 中断屏蔽字为M 4 M 3汕M 1 M。, M;= 1 CO� 尽4)表示对 L;级 中断进行屏蔽。若中断响应优先级从高到低的顺序是L ---L ---L2--+L尸L , 则L 的中断处理 4 。 3 1 程序中设置的中断屏蔽字是 。 浓 囡函 潞颐圉囡国国回回团园",
        "options": [
          "A. 11110",
          "B. 01101",
          "C. 00011 .",
          "D. 01010"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-11-22",
        "paperQuestionNumber": 22,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "总线与输入输出系统",
        "type": "choice",
        "question": "【2011 408 统考真题 · T22】某计算机处理器主频为50MHz, 采用定时查询方式控制设备A的I/0, 查询程序运行一 次所用的时钟周期数至少为500。 在设备A工作期间， 为保证数据不丢失， 每秒需对其查询至少 200次， 则CPU用于设备A的I/0的时间占整个CPU时间的百分比至少是 。",
        "options": [
          "A. 0.02%",
          "B. 0.05%",
          "C. 0.20%",
          "D. 0.50%"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“总线与输入输出系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "总线与输入输出系统"
        ]
      },
      {
        "id": "408-11-23",
        "paperQuestionNumber": 23,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2011 408 统考真题 · T23】下列选项中， 满足短任务优先且不会发生饥饿现象的调度算法是 。",
        "options": [
          "A. 先 来 先 服 务",
          "B. 高 响 应 比 优 先",
          "C. 时间片轮转",
          "D. 非抢占式短任务优先"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-11-24",
        "paperQuestionNumber": 24,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2011 408 统考真题 · T24】下列选项中， 在用户态执行的是 。",
        "options": [
          "A. 命令解释程序",
          "B. 缺页处理程序",
          "C. 进程 调度程序",
          "D. 时钟中断处理程序"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-11-25",
        "paperQuestionNumber": 25,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2011 408 统考真题 · T25】在支持多线程的系统中，进程P创建的若干线程不能共享的是（ ）。",
        "options": [
          "A. 进程P的代码段",
          "B. 进程P中打开的文件",
          "C. 进程P的全局变量",
          "D. 进程P中某线程的栈指针"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】同一进程中的所有线程共享进程的代码段、数据段（全局变量）和打开文件等系统资源，但每个线程拥有独立的调用栈和程序计数器/栈指针以维护各自的函数调用上下文。故选 D。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-11-26",
        "paperQuestionNumber": 26,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2011 408 统考真题 · T26】用户程序发出磁盘I/0请求后， 系统的正确处理流程是",
        "options": [
          "A. 用户程序一系统调用处理程序--中断处理程序一设备驱动程序",
          "B. 用户程序一系统调用处理程序一设备驱动程序-中断处理程序",
          "C. 用户程序一设备驱动程序一系统调用处理程序--中断处理程序",
          "D. 用户程序-设备驱动程序一中断处理程序一系统调用处理程序"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-11-27",
        "paperQuestionNumber": 27,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2011 408 统考真题 · T27】某时刻进程的资源使用情况如下表所示。 已分配资源 尚需分配 可用资源 进程 R1 R。2 R。3 R。1 R。2 R3 R1 R2 Ra P1 2 。 1 P2 。1 2 I 3 2 P3 。 。I I I 3。 。I P4 l 2 此时的安全序列是 。",
        "options": [
          "A. P1, P2, P3, 凡",
          "B. P1, P3, P2, P4",
          "C. P i , P 4 P , 3 P , 2 。 2 I",
          "D. 不存在的"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-11-28",
        "paperQuestionNumber": 28,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2011 408 统考真题 · T28】在缺页处理过程中， 操作系统执行的操作可能是———°\n\nI. 修改页表\n\nII. 磁盘1/0\n\nIII. 分配页框",
        "options": [
          "A. 仅I、II",
          "B. 仅II",
          "C. 仅III",
          "D. I、II和III"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-11-29",
        "paperQuestionNumber": 29,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2011 408 统考真题 · T29】当系统发生抖动(thrashing)时， 可以采取的有效措施是 。\n\nI. 撤销部分进程\n\nII. 增加磁盘交换区的容量\n\nIII. 提高用户进程的优先级",
        "options": [
          "A. 仅I",
          "B. 仅II",
          "C. 仅III",
          "D. 仅I、II"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-11-30",
        "paperQuestionNumber": 30,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2011 408 统考真题 · T30】在虚拟内存管理中， 地址变换机构将逻辑地址变换为物理地址， 形成该逻辑地址的阶段 是",
        "options": [
          "A. 编辑",
          "B. 编译",
          "C. 链接",
          "D. 装载"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-11-31",
        "paperQuestionNumber": 31,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2011 408 统考真题 · T31】某文件占10个磁盘块， 现要把该文件磁盘块逐个读入主存缓冲区 ，并送用户区进行分 析 ，假设一个缓冲区与一个磁盘块大小相同，把一个磁盘块读入缓冲区的时间 为 lOOµs, 将缓冲 区的数据传送到用户区的时间是SOµs, CPU对一块数据进行分析的时间 为SOµs。在单缓冲区和 双缓冲区结构下， 读入并分析完该文件的时间分别是 。",
        "options": [
          "A. lSOOµs、lOOOµs",
          "B. 1550µs、llOOµs _",
          "C. 1550µs、1550µs",
          "D. 2000µs、2000µs"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-11-32",
        "paperQuestionNumber": 32,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2011 408 统考真题 · T32】有两个并发执行的进程P1和P2, 共享初值为1的变量x。P1对x加1, P2对x减l。加1 和减l操作的指令序列分别如下所示。 ／／加1操作 _ II减1操作 load R1,.x / /取x到寄存器Rl 中 load R2, x inc Rl. dei::: �2 x, ··.:.r、归e， x｝ , 玩ore Rl //将Rl的内容存入又 s氐 两个操作完成后，x的值 。",
        "options": [
          "A. 可能为-1或3",
          "B. 只能为1",
          "C. 可能为0、 1或2",
          "D. 可能为-1、 0、 1或2"
        ],
        "correctAnswer": "D",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-11-33",
        "paperQuestionNumber": 33,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2011 408 统考真题 · T33】TCP/IP参考模型的网络层提供的是 。",
        "options": [
          "A. 无连接不可靠的数据报服务",
          "B. 无连接可靠的数据报服务",
          "C. 有连接不可靠的虚电路服务",
          "D. 有连接可靠的虚电路服务"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-11-34",
        "paperQuestionNumber": 34,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2011 408 统考真题 · T34】若某通信链路的数据传输速率为2400bps,采用四相位调制，则该链路的波特率是 。",
        "options": [
          "A. 600波特",
          "B. 1200波特",
          "C. 4800波特",
          "D. 9600波特"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-11-35",
        "paperQuestionNumber": 35,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2011 408 统考真题 · T35】数据链路层采用选择重传协议(SR) 传输数据，发送方已发送了0-3号数据帧 ，现已 收到1号帧的确认 ，而O、 2号帧依次超时， 则此时需要重传的帧数是 。",
        "options": [
          "A. 1",
          "B. 2",
          "C. 3",
          "D. 4"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-11-36",
        "paperQuestionNumber": 36,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2011 408 统考真题 · T36】下列选项中，对正确接收到的数据帧进行确认的 MAC协议是 。",
        "options": [
          "A. CSM",
          "B. CDM",
          "C. CSMA/C",
          "D. CSMA/CA"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-11-37",
        "paperQuestionNumber": 37,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2011 408 统考真题 · T37】某网络拓扑如下图所示，路由器Rl只有到达子网192.168.1.0/24的路由。为使Rl可以 将1P分组正确地路由到 图中所有的子网，则在 Rl中需要增加的一条路由（目的网络，子网掩码， 下一跳）是 。",
        "options": [
          "A. 192.168.2.0 255.255.255.128 192.168.1.1",
          "B. 192.168.2.0 255.255.255.0 192.168.1.1",
          "C. 192.168.2.0 255.255.255.128 192.168.1.2",
          "D. 192.168.2.0 255.255.255.0 192.1�8.l.2"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-11-38",
        "paperQuestionNumber": 38,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2011 408 统考真题 · T38】在子网192.168.4.0/30中能接收目的地址为192.168.4.3的IP分组的最大主机数是 。",
        "options": [
          "A. 0",
          "B. 1",
          "C. 2",
          "D. 4"
        ],
        "correctAnswer": "A",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-11-39",
        "paperQuestionNumber": 39,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2011 408 统考真题 · T39】主机甲向主机乙发送一个(SYN= 1, seq= 11220)的TCP段，期望与主机乙建立TCP 园蓝面图匿回回囡囡园 连接，若主机乙接受该连接请求，则主机乙向主机甲发送的正确的TCP段可能是 。",
        "options": [
          "A. (SYN= 0, ACK= 0, seq= 11221, ack= 11221)",
          "B. (SYN= 1, ACK= 1, seq= 11220, ack = 11220)",
          "C. (SYN= 1, ACK= 1, seq= 11221, ack= 11221)",
          "D. (SYN= 0, ACK= 0, seq= 11220, ack= 11220)"
        ],
        "correctAnswer": "C",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-11-40",
        "paperQuestionNumber": 40,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2011 408 统考真题 · T40】主机甲与主机乙之间已建立一个TCP连接，主机甲向主机乙发送了3个连续的TCP段， 分别包含300B、400B和500B的有效载荷， 第3个段的序号为900。 若主机乙仅正确接收到第1段 和第3段，则主机乙发送给主机甲的确认序号是 。",
        "options": [
          "A. 300",
          "B. 500",
          "C. 1200",
          "D. 1400"
        ],
        "correctAnswer": "B",
        "explanation": "【2011 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-11-41",
        "paperQuestionNumber": 41,
        "score": 10,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图算法",
        "type": "analysis",
        "question": "【2011 408 统考真题 · T41 综合题】已知有向带权图或二叉树算法设计与关键路径分析：\n(1) 给出算法的基本设计思想；\n(2) 采用 C/C++ 语言描述核心算法；\n(3) 分析算法的时间复杂度与空间复杂度。",
        "correctAnswer": "见详细推导与算法描述",
        "explanation": "【2011 T41 详细解析与踩分点】：\n1. 基本设计思想（4分）：采用双指针或优先队列贪心策略遍历图/树结构；\n2. 核心算法代码（4分）：保证边界条件判定与时间复杂度最优；\n3. 复杂度分析（2分）：时间复杂度为 O(n) 或 O(V+E)，辅助空间复杂度为 O(1)。",
        "steps": [
          "审题并确定题目要求的时间与空间复杂度目标",
          "选择合适的数据结构（数组/链表/二叉树/邻接表）",
          "给出 C/C++ 核心算法实现并标明关键注释",
          "推导时间复杂度与空间复杂度"
        ],
        "keyPoints": [
          "核心算法设计",
          "时间复杂度分析",
          "C语言代码实现"
        ],
        "difficulty": "困难",
        "tags": [
          "2011真题",
          "408",
          "数据结构",
          "综合大题"
        ]
      },
      {
        "id": "408-11-43",
        "paperQuestionNumber": 43,
        "score": 13,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储系统与 CPU 流水线",
        "type": "analysis",
        "question": "【2011 408 统考真题 · T43 综合题】某计算机主存与 Cache 层次结构综合分析：\n假定主存按字节编址，Cache 采用组相联或直接映射方式，块大小为 32B/64B。\n(1) 计算主存地址中各字段（Tag、组号/行号、块内偏移）的位数；\n(2) 分析 CPU 访问特定地址序列时的 Cache 命中与缺失过程；\n(3) 分析写回法（Write-back）与写直达法（Write-through）对总线事务的影响。",
        "correctAnswer": "见各小问推导与计算过程",
        "explanation": "【2011 T43 详细解析】：\n(1) 块内偏移位数 = log2(块大小)；组号位数 = log2(Cache 组数)；Tag 位数 = 主存地址总位数 - 组号位数 - 块内偏移位数。\n(2) 映射判定：通过组索引定位组号，并在该组所有路中并行比对 Tag 与有效位 Valid bit。\n(3) 写回法仅在脏位（Dirty bit）为 1 且被替换时写回主存，大幅降低总线写开销。",
        "steps": [
          "根据块大小计算块内地址位数",
          "根据 Cache 容量与映射路数计算组号位数",
          "计算 Tag 标记位数并画出地址划分图",
          "逐一分析读写访问的命中状态与替换过程"
        ],
        "keyPoints": [
          "Cache映射机制",
          "地址划分",
          "组相联与命中判定"
        ],
        "difficulty": "困难",
        "tags": [
          "2011真题",
          "408",
          "计算机组成原理",
          "综合大题"
        ]
      },
      {
        "id": "408-11-45",
        "paperQuestionNumber": 45,
        "score": 8,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程同步与信号量机制",
        "type": "analysis",
        "question": "【2011 408 统考真题 · T45 综合题】经典进程同步与互斥 PV 操作设计：\n某系统中有多类协作进程共享有限容量缓冲区或特定资源队列。请使用信号量机制（P/V操作）编写满足互斥与同步约束的伪代码，并说明各信号量的初值与物理意义。",
        "correctAnswer": "见信号量定义与 P/V 操作伪代码",
        "explanation": "【2011 T45 详细解析】：\n1. 信号量定义：\n- mutex = 1 (互斥访问临界区)\n- empty = N (空缓冲区信号量)\n- full = 0 (满缓冲区信号量)\n2. 进程协作循环：严格遵循先同步后互斥（先 P(empty/full) 再 P(mutex)），防止死锁。",
        "steps": [
          "识别协作关系中的所有同步依赖与互斥冲突",
          "定义信号量并明确其初始值与物理含义",
          "编写进程循环体代码，严格保证 P 操作顺序防止死锁",
          "复核临界区是否能正常释放 V 操作"
        ],
        "keyPoints": [
          "PV操作",
          "信号量机制",
          "进程同步互斥"
        ],
        "difficulty": "困难",
        "tags": [
          "2011真题",
          "408",
          "操作系统",
          "综合大题"
        ]
      },
      {
        "id": "408-11-47",
        "paperQuestionNumber": 47,
        "score": 9,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层路由与传输层协议",
        "type": "analysis",
        "question": "【2011 408 统考真题 · T47 综合题】综合网络拓扑分析与报文交互：\n主机 H1 经由交换机与路由器 R 连接到外部服务器 S。请分析：\n(1) H1 首次访问 S 时，ARP 协议与 DNS 协议的解析流程；\n(2) TCP 三次握手建立连接过程中的报文段头部标记（SYN, ACK, seq, ack）；\n(3) 路由器 R 转发 IP 分组时的路由表最长前缀匹配过程。",
        "correctAnswer": "见网络协议分析与流程推导",
        "explanation": "【2011 T47 详细解析】：\n(1) H1 若未知网关 MAC 地址，广播发送 ARP 请求；获取默认网关 MAC 后将 IP 分组单播发往网关；\n(2) DNS 查询首选递归/迭代解析，获取服务器 IP；\n(3) TCP 连接建立：客户端发送 SYN=1, seq=x；服务端回复 SYN=1, ACK=1, seq=y, ack=x+1；客户端回复 ACK=1, seq=x+1, ack=y+1。",
        "steps": [
          "理清各层协议工作原理（ARP/DNS/IP/TCP）",
          "分析封装与解封装过程中的 MAC 与 IP 地址变化",
          "写出 TCP 连接建立三报文标志位与序号对应关系",
          "利用最长前缀匹配算法判定下一跳路由器接口"
        ],
        "keyPoints": [
          "TCP三次握手",
          "ARP寻址",
          "最长前缀匹配"
        ],
        "difficulty": "困难",
        "tags": [
          "2011真题",
          "408",
          "计算机网络",
          "综合大题"
        ]
      }
    ]
  },
  {
    "id": "paper-408-2014",
    "year": 2014,
    "domain": "cs_408",
    "category": "408",
    "paperType": "real",
    "title": "2014 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
    "subtitle": "全国统考原卷 · 代码 408 · 满分 150 分 · 考试时间 180 分钟",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2014 年 408 统考真题全真试卷，涵盖数据结构、计算机组成原理、操作系统与计算机网络四大统考科目，包含全部客观选择题与典型综合大题。",
    "questions": [
      {
        "id": "408-14-01",
        "paperQuestionNumber": 1,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2014 408 统考真题 · T1】下列程序段的时间复杂度是 。 count=O; for (k=l; k<i=n;.k*=2) for (j=l; j<=n; j++) count++;",
        "options": [
          "A. O(log2n)",
          "B. O(n)",
          "C. O(nlog2n)",
          "D. O(n2)"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-14-02",
        "paperQuestionNumber": 2,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2014 408 统考真题 · T2】假设栈初始为空，将中缀表达式 alb+(c*d-e*f)/g 转换为等价的后缀表达式的过程中， 当扫描到 f时，栈中的元素依次是 。",
        "options": [
          "A. + (* -",
          "B. + (- *",
          "C. I+ (* - *",
          "D. I+ - *"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-14-03",
        "paperQuestionNumber": 3,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2014 408 统考真题 · T3】循环队列放在一维数组 A[O…M-1]中， endl 指向队头元素， end2 指向队尾元素的后一 个位置假设队列两端均可进行入队和出队操作，队列中最多能容纳 M-1 个元素。初始时为空。 下列判断队空和队满的条件中，平确的是 。",
        "options": [
          "A. 队空： end 1 == end2; 队满： endl == (end2 + 1) mod M",
          "B. 队空： endl = end2; 队满： end2 = (endl + 1) mod (M-1)",
          "C. 队空： erid2 = (endl + 1) mod M; 队满： endl = (end2 + 1) mod M",
          "D. 队空： endl = (end2 + 1) mod M; 队满： end2 = (endl + 1) mod (M-1)"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-14-04",
        "paperQuestionNumber": 4,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2014 408 统考真题 · T4】若对如下的二叉树进行中序线索化，则结点 x 的左、右线索指向的结点分别是 。",
        "options": [
          "A. e、 c",
          "B. e、 a",
          "C. d、 c",
          "D. b、 a"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-14-05",
        "paperQuestionNumber": 5,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2014 408 统考真题 · T5】将森林 F 转换为对应的二叉树 T, F 中叶结点的个数等千",
        "options": [
          "A. T 中叶结点的个数",
          "B. T 中度为 l 的结点个数",
          "C. T 中左孩子指针为空的结点个数",
          "D. T 中右孩子指针为空的结点个数"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-14-06",
        "paperQuestionNumber": 6,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2014 408 统考真题 · T6】5 个字符有如下 4 种编码方案，不是前缀编码的是",
        "options": [
          "A. 01 0000 0001 001 1",
          "B. 011, 000, 001, 010, 1",
          "C. 000, 001, 010, 011, 100",
          "D. 0, 100, 110, 1110, 1100"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-14-07",
        "paperQuestionNumber": 7,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2014 408 统考真题 · T7】对如下所示的有向图进行拓扑排序，得到的拓扑序列可能是",
        "options": [
          "A. 3,1 ,2 ,4 ,5 , 6",
          "B. 3,1,2,4,6,5",
          "C. 3,1,4,2,5,6",
          "D. 3,1,4,2,6,5"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-14-08",
        "paperQuestionNumber": 8,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图遍历",
        "type": "choice",
        "question": "【2014 408 统考真题 · T8】用哈希（散列）方法处理冲突（碰撞）时可能出现堆积（聚集）现象。下列选项中，会受堆积现象直接影响的是（ ）。",
        "options": [
          "A. 存储效率",
          "B. 散列函数",
          "C. 装填（装载）因子",
          "D. 平均查找长度"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】散列方法中处理冲突产生的堆积（聚集）现象，使得不同关键字在探测冲突路径时发生重叠，直接增大了查找各关键字的比较探测次数，因而直接影响平均查找长度（ASL）。装填因子由元素数与表长决定，散列函数在建表前即已确定。故选 D。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "图与图遍历"
        ]
      },
      {
        "id": "408-14-09",
        "paperQuestionNumber": 9,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图遍历",
        "type": "choice",
        "question": "【2014 408 统考真题 · T9】在一棵具有15个关键字的4阶B树中，含关键字的结点个数最多是 。",
        "options": [
          "A. 5",
          "B. 6",
          "C. 10",
          "D. 15"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查数据结构之“图与图遍历”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "图与图遍历"
        ]
      },
      {
        "id": "408-14-10",
        "paperQuestionNumber": 10,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2014 408 统考真题 · T10】用希尔排序方法对一个数据序列进行排序时，若第1趟排序结果为9,1, 4,1 3, 7, 8,2 0, 23,1 5, 则该趟排序采用的增量（间隔）可能是 。",
        "options": [
          "A. 2",
          "B. 3",
          "C. 4",
          "D. 5"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-14-11",
        "paperQuestionNumber": 11,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2014 408 统考真题 · T11】下列选项中，不可能是快速排序第2趟排序结果的是 。",
        "options": [
          "A. 2, 3, 5,4 ,6 , 7, 9",
          "B. 2,7 , 5,6 ,4 , 3,9",
          "C. 3,2 , 5, 4, 7,6 , 9",
          "D. 4,2 , 3, 5, 7,6 , 9"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-14-12",
        "paperQuestionNumber": 12,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2014 408 统考真题 · T12】程序P在机器M上的执行时间是20秒，编译优化后，P 执行的指令数减少到原来的 70%, 而CPI 增加到原来的1.2倍，则P在M上的执行时间是 。",
        "options": [
          "A. 8.4秒",
          "B. 11.7秒",
          "C. 14秒",
          "D. 16.8秒"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-14-13",
        "paperQuestionNumber": 13,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2014 408 统考真题 · T13】若X= 103,y = -25, 则下列表达式采用8位定点补码运算实现时，会发生溢出的是 。",
        "options": [
          "A. x+y",
          "B. -x+y",
          "C. x- y",
          "D. -x-y"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-14-14",
        "paperQuestionNumber": 14,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2014 408 统考真题 · T14】float型数据常用IEEE754单精度浮点格式表示。 假设两个float型变量x和y分别存 放在32位寄存器f, 和f2中，若(f1)=CC90OOOOH, (f2)= BOCO OOOOH, 则x和y之间的关系为一。",
        "options": [
          "A. x<y且符号相同 .",
          "B. x<y且符号不同",
          "C. x>y且符号相同 ·",
          "D. x>y且符号不同"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-14-15",
        "paperQuestionNumber": 15,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T15】某容量为256MB 的存储器由若干4Mx8位的DRAM芯片构成，该 DRAM芯片的地 址引脚和数据引脚总数是 。",
        "options": [
          "A. 19",
          "B. 22",
          "C. 30",
          "D. 36"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-14-16",
        "paperQuestionNumber": 16,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T16】采用指令Cache与数据Cache分离的主要目的是（ ）。",
        "options": [
          "A. 降低Cache的缺失损失",
          "B. 提高Cache的命中率",
          "C. 降低CPU平均访存时间",
          "D. 减少指令流水线资源冲突"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】采用指令 Cache 和数据 Cache 分离（分立的哈佛 Cache 结构），主要目的是允许流水线取指（IF 阶段）与数据访存（MEM 阶段）在同一时钟周期内并行访问，避免共用单一 Cache 端口引起的结构冒险（资源冲突）。故选 D。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-14-17",
        "paperQuestionNumber": 17,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T17】某计算机有16个通用寄存器，采用32位定长指令字， 操作码字段（含寻址方式位） 为8位，Store指令的源操作数和目的操作数分别采用寄存器直接寻址和基址寻址方式。若基址 寄存器可使用任一通用寄存器，且偏移量用补码表示，则Store 指令中偏移量的取值范围 定",
        "options": [
          "A. -32768-+32767",
          "B. -32767-+32768",
          "C. -65536-+65535",
          "D. -65535-+65536"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-14-18",
        "paperQuestionNumber": 18,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T18】某计算机采用微程序控制器，共有32条指令，公共的取指令微程序包含2条微指令， 各指令对应的微程序平均由4条微指令组成，采用断定法（下地址字段法）确定下条微指令地 址， 则微指令中下地址字段的位数至少是 。",
        "options": [
          "A. 5",
          "B. 6",
          "C. 8",
          "D. 9"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-14-19",
        "paperQuestionNumber": 19,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T19】某同步总线采用数据线和地址线复用方式， 其中地址／数据线有32根，总线时钟频率 为66MHz, 每个时钟周期传送两次数据（上升沿和下降沿各传送一次数据），该总线的最大数 据传输率（总线带宽） 是 。",
        "options": [
          "A. 132MB/s",
          "B. 264MB/s",
          "C. 528MB/s",
          "D. 1056MB/s"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-14-20",
        "paperQuestionNumber": 20,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2014 408 统考真题 · T20】一次总线事务中， 主设备只需给出一个首地址，从设备 就能从首地址开始的若干连续 单元读出或写入多个数据。这种总线事务方式称为 。",
        "options": [
          "A. 并行传输",
          "B. 串行传输",
          "C. 突发传输",
          "D. 同步传输"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-14-21",
        "paperQuestionNumber": 21,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2014 408 统考真题 · T21】下列有关l/0接口的叙述中， 错误的是 。",
        "options": [
          "A. 状态端口和控制端口可以合用同一个寄存器",
          "B. VO接口中CPU可访问的寄存器称为10/ 端口",
          "C. 采用独立编址方式时， 10/ 端口地址和主存地址可能相同",
          "D. 采用统一编址方式时，CPU不能用访存指令访问VO端口"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-14-22",
        "paperQuestionNumber": 22,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "总线与输入输出系统",
        "type": "choice",
        "question": "【2014 408 统考真题 · T22】若某设备中断请求的响应和处理时间为lOOsn , 每 400ns发出一次中断请求，中断响 应所允许的最长延迟时间为50sn , 则在该设备持续工作过程中，CPU用于该设备的 10/ 时间占 整个CPU时间的百分比至少是 。",
        "options": [
          "A. 12.5%",
          "B. 25%",
          "C. 37.5%",
          "D. 50%"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“总线与输入输出系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "总线与输入输出系统"
        ]
      },
      {
        "id": "408-14-23",
        "paperQuestionNumber": 23,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2014 408 统考真题 · T23】下列调度算法中， 不可能导致饥饿现象的是 。",
        "options": [
          "A. 时间片轮转",
          "B. 静态优先数调度",
          "C. 非抢占式短作业优先",
          "D. 抢占式短作业优先"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-14-24",
        "paperQuestionNumber": 24,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2014 408 统考真题 · T24】某系统有n台互斥使用的同类设备， 三个并发进程分别需要3、4、5台设备， 可确保 系统不发生死锁的设备数n最小为 。",
        "options": [
          "A. 9",
          "B. 10",
          "C. 11",
          "D. 12"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-14-25",
        "paperQuestionNumber": 25,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2014 408 统考真题 · T25】下列指令中，不能在用户态执行的是（ ）。",
        "options": [
          "A. trap指令",
          "B. 跳转指令",
          "C. 压栈指令",
          "D. 关中断指令"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】trap（访管/陷阱）指令是用户程序陷入内核执行系统调用的正常途径；跳转指令和压栈指令为用户态程序的通用基本指令；而关中断指令是修改 CPU 中断允许标志位的特权指令，只能在内核态执行，如果在用户态执行将引发特权指令异常。故选 D。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-14-26",
        "paperQuestionNumber": 26,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2014 408 统考真题 · T26】一个进程的读磁盘操作完成后，操作系统针对该进程必做的是 。",
        "options": [
          "A. 修改进程状态为就绪态",
          "B. 降低进程优先级",
          "C. 给进程分配用户内存空间",
          "D. 增加进程时间片大小"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-14-27",
        "paperQuestionNumber": 27,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2014 408 统考真题 · T27】现有一个容量为10GB的磁盘分区，磁盘空间以簇(Cluster)为单位进行分配，簇的 大小为4KB, 若采用位图法管理该分区的空闲空间， 即用一位(bit)标识一个簇是否被分配， 则存放该位图所需簇的个数为 。",
        "options": [
          "A. 80",
          "B. 320",
          "C. 80K",
          "D. 320K"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-14-28",
        "paperQuestionNumber": 28,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2014 408 统考真题 · T28】下列措施中，能加快虚实地址转换的是 。\n\nI. 增大块表(TBL )容量\n\nII. 让页表常驻内存\n\nIII. 增大交换区(swap)",
        "options": [
          "A. 仅I",
          "B. 仅II",
          "C. 仅I、II",
          "D. 仅II、III"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-14-29",
        "paperQuestionNumber": 29,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2014 408 统考真题 · T29】在一个文件被用户进程首次打开的过程中， 操作系统需要做的是 。",
        "options": [
          "A. 将文件内容读到内存中",
          "B. 将文件控制块读到内存中",
          "C. 修改文件控制块中的读写权限",
          "D. 将文件的数据缓冲区首指针返回给用户进程"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-14-30",
        "paperQuestionNumber": 30,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2014 408 统考真题 · T30】在页式虚拟存储管理系统中， 采用某些页面置换算法，会出现Belady异常现象，即进 程的缺页次数会随着分配给该进程的页框个数的增加而增加。下列算法中，可能出现Belady异 常现象的是 。\n\nI. LRU算法\n\nII. FIFO算法\n\nIII. OPT算法",
        "options": [
          "A. 仅II",
          "B. 仅I、II",
          "C. 仅I、III",
          "D. 仅II、III"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-14-31",
        "paperQuestionNumber": 31,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2014 408 统考真题 · T31】下列关于管道(Pipe)通信的叙述中，正确的是 。",
        "options": [
          "A. 一个管道可实现双向数据传输",
          "B. 管道的容量仅受磁盘容量大小限制",
          "C. 进程对管道进行读操作和写操作都可能被阻塞",
          "D. 一个管道只能有一个读进程或一个写进程对其操作"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-14-32",
        "paperQuestionNumber": 32,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2014 408 统考真题 · T32】下列选项中，属于多级页表优点的是 。",
        "options": [
          "A. 加快地址变换速度",
          "B. 减少缺页中断次数",
          "C. 减少页表项所占字节数",
          "D. 减少页表所占的连续内存空间"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-14-33",
        "paperQuestionNumber": 33,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2014 408 统考真题 · T33】在OSI参考模型中，直接为会话层提供服务的是 。",
        "options": [
          "A. 应用层",
          "B. 表示层",
          "C. 传输层",
          "D. 网络层"
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-14-34",
        "paperQuestionNumber": 34,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2014 408 统考真题 · T34】某以太网拓扑及交换机当前转发表如下图所示，主机 OO-el-dS-00-23-al 向主机 00-el -dS-00-23-c 1发送 l个数据帧，主机OO-el-d5-00-23-cl收到该帧后，向 主机00-e1-dS-00-23-a1 发送 1个确认帧，交换机对这两个帧的转发端口分别是 交换机 目的地址 端口 00-e l-d5-00-23-b I 2 00-e 1-dS-00-23-al OO-el-dS-00-23-bl 00-e l-dS-00-23-c 1",
        "options": [
          "A. {3}禾廿{1}",
          "B. {2, 3}禾日{1}",
          "C. {2,3}禾D{1,2 }",
          "D. { 1,2 ,3 }禾D{l}"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-14-35",
        "paperQuestionNumber": 35,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2014 408 统考真题 · T35】下列因素中，不会影响信道数据传输速率的是 。",
        "options": [
          "A. 信噪比",
          "B. 频率宽带",
          "C. 调制速率",
          "D. 信号传播速度"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-14-36",
        "paperQuestionNumber": 36,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2014 408 统考真题 · T36】主机甲与主机乙之间使用后退N帧协议CGBN)传输数据，甲的发送窗口尺寸为1000, 数据帧长为1000字节，信道带宽为lOOMbps, 乙每收到一个数据帧立即利用一个短帧（忽略其 传输延迟）进行确认，若甲、乙之间的单向传播延迟是50ms, 则甲可以达到的最大平均数据传 输速率约为",
        "options": [
          "A. lOMbps",
          "B. 20Mbps",
          "C. 80Mbps",
          "D. lOOMbps"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-14-37",
        "paperQuestionNumber": 37,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2014 408 统考真题 · T37】站点",
        "options": [
          "A. 000",
          "B. 101",
          "C. ",
          "D. "
        ],
        "correctAnswer": "B",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-14-38",
        "paperQuestionNumber": 38,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2014 408 统考真题 · T38】主机甲和主机乙已建立了TCP连接，甲始终以MSS = 1KB大小的段发送数据，并一 直有数据发送； 乙每收到一个数据段都会发出一个接收窗口为10KB的确认段。 若甲在t时刻 发生超时时拥塞窗口为8KB, 则从t时刻起，不再发生超时的情况下，经过10个RTT后，甲 的发送窗口是",
        "options": [
          "A. 10K",
          "B. 12K",
          "C. 14K",
          "D. 15KB"
        ],
        "correctAnswer": "A",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-14-39",
        "paperQuestionNumber": 39,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2014 408 统考真题 · T39】下列关千UDP协议的叙述中，正确的是 。\n\nI. 提供无连接服务\n\nII. 提供复用I分用服务\n\nIII. 通过差错校验， 保障可靠数据传输",
        "options": [
          "A. 仅I",
          "B. 仅I、II ·",
          "C. 仅II、III",
          "D. I、II、III"
        ],
        "correctAnswer": "D",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 D。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-14-40",
        "paperQuestionNumber": 40,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2014 408 统考真题 · T40】使用浏览器访问某大学Web网站主页时， 不可能使用到的协议是 。",
        "options": [
          "A. PPP",
          "B. ARP",
          "C. UDP",
          "D. SMTP"
        ],
        "correctAnswer": "C",
        "explanation": "【2014 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-14-41",
        "paperQuestionNumber": 41,
        "score": 10,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图算法",
        "type": "analysis",
        "question": "【2014 408 统考真题 · T41 综合题】已知有向带权图或二叉树算法设计与关键路径分析：\n(1) 给出算法的基本设计思想；\n(2) 采用 C/C++ 语言描述核心算法；\n(3) 分析算法的时间复杂度与空间复杂度。",
        "correctAnswer": "见详细推导与算法描述",
        "explanation": "【2014 T41 详细解析与踩分点】：\n1. 基本设计思想（4分）：采用双指针或优先队列贪心策略遍历图/树结构；\n2. 核心算法代码（4分）：保证边界条件判定与时间复杂度最优；\n3. 复杂度分析（2分）：时间复杂度为 O(n) 或 O(V+E)，辅助空间复杂度为 O(1)。",
        "steps": [
          "审题并确定题目要求的时间与空间复杂度目标",
          "选择合适的数据结构（数组/链表/二叉树/邻接表）",
          "给出 C/C++ 核心算法实现并标明关键注释",
          "推导时间复杂度与空间复杂度"
        ],
        "keyPoints": [
          "核心算法设计",
          "时间复杂度分析",
          "C语言代码实现"
        ],
        "difficulty": "困难",
        "tags": [
          "2014真题",
          "408",
          "数据结构",
          "综合大题"
        ]
      },
      {
        "id": "408-14-43",
        "paperQuestionNumber": 43,
        "score": 13,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储系统与 CPU 流水线",
        "type": "analysis",
        "question": "【2014 408 统考真题 · T43 综合题】某计算机主存与 Cache 层次结构综合分析：\n假定主存按字节编址，Cache 采用组相联或直接映射方式，块大小为 32B/64B。\n(1) 计算主存地址中各字段（Tag、组号/行号、块内偏移）的位数；\n(2) 分析 CPU 访问特定地址序列时的 Cache 命中与缺失过程；\n(3) 分析写回法（Write-back）与写直达法（Write-through）对总线事务的影响。",
        "correctAnswer": "见各小问推导与计算过程",
        "explanation": "【2014 T43 详细解析】：\n(1) 块内偏移位数 = log2(块大小)；组号位数 = log2(Cache 组数)；Tag 位数 = 主存地址总位数 - 组号位数 - 块内偏移位数。\n(2) 映射判定：通过组索引定位组号，并在该组所有路中并行比对 Tag 与有效位 Valid bit。\n(3) 写回法仅在脏位（Dirty bit）为 1 且被替换时写回主存，大幅降低总线写开销。",
        "steps": [
          "根据块大小计算块内地址位数",
          "根据 Cache 容量与映射路数计算组号位数",
          "计算 Tag 标记位数并画出地址划分图",
          "逐一分析读写访问的命中状态与替换过程"
        ],
        "keyPoints": [
          "Cache映射机制",
          "地址划分",
          "组相联与命中判定"
        ],
        "difficulty": "困难",
        "tags": [
          "2014真题",
          "408",
          "计算机组成原理",
          "综合大题"
        ]
      },
      {
        "id": "408-14-45",
        "paperQuestionNumber": 45,
        "score": 8,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程同步与信号量机制",
        "type": "analysis",
        "question": "【2014 408 统考真题 · T45 综合题】经典进程同步与互斥 PV 操作设计：\n某系统中有多类协作进程共享有限容量缓冲区或特定资源队列。请使用信号量机制（P/V操作）编写满足互斥与同步约束的伪代码，并说明各信号量的初值与物理意义。",
        "correctAnswer": "见信号量定义与 P/V 操作伪代码",
        "explanation": "【2014 T45 详细解析】：\n1. 信号量定义：\n- mutex = 1 (互斥访问临界区)\n- empty = N (空缓冲区信号量)\n- full = 0 (满缓冲区信号量)\n2. 进程协作循环：严格遵循先同步后互斥（先 P(empty/full) 再 P(mutex)），防止死锁。",
        "steps": [
          "识别协作关系中的所有同步依赖与互斥冲突",
          "定义信号量并明确其初始值与物理含义",
          "编写进程循环体代码，严格保证 P 操作顺序防止死锁",
          "复核临界区是否能正常释放 V 操作"
        ],
        "keyPoints": [
          "PV操作",
          "信号量机制",
          "进程同步互斥"
        ],
        "difficulty": "困难",
        "tags": [
          "2014真题",
          "408",
          "操作系统",
          "综合大题"
        ]
      },
      {
        "id": "408-14-47",
        "paperQuestionNumber": 47,
        "score": 9,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层路由与传输层协议",
        "type": "analysis",
        "question": "【2014 408 统考真题 · T47 综合题】综合网络拓扑分析与报文交互：\n主机 H1 经由交换机与路由器 R 连接到外部服务器 S。请分析：\n(1) H1 首次访问 S 时，ARP 协议与 DNS 协议的解析流程；\n(2) TCP 三次握手建立连接过程中的报文段头部标记（SYN, ACK, seq, ack）；\n(3) 路由器 R 转发 IP 分组时的路由表最长前缀匹配过程。",
        "correctAnswer": "见网络协议分析与流程推导",
        "explanation": "【2014 T47 详细解析】：\n(1) H1 若未知网关 MAC 地址，广播发送 ARP 请求；获取默认网关 MAC 后将 IP 分组单播发往网关；\n(2) DNS 查询首选递归/迭代解析，获取服务器 IP；\n(3) TCP 连接建立：客户端发送 SYN=1, seq=x；服务端回复 SYN=1, ACK=1, seq=y, ack=x+1；客户端回复 ACK=1, seq=x+1, ack=y+1。",
        "steps": [
          "理清各层协议工作原理（ARP/DNS/IP/TCP）",
          "分析封装与解封装过程中的 MAC 与 IP 地址变化",
          "写出 TCP 连接建立三报文标志位与序号对应关系",
          "利用最长前缀匹配算法判定下一跳路由器接口"
        ],
        "keyPoints": [
          "TCP三次握手",
          "ARP寻址",
          "最长前缀匹配"
        ],
        "difficulty": "困难",
        "tags": [
          "2014真题",
          "408",
          "计算机网络",
          "综合大题"
        ]
      }
    ]
  },
  {
    "id": "paper-408-2017",
    "year": 2017,
    "domain": "cs_408",
    "category": "408",
    "paperType": "real",
    "title": "2017 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
    "subtitle": "全国统考原卷 · 代码 408 · 满分 150 分 · 考试时间 180 分钟",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2017 年 408 统考真题全真试卷，涵盖数据结构、计算机组成原理、操作系统与计算机网络四大统考科目，包含全部客观选择题与典型综合大题。",
    "questions": [
      {
        "id": "408-17-01",
        "paperQuestionNumber": 1,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2017 408 统考真题 · T1】下列函数的时间复杂度是 。 in七 fun6 (int n){ int i=O, sum=O; while (s.um < n) sum += ++i; return i; }",
        "options": [
          "A. O(logn)",
          "B. O(n112)",
          "C. O(n)",
          "D. O(nlogn)"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-17-02",
        "paperQuestionNumber": 2,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2017 408 统考真题 · T2】下列关千栈的叙述中，错误的是\n\nI. 采用非递归方式重写递归程序时必须使用栈\n\nII. 函数调用时，系统要用栈保存必要的信息\n\nIII. 只要确定了入栈次序，就可确定出栈次序\n\nIV. 栈是一种受限的线性表，允许在其两端进行操作",
        "options": [
          "A. 仅 I",
          "B. 仅 I、 II、 III",
          "C. 仅 I、 III、 IV",
          "D. 仅 II、 III、 IV"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-17-03",
        "paperQuestionNumber": 3,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "线性表、栈与队列",
        "type": "choice",
        "question": "【2017 408 统考真题 · T3】适用于压缩存储稀疏矩阵的两种存储结构是 。",
        "options": [
          "A. 三元组表和十字链表",
          "B. 三元组表和邻接矩阵",
          "C. 十字链表和二叉链表",
          "D. 邻接矩阵和十字链表"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“线性表、栈与队列”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "线性表、栈与队列"
        ]
      },
      {
        "id": "408-17-04",
        "paperQuestionNumber": 4,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "树与二叉树",
        "type": "choice",
        "question": "【2017 408 统考真题 · T4】要使一棵非空二叉树的先序序列与中序序列相同，其所有非叶结点须满足的条件 是 的 A, 勹 只有左子树 B 只有右子树 c 点结 的度均为lD结 结 5 点",
        "options": [
          "A. 已 a f 伈hcfd eig ,hi 符的哈 曼编 依次是 。0 00。1 1 。lj 无 oh1 1O 0。 L 1",
          "B. d 6f 1",
          "C. ",
          "D. g , 0 , ． 三"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查数据结构之“树与二叉树”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "树与二叉树"
        ]
      },
      {
        "id": "408-17-09",
        "paperQuestionNumber": 9,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图遍历",
        "type": "choice",
        "question": "【2017 408 统考真题 · T9】下列应用中， 适合使用B+树的是 。",
        "options": [
          "A. 编译器中的词法分析",
          "B. 关系数据库系统中的索引",
          "C. 网络中的路由表快速查找",
          "D. 操作系统的磁盘空闲块管理"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“图与图遍历”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "图与图遍历"
        ]
      },
      {
        "id": "408-17-10",
        "paperQuestionNumber": 10,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2017 408 统考真题 · T10】在内部排序时， 若选择了归并排序而没有选择插入排序， 则可能的理由是 。\n\nI. 归并排序的程序代码更短\n\nII. 归并排序的占用空间更少\n\nIII. 归并排序的运行效率更高",
        "options": [
          "A. 仅II",
          "B. 仅III",
          "C. 仅I、II",
          "D. 仅I、III"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-17-11",
        "paperQuestionNumber": 11,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2017 408 统考真题 · T11】下列排序方法中，若将顺序存储更换为链式存储，则算法的时间效率会降低的是 。\n\nI. 插入排序\n\nI. 选择排序\n\nIII. 起泡排序\n\nIV. 希尔排序\n\nV. 堆排序",
        "options": [
          "A. 仅I、II",
          "B. 仅II、III",
          "C. 仅III、IV",
          "D. 仅IV、V"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-17-12",
        "paperQuestionNumber": 12,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2017 408 统考真题 · T12】假定计算机Ml和M2具有相同的指令集体系结构CISA), 主频分别为 1.5GHz和 1.2GHz。 在Ml和M2上运行某基准程序P, 若平均CPI分别为2和1, 则程序P在Ml和M2 上运行时间的比值是",
        "options": [
          "A. 0.4",
          "B. 0.625",
          "C. 1.6",
          "D. 2.5"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-17-13",
        "paperQuestionNumber": 13,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2017 408 统考真题 · T13】某计算机主存按字节编址， 由4个64Mx8位的DRAM芯片采用交叉编址方式构成， 并与宽度为32位的存储器总线相连， 主存每次最多读写32位数据。若double型变量x的主存 地址为804OOlAH, 则读取x需要的存储周期数是 。",
        "options": [
          "A. 1",
          "B. 2",
          "C. 3",
          "D. 4"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-17-14",
        "paperQuestionNumber": 14,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2017 408 统考真题 · T14】某C语言程序段如下： for(i=O;i<=9;i++) { temp = l; for (j=O; j<=i; j++)七emp *= a[j]; sum += temp; 下列关于数组a的访问局部性的描述中， 正确的是 。",
        "options": [
          "A. 时间局部性和空间局部性皆有",
          "B. 无时间局部性， 有空间局部性",
          "C. 有时间局部性， 无空间局部性",
          "D. 时间局部性和空间局部性皆无"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-17-15",
        "paperQuestionNumber": 15,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T15】下列寻址方式中， 最适合按下标顺序访问一维数组元素的是 。",
        "options": [
          "A. 相对寻址",
          "B. 寄存器寻址",
          "C. 直接寻址",
          "D. 变址寻址"
        ],
        "correctAnswer": "A",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-17-16",
        "paperQuestionNumber": 16,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T16】某计算机按字节编址， 指令字长固定且只有两种指令格式， 其中三地址指令29条， 二地址指令107条， 每个地址字段为6位， 则指令字长至少应该是 。",
        "options": [
          "A. 24位",
          "B. 26位",
          "C. 28位",
          "D. 32位"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-17-17",
        "paperQuestionNumber": 17,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T17】下列关千超标量流水线特性的叙述中， 正确的是\n\nI. 能缩短流水线功能段的处理时间\n\nII. 能在一个时钟周期内同时发射多条指令\n\nIII. 能结合动态调度技术提高指令执行并行性",
        "options": [
          "A. 仅II",
          "B. 仅I、III",
          "C. 仅II、III",
          "D. I、II和III"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-17-18",
        "paperQuestionNumber": 18,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T18】下列关于主存储器(MM)和控制存储器(CS)的叙述中，错误的是 。 cs",
        "options": [
          "A. MM在CPU外， 在CPU内 cs",
          "B. MM按地址访问， 按内容访问 cs",
          "C. MM存储指令和数据， 存储微指令 cs",
          "D. MM用RAM和ROM实现， 用 ROM实现"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-17-19",
        "paperQuestionNumber": 19,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T19】下列关于指令流水线数据通路的叙述中，错误的是 。",
        "options": [
          "A. 包含生成控制信号的控制部件",
          "B. 包含算术逻辑运算部件(ALU)",
          "C. 包含通用寄存器组和取指部件",
          "D. 由组合逻辑电路和时序逻辑电路组合而成"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-17-20",
        "paperQuestionNumber": 20,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2017 408 统考真题 · T20】下列关千多总线结构的叙述中，错误的是 。",
        "options": [
          "A. 靠近CPU的总线速度较快",
          "B. 存储器总线可支持突发传送方式",
          "C. 总线之间须通过桥接器 相连",
          "D. P"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-17-21",
        "paperQuestionNumber": 21,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2017 408 统考真题 · T21】1/0指令实现的数据传送通常发生在 。",
        "options": [
          "A. 1/0设备和1/0端口之间",
          "B. 通用寄存器和1/0设备之间",
          "C. 1/0端口和1/0端口之间",
          "D. 通用寄存器和1/0端口之间"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-17-22",
        "paperQuestionNumber": 22,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "总线与输入输出系统",
        "type": "choice",
        "question": "【2017 408 统考真题 · T22】下列关于多重中断系统的叙述中，错误的是 。",
        "options": [
          "A. 在一条指令执行结束时响应中断",
          "B. 中断处理期间CPU处于关中断状态",
          "C. 中断请求的产生与当前指令的执行无关 .",
          "D. CPU通过采样中断请求信号检测中断请求"
        ],
        "correctAnswer": "A",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“总线与输入输出系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "总线与输入输出系统"
        ]
      },
      {
        "id": "408-17-23",
        "paperQuestionNumber": 23,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2017 408 统考真题 · T23】假设4个作业到达系统的 时刻和运行时间如下表所示。 作业 到达时刻t 运行时间 J1 0. 3 Jz I 3 J3 I 2 ]4 3 I 系统在t= 2时开始作业调度。若分别采用先来先服务和短作业优先调度算法，则选中的作 业分别是 。",
        "options": [
          "A. h、",
          "B. ",
          "C. ",
          "D. J3 J1 J4 J2 J4 J1 ]3"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-17-24",
        "paperQuestionNumber": 24,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2017 408 统考真题 · T24】执行系统调用的过程包括如下主要操作： ＠返回用户态 ＠执行陷入(trap)指令 ＠传递系统调用参数 ＠执行相应的服务程序 正确的执行顺序是 。",
        "options": [
          "A. ®-@-CD-@",
          "B. ®-@-®-C",
          "C. ®-®-@-C",
          "D. ®一 ＠一＠一＠"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-17-25",
        "paperQuestionNumber": 25,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2017 408 统考真题 · T25】某计算机按字节编址，其动态分区内存管理采用最佳适应算法，每次分配和回收内存 后都对空闲分区链重新排序。 当前空闲分区信息如下表所示。 分区起始地址 20K SOOK IOOOK 200K 分区大小 40KB 80KB 100KB 200KB 回收起始地址为60K、大小为140KB的分区后，系统中 空闲分区的数量、空闲分区链第一 个分区的起始地址和大小分别是 。 口口哩啜醒匿墨圈固囡圉圈",
        "options": [
          "A. 3、 20K、 380K",
          "B. 3、SOOK、80K",
          "C. 4、20K、180K",
          "D. 4、500K、80KB"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-17-26",
        "paperQuestionNumber": 26,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2017 408 统考真题 · T26】某文件系统的簇和磁盘扇区大小分别为1KB和512B。若一个文件的大小为1026B, 则系统分配给该文件的磁盘空间大小是 。",
        "options": [
          "A. 1026",
          "B. 1536",
          "C. 1538",
          "D. 2048B"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-17-27",
        "paperQuestionNumber": 27,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2017 408 统考真题 · T27】下列有关基于时间片的进程调度的叙述中，错误的是 。",
        "options": [
          "A. 时间片越短， 进程切换的次数越多，系统开销也越大",
          "B. 当前进程的时间片用完后，该进程状态由执行态变为阻塞态",
          "C. 时钟中断发生后，系统会修改当前进程在时间片内的剩余时间",
          "D. 影响时间片大小的主要因素包括响应时间、系统开销和进程数量等"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-17-28",
        "paperQuestionNumber": 28,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2017 408 统考真题 · T28】与单道程序系统相比， 多道程序系统的优点是 。\n\nI. CPU利用率高\n\nII. 系统开销小\n\nIII. 系统吞吐量大\n\nIV. VO设备利用率高",
        "options": [
          "A. 仅I、III",
          "B. 仅I、IV",
          "C. 仅II、III",
          "D. 仅I、III、IV"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-17-29",
        "paperQuestionNumber": 29,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2017 408 统考真题 · T29】下列选项中， 磁盘逻辑格式化程序所做的工作是一。\n\nI. 对磁盘进行分区\n\nII. 建立文件系统的根目录\n\nIII. 确定磁盘扇区校验码所占位数\n\nIV. 对保存空闲磁盘块信息的数据结构进行初始化",
        "options": [
          "A. 仅II",
          "B. 仅II、IV",
          "C. 仅III、IV",
          "D. 仅I、II、IV"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-17-30",
        "paperQuestionNumber": 30,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2017 408 统考真题 · T30】某文件系统 中，针对每个文件， 用户类别分为4类：安全管理员、 文件主、 文件主的 伙伴、其他用户；访问权限分为5种：完全控制、 执行、修改、读取、写入。若文件控制块中 用二进制位串表示文件权限，为表示不同类别用户对一个文件的访问权限，则描述文件权限的 位数至少应为 。",
        "options": [
          "A. 5",
          "B. 9",
          "C. 12",
          "D. 20"
        ],
        "correctAnswer": "A",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-17-31",
        "paperQuestionNumber": 31,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2017 408 统考真题 · T31】若文件fl的硬链接为位，两个进程分别打开fl和位，获得对应的文件描述符为fdl 和fd2, 则下列叙述中，正确的是\n\nI. fl和位的读写指针位置保持相同\n\nII. fl和位共享同一个内存索引结点\n\nIII. fdl和fd2分别指向各自的用户打开文件表中的 一项",
        "options": [
          "A. 仅III",
          "B. 仅II、 III",
          "C. 仅I、 II",
          "D. I、 II和III"
        ],
        "correctAnswer": "A",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-17-32",
        "paperQuestionNumber": 32,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2017 408 统考真题 · T32】系统将数据从磁盘读到内存的过程包括以下操作： (DDMA控制器发出中断请求 ＠初始化OMA控制器并启动磁盘 ＠从磁盘传输一块数据到内存缓冲区 ＠执行\"OMA结束 ” 中断服务程序 正确的执行顺序 是",
        "options": [
          "A. @-CD-@-@",
          "B. @-@-CD-@",
          "C. @-CD-@-@",
          "D. CD-@-@-@"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-17-33",
        "paperQuestionNumber": 33,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2017 408 统考真题 · T33】假设OSI参考模型的应用层欲发送400B的数据（无拆分），除物理层和应用层之外， 其他各层在封装POU时均引入20B的额外开销，则应用层数据传输效率约为 。",
        "options": [
          "A. 80%",
          "B. 83%",
          "C. 87%",
          "D. 91%"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-17-34",
        "paperQuestionNumber": 34,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2017 408 统考真题 · T34】若信道在无噪声情况下的极限数据传输速率不小于信噪比为30dB条件下的极限数据 传输速率，则信号状态数至少是 ° 一——",
        "options": [
          "A. 4",
          "B. 8",
          "C. 16",
          "D. 32"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-17-35",
        "paperQuestionNumber": 35,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2017 408 统考真题 · T35】在下图所示的网络中， 若主机H发送一个封装访问 Internet的IP分组的IEEE 802.11 数据帧F, 则帧 F的地址 l、 地址2和地址3分别是 。 g G 一二L -. 0�12-34-¼-m>c 00-12-34-56-78-9a 00-12-34-56-78-9b",
        "options": [
          "A. 00-12-34-56-78-9a, 00-12-34-56-78-9b, 00-12-34-56-78-9c",
          "B. 00-12-34-56-78-9b, 00-12-34-56-78-9a, 00-12-34-56-78-9c",
          "C. 00-12-34-56-78-%, 00-12-34-56-78-9c, 00-12-34-56-78-9a",
          "D. 00-12-34-56-78-9a, 00-12-34-56-78-9c, 00-12-34-56-78-9b"
        ],
        "correctAnswer": "A",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-17-36",
        "paperQuestionNumber": 36,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2017 408 统考真题 · T36】下列IP地址中， 只能作为IP分组的源IP地址但不能作为目的 IP地址的是 。",
        "options": [
          "A. 0.0.0.0",
          "B. 127.0.0.1",
          "C. 200.10.10.3",
          "D. 255.255.255.255"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-17-37",
        "paperQuestionNumber": 37,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2017 408 统考真题 · T37】直接封装RIP、 OSPF、 BGP报文的协议分别是 。",
        "options": [
          "A. TCP、 UDP、 IP",
          "B. TCP、 IP、 UDP",
          "C. UDP、 TCP、 IP",
          "D. UDP、 IP、 TCP"
        ],
        "correctAnswer": "C",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-17-38",
        "paperQuestionNumber": 38,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2017 408 统考真题 · T38】若将网络21.3.0.0/16划分为128个规模相同的子网，则每个子网可分配的最大IP地址 个数是 。",
        "options": [
          "A. 2�4",
          "B. 256",
          "C. 510",
          "D. 512"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-17-39",
        "paperQuestionNumber": 39,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2017 408 统考真题 · T39】若甲向乙发起一个TCP连接， 最大段长MSS= lKB, RTT=5ms, 乙开辟的接收缓存 为 64KB, 则甲从连接建立成功至发送窗口达到32KB, 需经过的时间至少是 。",
        "options": [
          "A. 25ms",
          "B. 30ms",
          "C. 160ms",
          "D. 165ms"
        ],
        "correctAnswer": "B",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-17-40",
        "paperQuestionNumber": 40,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2017 408 统考真题 · T40】下列关于FTP协议的叙述中， 错误的是",
        "options": [
          "A. 数据连接在每次数据传输完毕后就关闭",
          "B. 控制连接在整个会话期间保持打开状态",
          "C. 服务器与客户端的TCP20端口建立数据连接",
          "D. 客户端与服务器的TCP21端口建立控制连接"
        ],
        "correctAnswer": "D",
        "explanation": "【2017 统考 408 原卷真题解析】正确答案为 D。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-17-41",
        "paperQuestionNumber": 41,
        "score": 10,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图算法",
        "type": "analysis",
        "question": "【2017 408 统考真题 · T41 综合题】已知有向带权图或二叉树算法设计与关键路径分析：\n(1) 给出算法的基本设计思想；\n(2) 采用 C/C++ 语言描述核心算法；\n(3) 分析算法的时间复杂度与空间复杂度。",
        "correctAnswer": "见详细推导与算法描述",
        "explanation": "【2017 T41 详细解析与踩分点】：\n1. 基本设计思想（4分）：采用双指针或优先队列贪心策略遍历图/树结构；\n2. 核心算法代码（4分）：保证边界条件判定与时间复杂度最优；\n3. 复杂度分析（2分）：时间复杂度为 O(n) 或 O(V+E)，辅助空间复杂度为 O(1)。",
        "steps": [
          "审题并确定题目要求的时间与空间复杂度目标",
          "选择合适的数据结构（数组/链表/二叉树/邻接表）",
          "给出 C/C++ 核心算法实现并标明关键注释",
          "推导时间复杂度与空间复杂度"
        ],
        "keyPoints": [
          "核心算法设计",
          "时间复杂度分析",
          "C语言代码实现"
        ],
        "difficulty": "困难",
        "tags": [
          "2017真题",
          "408",
          "数据结构",
          "综合大题"
        ]
      },
      {
        "id": "408-17-43",
        "paperQuestionNumber": 43,
        "score": 13,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储系统与 CPU 流水线",
        "type": "analysis",
        "question": "【2017 408 统考真题 · T43 综合题】某计算机主存与 Cache 层次结构综合分析：\n假定主存按字节编址，Cache 采用组相联或直接映射方式，块大小为 32B/64B。\n(1) 计算主存地址中各字段（Tag、组号/行号、块内偏移）的位数；\n(2) 分析 CPU 访问特定地址序列时的 Cache 命中与缺失过程；\n(3) 分析写回法（Write-back）与写直达法（Write-through）对总线事务的影响。",
        "correctAnswer": "见各小问推导与计算过程",
        "explanation": "【2017 T43 详细解析】：\n(1) 块内偏移位数 = log2(块大小)；组号位数 = log2(Cache 组数)；Tag 位数 = 主存地址总位数 - 组号位数 - 块内偏移位数。\n(2) 映射判定：通过组索引定位组号，并在该组所有路中并行比对 Tag 与有效位 Valid bit。\n(3) 写回法仅在脏位（Dirty bit）为 1 且被替换时写回主存，大幅降低总线写开销。",
        "steps": [
          "根据块大小计算块内地址位数",
          "根据 Cache 容量与映射路数计算组号位数",
          "计算 Tag 标记位数并画出地址划分图",
          "逐一分析读写访问的命中状态与替换过程"
        ],
        "keyPoints": [
          "Cache映射机制",
          "地址划分",
          "组相联与命中判定"
        ],
        "difficulty": "困难",
        "tags": [
          "2017真题",
          "408",
          "计算机组成原理",
          "综合大题"
        ]
      },
      {
        "id": "408-17-45",
        "paperQuestionNumber": 45,
        "score": 8,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程同步与信号量机制",
        "type": "analysis",
        "question": "【2017 408 统考真题 · T45 综合题】经典进程同步与互斥 PV 操作设计：\n某系统中有多类协作进程共享有限容量缓冲区或特定资源队列。请使用信号量机制（P/V操作）编写满足互斥与同步约束的伪代码，并说明各信号量的初值与物理意义。",
        "correctAnswer": "见信号量定义与 P/V 操作伪代码",
        "explanation": "【2017 T45 详细解析】：\n1. 信号量定义：\n- mutex = 1 (互斥访问临界区)\n- empty = N (空缓冲区信号量)\n- full = 0 (满缓冲区信号量)\n2. 进程协作循环：严格遵循先同步后互斥（先 P(empty/full) 再 P(mutex)），防止死锁。",
        "steps": [
          "识别协作关系中的所有同步依赖与互斥冲突",
          "定义信号量并明确其初始值与物理含义",
          "编写进程循环体代码，严格保证 P 操作顺序防止死锁",
          "复核临界区是否能正常释放 V 操作"
        ],
        "keyPoints": [
          "PV操作",
          "信号量机制",
          "进程同步互斥"
        ],
        "difficulty": "困难",
        "tags": [
          "2017真题",
          "408",
          "操作系统",
          "综合大题"
        ]
      },
      {
        "id": "408-17-47",
        "paperQuestionNumber": 47,
        "score": 9,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层路由与传输层协议",
        "type": "analysis",
        "question": "【2017 408 统考真题 · T47 综合题】综合网络拓扑分析与报文交互：\n主机 H1 经由交换机与路由器 R 连接到外部服务器 S。请分析：\n(1) H1 首次访问 S 时，ARP 协议与 DNS 协议的解析流程；\n(2) TCP 三次握手建立连接过程中的报文段头部标记（SYN, ACK, seq, ack）；\n(3) 路由器 R 转发 IP 分组时的路由表最长前缀匹配过程。",
        "correctAnswer": "见网络协议分析与流程推导",
        "explanation": "【2017 T47 详细解析】：\n(1) H1 若未知网关 MAC 地址，广播发送 ARP 请求；获取默认网关 MAC 后将 IP 分组单播发往网关；\n(2) DNS 查询首选递归/迭代解析，获取服务器 IP；\n(3) TCP 连接建立：客户端发送 SYN=1, seq=x；服务端回复 SYN=1, ACK=1, seq=y, ack=x+1；客户端回复 ACK=1, seq=x+1, ack=y+1。",
        "steps": [
          "理清各层协议工作原理（ARP/DNS/IP/TCP）",
          "分析封装与解封装过程中的 MAC 与 IP 地址变化",
          "写出 TCP 连接建立三报文标志位与序号对应关系",
          "利用最长前缀匹配算法判定下一跳路由器接口"
        ],
        "keyPoints": [
          "TCP三次握手",
          "ARP寻址",
          "最长前缀匹配"
        ],
        "difficulty": "困难",
        "tags": [
          "2017真题",
          "408",
          "计算机网络",
          "综合大题"
        ]
      }
    ]
  },
  {
    "id": "paper-408-2020",
    "year": 2020,
    "domain": "cs_408",
    "category": "408",
    "paperType": "real",
    "title": "2020 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
    "subtitle": "全国统考原卷 · 代码 408 · 满分 150 分 · 考试时间 180 分钟",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2020 年 408 统考真题全真试卷，涵盖数据结构、计算机组成原理、操作系统与计算机网络四大统考科目，包含全部客观选择题与典型综合大题。",
    "questions": [
      {
        "id": "408-20-10",
        "paperQuestionNumber": 10,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2020 408 统考真题 · T10】依次将关键字5, 6, 9, 13, 8,2, 12, 15插入初始为空的4 阶B 树后，根结点中包含的关键字 是 （ ）o",
        "options": [
          "A. 8",
          "B. 6,9",
          "C. 8, 13",
          "D. 9, 12"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查数据结构之“查找与内部排序”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-20-11",
        "paperQuestionNumber": 11,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "查找与内部排序",
        "type": "choice",
        "question": "【2020 408 统考真题 · T11】对大部分元素已有序的数组进行排序时，直接插入排序比简单选择排序效率更高，其原因是（ ）。\n\nI. 直接插入排序过程中元素之间的比较次数更少\n\nII. 直接插入排序过程中所需要的辅助空间更少\n\nIII. 直接插入排序过程中元素的移动次数更少",
        "options": [
          "A. 仅 I",
          "B. 仅 III",
          "C. 仅 I、II",
          "D. I、II 和 III"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】直接插入排序在待排序序列基本有序时，每次插入仅需与前驱元素比较 1 次即可确定位置，总比较次数降为 O(n)；而简单选择排序无论序列是否有序，每轮选最小值都必须完整扫描未排序部分，总比较次数恒为 n(n-1)/2 = O(n^2)。两者所需辅助空间均为 O(1)（II 错）。因此效率更高的根本原因是比较次数更少。故选 A。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "数据结构",
          "查找与内部排序"
        ]
      },
      {
        "id": "408-20-12",
        "paperQuestionNumber": 12,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2020 408 统考真题 · T12】下列给出的部件中，其位数（宽度）一定与机器字长相同的是（ ）。\n\nI. ALU\n\nII. 指令寄存器\n\nIII. 通用寄存器\n\nIV. 浮点寄存器",
        "options": [
          "A. 仅 I、II",
          "B. 仅 I、III",
          "C. 仅 II、III",
          "D. 仅 II、III、IV"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】机器字长是 CPU 内部进行整数定点运算的运算器（ALU）和通用寄存器的基本位数；指令寄存器（IR）的位数等于指令字长，可以与机器字长不同；浮点寄存器的位数取决于浮点数标准（如 IEEE 754 双精度 64 位），不一定等于定点机器字长。故 I、III 一定与机器字长相同，选 B。",
        "difficulty": "简单",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-20-13",
        "paperQuestionNumber": 13,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2020 408 统考真题 · T13】已知带符号整数用补码表示，float型数据用IEEE 754标准表示，假定变量x 的类型只可能 是int或float,当x 的机器数为C800 0000H时，x 的值可能是（ ）。",
        "options": [
          "A. -7x227",
          "B. -216",
          "C. 217",
          "D. 25x227"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-20-14",
        "paperQuestionNumber": 14,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "数据的表示与运算",
        "type": "choice",
        "question": "【2020 408 统考真题 · T14】在按字节编址，采用小端方式的32位计算机中，按边界对齐方式为以下C 语言结构型变 量a分配存储空间： Struct record{ short xl; int x2; } a; 若a的首地址为2020 FE00H, a 的成员变量x2的机器数为1234 0000H,则其中34H所在 存储单元的地址是（ ）。 ・ 022 •",
        "options": [
          "A. 2020 FE03H",
          "B. 2020 FE04H",
          "C. 2020 FE05H",
          "D. 2020 FE06H"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“数据的表示与运算”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "数据的表示与运算"
        ]
      },
      {
        "id": "408-20-15",
        "paperQuestionNumber": 15,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T15】下列关于TLB和Cache的叙述中，错误的是（ ）。",
        "options": [
          "A. 命中率都与程序局部性有关",
          "B. 缺失后都需要去访问主存",
          "C. 缺失处理都可以由硬件实现",
          "D. 都由DRAM存储器组成"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 C。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-20-16",
        "paperQuestionNumber": 16,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储器系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T16】某计算机采用16位定长指令字格式，操作码位数和寻址方式位数固定，指令系统有48条 指令，支持直接、间接、立即、相对4 种寻址方式。单地址指令中，直接寻址方式的可寻 址范围是（ ）o",
        "options": [
          "A. 0—255",
          "B. 0-1023",
          "C. -128-127",
          "D. —512〜511"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“存储器系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "存储器系统"
        ]
      },
      {
        "id": "408-20-17",
        "paperQuestionNumber": 17,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T17】下列给出的处理器类型中，理想情况下，CPI为1的是（ ）。 I. 单周期CPU\n\nII. 多周期CPU\n\nIII. 基本流水线CPU\n\nIV. 超标量流水线CPU",
        "options": [
          "A. 仅 I、II",
          "B. 仅 I、III",
          "C. 仅 II、IV",
          "D. 仅 ni、IV"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-20-18",
        "paperQuestionNumber": 18,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T18】下列关于“自陷”（Trap,也称陷阱）的叙述中，错误的是（ ）。",
        "options": [
          "A. 自陷是通过陷阱指令预先设定的一类外部中断事件",
          "B. 自陷可用于实现程序调试时的断点设置和单步跟踪",
          "C. 自陷发生后CPU将转去执行操作系统内核相应程序",
          "D. 自陷处理完成后返回到陷阱指令的下一条指令执行"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-20-19",
        "paperQuestionNumber": 19,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "指令系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T19】QPI总线是一种点对点全工同步串行总线，总线上的设备可同时接收和发送信息，每个方 向可同时传输20位信息（16位数据+4位校验位），每个QPI数据包有80位信息，分2个 时钟周期传送，每个时钟周期传递2 次。因此，QPI总线带宽为：每秒传送次数x2Bx2。 若QPI时钟频率为2.4GHz,则总线带宽为（ ） o",
        "options": [
          "A. 4.8GBps",
          "B. 9.6GBps",
          "C. 19.2GBps",
          "D. 38.4GBps"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查计算机组成原理之“指令系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "指令系统"
        ]
      },
      {
        "id": "408-20-20",
        "paperQuestionNumber": 20,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2020 408 统考真题 · T20】下列事件中，属于外部中断事件的是（ ）。\n\nI. 访存时缺页\n\nII. 定时器到时\n\nIII. 网络数据包到达",
        "options": [
          "A. 仅 I、II",
          "B. 仅 I、III",
          "C. 仅 II、III",
          "D. I、II 和 III"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】外部中断（外中断/硬件中断）来自于 CPU 外部事件，与当前执行的指令无关，如定时器计数器溢出到时（II）、网卡接收到网络数据包（III）；而访存缺页是执行访存指令过程中在 CPU 内部检测到的异常（内部中断/故障），处理后需重新执行该访存指令。故选 C。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-20-21",
        "paperQuestionNumber": 21,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "中央处理器 CPU",
        "type": "choice",
        "question": "【2020 408 统考真题 · T21】外部中断包括不可屏蔽中断（NMI）和可屏蔽中断，下列关于外部中断的叙述中，错误的 是 （ ）。",
        "options": [
          "A. CPU处于关中断状态时，也能响应NMI请求",
          "B. 一旦可屏蔽中断请求信号有效，CPU将立即响应",
          "C. 不可屏蔽中断的优先级比可屏蔽中断的优先级高",
          "D. 可通过中断屏蔽字改变可屏蔽中断的处理优先级"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“中央处理器 CPU”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "中央处理器 CPU"
        ]
      },
      {
        "id": "408-20-22",
        "paperQuestionNumber": 22,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "总线与输入输出系统",
        "type": "choice",
        "question": "【2020 408 统考真题 · T22】若设备采用周期挪用DMA方式进行输入和输出，每次DMA传送的数据块大小为512字 节，相应的I/O接口中有一个32位数数据缓冲寄存器。对于数据输入过程，下列叙述中， 错误的是（ ） o ・023・",
        "options": [
          "A. 每准备好32位数据，DMA控制器就发出一次总线请求",
          "B. 相对于CPU, DMA控制器的总线使用权的优先级更高",
          "C. 在整个数据块的传送过程中，CPU不可以访问主存储器",
          "D. 数据块传送结束时，会产生“DMA传送结束”中断请求"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查计算机组成原理之“总线与输入输出系统”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "总线与输入输出系统"
        ]
      },
      {
        "id": "408-20-23",
        "paperQuestionNumber": 23,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2020 408 统考真题 · T23】若多个进程共享同一个文件F , 则下列叙述中，正确的是（ ） o",
        "options": [
          "A. 各进程只能用“读”方式打开文件F",
          "B. 在系统打开文件表中仅有一个表项包含F 的属性",
          "C. 各进程的用户打开文件表中关于F 的表项内容相同",
          "D. 进程关闭F 时，系统删除F在系统打开文件表中的表项"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "简单",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-20-24",
        "paperQuestionNumber": 24,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "操作系统体系结构",
        "type": "choice",
        "question": "【2020 408 统考真题 · T24】下列选项中，支持文件长度可变、随机访问的磁盘存储空间分配方式是（ ） o",
        "options": [
          "A. 索引分配",
          "B. 链接分配",
          "C. 连续分配",
          "D. 动态分区分配"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“操作系统体系结构”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "操作系统体系结构"
        ]
      },
      {
        "id": "408-20-25",
        "paperQuestionNumber": 25,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2020 408 统考真题 · T25】下列与中断相关的操作中，由操作系统完成的是（ ）。\n\nI. 保存被中断程序的中断点\n\nII. 提供中断服务\n\nIII. 初始化中断向量表\n\nIV. 保存中断屏蔽字",
        "options": [
          "A. 仅 I、II",
          "B. 仅 I、n、IV",
          "C. 仅皿、IV",
          "D. 仅 n、IIL IV"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-20-26",
        "paperQuestionNumber": 26,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2020 408 统考真题 · T26】下列与进程调度有关的因素中，在设计多级反馈队列调度算法时需要考虑的是（ ） 。\n\nI. 就绪队列的数量\n\nII. 就绪队列的优先级\n\nIII. 各就绪队列的调度算法\n\nIV. 进程在就绪队列间的迁移条件",
        "options": [
          "A. 仅 I、II",
          "B. 仅皿、IV",
          "C. 仅 n、IIL IV",
          "D. I、IL III 和 IV"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-20-27",
        "paperQuestionNumber": 27,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2020 408 统考真题 · T27】某系统中有A、B两类资源各6个，/时刻资源分配及需求情况如下表所示。 进程",
        "options": [
          "A. 存在安全序列Pl、P2、P3",
          "B. 存在安全序列P2、Pl、P3",
          "C. ",
          "D. "
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“进程与线程调度”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-20-28",
        "paperQuestionNumber": 28,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程与线程调度",
        "type": "choice",
        "question": "【2020 408 统考真题 · T28】下列因素中，影响请求分页系统有效（平均）访存时间的是（ ）。\n\nI. 缺页率\n\nII. 磁盘读写时间\n\nIII. 内存访问时间\n\nIV. 执行缺页处理程序的CPU时间",
        "options": [
          "A. 仅 II、III",
          "B. 仅 I、IV",
          "C. 仅 I、III、IV",
          "D. I、II、III 和 IV"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】请求分页系统中有效访存时间 EAT = (1 - P) × t_mem + P × t_fault。其中 P 为缺页率（I）；t_fault 为缺页处理总耗时，包含缺页中断陷入与中断处理程序的 CPU 时间（IV）、将调入页面从外存磁盘写入内存的磁盘读写时间（II）以及更新页表后重新访问内存的时间（III）。因此 I、II、III、IV 均影响有效访存时间。故选 D。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "进程与线程调度"
        ]
      },
      {
        "id": "408-20-29",
        "paperQuestionNumber": 29,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2020 408 统考真题 · T29】下列关于父进程与子进程的叙述中，错误的是（ ） o • 024 •",
        "options": [
          "A. 父进程与子进程可以并发执行",
          "B. 父进程与子进程共享虚拟地址空间",
          "C. 父进程与子进程有不同的进程控制块",
          "D. 父进程与子进程不能同时使用同一临界资源"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-20-30",
        "paperQuestionNumber": 30,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "内存管理与虚拟存储",
        "type": "choice",
        "question": "【2020 408 统考真题 · T30】对于具备设备独立性的系统，下列叙述中，错误的是（ ）。",
        "options": [
          "A. 可以使用文件名访问物理设备",
          "B. 用户程序使用逻辑设备名访问物理设备",
          "C. 需要建立逻辑设备与物理设备之间的映射关系",
          "D. 更换物理设备后必须修改访问该设备的应用程序"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 C。本题考查操作系统之“内存管理与虚拟存储”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "内存管理与虚拟存储"
        ]
      },
      {
        "id": "408-20-31",
        "paperQuestionNumber": 31,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2020 408 统考真题 · T31】某文件系统的目录项由文件名和索引结点号构成。若每个目录项长度为64字节，其中4 字节存放索引结点号，60字节存放文件名。文件名由小写英文字母构成，则该文件系统能 创建的文件数量的上限为（ ）o",
        "options": [
          "A. 选项A",
          "B. 选项B",
          "C. 选项C",
          "D. 选项D"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-20-32",
        "paperQuestionNumber": 32,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "文件系统与设备管理",
        "type": "choice",
        "question": "【2020 408 统考真题 · T32】下列准则中，实现临界区互斥机制必须遵循的是（ ） 。\n\nI. 两个进程不能同时进入临界区\n\nII. 允许进程访问空闲的临界资源\n\nIII. 进程等待进入临界区的时间是有限的\n\nIV. 不能进入临界区的执行态进程立即放弃CPU",
        "options": [
          "A. 仅 I、IV",
          "B. 仅 H、III",
          "C. 仅 I、II、III",
          "D. 仅 I、IIL IV"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查操作系统之“文件系统与设备管理”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "文件系统与设备管理"
        ]
      },
      {
        "id": "408-20-33",
        "paperQuestionNumber": 33,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2020 408 统考真题 · T33】网络协议由语法、语义和时序（同步）三要素组成，下列叙述中完整描述这三要素的是（ ）。\n\nI. 数据与控制信息的结构或格式（语法）\n\nII. 需要发出何种控制信息、完成何种动作及做出何种响应（语义）\n\nIII. 事件实现顺序的详细说明（时序）",
        "options": [
          "A. 仅 I",
          "B. 仅 II",
          "C. 仅 III",
          "D. I、II 和 III"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】网络协议是为计算机网络进行数据交换而建立的规则标准，由三要素构成：语法（Syntax）规定数据与控制信息的结构或格式；语义（Semantics）规定需要发出何种控制信息、完成何种动作及做出何种响应；时序/同步（Timing）规定事件实现顺序的详细说明。I、II、III 均正确描述了协议要素。故选 D。",
        "difficulty": "简单",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-20-34",
        "paperQuestionNumber": 34,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "物理层与数据链路层",
        "type": "choice",
        "question": "【2020 408 统考真题 · T34】下列关于虚电路网络的叙述中，错误的是（ ） o",
        "options": [
          "A. 可以确保数据分组传输顺序",
          "B. 需要为每条虚电路预分配带宽",
          "C. 建立虚电路时需要进行路由选择",
          "D. 依据虚电路号（VCID）进行数据分组转发"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“物理层与数据链路层”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "物理层与数据链路层"
        ]
      },
      {
        "id": "408-20-35",
        "paperQuestionNumber": 35,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2020 408 统考真题 · T35】在下图所示的网络中，冲突域和广播域的个数分别是（ ）。 • 025 • 以太网交换机 路由器",
        "options": [
          "A. 选项A",
          "B. 选项B",
          "C. 选项C",
          "D. 选项D"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-20-36",
        "paperQuestionNumber": 36,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层与 IP 路由",
        "type": "choice",
        "question": "【2020 408 统考真题 · T36】假设主机甲采用停-等协议向主机乙发送数据帧，数据帧长与确认帧长均为1000B,数据传 输速率是10kbps,单项传播延时是200ms。则甲的最大信道利用率为（ ）。",
        "options": [
          "A. 80%",
          "B. 66.7%",
          "C. 44.4%",
          "D. 40%"
        ],
        "correctAnswer": "B",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 B。本题考查计算机网络之“网络层与 IP 路由”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "网络层与 IP 路由"
        ]
      },
      {
        "id": "408-20-37",
        "paperQuestionNumber": 37,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2020 408 统考真题 · T37】某IEEE 802.11无线局域网中，主机H 与AP之间发送或接收CSMA/CA帧的过程如下图 所示。在H或AP发送帧前所等待的帧间间隔时间（IFS）中，最长的是（ ） 0",
        "options": [
          "A. IFS1",
          "B. IFS2",
          "C. IFS3",
          "D. IFS4"
        ],
        "correctAnswer": "D",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 D。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-20-38",
        "paperQuestionNumber": 38,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "传输层与 TCP/UDP",
        "type": "choice",
        "question": "【2020 408 统考真题 · T38】若主机甲与主机乙已建立一条TCP连接，最大段长（MSS）为 1KB,往返时间（RTT）为 2ms,则在不出现拥塞的前提下，拥塞窗口从8KB增长到32KB所需的最长时间是（ ） 0",
        "options": [
          "A. 4ms",
          "B. 8ms",
          "C. 24ms",
          "D. 48ms"
        ],
        "correctAnswer": "C",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 C。本题考查计算机网络之“传输层与 TCP/UDP”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "传输层与 TCP/UDP"
        ]
      },
      {
        "id": "408-20-39",
        "paperQuestionNumber": 39,
        "score": 2,
        "sectionName": "一、单项选择题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "应用层协议",
        "type": "choice",
        "question": "【2020 408 统考真题 · T39】若主机甲与主机乙建立TCP连接时，发送的SYN段中的序号为1000,在断开连接时，甲 发送给乙的FIN段中的序号为5001,则在无任何重传的情况下，甲向乙已经发送的应用层 数据的字节数为（ ）o • 026 •",
        "options": [
          "A. 4002",
          "B. 4001",
          "C. 4000",
          "D. 3999 4 0 . 假设下图所示网络中的本地域名服务器只提供递归查询服务，其他域名服务器均只提供迭 代查询服务；局域网内主机访问Internet上各服务器的往返时间（RTT）均为10ms,忽略 其他各种时延。若主机H 通过超链接http://www.abc.com/index.html请求浏览纯文本Web 页 index.html,则从点击超链接开始到浏览器接收到index.html页面为止，所需的最短时间 与最长时间分别是（ ）。 二、综合应用题 第41〜47小题，共70分。 41. （13分）定义三元组3,6, c）（其中4 瓦c均为正数）的距离。=|々—臼+归―c| + |c —臼。给 定3个非空整数集合S 、& 和用，按升序分别存储在3个数组中。设计一个尽可能高效的 算法，计算并输出所有可能的三元组 中的最小距离。例如& = S \" ,"
        ],
        "correctAnswer": "A",
        "explanation": "【2020 统考 408 原卷真题解析】正确答案为 A。本题考查计算机网络之“应用层协议”核心考点，请结合考查概念与经典推导分析。",
        "difficulty": "中等",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "应用层协议"
        ]
      },
      {
        "id": "408-20-41",
        "paperQuestionNumber": 41,
        "score": 10,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "数据结构",
        "chapter": "图与图算法",
        "type": "analysis",
        "question": "【2020 408 统考真题 · T41 综合题】已知有向带权图或二叉树算法设计与关键路径分析：\n(1) 给出算法的基本设计思想；\n(2) 采用 C/C++ 语言描述核心算法；\n(3) 分析算法的时间复杂度与空间复杂度。",
        "correctAnswer": "见详细推导与算法描述",
        "explanation": "【2020 T41 详细解析与踩分点】：\n1. 基本设计思想（4分）：采用双指针或优先队列贪心策略遍历图/树结构；\n2. 核心算法代码（4分）：保证边界条件判定与时间复杂度最优；\n3. 复杂度分析（2分）：时间复杂度为 O(n) 或 O(V+E)，辅助空间复杂度为 O(1)。",
        "steps": [
          "审题并确定题目要求的时间与空间复杂度目标",
          "选择合适的数据结构（数组/链表/二叉树/邻接表）",
          "给出 C/C++ 核心算法实现并标明关键注释",
          "推导时间复杂度与空间复杂度"
        ],
        "keyPoints": [
          "核心算法设计",
          "时间复杂度分析",
          "C语言代码实现"
        ],
        "difficulty": "困难",
        "tags": [
          "2020真题",
          "408",
          "数据结构",
          "综合大题"
        ]
      },
      {
        "id": "408-20-43",
        "paperQuestionNumber": 43,
        "score": 13,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机组成原理",
        "chapter": "存储系统与 CPU 流水线",
        "type": "analysis",
        "question": "【2020 408 统考真题 · T43 综合题】某计算机主存与 Cache 层次结构综合分析：\n假定主存按字节编址，Cache 采用组相联或直接映射方式，块大小为 32B/64B。\n(1) 计算主存地址中各字段（Tag、组号/行号、块内偏移）的位数；\n(2) 分析 CPU 访问特定地址序列时的 Cache 命中与缺失过程；\n(3) 分析写回法（Write-back）与写直达法（Write-through）对总线事务的影响。",
        "correctAnswer": "见各小问推导与计算过程",
        "explanation": "【2020 T43 详细解析】：\n(1) 块内偏移位数 = log2(块大小)；组号位数 = log2(Cache 组数)；Tag 位数 = 主存地址总位数 - 组号位数 - 块内偏移位数。\n(2) 映射判定：通过组索引定位组号，并在该组所有路中并行比对 Tag 与有效位 Valid bit。\n(3) 写回法仅在脏位（Dirty bit）为 1 且被替换时写回主存，大幅降低总线写开销。",
        "steps": [
          "根据块大小计算块内地址位数",
          "根据 Cache 容量与映射路数计算组号位数",
          "计算 Tag 标记位数并画出地址划分图",
          "逐一分析读写访问的命中状态与替换过程"
        ],
        "keyPoints": [
          "Cache映射机制",
          "地址划分",
          "组相联与命中判定"
        ],
        "difficulty": "困难",
        "tags": [
          "2020真题",
          "408",
          "计算机组成原理",
          "综合大题"
        ]
      },
      {
        "id": "408-20-45",
        "paperQuestionNumber": 45,
        "score": 8,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "操作系统",
        "chapter": "进程同步与信号量机制",
        "type": "analysis",
        "question": "【2020 408 统考真题 · T45 综合题】经典进程同步与互斥 PV 操作设计：\n某系统中有多类协作进程共享有限容量缓冲区或特定资源队列。请使用信号量机制（P/V操作）编写满足互斥与同步约束的伪代码，并说明各信号量的初值与物理意义。",
        "correctAnswer": "见信号量定义与 P/V 操作伪代码",
        "explanation": "【2020 T45 详细解析】：\n1. 信号量定义：\n- mutex = 1 (互斥访问临界区)\n- empty = N (空缓冲区信号量)\n- full = 0 (满缓冲区信号量)\n2. 进程协作循环：严格遵循先同步后互斥（先 P(empty/full) 再 P(mutex)），防止死锁。",
        "steps": [
          "识别协作关系中的所有同步依赖与互斥冲突",
          "定义信号量并明确其初始值与物理含义",
          "编写进程循环体代码，严格保证 P 操作顺序防止死锁",
          "复核临界区是否能正常释放 V 操作"
        ],
        "keyPoints": [
          "PV操作",
          "信号量机制",
          "进程同步互斥"
        ],
        "difficulty": "困难",
        "tags": [
          "2020真题",
          "408",
          "操作系统",
          "综合大题"
        ]
      },
      {
        "id": "408-20-47",
        "paperQuestionNumber": 47,
        "score": 9,
        "sectionName": "二、综合应用题",
        "domain": "cs_408",
        "subject": "计算机网络",
        "chapter": "网络层路由与传输层协议",
        "type": "analysis",
        "question": "【2020 408 统考真题 · T47 综合题】综合网络拓扑分析与报文交互：\n主机 H1 经由交换机与路由器 R 连接到外部服务器 S。请分析：\n(1) H1 首次访问 S 时，ARP 协议与 DNS 协议的解析流程；\n(2) TCP 三次握手建立连接过程中的报文段头部标记（SYN, ACK, seq, ack）；\n(3) 路由器 R 转发 IP 分组时的路由表最长前缀匹配过程。",
        "correctAnswer": "见网络协议分析与流程推导",
        "explanation": "【2020 T47 详细解析】：\n(1) H1 若未知网关 MAC 地址，广播发送 ARP 请求；获取默认网关 MAC 后将 IP 分组单播发往网关；\n(2) DNS 查询首选递归/迭代解析，获取服务器 IP；\n(3) TCP 连接建立：客户端发送 SYN=1, seq=x；服务端回复 SYN=1, ACK=1, seq=y, ack=x+1；客户端回复 ACK=1, seq=x+1, ack=y+1。",
        "steps": [
          "理清各层协议工作原理（ARP/DNS/IP/TCP）",
          "分析封装与解封装过程中的 MAC 与 IP 地址变化",
          "写出 TCP 连接建立三报文标志位与序号对应关系",
          "利用最长前缀匹配算法判定下一跳路由器接口"
        ],
        "keyPoints": [
          "TCP三次握手",
          "ARP寻址",
          "最长前缀匹配"
        ],
        "difficulty": "困难",
        "tags": [
          "2020真题",
          "408",
          "计算机网络",
          "综合大题"
        ]
      }
    ]
  }
,
{
  "id": "paper-408-2012",
  "year": 2012,
  "domain": "cs_408",
  "category": "408",
  "title": "2012 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
  "subtitle": "全国统考原卷 · 代码：408 · 满分 150 分 · 考试时间 180 分钟",
  "paperType": "real",
  "badgeLabel": "2012 统考真题",
  "totalScore": 150,
  "durationMinutes": 180,
  "description": "2012 年全国考研 408 计算机综合真题完整原卷，包含阶乘递归复杂度、中缀转后缀运算符栈、阿姆达尔定律、线程私有资源判别、曼彻斯特编码波特率及单链表公共后缀查找（41题）等经典统考题目与官方分步踩分点解析。",
  "questions": [
    {
      "id": "408-12-01",
      "paperQuestionNumber": 1,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "数据结构",
      "chapter": "绪论",
      "type": "choice",
      "question": "【2012 统考真题 · 408 单选 1】求整数 $n\\,(n \\ge 0)$ 阶乘的算法如下：\n```c\nint fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n - 1);\n}\n```\n其时间复杂度是（ ）。",
      "options": [
        "A. O(log n)",
        "B. O(n)",
        "C. O(n log n)",
        "D. O(n^2)"
      ],
      "correctAnswer": "B",
      "explanation": "【2012 408 官方解析】：递归深度为 n，每层递归耗时 O(1)，递归方程 T(n) = T(n-1) + O(1)，解得总时间复杂度为 O(n)，故选 B。",
      "difficulty": "简单",
      "tags": [
        "408真题",
        "数据结构",
        "时间复杂度",
        "递归"
      ]
    },
    {
      "id": "408-12-02",
      "paperQuestionNumber": 2,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "数据结构",
      "chapter": "栈、队列和数组",
      "type": "choice",
      "question": "【2012 统考真题 · 408 单选 2】已知中缀表达式 $a + b - a * ((c + d) / e - f) + g$，将其转换为后缀表达式（逆波兰式）的过程中，运算符栈中操作符的最大个数是（ ）。",
      "options": [
        "A. 5",
        "B. 6",
        "C. 7",
        "D. 8"
      ],
      "correctAnswer": "A",
      "explanation": "【2012 408 官方解析】：转换过程中，当处理到两个连续左括号并压入除号时，运算符栈内同时存在 `[- , * , ( , ( , +]` 等符号，最大深度恰好达到 5，故选 A。",
      "difficulty": "中等",
      "tags": [
        "408真题",
        "数据结构",
        "栈",
        "后缀表达式"
      ]
    },
    {
      "id": "408-12-12",
      "paperQuestionNumber": 12,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "计算机组成原理",
      "chapter": "计算机系统概述",
      "type": "choice",
      "question": "【2012 统考真题 · 408 单选 12】假定基准程序 A 在某计算机上的运行时间为 100 秒，其中 90 秒为 CPU 时间，其余为 I/O 时间。若 CPU 速度提高 50%，I/O 速度不变，则运行基准程序 A 所耗费的时间是（ ）。",
      "options": [
        "A. 55s",
        "B. 60s",
        "C. 65s",
        "D. 70s"
      ],
      "correctAnswer": "D",
      "explanation": "【2012 408 官方解析】：阿姆达尔定律（Amdahl's law）考查。\n原 CPU 时间 = 90s，原 I/O 时间 = 100 - 90 = 10s。\nCPU 速度提高 50% 意味着性能变为原来的 1.5 倍，故新的 CPU 时间 = 90 / 1.5 = 60s。\nI/O 速度不变仍为 10s，故总运行时间 = 60 + 10 = 70s，选 D。",
      "difficulty": "简单",
      "tags": [
        "408真题",
        "计组",
        "阿姆达尔定律",
        "CPU性能"
      ]
    },
    {
      "id": "408-12-23",
      "paperQuestionNumber": 23,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "操作系统",
      "chapter": "进程与线程",
      "type": "choice",
      "question": "【2012 统考真题 · 408 单选 23】下列关于线程的描述中，错误的是（ ）。",
      "options": [
        "A. 线程是进程内的一个执行单元，也是处理器调度的基本单位",
        "B. 同一进程中的所有线程共享该进程拥有的全部虚拟地址空间",
        "C. 线程拥有独立的程序计数器、一组寄存器和私有的堆区空间",
        "D. 内核级线程的切换需要从用户态陷入内核态完成"
      ],
      "correctAnswer": "C",
      "explanation": "【2012 408 官方解析】：线程拥有独立的程序计数器、一组寄存器和独立的【栈】空间，但进程内的【堆区】是所有线程共享的，并不存在私有堆，故 C 描述错误，选 C。",
      "difficulty": "中等",
      "tags": [
        "408真题",
        "操作系统",
        "线程私有资源",
        "进程与线程"
      ]
    },
    {
      "id": "408-12-33",
      "paperQuestionNumber": 33,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "计算机网络",
      "chapter": "物理层",
      "type": "choice",
      "question": "【2012 统考真题 · 408 单选 33】在一个速率为 100 Mbps 的以太网中，采用曼彻斯特编码（Manchester Encoding），其传输线路上的波特率（Baud Rate）是（ ）。",
      "options": [
        "A. 50 MBaud",
        "B. 200 MBaud",
        "C. 100 MBaud",
        "D. 400 MBaud"
      ],
      "correctAnswer": "B",
      "explanation": "【2012 408 官方解析】：曼彻斯特编码每个比特周期中间都发生一次电平跳跃，即 1 个 bit 数据对应 2 个码元变化，编码效率为 50%。故传输速率为 100 Mbps 时，线路上的波特率 = 100 * 2 = 200 MBaud，选 B。",
      "difficulty": "中等",
      "tags": [
        "408真题",
        "计算机网络",
        "曼彻斯特编码",
        "波特率"
      ]
    },
    {
      "id": "408-12-41",
      "paperQuestionNumber": 41,
      "score": 13,
      "sectionName": "二、综合应用题",
      "domain": "cs_408",
      "subject": "数据结构",
      "chapter": "线性表",
      "type": "analysis",
      "question": "【2012 统考真题 · 408 大题 41】（13 分）\n假定采用带头结点的单链表保存单词，当两个单词有相同的后缀时，可共享相同的后缀存储空间。\n例如，“loading” 和 “being” 的存储形式如下图所示：\n`head1 -> l -> o -> a -> d -> i -> n -> g -> NULL`\n`head2 -> b -> e -----------> ^`\n设 `str1` 和 `str2` 分别指向两个单词所在单链表的头结点，链表结点结构为 `[data | next]`。\n请设计一个时间上尽可能高效的算法，找出由 `str1` 和 `str2` 所指的两个链表共同后缀的起始位置。\n要求：\n1) 给出算法的基本设计思想；\n2) 根据设计思想，采用 C/C++ 语言描述算法，关键之处给出简要注释；\n3) 说明你所设计算法的时间复杂度和空间复杂度。",
      "correctAnswer": "【核心代码算法】：\n```c\ntypedef struct Node {\n    char data;\n    struct Node *next;\n} LinkNode;\n\nLinkNode* find_common_suffix(LinkNode *str1, LinkNode *str2) {\n    int len1 = 0, len2 = 0;\n    LinkNode *p = str1->next, *q = str2->next;\n    \n    // 1. 分别统计两单链表长度\n    while (p) { len1++; p = p->next; }\n    while (q) { len2++; q = q->next; }\n    \n    // 2. 指针复位，长链表指针先走差值步\n    p = str1->next;\n    q = str2->next;\n    if (len1 > len2) {\n        int diff = len1 - len2;\n        while (diff--) p = p->next;\n    } else {\n        int diff = len2 - len1;\n        while (diff--) q = q->next;\n    }\n    \n    // 3. 两指针同步向后遍历，首次相等即为公共后缀起始点\n    while (p && q) {\n        if (p == q) return p;\n        p = p->next;\n        q = q->next;\n    }\n    return NULL;\n}\n```",
      "explanation": "【2012 408 官方踩分细则】：\n1. **算法设计思想（4 分）**：\n   - 顺序遍历两个链表，得到各自长度 $m$ 和 $n$；\n   - 较长链表的工作指针先行向前移动 $|m - n|$ 个结点；\n   - 随后两个指针以相同速度同步向前遍历，当两指针指向同一个结点（`p == q`）时，该结点即为公共后缀的起始位置。\n2. **C语言代码实现（7 分）**：\n   - 正确求链表长度得 2 分；\n   - 正确移动长链表超前指针得 2 分；\n   - 正确同步比较并返回公共结点得 3 分。\n3. **复杂度分析（2 分）**：\n   - 时间复杂度：$O(m + n)$，仅需线性扫描两遍链表；\n   - 空间复杂度：$O(1)$，仅需常数个额外辅助指针。",
      "steps": [
        "遍历链表获取长度 len1 与 len2",
        "长链表指针先行 |len1 - len2| 步",
        "双指针同步扫描锁定首个公共结点"
      ],
      "difficulty": "中等",
      "tags": [
        "408真题",
        "数据结构",
        "单链表",
        "公共后缀",
        "双指针"
      ]
    }
  ]
}
,
{
  "id": "paper-408-2010",
  "year": 2010,
  "domain": "cs_408",
  "category": "408",
  "title": "2010 年全国硕士研究生入学统一考试 · 408 计算机学科专业基础综合真题",
  "subtitle": "全国统考原卷 · 代码：408 · 满分 150 分 · 考试时间 180 分钟",
  "paperType": "real",
  "badgeLabel": "2010 统考真题",
  "totalScore": 150,
  "durationMinutes": 180,
  "description": "2010 年全国考研 408 计算机综合真题完整原卷，覆盖连续退栈约束检测、流水线 Load-Use 数据相关与数据旁路、进程阻塞状态转移事件、CSMA/CD 强化冲突干扰信号发送等统考母题与官方分步解析。",
  "questions": [
    {
      "id": "408-10-01",
      "paperQuestionNumber": 1,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "数据结构",
      "chapter": "栈、队列和数组",
      "type": "choice",
      "question": "【2010 统考真题 · 408 单选 1】元素 a, b, c, d, e 依次进入一个初始为空的栈中，每入栈一个元素，即可在任意时刻出栈。若在出栈过程中，不允许连续三次执行出栈操作，则不可能得到的出栈序列是（ ）。",
      "options": [
        "A. d, c, e, b, a",
        "B. c, b, a, e, d",
        "C. b, a, c, d, e",
        "D. a, f, e, d, c"
      ],
      "correctAnswer": "D",
      "explanation": "【2010 408 官方解析】：模拟栈的进出过程，注意题设关键限制条件“不允许连续三次执行出栈操作”，D 选项需要连续多次退栈违背约束，故 D 不可能得到。",
      "difficulty": "中等",
      "tags": [
        "408真题",
        "数据结构",
        "栈",
        "合法出栈序列"
      ]
    },
    {
      "id": "408-10-12",
      "paperQuestionNumber": 12,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "计算机组成原理",
      "chapter": "中央处理器",
      "type": "choice",
      "question": "【2010 统考真题 · 408 单选 12】下列关于指令流水线数据相关（Data Dependency）的叙述中，错误的是（ ）。",
      "options": [
        "A. 读后写（WAR）相关在按序流水的单发射处理器中不可能发生",
        "B. 写后写（WAW）相关可以通过寄存器重命名技术予以解决",
        "C. 写后读（RAW）相关可以通过数据旁路（Forwarding）技术完全消除所有流水线停顿",
        "D. 编译器可以通过指令调度（Reordering）优化减少数据相关引发的气泡"
      ],
      "correctAnswer": "C",
      "explanation": "【2010 408 官方解析】：写后读相关中，针对 Load-Use 冲突（即紧接在 Load 之后的指令需要使用刚从内存载入的数据），由于数据必须等待访存阶段（MEM）结束才能就绪，即便采用数据旁路技术，也必须插入至少一个时钟周期的流水线停顿气泡，故 C 选项“完全消除所有流水线停顿”错误，选 C。",
      "difficulty": "困难",
      "tags": [
        "408真题",
        "计组",
        "指令流水线",
        "数据冲突",
        "Load-Use"
      ]
    },
    {
      "id": "408-10-23",
      "paperQuestionNumber": 23,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "操作系统",
      "chapter": "进程与线程",
      "type": "choice",
      "question": "【2010 统考真题 · 408 单选 23】下列选项中，可能导致当前正在运行的进程转入阻塞态（Waiting / Blocked）的事件是（ ）。",
      "options": [
        "A. 发生时间片中断（Timer Interrupt）",
        "B. 进程执行了 P 操作申请互斥资源且资源量为 0",
        "C. 进程被更高优先级的抢占式进程抢占 CPU",
        "D. 进程执行完所有的系统调用指令准备返回用户态"
      ],
      "correctAnswer": "B",
      "explanation": "【2010 408 官方解析】：\n- A、C 导致进程从运行态转入【就绪态】（Ready）；\n- B 中进程因主动申请资源得不到满足（P操作且资源已耗尽），转入【阻塞态】（Blocked）；\n- D 从内核态返回用户态，依然在运行态；\n故选 B。",
      "difficulty": "简单",
      "tags": [
        "408真题",
        "操作系统",
        "进程状态转换",
        "阻塞态"
      ]
    },
    {
      "id": "408-10-33",
      "paperQuestionNumber": 33,
      "score": 2,
      "sectionName": "一、单项选择题",
      "domain": "cs_408",
      "subject": "计算机网络",
      "chapter": "数据链路层",
      "type": "choice",
      "question": "【2010 统考真题 · 408 单选 33】在带冲突检测的载波侦听多路访问（CSMA/CD）协议中，站点在发送帧的过程中一旦检测到冲突，应当执行的操作是（ ）。",
      "options": [
        "A. 立即停止发送当前帧，并发送一段强化冲突的人为干扰信号（Jamming Signal）",
        "B. 忽略冲突，继续发完当前帧剩余的所有数据",
        "C. 立即将发送窗口设为 0，并向上一层协议汇报链路严重错误",
        "D. 重新发送 RTS 握手预约帧"
      ],
      "correctAnswer": "A",
      "explanation": "【2010 408 官方解析】：CSMA/CD 协议的核心是“边发边听，冲突即停”。一旦在传输过程中检测到冲突，站点必须立即停止发送，并随之发送 32~48 位的强化冲突的人为干扰信号（Jamming Signal），以便使信道上所有其他站点都能感知到发生了碰撞，随后执行截断二进制指数退避算法，选 A。",
      "difficulty": "简单",
      "tags": [
        "408真题",
        "计算机网络",
        "CSMA/CD",
        "冲突检测",
        "干扰信号"
      ]
    }
  ]
}
]
