import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 《考研数学概率论救命讲义》全量例题分类题库（159 题 · 含数一/数三公共与数一专项）
 */
export const jiumingProbabilityQuestions: UnifiedQuestion[] = [
  {
    "id": "gl-jm-1-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "利用事件的运算表示下列各事件（翻译题）：\n（1）$A,B,C$ 都发生；\n（2）$A,B,C$ 都不发生；\n（3）$A$ 发生，$B,C$ 都不发生；\n（4）$A,B,C$ 不都发生；\n（5）$A,B,C$ 至少有一个发生；\n（6）$A,B,C$ 恰有一个发生；\n（7）$A,B,C$ 不多于一个发生；\n（8）$A,B,C$ 中至少两个发生；\n（9）$A,B,C$ 不多于两个发生；\n（10）$A,B,C$ 中恰有两个发生。",
    "correctAnswer": "（1）$ABC$；（2）$\\bar{A}\\bar{B}\\bar{C}$；（3）$A\\bar{B}\\bar{C}$；（4）$\\overline{ABC}$（或 $\\bar{A}\\cup\\bar{B}\\cup\\bar{C}$）；（5）$A\\cup B\\cup C$；（6）$A\\bar{B}\\bar{C}\\cup\\bar{A}B\\bar{C}\\cup\\bar{A}\\bar{B}C$；（7）$\\bar{A}\\bar{B}\\cup\\bar{A}\\bar{C}\\cup\\bar{B}\\bar{C}$（或 $\\overline{AB\\cup AC\\cup BC}$）；（8）$AB\\cup AC\\cup BC$；（9）$\\overline{ABC}$（或 $\\bar{A}\\cup\\bar{B}\\cup\\bar{C}$）；（10）$AB\\bar{C}\\cup A\\bar{B}C\\cup\\bar{A}BC$。",
    "explanation": "逐项进行语义到集合运算的翻译，并利用德摩根律等价化简：\n（1）$A,B,C$ 同时发生即交事件：$ABC$（或 $A\\cap B\\cap C$）。\n（2）$A,B,C$ 均不发生，即 $\\bar{A},\\bar{B},\\bar{C}$ 同时发生：$\\bar{A}\\bar{B}\\bar{C}$（也可写作 $\\overline{A\\cup B\\cup C}$）。\n（3）$A$ 发生且 $B,C$ 均不发生：$A\\bar{B}\\bar{C}$（或 $A-(B\\cup C)$）。\n（4）“不都发生”是“都发生”的对立事件：$\\overline{ABC}=\\bar{A}\\cup\\bar{B}\\cup\\bar{C}$。\n（5）至少有一个发生即并事件：$A\\cup B\\cup C$（或 $A+B+C$）。\n（6）恰有一个发生有三种互斥情形：仅 $A$ 发生、仅 $B$ 发生、仅 $C$ 发生，故为 $A\\bar{B}\\bar{C}\\cup\\bar{A}B\\bar{C}\\cup\\bar{A}\\bar{B}C$。\n（7）“不多于一个发生”等价于“至少两个不发生”，也等价于“任意两个不能同时发生”，故可表示为 $\\bar{A}\\bar{B}\\cup\\bar{A}\\bar{C}\\cup\\bar{B}\\bar{C}$ 或 $\\overline{AB\\cup AC\\cup BC}$ 或 $\\bar{A}\\bar{B}\\bar{C}\\cup A\\bar{B}\\bar{C}\\cup\\bar{A}B\\bar{C}\\cup\\bar{A}\\bar{B}C$。\n（8）至少两个发生等价于至少有一对同时发生：$AB\\cup AC\\cup BC$。\n（9）三个事件中“不多于两个发生”即“不都发生”，与（4）相同：$\\overline{ABC}$（或 $\\bar{A}\\cup\\bar{B}\\cup\\bar{C}$）。\n（10）恰有两个发生有三种互斥情形：仅 $C$ 不发生、仅 $B$ 不发生、仅 $A$ 不发生，故为 $AB\\bar{C}\\cup A\\bar{B}C\\cup\\bar{A}BC$。",
    "steps": [
      "利用“且”对应交、“或”对应并、“不发生”对应逆事件，逐条写出基本事件组合",
      "对“不都发生”“不多于某数量”等否定表述，借助对立事件或德摩根律化简为最简形式",
      "对“恰有 $k$ 个发生”表述，拆分为所有互斥的基本组成并取并集"
    ],
    "keyPoints": [
      "事件的关系与运算",
      "德摩根律",
      "概率语义翻译"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "事件运算",
      "德摩根律",
      "基础翻译"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "blank",
    "question": "$(A+B)(A+\\bar{B})(\\bar{A}+B)(\\bar{A}+\\bar{B})=\\underline{\\hspace{2cm}}$.",
    "correctAnswer": "$\\varnothing$",
    "explanation": "利用事件的分配律与对立事件性质逐步化简：\n先合并前两项：\n$$(A+B)(A+\\bar{B}) = A + B\\bar{B} = A + \\varnothing = A$$\n再合并后两项：\n$$(\\bar{A}+B)(\\bar{A}+\\bar{B}) = \\bar{A} + B\\bar{B} = \\bar{A} + \\varnothing = \\bar{A}$$\n因此原式为：\n$$A\\bar{A} = \\varnothing$$",
    "steps": [
      "对前两个括号应用分配律 $(A+B)(A+\\bar{B}) = A + B\\bar{B} = A$",
      "对后两个括号应用分配律 $(\\bar{A}+B)(\\bar{A}+\\bar{B}) = \\bar{A} + B\\bar{B} = \\bar{A}$",
      "两者相交得 $A\\bar{A} = \\varnothing$"
    ],
    "keyPoints": [
      "事件分配律",
      "逆事件的交"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "事件化简",
      "分配律"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "将一枚硬币独立掷两次，引进事件：$A_1=\\{\\text{掷第一次出现正面}\\}$，$A_2=\\{\\text{掷第二次出现正面}\\}$，$A_3=\\{\\text{正、反面各出现一次}\\}$，$A_4=\\{\\text{正面出现两次}\\}$，则事件（ ）",
    "options": [
      "A. $A_1,A_2,A_3$ 相互独立",
      "B. $A_2,A_3,A_4$ 相互独立",
      "C. $A_1,A_2,A_3$ 两两独立",
      "D. $A_2,A_3,A_4$ 两两独立"
    ],
    "correctAnswer": "C",
    "explanation": "记正面向为 $H$、反面为 $T$，样本空间 $\\Omega = \\{HH, HT, TH, TT\\}$，各样本点等可能，概率均为 $\\frac{1}{4}$。\n列出各事件及概率：\n- $A_1 = \\{HH, HT\\}$，$P(A_1) = \\frac{1}{2}$；\n- $A_2 = \\{HH, TH\\}$，$P(A_2) = \\frac{1}{2}$；\n- $A_3 = \\{HT, TH\\}$，$P(A_3) = \\frac{1}{2}$；\n- $A_4 = \\{HH\\}$，$P(A_4) = \\frac{1}{4}$。\n检验 $A_1, A_2, A_3$：\n- $P(A_1A_2) = P(\\{HH\\}) = \\frac{1}{4} = P(A_1)P(A_2)$；\n- $P(A_1A_3) = P(\\{HT\\}) = \\frac{1}{4} = P(A_1)P(A_3)$；\n- $P(A_2A_3) = P(\\{TH\\}) = \\frac{1}{4} = P(A_2)P(A_3)$；\n故 $A_1, A_2, A_3$ **两两独立**（C 正确）。\n但 $A_1A_2A_3 = \\varnothing$，$P(A_1A_2A_3) = 0 \\neq \\frac{1}{8} = P(A_1)P(A_2)P(A_3)$，故它们不相互独立（排除 A）。\n又 $A_3A_4 = \\varnothing$，$P(A_3A_4) = 0 \\neq \\frac{1}{2}\\cdot\\frac{1}{4}$，故 $A_3$ 与 $A_4$ 不独立，排除 B、D。选 C。",
    "steps": [
      "写出样本空间及 $A_1,A_2,A_3,A_4$ 对应的样本点集合与各自概率",
      "验证 $A_1,A_2,A_3$ 任意两个事件的交概率均等于各自概率乘积，得两两独立",
      "验证 $P(A_1A_2A_3)=0 \\neq P(A_1)P(A_2)P(A_3)$ 排除相互独立，并验证 $A_3A_4=\\varnothing$ 排除 B、D"
    ],
    "keyPoints": [
      "两两独立与相互独立的区别",
      "古典概型"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "独立性",
      "两两独立",
      "伯恩斯坦反例"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "对于任意事件 $A$ 和 $B$，若 $P(AB)=0$，则（ ）",
    "options": [
      "A. $\\bar{A}\\bar{B}=\\varnothing$",
      "B. $AB=\\varnothing$",
      "C. $P(A)P(B)=0$",
      "D. $P(A\\bar{B})-P(A)=0$"
    ],
    "correctAnswer": "D",
    "explanation": "由概率的减法公式：\n$$P(A\\bar{B}) = P(A - B) = P(A) - P(AB)$$\n已知 $P(AB) = 0$，代入得 $P(A\\bar{B}) = P(A)$，即 $P(A\\bar{B}) - P(A) = 0$，故 D 恒成立。\n反例排除 A、B、C：设 $X \\sim U(0,1)$，取 $A=\\{X\\le 0.5\\}, B=\\{X\\ge 0.5\\}$，则 $AB=\\{X=0.5\\} \\neq \\varnothing$ 但 $P(AB)=0$，排除 B；且取 $A=\\{X\\in[0,0.2]\\}, B=\\{X\\in[0.3,0.5]\\}$，则 $P(AB)=0$，但 $\\bar{A}\\bar{B}\\neq\\varnothing$ 且 $P(A)P(B)=0.04\\neq 0$，排除 A、C。选 D。",
    "steps": [
      "利用概率推不出集合包含/相等关系排除选项 A、B",
      "利用未给出独立性且零概率不要求 $P(A)=0$ 或 $P(B)=0$ 排除 C",
      "由减法公式 $P(A\\bar{B}) = P(A) - P(AB)$ 及 $P(AB)=0$ 得 D 恒成立"
    ],
    "keyPoints": [
      "概率与事件关系辨析",
      "减法公式"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "零概率事件",
      "减法公式",
      "概念辨析"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "已知 $P(A)=P(B)=P(C)=\\frac{1}{4}$，$P(AB)=0$，$P(AC)=P(BC)=\\frac{1}{12}$，求：\n（1）事件 $A,B,C$ 至少一个发生的概率；\n（2）事件 $A,B,C$ 至少两个发生的概率；\n（3）事件 $A,B,C$ 恰好一个发生的概率；\n（4）事件 $A,B,C$ 恰好两个发生的概率；\n（5）事件 $A,B,C$ 全不发生的概率；\n（6）事件 $A,B,C$ 最多发生一个的概率。",
    "correctAnswer": "（1）$\\frac{7}{12}$；（2）$\\frac{1}{6}$；（3）$\\frac{5}{12}$；（4）$\\frac{1}{6}$；（5）$\\frac{5}{12}$；（6）$\\frac{5}{6}$。",
    "explanation": "首先，由 $ABC \\subset AB$ 及概率的非负性与单调性，得 $0 \\le P(ABC) \\le P(AB) = 0$，故 $P(ABC) = 0$。\n（1）至少一个发生：\n$$P(A\\cup B\\cup C) = P(A)+P(B)+P(C)-P(AB)-P(AC)-P(BC)+P(ABC) = \\frac{3}{4} - 0 - \\frac{1}{12} - \\frac{1}{12} + 0 = \\frac{7}{12}$$\n（2）至少两个发生，即事件 $AB\\cup AC\\cup BC$：\n$$P(AB\\cup AC\\cup BC) = P(AB)+P(AC)+P(BC)-2P(ABC) = 0 + \\frac{1}{12} + \\frac{1}{12} - 0 = \\frac{1}{6}$$\n（3）恰好一个发生 $=$ 至少一个发生 $-$ 至少两个发生：\n$$\\frac{7}{12} - \\frac{1}{6} = \\frac{5}{12}$$\n（4）恰好两个发生 $=$ 至少两个发生 $-$ 三个都发生：\n$$\\frac{1}{6} - P(ABC) = \\frac{1}{6} - 0 = \\frac{1}{6}$$\n（5）全不发生 $=$ $1 -$ 至少一个发生：\n$$P(\\bar{A}\\bar{B}\\bar{C}) = 1 - P(A\\cup B\\cup C) = 1 - \\frac{7}{12} = \\frac{5}{12}$$\n（6）最多发生一个 $=$ $1 -$ 至少发生两个：\n$$1 - \\frac{1}{6} = \\frac{5}{6}$$",
    "steps": [
      "利用包含关系 $ABC \\subset AB$ 与 $P(AB)=0$ 推出 $P(ABC)=0$",
      "应用三事件加法公式求至少一个发生的概率（$\frac{7}{12}$）与至少两个发生的概率（$\frac{1}{6}$）",
      "利用事件集合的互包含差关系依次求出恰好一个、恰好两个、全不发生及最多发生一个的概率"
    ],
    "keyPoints": [
      "三事件加法公式",
      "概率单调性",
      "复杂事件拆分"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "加法公式",
      "韦恩图",
      "三事件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "（1）（2018 数一）设随机事件 $A$ 与 $B$ 相互独立，$A$ 与 $C$ 相互独立，$BC=\\varnothing$，若 $P(A)=P(B)=\\frac{1}{2}$，$P(AC \\mid AB\\cup C)=\\frac{1}{4}$，求 $P(C)$。\n（2）（2025 数一）设 $A,B$ 为两个不同的随机事件，且相互独立，已知 $P(A)=2P(B)$，$P(A\\cup B)=\\frac{5}{8}$，则 $A,B$ 至少发生一个的条件下，$A,B$ 中恰好一个发生的概率为______。\n（3）设随机事件 $A$ 与 $B$ 互不相容，$B$ 与 $C$ 相互独立，且 $P(A)=P(B)=0.4$，$P(C)=0.5$，则 $P(C-A \\mid A\\cup BC)=$______。",
    "correctAnswer": "（1）$\\frac{1}{4}$；（2）$\\frac{4}{5}$；（3）$\\frac{1}{3}$。",
    "explanation": "（1）由条件概率定义及集合分配律：\n$$P(AC \\mid AB\\cup C) = \\frac{P(AC\\cap(AB\\cup C))}{P(AB\\cup C)} = \\frac{P(ABC\\cup AC)}{P(AB)+P(C)-P(ABC)}$$\n因为 $BC=\\varnothing$，故 $ABC=\\varnothing$，从而 $P(ABC)=0$。\n又 $A,B$ 独立 $\\implies P(AB)=P(A)P(B)=\\frac{1}{4}$；$A,C$ 独立 $\\implies P(AC)=P(A)P(C)=\\frac{1}{2}P(C)$。\n代入已知等式：\n$$\\frac{\\frac{1}{2}P(C)}{\\frac{1}{4}+P(C)} = \\frac{1}{4} \\implies 2P(C) = \\frac{1}{4} + P(C) \\implies P(C) = \\frac{1}{4}$$\n\n（2）设 $P(B)=p$，则 $P(A)=2p$。因 $A,B$ 相互独立：\n$$P(A\\cup B) = P(A)+P(B)-P(A)P(B) = 3p - 2p^2 = \\frac{5}{8}$$\n即 $16p^2 - 24p + 5 = 0 \\implies (4p-1)(4p-5)=0$。由于 $P(A)=2p\\le 1$，得 $p=\\frac{1}{4}$，故 $P(A)=\\frac{1}{2}, P(B)=\\frac{1}{4}, P(AB)=\\frac{1}{8}$。\n所求条件概率为：\n$$P((A\\cup B) - AB \\mid A\\cup B) = \\frac{P(A\\cup B)-P(AB)}{P(A\\cup B)} = \\frac{\\frac{5}{8}-\\frac{1}{8}}{\\frac{5}{8}} = \\frac{4}{5}$$\n\n（3）因为 $A,B$ 互不相容（$AB=\\varnothing$），所以 $B \\subset \\bar{A}$，且 $ABC=\\varnothing$。\n分子事件：$(C-A)\\cap(A\\cup BC) = C\\bar{A}A \\cup C\\bar{A}BC = \\varnothing \\cup \\bar{A}BC = BC$。\n分母：$P(A\\cup BC) = P(A) + P(BC) - P(ABC) = 0.4 + P(B)P(C) - 0 = 0.4 + 0.4\\times 0.5 = 0.6$。\n分子：$P(BC) = 0.4\\times 0.5 = 0.2$。\n故：\n$$P(C-A \\mid A\\cup BC) = \\frac{0.2}{0.6} = \\frac{1}{3}$$",
    "steps": [
      "第（1）问：展开条件概率分子分母，利用 $BC=\\varnothing$ 消去 $P(ABC)$ 并由独立性代入求解 $P(C)$",
      "第（2）问：设 $P(B)=p$ 建立二次方程求出 $P(A),P(B),P(AB)$，再利用条件概率公式求恰一个发生的比例",
      "第（3）问：利用 $AB=\\varnothing \\implies B\\subset\\bar{A}$ 化简分子交事件为 $BC$，分别计算分子与分母概率作比"
    ],
    "keyPoints": [
      "条件概率",
      "独立性与互不相容综合计算",
      "事件分配律"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2018真题",
      "2025真题",
      "条件概率",
      "独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "blank",
    "question": "设 $A,B$ 是两个随机事件，$P(A)=0.2$，$P(B\\mid A)=P(B\\mid\\bar{A})$，$P(A\\cup B)=0.6$，则 $P(\\bar{A}\\cup\\bar{B})=\\underline{\\hspace{2cm}}$.",
    "correctAnswer": "$0.9$",
    "explanation": "由 $P(A)=0.2>0$ 且 $P(\\bar{A})=0.8>0$，条件 $P(B\\mid A)=P(B\\mid\\bar{A})$ 是事件 $A$ 与 $B$ 相互独立的等价命题之一（验证：$P(B)=P(A)P(B\\mid A)+P(\\bar{A})P(B\\mid\\bar{A})=P(B\\mid A)$，故 $P(AB)=P(A)P(B)$）。\n利用加法公式：\n$$P(A\\cup B) = P(A)+P(B)-P(A)P(B) = 0.2 + P(B) - 0.2P(B) = 0.2 + 0.8P(B) = 0.6$$\n解得 $P(B)=0.5$，从而 $P(AB)=0.2\\times 0.5 = 0.1$。\n最后由德摩根律：\n$$P(\\bar{A}\\cup\\bar{B}) = P(\\overline{AB}) = 1 - P(AB) = 1 - 0.1 = 0.9$$",
    "steps": [
      "由等价条件 $P(B\\mid A)=P(B\\mid\\bar{A})$ 判断事件 $A$ 与 $B$ 相互独立",
      "代入加法公式求出 $P(B)=0.5$ 进而算出 $P(AB)=0.1$",
      "应用德摩根律转化为 $1-P(AB)$ 得 $0.9$"
    ],
    "keyPoints": [
      "独立性的条件概率等价命题",
      "德摩根律"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "独立性",
      "条件概率",
      "德摩根律"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "（李六）设随机事件 $A,B,C$ 两两独立，且三个事件不可能同时发生，若 $P(A)=P(B)=P(C)=p\\,(0<p<1)$，则正确的是（ ）",
    "options": [
      "A. $0<p\\le\\frac{1}{2}$",
      "B. $\\frac{1}{2}<p\\le 1$",
      "C. $p=1$",
      "D. $\\frac{1}{3}<p\\le 1$"
    ],
    "correctAnswer": "A",
    "explanation": "因为 $A,B,C$ 不可能同时发生，所以 $ABC=\\varnothing \\implies P(ABC)=0$。又 $A,B,C$ 两两独立，故 $P(AB)=P(AC)=P(BC)=p^2$。\n注意隐藏的非负约束：考虑事件 $A\\bar{B}\\bar{C} = A - (B\\cup C)$，其概率必非负：\n$$P(A - (B\\cup C)) = P(A) - P(A(B\\cup C)) = P(A) - [P(AB)+P(AC)-P(ABC)] = p - 2p^2 \\ge 0$$\n因为 $0 < p < 1$，两边除以 $p$ 得 $1 - 2p \\ge 0 \\implies p \\le \\frac{1}{2}$，即 $0 < p \\le \\frac{1}{2}$。\n（注：取等号 $p=\\frac{1}{2}$ 可以构造出来，例如样本空间 $\\Omega=\\{1,2,3,4\\}$ 等概，$A=\\{1,2\\}, B=\\{1,3\\}, C=\\{2,3\\}$，满足两两独立且 $ABC=\\varnothing$。）选 A。",
    "steps": [
      "由两两独立与 $ABC=\\varnothing$ 写出 $P(AB)=P(AC)=P(BC)=p^2$ 及 $P(ABC)=0$",
      "利用概率非负性 $P(A\\bar{B}\\bar{C}) \\ge 0$ 列出不等式 $p - 2p^2 \\ge 0$",
      "结合 $0<p<1$ 解得 $0 < p \\le \\frac{1}{2}$，选 A"
    ],
    "keyPoints": [
      "两两独立",
      "概率非负性隐含约束"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "两两独立",
      "参数范围",
      "李林六套卷"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "一袋中装有 10 个号码球，分别标有 $1\\sim 10$ 号，现从袋中任取 3 个球，记录其号码，求：\n（1）最小号码为 5 的概率；\n（2）最大号码为 5 的概率；\n（3）中间号码为 5 的概率。",
    "correctAnswer": "（1）$\\frac{1}{12}$；（2）$\\frac{1}{20}$；（3）$\\frac{1}{6}$。",
    "explanation": "从 10 个球中任取 3 个球，样本空间总基本事件数为 $C_{10}^3 = \\frac{10\\times 9\\times 8}{3\\times 2\\times 1} = 120$。\n（1）最小号码为 5：必取 5 号球，其余 2 个球从 $6\\sim 10$ 号（共 5 个球）中任取 2 个，有 $C_5^2 = 10$ 种取法，故概率为：\n$$P_1 = \\frac{C_5^2}{C_{10}^3} = \\frac{10}{120} = \\frac{1}{12}$$\n（2）最大号码为 5：必取 5 号球，其余 2 个球从 $1\\sim 4$ 号（共 4 个球）中任取 2 个，有 $C_4^2 = 6$ 种取法，故概率为：\n$$P_2 = \\frac{C_4^2}{C_{10}^3} = \\frac{6}{120} = \\frac{1}{20}$$\n（3）中间号码为 5：必取 5 号球，另外 1 个球从 $1\\sim 4$ 号中取，1 个球从 $6\\sim 10$ 号中取，有 $C_4^1 C_5^1 = 20$ 种取法，故概率为：\n$$P_3 = \\frac{C_4^1 C_5^1}{C_{10}^3} = \\frac{20}{120} = \\frac{1}{6}$$",
    "steps": [
      "计算样本空间总组合数 $C_{10}^3 = 120$",
      "分别固定 5 号球，按最小、最大、中间号码限制其余两球的可选范围计算有利事件数",
      "利用古典概型公式作比并化简分数"
    ],
    "keyPoints": [
      "古典概型",
      "组合计数",
      "顺序统计量思想"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "古典概型",
      "组合数",
      "取球问题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "（2016 数三）设袋中有红、白、黑球各一个，从中有放回地取球，每次取一个，直到三种颜色的球都取到时停止，求取球次数恰好为 4 的概率。",
    "correctAnswer": "$\\frac{2}{9}$",
    "explanation": "有放回取球 4 次，每次有 3 种选择，基本事件总数为 $3^4 = 81$。\n事件 $A = \\{\\text{取球次数恰好为 } 4\\}$ 等价于：前 3 次恰好取到了 2 种颜色（两种颜色均至少出现 1 次），第 4 次恰好取到剩余的第 3 种颜色。\n分步计数：\n1. 从 3 种颜色中选 1 种作为第 4 次取到的颜色，有 $C_3^1 = 3$ 种选法；\n2. 前 3 次必须在剩下的 2 种颜色中取球（共有 $2^3$ 种取法），且不能 3 次全取同一种颜色（排除全红/全白/全黑中的 2 种），故前 3 次共有 $2^3 - 2 = 6$ 种取法。\n因此有利基本事件数为 $3 \\times 6 = 18$，所求概率为：\n$$P(A) = \\frac{18}{81} = \\frac{2}{9}$$",
    "steps": [
      "明确有放回取 4 次的样本空间总数为 $3^4 = 81$",
      "刻画“第 4 次停止”条件：前 3 次恰出现两种颜色且第 4 次出现第三种颜色",
      "用排除法算出前 3 次取法为 $C_3^1(2^3 - 2) = 18$，作比得 $\\frac{2}{9}$"
    ],
    "keyPoints": [
      "古典概型",
      "有放回抽样",
      "停止时刻计数"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2016真题",
      "数三",
      "古典概型",
      "取球问题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-11",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "从区间 $(0,1)$ 内随机取两个数。\n（1）求 $A=\\left\\{\\text{两数之和小于}\\frac{6}{5}\\right\\}$ 的概率；\n（2）求 $B=\\left\\{\\text{两数之差的绝对值小于}\\frac{1}{2}\\right\\}$ 的概率。",
    "correctAnswer": "（1）$\\frac{17}{25}$；（2）$\\frac{3}{4}$。",
    "explanation": "设所取两数分别为 $x, y$，则样本空间为平面区域 $\\Omega = \\{(x,y) \\mid 0 < x < 1,\\; 0 < y < 1\\}$，为单位正方形，面积 $S_\\Omega = 1$。\n（1）$A = \\{(x,y)\\in\\Omega \\mid x+y < \\frac{6}{5}\\}$。其对立区域 $\\bar{A} = \\{(x,y)\\in\\Omega \\mid x+y \\ge \\frac{6}{5}\\}$ 是以 $(1,1), (1,\\frac{1}{5}), (\\frac{1}{5},1)$ 为顶点的直角三角形，两条直角边长均为 $1 - \\frac{1}{5} = \\frac{4}{5}$，面积为 $\\frac{1}{2}\\times\\left(\\frac{4}{5}\\right)^2 = \\frac{8}{25}$。\n故\n$$P(A) = 1 - \\frac{S_{\\bar{A}}}{S_\\Omega} = 1 - \\frac{8}{25} = \\frac{17}{25}$$\n（2）$B = \\{(x,y)\\in\\Omega \\mid |x-y| < \\frac{1}{2}\\}$。其对立区域 $\\bar{B}$ 由 $x - y \\ge \\frac{1}{2}$ 和 $y - x \\ge \\frac{1}{2}$ 两个全等直角三角形构成，直角边长均为 $1 - \\frac{1}{2} = \\frac{1}{2}$，面积和为 $2\\times\\frac{1}{2}\\times\\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$。\n故\n$$P(B) = 1 - \\frac{S_{\\bar{B}}}{S_\\Omega} = 1 - \\frac{1}{4} = \\frac{3}{4}$$",
    "steps": [
      "建立平面直角坐标系，确定样本空间为单位正方形 $S_\\Omega=1$",
      "分别画出 $x+y<\\frac{6}{5}$ 与 $|x-y|<\\frac{1}{2}$ 对应的区域（利用补集三角形更易计算）",
      "利用面积之比求得几何概型概率分别为 $\\frac{17}{25}$ 与 $\\frac{3}{4}$"
    ],
    "keyPoints": [
      "几何概型",
      "数形结合",
      "补集面积法"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "几何概型",
      "面积比"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-12",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "（1）某人向同一目标接连进行 3 次独立重复射击，假设至少命中目标一次的概率为 $\\frac{7}{8}$，求单次射击命中目标的概率 $p$。\n（2）某人向同一目标独立重复射击，每次射击命中的概率为 $p$，则此人第 6 次射击恰好第 2 次命中的概率为多少。",
    "correctAnswer": "（1）$p = \\frac{1}{2}$；（2）$5p^2(1-p)^4$。",
    "explanation": "（1）“3 次独立重复射击至少命中 1 次”的对立事件是“3 次均未命中”，其概率为 $(1-p)^3$。\n由题意：\n$$1 - (1-p)^3 = \\frac{7}{8} \\implies (1-p)^3 = \\frac{1}{8} \\implies 1-p = \\frac{1}{2} \\implies p = \\frac{1}{2}$$\n（2）“第 6 次射击恰好第 2 次命中”等价于两件独立事件同时发生：\n- 前 5 次独立重复射击中恰好命中 1 次，概率为 $C_5^1 p^1 (1-p)^4 = 5p(1-p)^4$；\n- 第 6 次射击命中，概率为 $p$。\n因此所求概率为：\n$$C_5^1 p(1-p)^4 \\cdot p = 5p^2(1-p)^4$$",
    "steps": [
      "第（1）问：转化为对立事件“三次均不中”，由 $1-(1-p)^3=\\frac{7}{8}$ 解得 $p=\\frac{1}{2}$",
      "第（2）问：拆分“前 5 次恰中 1 次”与“第 6 次命中”两个独立事件，应用二项概率公式相乘"
    ],
    "keyPoints": [
      "伯努利概型",
      "二项概率公式",
      "帕斯卡分布思想"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "伯努利概型",
      "二项概率",
      "独立重复试验"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-13",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "analysis",
    "question": "设有甲、乙、丙三门炮，同时独立地射击某目标，各炮的命中率分别为 $0.2, 0.3$ 和 $0.5$。目标被命中一发就被击毁的概率为 $0.2$，命中两发被击毁的概率为 $0.6$，命中三发被击毁的概率为 $0.9$。\n（1）求三门炮在一次射击中击毁目标的概率；\n（2）在目标被击毁的条件下，求被命中一发的概率。",
    "correctAnswer": "（1）$0.253$（即 $\\frac{253}{1000}$）；（2）$\\frac{94}{253}$（约 $0.3715$）。",
    "explanation": "记 $H_i$ 为“目标恰好被命中 $i$ 发”（$i=0,1,2,3$），构成完备事件组；记 $B$ 为“目标被击毁”。已知 $P(B\\mid H_0)=0, P(B\\mid H_1)=0.2, P(B\\mid H_2)=0.6, P(B\\mid H_3)=0.9$。\n由三门炮独立射击计算各 $P(H_i)$：\n- $P(H_1) = 0.2\\times 0.7\\times 0.5 + 0.8\\times 0.3\\times 0.5 + 0.8\\times 0.7\\times 0.5 = 0.07 + 0.12 + 0.28 = 0.47$；\n- $P(H_2) = 0.2\\times 0.3\\times 0.5 + 0.2\\times 0.7\\times 0.5 + 0.8\\times 0.3\\times 0.5 = 0.03 + 0.07 + 0.12 = 0.22$；\n- $P(H_3) = 0.2\\times 0.3\\times 0.5 = 0.03$。\n（1）由全概率公式：\n$$P(B) = \\sum_{i=1}^3 P(H_i)P(B\\mid H_i) = 0.47\\times 0.2 + 0.22\\times 0.6 + 0.03\\times 0.9 = 0.094 + 0.132 + 0.027 = 0.253$$\n（2）由贝叶斯公式：\n$$P(H_1\\mid B) = \\frac{P(H_1)P(B\\mid H_1)}{P(B)} = \\frac{0.094}{0.253} = \\frac{94}{253}$$",
    "steps": [
      "以命中发数 $H_0,H_1,H_2,H_3$ 划分完备事件组，分别算出 $P(H_1)=0.47, P(H_2)=0.22, P(H_3)=0.03$",
      "运用全概率公式求目标被击毁的概率 $P(B)=0.253$",
      "运用贝叶斯公式计算后验概率 $P(H_1\\mid B)=\\frac{94}{253}$"
    ],
    "keyPoints": [
      "全概率公式",
      "贝叶斯公式",
      "完备事件组划分"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "全概率公式",
      "贝叶斯公式",
      "独立射击"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-1-14",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机事件与概率",
    "type": "blank",
    "question": "从数 $1,2,3,4$ 中任取一个数，记为 $X$，再从 $1,\\cdots,X$ 中任取一个数，记为 $Y$，则 $P\\{Y=2\\}=\\underline{\\hspace{2cm}}$.",
    "correctAnswer": "$\\frac{13}{48}$",
    "explanation": "事件 $\\{X=1\\},\\{X=2\\},\\{X=3\\},\\{X=4\\}$ 构成完备事件组，且 $P\\{X=k\\}=\\frac{1}{4}\\,(k=1,2,3,4)$。\n条件概率分别为：$P\\{Y=2\\mid X=1\\}=0$，$P\\{Y=2\\mid X=2\\}=\\frac{1}{2}$，$P\\{Y=2\\mid X=3\\}=\\frac{1}{3}$，$P\\{Y=2\\mid X=4\\}=\\frac{1}{4}$。\n由全概率公式：\n$$P\\{Y=2\\} = \\sum_{k=1}^4 P\\{X=k\\}P\\{Y=2\\mid X=k\\} = \\frac{1}{4}\\left(0 + \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4}\\right) = \\frac{1}{4}\\cdot\\frac{13}{12} = \\frac{13}{48}$$",
    "steps": [
      "将第一次取数结果 $\\{X=k\\}\\,(k=1,2,3,4)$ 作为完备事件组",
      "写出各条件下第二次取到 $2$ 的条件概率 $P\\{Y=2\\mid X=k\\}$",
      "代入全概率公式求和得 $\\frac{13}{48}$"
    ],
    "keyPoints": [
      "全概率公式",
      "两阶段随机试验"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "全概率公式",
      "条件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（2010）设随机变量 $X$ 的分布函数\n$$F(x)=\\begin{cases} 0, & x<0 \\\\ \\frac{1}{2}, & 0\\le x<1 \\\\ 1-e^{-x}, & x\\ge 1 \\end{cases}$$\n求 $P\\{X=1\\}$。",
    "correctAnswer": "$\\frac{1}{2} - e^{-1}$",
    "explanation": "根据分布函数计算单点概率的公式 $P\\{X=a\\} = F(a) - F(a-0)$：\n- 在 $x=1$ 处的函数值（右极限）：$F(1) = 1 - e^{-1}$；\n- 在 $x=1$ 处的左极限：$F(1-0) = \\lim\\limits_{x\\to 1^-} F(x) = \\frac{1}{2}$。\n因此：\n$$P\\{X=1\\} = F(1) - F(1-0) = (1 - e^{-1}) - \\frac{1}{2} = \\frac{1}{2} - e^{-1}$$",
    "steps": [
      "回忆单点概率公式 $P\\{X=1\\} = F(1) - F(1-0)$",
      "分别求出 $F(1) = 1 - e^{-1}$ 与左极限 $F(1-0) = \\frac{1}{2}$",
      "作差得到 $\\frac{1}{2} - e^{-1}$"
    ],
    "keyPoints": [
      "分布函数计算单点概率",
      "混合型随机变量"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2010真题",
      "分布函数",
      "间断点跳跃度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "判断下列函数是否是某一随机变量的分布函数：\n（1）$F(x)=\\begin{cases} 0, & x<0 \\\\ \\frac{1}{2}, & 0\\le x\\le 1 \\\\ 1, & x>1 \\end{cases}$；\n（2）$F(x)=\\frac{1}{\\pi}\\arctan x$；\n（3）$F(x)=\\begin{cases} 0, & x<0 \\\\ \\sin x, & 0\\le x<\\frac{\\pi}{2} \\\\ 1, & x\\ge\\frac{\\pi}{2} \\end{cases}$；\n（4）$F(x)=\\begin{cases} 0, & x<0 \\\\ \\frac{1-x}{2}, & 0\\le x<1 \\\\ 1, & x\\ge 1 \\end{cases}$；\n（5）$F(x)=\\begin{cases} \\frac{1}{2}e^x, & x<0 \\\\ 1-\\frac{1}{2}e^{-x}, & x\\ge 0 \\end{cases}$。",
    "correctAnswer": "（1）不是；（2）不是；（3）是；（4）不是；（5）是。",
    "explanation": "分布函数的充要条件为：① 有界规范性（$0\\le F(x)\\le 1$，$F(-\\infty)=0, F(+\\infty)=1$）；② 单调不减；③ 右连续。\n逐一检验：\n（1）在 $x=1$ 处，$F(1)=\\frac{1}{2}$，而右极限 $F(1+0)=\\lim\\limits_{x\\to 1^+}F(x)=1\\neq F(1)$，不满足**右连续性**，故**不是**。\n（2）$\\lim\\limits_{x\\to -\\infty} \\frac{1}{\\pi}\\arctan x = -\\frac{1}{2} \\neq 0$（且 $x<0$ 时函数值为负），不满足规范性与非负性，故**不是**。\n（3）$x<0$ 时为 $0$，$[0,\\frac{\\pi}{2})$ 上 $\\sin x$ 单调递增且从 $0$ 增至 $1$，$x\\ge\\frac{\\pi}{2}$ 时恒为 $1$，全实轴单调不减、处处连续（当然右连续），且 $F(-\\infty)=0, F(+\\infty)=1$，故**是**。\n（4）在 $[0,1)$ 上，$F(x)=\\frac{1-x}{2}$ 单调递减（如 $F(0)=\\frac{1}{2} > F(\\frac{1}{2})=\\frac{1}{4}$），不满足**单调不减性**，故**不是**。\n（5）$x<0$ 时 $\\frac{1}{2}e^x$ 单调递增且 $\\lim\\limits_{x\\to-\\infty}F(x)=0, \\lim\\limits_{x\\to 0^-}F(x)=\\frac{1}{2}$；$x\\ge 0$ 时 $1-\\frac{1}{2}e^{-x}$ 单调递增且 $F(0)=\\frac{1}{2}, \\lim\\limits_{x\\to+\\infty}F(x)=1$。在 $x=0$ 处连续，全实轴单调不减、右连续且满足规范性，故**是**（双指数分布）。",
    "steps": [
      "明确分布函数三条充要性质：规范性（$0,1$ 极限）、单调不减性、右连续性",
      "针对每道小题逐条核验分段点左右极限、单调性与无穷远极限",
      "判定（3）（5）满足全部性质，（1）不右连续、（2）值域与极限不对、（4）非单调不减"
    ],
    "keyPoints": [
      "分布函数的充要条件",
      "右连续性",
      "单调不减性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "分布函数判定",
      "充要条件",
      "基本概念"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "设 $X_1,X_2$ 是任意两个随机变量，分布函数分别为 $F_1(x)$ 和 $F_2(x)$，则下列命题正确的是（ ）",
    "options": [
      "A. $F_1(x)+F_2(x)$ 必为某一随机变量的分布函数；",
      "B. $\\frac{1}{3}F_1(x)+\\frac{2}{3}F_2(x)$ 必为某一随机变量的分布函数；",
      "C. $\\frac{5}{3}F_1(x)-\\frac{2}{3}F_2(x)$ 必为某一随机变量的分布函数；",
      "D. $F_1(x^2)$ 必为某一随机变量的分布函数；",
      "E. $1-F_1(-x)$ 必为某一随机变量的分布函数；",
      "F. $F_1(x)F_2(x)$ 必为某一随机变量的分布函数；",
      "G. $\\frac{1}{2}F_1(x)F_2(x)$ 必为某一随机变量的分布函数。"
    ],
    "correctAnswer": "BF",
    "explanation": "本题为多选辨析题，正确选项为 B、F。\n逐项依据分布函数三条充要性质（规范极限 $0$ 和 $1$、单调不减、右连续）检验：\n- A 错：$\\lim\\limits_{x\\to+\\infty}[F_1(x)+F_2(x)] = 1+1 = 2 \\neq 1$。\n- B 对：正系数凸组合（$\\frac{1}{3}+\\frac{2}{3}=1$），显然单调不减、右连续，且在 $-\\infty,+\\infty$ 极限分别为 $0$ 和 $1$，必为分布函数。\n- C 错：虽然极限为 $0$ 和 $1$，但未必非负也未必单调不减。例如取 $P(X_1=2)=1, P(X_2=1)=1$，则在 $x=1$ 处值为 $-\\frac{2}{3}<0$。\n- D 错：$x\\to -\\infty$ 时 $x^2\\to +\\infty$，故 $\\lim\\limits_{x\\to-\\infty}F_1(x^2)=1\\neq 0$，且在 $x<0$ 区间单调不增。\n- E 错（高频陷阱）：当 $X_1$ 非连续型时，$1-F_1(-x)$ 在跳跃点处变为**左连续**而非右连续。例如取 $P(X_1=0)=1$，则 $F_1(x)=\\begin{cases}0,&x<0\\\\1,&x\\ge 0\\end{cases}$，此时 $1-F_1(-x)=\\begin{cases}0,&x\\le 0\\\\1,&x>0\\end{cases}$，在 $x=0$ 处值为 $0\\neq 1=\\lim\\limits_{x\\to 0^+}[1-F_1(-x)]$。\n- F 对：非负、单调不减、右连续函数的乘积仍非负、单调不减、右连续，且在 $\\pm\\infty$ 极限分别为 $0\\cdot 0=0$ 和 $1\\cdot 1=1$（等价于取独立同分布于 $F_1,F_2$ 的随机变量 $\\max\\{Y_1,Y_2\\}$ 的分布函数）。\n- G 错：$\\lim\\limits_{x\\to+\\infty}\\frac{1}{2}F_1(x)F_2(x)=\\frac{1}{2}\\neq 1$。",
    "steps": [
      "检验各选项在 $\\pm\\infty$ 处的极限是否分别为 $0$ 和 $1$（直接排除 A、D、G）",
      "检查减法组合 C 的非负与单调性，构造反例排除 C",
      "针对一般随机变量（含离散跳跃点），检验 E 的右连续性并举反例排除 E",
      "验证凸组合 B 与乘积 F 均严格满足三条充要性质"
    ],
    "keyPoints": [
      "分布函数三条充要性质",
      "分布函数凸组合与乘积",
      "离散跳跃点右连续陷阱"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "分布函数性质",
      "多选辨析",
      "易错题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的分布律为：\n$X$ 取值为 $1, 4, 6, 10$，对应概率 $P$ 依次为 $\\frac{2}{6}, \\frac{1}{6}, a, \\frac{1}{6}$。\n求：（1）$a$ 的值；（2）$X$ 的分布函数；（3）$P\\{2<X\\le 6\\}$。",
    "correctAnswer": "（1）$a=\\frac{1}{3}$；（2）$F(x)=\\begin{cases}0, & x<1 \\\\ \\frac{1}{3}, & 1\\le x<4 \\\\ \\frac{1}{2}, & 4\\le x<6 \\\\ \\frac{5}{6}, & 6\\le x<10 \\\\ 1, & x\\ge 10\\end{cases}$；（3）$\\frac{1}{2}$。",
    "explanation": "（1）由分布律的规范性 $\\sum p_i = 1$：\n$$\\frac{2}{6} + \\frac{1}{6} + a + \\frac{1}{6} = 1 \\implies a = \\frac{2}{6} = \\frac{1}{3}$$\n（2）按左闭右开分段累加求分布函数 $F(x)=P\\{X\\le x\\}$：\n- 当 $x < 1$ 时，$F(x) = 0$；\n- 当 $1\\le x < 4$ 时，$F(x) = \\frac{2}{6} = \\frac{1}{3}$；\n- 当 $4\\le x < 6$ 时，$F(x) = \\frac{2}{6} + \\frac{1}{6} = \\frac{1}{2}$；\n- 当 $6\\le x < 10$ 时，$F(x) = \\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$；\n- 当 $x \\ge 10$ 时，$F(x) = \\frac{5}{6} + \\frac{1}{6} = 1$。\n（3）$P\\{2<X\\le 6\\} = P\\{X=4\\} + P\\{X=6\\} = \\frac{1}{6} + \\frac{1}{3} = \\frac{1}{2}$（也可由 $F(6)-F(2)=\\frac{5}{6}-\\frac{1}{3}=\\frac{1}{2}$ 得到）。",
    "steps": [
      "由概率总和为 $1$ 解出参数 $a=\\frac{1}{3}$",
      "按取值 $1,4,6,10$ 划分左闭右开区间分段累加概率得到阶梯分布函数",
      "累加区间 $(2,6]$ 内的取值概率或使用 $F(6)-F(2)$ 求得 $\\frac{1}{2}$"
    ],
    "keyPoints": [
      "离散型分布律规范性",
      "离散型分布函数求法"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "离散型随机变量",
      "分布律",
      "分布函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "blank",
    "question": "设随机变量 $X$ 的分布律为 $P\\{X=k\\}=\\frac{1}{2^k},\\,k=1,2,\\cdots$，则 $P\\{X=\\text{偶数}\\}=\\underline{\\hspace{2cm}}$，$P\\{X\\ge 5\\}=\\underline{\\hspace{2cm}}$。",
    "correctAnswer": "$\\frac{1}{3}$；$\\frac{1}{16}$",
    "explanation": "利用无穷等比级数求和公式 $\\sum\\limits_{n=0}^{\\infty} a q^n = \\frac{a}{1-q}\\,(|q|<1)$：\n1. 求 $P\\{X=\\text{偶数}\\}$：\n$$P\\{X=\\text{偶数}\\} = \\sum_{m=1}^{\\infty} P\\{X=2m\\} = \\sum_{m=1}^{\\infty} \\frac{1}{2^{2m}} = \\frac{\\frac{1}{4}}{1 - \\frac{1}{4}} = \\frac{1}{3}$$\n2. 求 $P\\{X\\ge 5\\}$：\n$$P\\{X\\ge 5\\} = \\sum_{k=5}^{\\infty} \\frac{1}{2^k} = \\frac{\\frac{1}{2^5}}{1 - \\frac{1}{2}} = \\frac{1}{16}$$",
    "steps": [
      "将事件 $\\{X=\\text{偶数}\\}$ 表示为无穷可列互斥事件之并并应用等比级数求和",
      "同理将 $\\{X\\ge 5\\}$ 转化为首项为 $\\frac{1}{32}$、公比为 $\\frac{1}{2}$ 的等比级数求和得 $\\frac{1}{16}$"
    ],
    "keyPoints": [
      "可列可加性",
      "无穷等比级数求和"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "离散型随机变量",
      "等比级数",
      "分布律"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "设 $X_1,X_2$ 是任意两个连续型随机变量，概率密度分别为 $f_1(x)$ 和 $f_2(x)$，分布函数分别为 $F_1(x)$ 和 $F_2(x)$，则下列命题正确的是（ ）",
    "options": [
      "A. $f_1(2x)$ 必为某一随机变量的概率密度",
      "B. $f_1(x)+f_2(x)$ 必为某一随机变量的概率密度",
      "C. $\\frac{1}{3}f_1(x)+\\frac{2}{3}f_2(x)$ 必为某一随机变量的概率密度",
      "D. $\\frac{5}{3}f_1(x)-\\frac{2}{3}f_2(x)$ 必为某一随机变量的概率密度",
      "E. $f_1(x)f_2(x)$ 必为某一随机变量的概率密度",
      "F. $2f_1(x)F_1(x)$ 必为某一随机变量的概率密度",
      "G. $\\frac{1}{2}[f_1(x)+f_1(-x)]$ 必为某一随机变量的概率密度",
      "H. $f_1(x)F_1(x)+f_2(x)F_2(x)$ 必为某一随机变量的概率密度"
    ],
    "correctAnswer": "CFGH",
    "explanation": "本题为多选辨析题，正确选项为 C、F、G、H。\n概率密度的充要条件为：① 非负性（$\\ge 0$）；② 规范性（$\\int_{-\\infty}^{+\\infty} f(x)\\,\\mathrm{d}x = 1$）。\n逐项检验：\n- A 错：$\\int_{-\\infty}^{+\\infty} f_1(2x)\\,\\mathrm{d}x = \\frac{1}{2}\\int_{-\\infty}^{+\\infty} f_1(u)\\,\\mathrm{d}u = \\frac{1}{2} \\neq 1$。\n- B 错：$\\int_{-\\infty}^{+\\infty} [f_1(x)+f_2(x)]\\,\\mathrm{d}x = 1+1 = 2 \\neq 1$。\n- C 对：非负，且 $\\int_{-\\infty}^{+\\infty}\\left(\\frac{1}{3}f_1(x)+\\frac{2}{3}f_2(x)\\right)\\mathrm{d}x = \\frac{1}{3}+\\frac{2}{3}=1$。\n- D 错：可能存在某区间 $f_1(x)=0$ 而 $f_2(x)>0$，导致函数值为负，违反非负性。\n- E 错：乘积积分一般不等于 $1$（例如两个互相不重叠的均匀分布密度之积恒为 $0$，积分为 $0$）。\n- F 对：因为 $f_1(x)\\ge 0, F_1(x)\\ge 0$，故 $2f_1(x)F_1(x)\\ge 0$；且\n$$\\int_{-\\infty}^{+\\infty} 2f_1(x)F_1(x)\\,\\mathrm{d}x = \\int_{-\\infty}^{+\\infty} 2F_1(x)\\,\\mathrm{d}F_1(x) = \\left[F_1^2(x)\\right]_{-\\infty}^{+\\infty} = 1^2 - 0^2 = 1$$\n- G 对：显然非负，且令 $u=-x$ 得 $\\int_{-\\infty}^{+\\infty} f_1(-x)\\,\\mathrm{d}x = \\int_{-\\infty}^{+\\infty} f_1(u)\\,\\mathrm{d}u = 1$，故总积分为 $\\frac{1}{2}(1+1)=1$。\n- H 对：各项非负，且由 F 的积分结论 $\\int_{-\\infty}^{+\\infty} f_i(x)F_i(x)\\,\\mathrm{d}x = \\frac{1}{2}$，故总积分为 $\\frac{1}{2}+\\frac{1}{2}=1$。",
    "steps": [
      "依据概率密度的两个充要条件（非负性与全轴积分为 1）逐项验证",
      "利用换元法排除 A，利用积分线性性排除 B 并确认 C、G",
      "利用反例排除负项 D 与乘积 E，利用凑微分 $\\mathrm{d}F_i(x)=f_i(x)\\,\\mathrm{d}x$ 确认 F、H"
    ],
    "keyPoints": [
      "概率密度的充要条件",
      "凑微分求广义积分"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "概率密度判定",
      "充要条件",
      "多选辨析"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "设连续型随机变量 $X$ 的分布函数为 $F(x)$，概率密度为 $f(x)$，而且 $X$ 与 $-X$ 有相同的分布函数，则（ ）",
    "options": [
      "A. $F(x)=F(-x)$",
      "B. $F(x)=-F(-x)$",
      "C. $f(x)=f(-x)$",
      "D. $f(x)=-f(-x)$"
    ],
    "correctAnswer": "C",
    "explanation": "由连续型随机变量 $X$ 与 $-X$ 同分布，对任意实数 $x$ 有：\n$$F(x) = F_{-X}(x) = P\\{-X \\le x\\} = P\\{X \\ge -x\\} = 1 - P\\{X < -x\\} = 1 - F(-x)$$\n由此可得 $F(x) + F(-x) = 1$（例如 $F(0)=\\frac{1}{2}$，排除 A、B）。\n对 $F(x) = 1 - F(-x)$ 两边关于 $x$ 求导（在连续点处），得：\n$$f(x) = -f(-x)\\cdot(-1) = f(-x)$$\n即密度函数为偶函数（排除 D）。选 C。",
    "steps": [
      "利用 $F_{-X}(x) = P\\{-X\\le x\\} = 1 - F(-x)$ 建立方程 $F(x) = 1 - F(-x)$",
      "取特殊点（如 $x=0$ 得 $F(0)=\\frac{1}{2}$）排除 A、B",
      "两边求导得到 $f(x) = f(-x)$，选 C"
    ],
    "keyPoints": [
      "随机变量函数的分布函数",
      "对称分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "连续型随机变量",
      "对称分布",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "（李艳芳 900 题）设随机变量 $X$ 的概率密度为 $f(x)$，则下列说法中正确的是（ ）",
    "options": [
      "A. $\\frac{1}{2}f\\left(\\frac{1}{2}x\\right)$ 是随机变量 $\\frac{X}{2}$ 的概率密度。",
      "B. $2f(2x)$ 是随机变量 $\\frac{X}{2}$ 的概率密度。",
      "C. $2f\\left(\\frac{1}{2}x\\right)$ 是随机变量 $\\frac{X}{2}$ 的概率密度。",
      "D. $\\frac{1}{2}f(2x)$ 是随机变量 $\\frac{X}{2}$ 的概率密度。"
    ],
    "correctAnswer": "B",
    "explanation": "设 $Y = \\frac{X}{2}$，利用分布函数法求 $Y$ 的分布函数：\n$$F_Y(y) = P\\{Y\\le y\\} = P\\left\\{\\frac{X}{2}\\le y\\right\\} = P\\{X\\le 2y\\} = F_X(2y)$$\n对 $y$ 求导得 $Y$ 的概率密度：\n$$f_Y(y) = F_Y'(y) = [F_X(2y)]' = 2f(2y)$$\n将自变量记作 $x$，即 $2f(2x)$ 是随机变量 $\\frac{X}{2}$ 的概率密度。选 B。",
    "steps": [
      "设 $Y = \\frac{X}{2}$，写出分布函数 $F_Y(y) = P\\{X \\le 2y\\} = F_X(2y)$",
      "由链式法则对 $y$ 求导得 $f_Y(y) = 2f(2y)$，选 B"
    ],
    "keyPoints": [
      "线性变换随机变量的概率密度",
      "分布函数法"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "随机变量函数",
      "线性变换",
      "李艳芳900题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "设随机变量 $X$ 的概率密度为 $f(x)$，且 $f(-x)=f(x)$，$X$ 的分布函数为 $F(x)$，则对任意实数 $k$，有（ ）",
    "options": [
      "A. $F(-k)=1-\\int_0^k f(x)\\mathrm{d}x$",
      "B. $F(-k)=\\frac{1}{2}-\\int_0^k f(x)\\mathrm{d}x$",
      "C. $F(-k)=2F(k)-1$",
      "D. $F(-k)=F(k)$"
    ],
    "correctAnswer": "B",
    "explanation": "因为 $f(x)$ 是偶函数且 $\\int_{-\\infty}^{+\\infty} f(x)\\,\\mathrm{d}x = 1$，所以\n$$\\int_{-\\infty}^0 f(x)\\,\\mathrm{d}x = \\int_0^{+\\infty} f(x)\\,\\mathrm{d}x = \\frac{1}{2}$$\n于是对任意实数 $k$（无论正负）：\n$$F(-k) = \\int_{-\\infty}^{-k} f(x)\\,\\mathrm{d}x = \\int_{-\\infty}^0 f(x)\\,\\mathrm{d}x + \\int_0^{-k} f(x)\\,\\mathrm{d}x = \\frac{1}{2} - \\int_{-k}^0 f(x)\\,\\mathrm{d}x$$\n令 $t = -x$，由偶函数性质 $f(-t)=f(t)$，得 $\\int_{-k}^0 f(x)\\,\\mathrm{d}x = \\int_0^k f(t)\\,\\mathrm{d}t$，故：\n$$F(-k) = \\frac{1}{2} - \\int_0^k f(x)\\,\\mathrm{d}x$$\n选 B。",
    "steps": [
      "由 $f(x)$ 为偶函数且全轴积分为 $1$，得出 $\\int_{-\\infty}^0 f(x)\\,\\mathrm{d}x = \\frac{1}{2}$",
      "将 $F(-k) = \\int_{-\\infty}^{-k} f(x)\\,\\mathrm{d}x$ 拆分为 $\\int_{-\\infty}^0 + \\int_0^{-k}$",
      "换元并利用偶函数性质得 $F(-k) = \\frac{1}{2} - \\int_0^k f(x)\\,\\mathrm{d}x$，选 B"
    ],
    "keyPoints": [
      "偶函数概率密度",
      "分布函数对称关系"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "对称性",
      "分布函数",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（2018）设随机变量 $X$ 的概率密度 $f(x)$ 满足 $f(1+x)=f(1-x)$，且 $\\int_0^2 f(x)\\mathrm{d}x = 0.6$，求 $P\\{X<0\\}$。",
    "correctAnswer": "$0.2$",
    "explanation": "由 $f(1+x)=f(1-x)$ 可知，概率密度曲线 $y=f(x)$ 关于直线 $x=1$ 对称。\n因此 $X$ 落在 $x=1$ 左侧无穷区间与右侧对称无穷区间上的概率相等，且以 $x=1$ 为对称中心：\n$$P\\{X < 0\\} = P\\{X > 2\\}$$\n又由概率规范性：\n$$P\\{X < 0\\} + \\int_0^2 f(x)\\,\\mathrm{d}x + P\\{X > 2\\} = 1$$\n代入 $\\int_0^2 f(x)\\,\\mathrm{d}x = 0.6$，得：\n$$2P\\{X < 0\\} + 0.6 = 1 \\implies P\\{X < 0\\} = 0.2$$",
    "steps": [
      "由 $f(1+x)=f(1-x)$ 识别密度函数关于 $x=1$ 对称",
      "利用对称性得出 $P\\{X<0\\}=P\\{X>2\\}$",
      "结合全空间总概率为 $1$ 解得 $P\\{X<0\\} = \\frac{1-0.6}{2} = 0.2$"
    ],
    "keyPoints": [
      "概率密度的轴对称性",
      "规范性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2018真题",
      "对称性",
      "概率计算"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-11",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设连续型随机变量 $X$ 的分布函数为\n$$F(x)=\\begin{cases} k_1, & x\\le -a, \\\\ k_2+k_3\\arcsin\\frac{x}{a}, & -a<x\\le a, \\\\ k_4, & x>a, \\end{cases}$$\n其中 $a>0$。求：\n（1）常数 $k_1,k_2,k_3,k_4$ 的值；\n（2）$X$ 的概率密度；\n（3）$P\\left\\{|X|<\\frac{a}{2}\\right\\}$。",
    "correctAnswer": "（1）$k_1=0,\\; k_2=\\frac{1}{2},\\; k_3=\\frac{1}{\\pi},\\; k_4=1$；（2）$f(x)=\\begin{cases}\\frac{1}{\\pi\\sqrt{a^2-x^2}}, & -a<x<a \\\\ 0, & \\text{其他}\\end{cases}$；（3）$\\frac{1}{3}$。",
    "explanation": "（1）由分布函数的规范性：\n$$k_1 = F(-\\infty) = 0, \\qquad k_4 = F(+\\infty) = 1$$\n因为 $X$ 为连续型随机变量，故 $F(x)$ 在实轴上处处连续。在分段点 $x=-a$ 与 $x=a$ 处连续：\n- 在 $x=-a$ 处：$F(-a+0) = k_2 + k_3\\arcsin(-1) = k_2 - \\frac{\\pi}{2}k_3 = F(-a) = 0$；\n- 在 $x=a$ 处：$F(a) = k_2 + k_3\\arcsin(1) = k_2 + \\frac{\\pi}{2}k_3 = F(a+0) = 1$。\n两式相加得 $2k_2 = 1 \\implies k_2 = \\frac{1}{2}$；相减得 $\\pi k_3 = 1 \\implies k_3 = \\frac{1}{\\pi}$。\n（2）在除 $x=\\pm a$ 外的各连续段对 $F(x)$ 求导（在 $x=\\pm a$ 处补充为 $0$）：\n$$f(x) = F'(x) = \\begin{cases} \\dfrac{1}{\\pi\\sqrt{a^2-x^2}}, & -a < x < a \\\\ 0, & \\text{其他} \\end{cases}$$\n（3）直接利用分布函数计算：\n$$P\\left\\{|X| < \\frac{a}{2}\\right\\} = F\\left(\\frac{a}{2}\\right) - F\\left(-\\frac{a}{2}\\right) = \\left(\\frac{1}{2} + \\frac{1}{\\pi}\\arcsin\\frac{1}{2}\\right) - \\left(\\frac{1}{2} + \\frac{1}{\\pi}\\arcsin\\left(-\\frac{1}{2}\\right)\\right) = \\frac{1}{\\pi}\\left(\\frac{\\pi}{6} + \\frac{\\pi}{6}\\right) = \\frac{1}{3}$$",
    "steps": [
      "由 $F(-\\infty)=0, F(+\\infty)=1$ 定出 $k_1=0, k_4=1$",
      "利用连续型随机变量分布函数处处连续，在 $x=\\pm a$ 处列方程解得 $k_2=\\frac{1}{2}, k_3=\\frac{1}{\\pi}$",
      "分段求导得概率密度 $f(x)$，并代值计算 $F(\\frac{a}{2})-F(-\\frac{a}{2})=\\frac{1}{3}$"
    ],
    "keyPoints": [
      "连续型分布函数的连续性",
      "求导得概率密度",
      "反正弦分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "分布函数",
      "待定参数",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-12",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设连续型随机变量 $X$ 的密度函数为\n$$f(x)=\\begin{cases} 2x, & 0\\le x\\le\\frac{1}{2} \\\\ 1, & \\frac{1}{2}<x\\le 1 \\\\ 3-2x, & 1<x\\le\\frac{3}{2} \\\\ 0, & \\text{其他} \\end{cases}$$\n求 $X$ 的分布函数 $F(x)$。",
    "correctAnswer": "$$F(x)=\\begin{cases} 0, & x<0 \\\\ x^2, & 0\\le x<\\frac{1}{2} \\\\ x - \\frac{1}{4}, & \\frac{1}{2}\\le x<1 \\\\ -x^2+3x-\\frac{5}{4}, & 1\\le x<\\frac{3}{2} \\\\ 1, & x\\ge\\frac{3}{2} \\end{cases}$$",
    "explanation": "按分段区间 $[0, \\frac{1}{2}), [\\frac{1}{2}, 1), [1, \\frac{3}{2}), [\\frac{3}{2}, +\\infty)$ 分段使用 $F(x) = \\int_{-\\infty}^x f(t)\\,\\mathrm{d}t$ 积分：\n1. 当 $x < 0$ 时，$F(x) = \\int_{-\\infty}^x 0\\,\\mathrm{d}t = 0$。\n2. 当 $0\\le x < \\frac{1}{2}$ 时：\n$$F(x) = \\int_0^x 2t\\,\\mathrm{d}t = x^2$$\n3. 当 $\\frac{1}{2}\\le x < 1$ 时：\n$$F(x) = F\\left(\\frac{1}{2}\\right) + \\int_{\\frac{1}{2}}^x 1\\,\\mathrm{d}t = \\frac{1}{4} + \\left(x - \\frac{1}{2}\\right) = x - \\frac{1}{4}$$\n4. 当 $1\\le x < \\frac{3}{2}$ 时：\n$$F(x) = F(1) + \\int_1^x (3-2t)\\,\\mathrm{d}t = \\frac{3}{4} + \\left[3t - t^2\\right]_1^x = \\frac{3}{4} + (3x - x^2 - 2) = -x^2 + 3x - \\frac{5}{4}$$\n5. 当 $x \\ge \\frac{3}{2}$ 时：\n$$F(x) = F\\left(\\frac{3}{2}\\right) = -\\frac{9}{4} + \\frac{9}{2} - \\frac{5}{4} = 1$$\n综上即得完整分段分布函数（在 $0, \\frac{1}{2}, 1, \\frac{3}{2}$ 处均连续）。",
    "steps": [
      "按概率密度分段点将实轴划分为 5 个左闭右开区间",
      "依次利用前一段终点值加上当前段定积分求得各段表达式",
      "检验各分段点左右极限连续且 $F(\\frac{3}{2})=1$"
    ],
    "keyPoints": [
      "由概率密度求分布函数",
      "分段变上限积分"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "分布函数",
      "概率密度积分",
      "分段函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-13",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（1）设随机变量的分布律为 $P\\{X=k\\}=\\frac{a}{2^k\\cdot k!},\\,k=0,1,2,\\cdots$，求 $a$；\n（2）设随机变量的分布律为 $P\\{X=k\\}=\\frac{b}{k!}\\cdot e^{-2},\\,k=0,1,2,\\cdots$，求 $b$。（凑泊松分布）",
    "correctAnswer": "（1）$a = e^{-\\frac{1}{2}}$；（2）$b = e$。",
    "explanation": "（1）利用指数函数泰勒展开 $\\sum\\limits_{k=0}^\\infty \\frac{\\lambda^k}{k!} = e^\\lambda$ 与分布律规范性：\n$$\\sum_{k=0}^\\infty \\frac{a}{2^k\\cdot k!} = a \\sum_{k=0}^\\infty \\frac{(1/2)^k}{k!} = a e^{\\frac{1}{2}} = 1 \\implies a = e^{-\\frac{1}{2}}$$\n（也可直接改写为 $P\\{X=k\\} = \\left(a e^{1/2}\\right)\\cdot\\frac{(1/2)^k}{k!}e^{-1/2}$，凑参数 $\\lambda=\\frac{1}{2}$ 的泊松分布，得 $a e^{1/2}=1$。）\n\n（2）将通项改写凑参数 $\\lambda=1$ 的泊松分布律 $\\frac{1^k}{k!}e^{-1}$：\n$$P\\{X=k\\} = \\frac{b}{k!}\\cdot e^{-2} = (be^{-1}) \\cdot \\frac{1^k}{k!}e^{-1}$$\n因 $\\sum\\limits_{k=0}^\\infty \\frac{1^k}{k!}e^{-1} = 1$，由规范性必有：\n$$be^{-1} = 1 \\implies b = e$$",
    "steps": [
      "利用分布律所有取值概率之和为 1 的规范性",
      "结合幂级数 $\\sum_{k=0}^\\infty \\frac{\\lambda^k}{k!}=e^\\lambda$ 或直接凑泊松分布结构求解常数 $a,b$"
    ],
    "keyPoints": [
      "泊松分布",
      "离散型分布律规范性",
      "幂级数求和"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "泊松分布",
      "凑分布",
      "泰勒级数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-14",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "blank",
    "question": "设 $X\\sim B(2,p)$，$Y\\sim B(3,p)$，若 $P(X\\ge 1)=\\frac{5}{9}$，则 $P(Y\\ge 1)=\\underline{\\hspace{2cm}}$.",
    "correctAnswer": "$\\frac{19}{27}$",
    "explanation": "因 $X \\sim B(2, p)$，利用对立事件求 $p$：\n$$P(X\\ge 1) = 1 - P(X=0) = 1 - (1-p)^2 = \\frac{5}{9}$$\n故 $(1-p)^2 = \\frac{4}{9}$。因为 $0\\le p\\le 1$，所以 $1-p = \\frac{2}{3}$（即 $p=\\frac{1}{3}$）。\n又 $Y \\sim B(3, p)$，故：\n$$P(Y\\ge 1) = 1 - P(Y=0) = 1 - (1-p)^3 = 1 - \\left(\\frac{2}{3}\\right)^3 = 1 - \\frac{8}{27} = \\frac{19}{27}$$",
    "steps": [
      "利用对立事件将 $P(X\\ge 1)$ 转化为 $1-(1-p)^2$ 解得 $1-p=\\frac{2}{3}$",
      "代入 $P(Y\\ge 1) = 1 - (1-p)^3$ 算出 $\\frac{19}{27}$"
    ],
    "keyPoints": [
      "二项分布",
      "至少发生一次的对立事件法"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "二项分布",
      "伯努利试验"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-15",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "blank",
    "question": "设随机变量 $X$ 服从参数为 $\\lambda\\,(\\lambda>0)$ 的泊松分布，且 $P\\{X=1\\}=P\\{X=2\\}$，则 $P\\{X=4\\}=\\underline{\\hspace{2cm}}$，$P\\{X>1\\}=\\underline{\\hspace{2cm}}$。",
    "correctAnswer": "$\\frac{2}{3}e^{-2}$；$1 - 3e^{-2}$",
    "explanation": "已知 $X \\sim P(\\lambda)$，分布律为 $P\\{X=k\\} = \\frac{\\lambda^k}{k!}e^{-\\lambda}$。\n由 $P\\{X=1\\} = P\\{X=2\\}$：\n$$\\lambda e^{-\\lambda} = \\frac{\\lambda^2}{2!}e^{-\\lambda}$$\n因 $\\lambda > 0$ 且 $e^{-\\lambda} > 0$，解得 $\\lambda = 2$。\n因此：\n1. $P\\{X=4\\} = \\frac{2^4}{4!}e^{-2} = \\frac{16}{24}e^{-2} = \\frac{2}{3}e^{-2}$；\n2. $P\\{X>1\\} = 1 - P\\{X=0\\} - P\\{X=1\\} = 1 - e^{-2} - 2e^{-2} = 1 - 3e^{-2}$。",
    "steps": [
      "由 $P\\{X=1\\}=P\\{X=2\\}$ 列方程解出泊松分布参数 $\\lambda=2$",
      "直接代入 $\\lambda=2$ 计算 $P\\{X=4\\}=\\frac{2}{3}e^{-2}$",
      "用求逆法计算 $P\\{X>1\\}=1-P\\{X=0\\}-P\\{X=1\\}=1-3e^{-2}$"
    ],
    "keyPoints": [
      "泊松分布",
      "分布律定参数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "泊松分布",
      "求逆公式"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "某射手参加射击比赛，共有四发子弹，设该射手的命中率为 $p$，各次射击是相互独立的，求直到命中目标为止时的射击次数的分布律。",
    "correctAnswer": "$P\\{X=1\\}=p,\\; P\\{X=2\\}=(1-p)p,\\; P\\{X=3\\}=(1-p)^2 p,\\; P\\{X=4\\}=(1-p)^3$。",
    "explanation": "设射击次数为 $X$，由于共有 4 发子弹，无论第 4 发是否命中，射击至多进行 4 次，故 $X$ 的所有可能取值为 $1, 2, 3, 4$。\n设 $q = 1 - p$，利用各次射击相互独立：\n- $P\\{X=1\\} = p$（第 1 发即命中）；\n- $P\\{X=2\\} = (1-p)p$（第 1 发未中，第 2 发命中）；\n- $P\\{X=3\\} = (1-p)^2 p$（前 2 发未中，第 3 发命中）；\n- $P\\{X=4\\}$ 包含“前 3 发未中、第 4 发命中”与“4 发全未中”两种情形，即只要前 3 发都未中，无论第 4 发结果如何，总射击次数必为 4：\n$$P\\{X=4\\} = (1-p)^3 p + (1-p)^4 = (1-p)^3$$\n检验概率和：$p + (1-p)p + (1-p)^2 p + (1-p)^3 = 1$（满足规范性）。",
    "steps": [
      "确定随机变量 $X$ 的可能取值为有限集 $\\{1,2,3,4\\}$",
      "分别求出 $X=1,2,3$ 的概率（截断几何分布）",
      "注意易错点：$X=4$ 对应“前 3 发均未中”，故 $P\\{X=4\\}=(1-p)^3$"
    ],
    "keyPoints": [
      "截断几何分布",
      "独立重复试验"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "几何分布",
      "独立试验",
      "易错题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-17",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（1994）设随机变量 $X$ 的概率密度为\n$$f(x)=\\begin{cases} 2x, & 0<x<1 \\\\ 0, & \\text{其他} \\end{cases}$$\n以 $Y$ 表示对 $X$ 的三次独立重复观察中 $\\left\\{X\\le\\frac{1}{2}\\right\\}$ 出现的次数，求 $P\\{Y=2\\}$。",
    "correctAnswer": "$\\frac{9}{64}$",
    "explanation": "第一步，先计算单次观察中事件 $A = \\left\\{X\\le\\frac{1}{2}\\right\\}$ 发生的概率 $p$：\n$$p = P\\left\\{X\\le\\frac{1}{2}\\right\\} = \\int_0^{\\frac{1}{2}} 2x\\,\\mathrm{d}x = \\left[x^2\\right]_0^{\\frac{1}{2}} = \\frac{1}{4}$$\n第二步，由于对 $X$ 进行 3 次独立重复观察，故出现次数 $Y$ 服从二项分布 $Y \\sim B\\left(3, \\frac{1}{4}\\right)$。\n第三步，由二项分布公式：\n$$P\\{Y=2\\} = C_3^2 \\left(\\frac{1}{4}\\right)^2 \\left(1 - \\frac{1}{4}\\right)^1 = 3\\times\\frac{1}{16}\\times\\frac{3}{4} = \\frac{9}{64}$$",
    "steps": [
      "对 $f(x)$ 在 $(0, \\frac{1}{2}]$ 上积分求得单次试验成功概率 $p = \\frac{1}{4}$",
      "识别三次独立重复观察次数 $Y \\sim B(3, \\frac{1}{4})$",
      "由二项概率公式求得 $P\\{Y=2\\} = \\frac{9}{64}$"
    ],
    "keyPoints": [
      "连续型概率计算",
      "二项分布识别"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1994真题",
      "二项分布",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-18",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设某顾客在某银行的窗口等待服务的事件 $X$ 的概率密度为\n$$f_X(x)=\\begin{cases} \\frac{1}{5}e^{-\\frac{x}{5}}, & x>0 \\\\ 0, & \\text{其他} \\end{cases}$$\n某顾客在窗口等待服务，若超过十分钟，他就离开。他一个月要到银行 5 次，以 $Y$ 表示一个月内他未等到服务而离开窗口的次数，写出 $Y$ 的分布律。",
    "correctAnswer": "$P\\{Y=k\\} = C_5^k e^{-2k}(1-e^{-2})^{5-k},\\; k=0,1,2,3,4,5$（即 $Y \\sim B(5, e^{-2})$）。",
    "explanation": "（注：题干中“事件 $X$”指顾客等待服务的时间，显然 $X \\sim E\\left(\\frac{1}{5}\\right)$。）\n第一步，求单次到银行未等到服务而离开（即等待时间超过 10 分钟）的概率 $p$：\n$$p = P\\{X > 10\\} = \\int_{10}^{+\\infty} \\frac{1}{5}e^{-\\frac{x}{5}}\\,\\mathrm{d}x = \\left[-e^{-\\frac{x}{5}}\\right]_{10}^{+\\infty} = e^{-2}$$\n第二步，一个月到银行 5 次可视为 5 重独立重复伯努利试验，因此离开次数 $Y \\sim B(5, e^{-2})$。\n第三步，$Y$ 的分布律为：\n$$P\\{Y=k\\} = C_5^k \\left(e^{-2}\\right)^k \\left(1 - e^{-2}\\right)^{5-k}, \\quad k=0,1,2,3,4,5$$",
    "steps": [
      "识别 $X$ 服从参数 $\\lambda=\\frac{1}{5}$ 的指数分布，计算单次离开概率 $p=P\\{X>10\\}=e^{-2}$",
      "确定 5 次到访相互独立，识别 $Y \\sim B(5, e^{-2})$",
      "写出 $Y$ 的二项分布律表达式（$k=0,1,\\dots,5$）"
    ],
    "keyPoints": [
      "指数分布",
      "二项分布建模"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "指数分布",
      "二项分布",
      "应用建模"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-19",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "一批产品的次品率为 $0.02$，从这批产品中每次随机抽一件，有放回的抽取 $100$ 次，$X$ 表示抽取的次品件数，写出 $X$ 的分布律。",
    "correctAnswer": "$P\\{X=k\\} = C_{100}^k (0.02)^k (0.98)^{100-k},\\; k=0,1,2,\\cdots,100$（即 $X \\sim B(100, 0.02)$）。",
    "explanation": "因为每次抽取是有放回的，所以各次抽取相互独立，且每次抽到次品的概率均为 $p = 0.02$。\n共独立重复抽取 $n = 100$ 次，抽到的次品件数 $X$ 服从二项分布 $X \\sim B(100, 0.02)$，其分布律为：\n$$P\\{X=k\\} = C_{100}^k (0.02)^k (0.98)^{100-k}, \\quad k=0,1,2,\\cdots,100$$",
    "steps": [
      "由“有放回抽取”判定各次抽取相互独立、每次抽到次品概率恒为 $0.02$",
      "识别 $X \\sim B(100, 0.02)$ 并写出二项分布律"
    ],
    "keyPoints": [
      "有放回抽样",
      "二项分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "二项分布",
      "有放回抽样"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-20",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X\\sim U(-1,3)$，求：$P\\{X<-2\\}$，$P\\{0<X<4\\}$。",
    "correctAnswer": "$P\\{X<-2\\}=0$；$P\\{0<X<4\\}=\\frac{3}{4}$。",
    "explanation": "因为 $X \\sim U(-1, 3)$，其密度函数仅在 $(-1, 3)$ 上非零，值为 $\\frac{1}{3-(-1)} = \\frac{1}{4}$。\n1. 区间 $(-\\infty, -2)$ 与 $(-1, 3)$ 无交集，故\n$$P\\{X < -2\\} = 0$$\n2. 区间 $(0, 4)$ 与 $(-1, 3)$ 的交集为 $(0, 3)$，有效长度为 $3 - 0 = 3$，故\n$$P\\{0 < X < 4\\} = \\frac{3 - 0}{3 - (-1)} = \\frac{3}{4}$$",
    "steps": [
      "确定均匀分布支撑区间 $(-1,3)$ 长度为 $4$",
      "分别求目标区间与 $(-1,3)$ 的交集长度并除以总长度 $4$"
    ],
    "keyPoints": [
      "均匀分布",
      "有效区间长度比"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "几何概型"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-21",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "证明：在区间 $[a,b]$ 上随机取一点设为 $X$，则 $X\\sim U(a,b)$。",
    "correctAnswer": "通过求 $X$ 的分布函数 $F(x)$ 并求导得到均匀分布概率密度，证明 $X\\sim U(a,b)$。",
    "explanation": "**证明**：在区间 $[a,b]$ 上随机取一点 $X$ 属于一维几何概型，区间总长度为 $b-a$。\n求 $X$ 的分布函数 $F(x) = P\\{X \\le x\\}$：\n- 当 $x < a$ 时，事件 $\\{X \\le x\\}$ 不可能发生，故 $F(x) = 0$；\n- 当 $a \\le x < b$ 时，落在 $[a, x]$ 的长度为 $x-a$，由几何概型得 $F(x) = \\frac{x-a}{b-a}$；\n- 当 $x \\ge b$ 时，事件 $\\{X \\le x\\}$ 必然发生，故 $F(x) = 1$。\n即\n$$F(x) = \\begin{cases} 0, & x<a \\\\ \\frac{x-a}{b-a}, & a\\le x<b \\\\ 1, & x\\ge b \\end{cases}$$\n此即为区间 $[a,b]$ 上均匀分布的分布函数（对各连续段求导得 $f(x)=\\frac{1}{b-a}\\,(a<x<b)$，其余为 $0$），故 $X \\sim U(a,b)$。证毕。",
    "steps": [
      "利用一维几何概型长度之比求出 $X$ 在各区间的分布函数 $F(x)=P\\{X\\le x\\}$",
      "对照均匀分布的分布函数或求导得出其概率密度，完成证明"
    ],
    "keyPoints": [
      "均匀分布与几何概型的联系",
      "分布函数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "证明题",
      "几何概型"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（2021 部分）在区间 $(0,2)$ 上随机取一点，将该区间分成两段，较短的一段长度记为 $X$，求 $X$ 的分布函数。",
    "correctAnswer": "$$F_X(x)=\\begin{cases} 0, & x<0 \\\\ x, & 0\\le x<1 \\\\ 1, & x\\ge 1 \\end{cases}$$",
    "explanation": "设在 $(0,2)$ 上随机取的点坐标为 $U$，则 $U \\sim U(0,2)$。\n所分两段的长度分别为 $U$ 与 $2-U$，故较短一段长度 $X = \\min\\{U, 2-U\\}$，显然 $0 < X \\le 1$。\n求分布函数 $F_X(x) = P\\{X \\le x\\}$：\n- 当 $x < 0$ 时，$F_X(x) = 0$；\n- 当 $0 \\le x < 1$ 时：\n$$P\\{X \\le x\\} = P\\{\\min\\{U, 2-U\\} \\le x\\} = P\\{U \\le x \\text{ 或 } 2-U \\le x\\} = P\\{0 < U \\le x\\} + P\\{2-x \\le U < 2\\}$$\n由 $U \\sim U(0,2)$ 得：\n$$F_X(x) = \\frac{x}{2} + \\frac{2-(2-x)}{2} = x$$\n- 当 $x \\ge 1$ 时，$X \\le 1$ 必然成立，故 $F_X(x) = 1$。\n（由此可见 $X \\sim U(0,1)$。）",
    "steps": [
      "设取点位置 $U \\sim U(0,2)$，将较短段长表示为 $X = \\min\\{U, 2-U\\} \\in (0,1]$",
      "分 $x<0$、$0\\le x<1$、$x\\ge 1$ 三段讨论 $P\\{X\\le x\\}$",
      "在 $0\\le x<1$ 时将事件等价转化为 $\\{U\\le x\\}\\cup\\{U\\ge 2-x\\}$ 求得 $F_X(x)=x$"
    ],
    "keyPoints": [
      "均匀分布",
      "几何概型",
      "分段求分布函数"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2021真题",
      "均匀分布",
      "分布函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-23",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 服从参数为 $1$ 的指数分布，求 $P\\{X\\le 6\\mid X>2\\}$。",
    "correctAnswer": "$1 - e^{-4}$",
    "explanation": "**方法一（无记忆性速算）**：\n已知 $X \\sim E(1)$，利用对立事件与指数分布的无记忆性：\n$$P\\{X\\le 6\\mid X>2\\} = 1 - P\\{X > 6\\mid X > 2\\} = 1 - P\\{X > 2+4\\mid X > 2\\} = 1 - P\\{X > 4\\} = 1 - e^{-4}$$\n\n**方法二（条件概率定义）**：\n$$P\\{X\\le 6\\mid X>2\\} = \\frac{P\\{2 < X \\le 6\\}}{P\\{X > 2\\}} = \\frac{F(6)-F(2)}{1-F(2)} = \\frac{(1-e^{-6})-(1-e^{-2})}{e^{-2}} = \\frac{e^{-2}-e^{-6}}{e^{-2}} = 1 - e^{-4}$$",
    "steps": [
      "识别 $X \\sim E(1)$，将条件概率转为 $1 - P\\{X>6\\mid X>2\\}$",
      "应用指数分布无记忆性化简为 $1 - P\\{X>4\\} = 1 - e^{-4}$"
    ],
    "keyPoints": [
      "指数分布无记忆性",
      "条件概率"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "指数分布",
      "无记忆性",
      "条件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-24",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X\\sim P(\\lambda)$，$Y\\sim E(\\lambda)$，且 $P\\{X\\ge 1\\}=0.5$，求 $P\\{Y>2\\}$。",
    "correctAnswer": "$\\frac{1}{4}$",
    "explanation": "由 $X \\sim P(\\lambda)$，利用求逆公式：\n$$P\\{X \\ge 1\\} = 1 - P\\{X = 0\\} = 1 - e^{-\\lambda} = 0.5 \\implies e^{-\\lambda} = \\frac{1}{2}$$\n（无需硬算出 $\\lambda = \\ln 2$。）\n由 $Y \\sim E(\\lambda)$ 的速算性质：\n$$P\\{Y > 2\\} = e^{-2\\lambda} = \\left(e^{-\\lambda}\\right)^2 = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$$",
    "steps": [
      "利用泊松分布求逆关系 $1 - e^{-\\lambda} = 0.5$ 整体求得 $e^{-\\lambda} = \\frac{1}{2}$",
      "利用指数分布尾概率公式 $P\\{Y>2\\} = e^{-2\\lambda} = (e^{-\\lambda})^2$ 得 $\\frac{1}{4}$"
    ],
    "keyPoints": [
      "泊松分布",
      "指数分布",
      "整体代换"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "泊松分布",
      "指数分布",
      "整体代换"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-25",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "设随机变量 $X$ 服从正态分布，其概率密度函数 $f(x)$ 在 $x=1$ 处有驻点，且 $f(1)=1$，则 $X$ 服从分布（ ）",
    "options": [
      "A. $N(1,1)$",
      "B. $N\\left(1,\\frac{1}{2\\pi}\\right)$",
      "C. $N\\left(1,\\frac{1}{\\sqrt{2\\pi}}\\right)$",
      "D. $N(0,1)$"
    ],
    "correctAnswer": "B",
    "explanation": "设 $X \\sim N(\\mu, \\sigma^2)$，正态分布的概率密度曲线关于 $x=\\mu$ 对称且在 $x=\\mu$ 处取得唯一最大值（即唯一驻点），最大值为 $f(\\mu) = \\frac{1}{\\sqrt{2\\pi}\\sigma}$。\n1. 由在 $x=1$ 处有驻点，得 $\\mu = 1$；\n2. 由 $f(1) = 1$，得 $\\frac{1}{\\sqrt{2\\pi}\\sigma} = 1 \\implies \\sigma = \\frac{1}{\\sqrt{2\\pi}}$，从而方差 $\\sigma^2 = \\frac{1}{2\\pi}$。\n【易错提醒】记号 $N(\\mu, \\sigma^2)$ 的第二个参数是**方差** $\\sigma^2$ 而非标准差 $\\sigma$！因此 $X \\sim N\\left(1, \\frac{1}{2\\pi}\\right)$。选 B。",
    "steps": [
      "利用正态密度函数唯一驻点在 $x=\\mu$ 处，定出 $\\mu=1$",
      "由峰值 $f(\\mu)=\\frac{1}{\\sqrt{2\\pi}\\sigma}=1$ 求出 $\\sigma=\\frac{1}{\\sqrt{2\\pi}}$",
      "注意 $N(\\mu,\\sigma^2)$ 中第二参数为方差 $\\sigma^2=\\frac{1}{2\\pi}$，排除干扰项 C，选 B"
    ],
    "keyPoints": [
      "正态分布概率密度曲线特征",
      "方差与标准差记号区分"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "易错题",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-26",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（1991）设 $X\\sim N(2,\\sigma^2)$，且 $P\\{2<X<4\\}=0.3$，求 $P\\{X<0\\}$。",
    "correctAnswer": "$0.2$",
    "explanation": "已知 $X \\sim N(2, \\sigma^2)$，故概率密度曲线关于 $x = \\mu = 2$ 对称，且 $P\\{X < 2\\} = 0.5$。\n由对称性，区间 $(0, 2)$ 与 $(2, 4)$ 关于 $x=2$ 对称，因此：\n$$P\\{0 < X < 2\\} = P\\{2 < X < 4\\} = 0.3$$\n于是：\n$$P\\{X < 0\\} = P\\{X < 2\\} - P\\{0 < X < 2\\} = 0.5 - 0.3 = 0.2$$",
    "steps": [
      "利用正态分布关于 $\\mu=2$ 对称的性质，得出 $P\\{0<X<2\\}=P\\{2<X<4\\}=0.3$",
      "结合半轴概率 $P\\{X<2\\}=0.5$ 相减得 $P\\{X<0\\}=0.2$"
    ],
    "keyPoints": [
      "正态分布对称性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1991真题",
      "正态分布",
      "对称性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-27",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "（2006）设随机变量 $X$ 服从正态分布 $N(\\mu_1,\\sigma_1^2)$，随机变量 $Y$ 服从正态分布 $N(\\mu_2,\\sigma_2^2)$，且 $P\\{|X-\\mu_1|<1\\} > P\\{|Y-\\mu_2|<1\\}$，则必有（ ）",
    "options": [
      "A. $\\sigma_1 < \\sigma_2$",
      "B. $\\sigma_1 > \\sigma_2$",
      "C. $\\mu_1 < \\mu_2$",
      "D. $\\mu_1 > \\mu_2$"
    ],
    "correctAnswer": "A",
    "explanation": "对两正态变量分别作标准化：\n$$P\\{|X-\\mu_1|<1\\} = P\\left\\{\\left|\\frac{X-\\mu_1}{\\sigma_1}\\right| < \\frac{1}{\\sigma_1}\\right\\} = 2\\Phi\\left(\\frac{1}{\\sigma_1}\\right) - 1$$\n$$P\\{|Y-\\mu_2|<1\\} = P\\left\\{\\left|\\frac{Y-\\mu_2}{\\sigma_2}\\right| < \\frac{1}{\\sigma_2}\\right\\} = 2\\Phi\\left(\\frac{1}{\\sigma_2}\\right) - 1$$\n由已知不等式：\n$$2\\Phi\\left(\\frac{1}{\\sigma_1}\\right) - 1 > 2\\Phi\\left(\\frac{1}{\\sigma_2}\\right) - 1 \\implies \\Phi\\left(\\frac{1}{\\sigma_1}\\right) > \\Phi\\left(\\frac{1}{\\sigma_2}\\right)$$\n因为 $\\Phi(x)$ 严格单调递增，所以 $\\frac{1}{\\sigma_1} > \\frac{1}{\\sigma_2}$，又 $\\sigma_1, \\sigma_2 > 0$，故 $\\sigma_1 < \\sigma_2$。（直观意义：$\\sigma$ 越小，曲线越“瘦高”，集中在均值附近的概率越大。）选 A。",
    "steps": [
      "对 $X$ 与 $Y$ 分别进行正态分布标准化，转化为标准正态分布函数 $\\Phi$",
      "利用 $\\Phi(x)$ 的严格单调递增性推出 $\\frac{1}{\\sigma_1} > \\frac{1}{\\sigma_2}$",
      "解得 $\\sigma_1 < \\sigma_2$，选 A"
    ],
    "keyPoints": [
      "正态分布标准化",
      "标准差与集中程度关系"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2006真题",
      "正态分布",
      "标准化"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-28",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设 $f(x)=ke^{-x^2+2x}$ 为一概率密度，求 $k$。（凑正态分布）",
    "correctAnswer": "$k = \\frac{1}{e\\sqrt{\\pi}}$（或 $\\frac{e^{-1}}{\\sqrt{\\pi}}$）",
    "explanation": "利用配方法将指数部分化为正态分布核函数形式：\n$$-x^2 + 2x = -(x-1)^2 + 1 = -\\frac{(x-1)^2}{2\\cdot\\left(\\frac{1}{\\sqrt{2}}\\right)^2} + 1$$\n于是：\n$$f(x) = ke\\cdot e^{-\\frac{(x-1)^2}{2\\cdot\\left(\\frac{1}{\\sqrt{2}}\\right)^2}}$$\n对照正态分布 $N\\left(1, \\frac{1}{2}\\right)$（其中 $\\mu=1, \\sigma=\\frac{1}{\\sqrt{2}}$）的概率密度公式，其全轴积分规范化系数应为 $\\frac{1}{\\sqrt{2\\pi}\\sigma} = \\frac{1}{\\sqrt{2\\pi}\\cdot\\frac{1}{\\sqrt{2}}} = \\frac{1}{\\sqrt{\\pi}}$。\n因此：\n$$ke = \\frac{1}{\\sqrt{\\pi}} \\implies k = \\frac{1}{e\\sqrt{\\pi}}$$",
    "steps": [
      "对指数 $-x^2+2x$ 配方化为 $-(x-1)^2 + 1$",
      "对照正态分布 $N(1, \\frac{1}{2})$ 密度函数系数 $\\frac{1}{\\sqrt{2\\pi}\\sigma}$ 建立方程 $ke = \\frac{1}{\\sqrt{\\pi}}$",
      "解得 $k = \\frac{1}{e\\sqrt{\\pi}}$"
    ],
    "keyPoints": [
      "正态分布概率密度",
      "凑正态分布技巧"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "凑分布",
      "广义积分"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-29",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（超越）设随机变量 $X$ 的概率密度\n$$f(x)=\\begin{cases} \\frac{1}{\\sqrt{2\\pi}}e^{-\\frac{x^2}{2}}, & x\\le 0 \\\\ e^{-2x}, & x>0 \\end{cases}$$\n求 $P\\{\\{2X>2\\}\\cup\\{X^2-X>2\\}\\}$。（用标准正态分布函数 $\\Phi(x)$ 表示）",
    "correctAnswer": "$1 - \\Phi(1) + \\frac{1}{2}e^{-2}$（或 $\\Phi(-1) + \\frac{1}{2}e^{-2}$）",
    "explanation": "首先化简所求事件：\n- $\\{2X > 2\\} = \\{X > 1\\}$；\n- $\\{X^2 - X > 2\\} = \\{(X-2)(X+1) > 0\\} = \\{X < -1\\}\\cup\\{X > 2\\}$。\n两者取并集：\n$$\\{X > 1\\}\\cup\\{X < -1\\}\\cup\\{X > 2\\} = \\{X < -1\\}\\cup\\{X > 1\\}$$\n由于两区间互不相交，利用分段概率密度分别积分：\n$$P\\{X < -1\\} = \\int_{-\\infty}^{-1} \\frac{1}{\\sqrt{2\\pi}}e^{-\\frac{x^2}{2}}\\,\\mathrm{d}x = \\Phi(-1) = 1 - \\Phi(1)$$\n$$P\\{X > 1\\} = \\int_1^{+\\infty} e^{-2x}\\,\\mathrm{d}x = \\left[-\\frac{1}{2}e^{-2x}\\right]_1^{+\\infty} = \\frac{1}{2}e^{-2}$$\n因此所求概率为：\n$$P\\{\\{2X>2\\}\\cup\\{X^2-X>2\\}\\} = 1 - \\Phi(1) + \\frac{1}{2}e^{-2}$$",
    "steps": [
      "解不等式化简并合并事件 $\\{2X>2\\}\\cup\\{X^2-X>2\\} = \\{X<-1\\}\\cup\\{X>1\\}$",
      "在 $x<-1$ 段用标准正态分布函数 $\\Phi(-1)=1-\\Phi(1)$ 表示",
      "在 $x>1$ 段直接定积分得 $\\frac{1}{2}e^{-2}$，相加得最终结果"
    ],
    "keyPoints": [
      "分段概率密度积分",
      "标准正态分布函数表示"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "超越模拟",
      "正态分布",
      "分段密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-30",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的概率分布为 $P\\{X=k\\}=\\frac{1}{2^k},\\,k=1,2,\\cdots$，$Y$ 表示 $X$ 被 $3$ 除的余数，求 $Y$ 的分布律。",
    "correctAnswer": "$P\\{Y=0\\}=\\frac{1}{7},\\; P\\{Y=1\\}=\\frac{4}{7},\\; P\\{Y=2\\}=\\frac{2}{7}$。",
    "explanation": "正整数 $k$ 被 $3$ 除的余数 $Y$ 所有可能取值为 $0, 1, 2$。将对应 $k$ 值的概率合并并利用无穷等比级数求和（公比均为 $\\frac{1}{2^3}=\\frac{1}{8}$）：\n1. $Y = 0$（即 $k = 3, 6, 9, \\cdots = 3m,\\; m\\ge 1$）：\n$$P\\{Y=0\\} = \\sum_{m=1}^{\\infty} \\frac{1}{2^{3m}} = \\frac{\\frac{1}{8}}{1 - \\frac{1}{8}} = \\frac{1}{7}$$\n2. $Y = 1$（即 $k = 1, 4, 7, \\cdots = 3m-2,\\; m\\ge 1$）：\n$$P\\{Y=1\\} = \\sum_{m=1}^{\\infty} \\frac{1}{2^{3m-2}} = \\frac{\\frac{1}{2}}{1 - \\frac{1}{8}} = \\frac{4}{7}$$\n3. $Y = 2$（即 $k = 2, 5, 8, \\cdots = 3m-1,\\; m\\ge 1$）：\n$$P\\{Y=2\\} = \\sum_{m=1}^{\\infty} \\frac{1}{2^{3m-1}} = \\frac{\\frac{1}{4}}{1 - \\frac{1}{8}} = \\frac{2}{7}$$\n检验：$\\frac{1}{7}+\\frac{4}{7}+\\frac{2}{7}=1$。",
    "steps": [
      "确定余数 $Y$ 的可能取值为 $0,1,2$",
      "按同余类分别将对应 $k$ 的概率写成公比为 $\\frac{1}{8}$ 的无穷等比级数",
      "求和得到 $P\\{Y=0\\}=\\frac{1}{7}, P\\{Y=1\\}=\\frac{4}{7}, P\\{Y=2\\}=\\frac{2}{7}$"
    ],
    "keyPoints": [
      "离散型随机变量函数的分布",
      "无穷等比级数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "离散型函数分布",
      "等比级数",
      "同余分类"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-31",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的分布律为：$X$ 取值为 $-1, 0, 1, 2$，对应概率 $P$ 依次为 $\\frac{1}{4}, \\frac{1}{6}, \\frac{1}{2}, \\frac{1}{12}$。以及矩阵\n$$A = \\begin{pmatrix} 1 & 1 & 2 \\\\ 1 & X^2 & 2 \\\\ -1 & -1 & X-1 \\end{pmatrix}$$\n求 $r(A)$ 的分布律。（线代概统杂交）",
    "correctAnswer": "$P\\{r(A)=1\\}=\\frac{1}{4},\\; P\\{r(A)=2\\}=\\frac{1}{2},\\; P\\{r(A)=3\\}=\\frac{1}{4}$。",
    "explanation": "记 $Y = r(A)$，分别代入 $X$ 的四个取值计算矩阵的秩：\n1. 当 $X = -1$（概率 $\\frac{1}{4}$）时：\n$$A = \\begin{pmatrix} 1 & 1 & 2 \\\\ 1 & 1 & 2 \\\\ -1 & -1 & -2 \\end{pmatrix} \\to \\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 0 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix} \\implies r(A) = 1$$\n2. 当 $X = 0$（概率 $\\frac{1}{6}$）时：\n$$A = \\begin{pmatrix} 1 & 1 & 2 \\\\ 1 & 0 & 2 \\\\ -1 & -1 & -1 \\end{pmatrix},\\quad |A| = \\begin{vmatrix} 1 & 1 & 2 \\\\ 1 & 0 & 2 \\\\ 0 & 0 & 1 \\end{vmatrix} = -1 \\neq 0 \\implies r(A) = 3$$\n3. 当 $X = 1$（概率 $\\frac{1}{2}$）时：\n$$A = \\begin{pmatrix} 1 & 1 & 2 \\\\ 1 & 1 & 2 \\\\ -1 & -1 & 0 \\end{pmatrix} \\to \\begin{pmatrix} 1 & 1 & 2 \\\\ 0 & 0 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix} \\implies r(A) = 2$$\n4. 当 $X = 2$（概率 $\\frac{1}{12}$）时：\n$$A = \\begin{pmatrix} 1 & 1 & 2 \\\\ 1 & 4 & 2 \\\\ -1 & -1 & 1 \\end{pmatrix},\\quad |A| = \\begin{vmatrix} 1 & 1 & 2 \\\\ 0 & 3 & 0 \\\\ 0 & 0 & 3 \\end{vmatrix} = 9 \\neq 0 \\implies r(A) = 3$$\n合并相同取值 $r(A)=3$ 的概率 $\\frac{1}{6}+\\frac{1}{12}=\\frac{1}{4}$，故 $r(A)$ 的分布律为：\n- $P\\{r(A)=1\\} = \\frac{1}{4}$；\n- $P\\{r(A)=2\\} = \\frac{1}{2}$；\n- $P\\{r(A)=3\\} = \\frac{1}{4}$。",
    "steps": [
      "将 $X=-1,0,1,2$ 逐一代入矩阵 $A$ 并通过初等行变换或行列式求得 $r(A)$",
      "得到各 $X$ 值对应 $r(A)$ 分别为 $1,3,2,3$",
      "合并 $X=0$ 与 $X=2$ 的概率，写出 $r(A)$ 的完整分布律"
    ],
    "keyPoints": [
      "离散型随机变量函数的分布",
      "矩阵的秩"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "线代概率综合",
      "矩阵的秩",
      "离散型函数分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-32",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "（1999）假设随机变量 $X$ 服从指数分布，则随机变量 $Y=\\min\\{X,2\\}$ 的分布函数（ ）",
    "options": [
      "A. 是连续函数",
      "B. 至少有两个间断点",
      "C. 是阶梯函数",
      "D. 恰好有一个间断点"
    ],
    "correctAnswer": "D",
    "explanation": "设 $X \\sim E(\\lambda)\\,(\\lambda>0)$，其分布函数为 $F_X(x) = \\begin{cases} 1-e^{-\\lambda x}, & x\\ge 0 \\\\ 0, & x<0 \\end{cases}$。\n求 $Y = \\min\\{X, 2\\}$ 的分布函数 $F_Y(y) = P\\{\\min\\{X, 2\\} \\le y\\}$：\n- 当 $y < 0$ 时，$F_Y(y) = P\\{X \\le y\\} = 0$；\n- 当 $0 \\le y < 2$ 时，由 $2 > y$ 知 $\\min\\{X, 2\\} \\le y \\iff X \\le y$，故 $F_Y(y) = 1 - e^{-\\lambda y}$；\n- 当 $y \\ge 2$ 时，$\\min\\{X, 2\\} \\le 2 \\le y$ 恒成立，故 $F_Y(y) = 1$。\n检查分段点连续性：\n- 在 $y=0$ 处：左极限 $0$，右值 $1-e^0=0$，连续；\n- 在 $y=2$ 处：左极限 $F_Y(2-0)=1-e^{-2\\lambda} < 1$，而 $F_Y(2)=1$，跳跃高度为 $e^{-2\\lambda} = P\\{Y=2\\} > 0$，故 $y=2$ 是唯一间断点。\n选 D。",
    "steps": [
      "利用分布函数法分 $y<0, 0\\le y<2, y\\ge 2$ 三段写出 $F_Y(y)$",
      "验证 $y=0$ 处连续，而在 $y=2$ 处左极限 $1-e^{-2\\lambda}\\neq 1=F_Y(2)$",
      "判定 $F_Y(y)$ 恰好有一个跳跃间断点，选 D"
    ],
    "keyPoints": [
      "截断分布函数",
      "分布函数间断点判定"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1999真题",
      "指数分布",
      "截断分布",
      "间断点"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-33",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（超越）设 $X$ 的概率密度\n$$f(x)=\\begin{cases} \\frac{1}{4}, & |x|\\le 1 \\\\ \\frac{1}{8}, & 1<|x|\\le 3 \\\\ 0, & \\text{其他} \\end{cases}$$\n$Y=g(X)=\\begin{cases} X^2, & X<1 \\\\ X^2-1, & X\\ge 1 \\end{cases}$，求 $Y$ 的分布函数。",
    "correctAnswer": "$$F_Y(y)=\\begin{cases} 0, & y<0 \\\\ \\frac{4\\sqrt{y}+\\sqrt{y+1}-1}{8}, & 0\\le y<1 \\\\ \\frac{2+\\sqrt{y}+\\sqrt{y+1}}{8}, & 1\\le y<8 \\\\ \\frac{5+\\sqrt{y}}{8}, & 8\\le y<9 \\\\ 1, & y\\ge 9 \\end{cases}$$",
    "explanation": "采用**数形结合分布函数法**：在 $f(x)$ 非零支撑集 $[-3, 3]$ 上，分段观察 $g(x)$ 的值域与原像：\n- 当 $x \\in [-3, 1)$ 时，$g(x) = x^2 \\in [0, 9]$；\n- 当 $x \\in [1, 3]$ 时，$g(x) = x^2 - 1 \\in [0, 8]$。\n关键临界高度为 $y = 0, 1, 8, 9$，分 5 段求解 $F_Y(y) = P\\{g(X) \\le y\\}$：\n1. 当 $y < 0$ 时，$\\{g(X)\\le y\\}=\\varnothing$，故 $F_Y(y) = 0$。\n2. 当 $0 \\le y < 1$ 时：\n   - $X<1$ 部分：$X^2\\le y \\iff -\\sqrt{y}\\le X\\le\\sqrt{y}$（全落在 $[-1,1]$ 内，密度 $\\frac{1}{4}$），概率为 $2\\sqrt{y}\\cdot\\frac{1}{4}=\\frac{\\sqrt{y}}{2}$；\n   - $X\\ge 1$ 部分：$X^2-1\\le y \\iff 1\\le X\\le\\sqrt{y+1}$（落在 $(1,\\sqrt{2})\\subset(1,3]$ 内，密度 $\\frac{1}{8}$），概率为 $\\frac{\\sqrt{y+1}-1}{8}$。\n   求和得 $F_Y(y) = \\frac{\\sqrt{y}}{2}+\\frac{\\sqrt{y+1}-1}{8} = \\frac{4\\sqrt{y}+\\sqrt{y+1}-1}{8}$。\n3. 当 $1 \\le y < 8$ 时：\n   - $X<1$ 部分：$X^2\\le y$ 且 $X<1 \\iff -\\sqrt{y}\\le X < 1$（由 $[-\\sqrt{y}, -1)$ 密度 $\\frac{1}{8}$ 与 $[-1,1)$ 密度 $\\frac{1}{4}$ 组成），概率为 $\\frac{\\sqrt{y}-1}{8} + 2\\cdot\\frac{1}{4} = \\frac{\\sqrt{y}+3}{8}$；\n   - $X\\ge 1$ 部分：$1\\le X\\le\\sqrt{y+1}$（落在 $(1,3)$ 内），概率为 $\\frac{\\sqrt{y+1}-1}{8}$。\n   求和得 $F_Y(y) = \\frac{2+\\sqrt{y}+\\sqrt{y+1}}{8}$。\n4. 当 $8 \\le y < 9$ 时：\n   - $X<1$ 部分：同上，$-\\sqrt{y}\\le X < 1$，概率为 $\\frac{\\sqrt{y}+3}{8}$；\n   - $X\\ge 1$ 部分：此时 $[1,3]$ 上 $x^2-1\\le 8\\le y$ 全部满足，概率为 $(3-1)\\cdot\\frac{1}{8}=\\frac{1}{4}$。\n   求和得 $F_Y(y) = \\frac{\\sqrt{y}+3}{8}+\\frac{2}{8} = \\frac{5+\\sqrt{y}}{8}$。\n5. 当 $y \\ge 9$ 时，$[-3,3]$ 上全满足 $g(X)\\le y$，故 $F_Y(y) = 1$。\n（检验 $y=0,1,8,9$ 处均左右连续。）",
    "steps": [
      "画出 $g(x)$ 在支撑集 $[-3,3]$ 上的图像，标出分段临界点 $y=0,1,8,9$",
      "分别对 $y<0, 0\\le y<1, 1\\le y<8, 8\\le y<9, y\\ge 9$ 五段反解不等式 $g(x)\\le y$",
      "将各区间与 $f(x)$ 的分段支撑集取交集积分并求和，检验临界点连续性"
    ],
    "keyPoints": [
      "分段随机变量函数的分布",
      "数形结合法",
      "分布函数法"
    ],
    "difficulty": "困难",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "超越模拟",
      "随机变量函数",
      "分段函数",
      "数形结合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-34",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（2013）设随机变量 $X$ 的概率密度\n$$f(x)=\\begin{cases} \\frac{x^2}{9}, & 0<x<3 \\\\ 0, & \\text{其他} \\end{cases}$$\n令随机变量\n$$Y=\\begin{cases} 2, & X\\le 1 \\\\ X, & 1<X\\le 2 \\\\ 1, & X\\ge 2 \\end{cases}$$\n（1）求 $Y$ 的分布函数；（2）求 $P\\{X\\le Y\\}$。",
    "correctAnswer": "（1）$F_Y(y)=\\begin{cases} 0, & y<1 \\\\ \\frac{y^3+18}{27}, & 1\\le y<2 \\\\ 1, & y\\ge 2 \\end{cases}$；（2）$\\frac{8}{27}$。",
    "explanation": "先算出 $X$ 落在三段的概率（连续型单点概率为 $0$）：\n- $P\\{X\\le 1\\} = \\int_0^1 \\frac{x^2}{9}\\,\\mathrm{d}x = \\frac{1}{27}$；\n- $P\\{1<X\\le 2\\} = \\int_1^2 \\frac{x^2}{9}\\,\\mathrm{d}x = \\frac{8-1}{27} = \\frac{7}{27}$；\n- $P\\{X\\ge 2\\} = \\int_2^3 \\frac{x^2}{9}\\,\\mathrm{d}x = \\frac{27-8}{27} = \\frac{19}{27}$。\n\n（1）由 $Y$ 的取值范围 $[1, 2]$ 分三段求 $F_Y(y) = P\\{Y\\le y\\}$：\n- 当 $y < 1$ 时，$F_Y(y) = 0$；\n- 当 $1 \\le y < 2$ 时，$Y \\le y$ 包含 $\\{X\\ge 2\\}$（此时 $Y=1\\le y$）与 $\\{1<X\\le y\\}$（此时 $Y=X\\le y$），故\n$$F_Y(y) = P\\{X\\ge 2\\} + \\int_1^y \\frac{x^2}{9}\\,\\mathrm{d}x = \\frac{19}{27} + \\frac{y^3-1}{27} = \\frac{y^3+18}{27}$$\n- 当 $y \\ge 2$ 时，$Y \\le 2 \\le y$ 恒成立，故 $F_Y(y) = 1$。\n\n（2）利用完备事件划分求 $P\\{X\\le Y\\}$：\n- 当 $X\\le 1$ 时，$Y=2$，必有 $X\\le Y$；\n- 当 $1<X\\le 2$ 时，$Y=X$，必有 $X\\le Y$；\n- 当 $X > 2$ 时，$Y=1$，必有 $X > Y$（不满足 $X\\le Y$，且单点 $X=2$ 概率为 $0$）。\n故：\n$$P\\{X\\le Y\\} = P\\{X\\le 1\\} + P\\{1<X\\le 2\\} = \\frac{1}{27} + \\frac{7}{27} = \\frac{8}{27}$$",
    "steps": [
      "分别积分求得 $X$ 落在 $(0,1], (1,2], [2,3)$ 的概率 $\\frac{1}{27}, \\frac{7}{27}, \\frac{19}{27}$",
      "第（1）问：按 $y<1, 1\\le y<2, y\\ge 2$ 讨论事件 $\\{Y\\le y\\}$ 对应的 $X$ 区间并积分",
      "第（2）问：将 $\\{X\\le Y\\}$ 分解为三段条件下的交事件求和，得 $\\frac{8}{27}$"
    ],
    "keyPoints": [
      "混合型随机变量分布函数",
      "分段随机变量函数",
      "概率划分"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2013真题",
      "混合型分布函数",
      "分段函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-2-35",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "（2019）设随机变量 $X$ 的概率密度\n$$f(x)=\\begin{cases} \\frac{x}{2}, & 0<x<2 \\\\ 0, & \\text{其他} \\end{cases}$$\n$F(x)$ 为 $X$ 的分布函数，$E(X)$ 为 $X$ 的数学期望，求 $P\\{F(X)>E(X)-1\\}$。",
    "correctAnswer": "$\\frac{2}{3}$",
    "explanation": "第一步，计算数学期望 $E(X)$：\n$$E(X) = \\int_0^2 x\\cdot\\frac{x}{2}\\,\\mathrm{d}x = \\left[\\frac{x^3}{6}\\right]_0^2 = \\frac{8}{6} = \\frac{4}{3}$$\n因此 $E(X) - 1 = \\frac{4}{3} - 1 = \\frac{1}{3}$。\n第二步，利用**概率积分变换定理**：因为 $X$ 是连续型随机变量，$F(x)$ 为其分布函数，所以随机变量 $Y = F(X) \\sim U(0, 1)$。\n第三步：\n$$P\\{F(X) > E(X) - 1\\} = P\\left\\{F(X) > \\frac{1}{3}\\right\\} = 1 - \\frac{1}{3} = \\frac{2}{3}$$\n（直接验证：当 $0<x<2$ 时，$F(x)=\\frac{x^2}{4}$，令 $\\frac{x^2}{4}>\\frac{1}{3}\\implies x>\\frac{2}{\\sqrt{3}}$，于是 $\\int_{2/\\sqrt{3}}^2 \\frac{x}{2}\\,\\mathrm{d}x = 1 - \\frac{1}{3} = \\frac{2}{3}$。）",
    "steps": [
      "利用数学期望定义积分算得 $E(X) = \\frac{4}{3}$，从而 $E(X)-1 = \\frac{1}{3}$",
      "应用连续型分布函数重要结论：$F(X)\\sim U(0,1)$",
      "直接求出 $P\\{F(X)>\\frac{1}{3}\\} = \\frac{2}{3}$"
    ],
    "keyPoints": [
      "数学期望",
      "概率积分变换 $F(X)\\sim U(0,1)$"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2019真题",
      "分布函数性质",
      "均匀分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设 $(X,Y)$ 的联合分布函数为 $F(x,y) = A\\left(B + \\arctan\\frac{x}{2}\\right)\\left(C + \\arctan\\frac{y}{3}\\right)$，求：（1）参数 $A, B, C$；（2）边缘分布函数 $F_X(x), F_Y(y)$；（3）$P\\{0 < X \\le 2, 0 < Y \\le 3\\}$。",
    "correctAnswer": "（1）$A = \\frac{1}{\\pi^2},\\; B = \\frac{\\pi}{2},\\; C = \\frac{\\pi}{2}$；（2）$F_X(x) = \\frac{1}{\\pi}\\left(\\frac{\\pi}{2} + \\arctan\\frac{x}{2}\\right),\\; F_Y(y) = \\frac{1}{\\pi}\\left(\\frac{\\pi}{2} + \\arctan\\frac{y}{3}\\right)$；（3）$\\frac{1}{16}$",
    "explanation": "**（1）确定参数 $A, B, C$：**\n利用联合分布函数的极限性质 $F(-\\infty, y) = 0$、$F(x, -\\infty) = 0$ 和 $F(+\\infty, +\\infty) = 1$：\n$$\\lim_{x\\to -\\infty} F(x,y) = A\\left(B - \\frac{\\pi}{2}\\right)\\left(C + \\arctan\\frac{y}{3}\\right) = 0 \\implies B = \\frac{\\pi}{2};$$\n$$\\lim_{y\\to -\\infty} F(x,y) = A\\left(B + \\arctan\\frac{x}{2}\\right)\\left(C - \\frac{\\pi}{2}\\right) = 0 \\implies C = \\frac{\\pi}{2};$$\n$$\\lim_{\\substack{x\\to +\\infty \\\\ y\\to +\\infty}} F(x,y) = A\\left(\\frac{\\pi}{2} + \\frac{\\pi}{2}\\right)\\left(\\frac{\\pi}{2} + \\frac{\\pi}{2}\\right) = A\\pi^2 = 1 \\implies A = \\frac{1}{\\pi^2}.$$\n\n**（2）求边缘分布函数：**\n$$F_X(x) = F(x, +\\infty) = \\lim_{y\\to +\\infty} \\frac{1}{\\pi^2}\\left(\\frac{\\pi}{2} + \\arctan\\frac{x}{2}\\right)\\left(\\frac{\\pi}{2} + \\arctan\\frac{y}{3}\\right) = \\frac{1}{\\pi}\\left(\\frac{\\pi}{2} + \\arctan\\frac{x}{2}\\right),$$\n$$F_Y(y) = F(+\\infty, y) = \\lim_{x\\to +\\infty} \\frac{1}{\\pi^2}\\left(\\frac{\\pi}{2} + \\arctan\\frac{x}{2}\\right)\\left(\\frac{\\pi}{2} + \\arctan\\frac{y}{3}\\right) = \\frac{1}{\\pi}\\left(\\frac{\\pi}{2} + \\arctan\\frac{y}{3}\\right).$$\n\n**（3）计算矩形区域概率：**\n由矩形域概率公式（下标相同取正，下标不同取负）：\n$$P\\{0 < X \\le 2, 0 < Y \\le 3\\} = F(2,3) - F(0,3) - F(2,0) + F(0,0).$$\n注意 $F(x,y) = F_X(x)F_Y(y)$，故也可分解为：\n$$P\\{0 < X \\le 2, 0 < Y \\le 3\\} = [F_X(2) - F_X(0)][F_Y(3) - F_Y(0)] = \\frac{\\arctan 1 - \\arctan 0}{\\pi} \\cdot \\frac{\\arctan 1 - \\arctan 0}{\\pi} = \\frac{1}{4} \\times \\frac{1}{4} = \\frac{1}{16}.$$",
    "steps": [
      "利用 $F(-\\infty,y)=0, F(x,-\\infty)=0$ 求得 $B=C=\\frac{\\pi}{2}$，再由 $F(+\\infty,+\\infty)=1$ 求得 $A=\\frac{1}{\\pi^2}$",
      "令 $y\\to +\\infty$ 和 $x\\to +\\infty$ 分别求得边缘分布函数 $F_X(x)$ 与 $F_Y(y)$",
      "利用公式 $F(2,3)-F(0,3)-F(2,0)+F(0,0)$ 算出矩形区域概率为 $\\frac{1}{16}$"
    ],
    "keyPoints": [
      "联合分布函数性质",
      "边缘分布函数",
      "矩形域概率公式"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "联合分布函数",
      "边缘分布函数",
      "参数确定"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的概率密度为 $f(x) = \\begin{cases} 1/2, & -1 < x < 0 \\\\ 1/4, & 0 \\le x < 2 \\\\ 0, & \\text{其他} \\end{cases}$，令 $Y = X^2$，$F(x,y)$ 为二维随机变量 $(X,Y)$ 的分布函数，求：（1）$Y$ 的概率密度 $f_Y(y)$；（2）$F\\left(-\\frac{1}{2}, 4\\right)$。",
    "correctAnswer": "（1）$f_Y(y) = \\begin{cases} \\frac{3}{8\\sqrt{y}}, & 0 < y < 1 \\\\ \\frac{1}{8\\sqrt{y}}, & 1 \\le y < 4 \\\\ 0, & \\text{其他} \\end{cases}$；（2）$\\frac{1}{4}$",
    "explanation": "**（1）用分布函数法求 $Y = X^2$ 的概率密度：**\n由于 $X \\in (-1, 2)$，故 $Y = X^2 \\in [0, 4)$。当 $y \\le 0$ 时，$F_Y(y) = 0$；当 $y \\ge 4$ 时，$F_Y(y) = 1$。\n- 当 $0 < y < 1$ 时：\n  $$F_Y(y) = P\\{X^2 \\le y\\} = P\\{-\\sqrt{y} \\le X \\le \\sqrt{y}\\} = \\int_{-\\sqrt{y}}^{0} \\frac{1}{2}\\,\\mathrm{d}x + \\int_{0}^{\\sqrt{y}} \\frac{1}{4}\\,\\mathrm{d}x = \\frac{3}{4}\\sqrt{y},$$\n  求导得 $f_Y(y) = \\frac{3}{8\\sqrt{y}}$。\n- 当 $1 \\le y < 4$ 时：\n  $$F_Y(y) = P\\{X^2 \\le y\\} = P\\{-1 < X \\le \\sqrt{y}\\} = \\int_{-1}^{0} \\frac{1}{2}\\,\\mathrm{d}x + \\int_{0}^{\\sqrt{y}} \\frac{1}{4}\\,\\mathrm{d}x = \\frac{1}{2} + \\frac{1}{4}\\sqrt{y},$$\n  求导得 $f_Y(y) = \\frac{1}{8\\sqrt{y}}$。\n\n综上：\n$$f_Y(y) = \\begin{cases} \\dfrac{3}{8\\sqrt{y}}, & 0 < y < 1 \\\\ \\dfrac{1}{8\\sqrt{y}}, & 1 \\le y < 4 \\\\ 0, & \\text{其他} \\end{cases}$$\n\n**（2）计算 $F\\left(-\\frac{1}{2}, 4\\right)$：**\n$$F\\left(-\\frac{1}{2}, 4\\right) = P\\left\\{X \\le -\\frac{1}{2}, Y \\le 4\\right\\} = P\\left\\{X \\le -\\frac{1}{2}, X^2 \\le 4\\right\\} = P\\left\\{X \\le -\\frac{1}{2}, -2 \\le X \\le 2\\right\\} = P\\left\\{-1 < X \\le -\\frac{1}{2}\\right\\} = \\int_{-1}^{-1/2} \\frac{1}{2}\\,\\mathrm{d}x = \\frac{1}{4}.$$",
    "steps": [
      "确定 $Y=X^2$ 的取值范围 $[0,4)$，分区间 $(0,1)$ 和 $[1,4)$ 写出 $F_Y(y)$",
      "对 $F_Y(y)$ 分段求导得到 $f_Y(y)$",
      "将 $F\\left(-\\frac{1}{2}, 4\\right)$ 转化为一元事件 $P\\left\\{-1 < X \\le -\\frac{1}{2}\\right\\}$ 并积分求解"
    ],
    "keyPoints": [
      "一维随机变量函数分布",
      "联合分布函数定义"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2006真题",
      "分布函数法",
      "分段积分"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "袋中有 $1$ 个红球、$2$ 个黑球和 $3$ 个白球，现有放回地从袋中取两次，每次取一个球，以 $X, Y, Z$ 分别表示两次取球所取得的红球、黑球、白球的个数。（1）求 $P\\{X = 1 \\mid Z = 0\\}$；（2）求二维随机变量 $(X,Y)$ 的概率分布；（3）求 $X, Y$ 的边缘分布；（4）求 $X = 0$ 的条件下 $Y$ 的条件分布。",
    "correctAnswer": "（1）$\\frac{4}{9}$；（2）$P\\{X=0,Y=0\\}=\\frac{1}{4},\\; P\\{X=0,Y=1\\}=\\frac{1}{3},\\; P\\{X=0,Y=2\\}=\\frac{1}{9},\\; P\\{X=1,Y=0\\}=\\frac{1}{6},\\; P\\{X=1,Y=1\\}=\\frac{1}{9},\\; P\\{X=2,Y=0\\}=\\frac{1}{36}$，其余取值为 $0$；（3）$X \\sim B\\left(2, \\frac{1}{6}\\right)$，$Y \\sim B\\left(2, \\frac{1}{3}\\right)$；（4）$P\\{Y=0\\mid X=0\\}=\\frac{9}{25},\\; P\\{Y=1\\mid X=0\\}=\\frac{12}{25},\\; P\\{Y=2\\mid X=0\\}=\\frac{4}{25}$",
    "explanation": "袋中共 $6$ 个球，每次取到红、黑、白球的概率分别为 $\\frac{1}{6}, \\frac{1}{3}, \\frac{1}{2}$，且 $X+Y+Z=2$。\n\n**（1）求 $P\\{X=1 \\mid Z=0\\}$：**\n$Z=0$ 表示两次均未取到白球，故 $P\\{Z=0\\} = \\left(\\frac{1+2}{6}\\right)^2 = \\frac{1}{4}$。\n$\\{X=1, Z=0\\}$ 表示两次中一次红球一次黑球，故 $P\\{X=1, Z=0\\} = 2 \\times \\frac{1}{6} \\times \\frac{2}{6} = \\frac{1}{9}$。\n因此：\n$$P\\{X=1 \\mid Z=0\\} = \\frac{P\\{X=1, Z=0\\}}{P\\{Z=0\\}} = \\frac{1/9}{1/4} = \\frac{4}{9}.$$\n\n**（2）$(X,Y)$ 的联合分布律：**\n$X,Y \\in \\{0,1,2\\}$ 且 $X+Y \\le 2$：\n- $P\\{X=0, Y=0\\} = P\\{Z=2\\} = \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{4}$；\n- $P\\{X=0, Y=1\\} = 2 \\cdot \\frac{1}{3}\\cdot\\frac{1}{2} = \\frac{1}{3}$；\n- $P\\{X=0, Y=2\\} = \\left(\\frac{1}{3}\\right)^2 = \\frac{1}{9}$；\n- $P\\{X=1, Y=0\\} = 2 \\cdot \\frac{1}{6}\\cdot\\frac{1}{2} = \\frac{1}{6}$；\n- $P\\{X=1, Y=1\\} = 2 \\cdot \\frac{1}{6}\\cdot\\frac{1}{3} = \\frac{1}{9}$；\n- $P\\{X=2, Y=0\\} = \\left(\\frac{1}{6}\\right)^2 = \\frac{1}{36}$；\n- $P\\{X=1,Y=2\\}=P\\{X=2,Y=1\\}=P\\{X=2,Y=2\\}=0$。\n\n**（3）边缘分布律：**\n- $X \\sim B\\left(2, \\frac{1}{6}\\right)$：$P\\{X=0\\}=\\frac{25}{36},\\; P\\{X=1\\}=\\frac{5}{18},\\; P\\{X=2\\}=\\frac{1}{36}$；\n- $Y \\sim B\\left(2, \\frac{1}{3}\\right)$：$P\\{Y=0\\}=\\frac{4}{9},\\; P\\{Y=1\\}=\\frac{4}{9},\\; P\\{Y=2\\}=\\frac{1}{9}$。\n\n**（4）$X=0$ 条件下 $Y$ 的条件分布：**\n由于 $P\\{X=0\\} = \\frac{25}{36}$，故：\n- $P\\{Y=0 \\mid X=0\\} = \\frac{1/4}{25/36} = \\frac{9}{25}$；\n- $P\\{Y=1 \\mid X=0\\} = \\frac{1/3}{25/36} = \\frac{12}{25}$；\n- $P\\{Y=2 \\mid X=0\\} = \\frac{1/9}{25/36} = \\frac{4}{25}$。",
    "steps": [
      "利用条件概率公式计算 $P\\{X=1\\mid Z=0\\}$",
      "根据有放回抽样（三项分布）算出 $(X,Y)$ 所有可能取值的联合概率",
      "分别对联合分布律横向、纵向求和得到 $X$ 与 $Y$ 的边缘分布",
      "由 $P\\{Y=j\\mid X=0\\} = P\\{X=0,Y=j\\}/P\\{X=0\\}$ 写出条件分布律"
    ],
    "keyPoints": [
      "二维离散型联合分布",
      "边缘分布律",
      "条件分布律"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2009真题",
      "离散型联合分布",
      "条件分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "甲、乙两个盒子中各装有 $2$ 个红球和 $2$ 个白球，先从甲盒中任取一球，观察颜色后放入乙盒，再从乙盒中任取一球，用 $X, Y$ 表示分别从甲盒和乙盒中取到的红球个数，求二维随机变量 $(X,Y)$ 的概率分布。",
    "correctAnswer": "$P\\{X=0,Y=0\\}=\\frac{3}{10},\\; P\\{X=0,Y=1\\}=\\frac{1}{5},\\; P\\{X=1,Y=0\\}=\\frac{1}{5},\\; P\\{X=1,Y=1\\}=\\frac{3}{10}$",
    "explanation": "$X, Y$ 的可能取值均为 $0, 1$，利用乘法公式 $P\\{X=i, Y=j\\} = P\\{X=i\\}P\\{Y=j \\mid X=i\\}$：\n- 当 $X=0$（甲取白球，概率 $\\frac{2}{4}=\\frac{1}{2}$）时，放入乙盒后乙盒中有 $2$ 红 $3$ 白共 $5$ 球：\n  $$P\\{X=0, Y=0\\} = \\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}, \\qquad P\\{X=0, Y=1\\} = \\frac{1}{2} \\times \\frac{2}{5} = \\frac{1}{5}.$$\n- 当 $X=1$（甲取红球，概率 $\\frac{2}{4}=\\frac{1}{2}$）时，放入乙盒后乙盒中有 $3$ 红 $2$ 白共 $5$ 球：\n  $$P\\{X=1, Y=0\\} = \\frac{1}{2} \\times \\frac{2}{5} = \\frac{1}{5}, \\qquad P\\{X=1, Y=1\\} = \\frac{1}{2} \\times \\frac{3}{5} = \\frac{3}{10}.$$\n\n分布律表格为：\n| $X \\backslash Y$ | $0$ | $1$ |\n| :---: | :---: | :---: |\n| $0$ | $\\frac{3}{10}$ | $\\frac{1}{5}$ |\n| $1$ | $\\frac{1}{5}$ | $\\frac{3}{10}$ |",
    "steps": [
      "确定 $X,Y$ 的取值为 $\\{0,1\\}$",
      "分 $X=0$（乙盒变 2 红 3 白）和 $X=1$（乙盒变 3 红 2 白）两种情形，用乘法公式计算四个联合概率"
    ],
    "keyPoints": [
      "条件概率乘法公式",
      "二维离散型联合分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2021真题",
      "摸球模型",
      "联合分布律"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X_i \\sim \\begin{pmatrix} -1 & 0 & 1 \\\\ \\frac{1}{4} & \\frac{1}{2} & \\frac{1}{4} \\end{pmatrix}\\;(i=1,2)$，且满足 $P\\{X_1 X_2 = 0\\} = 1$，求 $P\\{X_1 = X_2\\}$。",
    "correctAnswer": "$0$",
    "explanation": "由 $P\\{X_1 X_2 = 0\\} = 1$ 可知，所有满足 $X_1 X_2 \\ne 0$ 的点概率均为 $0$，即：\n$$P\\{X_1=-1, X_2=-1\\} = P\\{X_1=-1, X_2=1\\} = P\\{X_1=1, X_2=-1\\} = P\\{X_1=1, X_2=1\\} = 0.$$\n结合边缘分布律横向、纵向求和：\n- 第一行：$P\\{X_1=-1, X_2=0\\} = P\\{X_1=-1\\} = \\frac{1}{4}$；\n- 第三行：$P\\{X_1=1, X_2=0\\} = P\\{X_1=1\\} = \\frac{1}{4}$；\n- 第二列求和为 $P\\{X_2=0\\} = \\frac{1}{2}$，故：\n  $$P\\{X_1=0, X_2=0\\} = \\frac{1}{2} - \\frac{1}{4} - \\frac{1}{4} = 0.$$\n\n因此，主对角线上三点概率全为 $0$：\n$$P\\{X_1 = X_2\\} = P\\{X_1=-1, X_2=-1\\} + P\\{X_1=0, X_2=0\\} + P\\{X_1=1, X_2=1\\} = 0 + 0 + 0 = 0.$$",
    "steps": [
      "由 $P\\{X_1 X_2=0\\}=1$ 得四个非零乘积位置 $(-1,\\pm 1),(1,\\pm 1)$ 概率均为 $0$",
      "利用边缘概率推出 $(-1,0)$ 与 $(1,0)$ 概率均为 $\\frac{1}{4}$，从而中间项 $(0,0)$ 概率为 $\\frac{1}{2}-\\frac{1}{4}-\\frac{1}{4}=0$",
      "将对角线三项相加得 $P\\{X_1=X_2\\}=0$"
    ],
    "keyPoints": [
      "二维离散型联合分布与边缘分布关系"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1999真题",
      "联合分布表格",
      "概率计算"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "choice",
    "question": "设二维随机变量 $(X_1, X_2)$ 的概率密度为 $f_1(x_1, x_2)$，$Y_1 = 2X_1,\\; Y_2 = 3X_2$，则 $(Y_1, Y_2)$ 的概率密度为（ ）",
    "options": [
      "A. $f_1(2y_1, 3y_2)$",
      "B. $f_1\\left(\\frac{1}{2}y_1, \\frac{1}{3}y_2\\right)$",
      "C. $\\frac{1}{2}f_1(2y_1, 3y_2)$",
      "D. $\\frac{1}{6}f_1\\left(\\frac{1}{2}y_1, \\frac{1}{3}y_2\\right)$"
    ],
    "correctAnswer": "D",
    "explanation": "由 $Y_1 = 2X_1,\\; Y_2 = 3X_2$ 求分布函数：\n$$F_{(Y_1,Y_2)}(y_1, y_2) = P\\{2X_1 \\le y_1,\\; 3X_2 \\le y_2\\} = P\\left\\{X_1 \\le \\frac{1}{2}y_1,\\; X_2 \\le \\frac{1}{3}y_2\\right\\} = F_{(X_1,X_2)}\\left(\\frac{1}{2}y_1,\\; \\frac{1}{3}y_2\\right).$$\n两边分别对 $y_1, y_2$ 求混合偏导数，得联合概率密度：\n$$f_{(Y_1,Y_2)}(y_1, y_2) = \\frac{\\partial^2 F_{(Y_1,Y_2)}}{\\partial y_1 \\partial y_2} = \\frac{1}{2}\\cdot\\frac{1}{3} f_1\\left(\\frac{1}{2}y_1,\\; \\frac{1}{3}y_2\\right) = \\frac{1}{6}f_1\\left(\\frac{1}{2}y_1,\\; \\frac{1}{3}y_2\\right).$$\n故选 D。",
    "steps": [
      "将 $(Y_1,Y_2)$ 的分布函数转化为 $(X_1,X_2)$ 的分布函数 $F_{(X_1,X_2)}\\left(\\frac{1}{2}y_1, \\frac{1}{3}y_2\\right)$",
      "对 $y_1,y_2$ 求混合偏导得系数 $\\frac{1}{6}$，匹配选项 D"
    ],
    "keyPoints": [
      "二维连续型随机变量变换",
      "联合分布函数求混合偏导"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "线性变换",
      "概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 的概率密度为 $f(x,y) = \\begin{cases} kxe^{-y}, & 0 < x < y < +\\infty \\\\ 0, & \\text{其他} \\end{cases}$，求：（1）常数 $k$；（2）$X, Y$ 的边缘概率密度；（3）$f_{X|Y}(x|y), f_{Y|X}(y|x)$；（4）$P\\{X < 1 \\mid Y < 2\\}$，$P\\{X < 1 \\mid Y = 2\\}$；（5）联合分布函数 $F(x,y)$。",
    "correctAnswer": "（1）$k=1$；（2）$f_X(x)=\\begin{cases} xe^{-x}, & x>0 \\\\ 0, & x\\le 0 \\end{cases}$，$f_Y(y)=\\begin{cases} \\frac{1}{2}y^2 e^{-y}, & y>0 \\\\ 0, & y\\le 0 \\end{cases}$；（3）当 $y>0$ 时 $f_{X|Y}(x|y)=\\begin{cases} \\frac{2x}{y^2}, & 0<x<y \\\\ 0, & \\text{其他} \\end{cases}$，当 $x>0$ 时 $f_{Y|X}(y|x)=\\begin{cases} e^{-(y-x)}, & y>x \\\\ 0, & \\text{其他} \\end{cases}$；（4）$P\\{X<1\\mid Y<2\\}=\\frac{1 - 2e^{-1} - \\frac{1}{2}e^{-2}}{1 - 5e^{-2}}$，$P\\{X<1\\mid Y=2\\}=\\frac{1}{4}$；（5）$F(x,y)=\\begin{cases} 1 - e^{-x} - xe^{-x} - \\frac{1}{2}x^2 e^{-y}, & 0<x<y \\\\ 1 - e^{-y} - ye^{-y} - \\frac{1}{2}y^2 e^{-y}, & 0<y\\le x \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "**（1）确定常数 $k$：**\n由规范性 $\\iint f(x,y)\\,\\mathrm{d}x\\mathrm{d}y = 1$：\n$$\\int_0^{+\\infty} \\mathrm{d}y \\int_0^y kxe^{-y}\\,\\mathrm{d}x = \\int_0^{+\\infty} \\frac{k}{2} y^2 e^{-y}\\,\\mathrm{d}y = \\frac{k}{2} \\cdot 2! = k = 1 \\implies k = 1.$$\n\n**（2）求边缘概率密度：**\n- 当 $x > 0$ 时，$f_X(x) = \\int_x^{+\\infty} xe^{-y}\\,\\mathrm{d}y = xe^{-x}$；当 $x \\le 0$ 时，$f_X(x) = 0$。\n- 当 $y > 0$ 时，$f_Y(y) = \\int_0^y xe^{-y}\\,\\mathrm{d}x = \\frac{1}{2}y^2 e^{-y}$；当 $y \\le 0$ 时，$f_Y(y) = 0$。\n\n**（3）求条件概率密度：**\n- 当 $y > 0$ 时，$f_{X|Y}(x|y) = \\frac{f(x,y)}{f_Y(y)} = \\begin{cases} \\dfrac{2x}{y^2}, & 0 < x < y \\\\ 0, & \\text{其他} \\end{cases}$；\n- 当 $x > 0$ 时，$f_{Y|X}(y|x) = \\frac{f(x,y)}{f_X(x)} = \\begin{cases} e^{-(y-x)}, & y > x \\\\ 0, & \\text{其他} \\end{cases}$。\n\n**（4）计算两个条件概率：**\n- $P\\{X<1, Y<2\\} = \\int_0^1 \\mathrm{d}x \\int_x^2 xe^{-y}\\,\\mathrm{d}y = \\int_0^1 x(e^{-x} - e^{-2})\\,\\mathrm{d}x = 1 - 2e^{-1} - \\frac{1}{2}e^{-2}$；\n  $P\\{Y<2\\} = \\int_0^2 \\frac{1}{2}y^2 e^{-y}\\,\\mathrm{d}y = 1 - 5e^{-2}$；\n  故 $P\\{X<1 \\mid Y<2\\} = \\dfrac{1 - 2e^{-1} - \\frac{1}{2}e^{-2}}{1 - 5e^{-2}}$。\n- $P\\{X<1 \\mid Y=2\\} = \\int_0^1 f_{X|Y}(x|2)\\,\\mathrm{d}x = \\int_0^1 \\frac{2x}{4}\\,\\mathrm{d}x = \\frac{1}{4}$。\n\n**（5）求联合分布函数 $F(x,y)$：**\n- 当 $x \\le 0$ 或 $y \\le 0$ 时，$F(x,y) = 0$；\n- 当 $0 < x < y$ 时：\n  $$F(x,y) = \\int_0^x \\mathrm{d}u \\int_u^y u e^{-v}\\,\\mathrm{d}v = \\int_0^x u(e^{-u} - e^{-y})\\,\\mathrm{d}u = 1 - e^{-x} - xe^{-x} - \\frac{1}{2}x^2 e^{-y};$$\n- 当 $0 < y \\le x$ 时，交集即 $0 < u < v < y$：\n  $$F(x,y) = \\int_0^y \\mathrm{d}v \\int_0^v u e^{-v}\\,\\mathrm{d}u = \\int_0^y \\frac{1}{2}v^2 e^{-v}\\,\\mathrm{d}v = 1 - e^{-y} - ye^{-y} - \\frac{1}{2}y^2 e^{-y}.$$",
    "steps": [
      "利用联合密度在 $0<x<y<+\\infty$ 上的二重积分等于 $1$ 求出 $k=1$",
      "分别对 $y$ 和 $x$ 积分求得边缘概率密度 $f_X(x)$ 和 $f_Y(y)$",
      "代入条件密度公式并标明条件变量范围，分别求得 $f_{X|Y}(x|y)$ 与 $f_{Y|X}(y|x)$",
      "分别用事件条件概率公式和条件概率密度积分计算第（4）问两个概率",
      "分 $0<x<y$ 和 $0<y\\le x$ 两种位置关系求二重积分得出联合分布函数 $F(x,y)$"
    ],
    "keyPoints": [
      "联合密度规范性",
      "边缘概率密度",
      "条件概率密度",
      "联合分布函数分区间积分"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "联合密度",
      "条件密度",
      "分布函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $(X,Y)$ 服从 $D = \\{(x,y) \\mid x^2 + y^2 \\le 1,\\; y \\ge 0\\}$ 上的均匀分布，记 $Z_1 = \\begin{cases} 0, & X < 0 \\\\ 1, & 0 \\le X < Y \\\\ 2, & X \\ge Y \\end{cases}$，$Z_2 = \\begin{cases} 0, & X \\ge \\sqrt{3}Y \\\\ 1, & X < \\sqrt{3}Y \\end{cases}$，求二维随机变量 $(Z_1, Z_2)$ 的概率分布。",
    "correctAnswer": "$P\\{Z_1=0, Z_2=1\\}=\\frac{1}{2},\\; P\\{Z_1=1, Z_2=1\\}=\\frac{1}{4},\\; P\\{Z_1=2, Z_2=1\\}=\\frac{1}{12},\\; P\\{Z_1=2, Z_2=0\\}=\\frac{1}{6}$，其余取值为 $0$",
    "explanation": "区域 $D$ 为上半单位圆，面积为 $\\frac{\\pi}{2}$。利用极坐标（极角 $\\theta \\in [0,\\pi]$）将 $D$ 划分为四个扇形区域，并用面积比（即圆心角与 $\\pi$ 之比）求概率：\n1. **当 $\\theta \\in (\\frac{\\pi}{2}, \\pi]$（第二象限）**：此时 $X < 0 \\le \\sqrt{3}Y$，故 $Z_1=0, Z_2=1$，圆心角为 $\\frac{\\pi}{2}$：\n   $$P\\{Z_1=0, Z_2=1\\} = \\frac{\\pi/2}{\\pi} = \\frac{1}{2}.$$\n2. **当 $\\theta \\in (\\frac{\\pi}{4}, \\frac{\\pi}{2}]$**：此时 $0 \\le X < Y \\le \\sqrt{3}Y$，故 $Z_1=1, Z_2=1$，圆心角为 $\\frac{\\pi}{4}$：\n   $$P\\{Z_1=1, Z_2=1\\} = \\frac{\\pi/4}{\\pi} = \\frac{1}{4}.$$\n3. **当 $\\theta \\in (\\frac{\\pi}{6}, \\frac{\\pi}{4}]$**：此时 $Y \\le X < \\sqrt{3}Y$（射线 $X=\\sqrt{3}Y$ 对应 $\\theta=\\frac{\\pi}{6}$），故 $Z_1=2, Z_2=1$，圆心角为 $\\frac{\\pi}{4}-\\frac{\\pi}{6}=\\frac{\\pi}{12}$：\n   $$P\\{Z_1=2, Z_2=1\\} = \\frac{\\pi/12}{\\pi} = \\frac{1}{12}.$$\n4. **当 $\\theta \\in [0, \\frac{\\pi}{6}]$**：此时 $X \\ge \\sqrt{3}Y \\ge Y$，故 $Z_1=2, Z_2=0$，圆心角为 $\\frac{\\pi}{6}$：\n   $$P\\{Z_1=2, Z_2=0\\} = \\frac{\\pi/6}{\\pi} = \\frac{1}{6}.$$\n\n其余组合 $P\\{Z_1=0,Z_2=0\\}=P\\{Z_1=1,Z_2=0\\}=0$。联合分布律表格为：\n| $Z_1 \\backslash Z_2$ | $0$ | $1$ |\n| :---: | :---: | :---: |\n| $0$ | $0$ | $\\frac{1}{2}$ |\n| $1$ | $0$ | $\\frac{1}{4}$ |\n| $2$ | $\\frac{1}{6}$ | $\\frac{1}{12}$ |",
    "steps": [
      "画出上半单位圆 $D$ 以及三条分界线 $x=0$、$y=x$、$y=\\frac{1}{\\sqrt{3}}x$",
      "按极角区间 $(\\frac{\\pi}{2},\\pi]$、$(\\frac{\\pi}{4},\\frac{\\pi}{2}]$、$(\\frac{\\pi}{6},\\frac{\\pi}{4}]$、$[0,\\frac{\\pi}{6}]$ 确定各区域上 $(Z_1,Z_2)$ 的取值",
      "利用二维均匀分布面积比（扇形圆心角比 $\\pi$）直接算出各联合概率"
    ],
    "keyPoints": [
      "二维均匀分布",
      "几何概型面积比",
      "离散型随机变量联合分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "李林108",
      "二维均匀分布",
      "数形结合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 在 $(0,1)$ 上服从均匀分布，在 $X = x\\;(0 < x < 1)$ 的条件下，随机变量 $Y$ 在区间 $(0, x)$ 上服从均匀分布，求：（1）联合概率密度 $f(x,y)$；（2）$Y$ 的边缘概率密度 $f_Y(y)$；（3）$P\\{X + Y > 1\\}$。",
    "correctAnswer": "（1）$f(x,y)=\\begin{cases} \\frac{1}{x}, & 0 < y < x < 1 \\\\ 0, & \\text{其他} \\end{cases}$；（2）$f_Y(y)=\\begin{cases} -\\ln y, & 0 < y < 1 \\\\ 0, & \\text{其他} \\end{cases}$；（3）$1 - \\ln 2$",
    "explanation": "**（1）求联合概率密度 $f(x,y)$：**\n由题意，$f_X(x) = \\begin{cases} 1, & 0 < x < 1 \\\\ 0, & \\text{其他} \\end{cases}$，当 $0 < x < 1$ 时，$f_{Y|X}(y|x) = \\begin{cases} \\frac{1}{x}, & 0 < y < x \\\\ 0, & \\text{其他} \\end{cases}$。\n由乘法公式得：\n$$f(x,y) = f_X(x)f_{Y|X}(y|x) = \\begin{cases} \\dfrac{1}{x}, & 0 < y < x < 1 \\\\ 0, & \\text{其他} \\end{cases}$$\n\n**（2）求 $Y$ 的边缘概率密度 $f_Y(y)$：**\n当 $0 < y < 1$ 时，作水平线穿区域 $0 < y < x < 1$：\n$$f_Y(y) = \\int_y^1 \\frac{1}{x}\\,\\mathrm{d}x = -\\ln y;$$\n当 $y \\le 0$ 或 $y \\ge 1$ 时，$f_Y(y) = 0$。故 $f_Y(y) = \\begin{cases} -\\ln y, & 0 < y < 1 \\\\ 0, & \\text{其他} \\end{cases}$。\n\n**（3）计算 $P\\{X+Y>1\\}$：**\n在非零区域 $0 < y < x < 1$ 内满足 $x+y>1$ 即 $1-x < y < x$，由 $1-x < x$ 得 $x > \\frac{1}{2}$：\n$$P\\{X+Y>1\\} = \\int_{1/2}^{1} \\mathrm{d}x \\int_{1-x}^{x} \\frac{1}{x}\\,\\mathrm{d}y = \\int_{1/2}^{1} \\frac{2x-1}{x}\\,\\mathrm{d}x = \\left[2x - \\ln x\\right]_{1/2}^{1} = (2 - 0) - (1 + \\ln 2) = 1 - \\ln 2.$$",
    "steps": [
      "写出 $f_X(x)$ 和 $f_{Y|X}(y|x)$，利用 $f(x,y)=f_X(x)f_{Y|X}(y|x)$ 求联合密度",
      "对 $x$ 从 $y$ 到 $1$ 积分求出 $f_Y(y) = -\\ln y\\;(0<y<1)$",
      "联立 $0<y<x<1$ 与 $x+y>1$ 定出积分限，二重积分求得 $1-\\ln 2$"
    ],
    "keyPoints": [
      "条件密度反求联合密度",
      "边缘概率密度",
      "二重积分求概率"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2004真题",
      "均匀分布",
      "条件概率密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 的概率密度为 $f(x,y) = Ae^{-2x^2 + 2xy - y^2}\\;(-\\infty < x, y < +\\infty)$，求常数 $A$ 及条件概率密度 $f_{Y|X}(y|x)$。",
    "correctAnswer": "$A = \\frac{1}{\\pi}$，$f_{Y|X}(y|x) = \\frac{1}{\\sqrt{\\pi}}e^{-(y-x)^2}\\;(-\\infty < y < +\\infty)$",
    "explanation": "**（1）求常数 $A$：**\n对指数部分进行配方：\n$$-2x^2 + 2xy - y^2 = -x^2 - (y-x)^2.$$\n由规范性 $\\int_{-\\infty}^{+\\infty}\\int_{-\\infty}^{+\\infty} f(x,y)\\,\\mathrm{d}x\\mathrm{d}y = 1$：\n$$A \\int_{-\\infty}^{+\\infty} e^{-x^2}\\left(\\int_{-\\infty}^{+\\infty} e^{-(y-x)^2}\\,\\mathrm{d}y\\right)\\mathrm{d}x = A \\cdot \\sqrt{\\pi} \\cdot \\sqrt{\\pi} = A\\pi = 1 \\implies A = \\frac{1}{\\pi}.$$\n（也可对照二维正态密度公式：$\\mu_1=\\mu_2=0$，$\\frac{1}{2(1-\\rho^2)\\sigma_1^2}=2,\\; \\frac{1}{2(1-\\rho^2)\\sigma_2^2}=1,\\; \\frac{\\rho}{(1-\\rho^2)\\sigma_1\\sigma_2}=1 \\implies \\sigma_1^2=\\frac{1}{2},\\; \\sigma_2^2=1,\\; \\rho=\\frac{\\sqrt{2}}{2}$，从而 $A = \\frac{1}{2\\pi\\sigma_1\\sigma_2\\sqrt{1-\\rho^2}} = \\frac{1}{\\pi}$。）\n\n**（2）求条件概率密度 $f_{Y|X}(y|x)$：**\n先求 $X$ 的边缘概率密度：\n$$f_X(x) = \\int_{-\\infty}^{+\\infty} \\frac{1}{\\pi}e^{-x^2-(y-x)^2}\\,\\mathrm{d}y = \\frac{1}{\\pi}e^{-x^2}\\cdot\\sqrt{\\pi} = \\frac{1}{\\sqrt{\\pi}}e^{-x^2}.$$\n故在 $X=x$ 条件下，$Y$ 的条件概率密度为：\n$$f_{Y|X}(y|x) = \\frac{f(x,y)}{f_X(x)} = \\frac{\\frac{1}{\\pi}e^{-x^2-(y-x)^2}}{\\frac{1}{\\sqrt{\\pi}}e^{-x^2}} = \\frac{1}{\\sqrt{\\pi}}e^{-(y-x)^2} \\quad (-\\infty < y < +\\infty).$$\n（即 $Y \\mid X=x \\sim N\\left(x, \\frac{1}{2}\\right)$。）",
    "steps": [
      "将指数部分配方为 $-x^2-(y-x)^2$，利用高斯积分 $\\int_{-\\infty}^{+\\infty} e^{-t^2}\\mathrm{d}t=\\sqrt{\\pi}$ 求得 $A=\\frac{1}{\\pi}$",
      "对 $y$ 积分求得边缘密度 $f_X(x)=\\frac{1}{\\sqrt{\\pi}}e^{-x^2}$",
      "相除得到条件概率密度 $f_{Y|X}(y|x)=\\frac{1}{\\sqrt{\\pi}}e^{-(y-x)^2}$"
    ],
    "keyPoints": [
      "二维正态分布",
      "配方积分",
      "条件概率密度"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2010真题",
      "二维正态",
      "条件密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-11",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，试将下列联合分布律表格填满。\n\n| $X \\backslash Y$ | $y_1$ | $y_2$ | $y_3$ | $P\\{X=x_i\\}=p_{i\\cdot}$ |\n| :---: | :---: | :---: | :---: | :---: |\n| $x_1$ | | $1/8$ | | |\n| $x_2$ | $1/8$ | | | |\n| $P\\{Y=y_j\\}=p_{\\cdot j}$ | $1/6$ | | | $1$ |",
    "correctAnswer": "$p_{11}=\\frac{1}{24},\\; p_{13}=\\frac{1}{12},\\; p_{1\\cdot}=\\frac{1}{4}$；$p_{22}=\\frac{3}{8},\\; p_{23}=\\frac{1}{4},\\; p_{2\\cdot}=\\frac{3}{4}$；$p_{\\cdot 2}=\\frac{1}{2},\\; p_{\\cdot 3}=\\frac{1}{3}$",
    "explanation": "利用边缘分布律的纵横求和关系与独立性条件 $p_{ij} = p_{i\\cdot}p_{\\cdot j}$：\n1. 由第 $1$ 列求和：$p_{11} + \\frac{1}{8} = \\frac{1}{6} \\implies p_{11} = \\frac{1}{24}$。\n2. 由独立性 $p_{11} = p_{1\\cdot}p_{\\cdot 1}$：$\\frac{1}{24} = p_{1\\cdot} \\cdot \\frac{1}{6} \\implies p_{1\\cdot} = \\frac{1}{4}$。\n3. 由行边缘概率和为 $1$：$p_{2\\cdot} = 1 - p_{1\\cdot} = \\frac{3}{4}$。\n4. 由独立性 $p_{12} = p_{1\\cdot}p_{\\cdot 2}$：$\\frac{1}{8} = \\frac{1}{4} p_{\\cdot 2} \\implies p_{\\cdot 2} = \\frac{1}{2}$。\n5. 由列边缘概率和为 $1$：$p_{\\cdot 3} = 1 - \\frac{1}{6} - \\frac{1}{2} = \\frac{1}{3}$。\n6. 填齐其余格：$p_{13} = \\frac{1}{4}\\cdot\\frac{1}{3} = \\frac{1}{12}$；$p_{22} = \\frac{3}{4}\\cdot\\frac{1}{2} = \\frac{3}{8}$；$p_{23} = \\frac{3}{4}\\cdot\\frac{1}{3} = \\frac{1}{4}$。\n\n填满后的表格为：\n| $X \\backslash Y$ | $y_1$ | $y_2$ | $y_3$ | $P\\{X=x_i\\}=p_{i\\cdot}$ |\n| :---: | :---: | :---: | :---: | :---: |\n| $x_1$ | $1/24$ | $1/8$ | $1/12$ | $1/4$ |\n| $x_2$ | $1/8$ | $3/8$ | $1/4$ | $3/4$ |\n| $P\\{Y=y_j\\}=p_{\\cdot j}$ | $1/6$ | $1/2$ | $1/3$ | $1$ |",
    "steps": [
      "由第一列求和求得 $p_{11}=\\frac{1}{6}-\\frac{1}{8}=\\frac{1}{24}$",
      "利用独立性 $p_{11}=p_{1\\cdot}p_{\\cdot 1}$ 求得 $p_{1\\cdot}=\\frac{1}{4}$，进而得 $p_{2\\cdot}=\\frac{3}{4}$",
      "再由 $p_{12}=p_{1\\cdot}p_{\\cdot 2}$ 求得 $p_{\\cdot 2}=\\frac{1}{2}$，从而 $p_{\\cdot 3}=\\frac{1}{3}$",
      "最后用 $p_{ij}=p_{i\\cdot}p_{\\cdot j}$ 填出剩余三格并检验总和为 $1$"
    ],
    "keyPoints": [
      "二维离散型独立性",
      "边缘分布律"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1999真题",
      "离散独立性",
      "分布律表格"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-12",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 的概率分布为\n\n| $X \\backslash Y$ | $0$ | $1$ |\n| :---: | :---: | :---: |\n| $0$ | $0.4$ | $a$ |\n| $1$ | $b$ | $0.1$ |\n\n已知随机事件 $\\{X = 0\\}$ 与 $\\{X + Y = 1\\}$ 相互独立，求 $a, b$。",
    "correctAnswer": "$a = 0.4,\\; b = 0.1$",
    "explanation": "首先由概率分布的规范性得：\n$$0.4 + a + b + 0.1 = 1 \\implies a + b = 0.5.$$\n再计算各事件概率：\n- $P\\{X = 0\\} = 0.4 + a$；\n- $\\{X + Y = 1\\} = \\{X=0, Y=1\\} \\cup \\{X=1, Y=0\\}$，故 $P\\{X + Y = 1\\} = a + b = 0.5$；\n- $\\{X = 0\\} \\cap \\{X + Y = 1\\} = \\{X=0, Y=1\\}$，故 $P\\{X=0, X+Y=1\\} = a$。\n\n由事件 $\\{X=0\\}$ 与 $\\{X+Y=1\\}$ 相互独立：\n$$P\\{X=0, X+Y=1\\} = P\\{X=0\\}P\\{X+Y=1\\} \\implies a = (0.4 + a)\\times 0.5 = 0.2 + 0.5a.$$\n解得 $0.5a = 0.2 \\implies a = 0.4$，代入 $a+b=0.5$ 得 $b = 0.1$。",
    "steps": [
      "由分布律所有概率和为 $1$ 得 $a+b=0.5$",
      "分别写出 $P\\{X=0\\}=0.4+a$、$P\\{X+Y=1\\}=a+b=0.5$ 及交事件概率 $a$",
      "利用事件独立公式列方程解得 $a=0.4,\\; b=0.1$"
    ],
    "keyPoints": [
      "事件独立性",
      "二维离散型分布律规范性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2005真题",
      "事件独立性",
      "定参数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-13",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "判断随机变量 $X$ 与 $Y$ 是否相互独立（若独立，尝试直接写出边缘概率密度）：（1）$f(x,y)=\\begin{cases} 6xy^2, & 0<x,y<1 \\\\ 0, & \\text{其他} \\end{cases}$；（2）$f(x,y)=\\begin{cases} e^{-x}, & 0<y<x<+\\infty \\\\ 0, & \\text{其他} \\end{cases}$；（3）$f(x,y)=\\begin{cases} e^{-(x+y)}, & x>0,y>0 \\\\ 0, & \\text{其他} \\end{cases}$；（4）$f(x,y)=\\frac{1}{2\\pi}e^{-\\frac{1}{2}(x^2+y^2)}(1+\\sin x\\sin y),\\; -\\infty<x,y<+\\infty$。",
    "correctAnswer": "（1）相互独立，$f_X(x)=\\begin{cases} 2x, & 0<x<1 \\\\ 0, & \\text{其他} \\end{cases}$，$f_Y(y)=\\begin{cases} 3y^2, & 0<y<1 \\\\ 0, & \\text{其他} \\end{cases}$；（2）不独立；（3）相互独立，$f_X(x)=\\begin{cases} e^{-x}, & x>0 \\\\ 0, & \\text{其他} \\end{cases}$，$f_Y(y)=\\begin{cases} e^{-y}, & y>0 \\\\ 0, & \\text{其他} \\end{cases}$；（4）不独立",
    "explanation": "根据二维连续型随机变量独立性判别技巧（**变量可分离且非零区域为矩形域**）：\n- **（1）** 非零区域 $\\{0<x<1,\\; 0<y<1\\}$ 为矩形域，且 $6xy^2 = (2x)(3y^2)$ 变量可分离。配平归一化系数得 $\\int_0^1 2x\\,\\mathrm{d}x = 1,\\; \\int_0^1 3y^2\\,\\mathrm{d}y = 1$，故 **$X$ 与 $Y$ 相互独立**，且 $f_X(x) = \\begin{cases} 2x, & 0<x<1 \\\\ 0, & \\text{其他} \\end{cases}$，$f_Y(y) = \\begin{cases} 3y^2, & 0<y<1 \\\\ 0, & \\text{其他} \\end{cases}$。\n- **（2）** 非零区域 $\\{0<y<x<+\\infty\\}$ 不是矩形域（边界 $y=x$ 含耦合），故 **$X$ 与 $Y$ 不独立**。\n- **（3）** 非零区域 $\\{x>0,\\; y>0\\}$ 为矩形域，且 $e^{-(x+y)} = e^{-x}\\cdot e^{-y}$ 变量可分离，各因子积分均为 $1$，故 **$X$ 与 $Y$ 相互独立**，且 $f_X(x) = \\begin{cases} e^{-x}, & x>0 \\\\ 0, & x\\le 0 \\end{cases}$，$f_Y(y) = \\begin{cases} e^{-y}, & y>0 \\\\ 0, & y\\le 0 \\end{cases}$。\n- **（4）** 非零区域虽为全平面矩形域 $\\mathbb{R}^2$，但函数 $(1+\\sin x\\sin y)$ 不可分离成 $g(x)h(y)$。严格验证：利用奇函数在对称区间积分为 $0$，得边缘密度 $f_X(x) = \\frac{1}{\\sqrt{2\\pi}}e^{-x^2/2},\\; f_Y(y) = \\frac{1}{\\sqrt{2\\pi}}e^{-y^2/2}$，显然 $f(x,y) \\ne f_X(x)f_Y(y)$，故 **$X$ 与 $Y$ 不独立**。",
    "steps": [
      "检查非零区域是否为矩形域（第2问非矩形域，直接不独立）",
      "对矩形域检查密度函数能否拆成 $g(x)h(y)$（第1、3问可分离且归一化后即边缘密度；第4问不可分离，不独立）"
    ],
    "keyPoints": [
      "二维连续型独立性快速判别",
      "矩形域与变量分离"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "独立性判别",
      "边缘密度"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-14",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "已知 $(X,Y)$ 的概率密度函数为 $f(x,y) = \\begin{cases} 4xye^{-(x^2+y^2)}, & x>0,\\; y>0 \\\\ 0, & \\text{其他} \\end{cases}$，求 $P\\{Y > 1 \\mid X > 1\\}$。",
    "correctAnswer": "$e^{-1}$",
    "explanation": "观察联合密度：非零区域 $\\{x>0, y>0\\}$ 为矩形域，且 $f(x,y) = (2xe^{-x^2})(2ye^{-y^2})$ 变量可分离。\n验证归一化：$\\int_0^{+\\infty} 2xe^{-x^2}\\,\\mathrm{d}x = \\left[-e^{-x^2}\\right]_0^{+\\infty} = 1$。\n故 $X$ 与 $Y$ **相互独立**，且 $f_Y(y) = \\begin{cases} 2ye^{-y^2}, & y>0 \\\\ 0, & y\\le 0 \\end{cases}$。\n因此条件事件 $\\{Y>1\\}$ 与 $\\{X>1\\}$ 相互独立：\n$$P\\{Y > 1 \\mid X > 1\\} = P\\{Y > 1\\} = \\int_1^{+\\infty} 2ye^{-y^2}\\,\\mathrm{d}y = \\left[-e^{-y^2}\\right]_1^{+\\infty} = e^{-1}.$$",
    "steps": [
      "识别非零区域为矩形域且密度可分离为 $(2xe^{-x^2})(2ye^{-y^2})$，判断 $X$ 与 $Y$ 相互独立",
      "利用独立性将 $P\\{Y>1\\mid X>1\\}$ 简化为 $P\\{Y>1\\}$ 并积分得 $e^{-1}$"
    ],
    "keyPoints": [
      "二维连续型独立性",
      "独立简化条件概率"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "独立性技巧",
      "条件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-15",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的概率密度为 $f(x) = \\frac{1}{2}e^{-|x|}\\;(-\\infty < x < +\\infty)$，问：$X$ 与 $|X|$ 是否相互独立。",
    "correctAnswer": "不独立",
    "explanation": "**$X$ 与 $|X|$ 不相互独立。**\n使用反例法：取 $a = -1, b = 1$。\n- 一方面，$P\\{X \\le -1,\\; |X| \\le 1\\} = P\\{X = -1\\} = 0$（$X$ 为连续型随机变量，取单点概率为 $0$）；\n- 另一方面，\n  $$P\\{X \\le -1\\} = \\int_{-\\infty}^{-1} \\frac{1}{2}e^{x}\\,\\mathrm{d}x = \\frac{1}{2}e^{-1} > 0,$$\n  $$P\\{|X| \\le 1\\} = \\int_{-1}^{1} \\frac{1}{2}e^{-|x|}\\,\\mathrm{d}x = \\int_0^1 e^{-x}\\,\\mathrm{d}x = 1 - e^{-1} > 0.$$\n显然 $P\\{X \\le -1,\\; |X| \\le 1\\} = 0 \\ne \\frac{1}{2}e^{-1}(1 - e^{-1}) = P\\{X \\le -1\\}P\\{|X| \\le 1\\}$，故 $X$ 与 $|X|$ 不独立。",
    "steps": [
      "采用连续型独立性反例法，选取区间点 $a=-1, b=1$",
      "计算 $P\\{X\\le -1, |X|\\le 1\\} = P\\{X=-1\\} = 0$，而 $P\\{X\\le -1\\}P\\{|X|\\le 1\\} > 0$",
      "因二者不等判定 $X$ 与 $|X|$ 不独立"
    ],
    "keyPoints": [
      "反例法判断不独立",
      "连续型随机变量单点概率为零"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "独立性判别",
      "反例法"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 在区域 $D = \\{(x,y) \\mid 0 < x < 1,\\; x^2 < y < \\sqrt{x}\\}$ 上服从均匀分布，令 $U = \\begin{cases} 1, & X \\le Y \\\\ 0, & X > Y \\end{cases}$。（1）求 $f(x,y)$；（2）请问 $U$ 和 $X$ 是否相互独立；（3）求 $Z = U + X$ 的分布函数 $F_Z(z)$。",
    "correctAnswer": "（1）$f(x,y)=\\begin{cases} 3, & 0<x<1,\\; x^2<y<\\sqrt{x} \\\\ 0, & \\text{其他} \\end{cases}$；（2）不独立；（3）$F_Z(z)=\\begin{cases} 0, & z < 0 \\\\ \\frac{3}{2}z^2 - z^3, & 0 \\le z < 1 \\\\ 2(z-1)^{3/2} - \\frac{3}{2}(z-1)^2 + \\frac{1}{2}, & 1 \\le z < 2 \\\\ 1, & z \\ge 2 \\end{cases}$",
    "explanation": "**（1）求联合概率密度 $f(x,y)$：**\n区域 $D$ 的面积为：\n$$S_D = \\int_0^1 (\\sqrt{x} - x^2)\\,\\mathrm{d}x = \\left[\\frac{2}{3}x^{3/2} - \\frac{1}{3}x^3\\right]_0^1 = \\frac{1}{3}.$$\n故 $f(x,y) = \\begin{cases} 3, & 0 < x < 1,\\; x^2 < y < \\sqrt{x} \\\\ 0, & \\text{其他} \\end{cases}$。\n\n**（2）判断 $U$ 和 $X$ 是否相互独立：**\n由对称性（$y=x^2$ 与 $y=\\sqrt{x}$ 关于 $y=x$ 对称），$P\\{U=1\\} = P\\{X \\le Y\\} = \\frac{1}{2}$，$P\\{U=0\\} = \\frac{1}{2}$。\n取点 $x = \\frac{1}{4}$：\n- $P\\{X \\le \\frac{1}{4}\\} = \\int_0^{1/4} \\mathrm{d}x \\int_{x^2}^{\\sqrt{x}} 3\\,\\mathrm{d}y = \\left[2x^{3/2} - x^3\\right]_0^{1/4} = \\frac{1}{4} - \\frac{1}{64} = \\frac{15}{64}$；\n- $P\\{U=1,\\; X \\le \\frac{1}{4}\\} = \\int_0^{1/4} \\mathrm{d}x \\int_x^{\\sqrt{x}} 3\\,\\mathrm{d}y = \\left[2x^{3/2} - \\frac{3}{2}x^2\\right]_0^{1/4} = \\frac{1}{4} - \\frac{3}{32} = \\frac{5}{32}$。\n而 $P\\{U=1\\}P\\{X \\le \\frac{1}{4}\\} = \\frac{1}{2}\\times\\frac{15}{64} = \\frac{15}{128} \\ne \\frac{20}{128} = \\frac{5}{32}$，故 **$U$ 与 $X$ 不独立**。\n\n**（3）求 $Z = U + X$ 的分布函数 $F_Z(z)$：**\n由于 $U \\in \\{0,1\\}$ 且 $X \\in (0,1)$，当 $U=0$ 时 $Z=X \\in (0,1)$；当 $U=1$ 时 $Z=1+X \\in (1,2)$。\n- 当 $z < 0$ 时，$F_Z(z) = 0$；\n- 当 $0 \\le z < 1$ 时，$Z \\le z$ 仅可能发生于 $U=0$ 且 $X \\le z$：\n  $$F_Z(z) = P\\{U=0, X \\le z\\} = \\int_0^z \\mathrm{d}x \\int_{x^2}^x 3\\,\\mathrm{d}y = 3\\int_0^z (x - x^2)\\,\\mathrm{d}x = \\frac{3}{2}z^2 - z^3;$$\n- 当 $1 \\le z < 2$ 时，$U=0$ 事件全满足 $Z < 1 \\le z$（概率 $\\frac{1}{2}$），外加 $U=1$ 且 $X \\le z-1$：\n  $$F_Z(z) = P\\{U=0\\} + P\\{U=1, X \\le z-1\\} = \\frac{1}{2} + \\int_0^{z-1} \\mathrm{d}x \\int_x^{\\sqrt{x}} 3\\,\\mathrm{d}y = \\frac{1}{2} + 2(z-1)^{3/2} - \\frac{3}{2}(z-1)^2;$$\n- 当 $z \\ge 2$ 时，$F_Z(z) = 1$。",
    "steps": [
      "积分求区域 $D$ 面积为 $\\frac{1}{3}$，写出均匀分布密度 $f(x,y)=3$",
      "计算 $P\\{U=1, X\\le \\frac{1}{4}\\}$ 与 $P\\{U=1\\}P\\{X\\le \\frac{1}{4}\\}$ 不等，说明 $U,X$ 不独立",
      "按完备事件组 $\\{U=0\\},\\{U=1\\}$ 分 $z<0,\\; 0\\le z<1,\\; 1\\le z<2,\\; z\\ge 2$ 四段求 $F_Z(z)$"
    ],
    "keyPoints": [
      "二维均匀分布",
      "离连型随机变量独立性",
      "全概率公式求分布函数"
    ],
    "difficulty": "困难",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2016真题",
      "均匀分布",
      "离连复合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-17",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设 $(X,Y)$ 的概率分布为\n\n| $X \\backslash Y$ | $1$ | $2$ |\n| :---: | :---: | :---: |\n| $0$ | $\\frac{1}{5}$ | $\\frac{1}{5}$ |\n| $1$ | $\\frac{1}{5}$ | $\\frac{2}{5}$ |\n\n求：（1）$U = X + Y$ 的分布律；（2）$V = \\min\\{X, Y\\}$ 的分布律；（3）$W = XY$ 的分布律；（4）$Z = \\frac{X}{Y}$ 的分布律。",
    "correctAnswer": "（1）$U$ 取 $1,2,3$ 对应概率 $\\frac{1}{5}, \\frac{2}{5}, \\frac{2}{5}$；（2）$V$ 取 $0,1$ 对应概率 $\\frac{2}{5}, \\frac{3}{5}$；（3）$W$ 取 $0,1,2$ 对应概率 $\\frac{2}{5}, \\frac{1}{5}, \\frac{2}{5}$；（4）$Z$ 取 $0, \\frac{1}{2}, 1$ 对应概率 $\\frac{2}{5}, \\frac{2}{5}, \\frac{1}{5}$",
    "explanation": "列出 $(X,Y)$ 四个样本点及其函数值：\n- $(0,1)$（概率 $1/5$）：$U=1, V=0, W=0, Z=0$；\n- $(0,2)$（概率 $1/5$）：$U=2, V=0, W=0, Z=0$；\n- $(1,1)$（概率 $1/5$）：$U=2, V=1, W=1, Z=1$；\n- $(1,2)$（概率 $2/5$）：$U=3, V=1, W=2, Z=1/2$。\n\n分别合并相同取值即得：\n- **（1）$U = X+Y$**：$P\\{U=1\\}=\\frac{1}{5},\\; P\\{U=2\\}=\\frac{1}{5}+\\frac{1}{5}=\\frac{2}{5},\\; P\\{U=3\\}=\\frac{2}{5}$。\n- **（2）$V = \\min\\{X,Y\\}$**：$P\\{V=0\\}=\\frac{1}{5}+\\frac{1}{5}=\\frac{2}{5},\\; P\\{V=1\\}=\\frac{1}{5}+\\frac{2}{5}=\\frac{3}{5}$。\n- **（3）$W = XY$**：$P\\{W=0\\}=\\frac{1}{5}+\\frac{1}{5}=\\frac{2}{5},\\; P\\{W=1\\}=\\frac{1}{5},\\; P\\{W=2\\}=\\frac{2}{5}$。\n- **（4）$Z = \\frac{X}{Y}$**：$P\\{Z=0\\}=\\frac{1}{5}+\\frac{1}{5}=\\frac{2}{5},\\; P\\{Z=\\frac{1}{2}\\}=\\frac{2}{5},\\; P\\{Z=1\\}=\\frac{1}{5}$。",
    "steps": [
      "穷举 $(X,Y)$ 的四个可能取值对及对应的四个函数值",
      "按相同函数值合并概率，分别列出 $U,V,W,Z$ 的分布律"
    ],
    "keyPoints": [
      "二维离散型随机变量函数的分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "离散型函数分布",
      "合并同类项"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-18",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 的概率密度为 $f(x,y) = \\begin{cases} 2 - x - y, & 0 < x < 1,\\; 0 < y < 1 \\\\ 0, & \\text{其他} \\end{cases}$，求 $Z = X + Y$ 的概率密度 $f_Z(z)$。",
    "correctAnswer": "$f_Z(z) = \\begin{cases} z(2-z), & 0 < z < 1 \\\\ (2-z)^2, & 1 \\le z < 2 \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "使用卷积公式法：\n$$f_Z(z) = \\int_{-\\infty}^{+\\infty} f(x, z-x)\\,\\mathrm{d}x.$$\n由 $f(x, z-x)$ 非零条件得：$\\begin{cases} 0 < x < 1 \\\\ 0 < z - x < 1 \\end{cases} \\iff \\begin{cases} 0 < x < 1 \\\\ z - 1 < x < z \\end{cases}$，此时被积函数为 $2 - x - (z-x) = 2 - z$。\n为使积分区间非空，需 $z \\in (0, 2)$：\n- **当 $0 < z < 1$ 时**：积分限为 $0 < x < z$，\n  $$f_Z(z) = \\int_0^z (2-z)\\,\\mathrm{d}x = z(2-z);$$\n- **当 $1 \\le z < 2$ 时**：积分限为 $z-1 < x < 1$，\n  $$f_Z(z) = \\int_{z-1}^1 (2-z)\\,\\mathrm{d}x = (2-z)(1 - (z-1)) = (2-z)^2;$$\n- **其他 $z$**：$f_Z(z) = 0$。\n\n综上：\n$$f_Z(z) = \\begin{cases} z(2-z), & 0 < z < 1 \\\\ (2-z)^2, & 1 \\le z < 2 \\\\ 0, & \\text{其他} \\end{cases}$$",
    "steps": [
      "写出和的卷积公式 $f_Z(z) = \\int_{-\\infty}^{+\\infty} f(x,z-x)\\,\\mathrm{d}x$",
      "列出非零区域不等式 $0<x<1$ 且 $z-1<x<z$，分 $0<z<1$ 与 $1\\le z<2$ 两段定限积分"
    ],
    "keyPoints": [
      "卷积公式",
      "和的概率密度"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2007真题",
      "卷积公式",
      "分段积分"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-19",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 的概率密度为 $f(x,y) = \\begin{cases} 1, & 0 < x < 1,\\; 0 < y < 2x \\\\ 0, & \\text{其他} \\end{cases}$，求 $Z = 2X - Y$ 的概率密度 $f_Z(z)$。",
    "correctAnswer": "$f_Z(z) = \\begin{cases} 1 - \\frac{z}{2}, & 0 < z < 2 \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "使用卷积公式法（注意 $Z = 2X - Y \\implies y = 2x - z$，$b = -1$，系数 $\\left|\\frac{1}{b}\\right| = 1$）：\n$$f_Z(z) = \\int_{-\\infty}^{+\\infty} f(x, 2x - z)\\,\\mathrm{d}x.$$\n由 $f(x, 2x-z)$ 非零条件：\n$$\\begin{cases} 0 < x < 1 \\\\ 0 < 2x - z < 2x \\end{cases} \\iff \\begin{cases} 0 < x < 1 \\\\ x > \\dfrac{z}{2},\\; z > 0 \\end{cases}$$\n因此只有当 $0 < \\frac{z}{2} < 1$ 即 $0 < z < 2$ 时积分区间非空，此时 $x$ 范围为 $\\frac{z}{2} < x < 1$：\n$$f_Z(z) = \\int_{z/2}^1 1\\,\\mathrm{d}x = 1 - \\frac{z}{2} \\quad (0 < z < 2).$$\n其他情形 $f_Z(z) = 0$。故 $f_Z(z) = \\begin{cases} 1 - \\dfrac{z}{2}, & 0 < z < 2 \\\\ 0, & \\text{其他} \\end{cases}$。",
    "steps": [
      "套用卷积公式写出 $f_Z(z) = \\int_{-\\infty}^{+\\infty} f(x, 2x-z)\\,\\mathrm{d}x$",
      "由 $0<x<1$ 和 $0<2x-z<2x$ 联立解得 $0<z<2$ 且 $\\frac{z}{2}<x<1$",
      "积分得出 $f_Z(z) = 1 - \\frac{z}{2}\\;(0<z<2)$"
    ],
    "keyPoints": [
      "卷积公式",
      "线性组合概率密度"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2005真题",
      "卷积公式",
      "线性函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-20",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设 $(X,Y)$ 服从 $D: 0 < x < a,\\; 0 < y < a$ 上的均匀分布，求 $Z = XY$ 的概率密度 $f_Z(z)$。",
    "correctAnswer": "$f_Z(z) = \\begin{cases} \\frac{1}{a^2}\\ln\\frac{a^2}{z}, & 0 < z < a^2 \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "由于 $(X,Y)$ 在 $(0,a)\\times(0,a)$ 上均匀分布，其联合概率密度为 $f(x,y) = \\begin{cases} \\frac{1}{a^2}, & 0 < x < a,\\; 0 < y < a \\\\ 0, & \\text{其他} \\end{cases}$。\n使用乘积卷积公式：\n$$f_Z(z) = \\int_{-\\infty}^{+\\infty} f\\left(x, \\frac{z}{x}\\right)\\frac{1}{|x|}\\,\\mathrm{d}x.$$\n由非零条件 $\\begin{cases} 0 < x < a \\\\ 0 < \\frac{z}{x} < a \\end{cases}$：当 $0 < z < a^2$ 时，$x$ 满足 $\\frac{z}{a} < x < a$，于是：\n$$f_Z(z) = \\int_{z/a}^{a} \\frac{1}{a^2}\\cdot\\frac{1}{x}\\,\\mathrm{d}x = \\frac{1}{a^2}\\left[\\ln x\\right]_{z/a}^{a} = \\frac{1}{a^2}\\ln\\frac{a^2}{z} \\quad (0 < z < a^2).$$\n其他情形 $f_Z(z) = 0$。",
    "steps": [
      "写出 $(X,Y)$ 的联合均匀分布密度 $\\frac{1}{a^2}$",
      "应用乘积卷积公式 $f_Z(z)=\\int f(x,z/x)|1/x|\\,\\mathrm{d}x$，定出非零区间 $0<z<a^2$ 且 $\\frac{z}{a}<x<a$",
      "积分得出 $f_Z(z)=\\frac{1}{a^2}\\ln\\frac{a^2}{z}$"
    ],
    "keyPoints": [
      "乘积卷积公式",
      "二维均匀分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "乘积卷积",
      "均匀分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-21",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设 $(X,Y)$ 服从 $D: 1 < x < 3,\\; 1 < y < 3$ 上的均匀分布，求 $Z = |X - Y|$ 的概率密度 $f_Z(z)$。",
    "correctAnswer": "$f_Z(z) = \\begin{cases} 1 - \\frac{z}{2}, & 0 \\le z < 2 \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "正方形区域 $D$ 边长为 $2$，面积为 $4$。$Z = |X - Y|$ 的取值范围为 $[0, 2)$。采用分布函数法（数形结合面积比）：\n- 当 $z < 0$ 时，$F_Z(z) = 0$；\n- 当 $z \\ge 2$ 时，$F_Z(z) = 1$；\n- 当 $0 \\le z < 2$ 时，$|X - Y| \\le z \\iff y - z \\le x \\le y + z$。事件 $\\{|X - Y| > z\\}$ 对应正方形左上角与右下角两个全等的等腰直角三角形，直角边长均为 $2 - z$，面积之和为 $2 \\times \\frac{1}{2}(2-z)^2 = (2-z)^2$。故：\n  $$F_Z(z) = 1 - \\frac{(2-z)^2}{4}.$$\n\n对分布函数求导得概率密度：\n$$f_Z(z) = \\begin{cases} 1 - \\dfrac{z}{2}, & 0 < z < 2 \\\\ 0, & \\text{其他} \\end{cases}$$\n（端点 $z=0$ 处可并入 $0 \\le z < 2$ 或写为开区间 $0<z<2$。）",
    "steps": [
      "采用分布函数法并结合几何概型面积比，确定 $Z=|X-Y|\\in [0,2)$",
      "在正方形 $[1,3]\\times[1,3]$ 中用总面积减去两个全等直角三角形面积得 $F_Z(z)=1-\\frac{(2-z)^2}{4}$",
      "对 $F_Z(z)$ 求导得 $f_Z(z) = 1-\\frac{z}{2}\\;(0<z<2)$"
    ],
    "keyPoints": [
      "分布函数法",
      "二维均匀分布面积比",
      "绝对值函数分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2001真题",
      "分布函数法",
      "数形结合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，$X$ 的概率分布为 $P\\{X = i\\} = \\frac{1}{3}\\;(i = -1, 0, 1)$，$Y$ 的概率密度为 $f_Y(y) = \\begin{cases} 1, & 0 < y < 1 \\\\ 0, & \\text{其他} \\end{cases}$，记 $Z = X + Y$，求 $Z$ 的概率密度。",
    "correctAnswer": "$f_Z(z) = \\begin{cases} \\frac{1}{3}, & -1 < z < 2 \\\\ 0, & \\text{其他} \\end{cases}$",
    "explanation": "利用全概率公式按完备事件组 $\\{X=-1\\}, \\{X=0\\}, \\{X=1\\}$ 分解（因 $X,Y$ 独立，直接用公式②）：\n$$F_Z(z) = P\\{X + Y \\le z\\} = \\sum_{i=-1}^{1} P\\{X=i,\\; Y \\le z-i\\} = \\frac{1}{3}F_Y(z+1) + \\frac{1}{3}F_Y(z) + \\frac{1}{3}F_Y(z-1).$$\n两边对 $z$ 求导（除个别分界点外）：\n$$f_Z(z) = \\frac{1}{3}f_Y(z+1) + \\frac{1}{3}f_Y(z) + \\frac{1}{3}f_Y(z-1).$$\n注意到 $f_Y(z+1)$ 在 $(-1,0)$ 上为 $1$，$f_Y(z)$ 在 $(0,1)$ 上为 $1$，$f_Y(z-1)$ 在 $(1,2)$ 上为 $1$，三者支撑区间恰好无缝拼接，故：\n$$f_Z(z) = \\begin{cases} \\dfrac{1}{3}, & -1 < z < 2 \\\\ 0, & \\text{其他} \\end{cases}$$\n（即 $Z \\sim U(-1, 2)$。）",
    "steps": [
      "以 $X$ 的三个取值作为完备事件组，结合独立性写出 $F_Z(z)$ 的全概率分解式",
      "求导得到 $f_Z(z) = \\frac{1}{3}[f_Y(z+1)+f_Y(z)+f_Y(z-1)]$",
      "合并各段指示函数，得出 $Z \\sim U(-1,2)$"
    ],
    "keyPoints": [
      "全概率公式求分布函数",
      "离连型随机变量函数分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2008真题",
      "离连复合",
      "全概率公式"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-23",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X_1, X_2, X_3$ 相互独立，其中 $X_1, X_2$ 服从标准正态分布，$X_3$ 的概率分布为 $P\\{X_3 = 0\\} = P\\{X_3 = 1\\} = \\frac{1}{2}$，$Y = X_3 X_1 + (1 - X_3)X_2$。（1）求随机变量 $(X_1, Y)$ 的分布函数，结果用标准正态分布函数 $\\Phi(x)$ 表示；（2）证明随机变量 $Y$ 服从标准正态分布。",
    "correctAnswer": "（1）$F_{(X_1,Y)}(x,y) = \\frac{1}{2}\\Phi(\\min\\{x,y\\}) + \\frac{1}{2}\\Phi(x)\\Phi(y)$；（2）见解析，由 $F_Y(y) = \\lim_{x\\to +\\infty} F_{(X_1,Y)}(x,y) = \\Phi(y)$ 得证",
    "explanation": "**（1）求 $(X_1, Y)$ 的联合分布函数：**\n以 $\\{X_3 = 0\\}, \\{X_3 = 1\\}$ 作为完备事件组，由全概率公式及三者相互独立：\n$$\\begin{aligned}\nF_{(X_1,Y)}(x,y) &= P\\{X_1 \\le x,\\; Y \\le y\\} \\\\\n&= P\\{X_3 = 1\\}P\\{X_1 \\le x,\\; X_1 \\le y \\mid X_3 = 1\\} + P\\{X_3 = 0\\}P\\{X_1 \\le x,\\; X_2 \\le y \\mid X_3 = 0\\} \\\\\n&= \\frac{1}{2}P\\{X_1 \\le \\min\\{x,y\\}\\} + \\frac{1}{2}P\\{X_1 \\le x\\}P\\{X_2 \\le y\\} \\\\\n&= \\frac{1}{2}\\Phi(\\min\\{x,y\\}) + \\frac{1}{2}\\Phi(x)\\Phi(y).\n\\end{aligned}$$\n\n**（2）证明 $Y$ 服从标准正态分布：**\n求 $Y$ 的边缘分布函数，令 $x \\to +\\infty$：\n$$F_Y(y) = \\lim_{x \\to +\\infty} F_{(X_1,Y)}(x,y) = \\lim_{x \\to +\\infty}\\left[\\frac{1}{2}\\Phi(\\min\\{x,y\\}) + \\frac{1}{2}\\Phi(x)\\Phi(y)\\right].$$\n当 $x > y$ 时 $\\min\\{x,y\\} = y$，且 $\\lim_{x\\to+\\infty} \\Phi(x) = 1$，因此：\n$$F_Y(y) = \\frac{1}{2}\\Phi(y) + \\frac{1}{2}\\cdot 1 \\cdot \\Phi(y) = \\Phi(y) \\quad (-\\infty < y < +\\infty).$$\n所以 $Y \\sim N(0,1)$，即 $Y$ 服从标准正态分布。",
    "steps": [
      "选取 $\\{X_3=0\\}, \\{X_3=1\\}$ 作为完备事件组，利用全概率公式展开 $P\\{X_1\\le x, Y\\le y\\}$",
      "利用 $X_1,X_2,X_3$ 独立性与标准正态分布函数 $\\Phi$ 写出联合分布函数",
      "令 $x\\to +\\infty$ 求 $Y$ 的边缘分布函数，化简为 $\\Phi(y)$ 完成证明"
    ],
    "keyPoints": [
      "全概率公式",
      "边缘分布函数",
      "标准正态分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2020真题",
      "全概率公式",
      "混合分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-24",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 独立，且 $X$ 服从标准正态分布，$Y$ 的概率分布为 $P\\{Y = 0\\} = P\\{Y = 1\\} = \\frac{1}{2}$，记 $F_Z(z)$ 为随机变量 $Z = XY$ 的分布函数，求 $F_Z(z)$ 的间断点个数。",
    "correctAnswer": "$1$ 个",
    "explanation": "利用全概率公式按 $\\{Y=0\\}, \\{Y=1\\}$ 分解：\n$$F_Z(z) = P\\{XY \\le z\\} = P\\{Y=0\\}P\\{0 \\le z\\} + P\\{Y=1\\}P\\{X \\le z\\}.$$\n- 当 $z < 0$ 时，$P\\{0 \\le z\\} = 0$，故 $F_Z(z) = \\frac{1}{2}\\Phi(z)$；\n- 当 $z \\ge 0$ 时，$P\\{0 \\le z\\} = 1$，故 $F_Z(z) = \\frac{1}{2} + \\frac{1}{2}\\Phi(z)$。\n\n考察在 $z=0$ 处的左右极限：\n$$F_Z(0^-) = \\frac{1}{2}\\Phi(0) = \\frac{1}{4}, \\qquad F_Z(0^+) = \\frac{1}{2} + \\frac{1}{2}\\Phi(0) = \\frac{3}{4} \\ne F_Z(0^-).$$\n而在其余点 $z \\ne 0$ 处 $\\Phi(z)$ 连续，故 $F_Z(z)$ 仅在 $z=0$ 处有一个跳跃间断点，间断点个数为 $1$。",
    "steps": [
      "以 $\\{Y=0\\},\\{Y=1\\}$ 作为完备事件组写出 $F_Z(z)$ 的分段表达式",
      "比较 $z=0$ 处的左极限 $\\frac{1}{4}$ 与右极限 $\\frac{3}{4}$，判定仅 $z=0$ 为间断点"
    ],
    "keyPoints": [
      "全概率公式",
      "分布函数间断点"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2009真题",
      "分布函数连续性",
      "离连复合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-25",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 独立，且 $X$ 服从标准正态分布，$Y$ 服从二项分布 $B(n,p)$，求 $Z = X + Y$ 的分布函数的间断点个数。",
    "correctAnswer": "$0$ 个",
    "explanation": "以 $Y$ 的所有可能取值 $\\{Y = k\\}\\;(k=0,1,\\cdots,n)$ 为完备事件组，由全概率公式及 $X,Y$ 相互独立：\n$$F_Z(z) = P\\{X + Y \\le z\\} = \\sum_{k=0}^{n} P\\{Y = k\\}P\\{X \\le z - k\\} = \\sum_{k=0}^{n} C_n^k p^k (1-p)^{n-k} \\Phi(z - k).$$\n因为标准正态分布函数 $\\Phi(z-k)$ 对每个 $k$ 在 $(-\\infty,+\\infty)$ 上均处处连续，有限个连续函数的线性组合仍然处处连续，所以 $F_Z(z)$ 没有间断点，间断点个数为 $0$。",
    "steps": [
      "以 $\\{Y=k\\}$ 为完备事件组写出 $F_Z(z) = \\sum_{k=0}^n C_n^k p^k (1-p)^{n-k} \\Phi(z-k)$",
      "由有限个连续函数的线性组合仍处处连续，得出间断点个数为 $0$"
    ],
    "keyPoints": [
      "全概率公式",
      "分布函数连续性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "离连复合",
      "间断点"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-26",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，$X$ 的概率分布为 $P\\{X = 1\\} = P\\{X = -1\\} = \\frac{1}{2}$，$Y$ 服从参数为 $\\lambda$ 的泊松分布，令 $Z = XY$，求 $Z$ 的概率分布。",
    "correctAnswer": "$P\\{Z = k\\} = \\begin{cases} e^{-\\lambda}, & k = 0 \\\\ \\frac{1}{2}\\frac{\\lambda^{|k|}}{|k|!}e^{-\\lambda}, & k = \\pm 1, \\pm 2, \\cdots \\end{cases}$",
    "explanation": "$Y$ 的可能取值为 $0,1,2,\\cdots$，$X$ 的可能取值为 $\\pm 1$，故 $Z = XY$ 的可能取值为全体整数 $k = 0, \\pm 1, \\pm 2, \\cdots$。\n- 当 $k = 0$ 时，$Z = 0 \\iff Y = 0$（与 $X$ 取值无关），故：\n  $$P\\{Z = 0\\} = P\\{Y = 0\\} = e^{-\\lambda}.$$\n- 当 $k \\ge 1$ 时，$Z = k \\iff \\{X=1, Y=k\\}$，由独立性：\n  $$P\\{Z = k\\} = P\\{X=1\\}P\\{Y=k\\} = \\frac{1}{2}\\cdot\\frac{\\lambda^k}{k!}e^{-\\lambda}.$$\n- 当 $k \\le -1$ 时，令 $k = -m\\;(m \\ge 1)$，则 $Z = k \\iff \\{X=-1, Y=m\\}$，由独立性：\n  $$P\\{Z = k\\} = P\\{X=-1\\}P\\{Y=m\\} = \\frac{1}{2}\\cdot\\frac{\\lambda^{-k}}{(-k)!}e^{-\\lambda}.$$\n\n合并写成统一形式：\n$$P\\{Z = k\\} = \\begin{cases} e^{-\\lambda}, & k = 0 \\\\ \\dfrac{1}{2}\\dfrac{\\lambda^{|k|}}{|k|!}e^{-\\lambda}, & k = \\pm 1, \\pm 2, \\cdots \\end{cases}$$",
    "steps": [
      "确定 $Z=XY$ 的可能取值为全体整数 $\\mathbb{Z}$",
      "分 $k=0$、$k\\ge 1$、$k\\le -1$ 三种情况结合独立性计算概率并合并表达式"
    ],
    "keyPoints": [
      "离散型随机变量函数分布",
      "泊松分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2018真题",
      "泊松分布",
      "离散函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-27",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，同服从标准正态分布，令 $Z = \\begin{cases} |Y|, & X \\ge 0 \\\\ -|Y|, & X < 0 \\end{cases}$，求 $Z$ 的分布函数。",
    "correctAnswer": "$F_Z(z) = \\Phi(z)\\;(-\\infty < z < +\\infty)$",
    "explanation": "取完备事件组 $\\{X \\ge 0\\}, \\{X < 0\\}$，由 $X \\sim N(0,1)$ 得 $P\\{X \\ge 0\\} = P\\{X < 0\\} = \\frac{1}{2}$。结合 $X,Y$ 相互独立，应用全概率公式：\n- **当 $z < 0$ 时**：若 $X \\ge 0$ 则 $Z = |Y| \\ge 0 > z$，故仅 $\\{X < 0\\}$ 分支有贡献：\n  $$F_Z(z) = P\\{X < 0\\}P\\{-|Y| \\le z\\} = \\frac{1}{2}P\\{|Y| \\ge -z\\} = \\frac{1}{2}\\cdot 2[1 - \\Phi(-z)] = 1 - \\Phi(-z) = \\Phi(z).$$\n- **当 $z \\ge 0$ 时**：若 $X < 0$ 则 $Z = -|Y| \\le 0 \\le z$ 必成立；若 $X \\ge 0$ 则需 $|Y| \\le z$：\n  $$F_Z(z) = P\\{X < 0\\} + P\\{X \\ge 0\\}P\\{|Y| \\le z\\} = \\frac{1}{2} + \\frac{1}{2}[2\\Phi(z) - 1] = \\Phi(z).$$\n\n综上，对任意实数 $z$，均有 $F_Z(z) = \\Phi(z)$（即 $Z$ 仍服从标准正态分布）。",
    "steps": [
      "取 $\\{X\\ge 0\\}$ 与 $\\{X<0\\}$ 作为完备事件组展开 $F_Z(z)$",
      "分 $z<0$ 与 $z\\ge 0$ 两段利用对称性化简得 $F_Z(z)=\\Phi(z)$"
    ],
    "keyPoints": [
      "全概率公式",
      "标准正态对称性"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "标准正态",
      "全概率公式",
      "分段函数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-28",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X$ 的概率分布为 $P\\{X = 1\\} = P\\{X = 2\\} = \\frac{1}{2}$，在给定 $X = i$ 的条件下，随机变量 $Y$ 服从均匀分布 $U(0, i)\\;(i = 1, 2)$，求 $Y$ 的分布函数。",
    "correctAnswer": "$F_Y(y) = \\begin{cases} 0, & y < 0 \\\\ \\frac{3}{4}y, & 0 \\le y < 1 \\\\ \\frac{1}{2} + \\frac{1}{4}y, & 1 \\le y < 2 \\\\ 1, & y \\ge 2 \\end{cases}$",
    "explanation": "由于条件未给出独立，应用全概率公式①，以 $\\{X=1\\}, \\{X=2\\}$ 为完备事件组：\n$$F_Y(y) = P\\{X=1\\}P\\{Y \\le y \\mid X=1\\} + P\\{X=2\\}P\\{Y \\le y \\mid X=2\\} = \\frac{1}{2}F_{Y|X}(y|1) + \\frac{1}{2}F_{Y|X}(y|2),$$\n其中 $F_{Y|X}(y|1)$ 为 $U(0,1)$ 的分布函数，$F_{Y|X}(y|2)$ 为 $U(0,2)$ 的分布函数。分段汇总：\n- 当 $y < 0$ 时：$F_Y(y) = 0$；\n- 当 $0 \\le y < 1$ 时：$F_Y(y) = \\frac{1}{2}y + \\frac{1}{2}\\cdot\\frac{y}{2} = \\frac{3}{4}y$；\n- 当 $1 \\le y < 2$ 时：$F_Y(y) = \\frac{1}{2}\\cdot 1 + \\frac{1}{2}\\cdot\\frac{y}{2} = \\frac{1}{2} + \\frac{1}{4}y$；\n- 当 $y \\ge 2$ 时：$F_Y(y) = \\frac{1}{2}\\cdot 1 + \\frac{1}{2}\\cdot 1 = 1$。",
    "steps": [
      "以 $\\{X=1\\}, \\{X=2\\}$ 为完备事件组写出全概率公式 $F_Y(y) = \\frac{1}{2}F_{Y|X}(y|1) + \\frac{1}{2}F_{Y|X}(y|2)$",
      "按分界点 $0, 1, 2$ 分四段写出 $F_Y(y)$ 表达式"
    ],
    "keyPoints": [
      "全概率公式",
      "条件分布求边缘分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2014真题",
      "均匀分布",
      "全概率公式"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-29",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设投保人的损失事件发生时，保险公司的赔付额 $Y$ 与投保人的损失额 $X$ 的关系为：$Y = \\begin{cases} 0, & X \\le 100 \\\\ X - 100, & X > 100 \\end{cases}$，设损失事件发生时，投保人的损失额 $X$ 概率密度为：$f(x) = \\begin{cases} \\frac{2 \\times 100^2}{(100 + x)^3}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}$。这种损失事件在一年内发生的次数记为 $N$，保险公司在一年内就这种损失事件产生的理赔次数记为 $M$。假设 $N$ 服从参数为 $8$ 的泊松分布，在 $N = n\\;(n \\ge 1)$ 的条件下，$M$ 服从二项分布 $B(n, p)$，其中 $p = P\\{Y > 0\\}$，求 $M$ 的概率分布。",
    "correctAnswer": "$P\\{M = k\\} = \\frac{2^k}{k!}e^{-2}\\;(k = 0, 1, 2, \\cdots)$，即 $M \\sim P(2)$",
    "explanation": "**第一步：求单次理赔概率 $p = P\\{Y > 0\\}$。**\n由 $Y$ 的定义，$Y > 0 \\iff X > 100$，故：\n$$p = P\\{X > 100\\} = \\int_{100}^{+\\infty} \\frac{2 \\times 100^2}{(100 + x)^3}\\,\\mathrm{d}x = \\left[-\\frac{100^2}{(100+x)^2}\\right]_{100}^{+\\infty} = \\frac{100^2}{200^2} = \\frac{1}{4}.$$\n\n**第二步：用全概率公式求 $M$ 的概率分布。**\n$M$ 的可能取值为 $k = 0, 1, 2, \\cdots$。当 $N=0$ 时，理赔次数必为 $M=0$（即 $P\\{M=0\\mid N=0\\}=1$）；当 $N=n\\ge 1$ 时，$M \\sim B(n, \\frac{1}{4})$，仅当 $n \\ge k$ 时 $P\\{M=k\\mid N=n\\} > 0$。\n- 当 $k = 0$ 时：\n  $$P\\{M=0\\} = P\\{N=0\\} + \\sum_{n=1}^{\\infty} P\\{N=n\\}\\left(\\frac{3}{4}\\right)^n = \\sum_{n=0}^{\\infty} \\frac{8^n e^{-8}}{n!}\\left(\\frac{3}{4}\\right)^n = e^{-8}\\sum_{n=0}^{\\infty} \\frac{6^n}{n!} = e^{-8}\\cdot e^6 = e^{-2}.$$\n- 当 $k \\ge 1$ 时：\n  $$\\begin{aligned}\n  P\\{M=k\\} &= \\sum_{n=k}^{\\infty} P\\{N=n\\}P\\{M=k \\mid N=n\\} \\\\\n  &= \\sum_{n=k}^{\\infty} \\frac{8^n e^{-8}}{n!} \\cdot \\frac{n!}{k!(n-k)!}\\left(\\frac{1}{4}\\right)^k\\left(\\frac{3}{4}\\right)^{n-k} \\\\\n  &= \\frac{(8\\cdot\\frac{1}{4})^k e^{-8}}{k!} \\sum_{n=k}^{\\infty} \\frac{(8\\cdot\\frac{3}{4})^{n-k}}{(n-k)!} \\\\\n  &= \\frac{2^k e^{-8}}{k!} e^6 = \\frac{2^k}{k!}e^{-2}.\n  \\end{aligned}$$\n\n综上，$P\\{M = k\\} = \\dfrac{2^k}{k!}e^{-2}\\;(k = 0, 1, 2, \\cdots)$，即 $M \\sim P(2)$。",
    "steps": [
      "积分求得 $p = P\\{Y>0\\} = P\\{X>100\\} = \\frac{1}{4}$",
      "以 $\\{N=n\\}$ 为完备事件组，对 $k=0$ 和 $k\\ge 1$ 分别写出全概率级数",
      "提取 $\\frac{2^k e^{-8}}{k!}$ 后利用 $e^x$ 泰勒级数求和，化简得到 $M \\sim P(2)$"
    ],
    "keyPoints": [
      "全概率公式",
      "泊松分布与二项分布复合",
      "幂级数求和"
    ],
    "difficulty": "困难",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2025真题",
      "泊松稀疏",
      "全概率公式"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-30",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "blank",
    "question": "设 $X \\sim P(\\lambda_1),\\; Y \\sim P(\\lambda_2)$，且 $X$ 与 $Y$ 相互独立，已知 $P\\{X + Y > 0\\} = 1 - e^{-1}$，则 $E\\left[(X + Y)^2\\right] =$ ______。",
    "correctAnswer": "$2$",
    "explanation": "因为 $X \\sim P(\\lambda_1),\\; Y \\sim P(\\lambda_2)$ 且相互独立，由泊松分布的可加性得：\n$$X + Y \\sim P(\\lambda_1 + \\lambda_2).$$\n已知 $P\\{X + Y > 0\\} = 1 - P\\{X + Y = 0\\} = 1 - e^{-(\\lambda_1 + \\lambda_2)} = 1 - e^{-1}$，故 $\\lambda_1 + \\lambda_2 = 1$，即 $X + Y \\sim P(1)$。\n从而 $E(X+Y) = 1,\\; D(X+Y) = 1$，因此：\n$$E\\left[(X+Y)^2\\right] = D(X+Y) + \\left[E(X+Y)\\right]^2 = 1 + 1^2 = 2.$$",
    "steps": [
      "利用泊松分布可加性得 $X+Y \\sim P(\\lambda_1+\\lambda_2)$",
      "由 $P\\{X+Y=0\\}=e^{-1}$ 解得 $\\lambda_1+\\lambda_2=1$",
      "利用 $E(Z^2)=D(Z)+(EZ)^2$ 计算得 $2$"
    ],
    "keyPoints": [
      "泊松分布可加性",
      "二阶原点矩公式"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "可加性",
      "泊松分布",
      "数字特征"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-31",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "choice",
    "question": "设 $X_1, X_2, \\cdots, X_{20}$ 是来自总体 $B(1, 0.1)$ 的简单随机样本，令 $T = \\sum_{i=1}^{20} X_i$，利用泊松分布近似表示二项分布的方法可得 $P\\{T \\le 1\\} \\approx$ （ ）",
    "options": [
      "A. $\\frac{1}{e^2}$",
      "B. $\\frac{2}{e^2}$",
      "C. $\\frac{3}{e^2}$",
      "D. $\\frac{4}{e^2}$"
    ],
    "correctAnswer": "C",
    "explanation": "因为 $X_1, \\cdots, X_{20}$ 独立同分布于 $B(1, 0.1)$，由二项分布的可加性得：\n$$T = \\sum_{i=1}^{20} X_i \\sim B(20, 0.1).$$\n用泊松分布近似二项分布，取参数 $\\lambda = np = 20 \\times 0.1 = 2$，即 $T$ 近似服从 $P(2)$，故：\n$$P\\{T \\le 1\\} = P\\{T=0\\} + P\\{T=1\\} \\approx \\frac{2^0}{0!}e^{-2} + \\frac{2^1}{1!}e^{-2} = \\frac{1 + 2}{e^2} = \\frac{3}{e^2}.$$\n故选 C。",
    "steps": [
      "由二项分布可加性得 $T \\sim B(20, 0.1)$",
      "取 $\\lambda = np = 2$ 用泊松分布 $P(2)$ 近似",
      "计算 $P\\{T=0\\}+P\\{T=1\\} \\approx e^{-2}+2e^{-2}=\\frac{3}{e^2}$，选 C"
    ],
    "keyPoints": [
      "二项分布可加性",
      "泊松定理（二项分布的泊松近似）"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2025真题",
      "数一",
      "泊松近似"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-32",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，且都服从参数为 $1$ 的指数分布，求 $P\\{2 < \\min\\{X,Y\\} \\le 3\\}$，$P\\{2 < \\max\\{X,Y\\} \\le 3\\}$。",
    "correctAnswer": "$P\\{2 < \\min\\{X,Y\\} \\le 3\\} = e^{-4} - e^{-6}$，$P\\{2 < \\max\\{X,Y\\} \\le 3\\} = (1 - e^{-3})^2 - (1 - e^{-2})^2$",
    "explanation": "指数分布 $E(1)$ 的分布函数为 $F(x) = \\begin{cases} 1 - e^{-x}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}$。\n\n**（1）求 $P\\{2 < \\min\\{X,Y\\} \\le 3\\}$：**\n利用最小值转化技巧（看到最小值转换成大于某数）：\n$$P\\{\\min\\{X,Y\\} > a\\} = P\\{X > a,\\; Y > a\\} = P\\{X > a\\}P\\{Y > a\\} = e^{-a}\\cdot e^{-a} = e^{-2a}\\;(a > 0).$$\n（也可直接用结论 $\\min\\{X,Y\\} \\sim E(1+1)=E(2)$。）故：\n$$P\\{2 < \\min\\{X,Y\\} \\le 3\\} = P\\{\\min\\{X,Y\\} > 2\\} - P\\{\\min\\{X,Y\\} > 3\\} = e^{-4} - e^{-6}.$$\n\n**（2）求 $P\\{2 < \\max\\{X,Y\\} \\le 3\\}$：**\n利用最大值转化技巧（看到最大值转换成小于等于某数）：\n$$P\\{\\max\\{X,Y\\} \\le a\\} = P\\{X \\le a,\\; Y \\le a\\} = [F(a)]^2 = (1 - e^{-a})^2\\;(a > 0).$$\n故：\n$$P\\{2 < \\max\\{X,Y\\} \\le 3\\} = P\\{\\max\\{X,Y\\} \\le 3\\} - P\\{\\max\\{X,Y\\} \\le 2\\} = (1 - e^{-3})^2 - (1 - e^{-2})^2.$$\n（展开亦可写作 $2e^{-2} - 2e^{-3} - e^{-4} + e^{-6}$。）",
    "steps": [
      "对最小值利用 $P\\{\\min > a\\} = P\\{X>a\\}P\\{Y>a\\}=e^{-2a}$，作差得 $e^{-4}-e^{-6}$",
      "对最大值利用 $P\\{\\max \\le a\\} = P\\{X\\le a\\}P\\{Y\\le a\\}=(1-e^{-a})^2$，作差得 $(1-e^{-3})^2-(1-e^{-2})^2$"
    ],
    "keyPoints": [
      "最值函数事件转化",
      "指数分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "最值分布",
      "指数分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-33",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X_1, X_2, \\cdots, X_n$ 独立同分布，$F(x)$ 是其共同的分布函数，令 $U = \\min\\{X_1, X_2, \\cdots, X_n\\},\\; V = \\max\\{X_1, X_2, \\cdots, X_n\\}$，求 $U$ 的分布函数 $F_U(u)$，$V$ 的分布函数 $F_V(v)$。",
    "correctAnswer": "$F_U(u) = 1 - [1 - F(u)]^n$，$F_V(v) = [F(v)]^n$",
    "explanation": "**（1）求最小值 $U$ 的分布函数 $F_U(u)$：**\n利用对立事件转化：\n$$\\begin{aligned}\nF_U(u) &= P\\{U \\le u\\} = 1 - P\\{U > u\\} = 1 - P\\{X_1 > u, X_2 > u, \\cdots, X_n > u\\} \\\\\n&= 1 - \\prod_{i=1}^{n} P\\{X_i > u\\} = 1 - [1 - F(u)]^n.\n\\end{aligned}$$\n\n**（2）求最大值 $V$ 的分布函数 $F_V(v)$：**\n$$\\begin{aligned}\nF_V(v) &= P\\{V \\le v\\} = P\\{X_1 \\le v, X_2 \\le v, \\cdots, X_n \\le v\\} \\\\\n&= \\prod_{i=1}^{n} P\\{X_i \\le v\\} = [F(v)]^n.\n\\end{aligned}$$",
    "steps": [
      "对最小值 $U$ 利用对立事件转化为 $\\{X_i > u\\}$ 的交事件，由独立同分布得出 $1-[1-F(u)]^n$",
      "对最大值 $V$ 直接转化为 $\\{X_i \\le v\\}$ 的交事件，得出 $[F(v)]^n$"
    ],
    "keyPoints": [
      "独立同分布最值公式",
      "最值函数分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "最值分布",
      "基础公式推导"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-34",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 的概率密度为 $f(x,y) = \\begin{cases} x + y, & 0 < x, y < 1 \\\\ 0, & \\text{其他} \\end{cases}$，求 $Z = \\max\\{X, Y\\}$ 的分布函数。",
    "correctAnswer": "$F_Z(z) = \\begin{cases} 0, & z < 0 \\\\ z^3, & 0 \\le z < 1 \\\\ 1, & z \\ge 1 \\end{cases}$",
    "explanation": "注意本题中 $X, Y$ 并不独立（密度 $x+y$ 变量不可分离），需直接用二重积分求分布函数：\n- 当 $z < 0$ 时，$F_Z(z) = 0$；\n- 当 $z \\ge 1$ 时，$F_Z(z) = 1$；\n- 当 $0 \\le z < 1$ 时：\n  $$\\begin{aligned}\n  F_Z(z) &= P\\{\\max\\{X,Y\\} \\le z\\} = P\\{X \\le z,\\; Y \\le z\\} \\\\\n  &= \\int_0^z \\mathrm{d}x \\int_0^z (x + y)\\,\\mathrm{d}y = \\int_0^z \\left(xz + \\frac{1}{2}z^2\\right)\\mathrm{d}x = \\frac{1}{2}z^3 + \\frac{1}{2}z^3 = z^3.\n  \\end{aligned}$$\n\n综上，$F_Z(z) = \\begin{cases} 0, & z < 0 \\\\ z^3, & 0 \\le z < 1 \\\\ 1, & z \\ge 1 \\end{cases}$。",
    "steps": [
      "注意到 $X,Y$ 不独立，用原始定义 $F_Z(z) = P\\{X\\le z, Y\\le z\\}$ 积分计算",
      "分 $z<0,\\; 0\\le z<1,\\; z\\ge 1$ 三段写出结果"
    ],
    "keyPoints": [
      "非独立随机变量最值分布",
      "二重积分求概率"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "最值分布",
      "二重积分"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-3-35",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "若 $X, Y$ 独立，$X \\sim E(\\lambda_1),\\; Y \\sim E(\\lambda_2)$，求 $Z = \\min\\{X, Y\\}$ 的分布函数。",
    "correctAnswer": "$F_Z(z) = \\begin{cases} 1 - e^{-(\\lambda_1 + \\lambda_2)z}, & z > 0 \\\\ 0, & z \\le 0 \\end{cases}$",
    "explanation": "因为 $X \\sim E(\\lambda_1),\\; Y \\sim E(\\lambda_2)$，当 $z \\le 0$ 时，$P\\{X \\le 0\\} = P\\{Y \\le 0\\} = 0$，故 $F_Z(z) = 0$。\n当 $z > 0$ 时，由独立性及最小值转换：\n$$F_Z(z) = 1 - P\\{\\min\\{X,Y\\} > z\\} = 1 - P\\{X > z\\}P\\{Y > z\\} = 1 - e^{-\\lambda_1 z}\\cdot e^{-\\lambda_2 z} = 1 - e^{-(\\lambda_1 + \\lambda_2)z}.$$\n综上，$F_Z(z) = \\begin{cases} 1 - e^{-(\\lambda_1 + \\lambda_2)z}, & z > 0 \\\\ 0, & z \\le 0 \\end{cases}$，即 $\\min\\{X,Y\\} \\sim E(\\lambda_1 + \\lambda_2)$。",
    "steps": [
      "当 $z\\le 0$ 时 $F_Z(z)=0$",
      "当 $z>0$ 时利用 $F_Z(z)=1-P\\{X>z\\}P\\{Y>z\\}$ 推导得到 $1-e^{-(\\lambda_1+\\lambda_2)z}$"
    ],
    "keyPoints": [
      "独立指数分布最小值分布",
      "最值分布"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "指数分布",
      "最值分布",
      "重要结论"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "计算：（1）$\\int_0^{+\\infty} x^4 e^{-x}\\,\\mathrm{d}x$；（2）$\\int_0^{+\\infty} x^3 e^{-2x}\\,\\mathrm{d}x$；（3）$\\int_0^{+\\infty} x^4 e^{-x^2}\\,\\mathrm{d}x$。",
    "correctAnswer": "（1）$24$；（2）$\\frac{3}{8}$；（3）$\\frac{3\\sqrt{\\pi}}{8}$",
    "explanation": "利用伽马函数的定义与性质：$\\Gamma(\\alpha) = \\int_0^{+\\infty} x^{\\alpha-1}e^{-x}\\,\\mathrm{d}x = 2\\int_0^{+\\infty} x^{2\\alpha-1}e^{-x^2}\\,\\mathrm{d}x$，$\\Gamma(\\alpha+1) = \\alpha\\Gamma(\\alpha)$，$\\Gamma(n)=(n-1)!$，$\\Gamma(\\frac{1}{2})=\\sqrt{\\pi}$。\n\n- **（1）** 直接利用速算公式 $\\int_0^{+\\infty} x^n e^{-x}\\,\\mathrm{d}x = n!$（或 $\\Gamma(5) = 4!$）：\n  $$\\int_0^{+\\infty} x^4 e^{-x}\\,\\mathrm{d}x = 4! = 24.$$\n- **（2）** 令 $t = 2x$，则 $x = \\frac{t}{2},\\; \\mathrm{d}x = \\frac{1}{2}\\mathrm{d}t$：\n  $$\\int_0^{+\\infty} x^3 e^{-2x}\\,\\mathrm{d}x = \\int_0^{+\\infty} \\left(\\frac{t}{2}\\right)^3 e^{-t}\\cdot\\frac{1}{2}\\,\\mathrm{d}t = \\frac{1}{16}\\int_0^{+\\infty} t^3 e^{-t}\\,\\mathrm{d}t = \\frac{3!}{16} = \\frac{6}{16} = \\frac{3}{8}.$$\n- **（3）** 对照形式（2）：$2\\alpha - 1 = 4 \\implies \\alpha = \\frac{5}{2}$，故：\n  $$\\int_0^{+\\infty} x^4 e^{-x^2}\\,\\mathrm{d}x = \\frac{1}{2}\\Gamma\\left(\\frac{5}{2}\\right) = \\frac{1}{2}\\cdot\\frac{3}{2}\\cdot\\frac{1}{2}\\Gamma\\left(\\frac{1}{2}\\right) = \\frac{3\\sqrt{\\pi}}{8}.$$",
    "steps": [
      "第（1）题直接套用 $\\int_0^{+\\infty} x^n e^{-x}\\mathrm{d}x = n!$ 得 $24$",
      "第（2）题换元 $t=2x$ 化为标准伽马积分得 $\\frac{3}{8}$",
      "第（3）题套用第二形式 $\\frac{1}{2}\\Gamma(\\frac{5}{2})$ 并递推至 $\\Gamma(\\frac{1}{2})=\\sqrt{\\pi}$ 得 $\\frac{3\\sqrt{\\pi}}{8}$"
    ],
    "keyPoints": [
      "伽马函数",
      "反常积分速算"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "伽马函数",
      "积分计算"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "计算下列随机变量 $X$ 的期望与方差，其概率密度为：（1）$f(x) = \\begin{cases} 1 + x, & -1 \\le x \\le 0 \\\\ 1 - x, & 0 < x \\le 1 \\\\ 0, & \\text{其他} \\end{cases}$；（2）$f(x) = \\frac{1}{2}e^{-|x|},\\; -\\infty < x < +\\infty$；（3）$f(x) = \\begin{cases} \\frac{x}{\\sigma^2}e^{-\\frac{x^2}{2\\sigma^2}}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}$。",
    "correctAnswer": "（1）$E(X)=0,\\; D(X)=\\frac{1}{6}$；（2）$E(X)=0,\\; D(X)=2$；（3）$E(X)=\\sqrt{\\frac{\\pi}{2}}\\sigma,\\; D(X)=\\frac{4-\\pi}{2}\\sigma^2$",
    "explanation": "**（1）** 由 $f(x)$ 为偶函数且关于原点对称：\n$$E(X) = \\int_{-1}^{1} xf(x)\\,\\mathrm{d}x = 0.$$\n$$E(X^2) = 2\\int_0^1 x^2(1-x)\\,\\mathrm{d}x = 2\\left(\\frac{1}{3} - \\frac{1}{4}\\right) = \\frac{1}{6} \\implies D(X) = E(X^2) - [E(X)]^2 = \\frac{1}{6}.$$\n\n**（2）** 由 $f(x) = \\frac{1}{2}e^{-|x|}$ 为偶函数：\n$$E(X) = \\int_{-\\infty}^{+\\infty} xf(x)\\,\\mathrm{d}x = 0.$$\n$$E(X^2) = 2\\int_0^{+\\infty} x^2\\cdot\\frac{1}{2}e^{-x}\\,\\mathrm{d}x = \\int_0^{+\\infty} x^2 e^{-x}\\,\\mathrm{d}x = 2! = 2 \\implies D(X) = 2 - 0^2 = 2.$$\n\n**（3）** 令 $t = \\frac{x}{\\sqrt{2}\\sigma}\\;(x = \\sqrt{2}\\sigma t)$：\n$$E(X) = \\int_0^{+\\infty} \\frac{x^2}{\\sigma^2}e^{-\\frac{x^2}{2\\sigma^2}}\\,\\mathrm{d}x = 2\\sqrt{2}\\sigma \\int_0^{+\\infty} t^2 e^{-t^2}\\,\\mathrm{d}t = \\sqrt{2}\\sigma\\,\\Gamma\\left(\\frac{3}{2}\\right) = \\sqrt{2}\\sigma\\cdot\\frac{1}{2}\\sqrt{\\pi} = \\sqrt{\\frac{\\pi}{2}}\\sigma.$$\n再令 $u = \\frac{x^2}{2\\sigma^2}\\;(\\mathrm{d}u = \\frac{x}{\\sigma^2}\\mathrm{d}x)$ 计算二阶矩：\n$$E(X^2) = \\int_0^{+\\infty} x^2 \\frac{x}{\\sigma^2}e^{-\\frac{x^2}{2\\sigma^2}}\\,\\mathrm{d}x = \\int_0^{+\\infty} 2\\sigma^2 u e^{-u}\\,\\mathrm{d}u = 2\\sigma^2\\cdot 1! = 2\\sigma^2.$$\n故 $D(X) = E(X^2) - [E(X)]^2 = 2\\sigma^2 - \\frac{\\pi}{2}\\sigma^2 = \\frac{4 - \\pi}{2}\\sigma^2$。",
    "steps": [
      "第（1）（2）问利用概率密度偶对称性秒得 $E(X)=0$，再化简对称积分求 $E(X^2)$",
      "第（3）问通过换元结合伽马函数算出 $E(X)=\\sqrt{\\frac{\\pi}{2}}\\sigma$ 与 $E(X^2)=2\\sigma^2$，进而求得 $D(X)$"
    ],
    "keyPoints": [
      "连续型期望与方差",
      "对称性简化积分",
      "伽马函数应用"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "期望与方差",
      "伽马函数",
      "瑞利分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim U(0, 2),\\; Y = \\min\\{X, 1\\}$，求 $E(Y)$。",
    "correctAnswer": "$\\frac{3}{4}$",
    "explanation": "$X \\sim U(0,2)$ 的概率密度为 $f(x) = \\begin{cases} \\frac{1}{2}, & 0 < x < 2 \\\\ 0, & \\text{其他} \\end{cases}$，且 $Y = g(X) = \\begin{cases} X, & X \\le 1 \\\\ 1, & X > 1 \\end{cases}$。\n直接利用一维连续型随机变量函数期望公式（不必先求 $Y$ 的分布）：\n$$E(Y) = \\int_0^2 \\min\\{x, 1\\}\\cdot\\frac{1}{2}\\,\\mathrm{d}x = \\int_0^1 \\frac{x}{2}\\,\\mathrm{d}x + \\int_1^2 \\frac{1}{2}\\,\\mathrm{d}x = \\frac{1}{4} + \\frac{1}{2} = \\frac{3}{4}.$$",
    "steps": [
      "写出 $X$ 的均匀分布密度 $\\frac{1}{2}\\;(0<x<2)$ 与分段函数 $g(x)=\\min\\{x,1\\}$",
      "直接套用 $E(g(X))=\\int g(x)f(x)\\,\\mathrm{d}x$ 分 $(0,1)$ 和 $(1,2)$ 两段积分得 $\\frac{3}{4}$"
    ],
    "keyPoints": [
      "一维随机变量函数的期望",
      "分段函数积分"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "660题",
      "函数期望",
      "均匀分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 在以点 $(0,1),\\; (1,0),\\; (1,1)$ 为顶点的三角形区域上服从均匀分布，求 $Z = X + Y$ 的方差。",
    "correctAnswer": "$\\frac{1}{18}$",
    "explanation": "三角形区域 $D = \\{(x,y) \\mid 0 \\le x \\le 1,\\; 1 - x \\le y \\le 1\\}$ 的面积为 $\\frac{1}{2}$，故联合概率密度为：\n$$f(x,y) = \\begin{cases} 2, & (x,y) \\in D \\\\ 0, & \\text{其他} \\end{cases}$$\n直接利用二维随机变量函数期望公式计算 $E(Z)$ 和 $E(Z^2)$：\n$$E(Z) = E(X+Y) = \\int_0^1 \\mathrm{d}x \\int_{1-x}^1 2(x+y)\\,\\mathrm{d}y = \\int_0^1 \\left[(x+y)^2\\right]_{1-x}^1 \\mathrm{d}x = \\int_0^1 \\left[(x+1)^2 - 1\\right]\\mathrm{d}x = \\int_0^1 (x^2+2x)\\,\\mathrm{d}x = \\frac{1}{3} + 1 = \\frac{4}{3}.$$\n$$E(Z^2) = E[(X+Y)^2] = \\int_0^1 \\mathrm{d}x \\int_{1-x}^1 2(x+y)^2\\,\\mathrm{d}y = \\frac{2}{3}\\int_0^1 \\left[(x+1)^3 - 1\\right]\\mathrm{d}x = \\frac{2}{3}\\left[\\frac{(x+1)^4}{4} - x\\right]_0^1 = \\frac{2}{3}\\left(4 - 1 - \\frac{1}{4}\\right) = \\frac{2}{3}\\cdot\\frac{11}{4} = \\frac{11}{6}.$$\n因此：\n$$D(Z) = E(Z^2) - [E(Z)]^2 = \\frac{11}{6} - \\left(\\frac{4}{3}\\right)^2 = \\frac{33 - 32}{18} = \\frac{1}{18}.$$",
    "steps": [
      "求三角形面积 $\\frac{1}{2}$ 并写出联合密度 $f(x,y)=2$",
      "直接用二重积分计算 $E(X+Y)=\\frac{4}{3}$ 和 $E[(X+Y)^2]=\\frac{11}{6}$",
      "利用 $D(Z)=E(Z^2)-[E(Z)]^2$ 算得 $\\frac{1}{18}$"
    ],
    "keyPoints": [
      "二维均匀分布",
      "二维函数期望与方差"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2001真题",
      "均匀分布",
      "方差计算"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim E(1),\\; Y = X + e^{-2X}$，求 $E(Y),\\; D(Y)$。",
    "correctAnswer": "$E(Y) = \\frac{4}{3},\\; D(Y) = \\frac{29}{45}$",
    "explanation": "由于 $X \\sim E(1)$，其密度为 $f(x) = e^{-x}\\;(x>0)$，且 $E(X) = 1,\\; D(X) = 1,\\; E(X^2) = 2$。\n利用已知分布计算期望：\n- $E(e^{-2X}) = \\int_0^{+\\infty} e^{-2x}\\cdot e^{-x}\\,\\mathrm{d}x = \\int_0^{+\\infty} e^{-3x}\\,\\mathrm{d}x = \\frac{1}{3}$；\n  故 $E(Y) = E(X) + E(e^{-2X}) = 1 + \\frac{1}{3} = \\frac{4}{3}$。\n- 接下来求 $E(Y^2) = E(X^2 + 2Xe^{-2X} + e^{-4X}) = E(X^2) + 2E(Xe^{-2X}) + E(e^{-4X})$：\n  - $E(Xe^{-2X}) = \\int_0^{+\\infty} x e^{-3x}\\,\\mathrm{d}x = \\frac{1}{3}\\int_0^{+\\infty} x\\cdot 3e^{-3x}\\,\\mathrm{d}x = \\frac{1}{3}E(U) = \\frac{1}{9}$（其中 $U \\sim E(3)$）；\n  - $E(e^{-4X}) = \\int_0^{+\\infty} e^{-5x}\\,\\mathrm{d}x = \\frac{1}{5}$。\n  故 $E(Y^2) = 2 + 2\\cdot\\frac{1}{9} + \\frac{1}{5} = \\frac{90 + 10 + 9}{45} = \\frac{109}{45}$。\n- 因此：\n  $$D(Y) = E(Y^2) - [E(Y)]^2 = \\frac{109}{45} - \\left(\\frac{4}{3}\\right)^2 = \\frac{109 - 80}{45} = \\frac{29}{45}.$$",
    "steps": [
      "求 $E(e^{-2X})=\\frac{1}{3}$ 并由线性性得 $E(Y)=\\frac{4}{3}$",
      "展开 $Y^2=X^2+2Xe^{-2X}+e^{-4X}$，利用 $E(3)$ 期望技巧求得 $E(Y^2)=\\frac{109}{45}$",
      "由 $D(Y)=E(Y^2)-[E(Y)]^2$ 算得 $\\frac{29}{45}$"
    ],
    "keyPoints": [
      "指数分布期望方差",
      "已知分布巧求积分",
      "方差计算公式"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "指数分布",
      "巧解积分",
      "期望方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim P(1)$，求 $E(X^3)$。",
    "correctAnswer": "$5$",
    "explanation": "**法一（阶乘拆分 + 泊松级数技巧）：**\n利用泊松分布特征 $E[X(X-1)(X-2)] = \\sum_{k=3}^{\\infty} k(k-1)(k-2)\\frac{1^k e^{-1}}{k!} = \\sum_{k=3}^{\\infty} \\frac{e^{-1}}{(k-3)!} = 1$。\n又 $X^3 = X(X-1)(X-2) + 3X^2 - 2X$，而 $E(X) = 1,\\; D(X) = 1 \\implies E(X^2) = D(X) + [E(X)]^2 = 2$。\n故：\n$$E(X^3) = E[X(X-1)(X-2)] + 3E(X^2) - 2E(X) = 1 + 3\\times 2 - 2\\times 1 = 5.$$\n\n**法二（直接级数拆项）：**\n$$E(X^3) = \\sum_{k=0}^{\\infty} k^3 \\frac{e^{-1}}{k!} = \\sum_{k=1}^{\\infty} k^2 \\frac{e^{-1}}{(k-1)!} = \\sum_{m=0}^{\\infty} (m+1)^2 \\frac{e^{-1}}{m!} = E\\left[(X+1)^2\\right] = E(X^2 + 2X + 1) = 2 + 2 + 1 = 5.$$",
    "steps": [
      "将 $k^3$ 按泊松分布降阶拆为 $X(X-1)(X-2)+3X^2-2X$ 或移位为 $(m+1)^2$",
      "代入 $E(X)=1,\\; E(X^2)=2$ 直接得出 $E(X^3)=5$"
    ],
    "keyPoints": [
      "泊松分布高阶矩",
      "已知分布巧求级数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "泊松分布",
      "高阶原点矩",
      "级数技巧"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X$ 的概率密度为 $f(x) = \\begin{cases} \\frac{1}{2}\\cos\\frac{x}{2}, & 0 \\le x \\le \\pi \\\\ 0, & \\text{其他} \\end{cases}$，对 $X$ 独立重复观察 $4$ 次，用 $Y$ 表示观察值大于 $\\frac{\\pi}{3}$ 的次数，求 $E(Y^2)$。",
    "correctAnswer": "$5$",
    "explanation": "首先求单次观察值大于 $\\frac{\\pi}{3}$ 的概率 $p$：\n$$p = P\\left\\{X > \\frac{\\pi}{3}\\right\\} = \\int_{\\pi/3}^{\\pi} \\frac{1}{2}\\cos\\frac{x}{2}\\,\\mathrm{d}x = \\left[\\sin\\frac{x}{2}\\right]_{\\pi/3}^{\\pi} = \\sin\\frac{\\pi}{2} - \\sin\\frac{\\pi}{6} = 1 - \\frac{1}{2} = \\frac{1}{2}.$$\n因为独立重复观察 $4$ 次，故 $Y \\sim B\\left(4, \\frac{1}{2}\\right)$，从而：\n$$E(Y) = np = 4 \\times \\frac{1}{2} = 2, \\qquad D(Y) = np(1-p) = 4 \\times \\frac{1}{2} \\times \\frac{1}{2} = 1.$$\n因此：\n$$E(Y^2) = D(Y) + [E(Y)]^2 = 1 + 2^2 = 5.$$",
    "steps": [
      "积分求出单次观测大于 $\\frac{\\pi}{3}$ 的概率 $p=\\frac{1}{2}$",
      "识别 $Y \\sim B(4, \\frac{1}{2})$，写出 $E(Y)=2,\\; D(Y)=1$",
      "由 $E(Y^2)=D(Y)+[E(Y)]^2$ 求得 $5$"
    ],
    "keyPoints": [
      "二项分布期望与方差",
      "二阶矩计算"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2002真题",
      "二项分布",
      "二阶矩"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim P(1)$，求 $E(|X - EX|)$。",
    "correctAnswer": "$\\frac{2}{e}$",
    "explanation": "由 $X \\sim P(1)$ 得 $E(X) = 1$，分布律为 $P\\{X = k\\} = \\frac{e^{-1}}{k!}\\;(k = 0, 1, 2, \\cdots)$。\n按离散型随机变量函数期望公式展开绝对值：\n$$\\begin{aligned}\nE(|X - 1|) &= \\sum_{k=0}^{\\infty} |k - 1|\\frac{e^{-1}}{k!} \\\\\n&= |0 - 1|e^{-1} + |1 - 1|e^{-1} + \\sum_{k=2}^{\\infty} (k - 1)\\frac{e^{-1}}{k!} \\\\\n&= e^{-1} + \\left[\\sum_{k=0}^{\\infty} (k - 1)\\frac{e^{-1}}{k!} - (0 - 1)e^{-1} - (1 - 1)e^{-1}\\right] \\\\\n&= e^{-1} + \\left[E(X) - 1 + e^{-1}\\right] = 2e^{-1} = \\frac{2}{e}.\n\\end{aligned}$$\n（注：也可直接对 $\\sum_{k=2}^{\\infty} (k-1)\\frac{e^{-1}}{k!} = e^{-1}\\sum_{k=2}^{\\infty}\\left(\\frac{1}{(k-1)!} - \\frac{1}{k!}\\right) = e^{-1}\\cdot\\frac{1}{1!} = e^{-1}$ 裂项相消得到。）",
    "steps": [
      "代入 $EX=1$ 将所求化为级数 $\\sum_{k=0}^{\\infty} |k-1|\\frac{e^{-1}}{k!}$",
      "按 $k=0$、$k=1$ 与 $k\\ge 2$ 拆去绝对值符号",
      "补全期望级数（或裂项相消）算出结果为 $\\frac{2}{e}$"
    ],
    "keyPoints": [
      "泊松分布",
      "离散型绝对值函数期望",
      "级数裂项/期望配凑"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2023真题",
      "泊松分布",
      "绝对值期望"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设 $X$ 服从参数为 $\\lambda$ 的泊松分布，求 $Y = 2^X$ 的期望和方差。",
    "correctAnswer": "$E(Y) = e^{\\lambda},\\; D(Y) = e^{3\\lambda} - e^{2\\lambda}$",
    "explanation": "$X \\sim P(\\lambda)$ 的分布律为 $P\\{X=k\\} = \\frac{\\lambda^k}{k!}e^{-\\lambda}\\;(k=0,1,2,\\cdots)$，直接用函数期望公式结合 $e^x$ 泰勒级数：\n$$E(Y) = E(2^X) = \\sum_{k=0}^{\\infty} 2^k \\frac{\\lambda^k}{k!}e^{-\\lambda} = e^{-\\lambda}\\sum_{k=0}^{\\infty} \\frac{(2\\lambda)^k}{k!} = e^{-\\lambda}\\cdot e^{2\\lambda} = e^{\\lambda}.$$\n$$E(Y^2) = E(4^X) = \\sum_{k=0}^{\\infty} 4^k \\frac{\\lambda^k}{k!}e^{-\\lambda} = e^{-\\lambda}\\sum_{k=0}^{\\infty} \\frac{(4\\lambda)^k}{k!} = e^{-\\lambda}\\cdot e^{4\\lambda} = e^{3\\lambda}.$$\n因此方差为：\n$$D(Y) = E(Y^2) - [E(Y)]^2 = e^{3\\lambda} - e^{2\\lambda} = e^{2\\lambda}(e^{\\lambda} - 1).$$",
    "steps": [
      "代入 $E(2^X)$ 与 $E(4^X)$ 的定义级数并合并幂次",
      "利用指数级数 $\\sum_{k=0}^\\infty \\frac{t^k}{k!}=e^t$ 算得 $E(Y)=e^\\lambda,\\; E(Y^2)=e^{3\\lambda}$",
      "由 $D(Y)=E(Y^2)-[E(Y)]^2$ 得 $e^{3\\lambda}-e^{2\\lambda}$"
    ],
    "keyPoints": [
      "泊松分布",
      "泰勒级数求函数期望与方差"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "泊松分布",
      "级数求和",
      "期望方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim U(0, 3)$，随机变量 $Y$ 服从参数为 $2$ 的泊松分布，且 $X$ 与 $Y$ 的协方差为 $-1$，求 $D(2X - Y + 1)$。",
    "correctAnswer": "$9$",
    "explanation": "由常见分布方差公式：\n- $X \\sim U(0,3) \\implies D(X) = \\frac{(3-0)^2}{12} = \\frac{9}{12} = \\frac{3}{4}$；\n- $Y \\sim P(2) \\implies D(Y) = 2$；\n- 已知 $\\mathrm{Cov}(X,Y) = -1$。\n\n由方差性质：\n$$D(2X - Y + 1) = D(2X - Y) = 4D(X) + D(Y) - 4\\mathrm{Cov}(X,Y) = 4\\times\\frac{3}{4} + 2 - 4\\times(-1) = 3 + 2 + 4 = 9.$$",
    "steps": [
      "查常见分布表写出 $D(X)=\\frac{3}{4},\\; D(Y)=2$",
      "利用 $D(aX-bY+c)=a^2 D(X)+b^2 D(Y)-2ab\\,\\mathrm{Cov}(X,Y)$ 代入计算得 $9$"
    ],
    "keyPoints": [
      "常见分布方差",
      "线性组合方差公式"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "泊松分布",
      "方差性质"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-11",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 相互独立，且 $X \\sim N(1, 2),\\; Y \\sim N(1, 4)$，求 $D(XY)$。",
    "correctAnswer": "$14$",
    "explanation": "由 $X \\sim N(1, 2)$ 和 $Y \\sim N(1, 4)$ 得：\n- $E(X) = 1,\\; D(X) = 2 \\implies E(X^2) = D(X) + [E(X)]^2 = 2 + 1^2 = 3$；\n- $E(Y) = 1,\\; D(Y) = 4 \\implies E(Y^2) = D(Y) + [E(Y)]^2 = 4 + 1^2 = 5$。\n\n因为 $X$ 与 $Y$ 相互独立，所以 $X^2$ 与 $Y^2$ 也相互独立，从而：\n$$D(XY) = E(X^2 Y^2) - [E(XY)]^2 = E(X^2)E(Y^2) - [E(X)E(Y)]^2 = 3 \\times 5 - (1 \\times 1)^2 = 15 - 1 = 14.$$",
    "steps": [
      "根据正态分布参数求得 $E(X)=1, E(X^2)=3$ 与 $E(Y)=1, E(Y^2)=5$",
      "利用独立性将 $D(XY)$ 拆解为 $E(X^2)E(Y^2)-[E(X)E(Y)]^2=14$"
    ],
    "keyPoints": [
      "乘积的方差",
      "独立性",
      "正态分布二阶矩"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2016真题",
      "乘积方差",
      "独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-12",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X$ 的分布函数为 $F(x) = 0.3\\Phi(x) + 0.7\\Phi\\left(\\frac{x - 1}{2}\\right)$，求 $E(X)$。增问：求 $D(X)$。",
    "correctAnswer": "$E(X) = 0.7$；增问：$D(X) = 3.31$",
    "explanation": "记 $\\varphi(x)$ 为标准正态分布 $N(0,1)$ 的概率密度函数。对 $F(x)$ 求导得 $X$ 的概率密度：\n$$f(x) = 0.3\\varphi(x) + 0.7\\cdot\\frac{1}{2}\\varphi\\left(\\frac{x-1}{2}\\right) = 0.3 f_1(x) + 0.7 f_2(x),$$\n其中 $f_1(x)$ 是 $X_1 \\sim N(0,1)$ 的概率密度，$f_2(x)$ 是 $X_2 \\sim N(1, 2^2)$ 的概率密度。\n\n- **求 $E(X)$：**\n  $$E(X) = \\int_{-\\infty}^{+\\infty} x\\left[0.3f_1(x) + 0.7f_2(x)\\right]\\mathrm{d}x = 0.3E(X_1) + 0.7E(X_2) = 0.3\\times 0 + 0.7\\times 1 = 0.7.$$\n- **增问求 $D(X)$：**\n  先求二阶原点矩 $E(X^2)$（注意线性组合性质适用于密度函数，**不可以直接对方差加权**！）：\n  $$E(X^2) = 0.3E(X_1^2) + 0.7E(X_2^2) = 0.3\\times(1 + 0^2) + 0.7\\times(4 + 1^2) = 0.3 + 3.5 = 3.8.$$\n  再由方差公式：\n  $$D(X) = E(X^2) - [E(X)]^2 = 3.8 - 0.7^2 = 3.8 - 0.49 = 3.31.$$",
    "steps": [
      "对 $F(x)$ 求导得到 $f(x)=0.3f_1(x)+0.7f_2(x)$，识别为 $N(0,1)$ 与 $N(1,4)$ 的混合密度",
      "利用积分线性性求得 $E(X)=0.3\\times 0+0.7\\times 1=0.7$ 和 $E(X^2)=0.3\\times 1+0.7\\times 5=3.8$",
      "用 $D(X)=E(X^2)-[E(X)]^2$ 算得 $3.31$"
    ],
    "keyPoints": [
      "混合分布期望与方差",
      "二阶原点矩线性性"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2019真题",
      "混合正态",
      "方差陷阱"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-13",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "blank",
    "question": "设每次试验只有两个结果 $A, \\overline{A}$，已知 $P(A) = p\\;(0 < p < 1)$，重复独立进行该试验直至 $A$ 与 $\\overline{A}$ 都出现为止，且试验次数 $X$ 的期望为 $3$，则 $p =$ ______。",
    "correctAnswer": "$\\frac{1}{2}$",
    "explanation": "记 $q = 1 - p$。第 $1$ 次试验必发生 $A$（概率 $p$）或发生 $\\overline{A}$（概率 $q$）：\n- 若第 $1$ 次出现 $A$，则此后只需等待首次出现 $\\overline{A}$，其所需额外次数服从参数为 $q$ 的几何分布 $G(q)$，期望为 $\\frac{1}{q}$；\n- 若第 $1$ 次出现 $\\overline{A}$，则此后只需等待首次出现 $A$，其所需额外次数服从参数为 $p$ 的几何分布 $G(p)$，期望为 $\\frac{1}{p}$。\n\n由全期望公式得：\n$$E(X) = 1 + p\\cdot\\frac{1}{q} + q\\cdot\\frac{1}{p} = 1 + \\frac{p^2 + q^2}{pq} = \\frac{p^2 + pq + q^2}{pq} = \\frac{1 - pq}{pq} = \\frac{1}{pq} - 1.$$\n（也可直接写出分布律 $P\\{X=k\\} = p^{k-1}q + q^{k-1}p\\;(k\\ge 2)$ 求级数得到同结果。）\n已知 $E(X) = 3$，则 $\\frac{1}{pq} - 1 = 3 \\implies pq = \\frac{1}{4}$。又 $p + q = 1$，故 $p(1-p) = \\frac{1}{4} \\implies \\left(p - \\frac{1}{2}\\right)^2 = 0 \\implies p = \\frac{1}{2}$。",
    "steps": [
      "按第 1 次试验结果分两种情况，利用几何分布期望公式写出 $E(X)=1+\\frac{p}{1-p}+\\frac{1-p}{p}$",
      "化简得 $\\frac{1}{p(1-p)}-1=3$，解方程得 $p=\\frac{1}{2}$"
    ],
    "keyPoints": [
      "几何分布期望",
      "全期望分解"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "李六",
      "几何分布",
      "等待时间期望"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-14",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设二维随机变量 $(X,Y)$ 在矩形 $G = \\{(x,y) \\mid 0 \\le x \\le 2,\\; 0 \\le y \\le 1\\}$ 上服从均匀分布，记 $U = \\begin{cases} 0, & X \\le Y \\\\ 1, & X > Y \\end{cases}$，$V = \\begin{cases} 0, & X \\le 2Y \\\\ 1, & X > 2Y \\end{cases}$，求：（1）$U$ 和 $V$ 的联合分布；（2）$U$ 和 $V$ 的相关系数。",
    "correctAnswer": "（1）$P\\{U=0,V=0\\}=\\frac{1}{4},\\; P\\{U=0,V=1\\}=0,\\; P\\{U=1,V=0\\}=\\frac{1}{4},\\; P\\{U=1,V=1\\}=\\frac{1}{2}$；（2）$\\frac{\\sqrt{3}}{3}$",
    "explanation": "矩形 $G$ 的面积为 $2 \\times 1 = 2$。在 $G$ 内有 $y \\ge 0$，故 $x \\le y \\implies x \\le 2y$，从而 $\\{U=0, V=1\\}$ 不可能发生。\n\n**（1）利用二维均匀分布面积比求 $(U,V)$ 联合分布：**\n- $P\\{U=0, V=0\\} = P\\{X \\le Y\\} = \\frac{S_{\\{0 \\le x \\le y \\le 1\\}}}{2} = \\frac{1/2}{2} = \\frac{1}{4}$；\n- $P\\{U=0, V=1\\} = 0$；\n- $P\\{U=1, V=0\\} = P\\{Y < X \\le 2Y\\} = \\frac{S_{\\{y < x \\le 2y,\\; 0\\le y\\le 1\\}}}{2} = \\frac{1 - 1/2}{2} = \\frac{1}{4}$；\n- $P\\{U=1, V=1\\} = P\\{X > 2Y\\} = \\frac{S_{\\{2y < x \\le 2,\\; 0\\le y\\le 1\\}}}{2} = \\frac{1}{2}$。\n\n**（2）求相关系数 $\\rho_{UV}$：**\n边缘分布：$U \\sim B\\left(1, \\frac{3}{4}\\right),\\; V \\sim B\\left(1, \\frac{1}{2}\\right)$，故：\n- $E(U) = \\frac{3}{4},\\; D(U) = \\frac{3}{4}\\times\\frac{1}{4} = \\frac{3}{16}$；\n- $E(V) = \\frac{1}{2},\\; D(V) = \\frac{1}{2}\\times\\frac{1}{2} = \\frac{1}{4}$；\n- $E(UV) = 1\\cdot 1\\cdot P\\{U=1, V=1\\} = \\frac{1}{2}$；\n- $\\mathrm{Cov}(U,V) = E(UV) - E(U)E(V) = \\frac{1}{2} - \\frac{3}{4}\\times\\frac{1}{2} = \\frac{1}{8}$。\n\n因此：\n$$\\rho_{UV} = \\frac{\\mathrm{Cov}(U,V)}{\\sqrt{D(U)}\\sqrt{D(V)}} = \\frac{1/8}{\\sqrt{3/16}\\cdot\\sqrt{1/4}} = \\frac{1/8}{\\frac{\\sqrt{3}}{8}} = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}.$$",
    "steps": [
      "画出矩形 $G$ 及直线 $x=y$、$x=2y$，用面积比算出 $(U,V)$ 的四个联合概率",
      "识别 $U,V$ 服从 0–1 分布，求得 $E(U), D(U), E(V), D(V)$ 及 $E(UV)$",
      "代入协方差与相关系数公式算出 $\\rho_{UV} = \\frac{\\sqrt{3}}{3}$"
    ],
    "keyPoints": [
      "二维均匀分布",
      "0–1分布",
      "相关系数计算"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1999真题",
      "相关系数",
      "联合分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-15",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "随机试验 $E$ 有三种两两不相容的结果 $A_1, A_2, A_3$，且三种结果发生的概率均为 $\\frac{1}{3}$，将试验独立重复做 $2$ 次，$X$ 表示 $2$ 次试验中结果 $A_1$ 发生的次数，$Y$ 表示 $2$ 次试验中结果 $A_2$ 发生的次数，求 $X$ 与 $Y$ 的相关系数。",
    "correctAnswer": "$-\\frac{1}{2}$",
    "explanation": "设 $Z$ 表示 $2$ 次试验中结果 $A_3$ 发生的次数，显然 $X, Y, Z$ 均服从二项分布 $B\\left(2, \\frac{1}{3}\\right)$，且 $X + Y + Z = 2$。\n故：\n$$D(X) = D(Y) = D(Z) = 2 \\times \\frac{1}{3} \\times \\frac{2}{3} = \\frac{4}{9}.$$\n又 $X + Y = 2 - Z$，两边取方差：\n$$D(X + Y) = D(2 - Z) = D(Z) = \\frac{4}{9}.$$\n另一方面，$D(X + Y) = D(X) + D(Y) + 2\\mathrm{Cov}(X,Y) = \\frac{8}{9} + 2\\mathrm{Cov}(X,Y)$，故：\n$$\\frac{8}{9} + 2\\mathrm{Cov}(X,Y) = \\frac{4}{9} \\implies \\mathrm{Cov}(X,Y) = -\\frac{2}{9}.$$\n因此相关系数为：\n$$\\rho_{XY} = \\frac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)D(Y)}} = \\frac{-2/9}{4/9} = -\\frac{1}{2}.$$\n（也可先算出 $P\\{X=1, Y=1\\} = 2\\times\\frac{1}{3}\\times\\frac{1}{3} = \\frac{2}{9}$，得 $E(XY)=\\frac{2}{9}$，再算协方差同样得 $-\\frac{1}{2}$。）",
    "steps": [
      "识别 $X,Y,Z \\sim B(2, \\frac{1}{3})$ 且满足 $X+Y=2-Z$",
      "利用 $D(X+Y)=D(2-Z)$ 巧妙求出 $\\mathrm{Cov}(X,Y)=-\\frac{2}{9}$",
      "代入相关系数公式得 $-\\frac{1}{2}$"
    ],
    "keyPoints": [
      "二项分布方差",
      "利用和的方差反求协方差",
      "相关系数"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2016真题",
      "相关系数",
      "三项分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设 $X$ 服从区间 $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$ 上的均匀分布，记 $Y = \\sin X$，求 $\\mathrm{Cov}(X, Y)$。",
    "correctAnswer": "$\\frac{2}{\\pi}$",
    "explanation": "$X \\sim U\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$ 的密度为 $f(x) = \\frac{1}{\\pi}\\;(-\\frac{\\pi}{2} < x < \\frac{\\pi}{2})$，区间的对称性及奇偶性给出了 $E(X) = 0$，且：\n$$E(Y) = E(\\sin X) = \\int_{-\\pi/2}^{\\pi/2} \\frac{1}{\\pi}\\sin x\\,\\mathrm{d}x = 0.$$\n再用分部积分计算 $E(XY)$：\n$$E(XY) = E(X\\sin X) = \\frac{2}{\\pi}\\int_0^{\\pi/2} x\\sin x\\,\\mathrm{d}x = \\frac{2}{\\pi}\\left([-x\\cos x]_0^{\\pi/2} + \\int_0^{\\pi/2}\\cos x\\,\\mathrm{d}x\\right) = \\frac{2}{\\pi}(0 + 1) = \\frac{2}{\\pi}.$$\n因此：\n$$\\mathrm{Cov}(X,Y) = E(XY) - E(X)E(Y) = \\frac{2}{\\pi} - 0 = \\frac{2}{\\pi}.$$",
    "steps": [
      "利用对称性得 $E(X)=0$ 与 $E(\\sin X)=0$",
      "利用分部积分计算 $E(X\\sin X)=\\frac{2}{\\pi}$",
      "由 $\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$ 得 $\\frac{2}{\\pi}$"
    ],
    "keyPoints": [
      "协方差计算公式",
      "均匀分布",
      "分部积分"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2020真题",
      "协方差",
      "三角积分"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-17",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X_1, X_2, X_3, X_4$ 独立同分布，且方差 $D(X_i) = \\sigma^2 > 0\\;(i=1,2,3,4)$，求随机变量 $2X_1 + 3X_2 - X_3$ 和 $3X_2 + 4X_3 - 5X_4$ 的相关系数。",
    "correctAnswer": "$\\frac{\\sqrt{7}}{14}$",
    "explanation": "记 $U = 2X_1 + 3X_2 - X_3$，$V = 3X_2 + 4X_3 - 5X_4$。由 $X_1, X_2, X_3, X_4$ 独立同分布（不同下标协方差为 $0$，同下标协方差为 $\\sigma^2$）：\n- $D(U) = (2^2 + 3^2 + (-1)^2)\\sigma^2 = 14\\sigma^2$；\n- $D(V) = (3^2 + 4^2 + (-5)^2)\\sigma^2 = 50\\sigma^2$；\n- $\\mathrm{Cov}(U,V) = \\mathrm{Cov}(2X_1 + 3X_2 - X_3,\\; 3X_2 + 4X_3 - 5X_4) = 3\\cdot 3\\,\\mathrm{Cov}(X_2, X_2) + (-1)\\cdot 4\\,\\mathrm{Cov}(X_3, X_3) = (9 - 4)\\sigma^2 = 5\\sigma^2$。\n\n故相关系数为：\n$$\\rho_{UV} = \\frac{5\\sigma^2}{\\sqrt{14\\sigma^2}\\cdot\\sqrt{50\\sigma^2}} = \\frac{5}{5\\sqrt{28}} = \\frac{1}{2\\sqrt{7}} = \\frac{\\sqrt{7}}{14}.$$",
    "steps": [
      "利用独立性分别求出两个线性组合的方差 $D(U)=14\\sigma^2,\\; D(V)=50\\sigma^2$",
      "利用协方差双线性性提取公共项 $X_2,X_3$ 算出 $\\mathrm{Cov}(U,V)=5\\sigma^2$",
      "代入相关系数公式化简得 $\\frac{\\sqrt{7}}{14}$"
    ],
    "keyPoints": [
      "协方差双线性性质",
      "独立线性组合方差与相关系数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "协方差性质",
      "相关系数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-18",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X_1, X_2, \\cdots, X_{n+m}\\;(n > m)$ 独立同分布，且方差 $D(X_i) = \\sigma^2 > 0\\;(i=1,2,\\cdots,n+m)$，记 $Y = \\sum_{k=1}^{n} X_k,\\; Z = \\sum_{k=1}^{n} X_{m+k}$，求 $Y, Z$ 的相关系数。",
    "correctAnswer": "$\\frac{n - m}{n}$",
    "explanation": "因为 $X_1, \\cdots, X_{n+m}$ 相互独立且方差均为 $\\sigma^2$，而 $Y$ 与 $Z$ 各含 $n$ 项：\n$$D(Y) = n\\sigma^2, \\qquad D(Z) = n\\sigma^2.$$\n展开 $Y = \\sum_{i=1}^{n} X_i$ 与 $Z = \\sum_{j=m+1}^{n+m} X_j$，二者共同含有的变量为 $X_{m+1}, X_{m+2}, \\cdots, X_n$（共有 $n - m$ 项），由于不同下标变量相互独立（协方差为 $0$）：\n$$\\mathrm{Cov}(Y, Z) = \\sum_{k=m+1}^{n} \\mathrm{Cov}(X_k, X_k) = (n - m)\\sigma^2.$$\n故相关系数为：\n$$\\rho_{YZ} = \\frac{(n - m)\\sigma^2}{\\sqrt{n\\sigma^2 \\cdot n\\sigma^2}} = \\frac{n - m}{n} = 1 - \\frac{m}{n}.$$",
    "steps": [
      "由独立性得出 $D(Y)=D(Z)=n\\sigma^2$",
      "找出 $Y$ 与 $Z$ 的交集公共项共 $n-m$ 个，求出 $\\mathrm{Cov}(Y,Z)=(n-m)\\sigma^2$",
      "代入相关系数公式得 $\\frac{n-m}{n}$"
    ],
    "keyPoints": [
      "协方差双线性性",
      "求和变量相关系数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "协方差",
      "相关系数",
      "求和随机变量"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-19",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "设随机变量 $X \\sim N(0, 1),\\; Y \\sim N(1, 4)$，且相关系数为 $1$，则（ ）",
    "options": [
      "A. $P\\{Y = -2X - 1\\} = 1$",
      "B. $P\\{Y = 2X - 1\\} = 1$",
      "C. $P\\{Y = -2X + 1\\} = 1$",
      "D. $P\\{Y = 2X + 1\\} = 1$"
    ],
    "correctAnswer": "D",
    "explanation": "因为相关系数 $\\rho_{XY} = 1$，由相关系数性质可知存在常数 $a > 0,\\; b$，使得：\n$$P\\{Y = aX + b\\} = 1.$$\n两边分别取方差与数学期望：\n- $D(Y) = a^2 D(X) \\implies 4 = a^2 \\cdot 1$，结合 $a > 0$ 得 $a = 2$；\n- $E(Y) = aE(X) + b \\implies 1 = 2\\times 0 + b \\implies b = 1$。\n\n故 $P\\{Y = 2X + 1\\} = 1$，选 D。",
    "steps": [
      "由 $\\rho_{XY}=1$ 写出线性关系 $Y=aX+b\\;(a>0)$ 以概率 $1$ 成立",
      "利用 $DY=a^2 DX$ 定出 $a=2$，利用 $EY=aEX+b$ 定出 $b=1$，选 D"
    ],
    "keyPoints": [
      "相关系数为1的充要条件",
      "正线性关系"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2008真题",
      "相关系数",
      "正态分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-20",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "（1）（2001）将一枚硬币重复掷 $n$ 次，以 $X$ 和 $Y$ 分别表示正面朝上和反面朝上的次数，求 $\\rho_{XY}$；（2）（2012）将长度为 $1\\,\\mathrm{m}$ 的木棒随机截成两段，则两段长度的相关系数为多少；（3）（880）设随机变量 $X \\sim U(-1, 1),\\; Y_1 = \\arcsin X,\\; Y_2 = \\arccos X$，求 $\\rho_{Y_1 Y_2}$。",
    "correctAnswer": "（1）$-1$；（2）$-1$；（3）$-1$",
    "explanation": "三道题均利用**“若存在 $a < 0,\\; b$ 使得 $P\\{Y = aX + b\\} = 1$，则相关系数 $\\rho_{XY} = -1$”**的结论秒杀：\n- **（1）** 每次试验不是正面就是反面，故恒有 $X + Y = n \\implies Y = -X + n$（斜率 $a = -1 < 0$），因此 $\\rho_{XY} = -1$。\n- **（2）** 设两段长度分别为 $X, Y$，则恒有 $X + Y = 1 \\implies Y = -X + 1$（斜率 $a = -1 < 0$），因此两段长度的相关系数 $\\rho_{XY} = -1$。\n- **（3）** 对任意 $x \\in (-1, 1)$，恒有反三角恒等式 $\\arcsin x + \\arccos x = \\frac{\\pi}{2}$，故 $Y_1 + Y_2 = \\frac{\\pi}{2} \\implies Y_2 = -Y_1 + \\frac{\\pi}{2}$（斜率 $a = -1 < 0$），因此 $\\rho_{Y_1 Y_2} = -1$。",
    "steps": [
      "分别找出三问中两随机变量满足的负斜率确定性线性关系：$X+Y=n$、$X+Y=1$、$Y_1+Y_2=\\frac{\\pi}{2}$",
      "直接应用 $\\rho = -1$ 的线性相关充要条件得出三问结果均为 $-1$"
    ],
    "keyPoints": [
      "相关系数等于负一的充要条件"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2001真题",
      "2012真题",
      "880题",
      "相关系数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-21",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X \\sim N(0, 1)$，在 $X = x$ 条件下，随机变量 $Y \\sim N(x, 1)$，求 $\\rho_{XY}$。",
    "correctAnswer": "$\\frac{\\sqrt{2}}{2}$",
    "explanation": "**法一（独立分解技巧，极简）：**\n令 $Z = Y - X$。在 $X = x$ 条件下，$Z \\mid X = x \\sim N(0, 1)$，其条件分布与 $x$ 无关，因此 $Z$ 与 $X$ 相互独立，且 $Z \\sim N(0,1)$。\n由此 $Y = X + Z$（其中 $X, Z$ 独立同服从 $N(0,1)$）：\n- $D(X) = 1$；\n- $D(Y) = D(X + Z) = D(X) + D(Z) = 1 + 1 = 2$；\n- $\\mathrm{Cov}(X,Y) = \\mathrm{Cov}(X, X+Z) = D(X) + \\mathrm{Cov}(X,Z) = 1 + 0 = 1$。\n\n故相关系数：\n$$\\rho_{XY} = \\frac{\\mathrm{Cov}(X,Y)}{\\sqrt{D(X)D(Y)}} = \\frac{1}{\\sqrt{1 \\times 2}} = \\frac{\\sqrt{2}}{2}.$$\n\n**法二（条件密度直接积分）：**\n$f(x,y) = f_X(x)f_{Y|X}(y|x) = \\frac{1}{2\\pi}\\exp\\left\\{-\\frac{1}{2}[x^2 + (y-x)^2]\\right\\} = \\frac{1}{2\\pi}\\exp\\left\\{-\\frac{1}{2}(2x^2 - 2xy + y^2)\\right\\}$。\n对照二维正态密度指数系数：$\\frac{1}{2(1-\\rho^2)}\\left(\\frac{x^2}{\\sigma_1^2} - \\frac{2\\rho xy}{\\sigma_1\\sigma_2} + \\frac{y^2}{\\sigma_2^2}\\right)$，结合 $\\sigma_1=1$ 得 $\\frac{1}{1-\\rho^2}=2 \\implies \\rho^2=\\frac{1}{2}$，且正交叉项表明 $\\rho > 0$，故 $\\rho = \\frac{\\sqrt{2}}{2}$。",
    "steps": [
      "令 $Z=Y-X$，发现给定 $X=x$ 时 $Z\\sim N(0,1)$ 与 $x$ 无关，得出 $Z$ 与 $X$ 独立",
      "代入 $Y=X+Z$ 算得 $D(X)=1,\\; D(Y)=2,\\; \\mathrm{Cov}(X,Y)=1$",
      "计算相关系数得 $\\frac{\\sqrt{2}}{2}$"
    ],
    "keyPoints": [
      "条件正态分布",
      "随机变量分解技巧",
      "二维正态相关系数"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2022真题",
      "条件分布",
      "相关系数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "设 $X, Y$ 均服从正态分布，则下列服从正态分布的是（ ）",
    "options": [
      "A. $X + Y$",
      "B. $X - Y$",
      "C. $(X, Y)$",
      "D. $2X + 1$"
    ],
    "correctAnswer": "D",
    "explanation": "题干仅知 $X, Y$ 各自服从一维正态分布（边缘分布为正态），并未说明 $X,Y$ 相互独立，也未说明 $(X,Y)$ 服从二维正态分布。\n因此，$X+Y$、$X-Y$ 未必服从正态分布，$(X,Y)$ 也未必服从二维正态分布（排除 A、B、C）。\n而 $2X+1$ 是单个正态随机变量 $X$ 的非零线性变换，必然服从正态分布，故选 D。",
    "steps": [
      "辨析“边缘正态不等于联合二维正态”及“非独立正态之和未必正态”",
      "确认单变量正态的非零线性变换 $2X+1$ 必服从正态分布，选 D"
    ],
    "keyPoints": [
      "一维正态线性变换",
      "边缘正态与二维正态的区别"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布性质",
      "概念辨析"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-23",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "设 $X, Y$ 均服从正态分布，且它们不相关，则（ ）",
    "options": [
      "A. $X, Y$ 一定相互独立",
      "B. $(X, Y)$ 服从二维正态",
      "C. $X, Y$ 未必相互独立",
      "D. $X + Y$ 服从二维正态"
    ],
    "correctAnswer": "C",
    "explanation": "“不相关等价于独立”的前提是 $(X,Y)$ 服从**二维正态分布**。\n本题仅知 $X,Y$ 各自服从正态分布（且不相关），$(X,Y)$ 未必是二维正态分布（例如令 $X\\sim N(0,1)$，$Y = IX$ 其中 $I$ 独立取 $\\pm 1$ 各半，则 $Y\\sim N(0,1)$ 且 $\\mathrm{Cov}(X,Y)=0$，但 $|X|=|Y|$ 显然不独立）。\n故 $X,Y$ 未必相互独立，选 C。",
    "steps": [
      "检查是否满足二维正态前提：题干仅给出边缘正态分布",
      "指出在非二维正态下不相关不能推出独立，选 C"
    ],
    "keyPoints": [
      "二维正态与不相关的关系",
      "独立与不相关辨析"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布性质",
      "独立与不相关"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-24",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "设两个相互独立的随机变量 $X, Y$ 分别服从正态分布 $N(0, 1)$ 和 $N(2, 3)$，则（ ）",
    "options": [
      "A. $P\\{X + Y \\le 0\\} = \\frac{1}{2}$",
      "B. $P\\{X + Y \\le -2\\} = \\frac{1}{2}$",
      "C. $P\\{X - Y \\le 0\\} = \\frac{1}{2}$",
      "D. $P\\{X - Y \\le -2\\} = \\frac{1}{2}$"
    ],
    "correctAnswer": "D",
    "explanation": "因为 $X \\sim N(0, 1),\\; Y \\sim N(2, 3)$ 且相互独立，由独立正态分布的线性组合性质：\n- $X + Y \\sim N(0 + 2,\\; 1 + 3) = N(2, 4)$，故 $P\\{X + Y \\le 2\\} = \\frac{1}{2}$（A、B 均错）；\n- $X - Y \\sim N(0 - 2,\\; 1 + 3) = N(-2, 4)$，对称中心为均值 $-2$，故 $P\\{X - Y \\le -2\\} = \\frac{1}{2}$（C 错、D 对）。\n\n故选 D。",
    "steps": [
      "由独立正态线性组合得 $X+Y \\sim N(2,4)$ 与 $X-Y \\sim N(-2,4)$",
      "利用正态分布关于均值对称（中位数等于均值）判定 D 正确"
    ],
    "keyPoints": [
      "独立正态线性组合",
      "正态分布对称性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "线性组合",
      "对称性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-25",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设 $(X,Y) \\sim N(1, -2; \\sigma^2, \\sigma^2; 0)$，求 $P\\{XY < 2 - 2X + Y\\}$。",
    "correctAnswer": "$\\frac{1}{2}$",
    "explanation": "对不等式移项因式分解：\n$$XY < 2 - 2X + Y \\iff XY + 2X - Y - 2 < 0 \\iff (X - 1)(Y + 2) < 0.$$\n因为 $(X,Y) \\sim N(1, -2; \\sigma^2, \\sigma^2; 0)$，由二维正态性质（$\\rho=0 \\iff$ 独立），可知 $X \\sim N(1,\\sigma^2),\\; Y \\sim N(-2,\\sigma^2)$ 且相互独立。\n从而 $X - 1 \\sim N(0,\\sigma^2)$ 与 $Y + 2 \\sim N(0,\\sigma^2)$ 相互独立且均关于 $0$ 对称：\n$$\\begin{aligned}\nP\\{(X-1)(Y+2) < 0\\} &= P\\{X-1 > 0,\\; Y+2 < 0\\} + P\\{X-1 < 0,\\; Y+2 > 0\\} \\\\\n&= \\frac{1}{2}\\cdot\\frac{1}{2} + \\frac{1}{2}\\cdot\\frac{1}{2} = \\frac{1}{2}.\n\\end{aligned}$$",
    "steps": [
      "将不等式因式分解为 $(X-1)(Y+2)<0$",
      "由二维正态 $\\rho=0$ 得出 $X-1$ 与 $Y+2$ 独立且均服从 $N(0,\\sigma^2)$",
      "分一正一负两种情况算出概率和为 $\\frac{1}{2}$"
    ],
    "keyPoints": [
      "二维正态不相关即独立",
      "因式分解求概率"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "李永乐6套卷",
      "二维正态",
      "对称性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-26",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "两个相互独立的随机变量 $X, Y$ 均服从正态分布 $N(\\mu, \\sigma^2)$，已知 $E(a|X - Y|) = \\sigma$，求 $a$。",
    "correctAnswer": "$\\frac{\\sqrt{\\pi}}{2}$",
    "explanation": "由于 $X, Y$ 独立同服从 $N(\\mu, \\sigma^2)$（注意分布参数中隐含 $\\sigma > 0$），令 $Z = X - Y$，由独立正态线性组合性质：\n$$Z = X - Y \\sim N(0, 2\\sigma^2).$$\n将其标准化得 $\\frac{Z}{\\sqrt{2}\\sigma} \\sim N(0,1)$。利用结论“若 $U \\sim N(0,1)$，则 $E(|U|) = \\sqrt{\\frac{2}{\\pi}}$”：\n$$E(|X - Y|) = \\sqrt{2}\\sigma\\, E\\left(\\left|\\frac{X - Y}{\\sqrt{2}\\sigma}\\right|\\right) = \\sqrt{2}\\sigma \\cdot \\sqrt{\\frac{2}{\\pi}} = \\frac{2\\sigma}{\\sqrt{\\pi}}.$$\n由 $E(a|X - Y|) = a\\cdot\\frac{2\\sigma}{\\sqrt{\\pi}} = \\sigma$，解得：\n$$a = \\frac{\\sqrt{\\pi}}{2}.$$",
    "steps": [
      "由独立正态线性组合得 $X-Y \\sim N(0, 2\\sigma^2)$",
      "标准化后套用 $E(|U|)=\\sqrt{\\frac{2}{\\pi}}$ 求得 $E(|X-Y|)=\\frac{2\\sigma}{\\sqrt{\\pi}}$",
      "解方程 $a\\cdot\\frac{2\\sigma}{\\sqrt{\\pi}}=\\sigma$ 得 $a=\\frac{\\sqrt{\\pi}}{2}$"
    ],
    "keyPoints": [
      "独立正态线性组合",
      "标准正态绝对值期望公式"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2023真题",
      "正态分布",
      "绝对值期望"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-27",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设两个相互独立的随机变量 $X, Y$ 分别服从正态分布 $N(1, 1)$ 和 $N(-2, 1)$，求 $E(|2X + Y|),\\; D(|2X + Y|)$。",
    "correctAnswer": "$E(|2X + Y|) = \\sqrt{\\frac{10}{\\pi}},\\; D(|2X + Y|) = 5 - \\frac{10}{\\pi}$",
    "explanation": "令 $Z = 2X + Y$。因为 $X \\sim N(1, 1),\\; Y \\sim N(-2, 1)$ 且相互独立，由独立正态线性组合降维：\n$$Z = 2X + Y \\sim N(2\\times 1 + (-2),\\; 2^2\\times 1 + 1^2\\times 1) = N(0, 5).$$\n将其标准化得 $\\frac{Z}{\\sqrt{5}} \\sim N(0,1)$。\n1. **求期望：**\n   $$E(|Z|) = \\sqrt{5}\\,E\\left(\\left|\\frac{Z}{\\sqrt{5}}\\right|\\right) = \\sqrt{5}\\cdot\\sqrt{\\frac{2}{\\pi}} = \\sqrt{\\frac{10}{\\pi}}.$$\n2. **求方差：**\n   由于 $|Z|^2 = Z^2$，且 $E(Z^2) = D(Z) + [E(Z)]^2 = 5 + 0 = 5$，故：\n   $$D(|Z|) = E(|Z|^2) - [E(|Z|)]^2 = 5 - \\frac{10}{\\pi}.$$",
    "steps": [
      "降维确定 $2X+Y \\sim N(0,5)$",
      "标准化并利用 $E(|U|)=\\sqrt{\\frac{2}{\\pi}}$ 算得 $E(|2X+Y|)=\\sqrt{\\frac{10}{\\pi}}$",
      "利用 $E(|Z|^2)=E(Z^2)=5$ 求得 $D(|2X+Y|)=5-\\frac{10}{\\pi}$"
    ],
    "keyPoints": [
      "独立正态降维",
      "绝对值期望与方差"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "绝对值期望",
      "方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-28",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设 $X_1, X_2, \\cdots, X_n\\;(n > 2)$ 为独立同分布的随机变量，且均服从 $N(0, 1)$，记 $\\overline{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i$，$Y_i = X_i - \\overline{X},\\; i = 1, 2, \\cdots, n$。求：（1）$Y_i$ 的方差；（2）$\\mathrm{Cov}(Y_1, Y_n)$；（3）$P\\{Y_1 + Y_n \\le 0\\}$。",
    "correctAnswer": "（1）$\\frac{n - 1}{n}$；（2）$-\\frac{1}{n}$；（3）$\\frac{1}{2}$",
    "explanation": "已知 $X_1, \\cdots, X_n$ 独立同分布于 $N(0,1)$，故 $E(X_i)=0,\\; D(X_i)=1$，$D(\\overline{X}) = \\frac{1}{n}$，且对任意 $i$ 有 $\\mathrm{Cov}(X_i, \\overline{X}) = \\frac{1}{n}D(X_i) = \\frac{1}{n}$。\n\n**（1）求 $D(Y_i)$：**\n$$D(Y_i) = D(X_i - \\overline{X}) = D(X_i) + D(\\overline{X}) - 2\\mathrm{Cov}(X_i, \\overline{X}) = 1 + \\frac{1}{n} - \\frac{2}{n} = \\frac{n - 1}{n}.$$\n（也可把 $Y_i$ 写成 $\\left(1-\\frac{1}{n}\\right)X_i - \\frac{1}{n}\\sum_{j\\ne i} X_j$，直接平方和得 $\\left(1-\\frac{1}{n}\\right)^2 + (n-1)\\frac{1}{n^2} = \\frac{n-1}{n}$。）\n\n**（2）求 $\\mathrm{Cov}(Y_1, Y_n)$：**\n$$\\begin{aligned}\n\\mathrm{Cov}(Y_1, Y_n) &= \\mathrm{Cov}(X_1 - \\overline{X},\\; X_n - \\overline{X}) \\\\\n&= \\mathrm{Cov}(X_1, X_n) - \\mathrm{Cov}(X_1, \\overline{X}) - \\mathrm{Cov}(\\overline{X}, X_n) + D(\\overline{X}) \\\\\n&= 0 - \\frac{1}{n} - \\frac{1}{n} + \\frac{1}{n} = -\\frac{1}{n}.\n\\end{aligned}$$\n\n**（3）求 $P\\{Y_1 + Y_n \\le 0\\}$：**\n$Y_1 + Y_n$ 是独立正态变量 $X_1, \\cdots, X_n$ 的线性组合，故仍服从正态分布。其中：\n- $E(Y_1 + Y_n) = 0$；\n- $D(Y_1 + Y_n) = D(Y_1) + D(Y_n) + 2\\mathrm{Cov}(Y_1, Y_n) = \\frac{2(n-1)}{n} - \\frac{2}{n} = \\frac{2(n-2)}{n} > 0$（因 $n > 2$）。\n\n因此 $Y_1 + Y_n \\sim N\\left(0, \\frac{2(n-2)}{n}\\right)$，由对称性得 $P\\{Y_1 + Y_n \\le 0\\} = \\frac{1}{2}$。",
    "steps": [
      "计算 $D(\\overline{X})=\\frac{1}{n}$ 与 $\\mathrm{Cov}(X_i,\\overline{X})=\\frac{1}{n}$，展开求得 $D(Y_i)=\\frac{n-1}{n}$",
      "用双线性性展开 $\\mathrm{Cov}(X_1-\\overline{X}, X_n-\\overline{X})$ 得 $-\\frac{1}{n}$",
      "说明 $Y_1+Y_n$ 为独立正态变量的线性组合，均值为 $0$（方差 $>0$），故 $P\\{Y_1+Y_n\\le 0\\}=\\frac{1}{2}$"
    ],
    "keyPoints": [
      "样本均值性质",
      "协方差双线性性",
      "独立正态线性组合"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2005真题",
      "协方差",
      "正态分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-29",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "已知随机变量 $(X,Y)$ 服从二维正态分布，且 $X \\sim N(1, 9),\\; Y \\sim N(0, 16),\\; \\rho_{XY} = -\\frac{1}{2}$，设 $Z = \\frac{X}{3} + \\frac{Y}{2}$，（1）求 $E(Z),\\; D(Z)$；（2）求 $\\rho_{XZ}$；（3）$X, Z$ 是否独立。",
    "correctAnswer": "（1）$E(Z) = \\frac{1}{3},\\; D(Z) = 3$；（2）$\\rho_{XZ} = 0$；（3）$X$ 与 $Z$ 相互独立",
    "explanation": "已知 $E(X)=1,\\; D(X)=9\\;(\\sigma_1=3)$，$E(Y)=0,\\; D(Y)=16\\;(\\sigma_2=4)$，$\\mathrm{Cov}(X,Y) = \\rho_{XY}\\sigma_1\\sigma_2 = -\\frac{1}{2}\\times 3\\times 4 = -6$。\n\n**（1）求 $E(Z),\\; D(Z)$：**\n$$E(Z) = \\frac{1}{3}E(X) + \\frac{1}{2}E(Y) = \\frac{1}{3}\\times 1 + \\frac{1}{2}\\times 0 = \\frac{1}{3}.$$\n$$D(Z) = \\frac{1}{9}D(X) + \\frac{1}{4}D(Y) + 2\\cdot\\frac{1}{3}\\cdot\\frac{1}{2}\\mathrm{Cov}(X,Y) = \\frac{9}{9} + \\frac{16}{4} + \\frac{1}{3}(-6) = 1 + 4 - 2 = 3.$$\n\n**（2）求 $\\rho_{XZ}$：**\n$$\\mathrm{Cov}(X, Z) = \\mathrm{Cov}\\left(X,\\; \\frac{X}{3} + \\frac{Y}{2}\\right) = \\frac{1}{3}D(X) + \\frac{1}{2}\\mathrm{Cov}(X,Y) = \\frac{9}{3} + \\frac{-6}{2} = 3 - 3 = 0.$$\n故 $\\rho_{XZ} = \\dfrac{\\mathrm{Cov}(X,Z)}{\\sqrt{D(X)D(Z)}} = 0$。\n\n**（3）判断 $X, Z$ 是否独立：**\n由于 $\\begin{pmatrix} X \\\\ Z \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ \\frac{1}{3} & \\frac{1}{2} \\end{pmatrix}\\begin{pmatrix} X \\\\ Y \\end{pmatrix}$，系数矩阵行列式 $\\begin{vmatrix} 1 & 0 \\\\ \\frac{1}{3} & \\frac{1}{2} \\end{vmatrix} = \\frac{1}{2} \\ne 0$，故 $(X,Z)$ 也服从二维正态分布。\n在二维正态分布下，不相关（$\\rho_{XZ}=0$）等价于独立，所以 **$X$ 与 $Z$ 相互独立**。",
    "steps": [
      "由边缘分布与相关系数算出 $\\mathrm{Cov}(X,Y)=-6$，进而求得 $E(Z)=\\frac{1}{3},\\; D(Z)=3$",
      "计算 $\\mathrm{Cov}(X,Z)=0$ 得出 $\\rho_{XZ}=0$",
      "利用可逆线性变换保二维正态性说明 $(X,Z)$ 服从二维正态，由 $\\rho_{XZ}=0$ 判定独立"
    ],
    "keyPoints": [
      "二维正态线性变换",
      "二维正态独立与不相关等价"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1994真题",
      "二维正态",
      "线性变换"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-30",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设 $X_1, X_2$ 为来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，$(X_1 + X_2)^2$ 与 $(X_1 - X_2)^2$ 是否独立？",
    "correctAnswer": "相互独立",
    "explanation": "**$(X_1 + X_2)^2$ 与 $(X_1 - X_2)^2$ 相互独立。**\n证明如下：\n1. 因为 $X_1, X_2$ 独立同服从 $N(\\mu,\\sigma^2)$，所以 $(X_1, X_2)$ 服从二维正态分布。\n2. 令 $U = X_1 + X_2,\\; V = X_1 - X_2$，其变换矩阵 $\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$ 的行列式为 $-2 \\ne 0$，故 $(U, V)$ 也服从二维正态分布。\n3. 计算协方差：\n   $$\\mathrm{Cov}(U, V) = \\mathrm{Cov}(X_1 + X_2,\\; X_1 - X_2) = D(X_1) - D(X_2) = \\sigma^2 - \\sigma^2 = 0.$$\n   因为 $(U,V)$ 为二维正态且不相关，所以 $U$ 与 $V$ 相互独立。\n4. 由于 $g(u) = u^2,\\; h(v) = v^2$ 均为连续函数，故 $(X_1+X_2)^2 = U^2$ 与 $(X_1-X_2)^2 = V^2$ 也相互独立。",
    "steps": [
      "由 $X_1,X_2$ 独立正态得 $(X_1,X_2)$ 为二维正态，经可逆线性变换后 $(X_1+X_2, X_1-X_2)$ 仍为二维正态",
      "计算协方差为 $0$，利用二维正态不相关即独立得出 $X_1+X_2$ 与 $X_1-X_2$ 独立",
      "由独立变量的连续函数仍独立，得出其平方 $(X_1+X_2)^2$ 与 $(X_1-X_2)^2$ 相互独立"
    ],
    "keyPoints": [
      "二维正态可逆变换",
      "独立随机变量函数的独立性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "二维正态",
      "样本独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-31",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设在区间 $[0, 1]$ 上任取 $n$ 个点，求距离最远的两个点之间的距离的期望。",
    "correctAnswer": "$\\frac{n - 1}{n + 1}$",
    "explanation": "设所取 $n$ 个点的坐标为 $X_1, X_2, \\cdots, X_n$，则它们独立同分布于 $U(0,1)$，共同分布函数在 $[0,1]$ 上为 $F(x) = x$。\n最远两点距离即极差 $R = V - U$，其中 $V = \\max\\{X_1, \\cdots, X_n\\},\\; U = \\min\\{X_1, \\cdots, X_n\\}$。\n1. **求 $V$ 的分布与期望：**\n   $F_V(v) = [F(v)]^n = v^n\\;(0 \\le v \\le 1)$，密度为 $f_V(v) = nv^{n-1}\\;(0 < v < 1)$，故：\n   $$E(V) = \\int_0^1 v \\cdot nv^{n-1}\\,\\mathrm{d}v = \\frac{n}{n + 1}.$$\n2. **求 $U$ 的分布与期望：**\n   $F_U(u) = 1 - [1 - F(u)]^n = 1 - (1 - u)^n\\;(0 \\le u \\le 1)$，密度为 $f_U(u) = n(1 - u)^{n-1}\\;(0 < u < 1)$，故：\n   $$E(U) = \\int_0^1 u \\cdot n(1 - u)^{n-1}\\,\\mathrm{d}u = \\int_0^1 (1 - t)\\cdot n t^{n-1}\\,\\mathrm{d}t = 1 - \\frac{n}{n+1} = \\frac{1}{n + 1}.$$\n3. **最远距离的期望：**\n   $$E(R) = E(V - U) = E(V) - E(U) = \\frac{n}{n + 1} - \\frac{1}{n + 1} = \\frac{n - 1}{n + 1}.$$",
    "steps": [
      "将问题建模为 $n$ 个独立同分布 $U(0,1)$ 变量的极差期望 $E(\\max-\\min)$",
      "分别求出最大值 $V$ 和最小值 $U$ 的分布函数与密度，积分算出 $E(V)=\\frac{n}{n+1},\\; E(U)=\\frac{1}{n+1}$",
      "作差得到 $\\frac{n-1}{n+1}$"
    ],
    "keyPoints": [
      "高维最值函数分布",
      "最值期望",
      "均匀分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "超越",
      "最值期望",
      "次序统计量"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-32",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "在长为 $2$ 的线段上任取两点 $X, Y$，记 $U = \\max\\{X, Y\\},\\; V = \\min\\{X, Y\\}$，求 $E(U + V),\\; E(U - V),\\; E[(U - 1)(V - 1)]$。",
    "correctAnswer": "$E(U + V) = 2,\\; E(U - V) = \\frac{2}{3},\\; E[(U - 1)(V - 1)] = 0$",
    "explanation": "设线段区间为 $[0,2]$，则 $X, Y$ 独立同分布于 $U(0,2)$，故 $E(X) = E(Y) = 1$，联合密度 $f(x,y)=\\frac{1}{4}\\;(0<x,y<2)$。利用最值代数性质：\n1. **求 $E(U + V)$：**\n   因为 $U + V = X + Y$，所以：\n   $$E(U + V) = E(X + Y) = 1 + 1 = 2.$$\n2. **求 $E(U - V)$：**\n   因为 $U - V = |X - Y|$，由二重积分（或直接用区间 $[0,2]$ 上 $E(\\max\\{X,Y\\}) = 2\\cdot\\frac{2}{3} = \\frac{4}{3},\\; E(\\min\\{X,Y\\}) = 2\\cdot\\frac{1}{3} = \\frac{2}{3}$）：\n   $$E(U - V) = E(|X - Y|) = \\int_0^2 \\mathrm{d}x \\int_0^2 \\frac{1}{4}|x - y|\\,\\mathrm{d}y = 2\\int_0^2 \\mathrm{d}x \\int_0^x \\frac{x - y}{4}\\,\\mathrm{d}y = \\frac{1}{4}\\int_0^2 x^2\\,\\mathrm{d}x = \\frac{8}{12} = \\frac{2}{3}.$$\n3. **求 $E[(U - 1)(V - 1)]$：**\n   利用 $U+V=X+Y$ 与 $UV=XY$，恒有 $(U-1)(V-1) = UV - (U+V) + 1 = XY - (X+Y) + 1 = (X-1)(Y-1)$！\n   因 $X, Y$ 相互独立且 $E(X-1) = E(Y-1) = 0$，故：\n   $$E[(U - 1)(V - 1)] = E[(X - 1)(Y - 1)] = E(X - 1)E(Y - 1) = 0.$$",
    "steps": [
      "利用 $U+V=X+Y$ 秒得 $E(U+V)=2$",
      "利用 $U-V=|X-Y|$（或均匀最值期望）求得 $E(U-V)=\\frac{2}{3}$",
      "利用 $UV=XY$ 与 $U+V=X+Y$ 恒等替换 $(U-1)(V-1)=(X-1)(Y-1)$，由独立性得 $0$"
    ],
    "keyPoints": [
      "最值代数恒等式",
      "独立性",
      "均匀分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "最值性质",
      "期望计算"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-33",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "设随机变量 $X, Y$ 独立同分布于参数为 $1$ 的指数分布，令 $Z = \\max\\{X, Y\\},\\; W = \\min\\{X, Y\\}$，求 $\\rho_{ZW}$。",
    "correctAnswer": "$\\frac{\\sqrt{5}}{5}$",
    "explanation": "因为 $X, Y$ 独立同服从 $E(1)$，故 $E(X)=E(Y)=1,\\; D(X)=D(Y)=1,\\; E(X^2)=E(Y^2)=2$。\n利用指数最小值结论及最值代数恒等式 $Z + W = X + Y,\\; ZW = XY$：\n1. **最小值 $W$ 的数字特征：**\n   由独立指数最小值结论，$W = \\min\\{X,Y\\} \\sim E(1+1) = E(2)$，故：\n   $$E(W) = \\frac{1}{2}, \\qquad D(W) = \\frac{1}{4}, \\qquad E(W^2) = \\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}.$$\n2. **最大值 $Z$ 的数字特征：**\n   - $E(Z) = E(X + Y - W) = 1 + 1 - \\frac{1}{2} = \\frac{3}{2}$；\n   - 由于 $Z^2 + W^2 = X^2 + Y^2$，得 $E(Z^2) = E(X^2) + E(Y^2) - E(W^2) = 2 + 2 - \\frac{1}{2} = \\frac{7}{2}$；\n   - $D(Z) = E(Z^2) - [E(Z)]^2 = \\frac{7}{2} - \\frac{9}{4} = \\frac{5}{4}$。\n3. **协方差与相关系数：**\n   $$\\mathrm{Cov}(Z, W) = E(ZW) - E(Z)E(W) = E(XY) - E(Z)E(W) = 1\\times 1 - \\frac{3}{2}\\times\\frac{1}{2} = \\frac{1}{4}.$$\n   $$\\rho_{ZW} = \\frac{\\mathrm{Cov}(Z, W)}{\\sqrt{D(Z)D(W)}} = \\frac{1/4}{\\sqrt{\\frac{5}{4}\\cdot\\frac{1}{4}}} = \\frac{1}{\\sqrt{5}} = \\frac{\\sqrt{5}}{5}.$$",
    "steps": [
      "利用 $W=\\min\\{X,Y\\}\\sim E(2)$ 写出 $E(W)=\\frac{1}{2},\\; D(W)=\\frac{1}{4},\\; E(W^2)=\\frac{1}{2}$",
      "利用 $Z+W=X+Y$ 与 $Z^2+W^2=X^2+Y^2$ 算出 $E(Z)=\\frac{3}{2}$ 与 $D(Z)=\\frac{5}{4}$",
      "利用 $ZW=XY$ 算出 $\\mathrm{Cov}(Z,W)=\\frac{1}{4}$，代入相关系数公式得 $\\frac{\\sqrt{5}}{5}$"
    ],
    "keyPoints": [
      "指数分布最小值性质",
      "最值代数恒等式",
      "相关系数"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "张八",
      "最值数字特征",
      "指数分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-4-34",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "随机变量的数字特征",
    "type": "analysis",
    "question": "两个相互独立的随机变量 $X, Y$ 均服从正态分布 $N(\\mu, \\sigma^2)$，求 $\\max\\{X, Y\\},\\; \\min\\{X, Y\\}$ 的期望。",
    "correctAnswer": "$E(\\max\\{X,Y\\}) = \\mu + \\frac{\\sigma}{\\sqrt{\\pi}},\\; E(\\min\\{X,Y\\}) = \\mu - \\frac{\\sigma}{\\sqrt{\\pi}}$",
    "explanation": "利用最值与绝对值的代数关系：\n$$\\max\\{X, Y\\} = \\frac{1}{2}\\left(X + Y + |X - Y|\\right), \\qquad \\min\\{X, Y\\} = \\frac{1}{2}\\left(X + Y - |X - Y|\\right).$$\n因为 $X, Y$ 独立同分布于 $N(\\mu, \\sigma^2)$（$\\sigma > 0$），所以 $X - Y \\sim N(0, 2\\sigma^2)$，从而 $\\frac{X-Y}{\\sqrt{2}\\sigma} \\sim N(0,1)$。\n由标准正态绝对值期望公式得：\n$$E(|X - Y|) = \\sqrt{2}\\sigma\\, E\\left(\\left|\\frac{X - Y}{\\sqrt{2}\\sigma}\\right|\\right) = \\sqrt{2}\\sigma \\cdot \\sqrt{\\frac{2}{\\pi}} = \\frac{2\\sigma}{\\sqrt{\\pi}}.$$\n又 $E(X + Y) = 2\\mu$，代入即得：\n$$E(\\max\\{X, Y\\}) = \\frac{1}{2}\\left(2\\mu + \\frac{2\\sigma}{\\sqrt{\\pi}}\\right) = \\mu + \\frac{\\sigma}{\\sqrt{\\pi}},$$\n$$E(\\min\\{X, Y\\}) = \\frac{1}{2}\\left(2\\mu - \\frac{2\\sigma}{\\sqrt{\\pi}}\\right) = \\mu - \\frac{\\sigma}{\\sqrt{\\pi}}.$$",
    "steps": [
      "将 $\\max\\{X,Y\\}$ 和 $\\min\\{X,Y\\}$ 改写为 $\\frac{1}{2}(X+Y\\pm |X-Y|)$",
      "求出 $E(|X-Y|)=\\frac{2\\sigma}{\\sqrt{\\pi}}$",
      "代入期望线性公式求得 $\\mu \\pm \\frac{\\sigma}{\\sqrt{\\pi}}$"
    ],
    "keyPoints": [
      "最值代数恒等式",
      "正态分布绝对值期望"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "最值期望"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "blank",
    "question": "设随机变量 $X$ 的数学期望 $E(X) = 11$，方差 $D(X) = 9$，则根据切比雪夫不等式估计 $P\\{2 < X < 20\\} \\ge$ ______。",
    "correctAnswer": "$\\frac{8}{9}$",
    "explanation": "由已知 $E(X) = 11$，$D(X) = 9$，将事件 $\\{2 < X < 20\\}$ 化为以期望 $11$ 为中心的对称区间：\n$$\\{2 < X < 20\\} = \\{-9 < X - 11 < 9\\} = \\{|X - 11| < 9\\}.$$\n根据切比雪夫不等式，对任意 $\\varepsilon > 0$，有\n$$P\\{|X - E(X)| < \\varepsilon\\} \\ge 1 - \\frac{D(X)}{\\varepsilon^2}.$$\n取 $\\varepsilon = 9$，代入得：\n$$P\\{2 < X < 20\\} = P\\{|X - 11| < 9\\} \\ge 1 - \\frac{9}{9^2} = 1 - \\frac{1}{9} = \\frac{8}{9}.$$",
    "steps": [
      "将不等式 $2 < X < 20$ 两边同时减去期望 $11$，转化为 $|X - 11| < 9$",
      "套用切比雪夫不等式 $P\\{|X - E(X)| < \\varepsilon\\} \\ge 1 - \\frac{D(X)}{\\varepsilon^2}$，取 $\\varepsilon = 9$ 计算得 $\\frac{8}{9}$"
    ],
    "keyPoints": [
      "切比雪夫不等式",
      "区间中心化变形"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "切比雪夫不等式",
      "概率下界估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "blank",
    "question": "设随机变量 $X_1, X_2, \\cdots, X_n$ 独立同分布，且 $X_1$ 的四阶矩存在，记 $\\mu_k = E(X_1^k)\\ (k = 1, 2, 3, 4)$，则由切比雪夫不等式，对任意的 $\\varepsilon > 0$ 有 $P\\left\\{\\left|\\frac{1}{n}\\sum_{i=1}^n X_i^2 - \\mu_2\\right| \\ge \\varepsilon\\right\\} \\le$ ______。",
    "correctAnswer": "$\\frac{\\mu_4 - \\mu_2^2}{n\\varepsilon^2}$",
    "explanation": "令随机变量 $Y = \\frac{1}{n}\\sum_{i=1}^n X_i^2$。因为 $X_1, X_2, \\cdots, X_n$ 独立同分布，且四阶矩存在，所以 $X_1^2, X_2^2, \\cdots, X_n^2$ 也独立同分布，且期望与方差分别为：\n$$E(X_i^2) = E(X_1^2) = \\mu_2,$$\n$$D(X_i^2) = E\\left[(X_i^2)^2\\right] - \\left[E(X_i^2)\\right]^2 = E(X_1^4) - \\mu_2^2 = \\mu_4 - \\mu_2^2.$$\n由此求得 $Y$ 的数学期望与方差：\n$$E(Y) = \\frac{1}{n}\\sum_{i=1}^n E(X_i^2) = \\mu_2,$$\n$$D(Y) = \\frac{1}{n^2}\\sum_{i=1}^n D(X_i^2) = \\frac{n(\\mu_4 - \\mu_2^2)}{n^2} = \\frac{\\mu_4 - \\mu_2^2}{n}.$$\n由切比雪夫不等式，对任意 $\\varepsilon > 0$，有：\n$$P\\left\\{\\left|\\frac{1}{n}\\sum_{i=1}^n X_i^2 - \\mu_2\\right| \\ge \\varepsilon\\right\\} = P\\{|Y - E(Y)| \\ge \\varepsilon\\} \\le \\frac{D(Y)}{\\varepsilon^2} = \\frac{\\mu_4 - \\mu_2^2}{n\\varepsilon^2}.$$",
    "steps": [
      "设 $Y = \\frac{1}{n}\\sum_{i=1}^n X_i^2$，计算 $E(X_i^2) = \\mu_2$ 与 $D(X_i^2) = \\mu_4 - \\mu_2^2$",
      "利用独立性求得 $E(Y) = \\mu_2$ 和 $D(Y) = \\frac{\\mu_4 - \\mu_2^2}{n}$",
      "代入切比雪夫不等式 $P\\{|Y - E(Y)| \\ge \\varepsilon\\} \\le \\frac{D(Y)}{\\varepsilon^2}$ 得到 $\\frac{\\mu_4 - \\mu_2^2}{n\\varepsilon^2}$"
    ],
    "keyPoints": [
      "切比雪夫不等式",
      "样本二阶原点矩的期望与方差",
      "高阶矩与方差关系"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2022真题",
      "切比雪夫不等式",
      "样本矩"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "blank",
    "question": "设随机变量 $X_1, X_2, \\cdots, X_n$ 相互独立同服从参数为 $2$ 的指数分布，则当 $n \\to \\infty$ 时，$Y_n = \\frac{1}{n}\\sum_{i=1}^n X_i^2$ 依概率收敛于 ______。",
    "correctAnswer": "$\\frac{1}{2}$",
    "explanation": "由题意，$X_i$ 服从参数为 $2$ 的指数分布（概率密度为 $f(x) = 2e^{-2x},\\; x > 0$），故：\n$$E(X_i) = \\frac{1}{2}, \\qquad D(X_i) = \\frac{1}{2^2} = \\frac{1}{4}.$$\n因此，$X_i^2$ 的数学期望为：\n$$E(X_i^2) = D(X_i) + \\left[E(X_i)\\right]^2 = \\frac{1}{4} + \\left(\\frac{1}{2}\\right)^2 = \\frac{1}{2}.$$\n因为 $X_1, X_2, \\cdots, X_n$ 相互独立同分布，所以 $X_1^2, X_2^2, \\cdots, X_n^2$ 亦相互独立同分布，且期望 $E(X_1^2) = \\frac{1}{2}$ 存在。由辛钦大数定律，当 $n \\to \\infty$ 时：\n$$Y_n = \\frac{1}{n}\\sum_{i=1}^n X_i^2 \\xrightarrow{P} E(X_1^2) = \\frac{1}{2}.$$",
    "steps": [
      "由参数为 $2$ 的指数分布得 $E(X_i) = \\frac{1}{2}$，$D(X_i) = \\frac{1}{4}$",
      "利用 $E(X_i^2) = D(X_i) + [E(X_i)]^2$ 算得 $E(X_i^2) = \\frac{1}{2}$",
      "对独立同分布序列 $\\{X_i^2\\}$ 应用辛钦大数定律，得依概率收敛于 $\\frac{1}{2}$"
    ],
    "keyPoints": [
      "辛钦大数定律",
      "指数分布数字特征",
      "依概率收敛"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "辛钦大数定律",
      "指数分布",
      "依概率收敛"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "choice",
    "question": "设随机变量 $X_1, X_2, \\cdots, X_n, \\cdots$ 相互独立，它们满足大数定律，则 $X_i$ 的分布可以是（ ）",
    "options": [
      "A. $P\\{X_i = m\\} = \\frac{c}{m^3},\\; m = 1, 2, \\cdots$",
      "B. $X_i$ 服从参数为 $\\frac{1}{i}$ 的指数分布",
      "C. $X_i$ 服从参数为 $i$ 的泊松分布",
      "D. $X_i$ 的密度函数 $f(x) = \\frac{1}{\\pi(1 + x^2)}$"
    ],
    "correctAnswer": "A",
    "explanation": "逐项检验大数定律的成立条件：\n- **选项 A**：$X_i$ 相互独立且同分布，其数学期望为\n  $$E(X_i) = \\sum_{m=1}^{\\infty} m \\cdot \\frac{c}{m^3} = c\\sum_{m=1}^{\\infty} \\frac{1}{m^2} = \\frac{c\\pi^2}{6} < +\\infty.$$\n  尽管其方差不存在（$\\sum_{m=1}^{\\infty} m^2 \\cdot \\frac{c}{m^3} = c\\sum_{m=1}^{\\infty} \\frac{1}{m} = +\\infty$），但独立、同分布且期望存在已满足**辛钦大数定律**的条件，故它们满足大数定律，**A 正确**。\n- **选项 B**：$X_i \\sim E\\left(\\frac{1}{i}\\right)$，不同分布，且 $D(X_i) = i^2$，此时 $\\frac{1}{n^2}\\sum_{i=1}^n D(X_i) = \\frac{n(n+1)(2n+1)}{6n^2} \\to +\\infty$，方差不收敛且不满足大数定律。\n- **选项 C**：$X_i \\sim P(i)$，不同分布，且 $D(X_i) = i$，此时 $\\sum_{i=1}^n X_i \\sim P\\left(\\frac{n(n+1)}{2}\\right)$，均值中心化后方差为 $D\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n^2}\\cdot\\frac{n(n+1)}{2} \\to \\frac{1}{2} \\ne 0$，由中心极限定理知其依分布收敛于 $N\\left(0, \\frac{1}{2}\\right)$ 而非依概率收敛于 $0$，故不满足大数定律。\n- **选项 D**：$X_i$ 服从标准柯西分布，由于 $\\int_{-\\infty}^{+\\infty} \\frac{|x|}{\\pi(1+x^2)}\\,\\mathrm{d}x = +\\infty$，期望不存在，且 $\\frac{1}{n}\\sum_{i=1}^n X_i$ 仍服从标准柯西分布，不满足大数定律。\n\n综上，故选 A。",
    "steps": [
      "核查选项 A：独立同分布且 $E(X_i) = c\\sum \\frac{1}{m^2} < +\\infty$，满足辛钦大数定律",
      "排除选项 B、C：不同分布且 $\\frac{1}{n^2}\\sum_{i=1}^n D(X_i)$ 分别趋于 $+\\infty$ 和 $\\frac{1}{2} \\ne 0$",
      "排除选项 D：柯西分布数学期望不存在，不满足大数定律"
    ],
    "keyPoints": [
      "辛钦大数定律条件",
      "切比雪夫大数定律条件",
      "柯西分布期望不存在"
    ],
    "difficulty": "提高",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "大数定律条件辨析",
      "辛钦大数定律",
      "柯西分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "choice",
    "question": "设随机变量 $(X_1, X_2, \\cdots, X_n)$ 相互独立，$S_n = X_1 + X_2 + \\cdots + X_n$，则根据列维-林德伯格中心极限定理，当 $n$ 充分大时，$S_n$ 近似服从正态分布，只要 $(X_1, X_2, \\cdots, X_n)$ （ ）。",
    "options": [
      "A. 有相同的数学期望",
      "B. 有相同的方差",
      "C. 服从同一指数分布",
      "D. 服从同一离散分布"
    ],
    "correctAnswer": "C",
    "explanation": "列维-林德伯格中心极限定理的条件为：随机变量序列 $X_1, X_2, \\cdots, X_n, \\cdots$ **相互独立、同分布**，且数学期望 $E(X_i) = \\mu$ 与方差 $D(X_i) = \\sigma^2 > 0$ **均存在**。\n- **A、B 项**：仅有相同的数学期望或相同的方差，不能保证同分布，也不能保证期望与方差同时存在且非零；\n- **C 项**：服从同一指数分布 $E(\\lambda)\\ (\\lambda > 0)$，不仅保证了同分布，而且必有有限期望 $\\frac{1}{\\lambda}$ 和有限非零方差 $\\frac{1}{\\lambda^2} > 0$，完全满足列维-林德伯格中心极限定理的条件；\n- **D 项**：服从同一离散分布未必存在有限的期望和方差（例如 $P\\{X_i = m\\} = \\frac{c}{m^2}$ 期望不存在，或 $P\\{X_i = m\\} = \\frac{c}{m^3}$ 方差不存在，或退化分布方差为 $0$），故不一定适用该定理。\n\n因此，故选 C。",
    "steps": [
      "回顾列维-林德伯格中心极限定理的三大条件：独立、同分布、期望和正方差均存在",
      "排除未保证同分布的 A、B，排除方差未必存在的 D，选定 C"
    ],
    "keyPoints": [
      "列维-林德伯格中心极限定理条件",
      "指数分布数字特征存在性"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "中心极限定理",
      "概念辨析",
      "指数分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "choice",
    "question": "设 $X_1, X_2, \\cdots, X_n, \\cdots$ 为独立同分布的随机变量序列，且均服从参数为 $\\lambda\\ (\\lambda > 1)$ 的指数分布，记 $\\Phi(x)$ 为标准正态分布函数，则有（ ）。",
    "options": [
      "A. $\\lim_{n\\to\\infty} P\\left\\{\\frac{\\sum_{i=1}^n X_i - n\\lambda}{\\lambda\\sqrt{n}} \\le x\\right\\} = \\Phi(x)$",
      "B. $\\lim_{n\\to\\infty} P\\left\\{\\frac{\\sum_{i=1}^n X_i - n\\lambda}{\\sqrt{n\\lambda}} \\le x\\right\\} = \\Phi(x)$",
      "C. $\\lim_{n\\to\\infty} P\\left\\{\\frac{\\lambda\\sum_{i=1}^n X_i - n}{\\sqrt{n}} \\le x\\right\\} = \\Phi(x)$",
      "D. $\\lim_{n\\to\\infty} P\\left\\{\\frac{\\sum_{i=1}^n X_i - \\lambda}{\\sqrt{n\\lambda}} \\le x\\right\\} = \\Phi(x)$"
    ],
    "correctAnswer": "C",
    "explanation": "由题意，$X_i$ 服从参数为 $\\lambda$ 的指数分布，其数学期望和方差分别为：\n$$\\mu = E(X_i) = \\frac{1}{\\lambda}, \\qquad \\sigma^2 = D(X_i) = \\frac{1}{\\lambda^2} > 0 \\implies \\sigma = \\frac{1}{\\lambda}.$$\n根据列维-林德伯格中心极限定理，对任意实数 $x$，有：\n$$\\lim_{n\\to\\infty} P\\left\\{\\frac{\\sum_{i=1}^n X_i - n\\mu}{\\sigma\\sqrt{n}} \\le x\\right\\} = \\Phi(x).$$\n将 $\\mu = \\frac{1}{\\lambda}$ 和 $\\sigma = \\frac{1}{\\lambda}$ 代入标准化表达式：\n$$\\frac{\\sum_{i=1}^n X_i - n \\cdot \\frac{1}{\\lambda}}{\\frac{1}{\\lambda}\\sqrt{n}} = \\frac{\\lambda\\sum_{i=1}^n X_i - n}{\\sqrt{n}}.$$\n因此：\n$$\\lim_{n\\to\\infty} P\\left\\{\\frac{\\lambda\\sum_{i=1}^n X_i - n}{\\sqrt{n}} \\le x\\right\\} = \\Phi(x).$$\n故选 C。",
    "steps": [
      "写出参数为 $\\lambda$ 的指数分布期望 $\\mu = \\frac{1}{\\lambda}$ 与标准差 $\\sigma = \\frac{1}{\\lambda}$",
      "代入列维-林德伯格中心极限定理标准化公式并化简分子分母，匹配选项 C"
    ],
    "keyPoints": [
      "列维-林德伯格中心极限定理",
      "指数分布均值与标准差"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "中心极限定理",
      "指数分布",
      "标准化"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设总体 $X \\sim B(m, \\theta)$，$X_1, X_2, \\cdots, X_n$ 是来自该总体的简单随机样本，$\\overline{X}$ 为样本均值，求 $E\\left[\\sum_{i=1}^n (X_i - \\overline{X})^2\\right]$。",
    "correctAnswer": "$(n - 1)m\\theta(1 - \\theta)$",
    "explanation": "**方法一（利用样本方差的无偏性）：**\n因为样本方差 $S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\overline{X})^2$ 满足 $E(S^2) = D(X)$，且总体 $X \\sim B(m, \\theta)$ 的方差为 $D(X) = m\\theta(1 - \\theta)$，所以：\n$$E\\left[\\sum_{i=1}^n (X_i - \\overline{X})^2\\right] = (n - 1)E(S^2) = (n - 1)D(X) = (n - 1)m\\theta(1 - \\theta).$$\n\n**方法二（直接展开计算）：**\n利用代数恒等式 $\\sum_{i=1}^n (X_i - \\overline{X})^2 = \\sum_{i=1}^n X_i^2 - n\\overline{X}^2$，注意到 $E(X_i) = m\\theta$，$D(X_i) = m\\theta(1 - \\theta)$，$E(\\overline{X}) = m\\theta$，$D(\\overline{X}) = \\frac{m\\theta(1 - \\theta)}{n}$，于是：\n$$E(X_i^2) = D(X_i) + \\left[E(X_i)\\right]^2 = m\\theta(1 - \\theta) + m^2\\theta^2,$$\n$$E(\\overline{X}^2) = D(\\overline{X}) + \\left[E(\\overline{X})\\right]^2 = \\frac{m\\theta(1 - \\theta)}{n} + m^2\\theta^2.$$\n因此：\n$$E\\left[\\sum_{i=1}^n (X_i - \\overline{X})^2\\right] = n E(X_1^2) - n E(\\overline{X}^2) = n\\left[m\\theta(1 - \\theta) + m^2\\theta^2\\right] - n\\left[\\frac{m\\theta(1 - \\theta)}{n} + m^2\\theta^2\\right] = (n - 1)m\\theta(1 - \\theta).$$",
    "steps": [
      "辨识出 $\\sum_{i=1}^n (X_i - \\overline{X})^2 = (n - 1)S^2$",
      "利用样本方差性质 $E(S^2) = D(X)$ 及二项分布方差公式 $D(X) = m\\theta(1 - \\theta)$ 得 $(n - 1)m\\theta(1 - \\theta)$"
    ],
    "keyPoints": [
      "样本方差的期望",
      "二项分布方差公式"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2015真题",
      "样本方差",
      "二项分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设总体 $X \\sim N(\\mu, \\sigma^2)\\ (\\sigma > 0)$，从该总体中抽出简单随机样本 $X_1, X_2, \\cdots, X_{2n}\\ (n \\ge 2)$，其样本均值为 $\\overline{X} = \\frac{1}{2n}\\sum_{i=1}^{2n} X_i$，求统计量 $Y = \\sum_{i=1}^n (X_i + X_{n+i} - 2\\overline{X})^2$ 的期望。",
    "correctAnswer": "$2(n - 1)\\sigma^2$",
    "explanation": "令 $Z_i = X_i + X_{n+i}\\ (i = 1, 2, \\cdots, n)$。由于 $X_1, X_2, \\cdots, X_{2n}$ 是来自 $N(\\mu, \\sigma^2)$ 的简单随机样本，故 $Z_1, Z_2, \\cdots, Z_n$ 相互独立同分布，且：\n$$Z_i = X_i + X_{n+i} \\sim N(2\\mu, 2\\sigma^2).$$\n记样本 $Z_1, Z_2, \\cdots, Z_n$ 的样本均值为 $\\overline{Z}$，则：\n$$\\overline{Z} = \\frac{1}{n}\\sum_{i=1}^n Z_i = \\frac{1}{n}\\sum_{i=1}^n (X_i + X_{n+i}) = \\frac{1}{n}\\sum_{k=1}^{2n} X_k = 2\\overline{X}.$$\n将 $Z_i$ 与 $\\overline{Z} = 2\\overline{X}$ 代入统计量 $Y$，得：\n$$Y = \\sum_{i=1}^n (Z_i - \\overline{Z})^2 = (n - 1)S_Z^2,$$\n其中 $S_Z^2 = \\frac{1}{n-1}\\sum_{i=1}^n (Z_i - \\overline{Z})^2$ 为样本 $Z_1, \\cdots, Z_n$ 的样本方差。\n由样本方差的无偏性 $E(S_Z^2) = D(Z_i) = 2\\sigma^2$，得：\n$$E(Y) = (n - 1)E(S_Z^2) = (n - 1) \\cdot 2\\sigma^2 = 2(n - 1)\\sigma^2.$$",
    "steps": [
      "令 $Z_i = X_i + X_{n+i}$，确定 $Z_1, \\cdots, Z_n$ 独立同分布于 $N(2\\mu, 2\\sigma^2)$",
      "发现 $\\overline{Z} = 2\\overline{X}$，从而将 $Y$ 化为 $(n - 1)S_Z^2$",
      "利用 $E(S_Z^2) = D(Z_i) = 2\\sigma^2$ 求得 $E(Y) = 2(n - 1)\\sigma^2$"
    ],
    "keyPoints": [
      "变量重组与样本方差结构构造",
      "样本方差期望公式",
      "正态分布独立和分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2001真题",
      "统计量期望",
      "样本方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "设 $X_1, X_2, X_3, X_4$ 为来自总体 $N(1, \\sigma^2)\\ (\\sigma > 0)$ 的简单随机样本，则统计量 $\\frac{X_1 - X_2}{|X_3 + X_4 - 2|}$ 的分布为（ ）",
    "options": [
      "A. $N(0, 1)$",
      "B. $t(1)$",
      "C. $\\chi^2(1)$",
      "D. $F(1, 1)$"
    ],
    "correctAnswer": "B",
    "explanation": "因为 $X_1, X_2, X_3, X_4$ 独立同分布于 $N(1, \\sigma^2)$，所以：\n- 分子中 $X_1 - X_2 \\sim N(0, 2\\sigma^2)$，标准化得 $U = \\frac{X_1 - X_2}{\\sqrt{2}\\sigma} \\sim N(0, 1)$；\n- 分母中 $X_3 + X_4 - 2 \\sim N(0, 2\\sigma^2)$，标准化得 $V = \\frac{X_3 + X_4 - 2}{\\sqrt{2}\\sigma} \\sim N(0, 1)$，从而 $V^2 \\sim \\chi^2(1)$；\n- 由于 $(X_1, X_2)$ 与 $(X_3, X_4)$ 相互独立，故 $U$ 与 $V^2$ 相互独立。\n\n将统计量恒等变形：\n$$\\frac{X_1 - X_2}{|X_3 + X_4 - 2|} = \\frac{\\frac{X_1 - X_2}{\\sqrt{2}\\sigma}}{\\sqrt{\\left(\\frac{X_3 + X_4 - 2}{\\sqrt{2}\\sigma}\\right)^2 / 1}} = \\frac{U}{\\sqrt{V^2 / 1}} \\sim t(1).$$\n故选 B。",
    "steps": [
      "分别对分子 $X_1 - X_2$ 与分母 $X_3 + X_4 - 2$ 除以 $\\sqrt{2}\\sigma$ 进行标准化",
      "确认分子为 $N(0,1)$、分母根号内为 $\\chi^2(1)/1$ 且相互独立，由 $t$ 分布定义得服从 $t(1)$"
    ],
    "keyPoints": [
      "t 分布的定义与结构特征",
      "正态样本线性组合的分布",
      "独立性检验"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2012真题",
      "抽样分布",
      "t分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设 $X_1, X_2, \\cdots, X_{10}$ 为来自总体 $N(0, 1)$ 的简单随机样本：\n（1）若 $T = \\frac{1}{4}\\left(\\sum_{i=1}^4 X_i\\right)^2 + \\frac{1}{6}\\left(\\sum_{i=5}^{10} X_i\\right)^2$，求 $T$ 服从的分布；\n（2）若 $T = \\frac{7\\sum_{i=1}^3 X_i^2}{3\\sum_{i=4}^{10} X_i^2}$，求 $T$ 服从的分布；\n（3）若 $T = \\frac{3X_1}{\\sqrt{\\sum_{i=2}^{10} X_i^2}}$，求 $T$ 服从的分布。",
    "correctAnswer": "（1）$\\chi^2(2)$；（2）$F(3, 7)$；（3）$t(9)$",
    "explanation": "**（1）** 因为 $X_1, \\cdots, X_{10}$ 独立同分布于 $N(0, 1)$，故：\n$$\\sum_{i=1}^4 X_i \\sim N(0, 4) \\implies U_1 = \\frac{1}{2}\\sum_{i=1}^4 X_i \\sim N(0, 1) \\implies U_1^2 = \\frac{1}{4}\\left(\\sum_{i=1}^4 X_i\\right)^2 \\sim \\chi^2(1),$$\n$$\\sum_{i=5}^{10} X_i \\sim N(0, 6) \\implies U_2 = \\frac{1}{\\sqrt{6}}\\sum_{i=5}^{10} X_i \\sim N(0, 1) \\implies U_2^2 = \\frac{1}{6}\\left(\\sum_{i=5}^{10} X_i\\right)^2 \\sim \\chi^2(1).$$\n又因两组样本下标互不相交，$U_1^2$ 与 $U_2^2$ 相互独立，由 $\\chi^2$ 分布的可加性得：\n$$T = U_1^2 + U_2^2 \\sim \\chi^2(1 + 1) = \\chi^2(2).$$\n\n**（2）** 因为 $\\sum_{i=1}^3 X_i^2 \\sim \\chi^2(3)$，$\\sum_{i=4}^{10} X_i^2 \\sim \\chi^2(7)$，且二者相互独立，由 $F$ 分布的定义得：\n$$T = \\frac{7\\sum_{i=1}^3 X_i^2}{3\\sum_{i=4}^{10} X_i^2} = \\frac{\\left(\\sum_{i=1}^3 X_i^2\\right) / 3}{\\left(\\sum_{i=4}^{10} X_i^2\\right) / 7} \\sim F(3, 7).$$\n\n**（3）** 因为 $X_1 \\sim N(0, 1)$，$\\sum_{i=2}^{10} X_i^2 \\sim \\chi^2(9)$，且二者相互独立，由 $t$ 分布的定义得：\n$$T = \\frac{3X_1}{\\sqrt{\\sum_{i=2}^{10} X_i^2}} = \\frac{X_1}{\\sqrt{\\left(\\sum_{i=2}^{10} X_i^2\\right) / 9}} \\sim t(9).$$",
    "steps": [
      "（1）将两个平方项分别标准化为独立 $\\chi^2(1)$ 变量之和，得 $\\chi^2(2)$",
      "（2）将分式改写为两个独立卡方变量各自除以自由度之比，得 $F(3, 7)$",
      "（3）将分母转化为 $\\sqrt{\\chi^2(9)/9}$，结合分子 $N(0,1)$ 且独立，得 $t(9)$"
    ],
    "keyPoints": [
      "三大抽样分布标准构造",
      "卡方分布可加性"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "卡方分布",
      "F分布",
      "t分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-11",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（1）（1997）设随机变量 $X, Y$ 相互独立且都服从正态分布 $N(0, 3^2)$，$X_1, \\cdots, X_9$ 和 $Y_1, \\cdots, Y_9$ 是分别来自总体 $X$ 和 $Y$ 的简单随机样本，则 $\\frac{X_1 + \\cdots + X_9}{\\sqrt{Y_1^2 + \\cdots + Y_9^2}}$ 服从什么分布；\n（2）（2001）设总体 $X$ 服从正态分布 $N(0, 4)$，$X_1, \\cdots, X_{15}$ 是来自总体的简单随机样本，则 $\\frac{X_1^2 + \\cdots + X_{10}^2}{2(X_{11}^2 + \\cdots + X_{15}^2)}$ 服从什么分布；\n（3）设总体 $X$ 服从正态分布 $N(0, 1)$，$X_1, \\cdots, X_{2n}$ 是来自总体的简单随机样本，则 $\\frac{1}{2}\\sum_{i=1}^{2n} X_i^2 + \\sum_{i=1}^n X_{2i-1} X_{2i}$ 服从什么分布。",
    "correctAnswer": "（1）$t(9)$；（2）$F(10, 5)$；（3）$\\chi^2(n)$",
    "explanation": "**（1）** 因 $X_1, \\cdots, X_9$ 独立同分布于 $N(0, 3^2)$，有 $\\sum_{i=1}^9 X_i \\sim N(0, 9 \\times 3^2) = N(0, 9^2)$，故\n$$U = \\frac{X_1 + \\cdots + X_9}{9} \\sim N(0, 1).$$\n又因 $Y_1, \\cdots, Y_9$ 独立同分布于 $N(0, 3^2)$，故 $\\frac{Y_i}{3} \\sim N(0, 1)$，从而\n$$V = \\sum_{i=1}^9 \\left(\\frac{Y_i}{3}\\right)^2 = \\frac{Y_1^2 + \\cdots + Y_9^2}{9} \\sim \\chi^2(9).$$\n且 $X$ 与 $Y$ 相互独立，故 $U$ 与 $V$ 相互独立。因此：\n$$\\frac{X_1 + \\cdots + X_9}{\\sqrt{Y_1^2 + \\cdots + Y_9^2}} = \\frac{\\frac{X_1 + \\cdots + X_9}{9}}{\\sqrt{\\frac{Y_1^2 + \\cdots + Y_9^2}{9 \\times 9}}} = \\frac{U}{\\sqrt{V / 9}} \\sim t(9).$$\n\n**（2）** 因 $X_i \\sim N(0, 4)$，故 $\\frac{X_i}{2} \\sim N(0, 1)$。记\n$$W_1 = \\sum_{i=1}^{10} \\left(\\frac{X_i}{2}\\right)^2 = \\frac{X_1^2 + \\cdots + X_{10}^2}{4} \\sim \\chi^2(10), \\qquad W_2 = \\sum_{i=11}^{15} \\left(\\frac{X_i}{2}\\right)^2 = \\frac{X_{11}^2 + \\cdots + X_{15}^2}{4} \\sim \\chi^2(5),$$\n且 $W_1$ 与 $W_2$ 相互独立。将统计量变形得：\n$$\\frac{X_1^2 + \\cdots + X_{10}^2}{2(X_{11}^2 + \\cdots + X_{15}^2)} = \\frac{4W_1}{2 \\cdot 4W_2} = \\frac{W_1}{2W_2} = \\frac{W_1 / 10}{W_2 / 5} \\sim F(10, 5).$$\n\n**（3）** 将统计量按奇偶项配成完全平方：\n$$\\frac{1}{2}\\sum_{i=1}^{2n} X_i^2 + \\sum_{i=1}^n X_{2i-1}X_{2i} = \\frac{1}{2}\\sum_{i=1}^n \\left(X_{2i-1}^2 + 2X_{2i-1}X_{2i} + X_{2i}^2\\right) = \\sum_{i=1}^n \\left(\\frac{X_{2i-1} + X_{2i}}{\\sqrt{2}}\\right)^2.$$\n因为 $X_1, \\cdots, X_{2n}$ 独立同分布于 $N(0, 1)$，对每个 $i = 1, 2, \\cdots, n$ 有 $X_{2i-1} + X_{2i} \\sim N(0, 2)$，故 $Z_i = \\frac{X_{2i-1} + X_{2i}}{\\sqrt{2}} \\sim N(0, 1)$，且 $Z_1, Z_2, \\cdots, Z_n$ 相互独立（下标两两不交）。因此：\n$$\\sum_{i=1}^n Z_i^2 \\sim \\chi^2(n).$$",
    "steps": [
      "（1）对分子、分母同除以 $9$ 构造 $N(0,1)$ 与 $\\sqrt{\\chi^2(9)/9}$ 的商，得 $t(9)$",
      "（2）提取方差因子 $4$ 化为两个独立卡方变量除以自由度之比，得 $F(10, 5)$",
      "（3）将交叉项与平方项配成 $n$ 个独立标准正态平方和 $\\sum_{i=1}^n \\left(\\frac{X_{2i-1}+X_{2i}}{\\sqrt{2}}\\right)^2$，得 $\\chi^2(n)$"
    ],
    "keyPoints": [
      "非标准正态抽样分布标准化",
      "配方法构造卡方分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1997真题",
      "2001真题",
      "配方法",
      "抽样分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-12",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "设随机变量 $X \\sim t(n)\\ (n > 1)$，$Y = \\frac{1}{X^2}$，则（ ）",
    "options": [
      "A. $Y \\sim \\chi^2(n)$",
      "B. $Y \\sim \\chi^2(n - 1)$",
      "C. $Y \\sim F(n, 1)$",
      "D. $Y \\sim F(1, n)$"
    ],
    "correctAnswer": "C",
    "explanation": "因为 $X \\sim t(n)$，可设 $X = \\frac{U}{\\sqrt{V/n}}$，其中 $U \\sim N(0, 1)$，$V \\sim \\chi^2(n)$ 且 $U$ 与 $V$ 相互独立。则：\n$$X^2 = \\frac{U^2 / 1}{V / n} \\sim F(1, n).$$\n再利用 $F$ 分布的倒数性质（若 $F \\sim F(n_1, n_2)$，则 $\\frac{1}{F} \\sim F(n_2, n_1)$），可得：\n$$Y = \\frac{1}{X^2} = \\frac{V / n}{U^2 / 1} \\sim F(n, 1).$$\n故选 C。",
    "steps": [
      "由 $X \\sim t(n)$ 得到 $X^2 \\sim F(1, n)$",
      "应用 $F$ 分布倒数性质，互换自由度得 $Y = \\frac{1}{X^2} \\sim F(n, 1)$"
    ],
    "keyPoints": [
      "t 分布平方与 F 分布关系",
      "F 分布倒数性质"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2003真题",
      "t分布",
      "F分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-13",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "设随机变量 $X \\sim N(0, 1)$，$Y \\sim \\chi^2(1)$，给定 $\\alpha\\ (0 < \\alpha < 1)$，数 $U_\\alpha$ 满足 $P\\{X > U_\\alpha\\} = \\alpha$，数 $\\chi_\\alpha^2(1)$ 满足 $P\\{Y > \\chi_\\alpha^2(1)\\} = \\alpha$，则 $\\chi_{0.05}^2(1) =$ （ ）",
    "options": [
      "A. $U_{0.025}$",
      "B. $U_{0.025}^2$",
      "C. $U_{0.05}$",
      "D. $U_{0.05}^2$"
    ],
    "correctAnswer": "B",
    "explanation": "因为 $X \\sim N(0, 1)$，故 $X^2 \\sim \\chi^2(1)$，即 $Y$ 与 $X^2$ 同分布。由上侧分位点定义：\n$$P\\{Y > \\chi_{0.05}^2(1)\\} = P\\{X^2 > \\chi_{0.05}^2(1)\\} = 0.05.$$\n由于 $\\chi_{0.05}^2(1) > 0$，记 $c = \\sqrt{\\chi_{0.05}^2(1)} > 0$。利用标准正态分布密度函数的对称性：\n$$P\\{X^2 > c^2\\} = P\\{X > c\\} + P\\{X < -c\\} = 2P\\{X > c\\} = 0.05 \\implies P\\{X > c\\} = 0.025.$$\n对照 $U_{0.025}$ 的定义 $P\\{X > U_{0.025}\\} = 0.025$，得 $c = U_{0.025}$，因此：\n$$\\chi_{0.05}^2(1) = c^2 = U_{0.025}^2.$$\n故选 B。",
    "steps": [
      "利用 $X \\sim N(0,1) \\implies X^2 \\sim \\chi^2(1)$，将 $P\\{Y > \\chi_{0.05}^2(1)\\} = 0.05$ 转化为 $P\\{X^2 > c^2\\} = 0.05$",
      "借助正态分布对称性得 $P\\{X > c\\} = 0.025$，从而 $c = U_{0.025}$，即 $\\chi_{0.05}^2(1) = U_{0.025}^2$"
    ],
    "keyPoints": [
      "上侧分位点定义",
      "标准正态与自由度为 1 的卡方分位点关系"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "分位点",
      "卡方分布",
      "标准正态分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-14",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设随机变量 $X \\sim t(n)$，$Y \\sim F(1, n)$，给定 $\\alpha\\ (0 < \\alpha < 0.5)$，常数 $c$ 满足 $P\\{X > c\\} = \\alpha$，求 $P\\{Y > c^2\\}$。",
    "correctAnswer": "$2\\alpha$",
    "explanation": "因为 $X \\sim t(n)$，由 $t$ 分布与 $F$ 分布的关系可知 $X^2 \\sim F(1, n)$，即 $Y$ 与 $X^2$ 同分布。\n又因 $t(n)$ 分布的概率密度函数是偶函数，故 $P\\{X > 0\\} = 0.5$。由于 $0 < \\alpha < 0.5$ 且 $P\\{X > c\\} = \\alpha < 0.5$，可知 $c > 0$。\n因此：\n$$P\\{Y > c^2\\} = P\\{X^2 > c^2\\} = P\\{X > c\\} + P\\{X < -c\\}.$$\n由 $t(n)$ 分布关于 $0$ 的对称性，有 $P\\{X < -c\\} = P\\{X > c\\} = \\alpha$，故：\n$$P\\{Y > c^2\\} = \\alpha + \\alpha = 2\\alpha.$$",
    "steps": [
      "利用 $X \\sim t(n) \\implies X^2 \\sim F(1, n)$，将所求转化为 $P\\{X^2 > c^2\\}$",
      "由 $0 < \\alpha < 0.5$ 判定 $c > 0$，利用 $t$ 分布对称性得 $P\\{X^2 > c^2\\} = 2P\\{X > c\\} = 2\\alpha$"
    ],
    "keyPoints": [
      "t 分布密度函数偶性",
      "t 分布平方与 F(1,n) 同分布"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2013真题",
      "分位点",
      "t分布",
      "F分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-15",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "blank",
    "question": "设总体 $X \\sim N(0, \\sigma^2)\\ (\\sigma > 0)$，$X_1, X_2, X_3$ 为来自总体 $X$ 的简单随机样本，$Y = \\frac{1}{2}\\left(\\frac{X_1}{X_3} + \\frac{X_2}{X_3}\\right)^2$，若 $P\\{Y > a\\} = 0.05\\ (a \\ne 0)$，则 $P\\left\\{Y > \\frac{1}{a}\\right\\} =$ ______。",
    "correctAnswer": "$0.95$",
    "explanation": "将随机变量 $Y$ 恒等变形：\n$$Y = \\frac{1}{2}\\left(\\frac{X_1 + X_2}{X_3}\\right)^2 = \\frac{\\left(\\frac{X_1 + X_2}{\\sqrt{2}\\sigma}\\right)^2}{\\left(\\frac{X_3}{\\sigma}\\right)^2}.$$\n因为 $X_1, X_2, X_3$ 独立同分布于 $N(0, \\sigma^2)$，所以：\n- $X_1 + X_2 \\sim N(0, 2\\sigma^2) \\implies U = \\left(\\frac{X_1 + X_2}{\\sqrt{2}\\sigma}\\right)^2 \\sim \\chi^2(1)$；\n- $\\frac{X_3}{\\sigma} \\sim N(0, 1) \\implies V = \\left(\\frac{X_3}{\\sigma}\\right)^2 \\sim \\chi^2(1)$；\n- 且 $U$ 与 $V$ 相互独立。\n\n于是 $Y = \\frac{U / 1}{V / 1} \\sim F(1, 1)$。\n由 $F$ 分布的倒数性质可知 $\\frac{1}{Y} \\sim F(1, 1)$，即 $\\frac{1}{Y}$ 与 $Y$ 同分布。又因为 $Y > 0$ 几乎处处成立，且 $P\\{Y > a\\} = 0.05\\ (a \\ne 0)$，故 $a > 0$。从而：\n$$P\\left\\{Y > \\frac{1}{a}\\right\\} = P\\left\\{\\frac{1}{Y} > \\frac{1}{a}\\right\\} = P\\{Y < a\\} = 1 - P\\{Y \\ge a\\} = 1 - P\\{Y > a\\} = 1 - 0.05 = 0.95.$$",
    "steps": [
      "将 $Y$ 改写为 $\\frac{\\left[(X_1+X_2)/(\\sqrt{2}\\sigma)\\right]^2}{(X_3/\\sigma)^2}$，判定 $Y \\sim F(1, 1)$",
      "利用 $\\frac{1}{Y}$ 与 $Y$ 同服从 $F(1, 1)$ 及 $a > 0$，将 $P\\left\\{Y > \\frac{1}{a}\\right\\}$ 转化为 $P\\{Y < a\\} = 1 - 0.05 = 0.95$"
    ],
    "keyPoints": [
      "F(1, 1) 分布的构造",
      "F 分布倒数的同分布性质"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "李六",
      "F分布",
      "倒数性质",
      "分位点"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "（1994）设 $X_1, X_2, \\cdots, X_n$ 为来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，$\\bar{X}$ 是样本均值，记：\n\n$$S_1^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2, \\quad S_2^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2,$$\n$$S_3^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\mu)^2, \\quad S_4^2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\mu)^2,$$\n\n则服从自由度为 $n-1$ 的 $t$ 分布的随机变量是（ ）。",
    "options": [
      "A. $t = \\frac{\\bar{X} - \\mu}{S_1 / \\sqrt{n-1}}$",
      "B. $t = \\frac{\\bar{X} - \\mu}{S_2 / \\sqrt{n-1}}$",
      "C. $t = \\frac{\\bar{X} - \\mu}{S_3 / \\sqrt{n}}$",
      "D. $t = \\frac{\\bar{X} - \\mu}{S_4 / \\sqrt{n}}$"
    ],
    "correctAnswer": "B",
    "explanation": "根据正态总体抽样分布的基本结论：$\\frac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)$，$\\frac{(n-1)S_1^2}{\\sigma^2} = \\frac{1}{\\sigma^2}\\sum_{i=1}^n (X_i-\\bar{X})^2 \\sim \\chi^2(n-1)$，且 $\\bar{X}$ 与 $S_1^2$ 相互独立。\n\n由 $t$ 分布的定义可得：\n$$T = \\frac{\\dfrac{\\bar{X}-\\mu}{\\sigma/\\sqrt{n}}}{\\sqrt{\\dfrac{(n-1)S_1^2/\\sigma^2}{n-1}}} = \\frac{\\bar{X}-\\mu}{S_1/\\sqrt{n}} \\sim t(n-1).$$\n注意到 $(n-1)S_1^2 = nS_2^2$，即 $S_1 = \\sqrt{\\frac{n}{n-1}}S_2$，代入分母得：\n$$\\frac{S_1}{\\sqrt{n}} = \\frac{\\sqrt{\\frac{n}{n-1}}S_2}{\\sqrt{n}} = \\frac{S_2}{\\sqrt{n-1}},$$\n因此 $\\frac{\\bar{X}-\\mu}{S_2/\\sqrt{n-1}} \\sim t(n-1)$，选项 B 正确。\n\n逐项排除其余选项：\n- **选项 A**：分母写成了 $S_1/\\sqrt{n-1}$，与标准形式 $S_1/\\sqrt{n}$ 不符；\n- **选项 C、D**：$S_3^2$ 与 $S_4^2$ 中使用的是总体均值 $\\mu$ 而非样本均值 $\\bar{X}$，$\\frac{1}{\\sigma^2}\\sum_{i=1}^n (X_i-\\mu)^2 \\sim \\chi^2(n)$（自由度为 $n$），且 $\\bar{X}$ 与 $\\sum_{i=1}^n (X_i-\\mu)^2$ 并不相互独立，故不服从 $t$ 分布。",
    "steps": [
      "写出正态总体的标准抽样分布结果：$\\frac{\\bar{X}-\\mu}{S_1/\\sqrt{n}} \\sim t(n-1)$",
      "利用关系式 $(n-1)S_1^2 = nS_2^2$ 将 $S_1$ 替换为 $S_2$，化简得到 $\\frac{\\bar{X}-\\mu}{S_2/\\sqrt{n-1}} \\sim t(n-1)$",
      "对照选项排除未匹配自由度及不满足独立性的 A、C、D，选出 B"
    ],
    "keyPoints": [
      "正态总体下 $t$ 分布的构造",
      "无偏样本方差与二阶样本中心矩的换算关系",
      "$\\bar{X}$ 与 $S^2$ 的独立性"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1994真题",
      "t分布",
      "抽样分布",
      "正态总体"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-17",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "（2023）设 $X_1, X_2, \\cdots, X_n$ 是来自正态总体 $N(\\mu_1, \\sigma^2)$ 的简单随机样本，$Y_1, Y_2, \\cdots, Y_m$ 是来自正态总体 $N(\\mu_2, 2\\sigma^2)$ 的简单随机样本，且两样本相互独立，记 $\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$，$\\bar{Y} = \\frac{1}{m}\\sum_{i=1}^m Y_i$，$S_1^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$，$S_2^2 = \\frac{1}{m-1}\\sum_{i=1}^m (Y_i - \\bar{Y})^2$，则（ ）。",
    "options": [
      "A. $\\frac{S_1^2}{S_2^2} \\sim F(n, m)$",
      "B. $\\frac{S_1^2}{S_2^2} \\sim F(n-1, m-1)$",
      "C. $\\frac{2S_1^2}{S_2^2} \\sim F(n, m)$",
      "D. $\\frac{2S_1^2}{S_2^2} \\sim F(n-1, m-1)$"
    ],
    "correctAnswer": "D",
    "explanation": "由正态总体的抽样分布性质可知：\n$$\\frac{(n-1)S_1^2}{\\sigma^2} \\sim \\chi^2(n-1), \\qquad \\frac{(m-1)S_2^2}{2\\sigma^2} \\sim \\chi^2(m-1).$$\n因为两样本相互独立，所以统计量 $S_1^2$ 与 $S_2^2$ 相互独立。由 $F$ 分布的定义：\n$$F = \\frac{\\dfrac{(n-1)S_1^2/\\sigma^2}{n-1}}{\\dfrac{(m-1)S_2^2/(2\\sigma^2)}{m-1}} = \\frac{S_1^2/\\sigma^2}{S_2^2/(2\\sigma^2)} = \\frac{2S_1^2}{S_2^2} \\sim F(n-1, m-1).$$\n故选项 D 正确。",
    "steps": [
      "分别写出两个独立正态样本方差对应的卡方分布：$\\frac{(n-1)S_1^2}{\\sigma^2} \\sim \\chi^2(n-1)$，$\\frac{(m-1)S_2^2}{2\\sigma^2} \\sim \\chi^2(m-1)$",
      "利用两卡方分布各自除以自由度再作商，消去未知参数 $\\sigma^2$ 得到 $\\frac{2S_1^2}{S_2^2} \\sim F(n-1, m-1)$"
    ],
    "keyPoints": [
      "双正态总体样本方差比的 $F$ 分布",
      "总体方差倍数关系对统计量系数的影响"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2023真题",
      "F分布",
      "双正态总体"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-18",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "（余炳森 5 套卷）设总体 $(X,Y) \\sim N(\\mu_1, \\mu_2; \\sigma_1^2, \\sigma_2^2; 0)$，$(X_1, Y_1), (X_2, Y_2), \\cdots, (X_n, Y_n)\\;(n > 1)$ 是来自总体 $(X,Y)$ 的简单随机样本，记 $\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$，$\\bar{Y} = \\frac{1}{n}\\sum_{i=1}^n Y_i$，$S_1^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$，$S_2^2 = \\frac{1}{n-1}\\sum_{i=1}^n (Y_i - \\bar{Y})^2$，则下列结论不正确的是（ ）。",
    "options": [
      "A. $n\\bar{X} \\sim N(n\\mu_1, n\\sigma^2)$",
      "B. $\\frac{\\bar{X}-\\bar{Y}-(\\mu_1-\\mu_2)}{\\sqrt{\\frac{S_1^2+S_2^2}{n}}} \\sim t(2n-2)$",
      "C. $\\frac{S_1^2}{S_2^2} \\sim F(n-1, n-1)$",
      "D. $\\frac{(n-1)(S_1^2+S_2^2)}{\\sigma^2} \\sim \\chi^2(2n)$"
    ],
    "correctAnswer": "D",
    "explanation": "（注：题干中 $\\sigma_1^2, \\sigma_2^2$ 按各选项统一的符号语境为等方差情形 $\\sigma_1^2 = \\sigma_2^2 = \\sigma^2$。）因为二维正态总体的相关系数 $\\rho = 0$，所以 $X$ 与 $Y$ 相互独立，即 $X \\sim N(\\mu_1, \\sigma^2)$ 与 $Y \\sim N(\\mu_2, \\sigma^2)$ 相互独立，从而两组样本也相互独立。\n\n逐项分析如下：\n- **选项 A**：$\\bar{X} \\sim N\\left(\\mu_1, \\frac{\\sigma^2}{n}\\right)$，故 $n\\bar{X} = \\sum_{i=1}^n X_i \\sim N(n\\mu_1, n\\sigma^2)$，结论正确；\n- **选项 B**：由独立性知 $\\bar{X} - \\bar{Y} \\sim N\\left(\\mu_1 - \\mu_2, \\frac{2\\sigma^2}{n}\\right)$，标准化得 $\\frac{\\bar{X}-\\bar{Y}-(\\mu_1-\\mu_2)}{\\sigma\\sqrt{2/n}} \\sim N(0,1)$；又 $\\frac{(n-1)S_1^2}{\\sigma^2} \\sim \\chi^2(n-1)$ 与 $\\frac{(n-1)S_2^2}{\\sigma^2} \\sim \\chi^2(n-1)$ 相互独立，由卡方分布的可加性得 $\\frac{(n-1)(S_1^2+S_2^2)}{\\sigma^2} \\sim \\chi^2(2n-2)$，且与 $\\bar{X}-\\bar{Y}$ 相互独立。代入 $t$ 分布定义：\n  $$\\frac{\\dfrac{\\bar{X}-\\bar{Y}-(\\mu_1-\\mu_2)}{\\sigma\\sqrt{2/n}}}{\\sqrt{\\dfrac{(n-1)(S_1^2+S_2^2)/\\sigma^2}{2n-2}}} = \\frac{\\bar{X}-\\bar{Y}-(\\mu_1-\\mu_2)}{\\sqrt{\\dfrac{S_1^2+S_2^2}{n}}} \\sim t(2n-2),$$\n  结论正确；\n- **选项 C**：由 $\\frac{(n-1)S_1^2}{\\sigma^2} \\sim \\chi^2(n-1)$ 与 $\\frac{(n-1)S_2^2}{\\sigma^2} \\sim \\chi^2(n-1)$ 相互独立，按 $F$ 分布定义得 $\\frac{S_1^2}{S_2^2} \\sim F(n-1, n-1)$，结论正确；\n- **选项 D**：两个自由度均为 $n-1$ 的独立卡方分布之和，自由度应为 $(n-1) + (n-1) = 2n - 2$，而不是 $2n$，即 $\\frac{(n-1)(S_1^2+S_2^2)}{\\sigma^2} \\sim \\chi^2(2n-2)$，故选项 D 不正确。",
    "steps": [
      "由二维正态分布 $\\rho = 0$ 判定 $X$ 与 $Y$ 相互独立，从而两个样本均值和样本方差各自独立",
      "依次验证 A（样本和的正态分布）、B（两等方差正态总体均值差的双样本 $t$ 统计量）、C（等自由度 $F$ 分布）均正确",
      "指出 D 中卡方分布可加性对应的自由度应为 $(n-1)+(n-1)=2n-2$ 而非 $2n$，确定 D 不正确"
    ],
    "keyPoints": [
      "二维正态分布独立性（不相关即独立）",
      "卡方分布的可加性及自由度计算",
      "双样本 $t$ 统计量与 $F$ 统计量"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "模拟题",
      "二维正态",
      "抽样分布综合"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-19",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2008）$X_1, X_2, \\cdots, X_n$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，记 $\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$，$S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$，$T = \\bar{X}^2 - \\frac{1}{n}S^2$，\n（1）证明：$ET = \\mu^2$；\n（2）当 $\\mu = 0, \\sigma = 1$ 时，求 $DT$。",
    "correctAnswer": "（1）证明见解析；（2）$DT = \\frac{2}{n(n-1)}$",
    "explanation": "**（1）证明 $ET = \\mu^2$：**\n因为 $X_1, \\cdots, X_n$ 来自总体 $N(\\mu, \\sigma^2)$，所以 $E(\\bar{X}) = \\mu$，$D(\\bar{X}) = \\frac{\\sigma^2}{n}$，且样本方差满足 $E(S^2) = \\sigma^2$。\n由方差公式 $D(\\bar{X}) = E(\\bar{X}^2) - [E(\\bar{X})]^2$ 可得：\n$$E(\\bar{X}^2) = D(\\bar{X}) + [E(\\bar{X})]^2 = \\frac{\\sigma^2}{n} + \\mu^2.$$\n因此：\n$$ET = E(\\bar{X}^2) - \\frac{1}{n}E(S^2) = \\left(\\frac{\\sigma^2}{n} + \\mu^2\\right) - \\frac{1}{n}\\sigma^2 = \\mu^2.$$\n\n**（2）当 $\\mu = 0, \\sigma = 1$ 时，求 $DT$：**\n在正态总体下，$\\bar{X}$ 与 $S^2$ 相互独立，从而 $\\bar{X}^2$ 与 $S^2$ 相互独立，故：\n$$DT = D(\\bar{X}^2) + \\frac{1}{n^2}D(S^2).$$\n- 当 $\\mu = 0, \\sigma = 1$ 时，$\\bar{X} \\sim N\\left(0, \\frac{1}{n}\\right)$，于是 $\\sqrt{n}\\bar{X} \\sim N(0,1)$，从而 $n\\bar{X}^2 \\sim \\chi^2(1)$。利用 $\\chi^2(k)$ 的方差为 $2k$，得 $D(n\\bar{X}^2) = 2 \\times 1 = 2$，因此：\n  $$D(\\bar{X}^2) = \\frac{1}{n^2}D(n\\bar{X}^2) = \\frac{2}{n^2}.$$\n- 又由抽样分布结论知 $(n-1)S^2 \\sim \\chi^2(n-1)$（因 $\\sigma = 1$），故 $D((n-1)S^2) = 2(n-1)$，因此：\n  $$D(S^2) = \\frac{1}{(n-1)^2}D((n-1)S^2) = \\frac{2(n-1)}{(n-1)^2} = \\frac{2}{n-1}.$$\n将以上两项代入 $DT$ 的表达式：\n$$DT = \\frac{2}{n^2} + \\frac{1}{n^2}\\cdot \\frac{2}{n-1} = \\frac{2(n-1) + 2}{n^2(n-1)} = \\frac{2n}{n^2(n-1)} = \\frac{2}{n(n-1)}.$$",
    "steps": [
      "利用 $E(\\bar{X}^2) = D(\\bar{X}) + (E\\bar{X})^2 = \\frac{\\sigma^2}{n} + \\mu^2$ 与 $E(S^2) = \\sigma^2$，线性组合证得 $ET = \\mu^2$",
      "由正态总体下 $\\bar{X}$ 与 $S^2$ 相互独立，将 $DT$ 拆分为 $D(\\bar{X}^2) + \\frac{1}{n^2}D(S^2)$",
      "当 $\\mu=0,\\sigma=1$ 时分别借助 $n\\bar{X}^2 \\sim \\chi^2(1)$ 与 $(n-1)S^2 \\sim \\chi^2(n-1)$ 算出 $D(\\bar{X}^2) = \\frac{2}{n^2}$、$D(S^2) = \\frac{2}{n-1}$，求和化简得 $\\frac{2}{n(n-1)}$"
    ],
    "keyPoints": [
      "样本均值平方与样本方差的数字特征",
      "$\\bar{X}$ 与 $S^2$ 的独立性",
      "利用卡方分布求 $D(\\bar{X}^2)$ 与 $D(S^2)$"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2008真题",
      "数字特征",
      "卡方分布",
      "独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-20",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设 $1, 2, 3, 1, 3, 5, 3$ 为来自总体 $X$ 的样本值，求其经验分布函数。",
    "correctAnswer": "$F_7(x) = \\begin{cases} 0, & x < 1 \\\\ \\frac{2}{7}, & 1 \\le x < 2 \\\\ \\frac{3}{7}, & 2 \\le x < 3 \\\\ \\frac{6}{7}, & 3 \\le x < 5 \\\\ 1, & x \\ge 5 \\end{cases}$",
    "explanation": "样本容量 $n = 7$，将给定样本值按从小到大的顺序重新排列：\n$$1,\\; 1,\\; 2,\\; 3,\\; 3,\\; 3,\\; 5.$$\n根据经验分布函数的定义 $F_n(x) = \\frac{\\text{样本中} \\le x \\text{的观测值个数}}{n}$，分段统计不超过 $x$ 的样本个数：\n- 当 $x < 1$ 时，小于或等于 $x$ 的样本值有 $0$ 个，故 $F_7(x) = 0$；\n- 当 $1 \\le x < 2$ 时，小于或等于 $x$ 的样本值为 $1, 1$，共 $2$ 个，故 $F_7(x) = \\frac{2}{7}$；\n- 当 $2 \\le x < 3$ 时，小于或等于 $x$ 的样本值为 $1, 1, 2$，共 $3$ 个，故 $F_7(x) = \\frac{3}{7}$；\n- 当 $3 \\le x < 5$ 时，小于或等于 $x$ 的样本值为 $1, 1, 2, 3, 3, 3$，共 $6$ 个，故 $F_7(x) = \\frac{6}{7}$；\n- 当 $x \\ge 5$ 时，全部 $7$ 个样本值均不超过 $x$，故 $F_7(x) = 1$。\n\n综上，样本的经验分布函数为：\n$$F_7(x) = \\begin{cases} 0, & x < 1 \\\\ \\dfrac{2}{7}, & 1 \\le x < 2 \\\\ \\dfrac{3}{7}, & 2 \\le x < 3 \\\\ \\dfrac{6}{7}, & 3 \\le x < 5 \\\\ 1, & x \\ge 5 \\end{cases}$$",
    "steps": [
      "确定样本容量 $n = 7$，将样本值按从小到大排序为 $1, 1, 2, 3, 3, 3, 5$",
      "以不同取值 $1, 2, 3, 5$ 为分界点划分左闭右开区间，统计各区间内满足 $\\le x$ 的累计频数比例，写出分段函数 $F_7(x)$"
    ],
    "keyPoints": [
      "经验分布函数的定义与计算",
      "分段区间左闭右开（右连续性）"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "经验分布函数",
      "数三专项",
      "顺序统计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-21",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2009 部分）设总体 $X$ 的概率密度为 $f(x) = \\begin{cases} \\lambda^2 x e^{-\\lambda x}, & x > 0 \\\\ 0, & \\text{其他} \\end{cases}$，参数 $\\lambda\\;(\\lambda > 0)$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\lambda$ 的矩估计量。",
    "correctAnswer": "$\\hat{\\lambda} = \\frac{2}{\\bar{X}}$",
    "explanation": "首先计算总体的一阶原点矩（数学期望 $EX$）：\n$$EX = \\int_{-\\infty}^{+\\infty} x f(x)\\,\\mathrm{d}x = \\int_{0}^{+\\infty} \\lambda^2 x^2 e^{-\\lambda x}\\,\\mathrm{d}x.$$\n作变量代换 $t = \\lambda x$（$x = \\frac{t}{\\lambda},\\; \\mathrm{d}x = \\frac{\\mathrm{d}t}{\\lambda}$），利用 $\\Gamma$ 函数性质 $\\Gamma(3) = 2! = 2$：\n$$EX = \\frac{1}{\\lambda}\\int_0^{+\\infty} t^2 e^{-t}\\,\\mathrm{d}t = \\frac{\\Gamma(3)}{\\lambda} = \\frac{2}{\\lambda}.$$\n令总体一阶矩等于样本一阶矩 $EX = \\bar{X}$，即：\n$$\\frac{2}{\\lambda} = \\bar{X}.$$\n解得参数 $\\lambda$ 的矩估计量为：\n$$\\hat{\\lambda} = \\frac{2}{\\bar{X}}.$$",
    "steps": [
      "通过积分（换元或分部积分）计算总体期望 $EX = \\frac{2}{\\lambda}$",
      "令 $EX = \\bar{X}$，解出参数 $\\lambda$ 的矩估计量 $\\hat{\\lambda} = \\frac{2}{\\bar{X}}$"
    ],
    "keyPoints": [
      "连续型总体期望计算",
      "一阶矩估计法"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2009真题",
      "矩估计",
      "Gamma分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（1）设总体 $X \\sim U(-\\theta, \\theta)$，参数 $\\theta\\;(\\theta > 0)$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\theta$ 的矩估计量。\n（2）设总体 $X \\sim U(a, b)$，参数 $a, b$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $a, b$ 的矩估计量。",
    "correctAnswer": "（1）$\\hat{\\theta} = \\sqrt{\\frac{3}{n}\\sum_{i=1}^n X_i^2}$；（2）$\\hat{a} = \\bar{X} - \\sqrt{\\frac{3}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2},\\; \\hat{b} = \\bar{X} + \\sqrt{\\frac{3}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}$",
    "explanation": "**（1）$X \\sim U(-\\theta, \\theta)$ 时求 $\\theta$ 的矩估计量：**\n因为 $EX = \\frac{-\\theta + \\theta}{2} = 0$ 不含未知参数 $\\theta$，故改用二阶总体矩进行估计。\n计算总体二阶原点矩 $EX^2$：\n$$EX^2 = \\int_{-\\theta}^{\\theta} x^2 \\cdot \\frac{1}{2\\theta}\\,\\mathrm{d}x = \\frac{1}{2\\theta}\\left[\\frac{x^3}{3}\\right]_{-\\theta}^{\\theta} = \\frac{\\theta^2}{3}.$$\n（亦可直接用 $EX^2 = DX + (EX)^2 = \\frac{(2\\theta)^2}{12} + 0 = \\frac{\\theta^2}{3}$。）\n令 $EX^2 = A_2 = \\frac{1}{n}\\sum_{i=1}^n X_i^2$，即 $\\frac{\\theta^2}{3} = \\frac{1}{n}\\sum_{i=1}^n X_i^2$。因为 $\\theta > 0$，解得 $\\theta$ 的矩估计量为：\n$$\\hat{\\theta} = \\sqrt{\\frac{3}{n}\\sum_{i=1}^n X_i^2}.$$\n（注：若改令 $DX = B_2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$，也可得中心矩形式 $\\tilde{\\theta} = \\sqrt{\\frac{3}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}$，常规优先采用二阶原点矩形式。）\n\n**（2）$X \\sim U(a, b)$（$a < b$）时求 $a, b$ 的矩估计量：**\n总体期望和方差分别为：\n$$EX = \\frac{a+b}{2}, \\qquad DX = \\frac{(b-a)^2}{12}.$$\n令总体期望与方差分别等于样本均值与二阶样本中心矩 $B_2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$：\n$$\\begin{cases} \\dfrac{a+b}{2} = \\bar{X} \\\\ \\dfrac{(b-a)^2}{12} = B_2 \\end{cases}$$\n因为 $b > a$，由第二式得 $b - a = \\sqrt{12 B_2} = 2\\sqrt{3 B_2}$；由第一式得 $a + b = 2\\bar{X}$。两式相加、相减并除以 $2$，解得：\n$$\\hat{a} = \\bar{X} - \\sqrt{3B_2} = \\bar{X} - \\sqrt{\\frac{3}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2},$$\n$$\\hat{b} = \\bar{X} + \\sqrt{3B_2} = \\bar{X} + \\sqrt{\\frac{3}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}.$$",
    "steps": [
      "第（1）问因 $EX = 0$ 不含 $\\theta$，计算 $EX^2 = \\frac{\\theta^2}{3}$ 并令其等于二阶样本原点矩 $A_2$，解出 $\\hat{\\theta}$",
      "第（2）问写出 $U(a,b)$ 的 $EX = \\frac{a+b}{2}$ 与 $DX = \\frac{(b-a)^2}{12}$，联立 $EX=\\bar{X}$ 与 $DX=B_2$ 并结合 $b>a$ 解出 $\\hat{a}, \\hat{b}$"
    ],
    "keyPoints": [
      "一阶矩不含参数时启用二阶矩",
      "双参数均匀分布的矩估计"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "矩估计",
      "二阶矩"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-23",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2018 改编）设总体 $X$ 的概率密度为 $f(x) = \\frac{1}{2\\sigma}e^{-\\frac{|x|}{\\sigma}}, -\\infty < x < +\\infty$，其中参数 $\\sigma > 0$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\sigma$ 的矩估计量。",
    "correctAnswer": "$\\hat{\\sigma} = \\sqrt{\\frac{1}{2n}\\sum_{i=1}^n X_i^2}$",
    "explanation": "注意到 $f(x)$ 为关于 $x$ 的偶函数，因此总体的一阶矩为：\n$$EX = \\int_{-\\infty}^{+\\infty} x \\cdot \\frac{1}{2\\sigma}e^{-\\frac{|x|}{\\sigma}}\\,\\mathrm{d}x = 0,$$\n（其积分绝对收敛，奇函数在对称区间上的反常积分值为 $0$）。由于 $EX$ 不含未知参数 $\\sigma$，故利用二阶矩进行估计。\n\n计算总体的二阶原点矩 $EX^2$：\n$$EX^2 = \\int_{-\\infty}^{+\\infty} x^2 \\cdot \\frac{1}{2\\sigma}e^{-\\frac{|x|}{\\sigma}}\\,\\mathrm{d}x = 2\\int_0^{+\\infty} x^2 \\cdot \\frac{1}{2\\sigma}e^{-\\frac{x}{\\sigma}}\\,\\mathrm{d}x = \\frac{1}{\\sigma}\\int_0^{+\\infty} x^2 e^{-\\frac{x}{\\sigma}}\\,\\mathrm{d}x.$$\n令 $t = \\frac{x}{\\sigma}$，则 $x = \\sigma t,\\; \\mathrm{d}x = \\sigma\\,\\mathrm{d}t$，代入得：\n$$EX^2 = \\sigma^2 \\int_0^{+\\infty} t^2 e^{-t}\\,\\mathrm{d}t = \\sigma^2 \\Gamma(3) = 2\\sigma^2.$$\n令 $EX^2 = A_2 = \\frac{1}{n}\\sum_{i=1}^n X_i^2$，即 $2\\sigma^2 = \\frac{1}{n}\\sum_{i=1}^n X_i^2$。因为 $\\sigma > 0$，解得 $\\sigma$ 的矩估计量为：\n$$\\hat{\\sigma} = \\sqrt{\\frac{1}{2n}\\sum_{i=1}^n X_i^2}.$$",
    "steps": [
      "由被积函数对称性判断 $EX = 0$ 不含 $\\sigma$，转而计算二阶矩 $EX^2$",
      "利用偶函数性质与变量代换 $t = x/\\sigma$ 算得 $EX^2 = 2\\sigma^2$",
      "令 $2\\sigma^2 = \\frac{1}{n}\\sum_{i=1}^n X_i^2$ 并取正根，求得 $\\hat{\\sigma} = \\sqrt{\\frac{1}{2n}\\sum_{i=1}^n X_i^2}$"
    ],
    "keyPoints": [
      "对称分布的一阶矩为零",
      "拉普拉斯分布的二阶矩估计"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2018真题",
      "矩估计",
      "拉普拉斯分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-24",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2002）设总体 $X$ 的概率分布为\n\n| $X$ | $0$ | $1$ | $2$ | $3$ |\n| :---: | :---: | :---: | :---: | :---: |\n| $p$ | $\\theta^2$ | $2\\theta(1-\\theta)$ | $\\theta^2$ | $1-2\\theta$ |\n\n其中 $\\theta$ 是未知参数 $\\left(0 < \\theta < \\frac{1}{2}\\right)$，利用总体的如下样本值：$3, 1, 3, 0, 3, 1, 2, 3$，求 $\\theta$ 的矩估计值和最大似然估计值。",
    "correctAnswer": "矩估计值为 $\\frac{1}{4}$；最大似然估计值为 $\\frac{7 - \\sqrt{13}}{12}$",
    "explanation": "**一、求 $\\theta$ 的矩估计值：**\n计算总体数学期望 $EX$：\n$$EX = 0\\cdot \\theta^2 + 1\\cdot 2\\theta(1-\\theta) + 2\\cdot \\theta^2 + 3\\cdot (1-2\\theta) = 2\\theta - 2\\theta^2 + 2\\theta^2 + 3 - 6\\theta = 3 - 4\\theta.$$\n样本容量 $n = 8$，计算样本均值 $\\bar{x}$：\n$$\\bar{x} = \\frac{3 + 1 + 3 + 0 + 3 + 1 + 2 + 3}{8} = \\frac{16}{8} = 2.$$\n令 $EX = \\bar{x}$，即 $3 - 4\\theta = 2$，解得 $\\theta$ 的矩估计值为：\n$$\\hat{\\theta}_1 = \\frac{1}{4} \\in \\left(0, \\frac{1}{2}\\right).$$\n\n**二、求 $\\theta$ 的最大似然估计值：**\n在给定样本观测值 $3, 1, 3, 0, 3, 1, 2, 3$ 中，$0$ 出现 $1$ 次，$1$ 出现 $2$ 次，$2$ 出现 $1$ 次，$3$ 出现 $4$ 次。由此写出似然函数：\n$$L(\\theta) = (\\theta^2)^1 \\cdot [2\\theta(1-\\theta)]^2 \\cdot (\\theta^2)^1 \\cdot (1-2\\theta)^4 = 4\\theta^6 (1-\\theta)^2 (1-2\\theta)^4, \\quad 0 < \\theta < \\frac{1}{2}.$$\n两边取自然对数：\n$$\\ln L(\\theta) = \\ln 4 + 6\\ln\\theta + 2\\ln(1-\\theta) + 4\\ln(1-2\\theta).$$\n对 $\\theta$ 求导并令其等于 $0$：\n$$\\frac{\\mathrm{d}\\ln L(\\theta)}{\\mathrm{d}\\theta} = \\frac{6}{\\theta} - \\frac{2}{1-\\theta} - \\frac{8}{1-2\\theta} = 0.$$\n通分整理分子得：\n$$6(1-\\theta)(1-2\\theta) - 2\\theta(1-2\\theta) - 8\\theta(1-\\theta) = 0 \\implies 24\\theta^2 - 28\\theta + 6 = 0 \\implies 12\\theta^2 - 14\\theta + 3 = 0.$$\n解二次方程得两根：\n$$\\theta = \\frac{14 \\pm \\sqrt{14^2 - 4\\times 12\\times 3}}{24} = \\frac{14 \\pm \\sqrt{52}}{24} = \\frac{7 \\pm \\sqrt{13}}{12}.$$\n由于 $0 < \\theta < \\frac{1}{2}$，且 $\\frac{7+\\sqrt{13}}{12} > \\frac{7+3}{12} > \\frac{1}{2}$ 应舍去；而 $\\frac{7-\\sqrt{13}}{12} \\approx 0.283 \\in \\left(0, \\frac{1}{2}\\right)$。又 $\\frac{\\mathrm{d}^2\\ln L(\\theta)}{\\mathrm{d}\\theta^2} = -\\frac{6}{\\theta^2} - \\frac{2}{(1-\\theta)^2} - \\frac{32}{(1-2\\theta)^2} < 0$，故该驻点为唯一极大值点。\n因此 $\\theta$ 的最大似然估计值为 $\\hat{\\theta}_2 = \\frac{7 - \\sqrt{13}}{12}$。",
    "steps": [
      "计算总体期望 $EX = 3 - 4\\theta$ 与样本均值 $\\bar{x} = 2$，令二者相等解得矩估计值 $\\frac{1}{4}$",
      "统计样本中 $0,1,2,3$ 各自出现次数，构造离散型似然函数 $L(\\theta) = 4\\theta^6(1-\\theta)^2(1-2\\theta)^4$",
      "取对数求导并化简为方程 $12\\theta^2 - 14\\theta + 3 = 0$，结合 $0 < \\theta < \\frac{1}{2}$ 筛选出最大似然估计值 $\\frac{7-\\sqrt{13}}{12}$"
    ],
    "keyPoints": [
      "离散型分布律的矩估计与最大似然估计",
      "估计值与估计量的区分",
      "根据参数范围取舍驻点"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2002真题",
      "矩估计",
      "最大似然估计",
      "离散总体"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-25",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设总体 $X$ 服从参数为 $p\\;(0 < p < 1)$ 的几何分布，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $p$ 的最大似然估计量。",
    "correctAnswer": "$\\hat{p} = \\frac{1}{\\bar{X}}$",
    "explanation": "参数为 $p$ 的几何分布分布律为：\n$$P\\{X = k\\} = (1-p)^{k-1}p, \\qquad k = 1, 2, \\cdots$$\n设样本观察值为 $x_1, x_2, \\cdots, x_n$（各 $x_i$ 均为正整数），写出似然函数：\n$$L(p) = \\prod_{i=1}^n (1-p)^{x_i - 1}p = p^n (1-p)^{\\sum_{i=1}^n x_i - n}.$$\n两边取自然对数：\n$$\\ln L(p) = n\\ln p + \\left(\\sum_{i=1}^n x_i - n\\right)\\ln(1-p).$$\n对 $p$ 求导并令其为 $0$：\n$$\\frac{\\mathrm{d}\\ln L(p)}{\\mathrm{d}p} = \\frac{n}{p} - \\frac{\\sum_{i=1}^n x_i - n}{1-p} = 0.$$\n去分母整理：\n$$n(1-p) = p\\left(\\sum_{i=1}^n x_i - n\\right) \\implies n = p\\sum_{i=1}^n x_i \\implies \\hat{p} = \\frac{n}{\\sum_{i=1}^n x_i} = \\frac{1}{\\bar{x}}.$$\n（当样本值不全为 $1$ 时，二阶导 $-\\frac{n}{p^2} - \\frac{\\sum x_i - n}{(1-p)^2} < 0$，该驻点为唯一极大值点。）\n将小写样本值替换为大写随机变量，得参数 $p$ 的最大似然估计量为：\n$$\\hat{p} = \\frac{1}{\\bar{X}}.$$",
    "steps": [
      "写出几何分布分布律 $P\\{X=k\\} = (1-p)^{k-1}p\\;(k=1,2,\\cdots)$",
      "构造似然函数 $L(p) = p^n(1-p)^{\\sum x_i - n}$ 并取对数",
      "对 $p$ 求导令为 $0$ 解得 $\\hat{p} = \\frac{1}{\\bar{X}}$"
    ],
    "keyPoints": [
      "几何分布的最大似然估计",
      "离散型总体似然函数构造"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "几何分布",
      "最大似然估计",
      "离散总体"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-26",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（1991）设总体 $X$ 的概率密度为 $f(x) = \\begin{cases} \\lambda \\alpha x^{\\alpha - 1} e^{-\\lambda x^\\alpha}, & x > 0 \\\\ 0, & \\text{其他} \\end{cases}$，其中 $\\lambda > 0$ 是未知参数，$\\alpha > 0$ 是已知常数，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\lambda$ 的最大似然估计量。",
    "correctAnswer": "$\\hat{\\lambda} = \\frac{n}{\\sum_{i=1}^n X_i^\\alpha}$",
    "explanation": "设样本观察值为 $x_1, x_2, \\cdots, x_n$（均满足 $x_i > 0$），似然函数为：\n$$L(\\lambda) = \\prod_{i=1}^n \\lambda \\alpha x_i^{\\alpha - 1} e^{-\\lambda x_i^\\alpha} = \\lambda^n \\alpha^n \\left(\\prod_{i=1}^n x_i\\right)^{\\alpha - 1} e^{-\\lambda \\sum_{i=1}^n x_i^\\alpha}, \\quad \\lambda > 0.$$\n两边取自然对数：\n$$\\ln L(\\lambda) = n\\ln\\lambda + n\\ln\\alpha + (\\alpha - 1)\\sum_{i=1}^n \\ln x_i - \\lambda \\sum_{i=1}^n x_i^\\alpha.$$\n对 $\\lambda$ 求导并令其为 $0$：\n$$\\frac{\\mathrm{d}\\ln L(\\lambda)}{\\mathrm{d}\\lambda} = \\frac{n}{\\lambda} - \\sum_{i=1}^n x_i^\\alpha = 0 \\implies \\hat{\\lambda} = \\frac{n}{\\sum_{i=1}^n x_i^\\alpha}.$$\n因为 $\\frac{\\mathrm{d}^2\\ln L(\\lambda)}{\\mathrm{d}\\lambda^2} = -\\frac{n}{\\lambda^2} < 0$，所以该驻点为唯一极大值点。\n因此，参数 $\\lambda$ 的最大似然估计量为：\n$$\\hat{\\lambda} = \\frac{n}{\\sum_{i=1}^n X_i^\\alpha}.$$",
    "steps": [
      "对 $x_i > 0$ 写出似然函数 $L(\\lambda)$ 并取自然对数 $\\ln L(\\lambda)$",
      "关于未知参数 $\\lambda$ 求导令为 $0$（将 $\\alpha$ 视为已知常数），解得 $\\hat{\\lambda} = \\frac{n}{\\sum_{i=1}^n X_i^\\alpha}$"
    ],
    "keyPoints": [
      "连续型总体似然函数",
      "已知常数与待估参数的区分"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1991真题",
      "最大似然估计",
      "威布尔分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-27",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设 $X_1, X_2, \\cdots, X_n$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，其中 $\\mu$ 已知，$\\sigma^2$ 未知，求参数 $\\sigma^2$ 的最大似然估计量。\n增问：若 $\\mu$ 和 $\\sigma^2$ 均未知，求参数 $\\mu$ 和 $\\sigma^2$ 的最大似然估计量。",
    "correctAnswer": "（1）$\\mu$ 已知时：$\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\mu)^2$；（2）增问（$\\mu, \\sigma^2$ 均未知）：$\\hat{\\mu} = \\bar{X},\\; \\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$",
    "explanation": "正态总体 $N(\\mu, \\sigma^2)$ 的概率密度为 $f(x) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$，似然函数为：\n$$L(\\mu, \\sigma^2) = \\prod_{i=1}^n \\frac{1}{\\sqrt{2\\pi\\sigma^2}}e^{-\\frac{(x_i-\\mu)^2}{2\\sigma^2}} = (2\\pi)^{-\\frac{n}{2}}(\\sigma^2)^{-\\frac{n}{2}}\\exp\\left[-\\frac{1}{2\\sigma^2}\\sum_{i=1}^n (x_i-\\mu)^2\\right].$$\n取自然对数得：\n$$\\ln L(\\mu, \\sigma^2) = -\\frac{n}{2}\\ln(2\\pi) - \\frac{n}{2}\\ln(\\sigma^2) - \\frac{1}{2\\sigma^2}\\sum_{i=1}^n (x_i-\\mu)^2.$$\n\n**一、主问：当 $\\mu$ 已知、$\\sigma^2$ 未知时**\n将 $\\sigma^2$ 整体视为自变量求导并令其为 $0$：\n$$\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}(\\sigma^2)} = -\\frac{n}{2\\sigma^2} + \\frac{1}{2(\\sigma^2)^2}\\sum_{i=1}^n (x_i - \\mu)^2 = 0.$$\n解得 $\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\mu)^2$（由单调性可验证当 $\\sigma^2 < \\widehat{\\sigma^2}$ 时导数 $>0$、当 $\\sigma^2 > \\widehat{\\sigma^2}$ 时导数 $<0$，确为最大值点）。\n故 $\\sigma^2$ 的最大似然估计量为：\n$$\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\mu)^2.$$\n\n**二、增问：当 $\\mu$ 和 $\\sigma^2$ 均未知时**\n分别对 $\\mu$ 与 $\\sigma^2$ 求偏导数并令为 $0$：\n$$\\begin{cases} \\dfrac{\\partial \\ln L}{\\partial \\mu} = \\dfrac{1}{\\sigma^2}\\sum_{i=1}^n (x_i - \\mu) = 0 \\\\ \\dfrac{\\partial \\ln L}{\\partial (\\sigma^2)} = -\\dfrac{n}{2\\sigma^2} + \\dfrac{1}{2(\\sigma^2)^2}\\sum_{i=1}^n (x_i - \\mu)^2 = 0 \\end{cases}$$\n由第一式得 $\\hat{\\mu} = \\frac{1}{n}\\sum_{i=1}^n x_i = \\bar{x}$；将其代入第二式得 $\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\bar{x})^2$。\n故参数 $\\mu$ 与 $\\sigma^2$ 的最大似然估计量分别为：\n$$\\hat{\\mu} = \\bar{X}, \\qquad \\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2.$$",
    "steps": [
      "写出正态总体的联合似然函数并取自然对数 $\\ln L$",
      "当 $\\mu$ 已知时，直接对 $\\sigma^2$ 求导令为 $0$，解得 $\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\mu)^2$",
      "当 $\\mu, \\sigma^2$ 均未知时，联立关于 $\\mu$ 与 $\\sigma^2$ 的两个偏导数方程，解得 $\\hat{\\mu} = \\bar{X}$ 与 $\\widehat{\\sigma^2} = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$"
    ],
    "keyPoints": [
      "正态总体单参数与双参数的最大似然估计",
      "整体视 $\\sigma^2$ 为待求变量简化求导"
    ],
    "difficulty": "基础",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "正态分布",
      "最大似然估计",
      "双参数估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-28",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（1）设总体 $X \\sim U(0, \\theta)$，参数 $\\theta\\;(\\theta > 0)$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\theta$ 的最大似然估计量。\n（2）（2015 部分）设总体 $X \\sim U(\\theta, 1)$，参数 $\\theta$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $\\theta$ 的最大似然估计量。\n（3）设总体 $X \\sim U(a, b)$，参数 $a, b$ 未知，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，求参数 $a, b$ 的最大似然估计量。",
    "correctAnswer": "（1）$\\hat{\\theta} = \\max\\{X_1, X_2, \\cdots, X_n\\}$；（2）$\\hat{\\theta} = \\min\\{X_1, X_2, \\cdots, X_n\\}$；（3）$\\hat{a} = \\min\\{X_1, X_2, \\cdots, X_n\\},\\; \\hat{b} = \\max\\{X_1, X_2, \\cdots, X_n\\}$",
    "explanation": "均匀分布的支撑区间依赖于未知参数，对参数求导恒不等于 $0$（无驻点），必须利用似然函数的单调性与定义域边界求最大值。\n\n**（1）$X \\sim U(0, \\theta)\\;(\\theta > 0)$：**\n似然函数为（区间端点延拓至闭区间 $[0, \\theta]$ 不影响结论）：\n$$L(\\theta) = \\begin{cases} \\dfrac{1}{\\theta^n}, & 0 \\le x_i \\le \\theta\\;(i=1,\\cdots,n)\\text{，即 } \\theta \\ge \\max\\{x_1, \\cdots, x_n\\} \\\\ 0, & \\text{其他} \\end{cases}$$\n当 $\\theta \\ge \\max\\{x_1, \\cdots, x_n\\}$ 时，$L(\\theta) = \\theta^{-n}$ 关于 $\\theta$ 严格单调递减，因此当 $\\theta$ 取左端点最小值 $\\max\\{x_1, \\cdots, x_n\\}$ 时 $L(\\theta)$ 达到最大。\n故 $\\theta$ 的最大似然估计量为 $\\hat{\\theta} = \\max\\{X_1, X_2, \\cdots, X_n\\}$。\n\n**（2）$X \\sim U(\\theta, 1)\\;(\\theta < 1)$：**\n似然函数为：\n$$L(\\theta) = \\begin{cases} \\dfrac{1}{(1-\\theta)^n}, & \\theta \\le x_i \\le 1\\;(i=1,\\cdots,n)\\text{，即 } \\theta \\le \\min\\{x_1, \\cdots, x_n\\} \\\\ 0, & \\text{其他} \\end{cases}$$\n当 $\\theta \\le \\min\\{x_1, \\cdots, x_n\\} < 1$ 时，$1-\\theta > 0$，随着 $\\theta$ 增大，$1-\\theta$ 减小，从而 $\\frac{1}{(1-\\theta)^n}$ 关于 $\\theta$ 严格单调递增，因此当 $\\theta$ 取右端点最大值 $\\min\\{x_1, \\cdots, x_n\\}$ 时 $L(\\theta)$ 达到最大。\n故 $\\theta$ 的最大似然估计量为 $\\hat{\\theta} = \\min\\{X_1, X_2, \\cdots, X_n\\}$。\n\n**（3）$X \\sim U(a, b)\\;(a < b)$：**\n似然函数为：\n$$L(a, b) = \\begin{cases} \\dfrac{1}{(b-a)^n}, & a \\le \\min\\{x_1, \\cdots, x_n\\} \\text{ 且 } b \\ge \\max\\{x_1, \\cdots, x_n\\} \\\\ 0, & \\text{其他} \\end{cases}$$\n要使 $L(a, b) = \\frac{1}{(b-a)^n}$ 达到最大，等价于在约束 $a \\le \\min\\{x_1, \\cdots, x_n\\}$ 且 $b \\ge \\max\\{x_1, \\cdots, x_n\\}$ 下使区间长度 $b - a$ 最小。显然当 $a$ 取上界 $\\min\\{x_1, \\cdots, x_n\\}$ 且 $b$ 取下界 $\\max\\{x_1, \\cdots, x_n\\}$ 时，$b - a$ 取得最小值。\n故 $a, b$ 的最大似然估计量分别为 $\\hat{a} = \\min\\{X_1, X_2, \\cdots, X_n\\}$，$\\hat{b} = \\max\\{X_1, X_2, \\cdots, X_n\\}$。",
    "steps": [
      "写出各均匀分布含边界示性条件的似然函数 $L(\\theta)$ 或 $L(a,b)$，确认其导数方程无解",
      "第（1）问利用 $\\theta^{-n}$ 单调递减，在约束 $\\theta \\ge \\max\\{x_i\\}$ 下取左端点得 $\\hat{\\theta} = \\max\\{X_1, \\cdots, X_n\\}$",
      "第（2）问利用 $(1-\\theta)^{-n}$ 单调递增，在约束 $\\theta \\le \\min\\{x_i\\}$ 下取右端点得 $\\hat{\\theta} = \\min\\{X_1, \\cdots, X_n\\}$",
      "第（3）问在 $a \\le \\min\\{x_i\\}$ 且 $b \\ge \\max\\{x_i\\}$ 下最小化 $b-a$，同时取到两端最值"
    ],
    "keyPoints": [
      "非正则型分布（边界含参数）的最大似然估计",
      "利用单调性与样本最值统计量求解"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2015真题",
      "均匀分布",
      "边界参数",
      "最大似然估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-29",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2006）设总体 $X$ 的概率密度为 $f(x) = \\begin{cases} \\theta, & 0 < x < 1 \\\\ 1 - \\theta, & 1 \\le x < 2 \\\\ 0, & \\text{其他} \\end{cases}$，其中 $\\theta\\;(0 < \\theta < 1)$ 是未知参数，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，记 $N$ 为样本值 $x_1, x_2, \\cdots, x_n$ 中小于 $1$ 的个数，求 $\\theta$ 的最大似然估计。",
    "correctAnswer": "$\\hat{\\theta} = \\frac{N}{n}$（当 $0 < N < n$ 时；若 $N=0$ 或 $N=n$，在开区间 $(0,1)$ 内不存在最大似然估计，闭延拓下仍为 $\\frac{N}{n}$）",
    "explanation": "由于 $x_1, x_2, \\cdots, x_n$ 均取自区间 $(0, 2)$，其中共有 $N$ 个样本值落在 $(0, 1)$ 内（对应的密度值为 $\\theta$），其余 $n - N$ 个样本值落在 $[1, 2)$ 内（对应的密度值为 $1 - \\theta$）。\n\n由此写出似然函数：\n$$L(\\theta) = \\prod_{i=1}^n f(x_i; \\theta) = \\theta^N (1-\\theta)^{n-N}, \\qquad 0 < \\theta < 1.$$\n- **当 $0 < N < n$ 时**：两边取自然对数：\n  $$\\ln L(\\theta) = N\\ln\\theta + (n-N)\\ln(1-\\theta).$$\n  对 $\\theta$ 求导并令其为 $0$：\n  $$\\frac{\\mathrm{d}\\ln L(\\theta)}{\\mathrm{d}\\theta} = \\frac{N}{\\theta} - \\frac{n-N}{1-\\theta} = 0 \\implies N(1-\\theta) = (n-N)\\theta \\implies \\hat{\\theta} = \\frac{N}{n}.$$\n  检验二阶导数 $\\frac{\\mathrm{d}^2\\ln L(\\theta)}{\\mathrm{d}\\theta^2} = -\\frac{N}{\\theta^2} - \\frac{n-N}{(1-\\theta)^2} < 0$，故 $\\hat{\\theta} = \\frac{N}{n}$ 为唯一极大值点。\n- **边界情形补充**：若 $N = 0$，则 $L(\\theta) = (1-\\theta)^n$ 在 $(0,1)$ 上严格单调递减；若 $N = n$，则 $L(\\theta) = \\theta^n$ 在 $(0,1)$ 上严格单调递增，此时在开区间 $(0,1)$ 内最大值点取不到，若延拓至闭区间 $[0,1]$，极大值点仍统一表示为 $\\frac{N}{n}$。",
    "steps": [
      "区分样本值落入 $(0,1)$ 与 $[1,2)$ 的个数分别为 $N$ 和 $n-N$，写出似然函数 $L(\\theta) = \\theta^N(1-\\theta)^{n-N}$",
      "当 $0<N<n$ 时取对数求导并令导数为 $0$，解得 $\\hat{\\theta} = \\frac{N}{n}$",
      "补充说明 $N=0$ 或 $N=n$ 时的单调性与边界情形"
    ],
    "keyPoints": [
      "分段密度函数的似然函数构造",
      "计数变量与极大似然估计"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2006真题",
      "分段密度",
      "最大似然估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-30",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（880）设总体的概率密度为 $f(x) = \\begin{cases} \\frac{1}{\\lambda_2}e^{-\\frac{x-\\lambda_1}{\\lambda_2}}, & x > \\lambda_1 \\\\ 0, & \\text{其他} \\end{cases}$，$\\lambda_2 > 0$，$X_1, X_2, \\cdots, X_n$ 是来自总体 $X$ 的简单随机样本，\n（1）当 $\\lambda_1$ 已知时，求 $\\lambda_2$ 的矩估计量和最大似然估计量；\n（2）求 $\\lambda_1, \\lambda_2$ 的矩估计量和最大似然估计量。",
    "correctAnswer": "（1）$\\lambda_2$ 的矩估计量与最大似然估计量均为 $\\hat{\\lambda}_2 = \\bar{X} - \\lambda_1$；（2）矩估计量：$\\hat{\\lambda}_1 = \\bar{X} - \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2},\\; \\hat{\\lambda}_2 = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}$；最大似然估计量：$\\tilde{\\lambda}_1 = \\min\\{X_1, \\cdots, X_n\\},\\; \\tilde{\\lambda}_2 = \\bar{X} - \\min\\{X_1, \\cdots, X_n\\}$",
    "explanation": "首先计算总体的期望与方差。令 $Y = X - \\lambda_1$，则 $Y$ 的概率密度为 $f_Y(y) = \\frac{1}{\\lambda_2}e^{-y/\\lambda_2}\\;(y>0)$，即 $X - \\lambda_1 \\sim E\\left(\\frac{1}{\\lambda_2}\\right)$（均值为 $\\lambda_2$ 的指数分布）。因此：\n$$EX = \\lambda_1 + EY = \\lambda_1 + \\lambda_2, \\qquad DX = DY = \\lambda_2^2.$$\n\n**（1）当 $\\lambda_1$ 已知时，求 $\\lambda_2$ 的矩估计量和最大似然估计量：**\n- **矩估计**：令 $EX = \\bar{X}$，即 $\\lambda_1 + \\lambda_2 = \\bar{X}$，解得 $\\lambda_2$ 的矩估计量为：\n  $$\\hat{\\lambda}_2 = \\bar{X} - \\lambda_1.$$\n- **最大似然估计**：对满足 $x_i > \\lambda_1$ 的样本观察值，似然函数为：\n  $$L(\\lambda_2) = \\prod_{i=1}^n \\frac{1}{\\lambda_2}e^{-\\frac{x_i-\\lambda_1}{\\lambda_2}} = \\lambda_2^{-n}\\exp\\left[-\\frac{1}{\\lambda_2}\\sum_{i=1}^n (x_i - \\lambda_1)\\right].$$\n  取自然对数：\n  $$\\ln L(\\lambda_2) = -n\\ln\\lambda_2 - \\frac{1}{\\lambda_2}\\sum_{i=1}^n (x_i - \\lambda_1).$$\n  对 $\\lambda_2$ 求导并令其为 $0$：\n  $$\\frac{\\mathrm{d}\\ln L(\\lambda_2)}{\\mathrm{d}\\lambda_2} = -\\frac{n}{\\lambda_2} + \\frac{1}{\\lambda_2^2}\\sum_{i=1}^n (x_i - \\lambda_1) = 0 \\implies \\hat{\\lambda}_2 = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\lambda_1) = \\bar{x} - \\lambda_1.$$\n  由 $\\lambda_2 < \\bar{x} - \\lambda_1$ 时导数 $>0$、$\\lambda_2 > \\bar{x} - \\lambda_1$ 时导数 $<0$，可知其为最大值点。故 $\\lambda_2$ 的最大似然估计量为 $\\hat{\\lambda}_2 = \\bar{X} - \\lambda_1$。\n\n**（2）当 $\\lambda_1, \\lambda_2$ 均未知时，求 $\\lambda_1, \\lambda_2$ 的矩估计量和最大似然估计量：**\n- **矩估计**：联立 $EX = \\bar{X}$ 与 $DX = B_2 = \\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2$（等价于 $EX^2 = A_2$）：\n  $$\\begin{cases} \\lambda_1 + \\lambda_2 = \\bar{X} \\\\ \\lambda_2^2 = \\dfrac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2 \\end{cases}$$\n  因 $\\lambda_2 > 0$，解得矩估计量为：\n  $$\\hat{\\lambda}_2 = \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}, \\qquad \\hat{\\lambda}_1 = \\bar{X} - \\sqrt{\\frac{1}{n}\\sum_{i=1}^n (X_i - \\bar{X})^2}.$$\n- **最大似然估计**：写出似然函数（支撑集延拓至闭区间 $[\\lambda_1, +\\infty)$）：\n  $$L(\\lambda_1, \\lambda_2) = \\begin{cases} \\lambda_2^{-n}\\exp\\left[-\\dfrac{1}{\\lambda_2}\\sum_{i=1}^n (x_i - \\lambda_1)\\right], & \\lambda_1 \\le \\min\\{x_1, \\cdots, x_n\\},\\; \\lambda_2 > 0 \\\\ 0, & \\text{其他} \\end{cases}$$\n  先固定任意 $\\lambda_2 > 0$，对数似然函数 $\\ln L(\\lambda_1, \\lambda_2) = -n\\ln\\lambda_2 - \\frac{1}{\\lambda_2}\\sum_{i=1}^n (x_i - \\lambda_1)$ 关于 $\\lambda_1$ 的偏导数为 $\\frac{n}{\\lambda_2} > 0$，即 $L(\\lambda_1, \\lambda_2)$ 关于 $\\lambda_1$ 严格单调递增。因此，在约束 $\\lambda_1 \\le \\min\\{x_1, \\cdots, x_n\\}$ 下，当 $\\lambda_1$ 取右端点 $\\tilde{\\lambda}_1 = \\min\\{x_1, \\cdots, x_n\\}$ 时达到最大。\n  将 $\\tilde{\\lambda}_1 = \\min\\{x_1, \\cdots, x_n\\}$ 代入，再对 $\\lambda_2$ 求导令为 $0$，得：\n  $$-\\frac{n}{\\lambda_2} + \\frac{1}{\\lambda_2^2}\\sum_{i=1}^n (x_i - \\tilde{\\lambda}_1) = 0 \\implies \\tilde{\\lambda}_2 = \\frac{1}{n}\\sum_{i=1}^n (x_i - \\min\\{x_1, \\cdots, x_n\\}) = \\bar{x} - \\min\\{x_1, \\cdots, x_n\\}.$$\n  综上，$\\lambda_1, \\lambda_2$ 的最大似然估计量分别为：\n  $$\\tilde{\\lambda}_1 = \\min\\{X_1, X_2, \\cdots, X_n\\}, \\qquad \\tilde{\\lambda}_2 = \\bar{X} - \\min\\{X_1, X_2, \\cdots, X_n\\}.$$",
    "steps": [
      "通过移位变换 $Y = X - \\lambda_1 \\sim E(1/\\lambda_2)$ 算得 $EX = \\lambda_1 + \\lambda_2$，$DX = \\lambda_2^2$",
      "第（1）问 $\\lambda_1$ 已知时，由矩估计及对数似然求导均得到 $\\hat{\\lambda}_2 = \\bar{X} - \\lambda_1$",
      "第（2）问矩估计联立 $EX=\\bar{X}$ 与 $DX=B_2$ 解出 $\\hat{\\lambda}_1, \\hat{\\lambda}_2$",
      "第（2）问最大似然估计先固定 $\\lambda_2$ 利用关于 $\\lambda_1$ 单调递增取边界 $\\tilde{\\lambda}_1 = \\min\\{X_i\\}$，再对 $\\lambda_2$ 求导得 $\\tilde{\\lambda}_2 = \\bar{X} - \\min\\{X_i\\}$"
    ],
    "keyPoints": [
      "移位指数分布的期望与方差",
      "含位置边界参数的双参数最大似然估计",
      "矩估计与最大似然估计的综合对比"
    ],
    "difficulty": "提高",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "880习题",
      "移位指数分布",
      "边界参数",
      "双参数估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-5-31",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一",
      "数三"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "（2022）设 $X_1, X_2, \\cdots, X_n$ 为来自均值为 $\\theta$ 的指数分布总体的简单随机样本，$Y_1, Y_2, \\cdots, Y_m$ 为来自均值为 $2\\theta$ 的指数分布总体的简单随机样本，且两样本相互独立，其中 $\\theta\\;(\\theta > 0)$ 为未知参数，利用样本 $X_1, X_2, \\cdots, X_n, Y_1, Y_2, \\cdots, Y_m$，求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}$，并求 $D(\\hat{\\theta})$。",
    "correctAnswer": "$\\hat{\\theta} = \\frac{1}{n+m}\\left(\\sum_{i=1}^n X_i + \\frac{1}{2}\\sum_{j=1}^m Y_j\\right)$；$D(\\hat{\\theta}) = \\frac{\\theta^2}{n+m}$",
    "explanation": "**一、求参数 $\\theta$ 的最大似然估计量 $\\hat{\\theta}$：**\n由题意，总体 $X$（均值为 $\\theta$）与总体 $Y$（均值为 $2\\theta$）的概率密度分别为：\n$$f_X(x) = \\begin{cases} \\dfrac{1}{\\theta}e^{-\\frac{x}{\\theta}}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}, \\qquad f_Y(y) = \\begin{cases} \\dfrac{1}{2\\theta}e^{-\\frac{y}{2\\theta}}, & y > 0 \\\\ 0, & y \\le 0 \\end{cases}.$$\n因为两样本相互独立，对样本观察值 $x_i > 0\\;(i=1,\\cdots,n)$ 与 $y_j > 0\\;(j=1,\\cdots,m)$，联合似然函数为：\n$$L(\\theta) = \\left(\\prod_{i=1}^n \\frac{1}{\\theta}e^{-\\frac{x_i}{\\theta}}\\right)\\left(\\prod_{j=1}^m \\frac{1}{2\\theta}e^{-\\frac{y_j}{2\\theta}}\\right) = \\frac{1}{2^m \\theta^{n+m}}\\exp\\left[-\\frac{1}{\\theta}\\left(\\sum_{i=1}^n x_i + \\frac{1}{2}\\sum_{j=1}^m y_j\\right)\\right].$$\n两边取自然对数：\n$$\\ln L(\\theta) = -m\\ln 2 - (n+m)\\ln\\theta - \\frac{1}{\\theta}\\left(\\sum_{i=1}^n x_i + \\frac{1}{2}\\sum_{j=1}^m y_j\\right).$$\n对 $\\theta$ 求导并令其等于 $0$：\n$$\\frac{\\mathrm{d}\\ln L(\\theta)}{\\mathrm{d}\\theta} = -\\frac{n+m}{\\theta} + \\frac{1}{\\theta^2}\\left(\\sum_{i=1}^n x_i + \\frac{1}{2}\\sum_{j=1}^m y_j\\right) = 0.$$\n解得 $\\theta = \\frac{1}{n+m}\\left(\\sum_{i=1}^n x_i + \\frac{1}{2}\\sum_{j=1}^m y_j\\right)$。由于当 $\\theta$ 小于该驻点时导数 $>0$、大于该驻点时导数 $<0$，故其为唯一最大值点。\n因此，参数 $\\theta$ 的最大似然估计量为：\n$$\\hat{\\theta} = \\frac{1}{n+m}\\left(\\sum_{i=1}^n X_i + \\frac{1}{2}\\sum_{j=1}^m Y_j\\right) = \\frac{2\\sum_{i=1}^n X_i + \\sum_{j=1}^m Y_j}{2(n+m)}.$$\n\n**二、求估计量 $\\hat{\\theta}$ 的方差 $D(\\hat{\\theta})$：**\n由于均值为 $\\lambda^{-1}$ 的指数分布方差为 $(\\lambda^{-1})^2$，故 $D(X_i) = \\theta^2$，$D(Y_j) = (2\\theta)^2 = 4\\theta^2$。\n又 $X_1, \\cdots, X_n, Y_1, \\cdots, Y_m$ 全部相互独立，利用方差的线性性质：\n$$D(\\hat{\\theta}) = \\frac{1}{(n+m)^2}\\left[\\sum_{i=1}^n D(X_i) + \\left(\\frac{1}{2}\\right)^2\\sum_{j=1}^m D(Y_j)\\right] = \\frac{1}{(n+m)^2}\\left(n\\theta^2 + \\frac{1}{4}\\cdot m \\cdot 4\\theta^2\\right) = \\frac{(n+m)\\theta^2}{(n+m)^2} = \\frac{\\theta^2}{n+m}.$$",
    "steps": [
      "写出均值为 $\\theta$ 和 $2\\theta$ 的两个指数分布的概率密度，由样本独立性构造联合似然函数 $L(\\theta)$",
      "取对数求导令为 $0$，解得最大似然估计量 $\\hat{\\theta} = \\frac{1}{n+m}\\left(\\sum_{i=1}^n X_i + \\frac{1}{2}\\sum_{j=1}^m Y_j\\right)$",
      "利用指数分布方差 $D(X_i)=\\theta^2$、$D(Y_j)=4\\theta^2$ 与样本独立性，计算得 $D(\\hat{\\theta}) = \\frac{\\theta^2}{n+m}$"
    ],
    "keyPoints": [
      "双样本联合最大似然估计",
      "指数分布期望与方差的关系",
      "估计量的方差计算"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2022真题",
      "双样本",
      "指数分布",
      "最大似然估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-01",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "设随机变量 $X$ 在 $(0,\\theta)$ $(\\theta > 0)$ 上服从均匀分布，其中 $\\theta$ 未知，$X_1, X_2, \\cdots, X_n$ 为总体 $X$ 的简单随机样本，$\\hat{\\theta}$ 为 $\\theta$ 的最大似然估计量，若 $k\\hat{\\theta}$ 为 $\\theta$ 的无偏估计量，则 $k =$（ ）。",
    "options": [
      "A. $\\frac{n}{n+1}$",
      "B. $\\frac{n+1}{n}$",
      "C. $\\frac{1}{n+1}$",
      "D. $\\frac{1}{n}$"
    ],
    "correctAnswer": "B",
    "explanation": "**第一步：求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}$。**\n总体 $X$ 的概率密度为：\n$$f(x; \\theta) = \\begin{cases} \\dfrac{1}{\\theta}, & 0 < x < \\theta \\\\ 0, & \\text{其他} \\end{cases}$$\n设样本观察值为 $x_1, x_2, \\cdots, x_n$，则似然函数为：\n$$L(\\theta) = \\prod_{i=1}^{n} f(x_i; \\theta) = \\begin{cases} \\dfrac{1}{\\theta^n}, & 0 < x_i < \\theta \\; (i = 1, 2, \\cdots, n) \\\\ 0, & \\text{其他} \\end{cases}$$\n当 $\\theta > \\max\\{x_1, x_2, \\cdots, x_n\\}$ 时，$L(\\theta) = \\theta^{-n}$ 关于 $\\theta$ 严格单调递减，因此在区间边界处取到极大趋势（按考研习惯记为最大似然估计量）：\n$$\\hat{\\theta} = \\max\\{X_1, X_2, \\cdots, X_n\\} = X_{(n)}.$$\n\n**第二步：求 $E(\\hat{\\theta})$ 并利用无偏性确定 $k$。**\n记 $M = X_{(n)}$，由最大值分布公式，$M$ 的分布函数为：\n$$F_M(x) = [F_X(x)]^n = \\begin{cases} 0, & x \\le 0 \\\\ \\left(\\dfrac{x}{\\theta}\\right)^n, & 0 < x < \\theta \\\\ 1, & x \\ge \\theta \\end{cases}$$\n求导得 $M$ 的概率密度为：\n$$f_M(x) = \\begin{cases} \\dfrac{n x^{n-1}}{\\theta^n}, & 0 < x < \\theta \\\\ 0, & \\text{其他} \\end{cases}$$\n计算 $\\hat{\\theta}$ 的数学期望：\n$$E(\\hat{\\theta}) = E(M) = \\int_{0}^{\\theta} x \\cdot \\frac{n x^{n-1}}{\\theta^n}\\,\\mathrm{d}x = \\frac{n}{\\theta^n} \\left[\\frac{x^{n+1}}{n+1}\\right]_{0}^{\\theta} = \\frac{n}{n+1}\\theta.$$\n由于 $k\\hat{\\theta}$ 为 $\\theta$ 的无偏估计量，必须满足 $E(k\\hat{\\theta}) = \\theta$，即：\n$$k E(\\hat{\\theta}) = k \\cdot \\frac{n}{n+1}\\theta = \\theta \\implies k = \\frac{n+1}{n}.$$\n注：此时无偏估计量 $\\tilde{\\theta} = \\frac{n+1}{n}X_{(n)}$ 的均方误差等于其方差，$D(\\tilde{\\theta}) = \\frac{\\theta^2}{n(n+2)}$，而原最大似然估计量 $\\hat{\\theta}$ 有偏，其均方误差为 $\\mathrm{MSE}(\\hat{\\theta}) = D(\\hat{\\theta}) + [E(\\hat{\\theta})-\\theta]^2 = \\frac{2\\theta^2}{(n+1)(n+2)}$。\n故选 B。",
    "steps": [
      "写出 $U(0,\\theta)$ 样本的似然函数 $L(\\theta) = \\theta^{-n}$，求得最大似然估计量 $\\hat{\\theta} = \\max\\{X_1, \\cdots, X_n\\}$",
      "利用最大值分布公式求出 $\\hat{\\theta}$ 的概率密度 $f_M(x) = \\frac{nx^{n-1}}{\\theta^n}$ ($0 < x < \\theta$)",
      "积分计算 $E(\\hat{\\theta}) = \\frac{n}{n+1}\\theta$，由 $E(k\\hat{\\theta}) = \\theta$ 解得 $k = \\frac{n+1}{n}$"
    ],
    "keyPoints": [
      "最大似然估计量（非正则型/支撑集含参数）",
      "次序统计量最大值分布",
      "无偏估计量"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "最大似然估计",
      "无偏性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-02",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设总体 $X$ 是区间 $(\\theta, \\theta+1)$ 上的均匀分布，从总体 $X$ 中抽取简单随机样本 $X_1, X_2, \\cdots, X_n$，对未知参数 $\\theta$，给出两个估计：$\\hat{\\theta}_1 = \\frac{1}{n}\\sum_{i=1}^n X_i - \\frac{1}{2}$，$\\hat{\\theta}_2 = \\max\\{X_1, X_2, \\cdots, X_n\\} - \\frac{n}{n+1}$，（1）试证明 $\\hat{\\theta}_1$ 和 $\\hat{\\theta}_2$ 都是 $\\theta$ 的无偏估计；（2）试比较 $\\hat{\\theta}_1$ 和 $\\hat{\\theta}_2$ 的有效性（$n \\ge 2$）。",
    "correctAnswer": "（1）$E(\\hat{\\theta}_1) = E(\\hat{\\theta}_2) = \\theta$，均是无偏估计；（2）$D(\\hat{\\theta}_1) = \\frac{1}{12n}$，$D(\\hat{\\theta}_2) = \\frac{n}{(n+1)^2(n+2)}$；当 $2 \\le n \\le 7$ 时，$D(\\hat{\\theta}_1) < D(\\hat{\\theta}_2)$，$\\hat{\\theta}_1$ 较 $\\hat{\\theta}_2$ 更有效；当 $n \\ge 8$ 时，$D(\\hat{\\theta}_2) < D(\\hat{\\theta}_1)$，$\\hat{\\theta}_2$ 较 $\\hat{\\theta}_1$ 更有效",
    "explanation": "**（1）证明无偏性：**\n因为总体 $X \\sim U(\\theta, \\theta+1)$，所以：\n$$E(X) = \\frac{\\theta + (\\theta+1)}{2} = \\theta + \\frac{1}{2}, \\qquad D(X) = \\frac{[(\\theta+1) - \\theta]^2}{12} = \\frac{1}{12}.$$\n对 $\\hat{\\theta}_1 = \\overline{X} - \\frac{1}{2}$，由期望的线性性质得：\n$$E(\\hat{\\theta}_1) = E(\\overline{X}) - \\frac{1}{2} = E(X) - \\frac{1}{2} = \\left(\\theta + \\frac{1}{2}\\right) - \\frac{1}{2} = \\theta,$$\n故 $\\hat{\\theta}_1$ 是 $\\theta$ 的无偏估计。\n\n对 $\\hat{\\theta}_2 = X_{(n)} - \\frac{n}{n+1}$，令 $Y_i = X_i - \\theta$ $(i = 1, 2, \\cdots, n)$，则 $Y_1, Y_2, \\cdots, Y_n$ 独立同分布于 $U(0, 1)$，且 $X_{(n)} = Y_{(n)} + \\theta$。\n$Y_{(n)}$ 的分布函数为 $F_{Y_{(n)}}(y) = y^n$ $(0 < y < 1)$，概率密度为 $f_{Y_{(n)}}(y) = n y^{n-1}$ $(0 < y < 1)$。\n因此：\n$$E(Y_{(n)}) = \\int_{0}^{1} y \\cdot n y^{n-1}\\,\\mathrm{d}y = \\frac{n}{n+1},$$\n从而 $E(X_{(n)}) = E(Y_{(n)}) + \\theta = \\theta + \\frac{n}{n+1}$，故：\n$$E(\\hat{\\theta}_2) = E(X_{(n)}) - \\frac{n}{n+1} = \\theta,$$\n即 $\\hat{\\theta}_2$ 也是 $\\theta$ 的无偏估计。\n\n**（2）比较有效性（比较方差大小）：**\n由于 $\\hat{\\theta}_1, \\hat{\\theta}_2$ 均无偏，方差（均方误差）越小越有效。\n计算 $\\hat{\\theta}_1$ 的方差：\n$$D(\\hat{\\theta}_1) = D\\left(\\overline{X} - \\frac{1}{2}\\right) = D(\\overline{X}) = \\frac{D(X)}{n} = \\frac{1}{12n}.$$\n计算 $\\hat{\\theta}_2$ 的方差：\n$$E(Y_{(n)}^2) = \\int_{0}^{1} y^2 \\cdot n y^{n-1}\\,\\mathrm{d}y = \\frac{n}{n+2},$$\n$$D(\\hat{\\theta}_2) = D(X_{(n)}) = D(Y_{(n)}) = E(Y_{(n)}^2) - [E(Y_{(n)})]^2 = \\frac{n}{n+2} - \\left(\\frac{n}{n+1}\\right)^2 = \\frac{n(n+1)^2 - n^2(n+2)}{(n+1)^2(n+2)} = \\frac{n}{(n+1)^2(n+2)}.$$\n\n作差比较 $D(\\hat{\\theta}_1)$ 与 $D(\\hat{\\theta}_2)$（$n \\ge 2$）：\n$$D(\\hat{\\theta}_1) - D(\\hat{\\theta}_2) = \\frac{1}{12n} - \\frac{n}{(n+1)^2(n+2)} = \\frac{(n+1)^2(n+2) - 12n^2}{12n(n+1)^2(n+2)} = \\frac{n^3 - 8n^2 + 5n + 2}{12n(n+1)^2(n+2)} = \\frac{(n - 1)(n^2 - 7n - 2)}{12n(n+1)^2(n+2)}.$$\n因为 $n \\ge 2$，所以分母及 $n - 1$ 均大于 $0$，只需判断 $g(n) = n^2 - 7n - 2$ 的符号：\n方程 $n^2 - 7n - 2 = 0$ 的正根为 $n_0 = \\frac{7 + \\sqrt{57}}{2} \\approx 7.275$。\n- 当 $2 \\le n \\le 7$ 时，$g(n) < 0$，即 $D(\\hat{\\theta}_1) < D(\\hat{\\theta}_2)$，此时 $\\hat{\\theta}_1$ 较 $\\hat{\\theta}_2$ 更有效；\n- 当 $n \\ge 8$ 时，$g(n) > 0$，即 $D(\\hat{\\theta}_2) < D(\\hat{\\theta}_1)$，此时 $\\hat{\\theta}_2$ 较 $\\hat{\\theta}_1$ 更有效。",
    "steps": [
      "求 $X \\sim U(\\theta, \\theta+1)$ 的期望 $\\theta+\\frac{1}{2}$ 与方差 $\\frac{1}{12}$，验证 $E(\\hat{\\theta}_1) = \\theta$",
      "作平移变换 $Y_i = X_i - \\theta \\sim U(0,1)$，求得 $E(Y_{(n)}) = \\frac{n}{n+1}$，从而证明 $E(\\hat{\\theta}_2) = \\theta$",
      "分别计算 $D(\\hat{\\theta}_1) = \\frac{1}{12n}$ 与 $D(\\hat{\\theta}_2) = \\frac{n}{(n+1)^2(n+2)}$",
      "作差因式分解为 $\\frac{(n-1)(n^2-7n-2)}{12n(n+1)^2(n+2)}$，分 $2 \\le n \\le 7$ 与 $n \\ge 8$ 两种情形比较有效性"
    ],
    "keyPoints": [
      "无偏估计的判定",
      "有效性与方差比较",
      "次序统计量的期望与方差"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "均匀分布",
      "无偏性",
      "有效性",
      "分类讨论"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-03",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "设总体 $X$ 的分布函数为 $F(x) = \\begin{cases} 1 - e^{-\\frac{x^2}{\\theta}}, & x \\ge 0 \\\\ 0, & x < 0 \\end{cases}$，其中 $\\theta > 0$ 是未知参数，从总体 $X$ 中抽取简单随机样本 $X_1, X_2, \\cdots, X_n$，（1）求 $EX$ 和 $E(X^2)$；（2）求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}_n$；（3）是否存在实数 $a$，使得对任何 $\\varepsilon > 0$，都有 $\\lim_{n \\to \\infty} P\\left\\{|\\hat{\\theta}_n - a| \\ge \\varepsilon\\right\\} = 0$。",
    "correctAnswer": "（1）$EX = \\frac{\\sqrt{\\pi\\theta}}{2}$，$E(X^2) = \\theta$；（2）$\\hat{\\theta}_n = \\frac{1}{n}\\sum_{i=1}^n X_i^2$；（3）存在，实数 $a = \\theta$",
    "explanation": "**（1）求 $EX$ 和 $E(X^2)$：**\n对分布函数 $F(x)$ 求导，得总体 $X$ 的概率密度函数：\n$$f(x) = \\begin{cases} \\dfrac{2x}{\\theta} e^{-\\frac{x^2}{\\theta}}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}$$\n计算 $EX$（令 $t = \\frac{x}{\\sqrt{\\theta}}$，并利用分部积分与泊松积分 $\\int_0^{+\\infty} e^{-t^2}\\,\\mathrm{d}t = \\frac{\\sqrt{\\pi}}{2}$）：\n$$E(X) = \\int_{0}^{+\\infty} x \\cdot \\frac{2x}{\\theta} e^{-\\frac{x^2}{\\theta}}\\,\\mathrm{d}x = \\sqrt{\\theta} \\int_{0}^{+\\infty} t \\cdot 2t e^{-t^2}\\,\\mathrm{d}t = \\sqrt{\\theta}\\left(\\left[-t e^{-t^2}\\right]_{0}^{+\\infty} + \\int_{0}^{+\\infty} e^{-t^2}\\,\\mathrm{d}t\\right) = \\frac{\\sqrt{\\pi\\theta}}{2}.$$\n计算 $E(X^2)$（令 $u = \\frac{x^2}{\\theta}$，则 $\\mathrm{d}u = \\frac{2x}{\\theta}\\,\\mathrm{d}x$）：\n$$E(X^2) = \\int_{0}^{+\\infty} x^2 \\cdot \\frac{2x}{\\theta} e^{-\\frac{x^2}{\\theta}}\\,\\mathrm{d}x = \\int_{0}^{+\\infty} \\theta u e^{-u}\\,\\mathrm{d}u = \\theta.$$\n（亦可注意到 $Y = X^2$ 的分布函数为 $F_Y(y) = 1 - e^{-y/\\theta}$ ($y \\ge 0$)，即 $X^2$ 服从参数为 $\\frac{1}{\\theta}$ 的指数分布，故 $E(X^2) = \\theta$，$D(X^2) = \\theta^2$。）\n\n**（2）求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}_n$：**\n对样本观察值 $x_1, x_2, \\cdots, x_n$（$x_i > 0$），似然函数为：\n$$L(\\theta) = \\prod_{i=1}^{n} \\frac{2x_i}{\\theta} e^{-\\frac{x_i^2}{\\theta}} = \\left(\\frac{2}{\\theta}\\right)^n \\left(\\prod_{i=1}^{n} x_i\\right) e^{-\\frac{1}{\\theta}\\sum_{i=1}^{n} x_i^2}.$$\n取对数得：\n$$\\ln L(\\theta) = n\\ln 2 - n\\ln\\theta + \\sum_{i=1}^{n} \\ln x_i - \\frac{1}{\\theta}\\sum_{i=1}^{n} x_i^2.$$\n关于 $\\theta$ 求导并令导数为 $0$：\n$$\\frac{\\mathrm{d}\\ln L(\\theta)}{\\mathrm{d}\\theta} = -\\frac{n}{\\theta} + \\frac{1}{\\theta^2}\\sum_{i=1}^{n} x_i^2 = 0 \\implies \\theta = \\frac{1}{n}\\sum_{i=1}^{n} x_i^2.$$\n由于 $\\theta < \\frac{1}{n}\\sum x_i^2$ 时导数大于 $0$，$\\theta > \\frac{1}{n}\\sum x_i^2$ 时导数小于 $0$，故该驻点为唯一极大值点。因此 $\\theta$ 的最大似然估计量为：\n$$\\hat{\\theta}_n = \\frac{1}{n}\\sum_{i=1}^{n} X_i^2.$$\n\n**（3）判断是否存在实数 $a$ 使 $\\hat{\\theta}_n$ 依概率收敛于 $a$：**\n存在实数 $a = \\theta$。\n理由：由于 $X_1, X_2, \\cdots, X_n$ 独立同分布，所以 $X_1^2, X_2^2, \\cdots, X_n^2$ 也独立同分布，且 $E(X_i^2) = \\theta$ 存在有限（且 $D(X_i^2) = \\theta^2$ 有限）。由辛钦大数定律（或切比雪夫不等式：$E(\\hat{\\theta}_n) = \\theta$，$\\lim_{n\\to\\infty} D(\\hat{\\theta}_n) = \\lim_{n\\to\\infty} \\frac{\\theta^2}{n} = 0$），当 $n \\to \\infty$ 时，$\\hat{\\theta}_n = \\frac{1}{n}\\sum_{i=1}^{n} X_i^2$ 依概率收敛于 $\\theta$，即对任意 $\\varepsilon > 0$，均有：\n$$\\lim_{n \\to \\infty} P\\left\\{|\\hat{\\theta}_n - \\theta| \\ge \\varepsilon\\right\\} = 0.$$\n这也说明 $\\hat{\\theta}_n$ 是 $\\theta$ 的无偏且相合（一致）估计量。",
    "steps": [
      "对 $F(x)$ 求导得概率密度 $f(x)$，分别利用高斯积分和换元法求得 $E(X) = \\frac{\\sqrt{\\pi\\theta}}{2}$ 与 $E(X^2) = \\theta$",
      "构造似然函数 $L(\\theta)$，取对数求导解驻点得到最大似然估计量 $\\hat{\\theta}_n = \\frac{1}{n}\\sum_{i=1}^n X_i^2$",
      "利用辛钦大数定律（或检验 $E(\\hat{\\theta}_n)=\\theta,\\; \\lim_{n\\to\\infty}D(\\hat{\\theta}_n)=0$）证明存在 $a = \\theta$ 使依概率收敛成立"
    ],
    "keyPoints": [
      "最大似然估计",
      "相合估计量（依概率收敛）",
      "辛钦大数定律"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2014真题",
      "最大似然估计",
      "相合性",
      "大数定律"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-04",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "设一批零件长度服从正态分布 $N(\\mu, \\sigma^2)$，其中 $\\mu, \\sigma^2$ 均未知，现从中随机抽取 $16$ 个零件，测得样本均值 $\\bar{x} = 20(\\mathrm{cm})$，样本标准差 $S = 1(\\mathrm{cm})$，则 $\\mu$ 的置信度为 $0.90$ 的置信区间为（ ）。",
    "options": [
      "A. $\\left(20 - \\frac{1}{4}t_{0.05}(16), 20 + \\frac{1}{4}t_{0.05}(16)\\right)$",
      "B. $\\left(20 - \\frac{1}{4}t_{0.1}(16), 20 + \\frac{1}{4}t_{0.1}(16)\\right)$",
      "C. $\\left(20 - \\frac{1}{4}t_{0.05}(15), 20 + \\frac{1}{4}t_{0.05}(15)\\right)$",
      "D. $\\left(20 - \\frac{1}{4}t_{0.1}(15), 20 + \\frac{1}{4}t_{0.1}(15)\\right)$"
    ],
    "correctAnswer": "C",
    "explanation": "已知总体服从正态分布 $N(\\mu, \\sigma^2)$ 且方差 $\\sigma^2$ 未知，待估参数为均值 $\\mu$。\n选取枢轴量：\n$$T = \\frac{\\overline{X} - \\mu}{S / \\sqrt{n}} \\sim t(n - 1).$$\n由题意，样本容量 $n = 16$，自由度 $n - 1 = 15$，样本均值 $\\bar{x} = 20$，样本标准差 $S = 1$，置信度 $1 - \\alpha = 0.90$，则显著性水平 $\\alpha = 0.10$，半侧分位数下标 $\\frac{\\alpha}{2} = 0.05$。\n由 $P\\left\\{|T| < t_{\\frac{\\alpha}{2}}(n-1)\\right\\} = 1 - \\alpha$，解得 $\\mu$ 的置信度为 $0.90$ 的双侧置信区间为：\n$$\\left(\\bar{x} - t_{\\frac{\\alpha}{2}}(n-1)\\frac{S}{\\sqrt{n}},\\; \\bar{x} + t_{\\frac{\\alpha}{2}}(n-1)\\frac{S}{\\sqrt{n}}\\right) = \\left(20 - \\frac{1}{4}t_{0.05}(15),\\; 20 + \\frac{1}{4}t_{0.05}(15)\\right).$$\n故选 C。",
    "steps": [
      "识别题型为方差未知的单正态总体均值区间估计，选用 $t$ 分布枢轴量",
      "确定自由度 $n - 1 = 15$ 与分位数下标 $\\frac{\\alpha}{2} = 0.05$",
      "代入 $\\bar{x} = 20, S = 1, \\sqrt{n} = 4$ 得到置信区间并匹配选项 C"
    ],
    "keyPoints": [
      "正态总体均值置信区间（方差未知）",
      "$t$ 分布上侧分位数"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2005真题",
      "区间估计",
      "t分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-05",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "blank",
    "question": "设 $x_1, x_2, \\cdots, x_n$ 是来自总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，样本均值 $\\bar{x} = 9.5$，参数 $\\mu$ 的置信度为 $0.95$ 的双侧置信区间的置信上限为 $10.8$，则参数 $\\mu$ 的置信度为 $0.95$ 的双侧置信区间为 ______。",
    "correctAnswer": "$(8.2, 10.8)$",
    "explanation": "无论正态总体的方差 $\\sigma^2$ 已知还是未知，均值 $\\mu$ 的双侧置信区间均具有对称形式：\n$$(\\bar{x} - \\Delta,\\; \\bar{x} + \\Delta),$$\n其中 $\\bar{x}$ 为置信区间的中心，半宽 $\\Delta$ 为 $u_{\\frac{\\alpha}{2}}\\frac{\\sigma}{\\sqrt{n}}$ 或 $t_{\\frac{\\alpha}{2}}(n-1)\\frac{S}{\\sqrt{n}}$。\n已知置信中心 $\\bar{x} = 9.5$，置信上限 $\\bar{x} + \\Delta = 10.8$，故半宽为：\n$$\\Delta = 10.8 - 9.5 = 1.3.$$\n因此置信下限为：\n$$\\bar{x} - \\Delta = 9.5 - 1.3 = 8.2.$$\n所以参数 $\\mu$ 的置信度为 $0.95$ 的双侧置信区间为 $(8.2, 10.8)$。",
    "steps": [
      "利用正态总体均值双侧置信区间关于样本均值 $\\bar{x}$ 对称的性质",
      "由置信上限 $10.8$ 减去样本均值 $9.5$ 求得区间半宽 $\\Delta = 1.3$",
      "计算置信下限 $9.5 - 1.3 = 8.2$，写出区间 $(8.2, 10.8)$"
    ],
    "keyPoints": [
      "正态总体均值置信区间的对称性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2016真题",
      "区间估计",
      "对称性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-06",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "假设 $0.50, 1.25, 0.80, 2.00$ 是来自总体 $X$ 的简单随机样本值，已知 $Y = \\ln X$ 服从正态分布 $N(\\mu, 1)$。（1）求 $EX$；（2）求 $\\mu$ 的置信度为 $0.95$ 的置信区间；（3）求 $EX$ 的置信度为 $0.95$ 的置信区间。",
    "correctAnswer": "（1）$EX = e^{\\mu + \\frac{1}{2}}$；（2）$(-0.98, 0.98)$（或 $(-0.5u_{0.025}, 0.5u_{0.025})$）；（3）$(e^{-0.48}, e^{1.48})$（约 $(0.6188, 4.3929)$）",
    "explanation": "**（1）求 $EX$：**\n由 $Y = \\ln X \\sim N(\\mu, 1)$，得 $X = e^Y$，于是：\n$$E(X) = E(e^Y) = \\int_{-\\infty}^{+\\infty} e^y \\cdot \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{(y - \\mu)^2}{2}}\\,\\mathrm{d}y.$$\n对指数部分配方：\n$$y - \\frac{(y - \\mu)^2}{2} = -\\frac{y^2 - 2(\\mu + 1)y + \\mu^2}{2} = -\\frac{[y - (\\mu + 1)]^2}{2} + \\mu + \\frac{1}{2}.$$\n因此：\n$$E(X) = e^{\\mu + \\frac{1}{2}} \\int_{-\\infty}^{+\\infty} \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{[y - (\\mu + 1)]^2}{2}}\\,\\mathrm{d}y = e^{\\mu + \\frac{1}{2}}.$$\n\n**（2）求 $\\mu$ 的置信度为 $0.95$ 的置信区间：**\n对应于 $Y = \\ln X$ 的样本观察值为：\n$$y_1 = \\ln 0.50 = -\\ln 2, \\quad y_2 = \\ln 1.25 = \\ln\\frac{5}{4}, \\quad y_3 = \\ln 0.80 = \\ln\\frac{4}{5} = -\\ln\\frac{5}{4}, \\quad y_4 = \\ln 2.00 = \\ln 2.$$\n样本均值：\n$$\\bar{y} = \\frac{1}{4}(y_1 + y_2 + y_3 + y_4) = \\frac{1}{4}\\left(-\\ln 2 + \\ln\\frac{5}{4} - \\ln\\frac{5}{4} + \\ln 2\\right) = 0.$$\n由于 $Y \\sim N(\\mu, 1)$ 中方差 $\\sigma^2 = 1$ 已知，样本容量 $n = 4$，置信度 $1 - \\alpha = 0.95$，则 $\\frac{\\alpha}{2} = 0.025$，标准正态分布上侧分位数 $u_{0.025} = 1.96$。\n故 $\\mu$ 的置信度为 $0.95$ 的置信区间为：\n$$\\left(\\bar{y} - u_{0.025}\\frac{\\sigma}{\\sqrt{n}},\\; \\bar{y} + u_{0.025}\\frac{\\sigma}{\\sqrt{n}}\\right) = \\left(0 - 1.96 \\times \\frac{1}{2},\\; 0 + 1.96 \\times \\frac{1}{2}\\right) = (-0.98,\\; 0.98).$$\n\n**（3）求 $EX$ 的置信度为 $0.95$ 的置信区间：**\n由（1）知 $E(X) = e^{\\mu + \\frac{1}{2}}$ 是关于 $\\mu$ 的严格单调递增函数，故事件 $\\{-0.98 < \\mu < 0.98\\}$ 与事件 $\\{e^{-0.98 + 0.5} < e^{\\mu + 0.5} < e^{0.98 + 0.5}\\}$ 等价，即：\n$$P\\left\\{e^{-0.48} < E(X) < e^{1.48}\\right\\} = P\\left\\{-0.98 < \\mu < 0.98\\right\\} = 0.95.$$\n因此 $EX$ 的置信度为 $0.95$ 的置信区间为 $(e^{-0.48},\\; e^{1.48})$（近似值为 $(0.6188,\\; 4.3929)$）。",
    "steps": [
      "将 $X = e^Y$ 代入正态分布期望积分并用配方法求得 $EX = e^{\\mu + \\frac{1}{2}}$",
      "对样本值取对数算出 $\\bar{y} = 0$，利用方差已知的 $u$ 区间公式求得 $\\mu$ 的 $0.95$ 置信区间 $(-0.98, 0.98)$",
      "利用单调变换保持概率不变的性质，将区间端点代入 $e^{\\mu + \\frac{1}{2}}$ 得到 $EX$ 的置信区间 $(e^{-0.48}, e^{1.48})$"
    ],
    "keyPoints": [
      "对数正态分布的数学期望",
      "方差已知的正态均值置信区间",
      "参数单调函数的置信区间"
    ],
    "difficulty": "中等",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2000真题",
      "对数正态分布",
      "区间估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-07",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "假设检验",
    "type": "blank",
    "question": "设 $X_1, X_2, \\cdots, X_n$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，其中参数 $\\mu, \\sigma^2$ 未知，记 $\\overline{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$，$Q^2 = \\sum_{i=1}^n (X_i - \\overline{X})^2$，则假设 $H_0 : \\mu = 0$ 的检验统计量 $t =$ ______。",
    "correctAnswer": "$\\frac{\\sqrt{n(n-1)}\\,\\overline{X}}{Q}$",
    "explanation": "正态总体 $N(\\mu, \\sigma^2)$ 在方差 $\\sigma^2$ 未知的情况下，检验均值假设 $H_0 : \\mu = \\mu_0$ 所用的 $t$ 检验统计量为：\n$$T = \\frac{\\overline{X} - \\mu_0}{S / \\sqrt{n}},$$\n其中样本方差为：\n$$S^2 = \\frac{1}{n - 1}\\sum_{i=1}^{n}(X_i - \\overline{X})^2 = \\frac{Q^2}{n - 1} \\implies S = \\frac{Q}{\\sqrt{n - 1}}.$$\n题目中 $\\mu_0 = 0$，代入上式得：\n$$t = \\frac{\\overline{X} - 0}{\\dfrac{Q / \\sqrt{n - 1}}{\\sqrt{n}}} = \\frac{\\sqrt{n(n - 1)}\\,\\overline{X}}{Q}.$$\n在原假设 $H_0 : \\mu = 0$ 成立时，$t \\sim t(n - 1)$。",
    "steps": [
      "写出方差未知时正态均值检验的 $t$ 统计量公式 $\\frac{\\overline{X} - \\mu_0}{S / \\sqrt{n}}$",
      "利用 $S^2 = \\frac{Q^2}{n-1}$ 及 $\\mu_0 = 0$ 化简得出 $\\frac{\\sqrt{n(n-1)}\\,\\overline{X}}{Q}$"
    ],
    "keyPoints": [
      "单正态总体均值 $t$ 检验统计量",
      "样本方差与离差平方和关系"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "1995真题",
      "假设检验",
      "t检验统计量"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "假设检验",
    "type": "choice",
    "question": "设 $X_1, X_2, \\cdots, X_n$ 是来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，据此样本检测假设：$H_0 : \\mu = \\mu_0, H_1 : \\mu \\ne \\mu_0$，则（ ）。",
    "options": [
      "A. 如果在检验水平 $\\alpha=0.05$ 下拒绝 $H_0$，则在检验水平 $\\alpha=0.01$ 下必拒绝 $H_0$",
      "B. 如果在检验水平 $\\alpha=0.05$ 下拒绝 $H_0$，则在检验水平 $\\alpha=0.01$ 下必接受 $H_0$",
      "C. 如果在检验水平 $\\alpha=0.05$ 下接受 $H_0$，则在检验水平 $\\alpha=0.01$ 下必拒绝 $H_0$",
      "D. 如果在检验水平 $\\alpha=0.05$ 下接受 $H_0$，则在检验水平 $\\alpha=0.01$ 下必接受 $H_0$"
    ],
    "correctAnswer": "D",
    "explanation": "无论 $\\sigma^2$ 已知还是未知，双边假设检验 $H_0 : \\mu = \\mu_0, H_1 : \\mu \\ne \\mu_0$ 在显著性水平 $\\alpha$ 下的拒绝域均为 $|T| \\ge c_\\alpha$（其中 $c_\\alpha = u_{\\frac{\\alpha}{2}}$ 或 $t_{\\frac{\\alpha}{2}}(n-1)$），接受域为 $|T| < c_\\alpha$。\n由上侧分位数的单调性可知，当 $\\alpha$ 减小时，临界值增大，即：\n$$c_{0.01} > c_{0.05}.$$\n因此，拒绝域随 $\\alpha$ 减小而缩小，接受域随 $\\alpha$ 减小而扩大：\n$$W_{0.01} \\subset W_{0.05}, \\qquad \\overline{W}_{0.05} \\subset \\overline{W}_{0.01}.$$\n- 若在 $\\alpha = 0.05$ 下接受 $H_0$，则 $|T| < c_{0.05} < c_{0.01}$，故样本必然落在 $\\overline{W}_{0.01}$ 中，在 $\\alpha = 0.01$ 下必接受 $H_0$，因此 D 正确，C 错误；\n- 若在 $\\alpha = 0.05$ 下拒绝 $H_0$，仅知 $|T| \\ge c_{0.05}$，无法判断 $|T|$ 与 $c_{0.01}$ 的大小关系，因此 $\\alpha = 0.01$ 下可能拒绝也可能接受 $H_0$，故 A、B 均错误。\n故选 D。",
    "steps": [
      "比较不同显著性水平 $\\alpha=0.05$ 与 $\\alpha=0.01$ 对应的上侧分位数临界值：$c_{0.01} > c_{0.05}$",
      "推出接受域包含关系 $\\overline{W}_{0.05} \\subset \\overline{W}_{0.01}$",
      "得出在 $\\alpha=0.05$ 下接受 $H_0$ 时在 $\\alpha=0.01$ 下必接受 $H_0$，匹配选项 D"
    ],
    "keyPoints": [
      "显著性水平与拒绝域/接受域的包含关系",
      "上侧分位数的单调性"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2018真题",
      "显著性水平",
      "双边假设检验"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "假设检验",
    "type": "choice",
    "question": "设 $X_1, X_2, \\cdots, X_{16}$ 是来自正态总体 $N(\\mu, 4)$ 的简单随机样本，考虑假设检验问题：$H_0 : \\mu \\le 10$，$H_1 : \\mu > 10$，若该检验问题的拒绝域为 $W = \\{\\overline{X} > 11\\}$，则 $\\mu = 11.5$ 时，该检验犯第二类错误的概率为（ ）。",
    "options": [
      "A. $1 - \\Phi(0.5)$",
      "B. $1 - \\Phi(1)$",
      "C. $1 - \\Phi(1.5)$",
      "D. $1 - \\Phi(2)$"
    ],
    "correctAnswer": "B",
    "explanation": "第二类错误（“取伪”错误）是指原假设 $H_0$ 为假，却接受了 $H_0$。\n当 $\\mu = 11.5$ 时，$H_0 : \\mu \\le 10$ 为假；拒绝域为 $W = \\{\\overline{X} > 11\\}$，则接受域为 $\\overline{W} = \\{\\overline{X} \\le 11\\}$。\n已知总体 $X \\sim N(\\mu, 4)$，样本容量 $n = 16$，则当 $\\mu = 11.5$ 时，样本均值服从：\n$$\\overline{X} \\sim N\\left(11.5,\\; \\frac{4}{16}\\right) = N\\left(11.5,\\; 0.5^2\\right).$$\n因此，该检验犯第二类错误的概率为：\n$$\\beta = P_{\\mu = 11.5}\\{\\overline{X} \\le 11\\} = \\Phi\\left(\\frac{11 - 11.5}{0.5}\\right) = \\Phi(-1) = 1 - \\Phi(1).$$\n故选 B。",
    "steps": [
      "明确第二类错误的概率定义为 $\\beta = P_{\\mu=11.5}\\{\\text{接受 } H_0\\} = P_{\\mu=11.5}\\{\\overline{X} \\le 11\\}$",
      "写出 $\\mu = 11.5$ 时 $\\overline{X} \\sim N(11.5, 0.5^2)$ 的分布",
      "标准化计算得 $\\Phi(-1) = 1 - \\Phi(1)$，匹配选项 B"
    ],
    "keyPoints": [
      "假设检验的两类错误",
      "第二类错误概率计算"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2021真题",
      "第二类错误",
      "拒绝域"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  },
  {
    "id": "gl-jm-6-10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "假设检验",
    "type": "choice",
    "question": "设 $X_1, X_2, \\cdots, X_n$ 为来自正态总体 $N(\\mu, 2)$ 的简单随机样本，记 $\\overline{X} = \\frac{1}{n}\\sum_{i=1}^n X_i$，$\\bar{x}$ 为 $\\overline{X}$ 的观察值，$Z_\\alpha$ 表示标准正态分布的上侧 $\\alpha$ 分位数，假设检验问题：$H_0 : \\mu \\le 1$，$H_1 : \\mu > 1$ 的显著性水平为 $\\alpha$ 的检验的拒绝域为（ ）。",
    "options": [
      "A. $\\left\\{(x_1, x_2, \\cdots, x_n) \\;\\middle|\\; \\bar{x} > 1 + \\frac{2}{n}Z_\\alpha\\right\\}$",
      "B. $\\left\\{(x_1, x_2, \\cdots, x_n) \\;\\middle|\\; \\bar{x} > 1 + \\frac{\\sqrt{2}}{n}Z_\\alpha\\right\\}$",
      "C. $\\left\\{(x_1, x_2, \\cdots, x_n) \\;\\middle|\\; \\bar{x} > 1 + \\frac{2}{\\sqrt{n}}Z_\\alpha\\right\\}$",
      "D. $\\left\\{(x_1, x_2, \\cdots, x_n) \\;\\middle|\\; \\bar{x} > 1 + \\sqrt{\\frac{2}{n}}Z_\\alpha\\right\\}$"
    ],
    "correctAnswer": "D",
    "explanation": "已知总体 $X \\sim N(\\mu, 2)$，即总体方差 $\\sigma^2 = 2$（标准差 $\\sigma = \\sqrt{2}$）已知。\n对于右边单边假设检验 $H_0 : \\mu \\le 1$，$H_1 : \\mu > 1$，当 $\\mu = 1$ 时，检验统计量为：\n$$Z = \\frac{\\overline{X} - 1}{\\sigma / \\sqrt{n}} = \\frac{\\overline{X} - 1}{\\sqrt{2/n}} \\sim N(0, 1).$$\n当备择假设 $H_1 : \\mu > 1$ 成立时，$\\overline{X}$ 倾向于偏大，故在显著性水平 $\\alpha$ 下，由 $P_{\\mu=1}\\{Z > Z_\\alpha\\} = \\alpha$ 确定拒绝域为：\n$$\\frac{\\bar{x} - 1}{\\sqrt{2/n}} > Z_\\alpha \\iff \\bar{x} > 1 + \\sqrt{\\frac{2}{n}}Z_\\alpha.$$\n故拒绝域为 $\\left\\{(x_1, x_2, \\cdots, x_n) \\;\\middle|\\; \\bar{x} > 1 + \\sqrt{\\frac{2}{n}}Z_\\alpha\\right\\}$。\n故选 D。",
    "steps": [
      "确定总体方差 $\\sigma^2 = 2$ 已知及检验方向为右边单边检验 $H_1 : \\mu > 1$",
      "构造标准正态检验统计量 $Z = \\frac{\\overline{X} - 1}{\\sqrt{2/n}}$",
      "由单侧拒绝域 $Z > Z_\\alpha$ 反解出 $\\bar{x} > 1 + \\sqrt{\\frac{2}{n}}Z_\\alpha$，匹配选项 D"
    ],
    "keyPoints": [
      "单边假设检验（右边检验）",
      "$u$ 检验的拒绝域"
    ],
    "difficulty": "简单",
    "tags": [
      "概率论救命讲义",
      "概率论与数理统计",
      "2025真题",
      "单边假设检验",
      "拒绝域"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/考研数学概率论救命讲义-核心体系与159题精析.md"
  }
]
