import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 2026 李林《六套卷》数一 · 概率论与数理统计分类题库（30 题）
 */
export const lilin6ProbabilityQuestions: UnifiedQuestion[] = [
  {
    "id": "math-prob-lilin6-s1-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T8】设每次试验只有两个结果 $A$ 与 $\\bar{A}$，已知 $P(A) = p$ $(0 < p < 1)$，重复独立进行该实验直至 $A$ 与 $\\bar{A}$ 都出现为止，且试验次数 $X$ 的数学期望为 $3$，则 $p = $（ ）。",
    "correctAnswer": "A",
    "explanation": "若首次试验出现 $A$（概率 $p$），还须继续独立试验直到出现 $\\bar{A}$，额外试验次数服从几何分布 $G(1-p)$，期望为 $\\frac{1}{1-p}$；同理若首次出现 $\\bar{A}$（概率 $1-p$），额外试验次数期望为 $\\frac{1}{p}$。\n由全期望公式：$E(X) = 1 + p\\cdot\\frac{1}{1-p} + (1-p)\\cdot\\frac{1}{p} = \\frac{1}{p(1-p)} - 1$。\n令 $\\frac{1}{p(1-p)} - 1 = 3 \\implies p(1-p) = \\frac{1}{4} \\implies p = \\frac{1}{2}$。选 A。",
    "steps": [
      "按首次试验结果分条件讨论剩余几何分布等待次数",
      "列出全期望方程 $E(X) = 1 + \\frac{p}{1-p} + \\frac{1-p}{p} = \\frac{1}{p(1-p)} - 1$",
      "解方程 $\\frac{1}{p(1-p)}-1 = 3$ 得 $p = \\frac{1}{2}$"
    ],
    "keyPoints": [
      "几何分布",
      "全期望公式",
      "停时问题的数学期望"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "概率论",
      "数学期望"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{1}{2}$",
      "B. $\\frac{1}{3}$",
      "C. $\\frac{1}{4}$",
      "D. $\\frac{2}{3}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s1-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T9】设 $(X, Y) \\sim N\\left(1, 0; 9, 16; -\\frac{1}{2}\\right)$，$Z = \\frac{1}{3}X + \\frac{1}{2}Y$，则（ ）。",
    "correctAnswer": "A",
    "explanation": "由题意得 $D(X) = 9, D(Y) = 16, \\text{Cov}(X, Y) = -\\frac{1}{2}\\times 3 \\times 4 = -6$。\n1. $\\text{Cov}(X, Z) = \\frac{1}{3}D(X) + \\frac{1}{2}\\text{Cov}(X, Y) = 3 - 3 = 0$，故 $X$ 与 $Z$ 不相关！且因 $(X, Z)$ 服从二维正态分布，不相关等价于独立（B 错）。\n2. $\\text{Cov}(Y, Z) = \\frac{1}{3}\\text{Cov}(X, Y) + \\frac{1}{2}D(Y) = -2 + 8 = 6 \\ne 0$，故 $Y$ 与 $Z$ 相关从而不独立（C、D 错）。选 A。",
    "steps": [
      "计算协方差 $\\text{Cov}(X,Y) = \\rho \\sigma_X \\sigma_Y = -6$",
      "求得 $\\text{Cov}(X,Z) = 0$（不相关且因联合正态而独立）",
      "求得 $\\text{Cov}(Y,Z) = 6 \\ne 0$，排除 C、D"
    ],
    "keyPoints": [
      "二维正态分布",
      "协方差线性性质",
      "不相关与独立等价性"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "概率论",
      "数字特征"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $X$ 与 $Z$ 不相关",
      "B. $X$ 与 $Z$ 不相互独立",
      "C. $Y$ 与 $Z$ 不相关",
      "D. $Y$ 与 $Z$ 相互独立"
    ]
  },
  {
    "id": "math-prob-lilin6-s1-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T10】连续不间断独立地对同一目标射击，直到命中为止。设进行 $n (n \\ge 1)$ 轮射击，各轮射击的次数依次为 $k_1, k_2, \\cdots, k_n$，且每次击中目标的概率均为 $p (0 < p < 1)$，则 $p$ 的矩估计值与最大似然估计值分别为（ ）。",
    "correctAnswer": "C",
    "explanation": "每轮射击次数服从参数为 $p$ 的几何分布 $G(p)$，期望 $E(X) = \\frac{1}{p}$。\n1. **矩估计**：令 $\\frac{1}{p} = \\bar{k} = \\frac{1}{n}\\sum_{i=1}^n k_i$，得 $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$。\n2. **最大似然估计**：似然函数 $L(p) = p^n (1-p)^{\\sum k_i - n}$，对数似然 $\\ln L(p) = n\\ln p + (\\sum k_i - n)\\ln(1-p)$。令导数 $\\frac{n}{p} - \\frac{\\sum k_i - n}{1-p} = 0$，解得 $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$。选 C。",
    "steps": [
      "建模为几何分布 $G(p)$，$E(X)=1/p$",
      "矩估计令 $1/p = \\bar{k}$ 解得 $\\hat{p} = n/\\sum k_i$",
      "对数似然求导归零同样解得 $\\hat{p} = n/\\sum k_i$"
    ],
    "keyPoints": [
      "几何分布",
      "矩估计",
      "最大似然估计"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "数理统计",
      "点估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}, \\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}$",
      "B. $\\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}, \\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$",
      "C. $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}, \\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$",
      "D. $\\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}, \\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s1-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T16】设二维随机变量 $(X, Y)$ 服从 $D$ 上的均匀分布，其中 $D = \\{(x, y) \\mid 0 \\le x \\le 3, 0 \\le y \\le 3\\}$，记 $U = (X+Y)^2, V = (X-Y)^2$，则 $\\text{Cov}(U, V) =$ ______。",
    "correctAnswer": "$-\\frac{27}{20}$",
    "explanation": "$X, Y$ 独立同分布于 $U(0, 3)$，原点矩 $E(X^k) = \\frac{3^k}{k+1}$，即 $E(X)=\\frac{3}{2}, E(X^2)=3, E(X^4)=\\frac{81}{5}$。\n利用 $E(U) = 2E(X^2) + 2[E(X)]^2 = \\frac{21}{2}$，$E(V) = 2E(X^2) - 2[E(X)]^2 = \\frac{3}{2}$，\n以及 $UV = (X^2+Y^2)^2 - 4X^2Y^2 = X^4 + Y^4 - 2X^2Y^2 \\implies E(UV) = 2\\cdot\\frac{81}{5} - 2\\cdot 9 = \\frac{72}{5}$。\n故 $\\text{Cov}(U, V) = \\frac{72}{5} - \\frac{21}{2}\\cdot\\frac{3}{2} = -\\frac{27}{20}$。",
    "steps": [
      "拆解为独立 $U(0,3)$ 变量求各阶原点矩",
      "分别算出 $E(U)=21/2, E(V)=3/2$",
      "化简 $UV = X^4+Y^4-2X^2Y^2$ 求 $E(UV)=72/5$，算出协方差 $-27/20$"
    ],
    "keyPoints": [
      "二维均匀分布独立性",
      "随机变量的高阶矩",
      "协方差计算"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "概率论",
      "协方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s1-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T22（12分）】设随机变量 $X$ 的概率密度为 $f(x) = \\frac{1}{\\pi(1+x^2)} (-\\infty < x < +\\infty)$，$Y = \\operatorname{arccot} X$，随机变量 $Z \\sim N(0, 1)$，且 $Y$ 与 $Z$ 相互独立。\n（I）求 $Y$ 的分布函数与概率密度；\n（II）求 $U = Z + Y$ 的概率密度。",
    "correctAnswer": "（I）$Y \\sim U(0, \\pi)$；（II）$f_U(u) = \\frac{1}{\\pi}[\\Phi(u) - \\Phi(u - \\pi)]$。",
    "explanation": "**（I）**：因 $\\operatorname{arccot} X \\in (0, \\pi)$ 且严格递减，对 $0 < y < \\pi$ 有：\n$F_Y(y) = P\\{\\operatorname{arccot} X \\le y\\} = P\\{X \\ge \\cot y\\} = \\int_{\\cot y}^{+\\infty} \\frac{1}{\\pi(1+x^2)}\\,dx = \\frac{1}{\\pi}\\left[\\frac{\\pi}{2} - (\\frac{\\pi}{2} - y)\\right] = \\frac{y}{\\pi}$。\n故 $F_Y(y) = \\begin{cases} 0, & y < 0 \\\\ \\frac{y}{\\pi}, & 0 \\le y < \\pi \\\\ 1, & y \\ge \\pi \\end{cases}$，$f_Y(y) = \\begin{cases} \\frac{1}{\\pi}, & 0 < y < \\pi \\\\ 0, & \\text{其他} \\end{cases}$。\n\n**（II）**：由卷积公式，$f_U(u) = \\int_0^\\pi \\frac{1}{\\pi}\\varphi(u - y)\\,dy = \\frac{1}{\\pi}\\int_{u-\\pi}^u \\varphi(t)\\,dt = \\frac{1}{\\pi}[\\Phi(u) - \\Phi(u - \\pi)]$（$-\\infty < u < +\\infty$）。",
    "steps": [
      "（4分）利用反余切函数单调递减性与柯西分布积分求得 $F_Y(y) = y/\\pi$ $(0<y<\\pi)$",
      "（2分）规范分段写出 $F_Y(y)$ 与 $f_Y(y)$",
      "（4分）列出独立随机变量和的卷积公式 $f_U(u) = \\int_0^\\pi \\frac{1}{\\pi}\\varphi(u-y)\\,dy$",
      "（2分）换元转化为 $\\frac{1}{\\pi}[\\Phi(u)-\\Phi(u-\\pi)]$"
    ],
    "keyPoints": [
      "一维随机变量函数的分布",
      "柯西分布与均匀分布联系",
      "卷积公式求两独立变量和的密度"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "概率论",
      "随机变量分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s2-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T8】设 $A, B, C$ 是三个随机事件，$P(ABC) = 0$，$0 < P(C) < 1$，则正确的是（ ）。",
    "correctAnswer": "D",
    "explanation": "$P[(A \\cup B) \\mid C] = \\frac{P(AC \\cup BC)}{P(C)} = \\frac{P(AC) + P(BC) - P(ABC)}{P(C)}$，代入 $P(ABC) = 0$ 即得 $P(A\\mid C) + P(B\\mid C)$。选 D。",
    "steps": [
      "写出条件概率定义式 $P((A\\cup B)\\mid C) = P(AC\\cup BC)/P(C)$",
      "由概率加法公式及 $P(ABC)=0$ 直接得出 $P(A\\mid C)+P(B\\mid C)$"
    ],
    "keyPoints": [
      "条件概率性质",
      "事件加法公式"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "概率论",
      "条件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $P(ABC) = P(A)P(B)P(C)$",
      "B. $P(A \\cup B \\cup C) = P(A) + P(B) + P(C)$",
      "C. $P[(A \\cup B) \\mid \\bar{C}] = P(A \\mid \\bar{C}) + P(B \\mid \\bar{C})$",
      "D. $P[(A \\cup B) \\mid C] = P(A \\mid C) + P(B \\mid C)$"
    ]
  },
  {
    "id": "math-prob-lilin6-s2-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T9】设随机变量 $X_1 \\sim B(1, p)$，$X_2 \\sim B(2, p)$ $(0 < p < 1)$，且 $X_1$ 与 $X_2$ 相互独立，记 $Z_1 = 2X_1 + X_2, Z_2 = X_1 - X_2$，则（ ）。",
    "correctAnswer": "B",
    "explanation": "1. $\\text{Cov}(Z_1, Z_2) = 2D(X_1) - D(X_2) = 2p(1-p) - 2p(1-p) = 0$，故不相关。\n2. $P\\{Z_1 = 0\\} = (1-p)^3 > 0$，$P\\{Z_2 = 1\\} = p(1-p)^2 > 0$，但 $2X_1+X_2=0$ 与 $X_1-X_2=1$ 在非负取值上无交集，故 $P\\{Z_1=0, Z_2=1\\} = 0 \\ne P\\{Z_1=0\\}P\\{Z_2=1\\}$，不相互独立。选 B。",
    "steps": [
      "计算 $\\text{Cov}(Z_1, Z_2) = 2D(X_1) - D(X_2) = 0$ 证不相关",
      "检验 $P(Z_1=0, Z_2=1) = 0 \\ne P(Z_1=0)P(Z_2=1)$ 证不独立"
    ],
    "keyPoints": [
      "协方差计算",
      "独立与不相关的区别",
      "二项分布"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "概率论",
      "数字特征"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 相互独立",
      "B. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 不相互独立",
      "C. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 相互独立",
      "D. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 不相互独立"
    ]
  },
  {
    "id": "math-prob-lilin6-s2-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T10】设随机变量 $X$ 在 $[0, \\theta]$ $(\\theta > 0)$ 上服从均匀分布，其中 $\\theta$ 未知，$X_1, X_2, \\cdots, X_n$ 为总体 $X$ 的简单随机样本，$\\hat{\\theta}$ 为 $\\theta$ 的最大似然估计量，若 $k\\hat{\\theta}$ 为 $\\theta$ 的无偏估计量，则 $k =$（ ）。",
    "correctAnswer": "B",
    "explanation": "$U(0,\\theta)$ 下 $\\theta$ 的最大似然估计量为次序统计量 $\\hat{\\theta} = X_{(n)}$。其分布函数为 $(\\frac{x}{\\theta})^n$ $(0<x<\\theta)$，密度为 $\\frac{nx^{n-1}}{\\theta^n}$，数学期望 $E(X_{(n)}) = \\frac{n}{n+1}\\theta$。\n由 $E(k\\hat{\\theta}) = \\theta \\implies k = \\frac{n+1}{n}$。选 B。",
    "steps": [
      "确定均匀分布参数 $\\theta$ 的 MLE 为 $\\hat{\\theta} = X_{(n)}$",
      "求出 $E(X_{(n)}) = \\frac{n}{n+1}\\theta$，得无偏修正系数 $k = \\frac{n+1}{n}$"
    ],
    "keyPoints": [
      "非正则分布的最大似然估计",
      "最大值分布的期望",
      "估计量无偏性"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "数理统计",
      "无偏估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{n}{n+1}$",
      "B. $\\frac{n+1}{n}$",
      "C. $\\frac{1}{n+1}$",
      "D. $\\frac{1}{n}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s2-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T16】设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从二项分布 $B\\left(4, \\frac{1}{2}\\right)$，$Y$ 服从 $\\lambda = 1$ 的泊松分布，则 $P\\{1 < \\max(X, Y) \\le 3\\} =$ ______。",
    "correctAnswer": "$\\frac{15}{8}e^{-1}$",
    "explanation": "$P\\{1 < \\max(X,Y) \\le 3\\} = P\\{X\\le 3\\}P\\{Y\\le 3\\} - P\\{X\\le 1\\}P\\{Y\\le 1\\} = \\frac{15}{16}\\cdot \\frac{8}{3}e^{-1} - \\frac{5}{16}\\cdot 2e^{-1} = \\frac{15}{8}e^{-1}$。",
    "steps": [
      "拆分为 $F_{\\max}(3) - F_{\\max}(1)$ 并结合独立性化为边缘概率乘积",
      "代入 $B(4,1/2)$ 与泊松分布 $P(1)$ 算得 $\\frac{15}{8}e^{-1}$"
    ],
    "keyPoints": [
      "离散独立变量最大值分布",
      "二项分布与泊松分布计算"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "概率论",
      "随机变量分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s2-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T22（12分）】设随机变量 $X$ 与 $Y$ 相互独立且服从同一分布，当 $x \\le 0$ 时，$X$ 的概率密度 $f(x) = 0$，当 $x > 0$ 时，$f(x)$ 满足方程 $f'(x) + 2x f(x) = 0$。$Z = \\sqrt{X^2 + Y^2}$，求：\n（I）$Z$ 的分布函数与概率密度；\n（II）$D(Z)$。",
    "correctAnswer": "（I）$F_Z(z) = \\begin{cases} 1 - e^{-z^2}, & z > 0 \\\\ 0, & z \\le 0 \\end{cases}$，$f_Z(z) = \\begin{cases} 2ze^{-z^2}, & z > 0 \\\\ 0, & z \\le 0 \\end{cases}$；（II）$D(Z) = 1 - \\frac{\\pi}{4}$。",
    "explanation": "**（I）**：由 $\\frac{f'(x)}{f(x)} = -2x \\implies f(x) = C e^{-x^2} (x>0)$。由归一性 $\\int_0^{+\\infty} C e^{-x^2}\\,dx = 1 \\implies C = \\frac{2}{\\sqrt{\\pi}}$。\n独立同分布联合密度 $f(x,y) = \\frac{4}{\\pi}e^{-(x^2+y^2)} (x>0, y>0)$。\n当 $z > 0$ 时极坐标积分：$F_Z(z) = \\int_0^{\\pi/2}d\\theta \\int_0^z \\frac{4}{\\pi}e^{-r^2}r\\,dr = 1 - e^{-z^2}$，求导得 $f_Z(z) = 2ze^{-z^2}$ $(z>0)$；$z \\le 0$ 时均为 $0$。\n\n**（II）**：$E(Z) = \\int_0^{+\\infty} 2z^2 e^{-z^2}\\,dz = \\frac{\\sqrt{\\pi}}{2}$，$E(Z^2) = \\int_0^{+\\infty} 2z^3 e^{-z^2}\\,dz = 1$，故 $D(Z) = 1 - \\frac{\\pi}{4}$。",
    "steps": [
      "（4分）解微分方程并归一化确定 $f(x) = \\frac{2}{\\sqrt{\\pi}}e^{-x^2} (x>0)$",
      "（4分）在第一象限极坐标积分求出 $F_Z(z)$ 与 $f_Z(z)$",
      "（4分）计算 $E(Z)=\\frac{\\sqrt{\\pi}}{2}$ 与 $E(Z^2)=1$，求得方差 $1 - \\frac{\\pi}{4}$"
    ],
    "keyPoints": [
      "微分方程与概率密度归一化",
      "极坐标求随机变量距离分布",
      "瑞利分布数字特征"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "概率论",
      "二维分布与数字特征"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s3-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T8】设 $A, B$ 是两个随机事件，$P(A) = 0.2$，$P(B \\mid A) = P(B \\mid \\bar{A})$，$P(A \\cup B) = 0.6$，则 $P(\\bar{A} \\cup \\bar{B}) =$（ ）。",
    "correctAnswer": "D",
    "explanation": "由 $P(B \\mid A) = P(B \\mid \\bar{A})$ 与全概率公式知 $P(B) = P(B\\mid A)P(A) + P(B\\mid \\bar{A})P(\\bar{A}) = P(B\\mid A)$，即事件 $A$ 与 $B$ **相互独立**！\n代入并公式：$0.6 = P(A \\cup B) = P(A) + P(B) - P(A)P(B) = 0.2 + P(B) - 0.2P(B) \\implies 0.8P(B) = 0.4 \\implies P(B) = 0.5$。\n由德摩根律：$P(\\bar{A} \\cup \\bar{B}) = 1 - P(AB) = 1 - 0.2 \\times 0.5 = 0.9$。选 D。",
    "steps": [
      "由 $P(B\\mid A)=P(B\\mid\\bar{A})$ 推出 $A$ 与 $B$ 相互独立",
      "利用独立与加法公式求解 $P(B)=0.5$",
      "由德摩根律求 $1 - P(A)P(B) = 0.9$"
    ],
    "keyPoints": [
      "事件独立性等价判定",
      "德摩根律与加法公式"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "概率论",
      "独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. 0.4",
      "B. 0.5",
      "C. 0.8",
      "D. 0.9"
    ]
  },
  {
    "id": "math-prob-lilin6-s3-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T9】设 $X_1, X_2$ 相互独立，且均服从参数为 $\\frac{1}{2}$ 的 $0-1$ 分布，记 $U = -(X_1 + X_2) + X_1 X_2$，$V = -(X_1 + X_2) - X_1 X_2$，则 $\\text{Cov}(U, V) =$（ ）。",
    "correctAnswer": "C",
    "explanation": "$X_1, X_2$ 等概率取 $(0,0), (0,1), (1,0), (1,1)$，各概率均为 $\\frac{1}{4}$。\n直接列出 $(U, V)$ 对应取值：\n- $(0,0)$：$U=0, V=0$；\n- $(0,1)$ 或 $(1,0)$（各占 $1/4$）：$U=-1, V=-1$；\n- $(1,1)$：$U=-1, V=-3$。\n故 $E(U) = \\frac{3}{4}(-1) = -\\frac{3}{4}$；$E(V) = \\frac{1}{4}(0 - 1 - 1 - 3) = -\\frac{5}{4}$；$E(UV) = \\frac{1}{4}(0 + 1 + 1 + 3) = \\frac{5}{4}$。\n因此 $\\text{Cov}(U, V) = E(UV) - E(U)E(V) = \\frac{5}{4} - (-\\frac{3}{4})(-\\frac{5}{4}) = \\frac{5}{4} - \\frac{15}{16} = \\frac{5}{16}$。选 C。",
    "steps": [
      "列出 $(X_1, X_2)$ 的四种等可能样本点及对应 $(U,V)$ 值",
      "算得 $E(U) = -3/4$, $E(V) = -5/4$, $E(UV) = 5/4$",
      "代入 $\\text{Cov}(U,V) = E(UV) - E(U)E(V) = 5/16$"
    ],
    "keyPoints": [
      "离散联合分布列枚举",
      "协方差定义计算"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "概率论",
      "协方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{1}{16}$",
      "B. $\\frac{3}{16}$",
      "C. $\\frac{5}{16}$",
      "D. 0"
    ]
  },
  {
    "id": "math-prob-lilin6-s3-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T10】设总体 $X \\sim N(\\mu, \\sigma^2)$ $(\\sigma > 0)$，从 $X$ 中分别抽取容量为 $n_1, n_2$ 的两个独立样本，其样本均值分别为 $\\bar{X}_1, \\bar{X}_2$。若使 $D[a\\bar{X}_1 + (1-a)\\bar{X}_2]$ 达到最小，则 $a =$（ ）。",
    "correctAnswer": "A",
    "explanation": "因为两样本相互独立，且 $D(\\bar{X}_1) = \\frac{\\sigma^2}{n_1}$，$D(\\bar{X}_2) = \\frac{\\sigma^2}{n_2}$，所以方差函数为：\n$g(a) = D[a\\bar{X}_1 + (1-a)\\bar{X}_2] = a^2 \\frac{\\sigma^2}{n_1} + (1-a)^2 \\frac{\\sigma^2}{n_2}$。\n关于 $a$ 求导并令之为零：$g'(a) = \\sigma^2\\left(\\frac{2a}{n_1} - \\frac{2(1-a)}{n_2}\\right) = 0 \\implies a n_2 = n_1 - a n_1 \\implies a = \\frac{n_1}{n_1 + n_2}$（二阶导恒正，确为最小值；本质上说明按样本容量加权是最小方差无偏估计）。选 A。",
    "steps": [
      "由独立性展开方差表达式 $g(a) = \\sigma^2\\left(\\frac{a^2}{n_1}+\\frac{(1-a)^2}{n_2}\\right)$",
      "求驻点 $g'(a) = 0$ 解得 $a = \\frac{n_1}{n_1+n_2}$"
    ],
    "keyPoints": [
      "样本均值方差",
      "最小方差线性无偏估计"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "数理统计",
      "无偏估计"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{n_1}{n_1 + n_2}$",
      "B. $\\frac{n_2}{n_1 + n_2}$",
      "C. $\\frac{n_1 + n_2}{n_2}$",
      "D. $\\frac{n_1 + n_2}{n_1}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s3-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T16】设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从区间 $(0, 1)$ 内的均匀分布，$Y$ 服从参数为 $\\lambda$ 的指数分布，则 $P\\left\\{1 \\le \\frac{Y}{X} \\le 2\\right\\} =$ ______。",
    "correctAnswer": "$\\frac{(1 - e^{-\\lambda})^2}{2\\lambda}$",
    "explanation": "$(X, Y)$ 的联合概率密度为 $f(x, y) = \\lambda e^{-\\lambda y}$ $(0 < x < 1, y > 0)$，其余为 0。\n不等式 $1 \\le \\frac{Y}{X} \\le 2$ 在第一象限对应 $x \\le y \\le 2x$（先积 $y$ 后积 $x$）：\n$P\\left\\{1 \\le \\frac{Y}{X} \\le 2\\right\\} = \\int_0^1 dx \\int_x^{2x} \\lambda e^{-\\lambda y}\\,dy = \\int_0^1 (e^{-\\lambda x} - e^{-2\\lambda x})\\,dx = \\left[-\\frac{1}{\\lambda}e^{-\\lambda x} + \\frac{1}{2\\lambda}e^{-2\\lambda x}\\right]_0^1$\n$= \\frac{1 - e^{-\\lambda}}{\\lambda} - \\frac{1 - e^{-2\\lambda}}{2\\lambda} = \\frac{1 - 2e^{-\\lambda} + e^{-2\\lambda}}{2\\lambda} = \\frac{(1 - e^{-\\lambda})^2}{2\\lambda}$。",
    "steps": [
      "写出独立均匀分布与指数分布的联合概率密度（区域 $0<x<1, y>0$）",
      "确定积分区域 $x \\le y \\le 2x$ 写出先 $y$ 后 $x$ 的累次积分",
      "精确计算并配方化简为 $\\frac{(1 - e^{-\\lambda})^2}{2\\lambda}$"
    ],
    "keyPoints": [
      "二维独立联合密度",
      "二重积分求随机变量比值概率"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "概率论",
      "二维分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s3-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T22（12分）】设随机变量 $X$ 在区间 $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ 内服从均匀分布，$Y$ 的分布律为 $P\\{Y = 0\\} = P\\{Y = 1\\} = \\frac{1}{2}$，且 $X$ 与 $Y$ 相互独立，记 $Z = |\\sin X|$。\n（I）求 $Z$ 的概率密度；\n（II）求 $V = Y + Z$ 的概率密度。",
    "correctAnswer": "（I）$f_Z(z) = \\begin{cases} \\frac{2}{\\pi\\sqrt{1-z^2}}, & 0 < z < 1 \\\\ 0, & \\text{其他} \\end{cases}$；（II）$f_V(v) = \\begin{cases} \\frac{1}{\\pi\\sqrt{1-v^2}}, & 0 < v < 1 \\\\ \\frac{1}{\\pi\\sqrt{1-(v-1)^2}}, & 1 < v < 2 \\\\ 0, & \\text{其他} \\end{cases}$。",
    "explanation": "**（I）求 $Z = |\\sin X|$ 的概率密度**：\n值域 $0 \\le Z < 1$。对 $0 < z < 1$：\n$F_Z(z) = P\\{|\\sin X| \\le z\\} = P\\{-\\arcsin z \\le X \\le \\arcsin z\\} = \\frac{2\\arcsin z}{\\pi}$。\n求导得：$f_Z(z) = \\begin{cases} \\frac{2}{\\pi\\sqrt{1-z^2}}, & 0 < z < 1 \\\\ 0, & \\text{其他} \\end{cases}$。\n\n**（II）离散+连续独立和（全概率公式求分布函数）**：\n由 $X, Y$ 独立知 $Z, Y$ 也独立。用全概率公式分 $Y=0$ 和 $Y=1$ 讨论：\n$F_V(v) = P\\{Y + Z \\le v\\} = P\\{Y=0\\}P\\{Z \\le v\\} + P\\{Y=1\\}P\\{Z \\le v-1\\} = \\frac{1}{2}F_Z(v) + \\frac{1}{2}F_Z(v-1)$。\n求导即得密度（分段讨论避免边界奇点）：\n- 当 $0 < v < 1$ 时，$F_Z(v-1) = 0$，故 $f_V(v) = \\frac{1}{2} f_Z(v) = \\frac{1}{\\pi\\sqrt{1-v^2}}$；\n- 当 $1 < v < 2$ 时，$F_Z(v) = 1$（导数为 0），故 $f_V(v) = \\frac{1}{2} f_Z(v-1) = \\frac{1}{\\pi\\sqrt{1-(v-1)^2}}$；\n- 其他区间 $v \\le 0$ 或 $v \\ge 2$ 或端点 $v=1$（定义处或单点不计入连续密度，$0$ 即可）：$f_V(v) = 0$。",
    "steps": [
      "（5分）利用分布函数法计算 $F_Z(z) = \\frac{2}{\\pi}\\arcsin z$ $(0<z<1)$ 并求导得 $f_Z(z)$",
      "（5分）利用独立性与全概率公式分解混合和分布 $F_V(v) = \\frac{1}{2}F_Z(v) + \\frac{1}{2}F_Z(v-1)$",
      "（2分）分 $(0,1)$ 与 $(1,2)$ 两段求导写出完整概率密度 $f_V(v)$"
    ],
    "keyPoints": [
      "一维随机变量函数分布",
      "离散型与连续型独立和（全概率分解）"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "概率论",
      "随机变量分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s4-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机事件与概率",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T8】设 $A_1, A_2, B$ 是随机事件，$0 < P(B) < 1$，且 $P[(A_1 + A_2) \\mid B] = P(A_1 \\mid B) + P(A_2 \\mid B)$，则（ ）。",
    "correctAnswer": "C",
    "explanation": "展开给定条件并利用加法公式：\n$\\frac{P[(A_1+A_2)B]}{P(B)} = \\frac{P(A_1 B)}{P(B)} + \\frac{P(A_2 B)}{P(B)}$。\n两边同乘 $P(B) > 0$，立即得到 $P(A_1 B + A_2 B) = P(A_1 B) + P(A_2 B)$（本质等价于 $P(A_1 A_2 B) = 0$，并不能推出在 $\\bar{B}$ 上交概率也为 0，因此 A、B、D 均不一定成立）。选 C。",
    "steps": [
      "展开条件概率等式两边同乘 $P(B)$",
      "由集合分配律 $(A_1+A_2)B = A_1B + A_2B$ 直接得 C 项"
    ],
    "keyPoints": [
      "条件概率与加法公式"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "概率论",
      "条件概率"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $P(A_1 + A_2) = P(A_1) + P(A_2)$",
      "B. $P(A_1 + A_2) = P(A_1 \\mid B) + P(A_2 \\mid B)$",
      "C. $P(A_1 B + A_2 B) = P(A_1 B) + P(A_2 B)$",
      "D. $P[(A_1 + A_2) \\mid \\bar{B}] = P(A_1 \\mid \\bar{B}) + P(A_2 \\mid \\bar{B})$"
    ]
  },
  {
    "id": "math-prob-lilin6-s4-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T9】设随机变量 $X$ 在 $(0, 1)$ 内服从均匀分布，则 $P\\{1 \\le X^{\\ln X} \\le e\\} =$（ ）。",
    "correctAnswer": "B",
    "explanation": "在区间 $(0, 1)$ 上取自然对数（单调增）：$1 \\le X^{\\ln X} \\le e \\iff 0 \\le (\\ln X)^2 \\le 1 \\iff -1 \\le \\ln X \\le 1$。\n由于 $X \\in (0, 1)$，恒有 $\\ln X < 0$，故不等式等价于 $-1 \\le \\ln X < 0 \\iff e^{-1} \\le X < 1$。\n因为 $X \\sim U(0, 1)$，所求概率为 $1 - \\frac{1}{e}$。选 B。",
    "steps": [
      "取自然对数将幂指不等式等价转化为 $(\\ln X)^2 \\le 1$",
      "结合 $0<X<1 \\implies \\ln X < 0$ 得出 $e^{-1} \\le X < 1$",
      "由 $U(0,1)$ 区间长度求得概率 $1 - \\frac{1}{e}$"
    ],
    "keyPoints": [
      "均匀分布概率计算",
      "对数不等式求解"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "概率论",
      "均匀分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{1}{e}$",
      "B. $1 - \\frac{1}{e}$",
      "C. $\\frac{1}{\\sqrt{e}}$",
      "D. $1 - \\frac{1}{\\sqrt{e}}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s4-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "大数定律与中心极限定理",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T10】设 $X_1, X_2, \\cdots, X_n$ 为来自总体 $X$ 的简单随机样本，$X$ 服从参数 $\\lambda = 1$ 的泊松分布，$\\Phi(x)$ 为 $N(0, 1)$ 的分布函数，则 $\\lim_{n\\to\\infty} P\\left\\{\\sum_{k=1}^n X_k \\le n\\right\\} =$（ ）。",
    "correctAnswer": "A",
    "explanation": "因为 $X \\sim P(1)$，所以期望与方差均为 $\\mu = 1, \\sigma^2 = 1$。\n由独立同分布中心极限定理（列维-林德伯格定理）：\n$P\\left\\{\\sum_{k=1}^n X_k \\le n\\right\\} = P\\left\\{\\frac{\\sum_{k=1}^n X_k - n\\cdot 1}{\\sqrt{n}\\cdot 1} \\le \\frac{n - n}{\\sqrt{n}}\\right\\} = P\\left\\{\\frac{\\sum_{k=1}^n X_k - n}{\\sqrt{n}} \\le 0\\right\\} \\to \\Phi(0)$（即 $\\frac{1}{2}$）。选 A。",
    "steps": [
      "确认泊松分布 $P(1)$ 的均值 $\\mu=1$ 与方差 $\\sigma^2=1$",
      "对样本和进行标准化并应用列维-林德伯格中心极限定理，得 $\\Phi(0)$"
    ],
    "keyPoints": [
      "独立同分布中心极限定理",
      "泊松分布数字特征"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "概率论",
      "极限定理"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\Phi(0)$",
      "B. $\\Phi(\\frac{1}{2})$",
      "C. $\\Phi(1)$",
      "D. $\\Phi(\\sqrt{2})$"
    ]
  },
  {
    "id": "math-prob-lilin6-s4-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T16】设总体 $X$ 与总体 $Y$ 相互独立，且都服从 $N(0, \\sigma^2)$ $(\\sigma > 0)$，$X_1, X_2, \\cdots, X_n$ 与 $Y_1, Y_2, \\cdots, Y_m$ 分别为来自总体 $X$ 与 $Y$ 的简单随机样本，若 $T = \\frac{2\\sum_{i=1}^n X_i}{\\sqrt{\\sum_{i=1}^m Y_i^2}}$ 服从 $t$ 分布，则 $\\frac{n}{m} =$ ______。",
    "correctAnswer": "$\\frac{1}{4}$",
    "explanation": "构造标准 $t(m)$ 分布结构：\n分子中 $2\\sum_{i=1}^n X_i \\sim N(0, 4n\\sigma^2)$，故 $U = \\frac{2\\sum_{i=1}^n X_i}{2\\sqrt{n}\\sigma} \\sim N(0, 1)$；\n分母中 $V = \\frac{\\sum_{i=1}^m Y_i^2}{\\sigma^2} \\sim \\chi^2(m)$，且 $U$ 与 $V$ 相互独立。\n标准 $t(m)$ 变量为 $\\frac{U}{\\sqrt{V/m}} = \\frac{2\\sum_{i=1}^n X_i}{2\\sqrt{n}\\sigma} \\cdot \\frac{\\sqrt{m}\\sigma}{\\sqrt{\\sum_{i=1}^m Y_i^2}} = \\frac{\\sqrt{m}}{2\\sqrt{n}} \\cdot T$。\n故 $T$ 服从 $t$ 分布 $\\iff \\frac{\\sqrt{m}}{2\\sqrt{n}} = 1 \\iff 2\\sqrt{\\frac{n}{m}} = 1 \\iff \\frac{n}{m} = \\frac{1}{4}$。",
    "steps": [
      "分别对分子求和作标准正态化、对分母平方和作卡方标准化",
      "比较系数与标准 $t(m)$ 定义使常数因子为 1，解得 $\\frac{n}{m} = \\frac{1}{4}$"
    ],
    "keyPoints": [
      "三大抽样分布构造（t 分布）"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "数理统计",
      "抽样分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s4-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T22（12分）】设随机变量 $X$ 与 $Y$ 相互独立，且服从同一分布 $N\\left(\\mu, \\frac{\\sigma^2}{2}\\right)$，其中 $\\sigma$ $(\\sigma > 0)$ 是未知参数，记 $Z = X - Y$。\n（I）若 $Z_1, Z_2, \\cdots, Z_{2n}$ $(n \\ge 2)$ 是总体 $Z$ 的简单随机样本，求 $\\sigma^2$ 的最大似然估计量 $\\widehat{\\sigma^2}$；\n（II）记 $U = \\sum_{i=1}^{n+1} Z_i$，$V = \\sum_{i=n}^{2n} Z_i$，求相关系数 $\\rho_{UV}$（注：原卷印刷写“利用 (I) 的 $\\widehat{\\sigma^2}$，求相关系数 $\\rho_{UV}$”，实质在求线性相关系数时总体方差 $\\sigma^2$ 或替换估计 $\\widehat{\\sigma^2}$ 分子分母完全相消）。",
    "correctAnswer": "（I）$\\widehat{\\sigma^2} = \\frac{1}{2n}\\sum_{i=1}^{2n} Z_i^2$；（II）$\\rho_{UV} = \\frac{2}{n + 1}$。",
    "explanation": "**（I）求总体 $Z$ 分布与 MLE**：\n由于 $X, Y \\sim N(\\mu, \\frac{\\sigma^2}{2})$ 且独立，线性组合 $Z = X - Y \\sim N(0, \\sigma^2)$（期望 $\\mu-\\mu=0$，方差 $\\frac{\\sigma^2}{2}+\\frac{\\sigma^2}{2} = \\sigma^2$）。\n写出总体 $Z$ 的样本似然函数：\n$L(\\sigma^2) = \\prod_{i=1}^{2n} \\frac{1}{\\sqrt{2\\pi\\sigma^2}} e^{-\\frac{Z_i^2}{2\\sigma^2}} = (2\\pi\\sigma^2)^{-n} \\exp\\left(-\\frac{1}{2\\sigma^2}\\sum_{i=1}^{2n} Z_i^2\\right)$。\n取对数：$\\ln L(\\sigma^2) = -n\\ln(2\\pi) - n\\ln(\\sigma^2) - \\frac{1}{2\\sigma^2}\\sum_{i=1}^{2n} Z_i^2$。\n对 $\\theta = \\sigma^2$ 求导并令为零：\n$-\\frac{n}{\\sigma^2} + \\frac{1}{2(\\sigma^2)^2}\\sum_{i=1}^{2n} Z_i^2 = 0 \\implies \\widehat{\\sigma^2} = \\frac{1}{2n}\\sum_{i=1}^{2n} Z_i^2$。\n\n**（II）计算相关系数 $\\rho_{UV}$**：\n$U = Z_1 + \\cdots + Z_{n+1}$（共 $n+1$ 项独立同分布变量），$V = Z_n + \\cdots + Z_{2n}$（共 $n+1$ 项），两者公共重迭项恰为 $Z_n$ 和 $Z_{n+1}$ 两项！\n计算数字特征：\n- $D(U) = (n + 1)\\sigma^2$，$D(V) = (n + 1)\\sigma^2$；\n- $\\text{Cov}(U, V) = \\text{Cov}(Z_n + Z_{n+1}, Z_n + Z_{n+1}) = D(Z_n) + D(Z_{n+1}) = 2\\sigma^2$（若直接用 $\\widehat{\\sigma^2}$ 代入计算协方差与方差，$D$ 与 $\\text{Cov}$ 中的 $\\widehat{\\sigma^2}$ 因子同理完全约掉）。\n因此 $\\rho_{UV} = \\frac{\\text{Cov}(U, V)}{\\sqrt{D(U)D(V)}} = \\frac{2\\sigma^2}{(n + 1)\\sigma^2} = \\frac{2}{n + 1}$。",
    "steps": [
      "（3分）推导出 $Z = X - Y \\sim N(0, \\sigma^2)$",
      "（4分）构建似然函数并对 $\\sigma^2$ 求导归零得出最大似然估计 $\\widehat{\\sigma^2} = \\frac{1}{2n}\\sum_{i=1}^{2n} Z_i^2$",
      "（5分）识别 $U$ 与 $V$ 仅在 $Z_n, Z_{n+1}$ 两项重叠，分别求得 $D(U)=D(V)=(n+1)\\sigma^2$ 及 $\\text{Cov}(U,V)=2\\sigma^2$，约分得 $\\rho_{UV} = \\frac{2}{n+1}$"
    ],
    "keyPoints": [
      "正态总体差分布",
      "方差最大似然估计",
      "重叠样本和的相关系数"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "数理统计",
      "点估计与相关系数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s5-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T8】设随机变量 $X$ 与 $Y$ 相互独立，且服从同一分布 $P\\{X = k\\} = P\\{Y = k\\} = p(1 - p)^{k - 1}$，$0 < p < 1, k = 1, 2, \\cdots$，对于给定的 $m(m \\ge 2)$，则 $P\\{X = k \\mid X + Y = m\\} =$（ ）。",
    "correctAnswer": "A",
    "explanation": "几何分布条件卷积结论（对于满足 $1 \\le k \\le m-1$ 的有效取值）：\n由条件概率定义及 $X, Y$ 独立性：\n- 对任意正整数 $i \\in \\{1, 2, \\dots, m-1\\}$，联合概率均为：\n  $$P\\{X = i, X + Y = m\\} = P\\{X = i\\} P\\{Y = m - i\\} = p(1-p)^{i-1} \\cdot p(1-p)^{m-i-1} = p^2 (1-p)^{m-2}$$\n  可见该概率完全与 $i$ 无关（等可能取 $i = 1, 2, \\dots, m-1$ 共 $m-1$ 种值）！\n- 求分母全概率：\n  $$P\\{X + Y = m\\} = \\sum_{i=1}^{m-1} P\\{X = i, Y = m - i\\} = (m - 1) p^2 (1-p)^{m-2}$$\n- 故对任意合法 $k \\in \\{1, 2, \\dots, m-1\\}$，条件分布为离散均匀分布：\n  $$P\\{X = k \\mid X + Y = m\\} = \\frac{p^2 (1-p)^{m-2}}{(m - 1) p^2 (1-p)^{m-2}} = \\frac{1}{m - 1}$$\n选 A。",
    "steps": [
      "写出联合事件概率 $P\\{X=i, Y=m-i\\} = p^2(1-p)^{m-2}$，发现其不依赖于 $i$",
      "对 $i=1, \\dots, m-1$ 求和得到 $P\\{X+Y=m\\} = (m-1)p^2(1-p)^{m-2}$",
      "相除得出条件概率为 $\\frac{1}{m-1}$"
    ],
    "keyPoints": [
      "几何分布",
      "独立同分布变量之和的条件概率"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "概率论",
      "几何分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $\\frac{1}{m - 1}$",
      "B. $\\frac{1}{m}$",
      "C. $\\frac{1}{m + 1}$",
      "D. $\\frac{m - 1}{m}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s5-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T9】设 $X_1$ 与 $X_2$ 相互独立，且均服从 $N(\\mu, \\sigma^2)$，$\\bar{X} = \\frac{1}{2}(X_1 + X_2)$，则（ ）。",
    "correctAnswer": "B",
    "explanation": "直接化简偏差项即可秒杀：\n因为 $\\bar{X} = \\frac{X_1 + X_2}{2}$，所以：\n$$X_1 - \\bar{X} = \\frac{X_1 - X_2}{2}, \\qquad X_2 - \\bar{X} = \\frac{X_2 - X_1}{2} = -(X_1 - \\bar{X})$$\n可见二者互为相反数（严格负线性相关！相关系数 $\\rho = -1 \\ne 0$），因此必然**相关**（且不独立），即 **B 正确**、A 错误。\n对于 C、D：由于 $(X_1, X_2)$ 服从二维独立同方差正态分布，故 $(X_1+X_2, X_1-X_2)$ 也服从二维正态分布，且协方差\n$$\\text{Cov}(X_1+X_2, X_1-X_2) = D(X_1) - D(X_2) = \\sigma^2 - \\sigma^2 = 0$$\n由二维正态不相关与独立等价，故 $X_1+X_2$ 与 $X_1-X_2$ 不相关且**相互独立**，C、D 均错。选 B。",
    "steps": [
      "代入 $\\bar{X}=\\frac{X_1+X_2}{2}$ 看出 $X_1-\\bar{X} = -(X_2-\\bar{X})$",
      "直接判断二者相关系数为 $-1$（完全负线性相关），确认 B 正确、A 错",
      "计算 $\\text{Cov}(X_1+X_2, X_1-X_2) = 0$ 并结合二维正态分布性质排除 C、D"
    ],
    "keyPoints": [
      "协方差与相关性",
      "二维正态不相关与独立等价性",
      "样本偏差相关性"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "概率论",
      "相关性与独立性"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $X_1 - \\bar{X}$ 与 $X_2 - \\bar{X}$ 相互独立",
      "B. $X_1 - \\bar{X}$ 与 $X_2 - \\bar{X}$ 相关",
      "C. $X_1 + X_2$ 与 $X_1 - X_2$ 不相互独立",
      "D. $X_1 + X_2$ 与 $X_1 - X_2$ 相关"
    ]
  },
  {
    "id": "math-prob-lilin6-s5-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T10】设 $X_1, X_2, \\cdots, X_n$ 是来自总体 $X \\sim N(0, 1)$ 的简单随机样本，$Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$ $(m < n)$，则 $E(Y)$ 与 $D(Y)$ 分别为（ ）。（注：原卷印刷第一项括号外漏印平方符号 $^2$，结合四个选项及命题结构此处按正常标准题型补充完整）",
    "correctAnswer": "D",
    "explanation": "【印刷勘误提示】：原卷 PDF 第 22 页第 10 题印作 $Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right) + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$，前一项漏印括号外的平方符号（$^2$）；若按漏印原式则 $E(Y)=1, D(Y)=2+\\frac{1}{m}$，与四个选项均不匹配。按正规命题 $Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$ 解析如下：\n\n构造标准正态随机变量的平方和（$\\chi^2$ 分布）：\n1. 令 $U = \\frac{1}{\\sqrt{m}}\\sum_{i=1}^m X_i$。因 $X_i \\stackrel{\\text{i.i.d.}}{\\sim} N(0, 1)$，故 $U \\sim N(0, 1)$，从而 $U^2 = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 \\sim \\chi^2(1)$。\n2. 令 $V = \\frac{1}{\\sqrt{n-m}}\\sum_{i=m+1}^n X_i$。同理 $V \\sim N(0, 1)$，从而 $V^2 = \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2 \\sim \\chi^2(1)$。\n3. 由于两组样本下标互不相交，$U$ 与 $V$ 相互独立，由 $\\chi^2$ 分布的可加性得：\n   $$Y = U^2 + V^2 \\sim \\chi^2(1 + 1) = \\chi^2(2)$$\n4. 由 $\\chi^2(k)$ 分布的数字特征公式 $E = k, D = 2k$：\n   $$E(Y) = 2, \\qquad D(Y) = 2 \\times 2 = 4$$\n选 D。",
    "steps": [
      "辨别并指出原卷第一项括号外漏印平方的排版笔误，还原标准式",
      "标准化两部分和分别得 $U \\sim N(0,1)$ 与 $V \\sim N(0,1)$ 且相互独立",
      "利用 $\\chi^2$ 分布可加性判定 $Y = U^2 + V^2 \\sim \\chi^2(2)$，得 $E(Y)=2, D(Y)=4$"
    ],
    "keyPoints": [
      "卡方分布的构造与可加性",
      "卡方分布的期望与方差"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "数理统计",
      "卡方分布",
      "原卷勘误"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $0, n$",
      "B. $0, 2$",
      "C. $n, 2n$",
      "D. $2, 4$"
    ]
  },
  {
    "id": "math-prob-lilin6-s5-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T16】设二维随机变量 $(X, Y)$ 在 $D = \\{(x, y) \\mid 0 \\le x \\le 2, 0 \\le y \\le 1\\}$ 上服从均匀分布，$Z = \\max(X, Y)$，则 $D(Z) =$ ______。",
    "correctAnswer": "$\\frac{35}{144}$",
    "explanation": "因为 $(X, Y)$ 在矩形 $[0, 2]\\times[0, 1]$ 上服从均匀分布，所以 $X \\sim U(0, 2)$ 与 $Y \\sim U(0, 1)$ **相互独立**！\n先求 $Z = \\max(X, Y)$ 的分布函数 $F_Z(z)$：\n$$F_Z(z) = P(X \\le z, Y \\le z) = F_X(z) F_Y(z) = \\begin{cases} 0, & z < 0, \\\\ \\frac{z}{2} \\cdot z = \\frac{z^2}{2}, & 0 \\le z < 1, \\\\ \\frac{z}{2} \\cdot 1 = \\frac{z}{2}, & 1 \\le z < 2, \\\\ 1, & z \\ge 2. \\end{cases}$$\n求导得概率密度 $f_Z(z)$（$0 < z < 1$ 时 $f_Z(z) = z$；$1 < z < 2$ 时 $f_Z(z) = \\frac{1}{2}$；其他为 $0$）。\n直接积分求一二阶原点矩：\n- $E(Z) = \\int_0^1 z^2\\,dz + \\int_1^2 \\frac{z}{2}\\,dz = \\frac{1}{3} + \\frac{1}{4}(4 - 1) = \\frac{1}{3} + \\frac{3}{4} = \\frac{13}{12}$。\n- $E(Z^2) = \\int_0^1 z^3\\,dz + \\int_1^2 \\frac{z^2}{2}\\,dz = \\frac{1}{4} + \\frac{1}{6}(8 - 1) = \\frac{1}{4} + \\frac{7}{6} = \\frac{17}{12}$。\n- 因此方差为：\n  $$D(Z) = E(Z^2) - [E(Z)]^2 = \\frac{17}{12} - \\left(\\frac{13}{12}\\right)^2 = \\frac{204 - 169}{144} = \\frac{35}{144}$$",
    "steps": [
      "由矩形域均匀分布识别 $X \\sim U(0,2)$ 与 $Y \\sim U(0,1)$ 相互独立",
      "分段写出 $F_Z(z) = F_X(z)F_Y(z)$ 并求导得到密度函数 $f_Z(z)$",
      "积分算得 $E(Z)=\\frac{13}{12}, E(Z^2)=\\frac{17}{12}$，代入得 $D(Z)=\\frac{35}{144}$"
    ],
    "keyPoints": [
      "二维均匀分布与独立性",
      "最大值随机变量的分布",
      "方差计算"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "概率论",
      "最值分布与方差"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s5-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "一维随机变量及其分布",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T22】(本题满分 12 分) 设某手机一个月的需求量 $X$ 是随机变量，其概率密度为 $f(x) = \\begin{cases} x e^{-x}, & x > 0, \\\\ 0, & x \\le 0, \\end{cases}$ 记 $k$ 个月的需求量为 $Y_k$，设各个月的需求量相互独立。\n(I) 求 $Y_2$ 与 $Y_3$ 的概率密度函数 $f_2(x)$ 与 $f_3(x)$；\n(II) 记连续三个月中的月最大需求量为 $Y$，求 $Y$ 的概率密度函数。",
    "correctAnswer": "(I) $f_2(x) = \\begin{cases} \\frac{x^3}{6}e^{-x}, & x>0 \\\\ 0, & x\\le 0 \\end{cases}$，$f_3(x) = \\begin{cases} \\frac{x^5}{120}e^{-x}, & x>0 \\\\ 0, & x\\le 0 \\end{cases}$；(II) $f_Y(y) = \\begin{cases} 3\\left[1 - (1+y)e^{-y}\\right]^2 y e^{-y}, & y > 0 \\\\ 0, & y \\le 0 \\end{cases}$",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 用卷积公式（或 $\\Gamma$ 分布可加性验证）求 $f_2(x), f_3(x)$（7 分）**\n设各月独立同分布变量为 $X_1, X_2, X_3 \\sim f(x)$。\n1. 当 $x \\le 0$ 时，显然 $f_2(x) = f_3(x) = 0$。\n2. 当 $x > 0$ 时，由两独立变量之和的卷积公式计算 $Y_2 = X_1 + X_2$ 的密度：\n   $$f_2(x) = \\int_{-\\infty}^{+\\infty} f(t) f(x-t)\\,dt = \\int_0^x t e^{-t} (x - t) e^{-(x-t)}\\,dt = e^{-x}\\int_0^x (xt - t^2)\\,dt$$\n   $$= e^{-x}\\left[\\frac{x t^2}{2} - \\frac{t^3}{3}\\right]_0^x = \\frac{1}{6}x^3 e^{-x}$$\n3. 再由 $Y_3 = Y_2 + X_3$ 用一次卷积计算 $f_3(x)$（$x > 0$）：\n   $$f_3(x) = \\int_0^x f_2(t) f(x - t)\\,dt = \\int_0^x \\frac{1}{6}t^3 e^{-t} (x - t) e^{-(x-t)}\\,dt = \\frac{e^{-x}}{6}\\int_0^x (x t^3 - t^4)\\,dt$$\n   $$= \\frac{e^{-x}}{6}\\left(\\frac{x^5}{4} - \\frac{x^5}{5}\\right) = \\frac{1}{120}x^5 e^{-x}$$\n（注：本质上 $X \\sim \\Gamma(2, 1)$，故 $Y_k \\sim \\Gamma(2k, 1)$，密度为 $\\frac{x^{2k-1}}{(2k-1)!}e^{-x}$。）\n\n**(II) 求三个月最大需求量 $Y = \\max(X_1, X_2, X_3)$ 的密度函数（5 分）**\n1. 先计算单月需求量 $X$ 的分布函数 $F(y)$：当 $y \\le 0$ 时 $F(y) = 0$；当 $y > 0$ 时，利用分部积分：\n   $$F(y) = \\int_0^y x e^{-x}\\,dx = \\left[-x e^{-x} - e^{-x}\\right]_0^y = 1 - (1 + y)e^{-y}$$\n2. 由于 $X_1, X_2, X_3$ 独立同分布，最大值 $Y$ 的分布函数为：\n   $$F_Y(y) = P(\\max(X_1, X_2, X_3) \\le y) = [F(y)]^3 = \\begin{cases} [1 - (1+y)e^{-y}]^3, & y > 0, \\\\ 0, & y \\le 0. \\end{cases}$$\n3. 求导得 $Y$ 的概率密度函数（并在 $y=0$ 处检验连续性）：\n   $$f_Y(y) = 3[F(y)]^2 f(y) = \\begin{cases} 3\\left[1 - (1+y)e^{-y}\\right]^2 y e^{-y}, & y > 0, \\\\ 0, & y \\le 0. \\end{cases}$$",
    "steps": [
      "【踩分点 1 (4分)】：利用独立变量卷积公式算出 $Y_2$ 密度 $\\frac{x^3}{6}e^{-x}$ $(x>0)$",
      "【踩分点 2 (3分)】：再次应用卷积算出 $Y_3$ 密度 $\\frac{x^5}{120}e^{-x}$ $(x>0)$",
      "【踩分点 3 (5分)】：先积分求出单月分布函数 $F(y) = 1-(1+y)e^{-y}$，再对 $F_Y(y)=[F(y)]^3$ 求导得出最大需求量密度"
    ],
    "keyPoints": [
      "卷积公式求随机变量和密度",
      "Gamma分布可加性",
      "独立同分布最大值分布与密度"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "概率论",
      "卷积与最值分布",
      "解答题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s6-q08",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T8】设总体 $X \\sim N(\\mu, \\sigma^2)(\\sigma > 0)$，$X_1, X_2, \\cdots, X_n$ 为来自总体 $X$ 的简单随机样本，$\\bar{X}$ 为样本均值，若 $P\\{|X - \\mu| < a\\} = P\\{|\\bar{X} - \\mu| < \\pi\\}$，则 $a =$（ ）。",
    "correctAnswer": "C",
    "explanation": "注意辨析 B（$\\sqrt{n\\pi}$ 都在根号下）与 C（$\\sqrt{n}\\pi$ 仅 $n$ 在根号下）！\n由于 $X \\sim N(\\mu, \\sigma^2)$ 且样本均值 $\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$，分别标准化为标准正态分布 $Z \\sim N(0, 1)$：\n- 左边：$P\\{|X - \\mu| < a\\} = P\\left\\{\\left|\\frac{X - \\mu}{\\sigma}\\right| < \\frac{a}{\\sigma}\\right\\} = 2\\Phi\\left(\\frac{a}{\\sigma}\\right) - 1$。\n- 右边：$P\\{|\\bar{X} - \\mu| < \\pi\\} = P\\left\\{\\left|\\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}\\right| < \\frac{\\sqrt{n}\\pi}{\\sigma}\\right\\} = 2\\Phi\\left(\\frac{\\sqrt{n}\\pi}{\\sigma}\\right) - 1$。\n由于 $\\Phi(t)$ 严格单调递增，两概率相等当且仅当分位点相等：\n$$\\frac{a}{\\sigma} = \\frac{\\sqrt{n}\\pi}{\\sigma} \\implies a = \\sqrt{n}\\,\\pi$$\n选 C。",
    "steps": [
      "利用正态分布及样本均值分布 $\\bar{X} \\sim N(\\mu, \\frac{\\sigma^2}{n})$ 对两事件进行标准化",
      "令标准化后的对称分位点相等 $\\frac{a}{\\sigma} = \\frac{\\sqrt{n}\\pi}{\\sigma}$，解得 $a = \\sqrt{n}\\pi$"
    ],
    "keyPoints": [
      "正态总体的样本均值分布",
      "标准正态分布转化"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "数理统计",
      "抽样分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $n\\pi$",
      "B. $\\sqrt{n\\pi}$",
      "C. $\\sqrt{n}\\,\\pi$",
      "D. $(n - 1)\\pi$"
    ]
  },
  {
    "id": "math-prob-lilin6-s6-q09",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "随机变量的数字特征",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T9】设 $(X, Y) \\sim N(1, 1; 2, 2; 0)$，$U = X + 2Y$，$V = X - 2Y$，则 $\\rho_{UV} =$（ ）。",
    "correctAnswer": "B",
    "explanation": "注意标准记号 $(X, Y) \\sim N(\\mu_1, \\mu_2; \\sigma_1^2, \\sigma_2^2; \\rho)$ 中第 3、4 个参数是**方差** $\\sigma_1^2 = 2, \\sigma_2^2 = 2$（若理解为标准差则无平方差仍约去，此处 $\\sigma_1^2 = \\sigma_2^2 = 2$ 与 $\\rho=0$ 说明 $X, Y$ 不相关/独立）：\n- $\\text{Cov}(U, V) = \\text{Cov}(X + 2Y, X - 2Y) = D(X) - 4D(Y) = 2 - 4(2) = -6$。\n- $D(U) = D(X) + 4D(Y) = 2 + 8 = 10$；\n- $D(V) = D(X) + 4D(Y) = 2 + 8 = 10$。\n代入相关系数公式：\n$$\\rho_{UV} = \\frac{\\text{Cov}(U, V)}{\\sqrt{D(U)D(V)}} = \\frac{-6}{\\sqrt{10 \\times 10}} = -\\frac{3}{5}$$\n选 B。",
    "steps": [
      "读取二维正态参数 $D(X)=D(Y)=2$ 及 $\\text{Cov}(X,Y)=0$",
      "分别算出 $\\text{Cov}(U,V)=D(X)-4D(Y)=-6$ 和 $D(U)=D(V)=10$",
      "代入相关系数定义算出 $\\rho_{UV} = -\\frac{3}{5}$"
    ],
    "keyPoints": [
      "二维正态分布参数记号",
      "协方差与方差的线性性质",
      "相关系数"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "概率论",
      "相关系数"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $-\\frac{2}{5}$",
      "B. $-\\frac{3}{5}$",
      "C. $\\frac{3}{5}$",
      "D. $\\frac{2}{5}$"
    ]
  },
  {
    "id": "math-prob-lilin6-s6-q10",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "数理统计与参数估计",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T10】设 $X_1, X_2, \\cdots, X_{2n}$ 为来自总体 $X \\sim N(0, 1)$ 的简单随机样本，记 $T_1 = \\sum_{i=1}^{2n}\\left(X_i - \\frac{1}{2n}\\sum_{i=1}^{2n}X_i\\right)^2$，$T_2 = \\frac{1}{2}\\sum_{i=1}^{2n} X_i^2 + \\sum_{i=1}^n X_{2i-1}X_{2i}$，则（ ）。",
    "correctAnswer": "C",
    "explanation": "分别分析统计量 $T_1$ 与 $T_2$ 的精确分布：\n1. **分析 $T_1$**：记样本容量 $N = 2n$，显然 $T_1 = (N-1)S^2$，由于总体 $X \\sim N(0, 1)$（即 $\\sigma^2 = 1$），由抽样定理知：\n   $$T_1 = \\sum_{i=1}^{2n}(X_i - \\bar{X})^2 \\sim \\chi^2(2n - 1)$$\n   从而 **$E(T_1) = 2n - 1$**，**$D(T_1) = 2(2n - 1)$**！\n2. **分析 $T_2$（配方化简神技）**：将下标成对 $(X_{2i-1}, X_{2i})$ 分组相加：\n   $$T_2 = \\sum_{i=1}^n \\left(\\frac{1}{2}X_{2i-1}^2 + X_{2i-1}X_{2i} + \\frac{1}{2}X_{2i}^2\\right) = \\sum_{i=1}^n \\left(\\frac{X_{2i-1} + X_{2i}}{\\sqrt{2}}\\right)^2$$\n   令 $Z_i = \\frac{X_{2i-1} + X_{2i}}{\\sqrt{2}}$ $(i = 1, \\dots, n)$。由于 $X_k \\stackrel{\\text{i.i.d.}}{\\sim} N(0, 1)$，故各 $Z_i \\stackrel{\\text{i.i.d.}}{\\sim} N(0, 1)$ 且相互独立！\n   从而：\n   $$T_2 = \\sum_{i=1}^n Z_i^2 \\sim \\chi^2(n)$$\n   立得 **$E(T_2) = n$**，$D(T_2) = 2n$！\n对照四个选项，只有 C（$E(T_2)=n, D(T_1)=2(2n-1)$）正确。选 C。",
    "steps": [
      "识别 $T_1 = (2n-1)S^2 \\sim \\chi^2(2n-1)$，得出 $E(T_1)=2n-1$ 与 $D(T_1)=2(2n-1)$",
      "将 $T_2$ 按奇偶配对配方成 $\\sum_{i=1}^n \\left(\\frac{X_{2i-1}+X_{2i}}{\\sqrt{2}}\\right)^2$",
      "确定 $T_2 \\sim \\chi^2(n)$ 并得出 $E(T_2) = n$，匹配选 C"
    ],
    "keyPoints": [
      "卡方分布的识别",
      "配对正态变量平方和化卡方分布"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "数理统计",
      "卡方分布"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md",
    "options": [
      "A. $E(T_1) = 2n, D(T_2) = n$",
      "B. $E(T_1) = n, D(T_2) = 2n - 1$",
      "C. $E(T_2) = n, D(T_1) = 2(2n - 1)$",
      "D. $E(T_2) = 2n, D(T_1) = 2n - 1$"
    ]
  },
  {
    "id": "math-prob-lilin6-s6-q16",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "假设检验",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T16】设 $X_1, X_2, \\cdots, X_n$ 为来自总体 $X \\sim N(\\mu, \\sigma^2)$ 的简单随机样本，$\\sigma^2$ 未知，$\\bar{X}$ 为样本均值，$S^2$ 为样本方差，检验水平为 $\\alpha$，则 $H_0: \\mu \\ge \\mu_0,\\ H_1: \\mu < \\mu_0$ 的拒绝域为 ______。",
    "correctAnswer": "$\\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} < -t_\\alpha(n-1)$",
    "explanation": "（注意是**单侧（左单侧）$t$ 检验**，拒绝域临界值为单侧分位点 $t_\\alpha(n-1)$，千万不要写成 $t_{\\alpha/2}$ 或双侧不等式！）\n当 $\\sigma^2$ 未知时，检验统计量为：\n$$T = \\frac{\\bar{X} - \\mu_0}{S / \\sqrt{n}} \\stackrel{H_0(\\mu=\\mu_0)}{\\sim} t(n - 1)$$\n备择假设为 $H_1: \\mu < \\mu_0$（左边更小则倾向拒绝 $H_0$），故拒绝域形如 $\\{T < c\\}$。由显著性水平条件 $P_{\\mu=\\mu_0}(T < c) = \\alpha$ 及 $t$ 分布关于 $0$ 的对称性，有 $c = -t_\\alpha(n-1)$。\n因此拒绝域为 $\\left\\{(x_1, \\dots, x_n) \\;\\middle|\\; \\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}} < -t_\\alpha(n-1)\\right\\}$（也可等价写为 $\\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\le -t_\\alpha(n-1)$ 或 $\\bar{X} < \\mu_0 - \\frac{S}{\\sqrt{n}}t_\\alpha(n-1)$）。",
    "steps": [
      "$\\sigma^2$ 未知选取 $t$ 统计量 $T = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t(n-1)$",
      "根据备择假设 $H_1: \\mu < \\mu_0$ 判定为左侧检验，临界点为 $-t_\\alpha(n-1)$，写出拒绝域"
    ],
    "keyPoints": [
      "正态总体单侧 t 检验",
      "拒绝域写法与分位点"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "数理统计",
      "假设检验"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  },
  {
    "id": "math-prob-lilin6-s6-q22",
    "domain": "math",
    "subject": "概率论与数理统计",
    "scope": [
      "数一"
    ],
    "chapter": "多维随机变量及其分布",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T22】(本题满分 12 分) 设随机变量 $X$ 在区间 $(1, 2)$ 内服从均匀分布，在 $X = x$ 的条件下，$Y$ 服从参数为 $x$ 的指数分布，记 $Z = XY$。\n(I) 求 $Z$ 的概率密度 $f_Z(z)$；\n(II) 问 $X$ 与 $Z$ 是否相关？说明理由。",
    "correctAnswer": "(I) $f_Z(z) = \\begin{cases} e^{-z}, & z > 0 \\\\ 0, & z \\le 0 \\end{cases}$（标准指数分布 $\\operatorname{Exp}(1)$）；(II) $X$ 与 $Z$ 不相关（事实上 $X$ 与 $Z$ 相互独立）",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 用全概率/联合分布函数法求 $f_Z(z)$（7 分）**\n1. 写出 $X$ 的边缘密度与 $(X, Y)$ 的联合概率密度：\n   $f_X(x) = \\begin{cases} 1, & 1 < x < 2, \\\\ 0, & \\text{其他}. \\end{cases}$，条件密度 $f_{Y|X}(y|x) = \\begin{cases} x e^{-xy}, & y > 0, \\\\ 0, & y \\le 0 \\end{cases}$ $(1 < x < 2)$。\n   因此联合密度为：\n   $$f(x, y) = f_X(x) f_{Y|X}(y|x) = \\begin{cases} x e^{-xy}, & 1 < x < 2,\\ y > 0, \\\\ 0, & \\text{其他}. \\end{cases}$$\n2. 求 $Z = XY$ 的分布函数 $F_Z(z) = P(XY \\le z)$：\n   - 当 $z \\le 0$ 时，因 $X \\in (1, 2), Y > 0$，故 $F_Z(z) = 0$。\n   - 当 $z > 0$ 时：\n     $$F_Z(z) = \\int_1^2 dx \\int_0^{z/x} x e^{-xy}\\,dy = \\int_1^2 \\left[-e^{-xy}\\right]_0^{z/x}\\,dx = \\int_1^2 \\left(1 - e^{-z}\\right)\\,dx = 1 - e^{-z}$$\n3. 求导得 $Z$ 的概率密度：\n   $$f_Z(z) = \\begin{cases} e^{-z}, & z > 0, \\\\ 0, & z \\le 0. \\end{cases}$$\n\n**(II) 判定 $X$ 与 $Z$ 的相关性（5 分）**\n**方法 A（利用独立性或联合分布直接说明）**：\n对任意实数 $x \\in (1, 2)$ 和 $z > 0$，考察联合分布函数：\n$$F_{X, Z}(x, z) = P(X \\le x,\\ XY \\le z) = \\int_1^x du \\int_0^{z/u} u e^{-uy}\\,dy = (x - 1)(1 - e^{-z}) = F_X(x) F_Z(z)$$\n（其余范围显然也满足 $F_{X, Z}(x, z) = F_X(x) F_Z(z)$），故 **$X$ 与 $Z$ 相互独立**！独立必不相关，因此 $X$ 与 $Z$ **不相关**。\n\n**方法 B（直接计算协方差验证 $\\text{Cov}(X, Z) = 0$）**：\n- $E(X) = \\frac{3}{2}$；\n- $E(Z) = \\int_0^{+\\infty} z e^{-z}\\,dz = 1$；\n- $E(XZ) = E(X^2 Y) = \\int_1^2 dx \\int_0^{+\\infty} x^2 y \\cdot x e^{-xy}\\,dy = \\int_1^2 x \\left(\\int_0^{+\\infty} u e^{-u}\\,du\\right)\\,dx = \\int_1^2 x\\,dx = \\frac{3}{2}$。（其中做内层换元 $u=xy$。）\n从而 $\\text{Cov}(X, Z) = E(XZ) - E(X)E(Z) = \\frac{3}{2} - \\frac{3}{2}\\times 1 = 0$，故 $X$ 与 $Z$ **不相关**！",
    "steps": [
      "【踩分点 1 (4分)】：由条件分布写出 $(X,Y)$ 联合密度 $f(x,y) = x e^{-xy}\\ (1<x<2, y>0)$",
      "【踩分点 2 (3分)】：积分求分布函数 $F_Z(z) = 1 - e^{-z}\\ (z>0)$，求导得 $f_Z(z) = e^{-z}\\ (z>0)$",
      "【踩分点 3 (5分)】：计算 $\\text{Cov}(X,Z) = E(X^2 Y) - E(X)E(Z) = 0$（或证明 $F_{X,Z}(x,z)=F_X(x)F_Z(z)$ 独立），得出不相关结论"
    ],
    "keyPoints": [
      "条件分布与联合密度",
      "随机变量乘积分布",
      "独立性与不相关判定"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "概率论",
      "条件分布与相关性",
      "解答题"
    ],
    "sourceNote": "01-考研数学/概率论与数理统计/26李林六套卷数一-概率分类题库与精析.md"
  }
]
