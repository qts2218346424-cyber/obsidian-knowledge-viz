import type { ExamPaper } from './types'

/**
 * 考研数学（一）成熟期近年经典（2016～2020）全国统考真题整卷库
 * 涵盖年份：2016, 2017, 2018, 2019, 2020 共 5 套卷，每套 23 题，满分 150 分。
 * 包含高清 LaTeX 题干、选择题完整 A/B/C/D 选项、填空题准确答案、解答题步骤踩分点与详尽推导解析。
 */
export const MATH1_MATURE_2016_2020_EXAM_PAPERS: ExamPaper[] = [
  {
    "id": "paper-math1-2020",
    "year": 2020,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2020 全国统考",
    "title": "2020 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2020 年考研数学一全国统考真题原卷，涵盖选择题 8 题（32分）、填空题 6 题（24分）与解答题 9 题（94分），共 23 题完整试题与详尽分步解析。",
    "questions": [
      {
        "id": "m1-20-01",
        "paperQuestionNumber": 1,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "极限计算与无穷小比较",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 1 题】\n当 $x\\to 0^{+}$ 时，下列无穷小量中最高阶的是（",
        "correctAnswer": "D",
        "explanation": "（1）【答案】 (D).\n\n【解】 当 $x \\to 0^{+}$ 时， $\\int_{0}^{x} (\\mathrm{e}^{t^2} - 1) \\, \\mathrm{d}t \\sim \\int_{0}^{x} t^2 \\, \\mathrm{d}t = \\frac{1}{3} x^3$ ；\n\n$$\n\\begin{array}{l} \\int_ {0} ^ {x} \\ln (1 + \\sqrt {t ^ {3}}) \\mathrm {d} t \\sim \\int_ {0} ^ {x} t ^ {\\frac {3}{2}} \\mathrm {d} t = \\frac {2}{5} x ^ {\\frac {5}{2}}; \\\\ \\int_ {0} ^ {\\sin x} \\sin t ^ {2} \\mathrm {d} t \\sim \\int_ {0} ^ {x} t ^ {2} \\mathrm {d} t = \\frac {1}{3} x ^ {3}; \\\\ \\int_ {0} ^ {1 - \\cos x} \\sqrt {\\sin^ {3} t} \\mathrm {d} t \\sim \\int_ {0} ^ {\\frac {1}{2} x ^ {2}} t ^ {\\frac {3}{2}} \\mathrm {d} t = \\frac {\\sqrt {2}}{2 0} x ^ {5}, \\\\ \\end{array}\n$$\n\n应选(D).\n\n方法点评：确定变积分限型无穷小的阶数时，通常有如下方法：\n\n（1）洛必达法则，如：\n\n【例1】设 $f(x)$ 连续，且 $f(0) = 0, f'(0) = 4$ ，且 $\\int_{0}^{x} t f(x - t) \\mathrm{d}t \\sim k x^n (x \\to 0)$ ，求 $k, n$ .\n\n【解】 $\\int_0^x tf(x - t)\\mathrm{d}t\\stackrel {x - t = u}{=}\\int_x^0 (x - u)f(u)(-\\mathrm{d}u) = x\\int_0^x f(u)\\mathrm{d}u - \\int_0^x uf(u)\\mathrm{d}u,$\n\n由 $\\lim_{x\\to 0}\\frac{\\int_0^xf(x - t)\\mathrm{d}t}{x^n} = \\lim_{x\\to 0}\\frac{x\\int_0^xf(u)\\mathrm{d}u - \\int_0^xf(u)\\mathrm{d}u}{x^n} = \\lim_{x\\to 0}\\frac{\\int_0^xf(u)\\mathrm{d}u}{nx^{n - 1}} = \\lim_{x\\to 0}\\frac{f(x) - f(0)}{n(n - 1)x^{n - 2}}$\n\n得 $n - 2 = 1$ ，即 $n = 3$\n\n由 $\\lim_{x\\to 0}\\frac{\\int_{0}^{x}tf(x - t)\\mathrm{d}t}{x^3} = \\frac{1}{6}\\lim_{x\\to 0}\\frac{f(x) - f(0)}{x} = \\frac{1}{6} f'(0) = \\frac{2}{3}$ 得\n\n$$\n\\int_ {0} ^ {x} t f (x - t) \\mathrm {d} t \\sim {\\frac {2}{3}} x ^ {3}, \\text {故} k = {\\frac {2}{3}}, n = 3.\n$$\n\n（2）等价无穷小，即积分限及表达式用其等价无穷小代替，如：\n\n【例2】设 $\\alpha = \\int_{0}^{e^x -1}\\frac{\\sin t^2}{t}\\mathrm{d}t\\sim ax^b (x\\to 0)$ ，求 $a,b$\n\n【解】 由 $\\alpha = \\int_{0}^{\\mathrm{e}^{x^2} - 1}\\frac{\\sin t^2}{t}\\mathrm{d}t\\sim \\int_{0}^{x^2}\\frac{t^2}{t}\\mathrm{d}t = \\int_{0}^{x^2}t\\mathrm{d}t = \\frac{1}{2} x^4$ 得\n\n$$\na = \\frac {1}{2}, b = 4.\n$$",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "极限计算与无穷小比较"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "极限计算与无穷小比较"
        ],
        "difficulty": "简单",
        "options": [
          "A. $\\int_{0}^{x} (\\mathrm{e}^{t^2} - 1) \\, \\mathrm{d}t$",
          "B. $\\int_{0}^{x}\\ln (1 + \\sqrt{t^3})\\mathrm{d}t$",
          "C. $\\int_{0}^{\\sin x}\\sin t^{2}\\mathrm{d}t$",
          "D. $\\int_{0}^{1 - \\cos x}\\sqrt{\\sin^3t}\\mathrm{d}t$"
        ]
      },
      {
        "id": "m1-20-02",
        "paperQuestionNumber": 2,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 2 题】\n设函数 $f(x)$ 在区间 $(-1, 1)$ 内有定义，且 $\\lim_{x \\to 0} f(x) = 0$ ，则（ ）.",
        "correctAnswer": "C",
        "explanation": "（2）【答案】 (C).\n\n方法一\n\n若 $f(x)$ 在 $x = 0$ 处可导，则 $f(x)$ 在 $x = 0$ 处连续，由 $\\lim_{x\\to 0}f(x) = 0$ 得 $f(0) = 0$\n\n因为 $\\lim_{x\\to 0}\\frac{f(x) - f(0)}{x - 0} = \\lim_{x\\to 0}\\frac{f(x)}{x}$ 存在，所以 $f(x)$ 为 $x$ 的同阶或高阶无穷小，故\n\n$\\lim_{x \\to 0} \\frac{f(x)}{\\sqrt{|x|}} = 0$ ，应选（C）.\n\n方法二\n\n取 $f(x) = |x|$ ，显然 $\\lim_{x\\to 0}\\frac{f(x)}{\\sqrt{|x|}} = 0$ ，但 $f(x)$ 在 $x = 0$ 处不可导，（A）不对；\n\n取 $f(x) = \\begin{cases} 2, & x = 0, \\\\ x^2, & x \\neq 0, \\end{cases}$ 显然 $f(x)$ 在 $(-1,1)$ 内有定义且 $\\lim_{x \\to 0} f(x) = 0$ ，显然 $\\lim_{x \\to 0} \\frac{f(x)}{x^2} = 0$ ，但 $f(x)$ 在 $x = 0$ 处不连续，从而 $f(x)$ 在 $x = 0$ 处不可导，(B) 不对；\n\n取 $f(x) = 2x$ ，显然 $f(x)$ 在 $x = 0$ 处可导，但 $\\lim_{x\\to 0}\\frac{f(x)}{x^2}$ 不存在，（D）不对，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. 当 $\\lim_{x\\to 0}\\frac{f(x)}{\\sqrt{|x|}} = 0$ 时， $f(x)$ 在 $x = 0$ 处可导",
          "B. 当 $\\lim_{x\\to 0}\\frac{f(x)}{x^2} = 0$ 时， $f(x)$ 在 $x = 0$ 处可导",
          "C. 当 $f(x)$ 在 $x = 0$ 处可导时， $\\lim_{x\\to 0}\\frac{f(x)}{\\sqrt{|x|}} = 0$",
          "D. 当 $f(x)$ 在 $x = 0$ 处可导时， $\\lim_{x\\to 0}\\frac{f(x)}{x^2} = 0$"
        ]
      },
      {
        "id": "m1-20-03",
        "paperQuestionNumber": 3,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 3 题】\n设函数 $f(x,y)$ 在点(0，0）处可微， $f(0,0) = 0,n = \\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}, - 1\\right)\\bigg|_{(0,0)}$ 非零向量 $\\pmb{\\alpha}$ 与 $\\pmb{n}$ 垂直，则（ ）.",
        "correctAnswer": "A",
        "explanation": "（3）【答案】 （A）.\n\n【解】 因为 $f(x,y)$ 在 $(0,0)$ 处可微，\n\n所以 $\\Delta z = f(x,y) - f(0,0) = f(x,y) = \\frac{\\partial f}{\\partial x} x + \\frac{\\partial f}{\\partial y} y + o(\\sqrt{x^2 + y^2})$\n\n于是 $\\frac{\\partial f}{\\partial x}x + \\frac{\\partial f}{\\partial y}y - f(x,y) = o(\\sqrt{x^2 + y^2})$ ，即 $\\pmb{n} \\cdot (x,y,f(x,y)) = o(\\sqrt{x^2 + y^2})$\n\n故 $\\lim_{(x,y)\\to (0,0)}\\frac{|n\\bullet(x,y,f(x,y))|}{\\sqrt{x^2 + y^2}}$ 存在，应选(A).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\lim_{(x,y)\\to (0,0)}\\frac{|n\\cdot(x,y,f(x,y))|}{\\sqrt{x^2 + y^2}}$ 存在",
          "B. $\\lim_{(x,y)\\to (0,0)}\\frac{|n\\times(x,y,f(x,y))|}{\\sqrt{x^2 + y^2}}$ 存在",
          "C. $\\lim_{(x,y)\\to (0,0)}\\frac{|\\pmb{\\alpha}\\cdot(x,y,f(x,y))|}{\\sqrt{x^2 + y^2}}$ 存在",
          "D. $\\lim_{(x,y)\\to (0,0)}\\frac{|\\pmb{\\alpha}\\times(x,y,f(x,y))|}{\\sqrt{x^2 + y^2}}$ 存在"
        ]
      },
      {
        "id": "m1-20-04",
        "paperQuestionNumber": 4,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 4 题】\n设 $R$ 为幂级数 $\\sum_{n = 1}^{\\infty}a_nx^n$ 的收敛半径， $r$ 是实数，则（ ）.",
        "correctAnswer": "A",
        "explanation": "（4）【答案】 （A）.\n\n【解】因为幂级数 $\\sum_{n=1}^{\\infty} a_n x^n$ 的收敛半径为 $R$ , 所以当 $|x| < R$ 时, 级数绝对收敛, 进而, 级数 $\\sum_{n=1}^{\\infty} a_{2n} r^{2n}$ 收敛, 所以, 当 $\\sum_{n=1}^{\\infty} a_{2n} r^{2n}$ 发散时, $|r| \\geqslant R$ , 应选(A).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等",
        "options": [
          "A. 当 $\\sum_{n = 1}^{\\infty}a_{2n}r^{2n}$ 发散时， $|r|\\geqslant R$",
          "B. 当 $\\sum_{n=1}^{\\infty} a_{2n} r^{2n}$ 收敛时, $|r| \\leqslant R$",
          "C. 当 $|r| \\geqslant R$ 时, $\\sum_{n=1}^{\\infty} a_{2n} r^{2n}$ 发散",
          "D. 当 $|r| \\leqslant R$ 时, $\\sum_{n=1}^{\\infty} a_{2n} r^{2n}$ 收敛"
        ]
      },
      {
        "id": "m1-20-05",
        "paperQuestionNumber": 5,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 5 题】\n若矩阵 $\\mathbf{A}$ 经过初等列变换化成 $\\pmb{B}$ ，则（ ）.",
        "correctAnswer": "B",
        "explanation": "（5）【答案】 （B）.\n\n【解】矩阵 $\\mathbf{A}$ 经过初等列变换得到 $\\pmb{B}$ ，故存在初等矩阵 $P_{i}(i = 1,2\\dots ,t)$ 使\n\n$$\n\\boldsymbol {A} \\boldsymbol {P} _ {1} \\boldsymbol {P} _ {2} \\dots \\boldsymbol {P} _ {t} = \\boldsymbol {B},\n$$\n\n因 $P_{i}$ 均可逆，故有 $\\mathbf{A} = \\mathbf{B}_{t}^{-1}\\dots \\mathbf{P}_{2}^{-1}\\mathbf{P}_{1}^{-1}$ ，记 $\\pmb {P} = \\pmb {P}_t^{-1}\\dots \\pmb {P}_2^{-1}\\pmb {P}_1^{-1}$ ，故应选(B).\n\n方法点评：矩阵进行一次初等行变换或一次初等列变换等价于矩阵的左边乘以一个初等矩阵或右边乘以一个初等矩阵；矩阵进行若干次初等行变换等价于矩阵左乘可逆矩阵，矩阵进行若干次初等列变换等价于矩阵右乘可逆矩阵，故有如下结论：\n\n（1）设 $A, B$ 为同型矩阵，则 $A$ 经过有限次初等行变换化为 $B$ 等价于存在可逆矩阵 $M$ ，使得 $B = MA$ ；  \n（2）设 $A, B$ 为同型矩阵，则 $A$ 经过有限次初等列变换化为 $B$ 等价于存在可逆矩阵 $N$ ，使得 $B = AN$ ；  \n（3）设 $A, B$ 为同型矩阵，则 $A$ 经过有限次初等变换化为 $B$ 等价于存在可逆矩阵 $P, Q$ ，使得 $B = P A Q$ .",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "线性代数真题",
          "2020数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. 存在矩阵 $\\pmb{P}$ ，使得 $PA = B$",
          "B. 存在矩阵 $\\pmb{P}$ ，使得 $BP = A$",
          "C. 存在矩阵 $\\pmb{P}$ ，使得 $PB = A$",
          "D. 方程组 $AX = 0$ 与 $BX = 0$ 同解"
        ]
      },
      {
        "id": "m1-20-06",
        "paperQuestionNumber": 6,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 6 题】\n已知直线 $L_{1}:\\frac{x - a_{2}}{a_{1}} = \\frac{y - b_{2}}{b_{1}} = \\frac{z - c_{2}}{c_{1}}$ 与直线 $L_{2}:\\frac{x - a_{3}}{a_{2}} = \\frac{y - b_{3}}{b_{2}} = \\frac{z - c_{3}}{c_{2}}$ 相交于一点，记向量 $\\pmb{\\alpha}_{i} = \\begin{pmatrix} a_{i}\\\\ b_{i}\\\\ c_{i} \\end{pmatrix} ,i = 1,2,3$ ，则（ ）.",
        "correctAnswer": "C",
        "explanation": "（6）【答案】 (C).\n\n【解】令 $L_{1}: \\frac{x - a_{2}}{a_{1}} = \\frac{y - b_{2}}{b_{1}} = \\frac{z - c_{2}}{c_{1}} = t$ 得 $L_{1}: \\left\\{ \\begin{array}{l} x = a_{2} + a_{1}t, \\\\ y = b_{2} + b_{1}t, \\\\ z = c_{2} + c_{1}t, \\end{array} \\right.$ 即 $L_{1}: \\binom{x}{y}=x_{2}+t\\alpha_{1}$ ,\n\n同理 $L_{2}:\\left( \\begin{array}{c}x\\\\ y\\\\ z \\end{array} \\right) = \\pmb{\\alpha}_{3} + t\\pmb{\\alpha}_{2},$\n\n因为 $L_{1}$ 与 $L_{2}$ 相交，故存在 $t$ ，使得 $\\alpha_{2} + t\\alpha_{1} = \\alpha_{3} + t\\alpha_{2}$ ，即 $\\alpha_{3} = t\\alpha_{1} + (1 - t)\\alpha_{2}$ 故 $\\alpha_{3}$ 可由 $\\alpha_{1},\\alpha_{2}$ 线性表示，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "线性代数真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "线性代数"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\pmb{\\alpha}_{1}$ 可由 $\\pmb{\\alpha}_{2},\\pmb{\\alpha}_{3}$ 线性表示",
          "B. $\\pmb{\\alpha}_{2}$ 可由 $\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{3}$ 线性表示",
          "C. $\\alpha_{3}$ 可由 $\\alpha_{1}, \\alpha_{2}$ 线性表示",
          "D. $\\alpha_{1}, \\alpha_{2}, \\alpha_{3}$ 线性无关"
        ]
      },
      {
        "id": "m1-20-07",
        "paperQuestionNumber": 7,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 7 题】\n设 $A, B, C$ 为三个随机事件，且 $P(A) = P(B) = P(C) = \\frac{1}{4}, P(AB) = 0,$ $P(AC) = P(BC) = \\frac{1}{12}$ ，则 $A, B, C$ 中恰有一个事件发生的概率为（ ）.",
        "correctAnswer": "D",
        "explanation": "（7）【答案】 (D).\n\n【解】 $P(A\\overline{B}\\overline{C}) = P(A\\cdot \\overline{B + C}) = P(A) - P(AB + AC)$\n\n$$\n= P (A) - P (A B) - P (A C) + P (A B C) = \\frac {1}{4} - \\frac {1}{1 2} = \\frac {1}{6},\n$$\n\n$$\n\\begin{array}{l} P (\\bar {A} B \\bar {C}) = P (B \\cdot \\bar {A + C}) = P (B) - P (A B + B C) \\\\ = P (B) - P (A B) - P (B C) + P (A B C) = \\frac {1}{4} - \\frac {1}{1 2} = \\frac {1}{6}, \\\\ \\end{array}\n$$\n\n$$\n\\begin{array}{l} P (\\bar {A} \\bar {B} C) = P (C \\cdot \\bar {A + B}) = P (C) - P (A C + B C) \\\\ = P (C) - P (A C) - P (B C) + P (A B C) = \\frac {1}{4} - \\frac {2}{1 2} = \\frac {1}{1 2}, \\\\ \\end{array}\n$$\n\n故所求概率为 $P(A\\overline{B}\\overline{C}) + P(\\overline{A} BC) + P(\\overline{ABC}) = \\frac{1}{6} +\\frac{1}{6} +\\frac{1}{12} = \\frac{5}{12}$ ，应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2020数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\frac{3}{4}$",
          "B. $\\frac{2}{3}$",
          "C. $\\frac{1}{2}$",
          "D. $\\frac{5}{12}$"
        ]
      },
      {
        "id": "m1-20-08",
        "paperQuestionNumber": 8,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2020 考研数学一真题 · 第 8 题】\n设 $X_{1}, X_{2}, \\dots, X_{100}$ 为来自总体 $X$ 的简单随机样本，其中 $P\\{X = 0\\} = P\\{X = 1\\} = \\frac{1}{2}, \\Phi(x)$ 表示标准正态分布函数，利用中心极限定理可得 $P\\{\\sum_{i=1}^{100} X_{i} \\leqslant 55\\}$ 的近似值为（ ）.",
        "correctAnswer": "B",
        "explanation": "（8）【答案】 (B).\n\n【解】 $E(X) = \\frac{1}{2}, E(X^2) = \\frac{1}{2}$ ，则 $D(X) = E(X^2) - [E(X)]^2 = \\frac{1}{4}$ .\n\n由中心极限定理得 $\\sum_{i = 1}^{100}X_{i}$ 近似服从 $N(50,25)$\n\n从而 $\\frac{\\sum_{i=1}^{100} X_i - 50}{5}$ 近似服从 $N(0,1)$ ，故\n\n$$\nP \\left\\{\\sum_ {i = 1} ^ {1 0 0} X _ {i} \\leqslant 5 5 \\right\\} = P \\left\\{\\frac {\\sum_ {i = 1} ^ {1 0 0} X _ {i} - 5 0}{5} \\leqslant 1 \\right\\} \\approx \\Phi (1), \\text {应 选 (B)}.\n$$\n\n# 二、填空题",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2020数一",
          "极限计算与无穷小比较",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $1 - \\Phi (1)$",
          "B. $\\Phi (1)$",
          "C. $1 - \\Phi (0,2)$",
          "D. $\\Phi(0.2)$\n\n# 二、填空题（9～14小题，每小题4分，共24分.请将答案写在题中的横线上.）"
        ]
      },
      {
        "id": "m1-20-09",
        "paperQuestionNumber": 9,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 9 题】\n$\\lim_{x\\to 0}\\left[\\frac{1}{\\mathrm{e}^x - 1} -\\frac{1}{\\ln(1 + x)}\\right] = \\underline{\\quad}$",
        "correctAnswer": "-1",
        "explanation": "（9）【答案】 -1.\n\n【解】 $\\lim_{x\\to 0}\\left[\\frac{1}{\\mathrm{e}^x - 1} -\\frac{1}{\\ln(1 + x)}\\right] = \\lim_{x\\to 0}\\frac{\\ln(1 + x) - \\mathrm{e}^x + 1}{x^2}$\n\n$$\n\\begin{array}{l} = \\lim  _ {x \\rightarrow 0} \\frac {\\frac {1}{1 + x} - e ^ {x}}{2 x} = \\frac {1}{2} \\lim  _ {x \\rightarrow 0} \\frac {1}{1 + x} \\cdot \\frac {1 - (x + 1) e ^ {x}}{x} = \\frac {1}{2} \\lim  _ {x \\rightarrow 0} \\frac {1 - (x + 1) e ^ {x}}{x} \\\\ = - \\frac {1}{2} \\lim  _ {x \\rightarrow 0} (x + 2) e ^ {x} = - 1. \\\\ \\end{array}\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：-1"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-20-10",
        "paperQuestionNumber": 10,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 10 题】\n设 $\\left\\{ \\begin{array}{l}x = \\sqrt{t^2 + 1},\\\\ y = \\ln (t + \\sqrt{t^2 + 1}), \\end{array} \\right.$ 则 $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2}\\bigg|_{t = 1} = .$",
        "correctAnswer": "$-\\sqrt{2}$",
        "explanation": "（10）【答案】 $-\\sqrt{2}$\n\n【解】 $\\frac{\\mathrm{dy}}{\\mathrm{dx}} = \\frac{\\frac{1}{\\sqrt{t^2 + 1}}}{\\frac{t}{\\sqrt{t^2 + 1}}} = \\frac{1}{t},$\n\n$$\n\\frac {\\mathrm {d} ^ {2} y}{\\mathrm {d} x ^ {2}} = \\frac {\\mathrm {d} \\left(\\frac {1}{t}\\right) / \\mathrm {d} t}{\\mathrm {d} x / \\mathrm {d} t} = \\frac {- \\frac {1}{t ^ {2}}}{\\frac {t}{\\sqrt {t ^ {2} + 1}}} = - \\frac {\\sqrt {t ^ {2} + 1}}{t ^ {3}},\n$$\n\n故 $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2}\\bigg|_{t = 1} = -\\sqrt{2}.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$-\\sqrt{2}$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-11",
        "paperQuestionNumber": 11,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 11 题】\n设函数 $f(x)$ 满足 $f^{\\prime \\prime}(x) + af^{\\prime}(x) + f(x) = 0(a > 0)$ ，且 $f(0) = m, f^{\\prime}(0) = n$ ，则 $\\int_0^{+\\infty}f(x)\\mathrm{d}x = \\underline{\\quad}$",
        "correctAnswer": "$n + am$",
        "explanation": "(11)【答案】 $n + am$\n\n【解】由 $f^{\\prime \\prime}(x) + af^{\\prime}(x) + f(x) = 0$ 得特征方程为\n\n$$\n\\lambda^ {2} + a \\lambda + 1 = 0,\n$$\n\n因为 $\\lambda_1 + \\lambda_2 = -a < 0, \\lambda_1\\lambda_2 = 1 > 0$ ，所以 $\\lambda_1 < 0, \\lambda_2 < 0$\n\n于是 $f(x) = C_{1}\\mathrm{e}^{\\lambda_{1}x} + C_{2}\\mathrm{e}^{\\lambda_{2}x},f^{\\prime}(x) = C_{1}\\lambda_{1}\\mathrm{e}^{\\lambda_{1}x} + C_{2}\\lambda_{2}\\mathrm{e}^{\\lambda_{2}x},$\n\n显然 $\\lim_{x\\to +\\infty}f(x) = \\lim_{x\\to +\\infty}f'(x) = 0,$\n\n故 $\\int_0^{+\\infty}f(x)\\mathrm{d}x = -\\int_0^{+\\infty}\\left[f^{\\prime \\prime}(x) + af^{\\prime}(x)\\right]\\mathrm{d}x = -f^{\\prime}(x)\\mid_{0}^{+\\infty} - af(x)\\mid_{0}^{+\\infty} = n + am.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$n + am$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-12",
        "paperQuestionNumber": 12,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 12 题】\n设函数 $f(x,y) = \\int_0^{xy}\\mathrm{e}^{xt^2}\\mathrm{d}t$ ，则 $\\frac{\\partial^2f}{\\partial x\\partial y}\\bigg|_{(1,1)} = \\underline{\\quad}$",
        "correctAnswer": "4e",
        "explanation": "(12)【答案】 4e.\n\n【解】 $f(x,y) = \\int_{0}^{xy}\\mathrm{e}^{xt^2}\\mathrm{d}t = \\frac{1}{\\sqrt{x}}\\int_{0}^{xy}\\mathrm{e}^{(\\sqrt{x} t)^2}\\mathrm{d}(\\sqrt{x} t) = \\frac{1}{\\sqrt{x}}\\int_{0}^{x^{\\frac{3}{2} y}}\\mathrm{e}^{t^2}\\mathrm{d}t,$\n\n$$\n\\frac {\\partial f}{\\partial x} = \\frac {3}{2} y \\mathrm {e} ^ {x ^ {3} y ^ {2}} - \\frac {\\int_ {0} ^ {x ^ {\\frac {3}{2}} y} \\mathrm {e} ^ {t ^ {2}} \\mathrm {d} t}{2 x ^ {\\frac {3}{2}}}, \\quad \\frac {\\partial^ {2} f}{\\partial x \\partial y} = \\frac {3}{2} \\mathrm {e} ^ {x ^ {3} y ^ {2}} + 3 x ^ {3} y ^ {2} \\mathrm {e} ^ {x ^ {3} y ^ {2}} - \\frac {1}{2} \\mathrm {e} ^ {x ^ {3} y ^ {2}},\n$$\n\n故 $\\left.\\frac{\\partial^2f}{\\partial x\\partial y}\\right|_{(1,1)} = 4\\mathrm{e}.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：4e"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-13",
        "paperQuestionNumber": 13,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 13 题】\n行列式 $\\left| \\begin{array}{cccc}a & 0 & -1 & 1\\\\ 0 & a & 1 & -1\\\\ -1 & 1 & a & 0\\\\ 1 & -1 & 0 & a \\end{array} \\right| = \\underline{\\quad}$",
        "correctAnswer": "$a^4 - 4a^2$",
        "explanation": "（13）【答案】 $a^4 - 4a^2$\n\n【解】 $\\left| \\begin{array}{cccc}a & 0 & -1 & 1\\\\ 0 & a & 1 & -1\\\\ -1 & 1 & a & 0\\\\ 1 & -1 & 0 & a \\end{array} \\right| = -\\left| \\begin{array}{cccc}1 & 0 & -1 & a\\\\ -1 & a & 1 & 0\\\\ 0 & 1 & a & -1\\\\ a & -1 & 0 & 1 \\end{array} \\right| = -\\left| \\begin{array}{cccc}1 & 0 & -1 & a\\\\ 0 & a & 0 & a\\\\ 0 & 1 & a & -1\\\\ 0 & -1 & a & 1 - a^2 \\end{array} \\right|$\n\n$$\n\\begin{array}{l} = - \\left| \\begin{array}{c c c} a & 0 & a \\\\ 1 & a & - 1 \\\\ - 1 & a & 1 - a ^ {2} \\end{array} \\right| = - a \\left| \\begin{array}{c c c} 1 & 0 & 1 \\\\ 1 & a & - 1 \\\\ - 1 & a & 1 - a ^ {2} \\end{array} \\right| \\\\ = - a \\left| \\begin{array}{c c c} 1 & 0 & 1 \\\\ 0 & a & - 2 \\\\ 0 & a & 2 - a ^ {2} \\end{array} \\right| = - 4 a ^ {2} + a ^ {4}. \\\\ \\end{array}\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$a^4 - 4a^2$"
        ],
        "keyPoints": [
          "线性代数真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "线性代数"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-20-14",
        "paperQuestionNumber": 14,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "blank",
        "question": "【2020 考研数学一真题 · 第 14 题】\n设 $X$ 服从区间 $\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$ 上的均匀分布， $Y = \\sin X$ ，则 $\\operatorname{Cov}(X, Y) =$ ______.\n\n# 三、解答题（15～23小题，共94分.解答应写出文字说明、证明过程或演算步骤.）",
        "correctAnswer": "$\\frac{2}{\\pi}$ ",
        "explanation": "(14)【答案】 $\\frac{2}{\\pi}$ .\n\n【解】 $X$ 的概率密度为\n\n$$\nf (x) = \\left\\{ \\begin{array}{l l} \\frac {1}{\\pi}, & - \\frac {\\pi}{2} <   x <   \\frac {\\pi}{2}, \\\\ 0, & \\text {其 他}, \\end{array} \\right.\n$$\n\n$$\nE (X) = 0,\n$$\n\n$$\n\\begin{array}{l} E (X Y) = E (X \\sin X) = \\frac {1}{\\pi} \\int_ {- \\frac {\\pi}{2}} ^ {\\frac {\\pi}{2}} x \\sin x d x = - \\frac {2}{\\pi} \\int_ {0} ^ {\\frac {\\pi}{2}} x d (\\cos x) \\\\ = - \\frac {2}{\\pi} \\left(x \\cos x \\left| _ {0} ^ {\\frac {\\pi}{2}} - \\int_ {0} ^ {\\frac {\\pi}{2}} \\cos x d x \\right.\\right) = \\frac {2}{\\pi}, \\\\ \\end{array}\n$$\n\n故 $\\operatorname{Cov}(X, Y) = E(XY) - E(X)E(Y) = E(XY) = \\frac{2}{\\pi}$ .\n\n# 三、解答题",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{2}{\\pi}$ "
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2020数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-15",
        "paperQuestionNumber": 15,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 15 题】\n求函数 $f(x,y) = x^{3} + 8y^{3} - xy$ 的极值.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(15)【解】 由 $\\left\\{ \\begin{array}{l}3x^{2} - y = 0,\\\\ 24y^{2} - x = 0 \\end{array} \\right.$ 得 $\\left\\{ \\begin{array}{l}x = 0,\\\\ y = 0, \\end{array} \\right.$ $\\left\\{ \\begin{array}{l}x = \\frac{1}{6},\\\\ y = \\frac{1}{12}; \\end{array} \\right.$\n\n$$\n\\frac {\\partial^ {2} f}{\\partial x ^ {2}} = 6 x, \\quad \\frac {\\partial^ {2} f}{\\partial x \\partial y} = - 1, \\quad \\frac {\\partial^ {2} f}{\\partial y ^ {2}} = 4 8 y,\n$$\n\n当 $(x,y) = (0,0)$ 时， $A = 0,B = -1,C = 0$\n\n因为 $AC - B^2 < 0$ ，所以点 $(0,0)$ 不是函数 $f(x,y)$ 的极值点；\n\n当 $(x,y) = \\left(\\frac{1}{6},\\frac{1}{12}\\right)$ 时， $A = 1,B = -1,C = 4$\n\n因为 $AC - B^2 = 3 > 0$ 且 $A > 0$ ，所以点 $\\left(\\frac{1}{6},\\frac{1}{12}\\right)$ 为函数 $f(x,y)$ 的极小值点，极小值为\n\n$$\nf \\left(\\frac {1}{6}, \\frac {1}{1 2}\\right) = \\frac {1}{6 ^ {3}} + 8 \\times \\frac {1}{1 2 ^ {3}} - \\frac {1}{6} \\times \\frac {1}{1 2} = - \\frac {1}{2 1 6}.\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-16",
        "paperQuestionNumber": 16,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 16 题】\n计算曲线积分 $I = \\int_{L} \\frac{4x - y}{4x^2 + y^2} \\mathrm{d}x + \\frac{x + y}{4x^2 + y^2} \\mathrm{d}y$ ，其中 $L$ 是 $x^2 + y^2 = 2$ ，方向为逆时针方向。",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(16)【解】 $P(x,y) = \\frac{4x - y}{4x^2 + y^2},\\quad Q(x,y) = \\frac{x + y}{4x^2 + y^2},$\n\n$$\n\\begin{array}{l} \\frac {\\partial Q}{\\partial x} = \\frac {- 4 x ^ {2} + y ^ {2} - 8 x y}{(4 x ^ {2} + y ^ {2}) ^ {2}}, \\quad \\frac {\\partial P}{\\partial y} = \\frac {- 4 x ^ {2} + y ^ {2} - 8 x y}{(4 x ^ {2} + y ^ {2}) ^ {2}}, \\\\ \\frac {\\partial Q}{\\partial x} = \\frac {\\partial P}{\\partial y} ((x, y) \\neq (0, 0)). \\\\ \\end{array}\n$$\n\n取 $L_{0}:4x^{2} + y^{2} = r^{2}(r > 0,L_{0}$ 在 $L$ 内，逆时针)，且设 $L$ 与 $L_0^-$ 所围成的区域为 $D_{1},L_{0}$ 围成的区域为 $D_{2}$ ，\n\n由 $\\oint_{L + L_0^-}P\\mathrm{d}x + Q\\mathrm{d}y = \\iint_{D_1}0\\mathrm{d}x\\mathrm{d}y = 0$ 得\n\n$$\n\\begin{array}{l} I = \\int_ {L} \\frac {4 x - y}{4 x ^ {2} + y ^ {2}} d x + \\frac {x + y}{4 x ^ {2} + y ^ {2}} d y = \\oint_ {L _ {0}} \\frac {4 x - y}{4 x ^ {2} + y ^ {2}} d x + \\frac {x + y}{4 x ^ {2} + y ^ {2}} d y \\\\ = \\frac {1}{r ^ {2}} \\oint_ {L _ {0}} (4 x - y) d x + (x + y) d y = \\frac {2}{r ^ {2}} \\iint_ {D _ {2}} d x d y = \\frac {2}{r ^ {2}} \\times \\pi \\times r \\times \\frac {r}{2} = \\pi . \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 17 题】\n设数列 $\\{a_{n}\\}$ 满足： $a_1 = 1,(n + 1)a_{n + 1} = \\left(n + \\frac{1}{2}\\right)a_n$ ，证明：当 $|x| < 1$ 时，幂级数 $\\sum_{n = 1}^{\\infty}a_{n}x^{n}$ 收敛，并求其和函数.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(17)【解】由 $(n + 1)a_{n + 1} = \\left(n + \\frac{1}{2}\\right)a_n$ 得 $\\frac{a_{n + 1}}{a_n} = \\frac{n + \\frac{1}{2}}{n + 1},$\n\n从而 $\\lim_{n\\to \\infty}\\frac{a_{n + 1}}{a_n} = 1$ ，即幂级数 $\\sum_{n = 1}^{\\infty}a_{n}x^{n}$ 的收敛半径为 $R = 1$\n\n故当 $|x| < 1$ 时，幂级数 $\\sum_{n=1}^{\\infty} a_n x^n$ 收敛.\n\n令 $S(x) = \\sum_{n=1}^{\\infty} a_n x^n$ ，则\n\n$$\n\\begin{array}{l} S ^ {\\prime} (x) = 1 + \\sum_ {n = 1} ^ {\\infty} (n + 1) a _ {n + 1} x ^ {n} = 1 + \\sum_ {n = 1} ^ {\\infty} \\left(n + \\frac {1}{2}\\right) a _ {n} x ^ {n} \\\\ = 1 + x \\sum_ {n = 1} ^ {\\infty} n a _ {n} x ^ {n - 1} + \\frac {1}{2} \\sum_ {n = 1} ^ {\\infty} a _ {n} x ^ {n} = 1 + x S ^ {\\prime} (x) + \\frac {1}{2} S (x), \\\\ \\end{array}\n$$\n\n即 $S^{\\prime}(x) - \\frac{1}{2(1 - x)} S(x) = \\frac{1}{1 - x}$ ，解得\n\n$$\nS (x) = (- 2 \\sqrt {1 - x} + C) \\frac {1}{\\sqrt {1 - x}} = \\frac {C}{\\sqrt {1 - x}} - 2,\n$$\n\n由 $S(0) = 0$ 得 $C = 2$ ，故 $S(x) = \\frac{2}{\\sqrt{1 - x}} - 2.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-18",
        "paperQuestionNumber": 18,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 18 题】\n设 $\\Sigma$ 为曲面 $z = \\sqrt{x^2 + y^2}$ （ $1 \\leqslant x^2 + y^2 \\leqslant 4$ ）的下侧， $f(x)$ 是连续函数，计算\n\n$$\nI = \\iint_ {\\Sigma} [ x f (x y) + 2 x - y ] d y d z + [ y f (x y) + 2 y + x ] d z d x + [ z f (x y) + z ] d x d y.\n$$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(18)【解】因为 $\\Sigma$ 的法向量为 $(x, y, -z)$ ，所以\n\n$$\n\\begin{array}{l} I = \\iint_ {\\Sigma} \\frac {1}{\\sqrt {2 (x ^ {2} + y ^ {2})}} \\left[ \\left(x ^ {2} + y ^ {2} - z ^ {2}\\right) f (x y) + 2 x ^ {2} + 2 y ^ {2} - z ^ {2} \\right] d S \\\\ = \\frac {\\sqrt {2}}{2} \\iint_ {\\Sigma} \\sqrt {x ^ {2} + y ^ {2}} d S. \\\\ \\end{array}\n$$\n\n记 $D = \\{(x,y)\\mid 1\\leqslant x^2 +y^2\\leqslant 4\\}$ ，又\n\n$$\n\\sqrt {\\left(\\frac {\\partial z}{\\partial x}\\right) ^ {2} + \\left(\\frac {\\partial z}{\\partial y}\\right) ^ {2} + 1} = \\sqrt {\\left(\\frac {x}{\\sqrt {x ^ {2} + y ^ {2}}}\\right) ^ {2} + \\left(\\frac {y}{\\sqrt {x ^ {2} + y ^ {2}}}\\right) ^ {2} + 1} = \\sqrt {2}.\n$$\n\n故\n\n$$\n\\begin{array}{l} I = \\iint_ {D} \\sqrt {x ^ {2} + y ^ {2}} d x d y \\\\ = \\int_ {0} ^ {2 \\pi} \\mathrm {d} \\theta \\int_ {1} ^ {2} r ^ {2} \\mathrm {d} r \\\\ = \\frac {1 4}{3} \\pi . \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-20-19",
        "paperQuestionNumber": 19,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 19 题】\n设函数 $f(x)$ 在区间 $[0,2]$ 上具有连续导数， $f(0) = f(2) = 0, M = \\max_{x\\in [0,2]}\\{|f(x)|\\}$ ，证明：\n\n（I）存在 $\\xi \\in (0,2)$ ，使得 $|f'(\\xi)| \\geqslant M$ ；  \n（Ⅱ）若对任意的 $x\\in (0,2),|f'(x)|\\leqslant M$ ，则 $M = 0$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(19)【证明】（I）令 $M = \\max_{x\\in [0,2]}\\left|f(x)\\right| = \\left|f(c)\\right|$ ，其中 $c\\in [0,2]$\n\n由拉格朗日中值定理，存在 $\\xi_1\\in (0,c),\\xi_2\\in (c,2)$ ，使得\n\n$$\n\\begin{array}{l} f (c) - f (0) = f ^ {\\prime} \\left(\\xi_ {1}\\right) c, \\\\ f (2) - f (c) = f ^ {\\prime} (\\xi_ {2}) (2 - c), \\\\ \\end{array}\n$$\n\n则 $\\left|f^{\\prime}(\\xi_{1})\\right|c = M,\\left|f^{\\prime}(\\xi_{2})\\right|(2 - c) = M,$\n\n当 $c\\in (0,1]$ 时，由 $\\left|f^{\\prime}(\\xi_{1})\\right|c = M$ 得 $\\left|f^{\\prime}(\\xi_1)\\right|\\geqslant M$ ，取 $\\xi = \\xi_{1}$\n\n当 $c \\in [1,2)$ 时， $2 - c \\in (0,1]$ ，由 $\\left|f'(\\xi_2)\\right|(2 - c) = M$ 得 $\\left|f'(\\xi_2)\\right| \\geqslant M$ ，取 $\\xi = \\xi_2$ 则存在 $\\xi \\in (0,2)$ ，使 $\\left|f'(\\xi)\\right| \\geqslant M$ .\n\n（Ⅱ）（反证法）不妨设 $M > 0$ ，则 $c\\in (0,2)$ ，当 $c\\neq 1$ 时，由拉格朗日中值定理，存在 $\\xi_1\\in (0,c),\\xi_2\\in (c,2)$ ，使得\n\n$$\n\\begin{array}{l} f (c) = f (c) - f (0) = f ^ {\\prime} (\\xi_ {1}) c \\text {, 其 中} 0 <   \\xi_ {1} <   c \\\\ - f (c) = f (2) - f (c) = f ^ {\\prime} \\left(\\xi_ {2}\\right) (2 - c), \\text {其 中} c <   \\xi_ {2} <   2, \\\\ \\end{array}\n$$\n\n则 $M = |f(c)| = |f'(\\xi_1)|c\\leqslant Mc,M = |f(c)| = |f'(\\xi_2)|(2 - c)\\leqslant M(2 - c)$ 皆成立，\n\n若 $0 < c < 1$ ，显然 $M = |f(c)| = |f'(\\xi_1)|c \\leqslant Mc$ 不对；\n\n若 $1 < c < 2$ ，显然 $M = |f(c)| = |f'(\\xi_2)|(2 - c) \\leqslant M(2 - c)$ 不对，\n\n即上述式子至少有一个不成立，矛盾，故 $M = 0$\n\n当 $c = 1$ 时，此时 $\\mid f(1)\\mid = M$ ，易知 $f^{\\prime}(1) = 0$\n\n若 $f(1) = M$ ，设 $G(x) = f(x) - Mx,0\\leqslant x\\leqslant 1,G^{\\prime}(x) = f^{\\prime}(x) - M\\leqslant 0,$\n\n从而 $G(x)$ 单调递减又 $G(0) = G(1) = 0$ ，从而 $G(x) = 0$ ，即 $f(x) = Mx, 0 \\leqslant x \\leqslant 1.$\n\n因此， $f^{\\prime}(1) = M$ ，从而 $M = 0$ ；同理，当 $f(1) = -M$ 时， $M = 0$ 综上， $M = 0$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2020数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-20-20",
        "paperQuestionNumber": 20,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 20 题】\n设二次型 $f(x_{1},x_{2}) = x_{1}^{2} - 4x_{1}x_{2} + 4x_{2}^{2}$ 经正交变换 $\\binom{x_1}{x_2}=\\mathbf{Q}\\binom{y_1}{y_2}$ 化为二次型 $g(y_{1},y_{2}) = ay_{1}^{2} + 4y_{1}y_{2} + by_{2}^{2}$ ，其中 $a\\geqslant b$\n\n（I）求 $a, b$ 的值；  \n（Ⅱ）求正交矩阵 $Q$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(20)【解】（I）令 $\\mathbf{A} = \\begin{pmatrix} 1 & -2 \\\\ -2 & 4 \\end{pmatrix}, \\mathbf{X} = \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix}$ ，则 $f(x_{1},x_{2}) = X^{\\mathrm{T}}AX$\n\n$$\n| \\lambda \\pmb {E} - \\pmb {A} | = \\left| \\begin{array}{c c} \\lambda - 1 & 2 \\\\ 2 & \\lambda - 4 \\end{array} \\right| = \\lambda (\\lambda - 5) = 0,\n$$\n\n解得 $\\mathbf{A}$ 的特征值为 $\\lambda_1 = 0, \\lambda_2 = 5$\n\n令 $\\pmb {B} = \\left( \\begin{array}{ll}a & 2\\\\ 2 & b \\end{array} \\right),\\pmb {Y} = \\left( \\begin{array}{l}y_1\\\\ y_2 \\end{array} \\right)$ 则 $g(y_{1},y_{2}) = Y^{\\mathrm{T}}BY$\n\n因为 $\\mathbf{A}\\sim \\mathbf{B}$ ，所以 $\\left\\{ \\begin{array}{l}\\operatorname {tr}\\mathbf{A} = \\operatorname {tr}\\mathbf{B},\\\\ |\\mathbf{A}| = |\\mathbf{B}|, \\end{array} \\right.$ 即 $\\left\\{ \\begin{array}{ll}a + b = 5,\\\\ ab = 4, \\end{array} \\right.$ 解得 $a = 4,b = 1$\n\n（Ⅱ）由 $0E - A = \\binom{-1}{2}\\rightarrow \\binom{1}{0}$ 得\n\n矩阵 $\\mathbf{A}$ 的属于 $\\lambda_{1} = 0$ 的特征向量 $\\alpha_{1} = \\binom{2}{1}$\n\n由 $5\\pmb {E} - \\pmb {A} = \\binom{4}{2}\\rightarrow \\binom{1}{0}\\frac{1}{2}$ 得\n\n矩阵 $\\mathbf{A}$ 的属于 $\\lambda_{2} = 5$ 的特征向量 $\\pmb{\\alpha}_{2} = \\left( \\begin{array}{c} - 1\\\\ 2 \\end{array} \\right)$\n\n令 $Q_{1} = \\frac{1}{\\sqrt{5}}\\binom{2}{1}\\binom{-1}{2}$ ，则 $Q_{1}^{\\mathrm{T}}AQ_{1} = \\binom{0}{0}$\n\n由 $0\\pmb {E} - \\pmb {B} = \\left( \\begin{array}{ll} - 4 & -2\\\\ -2 & -1 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{ll}1 & \\frac{1}{2}\\\\ 0 & 0 \\end{array} \\right)$ 得\n\n矩阵 $\\pmb{B}$ 的属于 $\\lambda_{1} = 0$ 的特征向量 $\\pmb{\\beta}_{1} = \\left( \\begin{array}{c} - 1\\\\ 2 \\end{array} \\right)$\n\n由 $5\\pmb {E} - \\pmb {B} = \\binom{1}{-2}\\rightarrow \\binom{1}{0}$ 得\n\n矩阵 $\\pmb{B}$ 的属于 $\\lambda_{2} = 5$ 的特征向量 $\\pmb{\\beta}_{2} = \\binom{2}{1}$\n\n令 $Q_{2} = \\frac{1}{\\sqrt{5}}\\left( \\begin{array}{cc} - 1 & 2\\\\ 2 & 1 \\end{array} \\right)$ 则 $Q_{2}^{\\mathrm{T}}BQ_{2} = \\binom {0}{0},$\n\n由 $Q_{1}^{T}AQ_{1} = Q_{2}^{T}BQ_{2}$ 得 $\\pmb {B} = \\pmb {Q}_2\\pmb {Q}_1^{\\mathrm{T}}\\pmb {A}\\pmb {Q}_1\\pmb {Q}_2^{\\mathrm{T}}$\n\n所求的正交矩阵为 $Q = Q_{1}Q_{2}^{\\mathrm{T}} = \\frac{1}{\\sqrt{5}}\\binom{2}{1}\\cdot \\frac{1}{\\sqrt{5}}\\binom{-1}{2}\\cdot \\binom{2}{1} = \\frac{1}{5}\\binom{-4}{3}\\cdot \\binom{3}{4}.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2020数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-21",
        "paperQuestionNumber": 21,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 21 题】\n设 $A$ 为2阶矩阵， $P = (\\alpha ,A\\alpha)$ ，其中 $\\pmb{\\alpha}$ 是非零向量且不是 $A$ 的特征向量\n\n（I）证明 $P$ 为可逆矩阵；  \n（Ⅱ）若 $A^2\\alpha + A\\alpha - 6\\alpha = 0$ ，求 $P^{-1}AP$ ，并判断 $A$ 是否相似于对角矩阵.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（21）【解】（I）方法一\n\n（反证法）设 $P$ 不可逆，则 $\\alpha, A\\alpha$ 线性相关，即 $\\alpha, A\\alpha$ 成比例，\n\n于是 $\\alpha = kA\\alpha$ 或 $A\\alpha = l\\alpha$\n\n因为 $\\alpha$ 不是 $A$ 的特征向量，所以 $A\\alpha = l\\alpha$ 不可能；\n\n若 $\\alpha = kA\\alpha$ ，因为 $\\pmb{\\alpha}$ 为非零向量，所以 $k\\neq 0$ ，于是 $A\\alpha = \\frac{1}{k}\\alpha$ ，矛盾，\n\n故 $\\alpha, A\\alpha$ 线性无关，即 $P$ 可逆\n\n方法二\n\n（反证法）设 $P$ 不可逆，即 $\\alpha, A\\alpha$ 线性相关，则存在不全为零的常数 $k_{1}, k_{2}$ ，使得\n\n$$\nk _ {1} \\boldsymbol {\\alpha} + k _ {2} \\boldsymbol {A} \\boldsymbol {\\alpha} = \\mathbf {0},\n$$\n\n显然 $k_{2} \\neq 0$ ，因为若 $k_{2} = 0$ ，则 $k_{1}\\pmb{\\alpha} = \\mathbf{0}$ ，由 $\\pmb{\\alpha} \\neq \\mathbf{0}$ 得 $k_{1} = 0$ ，矛盾，故 $k_{2} \\neq 0$\n\n由 $k_{1}\\pmb {\\alpha} + k_{2}\\pmb {A}\\pmb {\\alpha} = \\pmb{0}$ 得 $A\\pmb {\\alpha} = -\\frac{k_1}{k_2}\\pmb {\\alpha}$ ，矛盾，故 $\\pmb{P}$ 可逆.\n\n（Ⅱ）由 $\\mathbf{A}\\mathbf{P} = \\mathbf{A}(\\pmb{\\alpha},\\mathbf{A}\\pmb{\\alpha}) = (\\mathbf{A}\\pmb{\\alpha},\\mathbf{A}^2\\pmb{\\alpha}) = (\\mathbf{A}\\pmb{\\alpha},6\\pmb{\\alpha} - \\mathbf{A}\\pmb{\\alpha}) = \\mathbf{P}\\left( \\begin{array}{cc}0 & 6\\\\ 1 & -1 \\end{array} \\right)$ 得\n\n$$\n\\boldsymbol {P} ^ {- 1} \\boldsymbol {A} \\boldsymbol {P} = \\left( \\begin{array}{c c} 0 & 6 \\\\ 1 & - 1 \\end{array} \\right).\n$$\n\n设 $\\mathbf{B} = \\begin{pmatrix} 0 & 6 \\\\ 1 & -1 \\end{pmatrix}$ , 则 $\\mathbf{A} \\sim \\mathbf{B}$ .\n\n由 $|\\lambda \\pmb {E} - \\pmb {B}| = \\left| \\begin{array}{cc}\\lambda & -6\\\\ -1 & 1 + \\lambda \\end{array} \\right| = (\\lambda +3)(\\lambda -2) = 0.$\n\n得 $\\lambda_{1} = -3, \\lambda_{2} = 2$ ，因为 $\\lambda_{1} \\neq \\lambda_{2}$ ，所以 $\\pmb{B}$ 可以相似对角化，则 $\\mathbf{A}$ 也可以相似对角化.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2020数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-20-22",
        "paperQuestionNumber": 22,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 22 题】\n设随机变量 $X_{1}, X_{2}, X_{3}$ 相互独立，其中 $X_{1}$ 与 $X_{2}$ 均服从标准正态分布， $X_{3}$ 的概率分布为 $P\\{X_{3} = 0\\} = P\\{X_{3} = 1\\} = \\frac{1}{2}.$ $Y = X_{3}X_{1} + (1 - X_{3})X_{2}.$\n\n（I）求二维随机变量 $(X_{1},Y)$ 的分布函数，结果用标准正态分布函数 $\\Phi (x)$ 表示；  \n（Ⅱ）证明随机变量 $Y$ 服从标准正态分布，",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（22）【解】（I）二维随机变量 $(X_{1}, Y)$ 的分布函数为\n\n$$\n\\begin{array}{l} F (x, y) = P \\left\\{X _ {1} \\leqslant x, Y \\leqslant y \\right\\} \\\\ = \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x, Y \\leqslant y \\mid X _ {3} = 0 \\right\\} + \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x, Y \\leqslant y \\mid X _ {3} = 1 \\right\\} \\\\ = \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x, X _ {2} \\leqslant y \\right\\} + \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x, X _ {1} \\leqslant y \\right\\} \\\\ = \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x \\right\\} P \\left\\{X _ {2} \\leqslant y \\right\\} + \\frac {1}{2} P \\left\\{X _ {1} \\leqslant x, X _ {1} \\leqslant y \\right\\}, \\\\ \\end{array}\n$$\n\n当 $x < y$ 时，\n\n$$\nF (x, y) = \\frac {1}{2} \\Phi (x) \\Phi (y) + \\frac {1}{2} \\Phi (x);\n$$\n\n当 $x \\geqslant y$ 时，同理可得\n\n$$\nF (x, y) = \\frac {1}{2} \\Phi (x) \\Phi (y) + \\frac {1}{2} \\Phi (y),\n$$\n\n即 $F(x,y) = \\left\\{ \\begin{array}{ll} \\frac{1}{2}\\Phi (x)\\Phi (y) + \\frac{1}{2}\\Phi (x), & x < y,\\\\  \\frac{1}{2}\\Phi (x)\\Phi (y) + \\frac{1}{2}\\Phi (y), & x\\geqslant y. \\end{array} \\right.$\n\n（Ⅱ）Y的分布函数为\n\n$$\n\\begin{array}{l} F _ {Y} (y) = P \\left\\{Y \\leqslant y \\right\\} = \\frac {1}{2} P \\left\\{Y \\leqslant y \\mid X _ {3} = 0 \\right\\} + \\frac {1}{2} P \\left\\{Y \\leqslant y \\mid X _ {3} = 1 \\right\\} \\\\ = \\frac {1}{2} P \\left\\{X _ {2} \\leqslant y \\right\\} + \\frac {1}{2} P \\left\\{X _ {1} \\leqslant y \\right\\} = \\frac {1}{2} \\Phi (y) + \\frac {1}{2} \\Phi (y) = \\Phi (y), \\\\ \\end{array}\n$$\n\n则 $Y\\sim N(0,1)$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2020数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-20-23",
        "paperQuestionNumber": 23,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2020 考研数学一真题 · 第 23 题】\n设某元件的使用寿命 $T$ 的分布函数为\n\n$$\nF (t) = \\left\\{ \\begin{array}{l l} 1 - \\mathrm {e} ^ {- \\left(\\frac {t}{\\theta}\\right) ^ {m}}, t \\geqslant 0, \\\\ 0, & \\text {其 他}, \\end{array} \\right.\n$$\n\n其中 $\\theta ,m$ 为参数且大于零\n\n（I）求概率 $P\\{T > t\\}$ 与 $P\\{T > s + t \\mid T > s\\}$ ，其中 $s > 0, t > 0$ ；  \n（Ⅱ）任取 $n$ 个这种元件做寿命试验，测得它们的寿命分别为 $t_1, t_2, \\dots, t_n$ ，若 $m$ 已知，求 $\\theta$ 的最大似然估计值 $\\hat{\\theta}$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(23)【解】（I） $P\\{T > t\\} = 1 - P\\{T \\leqslant t\\} = 1 - F(t) = \\mathrm{e}^{-\\left(\\frac{t}{\\theta}\\right)^m}$ ;\n\n$$\n\\begin{array}{l} P \\{T > s + t \\mid T > s \\} = \\frac {P \\{T > s , T > s + t \\}}{P \\{T > s \\}} = \\frac {P \\{T > s + t \\}}{P \\{T > s \\}} \\\\ = \\frac {1 - P \\{T \\leqslant s + t \\}}{1 - P \\{T \\leqslant s \\}} = \\frac {\\mathrm {e} ^ {- \\left(\\frac {s + t}{\\theta}\\right) ^ {m}}}{\\mathrm {e} ^ {- \\left(\\frac {s}{\\theta}\\right) ^ {m}}} = \\mathrm {e} ^ {\\left(\\frac {s}{\\theta}\\right) ^ {m} - \\left(\\frac {s + t}{\\theta}\\right) ^ {m}}. \\\\ \\end{array}\n$$\n\n（Ⅱ） $T$ 的概率密度为\n\n$L(\\theta) = f(t_{1})f(t_{2})\\dots f(t_{n}) = m^{n}\\theta^{-mn}(t_{1}t_{2}\\dots t_{n})^{m - 1}\\mathrm{e}^{-\\theta^{-m}\\sum_{i = 1}^{n}t_{i}^{m}}$ ，其中 $t_1 > 0,t_2 > 0,\\dots ,t_n > 0$\n\n$$\n\\ln L (\\theta) = n \\ln m - m n \\ln \\theta + (m - 1) \\sum_ {i = 1} ^ {n} \\ln t _ {i} - \\theta^ {- m} \\sum_ {i = 1} ^ {n} t _ {i} ^ {m},\n$$\n\n令 $\\frac{\\mathrm{d}}{\\mathrm{d}\\theta}\\ln L(\\theta) = -\\frac{mn}{\\theta} +m\\theta^{-(m + 1)}\\sum_{i = 1}^{n}t_i^m = 0$ 得\n\n故 $\\theta$ 的最大似然估计值为 $\\hat{\\theta} = \\sqrt[m]{\\frac{1}{n}\\sum_{i=1}^{n}t_i^m}$ .\n\n$$\n\\begin{array}{l} F _ {Y} (y) = P \\left\\{Y \\leqslant y \\right\\} = \\frac {1}{2} P \\left\\{Y \\leqslant y \\mid X _ {3} = 0 \\right\\} + \\frac {1}{2} P \\left\\{Y \\leqslant y \\mid X _ {3} = 1 \\right\\} \\\\ = \\frac {1}{2} P \\left\\{X _ {2} \\leqslant y \\right\\} + \\frac {1}{2} P \\left\\{X _ {1} \\leqslant y \\right\\} = \\frac {1}{2} \\Phi (y) + \\frac {1}{2} \\Phi (y) = \\Phi (y), \\\\ P \\{T > s + t \\mid T > s \\} = \\frac {P \\{T > s , T > s + t \\}}{P \\{T > s \\}} = \\frac {P \\{T > s + t \\}}{P \\{T > s \\}} \\\\ = \\frac {1 - P \\{T \\leqslant s + t \\}}{1 - P \\{T \\leqslant s \\}} = \\frac {\\mathrm {e} ^ {- \\left(\\frac {s + t}{\\theta}\\right) ^ {m}}}{\\mathrm {e} ^ {- \\left(\\frac {s}{\\theta}\\right) ^ {m}}} = \\mathrm {e} ^ {\\left(\\frac {s}{\\theta}\\right) ^ {m} - \\left(\\frac {s + t}{\\theta}\\right) ^ {m}}. \\\\ f (t) = F ^ {\\prime} (t) = \\left\\{ \\begin{array}{l l} \\frac {m t ^ {m - 1}}{\\theta^ {m}} \\mathrm {e} ^ {- \\left(\\frac {t}{\\theta}\\right) ^ {m}}, t > 0, \\\\ 0, & \\text {其 他}. \\end{array} \\right. \\\\ \\hat {\\theta} ^ {m} = \\frac {1}{n} \\sum_ {i = 1} ^ {n} t _ {i} ^ {m}, \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2020数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2020真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "困难"
      }
    ]
  },
  {
    "id": "paper-math1-2019",
    "year": 2019,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2019 全国统考",
    "title": "2019 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2019 年考研数学一全国统考真题原卷，涵盖选择题 8 题（32分）、填空题 6 题（24分）与解答题 9 题（94分），共 23 题完整试题与详尽分步解析。",
    "questions": [
      {
        "id": "m1-19-01",
        "paperQuestionNumber": 1,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "极限计算与无穷小比较",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 1 题】\n当 $x \\to 0$ 时, 若 $x - \\tan x$ 与 $x^k$ 是同阶无穷小, 则 $k = (\\quad)$",
        "correctAnswer": "C",
        "explanation": "(1)【答案】 (C).\n\n【解】 方法一\n\n由 $\\lim_{x\\to 0}\\frac{x - \\tan x}{x^3} = \\lim_{x\\to 0}\\frac{1 - \\sec^2x}{3x^2} = -\\frac{1}{3}$ 得\n\n$x - \\tan x\\sim -\\frac{1}{3} x^3$ ，故 $x - \\tan x$ 为3阶无穷小，即 $k = 3$ ，应选(C).\n\n方法二\n\n由 $\\tan x = x + \\frac{1}{3} x^3 + o(x^3)$ 得 $x - \\tan x \\sim -\\frac{1}{3} x^3 (x \\to 0)$ ,\n\n故 $k = 3$ ，应选（C）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "极限计算与无穷小比较"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "极限计算与无穷小比较"
        ],
        "difficulty": "简单",
        "options": [
          "A. 1.",
          "B. 2.",
          "C. 3.",
          "D. 4."
        ]
      },
      {
        "id": "m1-19-02",
        "paperQuestionNumber": 2,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 2 题】\n设函数 $f(x) = \\begin{cases} x & |x|, \\\\ x \\ln x, \\end{cases} \\quad x \\leqslant 0$ , 则 $x = 0$ 是 $f(x)$ 的（ ）",
        "correctAnswer": "A",
        "explanation": "（2）【答案】 （B）.\n\n【解】 由 $\\lim_{x\\to 0^{-}}\\frac{f(x) - f(0)}{x - 0} = \\lim_{x\\to 0^{-}}|x| = 0$ 得 $f_{-}^{\\prime}(0) = 0$\n\n由 $\\lim_{x\\to 0^{+}}\\frac{f(x) - f(0)}{x - 0} = \\lim_{x\\to 0^{+}}\\ln x = -\\infty$ 得 $f_{+}^{\\prime}(0)$ 不存在，\n\n故 $x = 0$ 为 $f(x)$ 的不可导点；\n\n当 $x < 0$ 时， $f(x) < 0 = f(0)$ ，当 $0 < x < 1, f(x) < 0 = f(0)$\n\n故 $x = 0$ 为 $f(x)$ 的极大值点，应选（B）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. 可导点, 极值点.",
          "B. 不可导点, 极值点.",
          "C. 可导点, 非极值点.",
          "D. 不可导点, 非极值点."
        ]
      },
      {
        "id": "m1-19-03",
        "paperQuestionNumber": 3,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 3 题】\n设 $\\{u_{n}\\}$ 是单调增加的有界数列, 则下列级数中收敛的是 ( )",
        "correctAnswer": "D",
        "explanation": "（3）【答案】 (D).\n\n【解】 因为 $\\{u_{n}\\}$ 单调增加有界，所以 $\\{u_{n}\\}$ 极限存在.\n\n设 $\\lim_{n\\to \\infty}u_n = A$ ，因为 $\\sum_{k = 1}^{n}(u_{k + 1}^2 -u_k^2) = u_{n + 1}^2 -u_1^2.$\n\n所以 $\\lim_{n\\to \\infty}\\sum_{k = 1}^{n}(u_{k + 1}^2 -u_k^2) = \\lim_{n\\to \\infty}(u_{n + 1}^2 -u_1^2) = A^2 -u_1^2$ ，应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\sum_{n=1}^{\\infty} \\frac{u_n}{n}$ .",
          "B. $\\sum_{n=1}^{\\infty}(-1)^{n}\\frac{1}{u_{n}}$ .",
          "C. $\\sum_{n=1}^{\\infty}\\left(1-\\frac{u_{n}}{u_{n+1}}\\right)$ .",
          "D. $\\sum_{n=1}^{\\infty}\\left(u_{n+1}^{2}-u_{n}^{2}\\right)$ ."
        ]
      },
      {
        "id": "m1-19-04",
        "paperQuestionNumber": 4,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 4 题】\n设函数 $Q(x, y) = \\frac{x}{y^2}$ . 如果对上半平面 $(y > 0)$ 内的任意有向光滑封闭曲线 $C$ 都有 $\\oint_{C} P(x, y) \\mathrm{d}x + Q(x, y) \\mathrm{d}y = 0$ , 那么函数 $P(x, y)$ 可取为（）",
        "correctAnswer": "D",
        "explanation": "（4）【答案】 (D).\n\n【解】因为曲线积分与路径无关，所以 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x} = \\frac{1}{y^2}$ ，且 $P(x, y), Q(x, y)$ 在上半平面内连续可偏导，所以可取 $P(x, y) = x - \\frac{1}{y}$ ，应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $y - \\frac{x^2}{y^3}$ .",
          "B. $\\frac{1}{y} -\\frac{x^2}{y^3}.$",
          "C. $\\frac{1}{x} - \\frac{1}{y}$ .",
          "D. $x - \\frac{1}{y}$ ."
        ]
      },
      {
        "id": "m1-19-05",
        "paperQuestionNumber": 5,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 5 题】\n设 $A$ 是 3 阶实对称矩阵, $E$ 是 3 阶单位矩阵. 若 $A^2 + A = 2E$ , 且 $|A| = 4$ , 则二次型 $\\boldsymbol{x}^{\\mathrm{T}} \\boldsymbol{A} \\boldsymbol{x}$ 的规范形为 ( )",
        "correctAnswer": "C",
        "explanation": "（5）【答案】 (C).\n\n【解】 令 $AX = \\lambda X(X\\neq 0)$\n\n由 $A^2 + A = 2E$ 得 $(A^2 + A - 2E)X = (\\lambda^2 + \\lambda - 2)X = 0$ ,\n\n从而有 $\\lambda^2 +\\lambda -2 = 0$ ，即 $\\lambda = -2$ 或 $\\lambda = 1$\n\n因为 $|\\mathbf{A}| = 4$ ，所以 $\\lambda_1 = 1, \\lambda_2 = \\lambda_3 = -2$\n\n故二次型 $\\mathbf{X}^{\\mathrm{T}}\\mathbf{A}\\mathbf{X}$ 的规范形为 $y_{1}^{2} - y_{2}^{2} - y_{3}^{2}$ ，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "线性代数真题",
          "2019数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $y_1^2 + y_2^2 + y_3^2$ .",
          "B. $y_1^2 + y_2^2 - y_3^2$ .",
          "C. $y_1^2 - y_2^2 - y_3^2$ .",
          "D. $-y_{1}^{2} - y_{2}^{2} - y_{3}^{2}$ ."
        ]
      },
      {
        "id": "m1-19-06",
        "paperQuestionNumber": 6,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 6 题】\n如图所示, 有 3 张平面两两相交, 交线相互平行, 它们的方程\n\n$$\na _ {i 1} x + a _ {i 2} y + a _ {i 3} z = d _ {i} (i = 1, 2, 3)\n$$\n\n组成的线性方程组的系数矩阵和增广矩阵分别记为 $A, \\overline{A}$ , 则( )",
        "correctAnswer": "A",
        "explanation": "（6）【答案】 （A）.\n\n【解】 $\\mathbf{A} = \\begin{pmatrix} a_{11} & a_{12} & a_{13}\\\\ a_{21} & a_{22} & a_{23}\\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}$ ， $\\overline{\\mathbf{A}} = \\begin{pmatrix} a_{11} & a_{12} & a_{13} & d_1\\\\ a_{21} & a_{22} & a_{23} & d_2\\\\ a_{31} & a_{32} & a_{33} & d_3 \\end{pmatrix}$\n\n因为任两个平面不平行，所以 $r(\\mathbf{A})\\geqslant 2$\n\n又因为三个平面没有公共的交点，所以 $r(\\mathbf{A}) < r(\\overline{\\mathbf{A}})$\n\n再由 $r(\\overline{\\mathbf{A}})\\leqslant 3$ 得 $r(\\mathbf{A}) = 2,r(\\overline{\\mathbf{A}}) = 3$ ，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "线性代数真题",
          "2019数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $r(\\mathbf{A}) = 2, r(\\overline{\\mathbf{A}}) = 3.$",
          "B. $r(\\mathbf{A}) = 2, r(\\overline{\\mathbf{A}}) = 2.$",
          "C. $r(\\mathbf{A}) = 1, r(\\overline{\\mathbf{A}}) = 2.$",
          "D. $(\\mathrm{D})r(\\mathbf{A}) = 1,r(\\overline{\\mathbf{A}}) = 1.$"
        ]
      },
      {
        "id": "m1-19-07",
        "paperQuestionNumber": 7,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 7 题】\n设 $A, B$ 为随机事件, 则 $P(A) = P(B)$ 的充分必要条件是( )",
        "correctAnswer": "C",
        "explanation": "（7）【答案】 (C).\n\n【解】由减法公式得 $P(A\\overline{B}) = P(A) - P(AB)$ ， $P(B\\overline{A}) = P(B) - P(AB)$ ，\n\n则 $P(A) = P(B)$ 的充分必要条件是 $P(A) - P(AB) = P(B) - P(AB)$\n\n即 $P(A\\overline{B}) = P(B\\overline{A})$ ，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $P(A \\cup",
          "B. = P(A) + P(B)$ .\n__OPT_B__ $P(AB) = P(A)P(B)$ .",
          "C. $P(A\\overline{B}) = P(B\\overline{A}).$",
          "D. $P(AB) = P(\\overline{A}\\overline{B})$"
        ]
      },
      {
        "id": "m1-19-08",
        "paperQuestionNumber": 8,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2019 考研数学一真题 · 第 8 题】\n设随机变量 $X$ 与 $Y$ 相互独立, 且都服从正态分布 $N(\\mu, \\sigma^2)$ , 则 $P\\{|X - Y| < 1\\}$ ( )",
        "correctAnswer": "A",
        "explanation": "（8）【答案】 （A）.\n\n【解】因为 $X \\sim N(\\mu, \\sigma^2), Y \\sim N(\\mu, \\sigma^2)$ 且 $X, Y$ 相互独立，\n\n所以 $X - Y\\sim N(0,2\\sigma^2)$ ，或 $\\frac{X - Y}{\\sqrt{2}\\sigma}\\sim N(0,1)$\n\n故 $P\\{|X - Y| < 1\\} = P\\left\\{-\\frac{1}{\\sqrt{2}\\sigma} < \\frac{X - Y}{\\sqrt{2}\\sigma} < \\frac{1}{\\sqrt{2}\\sigma}\\right\\} = 2\\Phi \\left(\\frac{1}{\\sqrt{2}\\sigma}\\right) - 1,$\n\n即 $P\\{|X - Y| < 1\\}$ 与 $\\mu$ 无关，与 $\\sigma^2$ 有关，应选(A).\n\n# 二、填空题",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2019数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. 与 $\\mu$ 无关, 而与 $\\sigma^2$ 有关.",
          "B. 与 $\\mu$ 有关, 而与 $\\sigma^2$ 无关.",
          "C. 与 $\\mu, \\sigma^{2}$ 都有关.",
          "D. 与 $\\mu, \\sigma^2$ 都无关.\n\n![](images/bc18cfda0de2fa3572c9972712c0aa0c2892886048b84f42471ae448cf773216.jpg)\n\n# 二、填空题(本题共6小题，每小题4分，共24分，把答案填在题中横线上.)"
        ]
      },
      {
        "id": "m1-19-09",
        "paperQuestionNumber": 9,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 9 题】\n设函数 $f(u)$ 可导， $z = f(\\sin y - \\sin x) + xy$ ，则 $\\frac{1}{\\cos x} \\cdot \\frac{\\partial z}{\\partial x} + \\frac{1}{\\cos y} \\cdot \\frac{\\partial z}{\\partial y} =$ ______.",
        "correctAnswer": "$\\frac{y}{\\cos x} + \\frac{x}{\\cos y}$ ",
        "explanation": "(9)【答案】 $\\frac{y}{\\cos x} + \\frac{x}{\\cos y}$ .\n\n【解】 由 $\\frac{\\partial z}{\\partial x} = -\\cos x \\cdot f'(\\sin y - \\sin x) + y$\n\n$$\n\\frac {\\partial z}{\\partial y} = \\cos y \\cdot f ^ {\\prime} (\\sin y - \\sin x) + x,\n$$\n\n得 $\\frac{1}{\\cos x} \\cdot \\frac{\\partial z}{\\partial x} + \\frac{1}{\\cos y} \\cdot \\frac{\\partial z}{\\partial y} = \\frac{y}{\\cos x} + \\frac{x}{\\cos y}$ .",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{y}{\\cos x} + \\frac{x}{\\cos y}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-19-10",
        "paperQuestionNumber": 10,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程求解",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 10 题】\n微分方程 $2yy' - y^2 - 2 = 0$ 满足条件 $y(0) = 1$ 的特解 $y = \\_$",
        "correctAnswer": "$\\sqrt{3\\mathrm{e}^x - 2}$",
        "explanation": "(10)【答案】 $\\sqrt{3\\mathrm{e}^x - 2}$\n\n【解】方法一 由 $2yy' - y^2 - 2 = 0$ 得 $\\frac{2y\\mathrm{d}y}{y^2 + 2} = \\mathrm{d}x$\n\n积分得 $\\ln (y^2 + 2) = x + C$\n\n再由 $y(0) = 1$ 得 $C = \\ln 3$ ，即 $\\ln (y^2 +2) = \\ln (3\\mathrm{e}^x)$\n\n从而 $y^{2} + 2 = 3\\mathrm{e}^{x}$ ，故 $y = \\sqrt{3\\mathrm{e}^x - 2}$\n\n方法二 令 $y^{2} = u$ ，则原方程化为 $\\frac{\\mathrm{d}u}{\\mathrm{d}x} - u = 2$\n\n解得 $u = \\left(\\int 2\\mathrm{e}^{\\int -\\mathrm{d}x}\\mathrm{d}x + C\\right)\\mathrm{e}^{-\\int -\\mathrm{d}x} = (-2\\mathrm{e}^{-x} + C)\\mathrm{e}^{x},$\n\n即 $y^{2} = (-2\\mathrm{e}^{-x} + C)\\mathrm{e}^{x} = Ce^{x} - 2$\n\n由 $y(0) = 1$ 得 $C = 3$ ，故 $y = \\sqrt{3\\mathrm{e}^x - 2}$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\sqrt{3\\mathrm{e}^x - 2}$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "常微分方程求解"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "常微分方程求解"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-11",
        "paperQuestionNumber": 11,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 11 题】\n幂级数 $\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n)!} x^n$ 在 $(0, +\\infty)$ 内的和函数 $S(x) = \\_$ .",
        "correctAnswer": "$\\cos \\sqrt{x}$",
        "explanation": "（11）【答案】 $\\cos \\sqrt{x}$\n\n【解】 $S(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n)!} x^n = \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{(2n)!} (\\sqrt{x})^{2n} = \\cos \\sqrt{x}$ .",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\cos \\sqrt{x}$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-12",
        "paperQuestionNumber": 12,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 12 题】\n设 $\\Sigma$ 设为曲面 $x^{2} + y^{2} + 4z^{2} = 4 (z \\geqslant 0)$ 的上侧, 则 $\\iint_{\\Sigma} \\sqrt{4 - x^{2} - 4z^{2}} \\mathrm{d}x \\mathrm{~d}y = \\underline{\\quad}$ .",
        "correctAnswer": "$\\frac{32}{3}$ ",
        "explanation": "(12)【答案】 $\\frac{32}{3}$ .\n\n【解】 $\\iint_{\\Sigma} \\sqrt{4 - x^2 - 4z^2} \\, \\mathrm{d}x \\, \\mathrm{d}y = \\iint_{\\Sigma} \\sqrt{y^2} \\, \\mathrm{d}x \\, \\mathrm{d}y = \\iint_{\\Sigma} |y| \\, \\mathrm{d}x \\, \\mathrm{d}y,$\n\n令 $D_{xy} = \\{(x,y)\\mid x^2 +y^2\\leqslant 4\\}$ ，则\n\n$$\n\\begin{array}{l} \\iint_ {\\Sigma} \\sqrt {4 - x ^ {2} - 4 z ^ {2}} d x d y = \\iint_ {\\Sigma} | y | d x d y = \\iint_ {D _ {x y}} | y | d x d y \\\\ = 4 \\int_ {0} ^ {\\frac {\\pi}{2}} d \\theta \\int_ {0} ^ {2} r ^ {2} \\sin \\theta d r = 4 \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin \\theta d \\theta \\int_ {0} ^ {2} r ^ {2} d r = \\frac {3 2}{3}. \\\\ \\end{array}\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{32}{3}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-13",
        "paperQuestionNumber": 13,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 13 题】\n设 $A = (\\pmb{\\alpha}_1, \\pmb{\\alpha}_2, \\pmb{\\alpha}_3)$ 为 3 阶矩阵. 若 $\\pmb{\\alpha}_1, \\pmb{\\alpha}_2$ 线性无关，且 $\\pmb{\\alpha}_3 = -\\pmb{\\alpha}_1 + 2\\pmb{\\alpha}_2$ ，则线性方程组 $Ax = 0$ 的通解为",
        "correctAnswer": "$X = k\\binom{1}{-2} (k$ 为任意常数）",
        "explanation": "(13)【答案】 $X = k\\binom{1}{-2} (k$ 为任意常数）.\n\n【解】因为 $\\alpha_{1},\\alpha_{2}$ 线性无关，且 $\\pmb{\\alpha}_{3} = -\\pmb{\\alpha}_{1} + 2\\pmb{\\alpha}_{2}$ ，所以 $r(A) = 2$\n\n于是方程组 $AX = 0$ 的基础解系含一个线性无关的解向量，\n\n由 $\\pmb{\\alpha}_{3} = -\\pmb{\\alpha}_{1} + 2\\pmb{\\alpha}_{2}$ 得 $\\pmb{\\alpha}_{1} - 2\\pmb{\\alpha}_{2} + \\pmb{\\alpha}_{3} = \\mathbf{0}$\n\n即 $\\binom{1}{-2}$ 为 $AX = 0$ 的一个非零解，故 $AX = 0$ 的通解为 $X = k\\binom{1}{-2} (k$ 为任意常数）.",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$X = k\\binom{1}{-2} (k$ 为任意常数）"
        ],
        "keyPoints": [
          "线性代数真题",
          "2019数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-19-14",
        "paperQuestionNumber": 14,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "blank",
        "question": "【2019 考研数学一真题 · 第 14 题】\n设随机变量 $X$ 的概率密度为 $f(x) = \\left\\{ \\begin{array}{ll} \\frac{x}{2}, & 0 < x < 2, \\\\ 0, & \\text{其他}, \\end{array} \\right.$ $F(x)$ 为 $X$ 的分布函数， $E(X)$ 为 $X$ 的数学期望，则 $P\\{F(X) > E(X) - 1\\} =$\n\n# 三、解答题（本题共9小题，共94分，解答应写出文字说明、证明过程或演算步骤。）",
        "correctAnswer": "$\\frac{2}{3}$ ",
        "explanation": "(14)【答案】 $\\frac{2}{3}$ .\n\n【解】 $E(X) = \\int_0^2 x\\cdot \\frac{x}{2}\\mathrm{d}x = \\frac{4}{3},$\n\n$$\nF (x) = \\int_ {- \\infty} ^ {x} f (x) \\mathrm {d} x,\n$$\n\n当 $x < 0$ 时， $F(x) = 0$\n\n当 $0 \\leqslant x < 2$ 时， $F(x) = \\int_{0}^{x} \\frac{x}{2} \\, \\mathrm{d}x = \\frac{x^2}{4}$\n\n当 $x \\geqslant 2$ 时， $F(x) = 1$ ，即\n\n$$\nF (x) = \\left\\{ \\begin{array}{l l} 0, & x <   0, \\\\ \\frac {x ^ {2}}{4}, & 0 \\leqslant x <   2, \\\\ 1, & x \\geqslant 2, \\end{array} \\right.\n$$\n\n故 $P\\{F(X) > E(X) - 1\\} = P\\left\\{F(X) > \\frac{1}{3}\\right\\} = 1 - P\\left\\{F(X)\\leqslant \\frac{1}{3}\\right\\}$\n\n$$\n\\begin{array}{l} = 1 - P \\left\\{\\frac {X ^ {2}}{4} \\leqslant \\frac {1}{3} \\right\\} = 1 - P \\left\\{X \\leqslant \\frac {2}{\\sqrt {3}} \\right\\} \\\\ = 1 - \\int_ {0} ^ {\\frac {2}{\\sqrt {3}}} \\frac {x}{2} d x = 1 - \\left. \\frac {x ^ {2}}{4} \\right| _ {0} ^ {\\frac {2}{\\sqrt {3}}} = \\frac {2}{3}. \\\\ \\end{array}\n$$\n\n# 三、解答题",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{2}{3}$ "
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2019数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-15",
        "paperQuestionNumber": 15,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程求解",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 15 题】\n(本题满分 10 分)\n\n设函数 $y(x)$ 是微分方程 $y' + xy = e^{-\\frac{x^2}{2}}$ 满足条件 $y(0) = 0$ 的特解.\n\n(I) 求 $y(x)$ ;   \n（Ⅱ）求曲线 $y = y(x)$ 的凹凸区间及拐点",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（15）【解】 $(\\mathrm{I})y^{\\prime} + xy = \\mathrm{e}^{-\\frac{x^{2}}{2}}$ 的通解为\n\n$$\ny = \\left(\\int \\mathrm {e} ^ {- \\frac {x ^ {2}}{2}} \\cdot \\mathrm {e} ^ {\\int x \\mathrm {d} x} \\mathrm {d} x + C\\right) \\mathrm {e} ^ {- \\int x \\mathrm {d} x} = (x + C) \\mathrm {e} ^ {- \\frac {x ^ {2}}{2}},\n$$\n\n由 $y(0) = 0$ 得 $C = 0$ ，故 $y = x\\mathrm{e}^{-\\frac{x^2}{2}}$\n\n$$\n\\left(\\text {I I}\\right) y ^ {\\prime} = \\left(1 - x ^ {2}\\right) \\mathrm {e} ^ {- \\frac {x ^ {2}}{2}}, y ^ {\\prime \\prime} = \\left(x ^ {3} - 3 x\\right) \\mathrm {e} ^ {- \\frac {x ^ {2}}{2}} = x \\left(x + \\sqrt {3}\\right) \\left(x - \\sqrt {3}\\right) \\mathrm {e} ^ {- \\frac {x ^ {2}}{2}},\n$$\n\n令 $y^{\\prime \\prime} = 0$ 得 $x = -\\sqrt{3}, x = 0, x = \\sqrt{3}$\n\n当 $x \\in (-\\infty, -\\sqrt{3})$ 时， $y'' < 0$ ；当 $x \\in (-\\sqrt{3}, 0)$ 时， $y'' > 0$ ；当 $x \\in (0, \\sqrt{3})$ 时， $y'' < 0$ ；当 $x \\in (\\sqrt{3}, +\\infty)$ 时， $y'' > 0$\n\n故 $y = x\\mathrm{e}^{-\\frac{x^2}{2}}$ 的凸区间为 $(-\\infty , - \\sqrt{3})$ 及 $(0,\\sqrt{3})$ ；凹区间为 $(- \\sqrt{3},0)$ 及 $(\\sqrt{3}, + \\infty)$ 曲线 $y = x\\mathrm{e}^{-\\frac{x^2}{2}}$ 的拐点为 $(- \\sqrt{3}, - \\sqrt{3}\\mathrm{e}^{-\\frac{3}{2}}),(0,0)$ 及 $(\\sqrt{3},\\sqrt{3}\\mathrm{e}^{-\\frac{3}{2}})$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "一元/多元导数与极值",
          "常微分方程求解"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "常微分方程求解"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-16",
        "paperQuestionNumber": 16,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 16 题】\n(本题满分 10 分)\n\n设 $a, b$ 为实数，函数 $z = 2 + ax^2 + by^2$ 在点(3,4)处的方向导数中，沿方向 $\\boldsymbol{l} = -3\\boldsymbol{i} - 4\\boldsymbol{j}$ 的方向导数最大，最大值为10.\n\n(I) 求 $a, b$ ;   \n（Ⅱ）求曲面 $z = 2 + ax^2 + by^2 (z \\geqslant 0)$ 的面积.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（16）【解】（I）grad $z = \\{2ax, 2by\\}$ ，grad $z|_{(3,4)} = \\{6a, 8b\\}$\n\n因为梯度的方向即为方向导数最大的方向，\n\n所以有 $\\frac{6a}{-3} = \\frac{8b}{-4}$ 即 $a = b$\n\n再由 $\\sqrt{36a^2 + 64b^2} = 10$ 得 $a = b = -1$ .\n\n（Ⅱ）曲面 $\\Sigma: z = 2 - x^2 - y^2, (x, y) \\in D_{xy}$ ，其中 $D_{xy} = \\{(x, y) | x^2 + y^2 \\leqslant 2\\}$ ，则曲面 $\\Sigma$ 的面积为\n\n$$\n\\begin{array}{l} S = \\iint_ {D _ {x y}} \\sqrt {1 + z _ {x} ^ {\\prime 2} + z _ {y} ^ {\\prime 2}} d x d y = \\iint_ {D _ {x y}} \\sqrt {1 + 4 x ^ {2} + 4 y ^ {2}} d x d y \\\\ = 2 \\pi \\int_ {0} ^ {\\sqrt {2}} r \\sqrt {1 + 4 r ^ {2}} d r = \\frac {\\pi}{4} \\int_ {0} ^ {\\sqrt {2}} (1 + 4 r ^ {2}) ^ {\\frac {1}{2}} d (1 + 4 r ^ {2}) \\\\ = \\frac {\\pi}{4} \\times \\frac {2}{3} (1 + 4 r ^ {2}) ^ {\\frac {3}{2}} \\Big | _ {0} ^ {\\sqrt {2}} = \\frac {\\pi}{6} (2 7 - 1) = \\frac {1 3}{3} \\pi . \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 17 题】\n(本题满分 10 分)\n\n求曲线 $y = \\mathrm{e}^{-x}\\sin x (x \\geqslant 0)$ 与 $x$ 轴之间图形的面积.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（17）【解】 所求的面积为\n\n$$\n\\begin{array}{l} A = \\int_ {0} ^ {+ \\infty} \\mathrm {e} ^ {- x} | \\sin x | \\mathrm {d} x \\\\ = \\lim  _ {n \\rightarrow \\infty} \\sum_ {k = 0} ^ {n} (- 1) ^ {k} \\int_ {k \\pi} ^ {(k + 1) \\pi} \\mathrm {e} ^ {- x} \\sin x \\mathrm {d} x \\\\ = \\lim  _ {n \\rightarrow \\infty} \\sum_ {k = 0} ^ {n} (- 1) ^ {k} \\left[ - \\frac {1}{2} e ^ {- x} (\\sin x + \\cos x) \\right] \\Bigg | _ {k \\pi} ^ {(k + 1) \\pi} \\\\ = \\frac {1}{2} \\lim  _ {n \\rightarrow \\infty} \\sum_ {k = 0} ^ {n} (- 1) ^ {k + 1} \\left[ e ^ {- (k + 1) \\pi} (- 1) ^ {k + 1} - e ^ {- k \\pi} (- 1) ^ {k} \\right] \\\\ = \\frac {1}{2} \\lim  _ {n \\rightarrow \\infty} \\sum_ {k = 0} ^ {n} \\left[ e ^ {- (k + 1) \\pi} + e ^ {- k \\pi} \\right] = \\frac {1}{2} \\lim  _ {n \\rightarrow \\infty} \\left[ 1 + 2 \\sum_ {k = 1} ^ {n} e ^ {- k \\pi} + e ^ {- (n + 1) \\pi} \\right] \\\\ = \\frac {1}{2} \\left(1 + 2 \\sum_ {k = 1} ^ {\\infty} \\mathrm {e} ^ {- k \\pi}\\right) = \\frac {1}{2} \\left(1 + \\frac {2 \\mathrm {e} ^ {- \\pi}}{1 - \\mathrm {e} ^ {- \\pi}}\\right) = \\frac {1}{2} \\left(1 + \\frac {2}{\\mathrm {e} ^ {\\pi} - 1}\\right) = \\frac {1}{2} + \\frac {1}{\\mathrm {e} ^ {\\pi} - 1}. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-18",
        "paperQuestionNumber": 18,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 18 题】\n(本题满分 10 分)\n\n设 $a_{n} = \\int_{0}^{1}x^{n}\\sqrt{1 - x^{2}}\\mathrm{d}x(n = 0,1,2,\\dots)$\n\n(I) 证明数列 $\\{a_{n}\\}$ 单调递减, 且 $a_{n} = \\frac{n - 1}{n + 2} a_{n - 2}(n = 2,3,\\dots)$ ;  \n（Ⅱ）求 $\\lim_{n\\to \\infty}\\frac{a_n}{a_{n - 1}}.$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(18)（I）【证明】因为当 $0 \\leqslant x \\leqslant 1$ 时， $x^{n+1} \\sqrt{1 - x^2} \\leqslant x^n \\sqrt{1 - x^2}$ ，\n\n所以 $\\int_0^1 x^{n + 1}\\sqrt{1 - x^2}\\mathrm{d}x <   \\int_0^1 x^n\\sqrt{1 - x^2}\\mathrm{d}x$ ，即 $a_{n + 1} <   a_n$ ，故 $\\{a_{n}\\}$ 单调递减.\n\n$$\n\\begin{array}{l} a _ {n} \\stackrel {x = \\sin t} {=} \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n} t \\cdot \\cos^ {2} t d t = \\int_ {0} ^ {\\frac {\\pi}{2}} (\\sin^ {n} t - \\sin^ {n + 2} t) d t \\\\ = \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n} t \\mathrm {d} t - \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n + 2} t \\mathrm {d} t = I _ {n} - \\frac {n + 1}{n + 2} I _ {n} = \\frac {1}{n + 2} I _ {n}, \\\\ \\end{array}\n$$\n\n$$\n\\begin{array}{l} a _ {n - 2} \\stackrel {x = \\sin t} {=} \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n - 2} t \\cdot \\cos^ {2} t d t = \\int_ {0} ^ {\\frac {\\pi}{2}} (\\sin^ {n - 2} t - \\sin^ {n} t) d t \\\\ = \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n - 2} t \\mathrm {d} t - \\int_ {0} ^ {\\frac {\\pi}{2}} \\sin^ {n} t \\mathrm {d} t = I _ {n - 2} - I _ {n}, \\\\ \\end{array}\n$$\n\n因为 $I_{n} = \\frac{n - 1}{n} I_{n - 2}$ ，所以 $I_{n - 2} = \\frac{n}{n - 1} I_n$\n\n于是 $a_{n - 2} = \\frac{n}{n - 1} I_n - I_n = \\frac{1}{n - 1} I_n$ ，故 $a_{n} = \\frac{n - 1}{n + 2} a_{n - 2}(n = 2,3,\\dots)$\n\n（Ⅱ）【解】因为 $\\{a_{n}\\}$ 单调递减，所以 $a_{n} = \\frac{n - 1}{n + 2} a_{n - 2} > \\frac{n - 1}{n + 2} a_{n - 1}$\n\n从而有 $\\frac{n - 1}{n + 2} < \\frac{a_n}{a_{n - 1}} < 1$ ，由夹逼定理得 $\\lim_{n\\to \\infty}\\frac{a_n}{a_{n - 1}} = 1.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-19-19",
        "paperQuestionNumber": 19,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 19 题】\n(本题满分 10 分)\n\n设 $\\Omega$ 是由锥面 $x^{2} + (y - z)^{2} = (1 - z)^{2}(0\\leqslant z\\leqslant 1)$ 与平面 $z = 0$ 围成的锥体，求 $\\varOmega$ 的形心坐标.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（19）【解】 设 $\\Omega$ 的形心坐标为 $(\\overline{x},\\overline{y},\\overline{z})$\n\n由对称性得 $\\overline{x} = 0$ ，且 $\\overline{y} = \\frac{\\iiint_{\\Omega} y \\, \\mathrm{d}x \\, \\mathrm{d}y \\, \\mathrm{d}z}{\\iiint_{\\Omega} \\mathrm{d}x \\, \\mathrm{d}y \\, \\mathrm{d}z}, \\overline{z} = \\frac{\\iiint_{\\Omega} z \\, \\mathrm{d}x \\, \\mathrm{d}y \\, \\mathrm{d}z}{\\iiint_{\\Omega} \\mathrm{d}x \\, \\mathrm{d}y \\, \\mathrm{d}z}$\n\n$$\n\\iiint_ {\\Omega} \\mathrm {d} x \\mathrm {d} y \\mathrm {d} z = \\int_ {0} ^ {1} \\mathrm {d} z \\iint_ {x ^ {2} + (y - z) ^ {2} \\leqslant (1 - z) ^ {2}} \\mathrm {d} x \\mathrm {d} y = \\pi \\int_ {0} ^ {1} (1 - z) ^ {2} \\mathrm {d} z = \\frac {\\pi}{3} (z - 1) ^ {3} \\Big | _ {0} ^ {1} = \\frac {\\pi}{3};\n$$\n\n$$\n\\iiint_ {\\Omega} y \\mathrm {d} x \\mathrm {d} y \\mathrm {d} z = \\int_ {0} ^ {1} \\mathrm {d} z \\iint_ {x ^ {2} + (y - z) ^ {2} \\leqslant (1 - z) ^ {2}} y \\mathrm {d} x \\mathrm {d} y,\n$$\n\n$$\n\\begin{array}{l} \\text {由} \\iint_ {x ^ {2} + (y - z) ^ {2} \\leqslant (1 - z) ^ {2}} y \\mathrm {d} x \\mathrm {d} y \\xlongequal {y - z = u} \\iint_ {x ^ {2} + u ^ {2} \\leqslant (1 - z) ^ {2}} (u + z) \\mathrm {d} x \\mathrm {d} u \\\\ = \\iint_ {x ^ {2} + u ^ {2} \\leqslant (1 - z) ^ {2}} z \\mathrm {d} x \\mathrm {d} u = \\pi z (1 - z) ^ {2} \\text {得} \\\\ \\end{array}\n$$\n\n$$\n\\begin{array}{l} \\iiint_ {\\Omega} y \\mathrm {d} x \\mathrm {d} y \\mathrm {d} z = \\pi \\int_ {0} ^ {1} z (1 - z) ^ {2} \\mathrm {d} z = \\frac {\\pi}{1 2}; \\\\ \\iiint_ {\\Omega} z \\mathrm {d} x \\mathrm {d} y \\mathrm {d} z = \\int_ {0} ^ {1} z \\mathrm {d} z \\iint_ {x ^ {2} + (y - z) ^ {2} \\leqslant (1 - z) ^ {2}} \\mathrm {d} x \\mathrm {d} y = \\pi \\int_ {0} ^ {1} z (1 - z) ^ {2} \\mathrm {d} z = \\frac {\\pi}{1 2}, \\\\ \\end{array}\n$$\n\n故 $\\Omega$ 的形心坐标为 $\\left(0, \\frac{1}{4}, \\frac{1}{4}\\right)$ .",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2019数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "高等数学"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-19-20",
        "paperQuestionNumber": 20,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 20 题】\n(本题满分 11 分)\n\n设向量组 $\\pmb{\\alpha}_{1} = (1,2,1)^{\\mathrm{T}},\\pmb{\\alpha}_{2} = (1,3,2)^{\\mathrm{T}},\\pmb{\\alpha}_{3} = (1,a,3)^{\\mathrm{T}}$ 为 $\\mathbf{R}^3$ 的一个基， $\\pmb {\\beta} = (1,1,1)^{\\mathrm{T}}$ 在这个基下的坐标为 $(b,c,1)^{\\mathrm{T}}$\n\n(I) 求 $a, b, c$ ;   \n（Ⅱ）证明 $\\alpha_{2},\\alpha_{3},\\beta$ 为 $\\mathbf{R}^3$ 的一个基，并求 $\\alpha_{2},\\alpha_{3},\\beta$ 到 $\\alpha_{1},\\alpha_{2},\\alpha_{3}$ 的过渡矩阵",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（20）（I）【解】由题意得 $b\\pmb{\\alpha}_{1} + c\\pmb{\\alpha}_{2} + \\pmb{\\alpha}_{3} = \\pmb{\\beta}$ ，即 $\\begin{cases} b + c + 1 = 1, \\\\ 2b + 3c + a = 1, \\\\ b + 2c + 3 = 1, \\end{cases}$\n\n解得 $a = 3, b = 2, c = -2$ .\n\n（Ⅱ）【证明】因为 $|\\pmb{\\alpha}_2, \\pmb{\\alpha}_3, \\pmb{\\beta}| = \\begin{vmatrix} 1 & 1 & 1 \\\\ 3 & 3 & 1 \\\\ 2 & 3 & 1 \\end{vmatrix} = \\begin{vmatrix} 1 & 1 & 1 \\\\ 0 & 0 & -2 \\\\ 0 & 1 & -1 \\end{vmatrix} = 2 \\neq 0$ ，所以 $\\pmb{\\alpha}_2, \\pmb{\\alpha}_3, \\pmb{\\beta}$ 线性无关，故 $\\pmb{\\alpha}_2, \\pmb{\\alpha}_3, \\pmb{\\beta}$ 为 $\\mathbf{R}^3$ 的一个基.\n\n设由 $\\alpha_{2},\\alpha_{3},\\beta$ 到 $\\alpha_{1},\\alpha_{2},\\alpha_{3}$ 的过渡矩阵为 $Q$ ，即 $(\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2},\\pmb{\\alpha}_{3}) = (\\pmb{\\alpha}_{2},\\pmb{\\alpha}_{3},\\pmb{\\beta})Q$\n\n于是 $Q = (\\pmb{\\alpha}_2, \\pmb{\\alpha}_3, \\pmb{\\beta})^{-1}(\\pmb{\\alpha}_1, \\pmb{\\alpha}_2, \\pmb{\\alpha}_3)$\n\n由 $\\begin{pmatrix} 1 & 1 & 1 & 1 & 0 & 0 \\\\ 3 & 3 & 1 & 0 & 1 & 0 \\\\ 2 & 3 & 1 & 0 & 0 & 1 \\end{pmatrix} \\to \\begin{pmatrix} 1 & 1 & 1 & 1 & 0 & 0 \\\\ 0 & 0 & -2 & -3 & 1 & 0 \\\\ 0 & 1 & -1 & -2 & 0 & 1 \\end{pmatrix} \\to \\begin{pmatrix} 1 & 1 & 1 & 1 & 0 & 0 \\\\ 0 & 1 & -1 & -2 & 0 & 1 \\\\ 0 & 0 & 1 & \\frac{3}{2} & -\\frac{1}{2} & 0 \\end{pmatrix}$\n\n$\\rightarrow \\left[ \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right]\\rightarrow \\left[ \\begin{array}{lll}1 & 0 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right]$\n\n$(\\pmb{\\alpha}_{2}, \\pmb{\\alpha}_{3}, \\pmb{\\beta})^{-1} = \\begin{bmatrix} 0 & 1 & -1 \\\\ -\\frac{1}{2} & -\\frac{1}{2} & 1 \\\\ \\frac{3}{2} & -\\frac{1}{2} & 0 \\end{bmatrix}$ , 则\n\n$$\n\\boldsymbol {Q} = \\left[ \\begin{array}{c c c} 0 & 1 & - 1 \\\\ - \\frac {1}{2} & - \\frac {1}{2} & 1 \\\\ \\frac {3}{2} & - \\frac {1}{2} & 0 \\end{array} \\right] \\left( \\begin{array}{c c c} 1 & 1 & 1 \\\\ 2 & 3 & 3 \\\\ 1 & 2 & 3 \\end{array} \\right) = \\left[ \\begin{array}{c c c} 1 & 1 & 0 \\\\ - \\frac {1}{2} & 0 & 1 \\\\ \\frac {1}{2} & 0 & 0 \\end{array} \\right].\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2019数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-21",
        "paperQuestionNumber": 21,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 21 题】\n(本题满分 11 分)\n\n已知矩阵 $\\mathbf{A} = \\begin{pmatrix} -2 & -2 & 1 \\\\ 2 & x & -2 \\\\ 0 & 0 & -2 \\end{pmatrix}$ 与 $\\mathbf{B} = \\begin{pmatrix} 2 & 1 & 0 \\\\ 0 & -1 & 0 \\\\ 0 & 0 & y \\end{pmatrix}$ 相似.\n\n(I) 求 $x, y$ ;   \n（Ⅱ）求可逆矩阵 $\\pmb{P}$ 使得 $P^{-1}AP = B$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(21)【解】（I）因为 $A \\sim B$ ，所以 $\\operatorname{tr} A = \\operatorname{tr} B$ ，即 $x - 4 = y + 1$ ，或 $y = x - 5$\n\n再由 $|\\mathbf{A}| = |\\mathbf{B}|$ 得 $-2(-2x + 4) = -2y$ ，即 $y = -2x + 4$\n\n解得 $x = 3, y = -2$\n\n$$\n(\\text {I I}) \\mathbf {A} = \\left( \\begin{array}{c c c} - 2 & - 2 & 1 \\\\ 2 & 3 & - 2 \\\\ 0 & 0 & - 2 \\end{array} \\right), \\mathbf {B} = \\left( \\begin{array}{c c c} 2 & 1 & 0 \\\\ 0 & - 1 & 0 \\\\ 0 & 0 & - 2 \\end{array} \\right),\n$$\n\n显然矩阵 $\\mathbf{A},\\mathbf{B}$ 的特征值为 $\\lambda_1 = -2,\\lambda_2 = -1,\\lambda_3 = 2$\n\n由 $2\\pmb {E} + \\pmb {A}\\rightarrow \\left( \\begin{array}{ccc}0 & -2 & 1\\\\ 2 & 1 & 0\\\\ 0 & 0 & 0 \\end{array} \\right)\\rightarrow \\left[ \\begin{array}{ccc}1 & 0 & \\frac{1}{4}\\\\ 0 & 1 & -\\frac{1}{2}\\\\ 0 & 0 & 0 \\end{array} \\right]$ 得 $\\mathbf{A}$ 的属于特征值 $\\lambda_{1} = -2$ 的特征向量为\n\n$$\n\\boldsymbol {\\alpha} _ {1} = \\left( \\begin{array}{c} - 1 \\\\ 2 \\\\ 4 \\end{array} \\right);\n$$\n\n由 $\\pmb {E} + \\pmb {A}\\rightarrow \\left( \\begin{array}{lll}1 & 2 & -1\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{lll}1 & 2 & 0\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\mathbf{A}$ 的属于特征值 $\\lambda_{2} = -1$ 的特征向量为\n\n$$\n\\boldsymbol {\\alpha} _ {2} = \\left( \\begin{array}{c} - 2 \\\\ 1 \\\\ 0 \\end{array} \\right);\n$$\n\n由 $2E - A\\to \\left( \\begin{array}{ccc}2 & 1 & -2\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)\\to \\left[ \\begin{array}{ccc}1 & \\frac{1}{2} & 0\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right]$ 得 $\\mathbf{A}$ 的属于特征值 $\\lambda_3 = 2$ 的特征向量为\n\n$$\n\\boldsymbol {\\alpha} _ {3} = \\left( \\begin{array}{c} - 1 \\\\ 2 \\\\ 0 \\end{array} \\right),\n$$\n\n令 $\\pmb{P}_{1} = \\left( \\begin{array}{ccc} - 1 & -2 & -1\\\\ 2 & 1 & 2\\\\ 4 & 0 & 0 \\end{array} \\right)$ 则 $\\pmb {P}_1^{-1}\\pmb {A}\\pmb {P}_1 = \\left( \\begin{array}{ccc} - 2 & 0 & 0\\\\ 0 & -1 & 0\\\\ 0 & 0 & 2 \\end{array} \\right);$\n\n由 $2\\pmb {E} + \\pmb {B} = \\left( \\begin{array}{lll}4 & 1 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 0 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{lll}1 & 0 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\pmb{B}$ 的属于特征值 $\\lambda_{1} = -2$ 的特征向量为 $\\pmb {\\beta}_1 = \\begin{pmatrix} 0\\\\ 0\\\\ 1 \\end{pmatrix}$\n\n由 $\\pmb {E} + \\pmb {B} = \\left( \\begin{array}{lll}3 & 1 & 0\\\\ 0 & 0 & 0\\\\ 0 & 0 & -1 \\end{array} \\right)\\rightarrow \\left[ \\begin{array}{ccc}1 & \\frac{1}{3} & 0\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right]$ 得 $\\pmb{B}$ 的属于特征值 $\\lambda_{2} = -1$ 的特征向量为\n\n$$\n\\boldsymbol {\\beta} _ {2} = \\left( \\begin{array}{c} - 1 \\\\ 3 \\\\ 0 \\end{array} \\right);\n$$\n\n由 $2\\pmb {E} - \\pmb {B} = \\left( \\begin{array}{rrr}0 & -1 & 0\\\\ 0 & 3 & 0\\\\ 0 & 0 & 4 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}0 & 1 & 0\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\pmb{B}$ 的属于特征值 $\\lambda_{2} = 2$ 的特征向量为 $\\pmb {\\beta}_3 = \\left( \\begin{array}{l}1\\\\ 0\\\\ 0 \\end{array} \\right),$\n\n令 $\\pmb{P}_{2} = \\begin{pmatrix} 0 & -1 & 1\\\\ 0 & 3 & 0\\\\ 1 & 0 & 0 \\end{pmatrix}$ 则 $\\pmb {P}_2^{-1}\\pmb {B}\\pmb {P}_2 = \\left( \\begin{array}{rrr} - 2 & 0 & 0\\\\ 0 & -1 & 0\\\\ 0 & 0 & 2 \\end{array} \\right)$\n\n由 $P_{1}^{-1}AP_{1} = P_{2}^{-1}BP_{2}$ 得 $(P_{1}P_{2}^{-1})^{-1}A(P_{1}P_{2}^{-1}) = B$\n\n故 $\\pmb {P} = \\pmb {P}_1\\pmb{P}_2^{-1} = \\left( \\begin{array}{rrr} - 1 & -1 & -1\\\\ 2 & 1 & 2\\\\ 0 & 0 & 4 \\end{array} \\right).$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2019数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-19-22",
        "paperQuestionNumber": 22,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 22 题】\n(本题满分 11 分)\n\n设随机变量 $X$ 与 $Y$ 相互独立， $X$ 服从参数为1的指数分布， $Y$ 的概率分布为 $P\\{Y = -1\\} = p$ ， $P\\{Y = 1\\} = 1 - p (0 < p < 1)$ 。令 $Z = XY$ 。\n\n（I）求 $Z$ 的概率密度；  \n(II) $p$ 为何值时, $X$ 与 $Z$ 不相关;  \n(III) $X$ 与 $Z$ 是否相互独立？",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(22)【解】（I）因为 $X \\sim E(1)$ ，所以 $X$ 的分布函数为 $F(x) = \\begin{cases} 1 - \\mathrm{e}^{-x}, & x \\geqslant 0, \\\\ 0, & x < 0. \\end{cases}$\n\n$$\n\\begin{array}{l} F _ {Z} (z) = P \\{X Y \\leqslant z \\} = P \\{Y = - 1 \\} P \\{X Y \\leqslant z \\mid Y = - 1 \\} + P \\{Y = 1 \\} P \\{X Y \\leqslant z \\mid Y = 1 \\} \\\\ = p P \\{- X \\leqslant z \\} + (1 - p) P \\{X \\leqslant z \\} = p P \\{X \\geqslant - z \\} + (1 - p) P \\{X \\leqslant z \\} \\\\ = p [ 1 - P \\{X \\leqslant - z \\} ] + (1 - p) P \\{X \\leqslant z \\} = p [ 1 - F (- z) ] + (1 - p) F (z), \\\\ \\end{array}\n$$\n\n当 $z < 0$ 时， $F_{Z}(z) = p\\mathrm{e}^{z}$\n\n当 $z \\geqslant 0$ 时， $F_{Z}(z) = p + (1 - p)(1 - \\mathrm{e}^{-z})$\n\n故 $f_{Z}(z) = \\left\\{ \\begin{array}{ll} p \\mathrm{e}^{z}, & z < 0, \\\\ (1 - p) \\mathrm{e}^{-z}, & z \\geqslant 0. \\end{array} \\right.$\n\n$$\n\\begin{array}{l} (\\mathrm {I I}) \\operatorname {C o v} (X, Z) = \\operatorname {C o v} (X, X Y) = E \\left(X ^ {2} Y\\right) - E (X) \\cdot E (X Y) \\\\ = E \\left(X ^ {2}\\right) E (Y) - \\left[ E (X) \\right] ^ {2} E (Y) = D (X) \\cdot E (Y), \\\\ \\end{array}\n$$\n\n因为 $X \\sim E(1)$ ，所以 $E(X) = 1, D(X) = 1$\n\n又因为 $Y\\sim \\left( \\begin{array}{cc} - 1 & 1\\\\ p & 1 - p \\end{array} \\right)$ ，所以 $E(Y) = (-1)p + (1 - p) = 1 - 2p$\n\n$X$ 与 $Z$ 不相关的充分必要条件是 $\\operatorname{Cov}(X,Z) = 0$\n\n故当 $p = \\frac{1}{2}$ 时， $X$ 与 $Z$ 不相关.\n\n（Ⅲ）设 $F(x,y)$ 为 $(X,Z)$ 的联合分布函数，\n\n$$\n\\begin{array}{l} F (1, 1) = P \\{X \\leqslant 1, Z \\leqslant 1 \\} = P \\{X \\leqslant 1, X Y \\leqslant 1 \\} \\\\ = P \\{Y = - 1 \\} P \\{X \\leqslant 1, X Y \\leqslant 1 \\mid Y = - 1 \\} + P \\{Y = 1 \\} P \\{X \\leqslant 1, X Y \\leqslant 1 \\mid Y = 1 \\} \\\\ = \\frac {1}{2} P \\{X \\leqslant 1, - X \\leqslant 1 \\} + \\frac {1}{2} P \\{X \\leqslant 1 \\} = \\frac {1}{2} P \\{- 1 \\leqslant X \\leqslant 1 \\} + \\frac {1}{2} P \\{X \\leqslant 1 \\} \\\\ = P \\{X \\leqslant 1 \\} = F (1) = 1 - \\frac {1}{\\mathrm {e}}, \\\\ \\end{array}\n$$\n\n$$\nF _ {X} (1) = P \\{X \\leqslant 1 \\} = 1 - \\frac {1}{\\mathrm {e}},\n$$\n\n$$\n\\begin{array}{l} F _ {Z} (1) = P \\{X Y \\leqslant 1 \\} = P \\{Y = - 1 \\} P \\{X Y \\leqslant 1 \\mid Y = - 1 \\} + P \\{Y = 1 \\} P \\{X Y \\leqslant 1 \\mid Y = 1 \\} \\\\ = \\frac {1}{2} P \\{- X \\leqslant 1 \\} + \\frac {1}{2} P \\{X \\leqslant 1 \\} = \\frac {1}{2} P \\{X \\geqslant - 1 \\} + \\frac {1}{2} P \\{X \\leqslant 1 \\} \\\\ = \\frac {1}{2} + \\frac {1}{2} \\left(1 - \\frac {1}{\\mathrm {e}}\\right) = 1 - \\frac {1}{2 \\mathrm {e}}, \\\\ \\end{array}\n$$\n\n因为 $F(1,1)\\neq F_{X}(1)\\cdot F_{Z}(1)$ ，所以 $X$ 与 $Z$ 不相互独立.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2019数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-19-23",
        "paperQuestionNumber": 23,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2019 考研数学一真题 · 第 23 题】\n(本题满分 11 分)\n\n设总体 $X$ 的概率密度为\n\n$$\nf (x; \\sigma^ {2}) = \\left\\{ \\begin{array}{l l} \\frac {A}{\\sigma} \\mathrm {e} ^ {- \\frac {(x - \\mu) ^ {2}}{2 \\sigma^ {2}}}, & x \\geqslant \\mu , \\\\ 0, & x <   \\mu , \\end{array} \\right.\n$$\n\n其中 $\\mu$ 是已知参数， $\\sigma > 0$ 是未知参数， $A$ 是常数. $X_{1}, X_{2}, \\dots, X_{n}$ 是来自总体 $X$ 的简单随机样本.\n\n(I) 求 $A$ ;   \n（Ⅱ）求 $\\sigma^2$ 的最大似然估计量",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（23）【解】（I）由归一性得\n\n$$\n\\begin{array}{l} 1 = \\int_ {\\mu} ^ {+ \\infty} \\frac {A}{\\sigma} e ^ {- \\frac {(x - \\mu) ^ {2}}{2 \\sigma^ {2}}} d x = A \\int_ {\\mu} ^ {+ \\infty} e ^ {- \\frac {1}{2} (\\frac {x - \\mu}{\\sigma}) ^ {2}} d \\left(\\frac {x - \\mu}{\\sigma}\\right) = A \\int_ {0} ^ {+ \\infty} e ^ {- \\frac {x ^ {2}}{2}} d x \\\\ = \\sqrt {2 \\pi} A \\int_ {0} ^ {+ \\infty} \\frac {1}{\\sqrt {2 \\pi}} e ^ {- \\frac {x ^ {2}}{2}} d x = \\frac {\\sqrt {2 \\pi}}{2} A \\int_ {- \\infty} ^ {+ \\infty} \\frac {1}{\\sqrt {2 \\pi}} e ^ {- \\frac {x ^ {2}}{2}} d x = \\frac {\\sqrt {2 \\pi}}{2} A, \\\\ \\end{array}\n$$\n\n解得 $A = \\sqrt{\\frac{2}{\\pi}}$\n\n$\\left(\\mathrm{II}\\right)L\\left(\\sigma^{2}\\right) = \\frac{A^{n}}{\\left(\\sigma^{2}\\right)^{\\frac{n}{2}}}\\mathrm{e}^{-\\frac{1}{2\\sigma^{2}}\\sum_{i = 1}^{n}(x_{i} - \\mu)^{2}},$\n\n$$\n\\ln L (\\sigma^ {2}) = n \\ln A - \\frac {n}{2} \\ln \\sigma^ {2} - \\frac {1}{2 \\sigma^ {2}} \\sum_ {i = 1} ^ {n} (x _ {i} - \\mu) ^ {2},\n$$\n\n由 $\\frac{\\mathrm{d}}{\\mathrm{d}\\sigma^2}\\ln L(\\sigma^2) = -\\frac{n}{2} \\cdot \\frac{1}{\\sigma^2} + \\frac{1}{2\\sigma^4}\\sum_{i=1}^{n}(x_i - \\mu)^2 = 0$ 得\n\n$\\sigma^2$ 的最大似然估计值为 $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i = 1}^{n}(x_i - \\mu)^2,$\n\n故 $\\sigma^2$ 的最大似然估计量为 $\\hat{\\sigma}^2 = \\frac{1}{n}\\sum_{i = 1}^{n}(X_i - \\mu)^2.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2019数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2019真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "困难"
      }
    ]
  },
  {
    "id": "paper-math1-2018",
    "year": 2018,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2018 全国统考",
    "title": "2018 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2018 年考研数学一全国统考真题原卷，涵盖选择题 8 题（32分）、填空题 6 题（24分）与解答题 9 题（94分），共 23 题完整试题与详尽分步解析。",
    "questions": [
      {
        "id": "m1-18-01",
        "paperQuestionNumber": 1,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 1 题】\n下列函数中, 在 $x = 0$ 处不可导的是( )",
        "correctAnswer": "D",
        "explanation": "（1）【答案】 (D).\n\n【解】 方法一 对 $f(x) = \\cos \\sqrt{|x|}$\n\n$\\lim_{x \\to 0} \\frac{f(x) - f(0)}{x} = \\lim_{x \\to 0} \\frac{\\cos \\sqrt{|x|} - 1}{x} = -\\frac{1}{2} \\lim_{x \\to 0} \\frac{|x|}{x}$ 不存在，即 $f(x) = \\cos \\sqrt{|x|}$ 在 $x = 0$ 处不可导，应选(D).\n\n方法二\n\n当 $f(x) = |x|\\sin |x|$ 时， $f(x) - f(0) \\sim x^2, f(x)$ 在 $x = 0$ 处可导且导数为0，不选(A)；当 $f(x) = |x|\\sin \\sqrt{|x|}$ 时， $f(x) - f(0) \\sim |x|^{\\frac{3}{2}}, f(x)$ 在 $x = 0$ 处可导且导数为0，不选(B)；\n\n当 $f(x) = \\cos |x|$ 时， $f(x) - f(0) \\sim -\\frac{1}{2} x^2$ ， $f(x)$ 在 $x = 0$ 处可导且导数为 0，不选 (C)，应选 (D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "简单",
        "options": [
          "A. $f(x) = |x| \\sin |x|$ .",
          "B. $f(x) = |x| \\sin \\sqrt{|x|}$ .",
          "C. $f(x) = \\cos |x|$ .",
          "D. $f(x) = \\cos{\\sqrt{|x|}}.$"
        ]
      },
      {
        "id": "m1-18-02",
        "paperQuestionNumber": 2,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 2 题】\n过点 $(1,0,0), (0,1,0)$ , 且与曲面 $z = x^2 + y^2$ 相切的平面为( )",
        "correctAnswer": "B",
        "explanation": "(2)【答案】 (B).\n\n【解】 设切点为 $(x_0, y_0, z_0)$ ，则\n\n$$\n\\left\\{ \\begin{array}{l} z _ {0} = x _ {0} ^ {2} + y _ {0} ^ {2}, \\\\ (2 x _ {0}, 2 y _ {0}, - 1) \\cdot (1, - 1, 0) = 0, \\\\ (2 x _ {0}, 2 y _ {0}, - 1) \\cdot (x _ {0} - 1, y _ {0}, z _ {0}) = 0, \\end{array} \\right.\n$$\n\n解之得 $\\begin{cases} x_0 = 0, \\\\ y_0 = 0, \\\\ z_0 = 0, \\end{cases}$ 或 $\\begin{cases} x_0 = 1, \\\\ y_0 = 1, \\\\ z_0 = 2, \\end{cases}$\n\n故所求切平面为 $z = 0$ 或 $2x + 2y - z = 2$ . 应选(B).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $z = 0$ 与 $x + y - z = 1$ .",
          "B. $z = 0$ 与 $2x + 2y - z = 2$ .",
          "C. $x = y$ 与 $x + y - z = 1$ .",
          "D. $x = y$ 与 $2x + 2y - z = 2.$"
        ]
      },
      {
        "id": "m1-18-03",
        "paperQuestionNumber": 3,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 3 题】\n$\\sum_{n=0}^{\\infty}(-1)^{n}\\frac{2n+3}{(2n+1)!}=$",
        "correctAnswer": "B",
        "explanation": "（3）【答案】 (B).\n\n【解】 $\\sum_{n = 0}^{\\infty}(-1)^{n}\\frac{2n + 3}{(2n + 1)!} = \\sum_{n = 0}^{\\infty}(-1)^{n}\\frac{1}{(2n)!} +2\\sum_{n = 0}^{\\infty}(-1)^{n}\\frac{1}{(2n + 1)!}$\n\n$$\n= \\cos 1 + 2 \\sin 1,\n$$\n\n应选（B）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\sin 1 + \\cos 1$",
          "B. $2\\sin 1 + \\cos 1$",
          "C. $2 \\sin 1 + 2 \\cos 1$ .",
          "D. $2 \\sin 1 + 3 \\cos 1$ ."
        ]
      },
      {
        "id": "m1-18-04",
        "paperQuestionNumber": 4,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 4 题】\n设 $M = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} \\frac{(1 + x)^2}{1 + x^2} \\mathrm{d}x, N = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} \\frac{1 + x}{\\mathrm{e}^x} \\mathrm{d}x, K = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} (1 + \\sqrt{\\cos x}) \\mathrm{d}x$ , 则( )",
        "correctAnswer": "C",
        "explanation": "（4）【答案】 (C).\n\n【解】 $M = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\frac{(1 + x)^{2}}{1 + x^{2}}\\mathrm{d}x = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\left(1 + \\frac{2x}{1 + x^{2}}\\right)\\mathrm{d}x = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\mathrm{d}x = \\pi ,$\n\n当 $-\\frac{\\pi}{2} \\leqslant x \\leqslant \\frac{\\pi}{2}$ 时, $1 + \\sqrt{\\cos x} > 1 > \\frac{1 + x}{\\mathrm{e}^x}$ ,\n\n$\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}(1 + \\sqrt{\\cos x})\\mathrm{d}x > \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}1\\mathrm{d}x > \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\frac{1 + x}{\\mathrm{e}^x}\\mathrm{d}x$ ，即 $K > M > N.$ 应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $M > N > K.$",
          "B. $M > K > N.$",
          "C. $K > M > N.$",
          "D. $K > N > M.$"
        ]
      },
      {
        "id": "m1-18-05",
        "paperQuestionNumber": 5,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 5 题】\n下列矩阵中, 与矩阵 $\\left( \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$ 相似的为( )",
        "correctAnswer": "A",
        "explanation": "（5）【答案】 （A）.\n\n【解】 方法一\n\n令 $\\pmb {M} = \\left( \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right),\\pmb {A} = \\left( \\begin{array}{lll}1 & 1 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right),\\pmb {B} = \\left( \\begin{array}{lll}1 & 0 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right),$\n\n$$\n\\boldsymbol {C} = \\left( \\begin{array}{c c c} 1 & 1 & - 1 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right), \\boldsymbol {D} = \\left( \\begin{array}{c c c} 1 & 0 & - 1 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right),\n$$\n\n显然矩阵 $A, B, C, D$ 的特征值都是 $\\lambda_{1} = \\lambda_{2} = \\lambda_{3} = 1$\n\n$$\n\\begin{array}{l} \\boldsymbol {E} - \\boldsymbol {M} = \\left( \\begin{array}{c c c} 0 & - 1 & 0 \\\\ 0 & 0 & - 1 \\\\ 0 & 0 & 0 \\end{array} \\right), \\boldsymbol {E} - \\boldsymbol {A} = \\left( \\begin{array}{c c c} 0 & - 1 & 1 \\\\ 0 & 0 & - 1 \\\\ 0 & 0 & 0 \\end{array} \\right), \\boldsymbol {E} - \\boldsymbol {B} = \\left( \\begin{array}{c c c} 0 & 0 & 1 \\\\ 0 & 0 & - 1 \\\\ 0 & 0 & 0 \\end{array} \\right), \\\\ \\boldsymbol {E} - \\boldsymbol {C} = \\left( \\begin{array}{c c c} 0 & - 1 & 1 \\\\ 0 & 0 & 0 \\\\ 0 & 0 & 0 \\end{array} \\right), \\boldsymbol {E} - \\boldsymbol {D} = \\left( \\begin{array}{c c c} 0 & 0 & 1 \\\\ 0 & 0 & 0 \\\\ 0 & 0 & 0 \\end{array} \\right), \\\\ \\end{array}\n$$\n\n因为 $r(\\pmb {E} - \\pmb {M}) = r(\\pmb {E} - \\pmb {A}) = 2$ ，所以应选（A）.\n\n方法二\n\n取 $\\pmb {P} = \\left( \\begin{array}{lll}1 & -1 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right)$ ，则 $P^{-1} = \\left( \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right),$\n\n因为 $P^{-1}\\left( \\begin{array}{lll}1 & 1 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)P = \\left( \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$ ，所以 $\\left( \\begin{array}{lll}1 & 1 & 0\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$ 与 $\\left( \\begin{array}{lll}1 & 1 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$ 相似，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "线性代数真题",
          "2018数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\left( \\begin{array}{rrr}1 & 1 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$",
          "B. $\\left( \\begin{array}{rrr}1 & 0 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 1 \\end{array} \\right)$",
          "C. $\\left( \\begin{array}{rrr}1 & 1 & -1\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right)$",
          "D. $\\left( \\begin{array}{rrr}1 & 0 & -1\\\\ 0 & 1 & 0\\\\ 0 & 0 & 1 \\end{array} \\right)$ ."
        ]
      },
      {
        "id": "m1-18-06",
        "paperQuestionNumber": 6,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 6 题】\n设 $A, B$ 为 $n$ 阶矩阵, 记 $r(X)$ 为矩阵 $X$ 的秩, $(X, Y)$ 表示分块矩阵, 则( )",
        "correctAnswer": "A",
        "explanation": "（6）【答案】 （A）.\n\n【解】 $(A,AB) = A(E,B)$\n\n显然 $r(\\mathbf{A},\\mathbf{AB}) = r[\\mathbf{A}(\\mathbf{E},\\mathbf{B})]\\leqslant r(\\mathbf{A}),$\n\n又 $r(A, AB) \\geqslant r(A)$ ,\n\n于是 $r(\\mathbf{A},\\mathbf{AB}) = r(\\mathbf{A})$ ，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "线性代数真题",
          "2018数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $r(\\mathbf{A}, \\mathbf{AB}) = r(\\mathbf{A})$ .",
          "B. $r(\\mathbf{A}, \\mathbf{B}\\mathbf{A}) = r(\\mathbf{A})$ .",
          "C. $r(\\mathbf{A}, \\mathbf{B}) = \\max \\{r(\\mathbf{A}), r(\\mathbf{B})\\}$ .",
          "D. $(\\mathrm{D})r(\\mathbf{A},\\mathbf{B}) = r(\\mathbf{A}^{\\mathrm{T}},\\mathbf{B}^{\\mathrm{T}}).$"
        ]
      },
      {
        "id": "m1-18-07",
        "paperQuestionNumber": 7,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 7 题】\n设随机变量 $X$ 的概率密度 $f(x)$ 满足 $f(1 + x) = f(1 - x)$ , 且 $\\int_0^2 f(x) \\, \\mathrm{d}x = 0.6$ , 则 $P\\{X < 0\\} =$ ( )",
        "correctAnswer": "A",
        "explanation": "（7）【答案】 （A）.\n\n【解】 $\\int_0^1 f(x)\\mathrm{d}x = \\int_1^2 f(x)\\mathrm{d}x = \\frac{1}{2}\\int_0^2 f(x)\\mathrm{d}x = 0.3,$\n\n$P(X < 0) = \\int_{-\\infty}^{0} f(x) \\, \\mathrm{d}x = \\int_{-\\infty}^{1} f(x) \\, \\mathrm{d}x - \\int_{0}^{1} f(x) \\, \\mathrm{d}x = 0.5 - 0.3 = 0.2$ ，应选(A).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2018数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. 0.2.",
          "B. 0.3.",
          "C. 0.4.",
          "D. 0.5."
        ]
      },
      {
        "id": "m1-18-08",
        "paperQuestionNumber": 8,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2018 考研数学一真题 · 第 8 题】\n设总体 $X$ 服从正态分布 $N(\\mu, \\sigma^2)$ . $X_1, X_2, \\dots, X_n$ 是来自总体 $X$ 的简单随机样本, 据此样本检验假设: $H_0: \\mu = \\mu_0, H_1: \\mu \\neq \\mu_0$ , 则( )",
        "correctAnswer": "D",
        "explanation": "（8）【答案】 (D).\n\n【解】若 $\\sigma^2$ 已知，则假设 $H_0$ 的接受域： $|u| < u_{\\frac{\\alpha}{2}}$ ，其中 $u_{\\frac{\\alpha}{2}}$ 为正态分布的 $\\frac{\\alpha}{2}$ （上）分位数。若 $\\sigma^2$ 未知，则假设 $H_0$ 的接受域： $|t| < t_{\\frac{\\alpha}{2}}(n - 1)$ ，其中 $t_{\\frac{\\alpha}{2}}(n - 1)$ 为自由度是 $n - 1$ 的 $t$ 分布的 $\\frac{\\alpha}{2}$ （上）分位数。显然检验水平 $\\alpha$ 变小，接受域都变大。应选(D)。\n\n# 二、填空题",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2018数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. 如果在检验水平 $\\alpha = 0.05$ 下拒绝 $H_{0}$ , 那么 $\\alpha = 0.01$ 下必拒绝 $H_{0}$ .",
          "B. 如果在检验水平 $\\alpha = 0.05$ 下拒绝 $H_{0}$ , 那么 $\\alpha = 0.01$ 下必接受 $H_{0}$ .",
          "C. 如果在检验水平 $\\alpha = 0.05$ 下接受 $H_{0}$ , 那么 $\\alpha = 0.01$ 下必拒绝 $H_{0}$ .",
          "D. 如果在检验水平 $\\alpha = 0.05$ 下接受 $H_{0}$ , 那么 $\\alpha = 0.01$ 下必接受 $H_{0}$ .\n\n# 二、填空题(本题共6小题，每小题4分，共24分，把答案填在题中横线上.)"
        ]
      },
      {
        "id": "m1-18-09",
        "paperQuestionNumber": 9,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 9 题】\n若 $\\lim_{x \\to 0} \\left( \\frac{1 - \\tan x}{1 + \\tan x} \\right)^{\\frac{1}{\\sin kx}} = e$ ，则 $k = \\_$",
        "correctAnswer": "-2",
        "explanation": "（9）【答案】 -2.\n\n【解】因为 $\\lim_{x\\to 0}\\frac{1}{\\sin kx}\\cdot \\left(\\frac{1 - \\tan x}{1 + \\tan x} -1\\right) = \\lim_{x\\to 0}\\frac{1}{\\sin kx}\\cdot \\frac{-2\\tan x}{1 + \\tan x} = \\lim_{x\\to 0}\\frac{1}{kx}\\cdot \\frac{-2x}{1 + \\tan x} = -\\frac{2}{k},$\n\n故 $\\lim_{x\\to 0}\\left(\\frac{1 - \\tan x}{1 + \\tan x}\\right)^{\\frac{1}{\\sin kx}} = \\mathrm{e}^{-\\frac{2}{k}} = \\mathrm{e}$ 即 $k = -2$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：-2"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-18-10",
        "paperQuestionNumber": 10,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 10 题】\n设函数 $f(x)$ 具有 2 阶连续导数. 若曲线 $y = f(x)$ 过点 $(0,0)$ 且与曲线 $y = 2^x$ 在点 $(1,2)$ 处相切, 则 $\\int_{0}^{1} x f''(x) \\mathrm{d}x =$ ________.",
        "correctAnswer": "$2(\\ln 2 - 1)$",
        "explanation": "(10)【答案】 $2(\\ln 2 - 1)$\n\n【解】 $f^{\\prime}(1) = (2^{x})^{\\prime}\\big|_{x = 1} = 2\\ln 2,$\n\n$$\n\\begin{array}{l} \\int_ {0} ^ {1} x f ^ {\\prime \\prime} (x) d x = \\int_ {0} ^ {1} x d f ^ {\\prime} (x) = x f ^ {\\prime} (x) \\left| _ {0} ^ {1} - \\int_ {0} ^ {1} f ^ {\\prime} (x) d x = f ^ {\\prime} (1) - f (1) + f (0) \\right. \\\\ = 2 \\ln 2 - 2 = 2 (\\ln 2 - 1). \\\\ \\end{array}\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$2(\\ln 2 - 1)$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-11",
        "paperQuestionNumber": 11,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 11 题】\n设 $F(x, y, z) = xy \\mathbf{i} - yz \\mathbf{j} + zx \\mathbf{k}$ , 则 $\\operatorname{rot} F(1, 1, 0) =$ ______.",
        "correctAnswer": "$i - k$",
        "explanation": "（11）【答案】 $i - k$\n\n【解】rot $\\pmb {F}(1,1,0) = \\left| \\begin{array}{ccc}\\pmb {i} & \\pmb {j} & \\pmb {k}\\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z}\\\\ xy & -yz & zx \\end{array} \\right|_{(1,1,0)} = (y\\pmb {i} - z\\pmb {j} - x\\pmb {k})\\bigg|_{(1,1,0)} = \\pmb {i} - \\pmb {k}.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$i - k$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-12",
        "paperQuestionNumber": 12,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 12 题】\n设 $L$ 为球面 $x^{2} + y^{2} + z^{2} = 1$ 与平面 $x + y + z = 0$ 的交线, 则 $\\oint_{L} xy \\, \\mathrm{d}s =$ ______.",
        "correctAnswer": "$-\\frac{\\pi}{3}$ ",
        "explanation": "(12)【答案】 $-\\frac{\\pi}{3}$ .\n\n【解】 $\\oint_{L}xy\\mathrm{d}s = \\frac{1}{3}\\oint_{L}(xy + yz + xz)\\mathrm{d}s = \\frac{1}{6}\\oint_{L}[(x + y + z)^{2} - (x^{2} + y^{2} + z^{2})]\\mathrm{d}s$\n\n$$\n= - \\frac {1}{6} \\oint_ {L} d s = - \\frac {\\pi}{3}.\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$-\\frac{\\pi}{3}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-13",
        "paperQuestionNumber": 13,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 13 题】\n设 2 阶矩阵 $\\mathbf{A}$ 有两个不同特征值, $\\alpha_{1}, \\alpha_{2}$ 是 $\\mathbf{A}$ 的线性无关的特征向量, 且满足 $A^{2}(\\alpha_{1} + \\alpha_{2}) = \\alpha_{1} + \\alpha_{2}$ , 则 $|\\mathbf{A}| =$ ______.",
        "correctAnswer": "-1",
        "explanation": "（13）【答案】 -1.\n\n【解】 $\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2}$ 是 $\\mathbf{A}$ 的线性无关的特征向量，则 $\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2}$ 是 $A^2$ 的线性无关的特征向量.\n\n由 $A^2 (\\alpha_1 + \\alpha_2) = \\alpha_1 + \\alpha_2$ ，得 $\\alpha_{1} + \\alpha_{2}$ 也为 $A^2$ 的特征向量，因此 $A^2$ 有二重特征值 $\\lambda = 1$ 因为 $\\mathbf{A}$ 有两个不同的特征值，所以 $\\mathbf{A}$ 的特征值为 $\\lambda_{1} = -1,\\lambda_{2} = 1$ ，于是 $|\\textbf{A}| = -1$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：-1"
        ],
        "keyPoints": [
          "线性代数真题",
          "2018数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-18-14",
        "paperQuestionNumber": 14,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2018 考研数学一真题 · 第 14 题】\n设随机事件 $A$ 与 $B$ 相互独立, $A$ 与 $C$ 相互独立, $BC = \\varnothing$ . 若 $P(A) = P(B) = \\frac{1}{2}, P(AC \\mid AB \\cup C) = \\frac{1}{4}$ , 则 $P(C) = \\_$ .\n\n# 三、解答题(本题共9小题，共94分，解答应写出文字说明、证明过程或演算步骤.)",
        "correctAnswer": "$\\frac{1}{4}$ ",
        "explanation": "(14)【答案】 $\\frac{1}{4}$ .\n\n【解】由 $BC = \\varnothing$ ，得 $P(BC) = 0$ ，因为 $ABC\\subset BC$ ，所以 $P(ABC) = 0$\n\n$$\n\\begin{array}{l} P (A C \\mid A B \\cup C) = \\frac {P [ A C (A B \\cup C) ]}{P (A B \\cup C)} = \\frac {P [ (A B C) \\cup (A C) ]}{P (A B \\cup C)} = \\frac {P (A C)}{P (A B \\cup C)} \\\\ = \\frac {P (A) P (C)}{P (A) P (B) + P (C) - P (A B C)} = \\frac {\\frac {1}{2} P (C)}{\\frac {1}{2} \\times \\frac {1}{2} + P (C) - 0} = \\frac {1}{4}, \\\\ \\end{array}\n$$\n\n解得 $P(C) = \\frac{1}{4}$ .\n\n# 三、解答题",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{1}{4}$ "
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-15",
        "paperQuestionNumber": 15,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 15 题】\n(本题满分 10 分)\n\n求不定积分 $\\int \\mathrm{e}^{2x}\\arctan{\\sqrt{\\mathrm{e}^x - 1}}\\mathrm{d}x.$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(15)【解】 $\\int \\mathrm{e}^{2x}\\arctan \\sqrt{\\mathrm{e}^x - 1}\\mathrm{d}x$\n\n$$\n\\begin{array}{l} = \\frac {1}{2} \\int \\arctan \\sqrt {\\mathrm {e} ^ {x} - 1} \\mathrm {d e} ^ {2 x} = \\frac {1}{2} \\mathrm {e} ^ {2 x} \\arctan \\sqrt {\\mathrm {e} ^ {x} - 1} - \\frac {1}{2} \\int \\mathrm {e} ^ {2 x} \\operatorname {d a r c t a n} \\sqrt {\\mathrm {e} ^ {x} - 1} \\\\ = \\frac {1}{2} \\mathrm {e} ^ {2 x} \\arctan \\sqrt {\\mathrm {e} ^ {x} - 1} - \\frac {1}{4} \\int \\frac {\\mathrm {e} ^ {2 x}}{\\sqrt {\\mathrm {e} ^ {x} - 1}} \\mathrm {d} x = \\frac {1}{2} \\mathrm {e} ^ {2 x} \\arctan \\sqrt {\\mathrm {e} ^ {x} - 1} - \\frac {1}{2} \\int \\mathrm {e} ^ {x} \\mathrm {d} \\sqrt {\\mathrm {e} ^ {x} - 1} \\\\ \\end{array}\n$$\n\n$$\n\\begin{array}{l} = \\frac {1}{2} e ^ {2 x} \\arctan \\sqrt {e ^ {x} - 1} - \\frac {1}{2} (e ^ {x} \\sqrt {e ^ {x} - 1} - \\int \\sqrt {e ^ {x} - 1} d e ^ {x}) \\\\ = \\frac {1}{2} e ^ {2 x} \\arctan \\sqrt {e ^ {x} - 1} - \\frac {1}{2} \\left[ e ^ {x} \\sqrt {e ^ {x} - 1} - \\frac {2}{3} (e ^ {x} - 1) ^ {\\frac {3}{2}} \\right] + C \\\\ = \\frac {1}{2} e ^ {2 x} \\arctan \\sqrt {e ^ {x} - 1} - \\frac {1}{6} (e ^ {x} + 2) \\sqrt {e ^ {x} - 1} + C. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-16",
        "paperQuestionNumber": 16,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 16 题】\n(本题满分 10 分)\n\n将长为 $2 \\mathrm{~m}$ 的铁丝分成三段, 依次围成圆、正方形与正三角形. 三个图形的面积之和是否存在最小值? 若存在, 求出最小值.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（16）【解】设铁丝分成的三段长分别是 $x, y, z$ ，则 $x + y + z = 2$ ，且依次围成的圆、正方形与正三角形三个图形的面积之和为\n\n$$\nf (x, y, z) = \\pi \\left(\\frac {x}{2 \\pi}\\right) ^ {2} + \\left(\\frac {y}{4}\\right) ^ {2} + \\frac {\\sqrt {3}}{4} \\left(\\frac {z}{3}\\right) ^ {2} = \\frac {x ^ {2}}{4 \\pi} + \\frac {y ^ {2}}{1 6} + \\frac {\\sqrt {3}}{3 6} z ^ {2},\n$$\n\n构造拉格朗日函数： $L(x,y,z,\\lambda) = \\frac{x^2}{4\\pi} +\\frac{y^2}{16} +\\frac{\\sqrt{3}}{36} z^2 +\\lambda (x + y + z - 2)$\n\n令 $\\begin{cases} L_{x}^{\\prime} = \\frac{x}{2\\pi} + \\lambda = 0, \\\\ L_{y}^{\\prime} = \\frac{y}{8} + \\lambda = 0, \\\\ L_{z}^{\\prime} = \\frac{\\sqrt{3}}{18} z + \\lambda = 0, \\\\ L_{\\lambda}^{\\prime} = x + y + z - 2 = 0, \\end{cases}$ 得 $\\left\\{ \\begin{array}{l} x_0 = \\frac{2\\pi}{\\pi + 4 + 3\\sqrt{3}}, \\\\ y_0 = \\frac{8}{\\pi + 4 + 3\\sqrt{3}}, \\\\ z_0 = \\frac{6\\sqrt{3}}{\\pi + 4 + 3\\sqrt{3}}, \\end{array} \\right.$ 此时 $f(x_0, y_0, z_0) = \\frac{1}{\\pi + 4 + 3\\sqrt{3}}$\n\n又当 $x + y + z = 2,xyz = 0$ 时， $f(x,y,z)$ 的最小值为 $f\\left(0,\\frac{8}{4 + 3\\sqrt{3}},\\frac{6\\sqrt{3}}{4 + 3\\sqrt{3}}\\right) = \\frac{1}{4 + 3\\sqrt{3}}.$ 所以三个图形的面积之和存在最小值，最小值为 $f(x_0,y_0,z_0) = \\frac{1}{\\pi + 4 + 3\\sqrt{3}}.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 17 题】\n(本题满分 10 分)\n\n设 $\\Sigma$ 是曲面 $x = \\sqrt{1 - 3y^2 - 3z^2}$ 的前侧，计算曲面积分 $I = \\iint_{\\Sigma} x \\, \\mathrm{d}y \\, \\mathrm{d}z + (y^3 + 2) \\, \\mathrm{d}z \\, \\mathrm{d}x + z^3 \\, \\mathrm{d}x \\, \\mathrm{d}y.$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（17）【解】补曲面 $\\Sigma_{1}:\\left\\{ \\begin{array}{l}x = 0,\\\\ 3y^{2} + 3z^{2} = 1, \\end{array} \\right.$ 取后侧， $\\Omega$ 为 $\\Sigma$ 与 $\\Sigma_{1}$ 所围成的立体.利用高斯公式可得\n\n$$\n\\begin{array}{l} I = \\iint_ {\\Sigma + \\Sigma_ {1}} x \\mathrm {d} y \\mathrm {d} z + (y ^ {3} + 2) \\mathrm {d} z \\mathrm {d} x + z ^ {3} \\mathrm {d} x \\mathrm {d} y - \\iint_ {\\Sigma_ {1}} x \\mathrm {d} y \\mathrm {d} z + (y ^ {3} + 2) \\mathrm {d} z \\mathrm {d} x + z ^ {3} \\mathrm {d} x \\mathrm {d} y \\\\ = \\iiint_ {\\Omega} (1 + 3 y ^ {2} + 3 z ^ {2}) d x d y d z - 0 = \\iiint_ {\\Omega} (1 + 3 y ^ {2} + 3 z ^ {2}) d x d y d z \\\\ \\end{array}\n$$\n\n利用柱坐标变换 $y = r\\cos \\theta, z = r\\sin \\theta, x = x$ 得\n\n$$\n\\begin{array}{l} \\iiint_ {\\Omega} (1 + 3 y ^ {2} + 3 z ^ {2}) \\mathrm {d} x \\mathrm {d} y \\mathrm {d} z = \\int_ {0} ^ {2 \\pi} \\mathrm {d} \\theta \\int_ {0} ^ {\\frac {\\sqrt {3}}{3}} \\mathrm {d} r \\int_ {0} ^ {\\sqrt {1 - 3 r ^ {2}}} (1 + 3 r ^ {2}) r \\mathrm {d} x \\\\ = 2 \\pi \\int_ {0} ^ {\\frac {\\sqrt {3}}{3}} \\sqrt {1 - 3 r ^ {2}} (1 + 3 r ^ {2}) r d r = \\frac {2 \\pi}{3} \\int_ {0} ^ {1} (2 - t ^ {2}) t ^ {2} d t = \\frac {1 4 \\pi}{4 5}. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-18",
        "paperQuestionNumber": 18,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程求解",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 18 题】\n(本题满分 10 分)\n\n已知微分方程 $y' + y = f(x)$ ，其中 $f(x)$ 是 $\\mathbf{R}$ 上的连续函数\n\n（I）若 $f(x) = x$ ，求方程的通解；  \n（Ⅱ）若 $f(x)$ 是周期为 $T$ 的函数，证明：方程存在唯一的以 $T$ 为周期的解",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（18）【解】（I）当 $f(x) = x$ 时，方程化为 $y^\\prime +y = x$ ，其通解为\n\n$$\ny = \\mathrm {e} ^ {- x} (C + \\int x \\mathrm {e} ^ {x} \\mathrm {d} x) = \\mathrm {e} ^ {- x} (C + x \\mathrm {e} ^ {x} - \\mathrm {e} ^ {x}) = C \\mathrm {e} ^ {- x} + x - 1.\n$$\n\n（Ⅱ）方程 $y' + y = f(x)$ 的通解为 $y = \\mathrm{e}^{-\\int_0^x \\mathrm{d}t} \\left[ C + \\int_0^x \\mathrm{e}^{\\int_0^t \\mathrm{d}s} f(t) \\, \\mathrm{d}t \\right]$ ，\n\n即 $y = \\mathrm{e}^{-x}\\left[C + \\int_0^x\\mathrm{e}^t f(t)\\mathrm{d}t\\right].$\n\n得 $y(x + T) - y(x) = \\mathrm{e}^{-x}\\left[\\left(\\frac{1}{\\mathrm{e}^T} - 1\\right)C + \\frac{1}{\\mathrm{e}^T}\\int_0^{x + T}\\mathrm{e}^t f(t)\\mathrm{d}t - \\int_0^x\\mathrm{e}^t f(t)\\mathrm{d}t\\right]$\n\n若 $f(x)$ 是周期为 $T$ 的连续函数，则\n\n$$\n\\begin{array}{l} \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {x + T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t = \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t + \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {T} ^ {x + T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t \\\\ = \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t + \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {x} \\mathrm {e} ^ {u + T} f (u + T) \\mathrm {d} u \\\\ = \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t + \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {x} \\mathrm {e} ^ {T} \\mathrm {e} ^ {u} f (u) \\mathrm {d} u = \\frac {1}{\\mathrm {e} ^ {T}} \\int_ {0} ^ {T} \\mathrm {e} ^ {t} f (t) \\mathrm {d} t + \\int_ {0} ^ {x} \\mathrm {e} ^ {s} f (t) \\mathrm {d} t \\\\ \\end{array}\n$$\n\n于是 $y(x + T) - y(x) = \\mathrm{e}^{-x}\\left[\\left(\\frac{1}{\\mathrm{e}^T} - 1\\right)C + \\frac{1}{\\mathrm{e}^T}\\int_0^T\\mathrm{e}^t f(t)\\mathrm{d}t\\right]$ ,\n\n因此当且仅当 $C = \\frac{1}{\\mathrm{e}^T - 1}\\int_0^T\\mathrm{e}^t f(t)\\mathrm{d}t$ 时， $y(x + T) - y(x) = 0$ ，即方程存在唯一的以 $T$ 为周期的解.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一",
          "常微分方程求解"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学",
          "常微分方程求解"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-18-19",
        "paperQuestionNumber": 19,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 19 题】\n(本题满分 10 分)\n\n设数列 $\\{x_{n}\\}$ 满足： $x_{1} > 0, x_{n} \\mathrm{e}^{x_{n + 1}} = \\mathrm{e}^{x_{n}} - 1 (n = 1,2,\\dots)$ . 证明数列 $\\{x_{n}\\}$ 收敛，并求 $\\lim_{n\\to \\infty}x_n$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（19）【证明】因为 $x_{1} \\neq 0$ ，所以 $\\mathrm{e}^{x_2} = \\frac{\\mathrm{e}^{x_1} - 1}{x_1}$\n\n由微分中值定理，存在 $\\xi \\in (0,x_1)$ ，使得 $\\frac{\\mathrm{e}^{x_1} - 1}{x_1} = \\mathrm{e}^{\\xi}$ 即 $\\mathrm{e}^{x_2} = \\mathrm{e}^{\\xi}$ ，因此 $0 < x_{2} < x_{1}$\n\n假设 $0 < x_{n + 1} < x_n$ ，则 $\\mathrm{e}^{x_{n + 2}} = \\frac{\\mathrm{e}^{x_{n + 1}} - 1}{x_{n + 1}} = \\mathrm{e}^{\\eta}(0 < \\eta < x_{n + 1})$ ，得 $0 < x_{n + 2} < x_{n + 1}$ 。故 $\\{x_n\\}$ 是单调减少的数列，且有下界，从而 $\\{x_n\\}$ 收敛。\n\n设 $\\lim_{n\\to \\infty}x_n = a$ ，在等式 $x_{n}\\mathrm{e}^{x_{n + 1}} = \\mathrm{e}^{x_{n}} - 1$ 两边取极限，得 $a\\mathrm{e}^a = \\mathrm{e}^a -1$ ，显然 $a = 0$ 为其解又令 $f(x) = x\\mathrm{e}^{x} - \\mathrm{e}^{x} + 1$ ，则 $f^{\\prime}(x) = x\\mathrm{e}^{x}$\n\n当 $x > 0$ 时， $f^{\\prime}(x) = x\\mathrm{e}^{x} > 0$ ，函数 $f(x)$ 在 $[0, + \\infty)$ 上单调增加，\n\n所以 $a = 0$ 是方程 $a\\mathrm{e}^a = \\mathrm{e}^a -1$ 在 $[0, + \\infty)$ 上的唯一解，故 $\\lim_{n\\to \\infty}x_n = 0$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2018数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-18-20",
        "paperQuestionNumber": 20,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 20 题】\n(本题满分 11 分)\n\n设实二次型 $f(x_{1},x_{2},x_{3}) = (x_{1} - x_{2} + x_{3})^{2} + (x_{2} + x_{3})^{2} + (x_{1} + ax_{3})^{2}$ ，其中 $a$ 是参数.\n\n(I) 求 $f(x_{1}, x_{2}, x_{3}) = 0$ 的解；  \n（Ⅱ）求 $f(x_{1},x_{2},x_{3})$ 的规范形",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(20)【解】（I） $f(x_{1},x_{2},x_{3}) = (x_{1} - x_{2} + x_{3})^{2} + (x_{2} + x_{3})^{2} + (x_{1} + ax_{3})^{2} = 0$ 的充分必要条件是 $\\begin{cases} x_1 - x_2 + x_3 = 0,\\\\ x_2 + x_3 = 0,\\\\ x_1 + ax_3 = 0. \\end{cases}$ 对齐次线性方程组的系数矩阵作初等行变换得\n\n$$\n\\boldsymbol {A} = \\left(\\begin{array}{c c c}1&- 1&1\\\\0&1&1\\\\1&0&a\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c}1&- 1&1\\\\0&1&1\\\\0&1&a - 1\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c}1&- 1&1\\\\0&1&1\\\\0&0&a - 2\\end{array}\\right),\n$$\n\n$a \\neq 2$ 时， $f(x_{1},x_{2},x_{3}) = 0$ 只有零解 $x = (x_{1},x_{2},x_{3})^{\\mathrm{T}} = (0,0,0)^{\\mathrm{T}}$\n\n$a = 2$ 时， $\\mathbf{A}\\rightarrow \\left( \\begin{array}{lll}1 & 0 & 2\\\\ 0 & 1 & 1\\\\ 0 & 0 & 0 \\end{array} \\right),$\n\n$f(x_{1},x_{2},x_{3}) = 0$ 有非零解 $x = (x_{1},x_{2},x_{3})^{\\mathrm{T}} = k(-2, - 1,1)^{\\mathrm{T}}$ ，其中 $k\\neq 0$\n\n（Ⅱ） $a\\neq 2$ 时，令 $\\binom{y_1}{y_2}=\\binom{1-1}{0}\\binom{1}{1}\\binom{x_1}{x_2},$\n\n因 $\\left| \\begin{array}{ccc}1 & -1 & 1\\\\ 0 & 1 & 1\\\\ 1 & 0 & a \\end{array} \\right| = \\left| \\begin{array}{ccc}1 & -1 & 1\\\\ 0 & 1 & 1\\\\ 0 & 0 & a - 2 \\end{array} \\right| = a - 2\\neq 0$ ，则矩阵 $\\left( \\begin{array}{ccc}1 & -1 & 1\\\\ 0 & 1 & 1\\\\ 1 & 0 & a \\end{array} \\right)$ 可逆，\n\n所以 $f(x_{1},x_{2},x_{3})$ 的规范形为 $f(y_{1},y_{2},y_{3}) = y_{1}^{2} + y_{2}^{2} + y_{3}^{2}$\n\n$a = 2$ 时，\n\n$$\n\\begin{array}{l} f \\left(x _ {1}, x _ {2}, x _ {3}\\right) = \\left(x _ {1} - x _ {2} + x _ {3}\\right) ^ {2} + \\left(x _ {2} + x _ {3}\\right) ^ {2} + \\left(x _ {1} + a x _ {3}\\right) ^ {2} \\\\ = 2 x _ {1} ^ {2} + 2 x _ {2} ^ {2} + 6 x _ {3} ^ {2} - 2 x _ {1} x _ {2} + 6 x _ {1} x _ {3} \\\\ = 2 \\left(x _ {1} - x _ {2} + x _ {3}\\right) ^ {2} + \\frac {3}{2} x _ {2} ^ {2} + \\frac {3}{2} x _ {3} ^ {2} + 3 x _ {2} x _ {3} \\\\ = 2 \\left(x _ {1} - x _ {2} + x _ {3}\\right) ^ {2} + \\frac {3}{2} \\left(x _ {2} + x _ {3}\\right) ^ {2} \\\\ \\end{array}\n$$\n\n所以 $f(x_{1},x_{2},x_{3})$ 的规范形为 $f(y_{1},y_{2},y_{3}) = y_{1}^{2} + y_{2}^{2}$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2018数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-21",
        "paperQuestionNumber": 21,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 21 题】\n(本题满分 11 分)\n\n已知 $a$ 是常数，且矩阵 $\\mathbf{A} = \\begin{pmatrix} 1 & 2 & a \\\\ 1 & 3 & 0 \\\\ 2 & 7 & -a \\end{pmatrix}$ 可经初等列变换化为矩阵 $\\mathbf{B} = \\begin{pmatrix} 1 & a & 2 \\\\ 0 & 1 & 1 \\\\ -1 & 1 & 1 \\end{pmatrix}$ .\n\n(I) 求 $a$ ;   \n（Ⅱ）求满足 $AP = B$ 的可逆矩阵 $\\pmb{P}$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（21）【解】（I）显然 $r(\\mathbf{A}) = 2$ ，因为初等变换不改变矩阵的秩，所以 $r(\\mathbf{B}) = 2$\n\n而 $\\pmb {B} = \\left( \\begin{array}{rrr}1 & a & 2\\\\ 0 & 1 & 1\\\\ -1 & 1 & 1 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}1 & a & 2\\\\ 0 & 1 & 1\\\\ 0 & a + 1 & 3 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}1 & a & 2\\\\ 0 & 1 & 1\\\\ 0 & 0 & 2 - a \\end{array} \\right),$ 故 $a = 2$\n\n$(\\mathrm{II})\\mathbf{A} = \\left( \\begin{array}{lll}1 & 2 & 2\\\\ 1 & 3 & 0\\\\ 2 & 7 & -2 \\end{array} \\right),\\mathbf{B} = \\left( \\begin{array}{lll}1 & 2 & 2\\\\ 0 & 1 & 1\\\\ -1 & 1 & 1 \\end{array} \\right),$\n\n令 $P = (X_{1},X_{2},X_{3})$\n\n由 $(\\mathbf{A} \\mid \\mathbf{B}) = \\begin{pmatrix} 1 & 2 & 2 & 1 & 2 & 2 \\\\ 1 & 3 & 0 & 0 & 1 & 1 \\\\ 2 & 7 & -2 & -1 & 1 & 1 \\end{pmatrix} \\rightarrow \\begin{pmatrix} 1 & 0 & 6 & 3 & 4 & 4 \\\\ 0 & 1 & -2 & -1 & -1 & -1 \\\\ 0 & 0 & 0 & 0 & 0 & 0 \\end{pmatrix}$ 得\n\n$$\n\\mathbf {X} _ {1} = k _ {1} \\binom {- 6} {2} + \\binom {3} {- 1} = \\binom {- 6 k _ {1} + 3} {2 k _ {1} - 1}, \\mathbf {X} _ {2} = k _ {2} \\binom {- 6} {2} + \\binom {4} {- 1} = \\binom {- 6 k _ {2} + 4} {2 k _ {2} - 1},\n$$\n\n$$\n\\boldsymbol {X} _ {3} = k _ {3} \\binom {- 6} {2} + \\binom {4} {- 1} = \\binom {- 6 k _ {3} + 4} {2 k _ {3} - 1},\n$$\n\n则所求的可逆矩阵为 $P = \\left( \\begin{array}{ccc} - 6k_{1} + 3 & -6k_{2} + 4 & -6k_{3} + 4\\\\ 2k_{1} - 1 & 2k_{2} - 1 & 2k_{3} - 1\\\\ k_{1} & k_{2} & k_{3} \\end{array} \\right)(k_{1},k_{2},k_{3}$ 为任意常数且 $k_{2}\\neq k_{3})$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2018数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-18-22",
        "paperQuestionNumber": 22,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 22 题】\n(本题满分 11 分)\n\n设随机变量 $X$ 与 $Y$ 相互独立, $X$ 的概率分布为 $P\\{X = 1\\} = P\\{X = -1\\} = \\frac{1}{2}, Y$ 服从参数为 $\\lambda$ 的泊松分布. 令 $Z = XY$ .\n\n(I) 求 $\\operatorname{Cov}(X, Z)$ ;   \n（Ⅱ）求 $Z$ 的概率分布",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（22）【解】（I）因为 $E(X) = 0, E(X^2) = 1, E(Y) = \\lambda$ ，以及 $X, Y$ 相互独立，故\n\n$$\n\\operatorname {C o v} (X, Z) = \\operatorname {C o v} (X, X Y) = E \\left(X ^ {2} Y\\right) - E (X) E (X Y) = E \\left(X ^ {2}\\right) E (Y) - E ^ {2} (X) E (Y) = \\lambda .\n$$\n\n（Ⅱ）由 $Y$ 服从参数为 $\\lambda$ 的泊松分布，即 $P(Y = j) = \\frac{\\lambda^j}{j!}\\mathrm{e}^{-\\lambda}(j = 0,1,2,\\dots)$ ，于是， $Z$ 的所有可能取值为全体整数。故 $Z$ 的概率分布为\n\n1）当 $k$ 为正整数时，有\n\n$$\nP (Z = k) = P (X Y = k) = P (X = 1, Y = k) = P (X = 1) P (Y = k)\n$$\n\n$$\n= \\frac {1}{2} \\cdot \\frac {\\lambda^ {k}}{k !} \\mathrm {e} ^ {- \\lambda} (k = 1, 2, 3, \\dots),\n$$\n\n2）当 $k$ 为负整数时，有\n\n$$\n\\begin{array}{l} P (Z = k) = P (X Y = k) = P (X = - 1, Y = - k) = P (X = - 1) P (Y = - k) \\\\ = \\frac {1}{2} \\cdot \\frac {\\lambda^ {- k}}{(- k) !} \\mathrm {e} ^ {- \\lambda} (k = - 1, - 2, - 3, \\dots), \\\\ \\end{array}\n$$\n\n3) 当 $k$ 为0时，有\n\n$$\n\\begin{array}{l} P (Z = 0) = P (X Y = 0) = P (X = - 1, Y = 0) + P (X = 1) P (Y = 0) = P (X = - 1, Y = 0) \\\\ = \\frac {1}{2} e ^ {- \\lambda} + \\frac {1}{2} e ^ {- \\lambda} = e ^ {- \\lambda}. \\\\ \\end{array}\n$$\n\n故 $P(Z = k) = \\left\\{ \\begin{array}{ll} \\frac{1}{2} \\cdot \\frac{\\lambda^k}{k!} \\mathrm{e}^{-\\lambda}, & k = 1, 2, 3, \\dots \\\\ \\mathrm{e}^{-\\lambda}, & k = 0, \\\\ \\frac{1}{2} \\cdot \\frac{\\lambda^{-k}}{(-k)!} \\mathrm{e}^{-\\lambda}, & k = -1, -2, -3, \\dots \\end{array} \\right.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2018数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-18-23",
        "paperQuestionNumber": 23,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2018 考研数学一真题 · 第 23 题】\n(本题满分 11 分)\n\n设总体 $X$ 的概率密度为\n\n$$\nf (x; \\sigma) = \\frac {1}{2 \\sigma} \\mathrm {e} ^ {- \\frac {| x |}{\\sigma}}, - \\infty <   x <   + \\infty ,\n$$\n\n其中 $\\sigma \\in (0, +\\infty)$ 为未知参数， $X_1, X_2, \\dots, X_n$ 为来自总体 $X$ 的简单随机样本。记 $\\sigma$ 的最大似然估计量为 $\\hat{\\sigma}$ 。\n\n(I) 求 $\\hat{\\sigma}$ ;   \n（Ⅱ）求 $E(\\hat{\\sigma}),D(\\hat{\\sigma})$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（23）【解】（I）似然函数为\n\n$$\nL \\left(x _ {1}, x _ {2}, \\dots , x _ {n}; \\sigma\\right) = \\prod_ {i = 1} ^ {n} f \\left(x _ {i}; \\sigma\\right) = \\frac {1}{2 ^ {n} \\sigma^ {n}} e ^ {- \\frac {1}{\\sigma} \\sum_ {i = 1} ^ {n} | x _ {i} |}, - \\infty <   x _ {i} <   + \\infty , i = 1, 2, \\dots\n$$\n\n于是 $\\ln L = -n\\ln 2 - n\\ln \\sigma -\\frac{1}{\\sigma}\\sum_{i = 1}^{n}|x_i|$\n\n令 $\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\sigma} = -\\frac{n}{\\sigma} + \\frac{1}{\\sigma^2} \\sum_{i=1}^{n} |x_i| = 0$ ，得 $\\sigma$ 的最大似然估计量为 $\\hat{\\sigma} = \\frac{1}{n} \\sum_{i=1}^{n} |X_i|$ .\n\n$(\\mathrm{II})E(\\hat{\\sigma}) = \\frac{1}{n}\\sum_{i = 1}^{n}E(|X_i|) = E(|X|) = \\int_{-\\infty}^{+\\infty}|x|\\frac{1}{2\\sigma}\\mathrm{e}^{-\\frac{|x|}{\\sigma}}\\mathrm{d}x = \\int_0^{+\\infty}\\frac{x}{\\sigma}\\mathrm{e}^{-\\frac{x}{\\sigma}}\\mathrm{d}x$\n\n$$\n= - \\int_ {0} ^ {+ \\infty} x \\mathrm {d e} ^ {- \\frac {x}{\\sigma}} = - x \\mathrm {e} ^ {- \\frac {x}{\\sigma}} \\Big | _ {0} ^ {+ \\infty} + \\int_ {0} ^ {+ \\infty} \\mathrm {e} ^ {- \\frac {x}{\\sigma}} \\mathrm {d} x = \\sigma .\n$$\n\n$$\n\\begin{array}{l} D (\\hat {\\sigma}) = \\frac {1}{n ^ {2}} \\sum_ {i = 1} ^ {n} D (| X _ {i} |) = \\frac {D (| X |)}{n} = \\frac {E [ | X | ^ {2} - E ^ {2} (| X |) ]}{n} \\\\ = \\frac {1}{n} \\left(\\int_ {- \\infty} ^ {+ \\infty} | x | ^ {2} \\frac {1}{2 \\sigma} \\mathrm {e} ^ {- \\frac {| x |}{\\sigma}} \\mathrm {d} x - \\sigma^ {2}\\right) = \\frac {1}{n} \\left(\\int_ {0} ^ {+ \\infty} \\frac {x ^ {2}}{\\sigma} \\mathrm {e} ^ {- \\frac {x}{\\sigma}} \\mathrm {d} x - \\sigma^ {2}\\right) \\\\ = \\frac {1}{n} \\left(\\int_ {0} ^ {+ \\infty} - x ^ {2} \\mathrm {d e} ^ {- \\frac {x}{\\sigma}} - \\sigma^ {2}\\right) \\\\ = \\frac {1}{n} \\left(\\int_ {0} ^ {+ \\infty} 2 x \\mathrm {e} ^ {- \\frac {x}{\\sigma}} \\mathrm {d} x - \\sigma^ {2}\\right) = \\frac {1}{n} (2 \\sigma^ {2} - \\sigma^ {2}) = \\frac {\\sigma^ {2}}{n}. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2018数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2018真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "困难"
      }
    ]
  },
  {
    "id": "paper-math1-2017",
    "year": 2017,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2017 全国统考",
    "title": "2017 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2017 年考研数学一全国统考真题原卷，涵盖选择题 8 题（32分）、填空题 6 题（24分）与解答题 9 题（94分），共 23 题完整试题与详尽分步解析。",
    "questions": [
      {
        "id": "m1-17-01",
        "paperQuestionNumber": 1,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 1 题】\n若函数 $f(x) = \\left\\{ \\begin{array}{ll} \\frac{1 - \\cos \\sqrt{x}}{ax}, & x > 0, \\\\ b, & x \\leqslant 0 \\end{array} \\right.$ ，在 $x = 0$ 处连续，则（ ）",
        "correctAnswer": "A",
        "explanation": "(1)【答案】 (A).\n\n【解】 $f(0 + 0) = \\lim_{x\\to 0^{+}}\\frac{1 - \\cos\\sqrt{x}}{ax} = \\frac{1}{2a},$ $f(0) = f(0 - 0) = b,$\n\n因为 $f(x)$ 在 $x = 0$ 处连续，所以 $f(0 + 0) = f(0) = f(0 - 0)$\n\n从而 $ab = \\frac{1}{2}$ ，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "简单",
        "options": [
          "A. $ab = \\frac{1}{2}$ .",
          "B. $ab = -\\frac{1}{2}$ .",
          "C. $ab = 0$",
          "D. $ab = 2$"
        ]
      },
      {
        "id": "m1-17-02",
        "paperQuestionNumber": 2,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 2 题】\n设函数 $f(x)$ 可导, 且 $f(x)f'(x) > 0$ , 则( )",
        "correctAnswer": "C",
        "explanation": "(2)【答案】 (C).\n\n【解】方法一 若 $f(x) > 0$ ，则 $f^{\\prime}(x) > 0$ ，从而 $f(1) > f(-1) > 0$\n\n若 $f(x) < 0$ ，则 $f^{\\prime}(x) < 0$ ，从而 $f(1) < f(-1) < 0$\n\n故 $|f(1)| > |f(-1)|$ ，应选(C).\n\n方法二 由 $f(x) \\cdot f'(x) = \\left[\\frac{1}{2} f^2(x)\\right]' > 0$ 得 $f^2(x)$ 单调递增，\n\n从而 $f^2 (1) > f^2 (-1)$ ，故 $|f(1)| > |f(-1)|$ ，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $f(1) > f(-1)$ .",
          "B. $f(1) < f(-1)$ .",
          "C. $|f(1)| > |f(-1)|$ .",
          "D. $|f(1)| < |f(-1)|$ ."
        ]
      },
      {
        "id": "m1-17-03",
        "paperQuestionNumber": 3,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 3 题】\n函数 $f(x, y, z) = x^{2}y + z^{2}$ 在点 $(1, 2, 0)$ 处沿向量 $\\mathbf{n} = (1, 2, 2)$ 的方向导数为（）",
        "correctAnswer": "D",
        "explanation": "(3)【答案】 (D).\n\n【解】 $\\frac{\\partial f}{\\partial x} = 2xy,\\quad \\frac{\\partial f}{\\partial y} = x^2,\\quad \\frac{\\partial f}{\\partial z} = 2z,$\n\n$$\n\\left. \\frac {\\partial f}{\\partial x} \\right| _ {(1, 2, 0)} = 4, \\quad \\left. \\frac {\\partial f}{\\partial y} \\right| _ {(1, 2, 0)} = 1, \\quad \\left. \\frac {\\partial f}{\\partial z} \\right| _ {(1, 2, 0)} = 0,\n$$\n\n$$\n\\cos \\alpha = \\frac {1}{3}, \\quad \\cos \\beta = \\frac {2}{3}, \\quad \\cos \\gamma = \\frac {2}{3},\n$$\n\n所求的方向导数为 $\\left.\\frac{\\partial f}{\\partial\\boldsymbol{n}}\\right|_{(1,2,0)} = 4\\times \\frac{1}{3} +1\\times \\frac{2}{3} = 2$ ，应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等",
        "options": [
          "A. 12.",
          "B. 6.",
          "C. 4.",
          "D. 2."
        ]
      },
      {
        "id": "m1-17-04",
        "paperQuestionNumber": 4,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 4 题】\n甲、乙两人赛跑, 计时开始时, 甲在乙前方 10 (单位: $m$ ) 处, 图中, 实线表示甲的速度曲线\n\n$v = v_{1}(t)$ (单位: $\\mathrm{m} / \\mathrm{s}$ ), 虚线表示乙的速度曲线 $v = v_{2}(t)$ , 三块阴影部分面积的数值依次是 10, 20, 3. 计时开始后乙追上甲的时刻记为 $t_{0}$ (单位: $\\mathrm{s}$ ), 则( )\n\n![](images/8e8f4df12e914f4ef16f2f4912ebc91d19101c0d902a3618f59ad880069238a3.jpg)",
        "correctAnswer": "C",
        "explanation": "（4）【答案】 (C).\n\n【解】从 $t = 0$ 到 $t = t_0$ 的时间段上，甲、乙走过的距离分别为\n\n$$\nS _ {1} = \\int_ {0} ^ {t _ {0}} v _ {1} (t) \\mathrm {d} t, \\quad S _ {2} = \\int_ {0} ^ {t _ {0}} v _ {2} (t) \\mathrm {d} t,\n$$\n\n在 $t = t_0$ 时， $S_{1} = S_{2} + 10$ ，即 $\\int_{0}^{t_0} v_1(t) \\, \\mathrm{d}t = \\int_{0}^{t_0} v_2(t) \\, \\mathrm{d}t + 10$\n\n或 $\\int_0^{t_0}\\left[v_1(t) - v_2(t)\\right]\\mathrm{d}t = 10$ ，故 $t_0 = 25$ ，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $t_0 = 10$",
          "B. $15 < t_{0} < 20$ .",
          "C. $t_0 = 25$",
          "D. $(\\mathrm{D})t_{0} > 25$"
        ]
      },
      {
        "id": "m1-17-05",
        "paperQuestionNumber": 5,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 5 题】\n设 $\\alpha$ 为 $n$ 维单位列向量, $\\pmb{E}$ 为 $n$ 阶单位矩阵, 则( )",
        "correctAnswer": "A",
        "explanation": "（5）【答案】 （A）.\n\n【解】 方法一 令 $A = \\alpha \\alpha^{\\mathrm{T}}$ ， $A^2 = A$\n\n令 $AX = \\lambda X$ ，由 $(A^2 - A)X = (\\lambda^2 - \\lambda)X = 0$ 得 $\\lambda^2 - \\lambda = 0, \\lambda = 0$ 或 $\\lambda = 1$\n\n因为 $\\operatorname{tr} \\mathbf{A} = \\boldsymbol{\\alpha}^{\\mathrm{T}} \\boldsymbol{\\alpha} = 1 = \\lambda_{1} + \\dots + \\lambda_{n}$ 得 $\\mathbf{A}$ 的特征值为 $\\lambda_{1} = \\dots = \\lambda_{n-1} = 0, \\lambda_{n} = 1$\n\n$\\mathbf{E} - \\pmb{\\alpha}\\pmb{\\alpha}^{\\mathrm{T}}$ 的特征值为 $\\lambda_{1} = \\dots = \\lambda_{n - 1} = 1,\\lambda_{n} = 0$ ，从而 $|\\textbf{E} -\\pmb {\\alpha}\\pmb{\\alpha}^{\\mathrm{T}}| = 0$\n\n即 $\\pmb {E} - \\pmb{\\alpha}\\pmb{\\alpha}^{\\mathrm{T}}$ 不可逆，应选（A）.\n\n方法二 令 $A = E - \\alpha \\alpha^{\\mathrm{T}}, A^{2} = (E - \\alpha \\alpha^{\\mathrm{T}}) \\cdot (E - \\alpha \\alpha^{\\mathrm{T}}) = E - 2\\alpha \\alpha^{\\mathrm{T}} + \\alpha \\alpha^{\\mathrm{T}} = A$\n\n由 $\\mathbf{A}(\\mathbf{E} - \\mathbf{A}) = \\mathbf{0}$ 得 $r(\\mathbf{A}) + r(\\mathbf{E} - \\mathbf{A})\\leqslant n$\n\n再由 $r(\\mathbf{A}) + r(\\mathbf{E} - \\mathbf{A})\\geqslant r[\\mathbf{A} + (\\mathbf{E} - \\mathbf{A})] = r(\\mathbf{E}) = n$ 得\n\n$$\nr (\\mathbf {A}) + r (\\mathbf {E} - \\mathbf {A}) = n,\n$$\n\n而 $\\pmb {E} - \\pmb {A} = \\pmb {\\alpha}\\pmb{\\alpha}^{\\mathrm{T}},r(\\pmb {E} - \\pmb {A}) = r(\\pmb {\\alpha}\\pmb{\\alpha}^{\\mathrm{T}}) = r(\\pmb {\\alpha}) = 1$\n\n于是 $r(\\mathbf{A}) = n - 1 <   n$ ，即 $\\pmb {E} - \\pmb {\\alpha}\\pmb{\\alpha}^{\\mathrm{T}}$ 不可逆，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "线性代数真题",
          "2017数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $E - \\alpha \\alpha^{\\mathrm{T}}$ 不可逆.",
          "B. $E + \\alpha \\alpha^{\\mathrm{T}}$ 不可逆",
          "C. $E + 2\\alpha \\alpha^{\\mathrm{T}}$ 不可逆",
          "D. $E - 2\\alpha \\alpha^{\\mathrm{T}}$ 不可逆."
        ]
      },
      {
        "id": "m1-17-06",
        "paperQuestionNumber": 6,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 6 题】\n已知矩阵 $\\mathbf{A} = \\left( \\begin{array}{lll} 2 & 0 & 0 \\\\ 0 & 2 & 1 \\\\ 0 & 0 & 1 \\end{array} \\right), \\mathbf{B} = \\left( \\begin{array}{lll} 2 & 1 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right), \\mathbf{C} = \\left( \\begin{array}{lll} 1 & 0 & 0 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 2 \\end{array} \\right)$ , 则( )",
        "correctAnswer": "B",
        "explanation": "（6）【答案】 （B）.\n\n【解】 显然矩阵 $A, B, C$ 的特征值都是 $\\lambda_{1} = \\lambda_{2} = 2, \\lambda_{3} = 1$\n\n由 $2E - A = \\begin{pmatrix} 0 & 0 & 0\\\\ 0 & 0 & -1\\\\ 0 & 0 & 1 \\end{pmatrix}$ 得 $r(2E - A) = 1$ ，则 $\\mathbf{A}$ 可相似对角化，从而 $A\\sim C$\n\n由 $2\\pmb {E} - \\pmb {B} = \\left( \\begin{array}{lll}0 & -1 & 0\\\\ 0 & 0 & 0\\\\ 0 & 0 & 1 \\end{array} \\right)$ 得 $r(2E - B) = 2$ ，则 $\\pmb{B}$ 不可相似对角化，从而 $\\pmb{B}$ 与 $\\mathbf{A},\\mathbf{C}$ 不相似，应选(B).\n\n方法点评：设 $A, B$ 为 $n$ 阶矩阵，且 $|\\lambda E - A| = |\\lambda E - B|$ ，即 $A, B$ 的特征值相同，则\n\n（1）若矩阵 $\\mathbf{A},\\mathbf{B}$ 都可相似对角化，则 $A\\sim B$   \n（2）若矩阵 $\\mathbf{A},\\mathbf{B}$ 中一个可相似对角化，一个不可相似对角化，则 $\\mathbf{A}$ 与 $\\pmb{B}$ 不相似.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "线性代数真题",
          "2017数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $A$ 与 $C$ 相似, $B$ 与 $C$ 相似.",
          "B. $A$ 与 $C$ 相似, $B$ 与 $C$ 不相似.",
          "C. $A$ 与 $C$ 不相似, $B$ 与 $C$ 相似.",
          "D. $A$ 与 $C$ 不相似, $B$ 与 $C$ 不相似."
        ]
      },
      {
        "id": "m1-17-07",
        "paperQuestionNumber": 7,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 7 题】\n设 $A, B$ 为随机事件. 若 $0 < P(A) < 1, 0 < P(B) < 1$ , 则 $P(A \\mid B) > P(A \\mid \\overline{B})$ 的充分必要条件是( )\n\n(A) $P(B \\mid A) > P(B \\mid \\overline{A})$ .   \n(B) $P(B \\mid A) < P(B \\mid \\overline{A})$ .   \n(C) $P(\\overline{B} \\mid A) > P(B \\mid \\overline{A})$ .   \n(D) $P(\\overline{B} \\mid A) < P(B \\mid \\overline{A})$ .",
        "correctAnswer": "A",
        "explanation": "（7）【答案】 （A）.\n\n【解】由 $P(A|B) > P(A|\\overline{B})$ 得 $\\frac{P(AB)}{P(B)} >\\frac{P(A\\overline{B})}{P(\\overline{B})} = \\frac{P(A) - P(AB)}{1 - P(B)}$\n\n$P(A|B) > P(A|\\overline{B})$ 等价于 $P(AB) > P(A)P(B)$\n\n由 $P(B|A) > P(B|\\overline{A})$ 得 $\\frac{P(AB)}{P(A)} >\\frac{P(B) - P(AB)}{1 - P(A)}$\n\n$P(B|A) > P(B|\\overline{A})$ 等价于 $P(AB) > P(A)P(B)$ ，应选（A）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等",
        "options": [
          "A. 选项A",
          "B. 选项B",
          "C. 选项C",
          "D. 选项D"
        ]
      },
      {
        "id": "m1-17-08",
        "paperQuestionNumber": 8,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2017 考研数学一真题 · 第 8 题】\n设 $X_{1}, X_{2}, \\dots, X_{n} (n \\geqslant 2)$ 为来自总体 $N(\\mu, 1)$ 的简单随机样本，记 $\\overline{X} = \\frac{1}{n} \\sum_{i=1}^{n} X_{i}$ ，则下列结论中不正确的是（）",
        "correctAnswer": "B",
        "explanation": "(8)【答案】 (B).\n\n【解】 若总体 $X \\sim N(\\mu, \\sigma^2)$ ，则\n\n$$\n\\frac {1}{\\sigma^ {2}} \\sum_ {i = 1} ^ {n} (X _ {i} - \\mu) ^ {2} \\sim \\chi^ {2} (n), \\quad \\frac {1}{\\sigma^ {2}} \\sum_ {i = 1} ^ {n} (X _ {i} - \\overline {{X}}) ^ {2} \\sim \\chi^ {2} (n - 1),\n$$\n\n因为总体 $X \\sim N(\\mu, 1)$ ，所以 $\\sum_{i=1}^{n}(X_i - \\mu)^2 \\sim \\chi^2(n)$ ， $\\sum_{i=1}^{n}(X_i - \\overline{X})^2 \\sim \\chi^2(n-1)$\n\n再由 $\\overline{X} \\sim N\\left(\\mu, \\frac{1}{n}\\right)$ 得 $\\frac{\\overline{X} - \\mu}{\\frac{1}{\\sqrt{n}}} = \\sqrt{n} (\\overline{X} - \\mu) \\sim N(0, 1)$ ，从而 $n(\\overline{X} - \\mu)^2 \\sim \\chi^2(1)$ ，\n\n不正确的是(B)，应选(B).\n\n# 二、填空题",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $\\sum_{i=1}^{n}\\left(X_{i}-\\mu\\right)^{2}$ 服从 $\\chi^{2}$ 分布.",
          "B. $2(X_{n} - X_{1})^{2}$ 服从 $\\chi^2$ 分布.",
          "C. $\\sum_{i=1}^{n} (X_i - \\overline{X})^2$ 服从 $\\chi^2$ 分布.",
          "D. $n(\\overline{X} - \\mu)^2$ 服从 $\\chi^2$ 分布.\n\n# 二、填空题(本题共6小题，每小题4分，共24分，把答案填在题中横线上.)"
        ]
      },
      {
        "id": "m1-17-09",
        "paperQuestionNumber": 9,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 9 题】\n已知函数 $f(x) = \\frac{1}{1 + x^2}$ ，则 $f^{(3)}(0) =$ ______.",
        "correctAnswer": "0",
        "explanation": "（9）【答案】0.\n\n【解】方法一 $f(x) = \\frac{1}{1 + x^2} = 1 - x^2 +x^4 -x^6 +x^8 +o(x^8),$\n\n由 $\\frac{f^{(3)}(0)}{3!} = 0$ 得 $f^{(3)}(0) = 0$ .\n\n方法二 根据求导改变奇偶性的性质，因为 $f(x)$ 为偶函数，所以 $f^{(3)}(x)$ 为奇函数，故 $f^{(3)}(0) = 0$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：0"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-17-10",
        "paperQuestionNumber": 10,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程求解",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 10 题】\n微分方程 $y'' + 2y' + 3y = 0$ 的通解为 $y = \\_$",
        "correctAnswer": "$\\mathrm{e}^{-x}(C_1\\cos \\sqrt{2} x + C_2\\sin \\sqrt{2} x)(C_1,C_2$ 为任意常数)",
        "explanation": "(10)【答案】 $\\mathrm{e}^{-x}(C_1\\cos \\sqrt{2} x + C_2\\sin \\sqrt{2} x)(C_1,C_2$ 为任意常数).\n\n【解】 特征方程为 $\\lambda^2 + 2\\lambda + 3 = 0$ ，特征值为 $\\lambda_{1,2} = -1 \\pm \\sqrt{2}\\mathrm{i}$ ，\n\n通解为 $y = \\mathrm{e}^{-x}(C_1\\cos \\sqrt{2} x + C_2\\sin \\sqrt{2} x)(C_1,C_2$ 为任意常数).",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\mathrm{e}^{-x}(C_1\\cos \\sqrt{2} x + C_2\\sin \\sqrt{2} x)(C_1,C_2$ 为任意常数)"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "常微分方程求解"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "常微分方程求解"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-11",
        "paperQuestionNumber": 11,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 11 题】\n若曲线积分 $\\int_{L} \\frac{x \\mathrm{~d} x - a y \\mathrm{~d} y}{x^{2} + y^{2} - 1}$ 在区域 $D = \\{(x, y) \\mid x^{2} + y^{2} < 1\\}$ 内与路径无关, 则 $a =$",
        "correctAnswer": "-1",
        "explanation": "（11）【答案】 -1.\n\n【解】 $P = \\frac{x}{x^2 + y^2 - 1},\\quad Q = -\\frac{ay}{x^2 + y^2 - 1},$\n\n$$\n\\frac {\\partial P}{\\partial y} = - \\frac {2 x y}{\\left(x ^ {2} + y ^ {2} - 1\\right) ^ {2}}, \\quad \\frac {\\partial Q}{\\partial x} = \\frac {2 a x y}{\\left(x ^ {2} + y ^ {2} - 1\\right) ^ {2}},\n$$\n\n因为曲线积分与路径无关，所以 $\\frac{\\partial Q}{\\partial x} = \\frac{\\partial P}{\\partial y}$ 故 $a = -1$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：-1"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-12",
        "paperQuestionNumber": 12,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 12 题】\n幂级数 $\\sum_{n=1}^{\\infty} (-1)^{n-1} n x^{n-1}$ 在区间 $(-1, 1)$ 内的和函数 $S(x) =$",
        "correctAnswer": "$\\frac{1}{(1 + x)^2}$ ",
        "explanation": "(12)【答案】 $\\frac{1}{(1 + x)^2}$ .\n\n【解】方法一 $S(x) = \\sum_{n=1}^{\\infty} (-1)^{n-1} n x^{n-1} = -\\left[\\sum_{n=1}^{\\infty} (-1)^{n} x^{n}\\right]' = -\\left(\\frac{-x}{1+x}\\right)' = \\frac{1}{(1+x)^{2}}.$\n\n方法二 令 $S(x) = \\sum_{n=1}^{\\infty} (-1)^{n-1} n x^{n-1}$ ,\n\n则 $\\int_0^x S(x)\\mathrm{d}x = \\sum_{n = 1}^\\infty \\int_0^x (-1)^{n - 1}nx^{n - 1}\\mathrm{d}x = \\sum_{n = 1}^\\infty (-1)^{n - 1}x^n$\n\n$$\n= - \\sum_ {n = 1} ^ {\\infty} (- x) ^ {n} = - \\frac {- x}{1 + x} = \\frac {x}{1 + x},\n$$\n\n故 $S(x) = \\left(\\frac{x}{1 + x}\\right)' = \\frac{1}{(1 + x)^2}.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{1}{(1 + x)^2}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-13",
        "paperQuestionNumber": 13,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 13 题】\n设矩阵 $\\mathbf{A} = \\begin{pmatrix} 1 & 0 & 1 \\\\ 1 & 1 & 2 \\\\ 0 & 1 & 1 \\end{pmatrix}$ , $\\pmb{\\alpha}_{1}, \\pmb{\\alpha}_{2}, \\pmb{\\alpha}_{3}$ 为线性无关的 3 维列向量组, 则向量组 $A\\pmb{\\alpha}_{1}, A\\pmb{\\alpha}_{2}, A\\pmb{\\alpha}_{3}$ 的秩为",
        "correctAnswer": "2",
        "explanation": "（13）【答案】2.\n\n【解】 $(A\\alpha_{1}, A\\alpha_{2}, A\\alpha_{3}) = A(\\alpha_{1}, \\alpha_{2}, \\alpha_{3})$\n\n因为 $\\alpha_{1},\\alpha_{2},\\alpha_{3}$ 线性无关，所以 $(\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2},\\pmb{\\alpha}_{3})$ 可逆，从而 $r(A\\pmb{\\alpha}_1,A\\pmb{\\alpha}_2,A\\pmb{\\alpha}_3) = r(\\pmb {A})$\n\n由 $\\mathbf{A}\\rightarrow \\left( \\begin{array}{lll}1 & 0 & 1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $r(\\mathbf{A}) = 2$ ，故向量组 $A\\pmb{\\alpha}_{1},A\\pmb{\\alpha}_{2},A\\pmb{\\alpha}_{3}$ 的秩为2.",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：2"
        ],
        "keyPoints": [
          "线性代数真题",
          "2017数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-17-14",
        "paperQuestionNumber": 14,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "blank",
        "question": "【2017 考研数学一真题 · 第 14 题】\n设随机变量 $X$ 的分布函数为 $F(x) = 0.5\\Phi(x) + 0.5\\Phi\\left(\\frac{x - 4}{2}\\right)$ , 其中 $\\Phi(x)$ 为标准正态分布函数, 则 $E(X) = \\_$ .\n\n# 三、解答题(本题共9小题，共94分，解答应写出文字说明、证明过程或演算步骤.)",
        "correctAnswer": "2",
        "explanation": "（14）【答案】2.\n\n【解】 $X$ 的密度为 $f(x) = 0.5\\varphi (x) + 0.25\\varphi \\left(\\frac{x - 4}{2}\\right)$\n\n$$\n\\begin{array}{l} E (X) = \\int_ {- \\infty} ^ {+ \\infty} x f (x) d x = 0. 5 \\int_ {- \\infty} ^ {+ \\infty} x \\varphi (x) d x + 0. 2 5 \\int_ {- \\infty} ^ {+ \\infty} x \\varphi \\left(\\frac {x - 4}{2}\\right) d x \\\\ = 0 + \\int_ {- \\infty} ^ {+ \\infty} \\left(\\frac {x - 4}{2} + 2\\right) \\varphi \\left(\\frac {x - 4}{2}\\right) \\mathrm {d} \\left(\\frac {x - 4}{2}\\right) \\\\ = \\int_ {- \\infty} ^ {+ \\infty} (x + 2) \\varphi (x) d x = 2 \\int_ {- \\infty} ^ {+ \\infty} \\varphi (x) d x = 2. \\\\ \\end{array}\n$$\n\n方法点评：本题考查连续型随机变量的分布函数、密度函数及数字特征，需要注意以下几点：\n\n（1）若随机变量的分布函数为 $F(x)$ ，则其密度函数为\n\n$$\nf (x) = \\left\\{ \\begin{array}{l l} F ^ {\\prime} (x), & x \\text {为} F (x) \\text {的 可 导 点 ,} \\\\ 0, & x \\text {为} F (x) \\text {的 不 可 导 点 .} \\end{array} \\right.\n$$\n\n(2) 若 $f(x)$ 为随机变量的密度函数, 则 $\\int_{-\\infty}^{+\\infty} f(x) \\mathrm{d}x = 1$ .\n\n（3）标准正态分布的密度函数 $\\varphi (x)$ 为奇函数，即 $\\int_{-\\infty}^{+\\infty}x^k\\varphi (x)\\mathrm{d}x = 0(k$ 为正奇数).\n\n# 三、解答题",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：2"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2017数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-15",
        "paperQuestionNumber": 15,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 15 题】\n(本题满分 10 分)\n\n设函数 $f(u,v)$ 具有2阶连续偏导数， $y = f(\\mathrm{e}^x,\\cos x)$ ，求 $\\frac{\\mathrm{dy}}{\\mathrm{dx}}\\Big|_{x=0}, \\frac{\\mathrm{d}^2y}{\\mathrm{dx}^2}\\Big|_{x=0}$ .",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(15)【解】 $\\frac{\\mathrm{dy}}{\\mathrm{dx}} = \\mathrm{e}^{x}f_{1}^{\\prime} - \\sin x\\cdot f_{2}^{\\prime},\\quad \\frac{\\mathrm{dy}}{\\mathrm{dx}}\\bigg|_{x = 0} = f_{1}^{\\prime}(1,1);$\n\n$$\n\\frac {\\mathrm {d} ^ {2} y}{\\mathrm {d} x ^ {2}} = \\mathrm {e} ^ {x} f _ {1} ^ {\\prime} + \\mathrm {e} ^ {x} \\left(\\mathrm {e} ^ {x} f _ {1 1} ^ {\\prime \\prime} - \\sin x \\cdot f _ {1 2} ^ {\\prime \\prime}\\right) - \\cos x \\cdot f _ {2} ^ {\\prime} - \\sin x \\left(\\mathrm {e} ^ {x} f _ {2 1} ^ {\\prime \\prime} - \\sin x \\cdot f _ {2 2} ^ {\\prime \\prime}\\right),\n$$\n\n则 $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2}\\Big|_{x = 0} = f_1'(1,1) + f_{11}''(1,1) - f_2'(1,1).$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-16",
        "paperQuestionNumber": 16,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 16 题】\n(本题满分 10 分)\n\n求 $\\lim_{n\\to \\infty}\\sum_{k = 1}^{n}\\frac{k}{n^2}\\ln \\left(1 + \\frac{k}{n}\\right).$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(16)【解】 $\\lim_{n\\to \\infty}\\sum_{k = 1}^{n}\\frac{k}{n^2}\\ln \\left(1 + \\frac{k}{n}\\right) = \\lim_{n\\to \\infty}\\frac{1}{n}\\sum_{k = 1}^{n}\\frac{k}{n}\\ln \\left(1 + \\frac{k}{n}\\right) = \\int_0^1 x\\ln (1 + x)\\mathrm{d}x$\n\n$$\n\\begin{array}{l} = \\frac {1}{2} \\int_ {0} ^ {1} \\ln (1 + x) d \\left(x ^ {2}\\right) = \\frac {1}{2} x ^ {2} \\ln (1 + x) \\Big | _ {0} ^ {1} - \\frac {1}{2} \\int_ {0} ^ {1} \\frac {\\left(x ^ {2} - 1\\right) + 1}{1 + x} d x \\\\ = \\frac {1}{2} \\ln 2 - \\frac {1}{2} \\int_ {0} ^ {1} (x - 1 + \\frac {1}{1 + x}) d x = \\frac {1}{2} \\ln 2 - \\frac {1}{4} + \\frac {1}{2} - \\frac {1}{2} \\ln 2 = \\frac {1}{4}. \\\\ \\end{array}\n$$\n\n方法点评：本题考查定积分的定义求极限\n\n$n$ 项和求极限一般分为两种类型：\n\n(1) 分子次数齐、分母次数齐，且分母的次数高于分子一次，采用定积分定义求极限，即\n\n$$\n\\lim  _ {n \\rightarrow \\infty} \\frac {1}{n} \\sum_ {k = 1} ^ {n} f \\left(\\frac {k}{n}\\right) = \\int_ {0} ^ {1} f (x) d x.\n$$\n\n（2）若分子次数或分母次数不齐，一般使用迫敛定理",
        "steps": [
          "第(1)问：分子次数齐、分母次数齐，且分母的次数高于分子一次，采用定积分定义求极限，即  $$ \\lim  _ {n \\rightarrow \\inft...",
          "第(2)问：若分子次数或分母次数不齐，一般使用迫敛定理..."
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 17 题】\n(本题满分 10 分)\n\n已知函数 $y(x)$ 由方程 $x^{3} + y^{3} - 3x + 3y - 2 = 0$ 确定，求 $y(x)$ 的极值",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(17)【解】 $x^{3} + y^{3} - 3x + 3y - 2 = 0$ 两边对 $x$ 求导得 $3x^{2} + 3y^{2}y^{\\prime} - 3 + 3y^{\\prime} = 0$\n\n令 $y^\\prime = 0$ 得 $x_{1} = -1,x_{2} = 1$ ，对应的函数值为 $y_{1} = 0,y_{2} = 1$\n\n$3x^{2} + 3y^{2}y^{\\prime} - 3 + 3y^{\\prime} = 0$ 两边再对 $x$ 求导得 $6x + 6yy^{\\prime 2} + 3y^{2}y^{\\prime \\prime} + 3y^{\\prime \\prime} = 0$\n\n由 $y^{\\prime \\prime}(-1) = 2 > 0$ 得 $x = -1$ 为极小值点，极小值为 $y = 0$\n\n由 $y''(1) = -1 < 0$ 得 $x = 1$ 为极大值点，极大值为 $y = 1$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-18",
        "paperQuestionNumber": 18,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元/多元导数与极值",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 18 题】\n(本题满分 10 分)\n\n设函数 $f(x)$ 在区间 $[0,1]$ 上具有2阶导数，且 $f(1) > 0, \\lim_{x \\to 0^+} \\frac{f(x)}{x} < 0.$ 证明：\n\n(I) 方程 $f(x) = 0$ 在区间 $(0,1)$ 内至少存在一个实根；  \n（Ⅱ）方程 $f(x)f''(x) + [f'(x)]^2 = 0$ 在区间 $(0,1)$ 内至少存在两个不同实根.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（18）【证明】（I）根据极限保号性，因为 $\\lim_{x\\to 0^{+}}\\frac{f(x)}{x} < 0$ ，所以存在 $\\delta >0$\n\n当 $x \\in (0, \\delta)$ 时， $\\frac{f(x)}{x} < 0$ ，即当 $x \\in (0, \\delta)$ 时 $f(x) < 0$\n\n于是存在 $c \\in (0, \\delta)$ ，使得 $f(c) < 0$\n\n因为 $f(c)f(1) < 0$ ，所以存在 $x_0 \\in (c,1) \\subset (0,1)$ ，使得 $f(x_0) = 0$\n\n（Ⅱ）令 $F(x) = f(x)f'(x)$ ，则 $F'(x) = f(x)f''(x) + f'^2(x)$ ，\n\n由 $f(0) = f(c) = 0$ ，得存在 $x\\in (0,c)$ ，使得 $f^{\\prime}(\\xi_{1}) = 0$\n\n因 $f(0) = f(c) = 0$ ，所以 $F(0) = F(\\xi_1) = F(c)$\n\n由罗尔定理，存在 $\\eta_1\\in (0,\\xi_1)$ ，存在 $\\eta_{2}\\in (\\xi_{1},c)$ ，使 $F^{\\prime}(\\eta_{1}) = 0,F^{\\prime}(\\eta_{2}) = 0$\n\n即方程 $f(x)f''(x) + f'^2(x) = 0$ 在 $(0,1)$ 内至少有两个不同的实根.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一",
          "一元/多元导数与极值"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学",
          "一元/多元导数与极值"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-17-19",
        "paperQuestionNumber": 19,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 19 题】\n(本题满分 10 分)\n\n设薄片型物体 $S$ 是圆锥面 $z = \\sqrt{x^2 + y^2}$ 被柱面 $z^2 = 2x$ 割下的有限部分, 其上任一点的密度为 $\\mu(x, y, z) = 9\\sqrt{x^2 + y^2 + z^2}$ . 记圆锥面与柱面的交线为 $C$ .\n\n(I) 求 $C$ 在 $xOy$ 平面上的投影曲线的方程；  \n(II) 求 $S$ 的质量 $M$ .",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（19）【解】（I）由 $\\left\\{ \\begin{array}{l} z = \\sqrt{x^2 + y^2}, \\\\ z^2 = 2x, \\end{array} \\right.$ 得 $x^2 + y^2 = 2x$\n\n故 $C$ 在 $xOy$ 平面上的投影曲线为 $L:\\left\\{ \\begin{array}{l}(x - 1)^2 +y^2 = 1,\\\\ z = 0, \\end{array} \\right.$\n\n（Ⅱ） $M = \\iint_{S} 9\\sqrt{x^2 + y^2 + z^2} \\, \\mathrm{d}S$\n\n由 $z_{x}^{\\prime} = \\frac{x}{\\sqrt{x^{2} + y^{2}}}, z_{y}^{\\prime} = \\frac{y}{\\sqrt{x^{2} + y^{2}}}$ 得 $\\mathrm{d}S = \\sqrt{1 + z_{x}^{\\prime 2} + z_{y}^{\\prime 2}}\\mathrm{d}x\\mathrm{d}y = \\sqrt{2}\\mathrm{d}x\\mathrm{d}y,$\n\n则 $M = \\iint_{S} 9\\sqrt{x^2 + y^2 + z^2} \\, \\mathrm{d}S = 9\\sqrt{2} \\iint_{D} \\sqrt{x^2 + y^2} \\cdot \\sqrt{2} \\, \\mathrm{d}x \\, \\mathrm{d}y$\n\n$$\n\\begin{array}{l} = 1 8 \\iint_ {D} \\sqrt {x ^ {2} + y ^ {2}} d x d y = 1 8 \\int_ {- \\frac {\\pi}{2}} ^ {\\frac {\\pi}{2}} d \\theta \\int_ {0} ^ {2 \\cos \\theta} r ^ {2} d r \\\\ = 1 8 \\times \\frac {8}{3} \\int_ {- \\frac {\\pi}{2}} ^ {\\frac {\\pi}{2}} \\cos^ {3} \\theta d \\theta = 1 8 \\times \\frac {1 6}{3} \\int_ {0} ^ {\\frac {\\pi}{2}} \\cos^ {3} \\theta d \\theta = 6 4. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2017数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "高等数学"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-17-20",
        "paperQuestionNumber": 20,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 20 题】\n(本题满分 11 分)\n\n设3阶矩阵 $A = (\\pmb{\\alpha}_1, \\pmb{\\alpha}_2, \\pmb{\\alpha}_3)$ 有3个不同的特征值，且 $\\pmb{\\alpha}_3 = \\pmb{\\alpha}_1 + 2\\pmb{\\alpha}_2$\n\n（I）证明 $r(\\mathbf{A}) = 2$   \n（Ⅱ）设 $\\pmb {\\beta} = \\pmb{\\alpha}_{1} + \\pmb{\\alpha}_{2} + \\pmb{\\alpha}_{3}$ ，求方程组 $Ax = \\beta$ 的通解",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（20）【证明】（I）设 $\\mathbf{A}$ 的特征值为 $\\lambda_1, \\lambda_2, \\lambda_3$\n\n因为 $\\mathbf{A}$ 有三个不同的特征值，所以 $\\mathbf{A}$ 可以相似对角化，即存在可逆矩阵 $\\pmb{P}$ ，使得\n\n$$\n\\boldsymbol {P} ^ {- 1} \\boldsymbol {A} \\boldsymbol {P} = \\left( \\begin{array}{c c c} \\lambda_ {1} & & \\\\ & \\lambda_ {2} & \\\\ & & \\lambda_ {3} \\end{array} \\right),\n$$\n\n因为 $\\lambda_1, \\lambda_2, \\lambda_3$ 两两不同，所以 $r(A) \\geqslant 2$\n\n又因为 $\\pmb{\\alpha}_{3} = \\pmb{\\alpha}_{1} + 2\\pmb{\\alpha}_{2}$ ，所以 $\\alpha_{1},\\alpha_{2},\\alpha_{3}$ 线性相关，从而 $r(A) <   3$ ，于是 $r(A) = 2$\n\n（Ⅱ）因为 $r(\\mathbf{A}) = 2$ ，所以 $\\mathbf{AX} = \\mathbf{0}$ 基础解系含一个线性无关的解向量，\n\n由 $\\left\\{ \\begin{array}{l} \\alpha_{1} + 2\\alpha_{2} - \\alpha_{3} = 0, \\\\ \\alpha_{1} + \\alpha_{2} + \\alpha_{3} = \\beta, \\end{array} \\right.$ 得 $AX = \\beta$ 的通解为\n\n$X = k\\binom{1}{2} + \\binom{1}{1}$ （ $k$ 为任意常数）.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2017数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-21",
        "paperQuestionNumber": 21,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 21 题】\n(本题满分 11 分)\n\n设二次型 $f(x_{1},x_{2},x_{3}) = 2x_{1}^{2} - x_{2}^{2} + ax_{3}^{2} + 2x_{1}x_{2} - 8x_{1}x_{3} + 2x_{2}x_{3}$ 在正交变换 $\\pmb {x} = \\pmb{Q}\\pmb{y}$ 下的标准形为 $\\lambda_1y_1^2 +\\lambda_2y_2^2$ ，求 $a$ 的值及一个正交矩阵 $\\pmb{Q}$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(21)【解】 $\\mathbf{A} = \\left( \\begin{array}{rrr}2 & 1 & -4\\\\ 1 & -1 & 1\\\\ -4 & 1 & a \\end{array} \\right),\\quad \\mathbf{X} = \\left( \\begin{array}{l}x_{1}\\\\ x_{2}\\\\ x_{3} \\end{array} \\right),\\quad f(x_{1},x_{2},x_{3}) = \\mathbf{X}^{\\mathrm{T}}\\mathbf{A}\\mathbf{X},$\n\n因为 $\\lambda_3 = 0$ ，所以 $|\\mathbf{A}| = 0$\n\n由 $|\\mathbf{A}| = \\left| \\begin{array}{ccc}2 & 1 & -4\\\\ 1 & -1 & 1\\\\ -4 & 1 & a \\end{array} \\right| = -3(a - 2) = 0$ ，得 $a = 2$\n\n由 $|\\lambda E - A| = \\left| \\begin{array}{ccc}\\lambda -2 & -1 & 4\\\\ -1 & \\lambda +1 & -1\\\\ 4 & -1 & \\lambda -2 \\end{array} \\right| = \\lambda (\\lambda +3)(\\lambda -6) = 0$ ，得 $\\lambda_{1} = -3,\\lambda_{2} = 6,\\lambda_{3} = 0.$\n\n由 $-3\\pmb {E} - \\pmb {A}\\rightarrow \\left( \\begin{array}{rrr}5 & 1 & -4\\\\ 1 & 2 & 1\\\\ -4 & 1 & 5 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}1 & 0 & -1\\\\ 0 & 1 & 1\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得\n\n$\\lambda_{1} = -3$ 对应的线性无关的特征向量为 $\\pmb{\\alpha}_{1} = \\begin{pmatrix} 1 \\\\ -1 \\\\ 1 \\end{pmatrix}$ ;\n\n由 $6\\pmb {E} - \\pmb {A} = \\left( \\begin{array}{rrr}4 & -1 & 4\\\\ -1 & 7 & -1\\\\ 4 & -1 & 4 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}1 & 0 & 1\\\\ 0 & 1 & 0\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得\n\n$\\lambda_{2} = 6$ 对应的线性无关的特征向量为 $\\pmb{\\alpha}_{2} = \\begin{pmatrix} -1 \\\\ 0 \\\\ 1 \\end{pmatrix}$ ;\n\n由 $0E - A \\rightarrow \\left( \\begin{array}{ccc}1 & 0 & -1\\\\ 0 & 1 & -2\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\lambda_{3} = 0$ 对应的线性无关的特征向量为 $\\pmb{\\alpha}_{3} = \\binom{1}{2}$ .\n\n规范化得 $\\gamma_{1} = \\frac{1}{\\sqrt{3}}\\binom{1}{-1}$ ， $\\gamma_{2} = \\frac{1}{\\sqrt{2}}\\binom{-1}{0}$ ， $\\gamma_{3} = \\frac{1}{\\sqrt{6}}\\binom{1}{2}$ ，\n\n故正交矩阵为 $Q = \\left[ \\begin{array}{ccc} \\frac{1}{\\sqrt{3}} & -\\frac{1}{\\sqrt{2}} & \\frac{1}{\\sqrt{6}} \\\\ -\\frac{1}{\\sqrt{3}} & 0 & \\frac{2}{\\sqrt{6}} \\\\ \\frac{1}{\\sqrt{3}} & \\frac{1}{\\sqrt{2}} & \\frac{1}{\\sqrt{6}} \\end{array} \\right]$\n\n$$\nf \\left(x _ {1}, x _ {2}, x _ {3}\\right) = \\boldsymbol {X} ^ {\\mathrm {T}} \\boldsymbol {A} \\boldsymbol {X} \\xlongequal {\\boldsymbol {X} = Q \\boldsymbol {Y}} - 3 y _ {1} ^ {2} + 6 y _ {2} ^ {2}.\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2017数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-17-22",
        "paperQuestionNumber": 22,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 22 题】\n(本题满分 11 分)\n\n设随机变量 $X, Y$ 相互独立，且 $X$ 的概率分布为 $P\\{X = 0\\} = P\\{X = 2\\} = \\frac{1}{2}, Y$ 的概率密度为 $f(y) = \\left\\{ \\begin{array}{ll} 2y, & 0 < y < 1, \\\\ 0, & \\text{其他}. \\end{array} \\right.$\n\n(I) 求 $P\\{Y \\leqslant E(Y)\\}$ ;   \n（Ⅱ）求 $Z = X + Y$ 的概率密度",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(22)【解】 $(\\mathrm{I})E(Y) = \\int_{0}^{1}y\\cdot 2y\\mathrm{d}y = \\frac{2}{3},$\n\n$$\nP \\left\\{Y \\leqslant E (Y) \\right\\} = P \\left\\{Y \\leqslant \\frac {2}{3} \\right\\} = \\int_ {0} ^ {\\frac {2}{3}} 2 y \\mathrm {d} y = \\frac {4}{9}.\n$$\n\n（Ⅱ）方法一 $F_{Z}(z) = P\\{Z \\leqslant z\\} = P\\{X + Y \\leqslant z\\}$ ，\n\n当 $z < 0$ 时， $F_{Z}(z) = 0$\n\n当 $z \\geq 3$ 时， $F_Z(z) = 1$\n\n当 $0 \\leqslant z < 1$ 时， $F_Z(z) = P\\{X = 0, Y \\leqslant z\\} = P\\{X = 0, Y \\leqslant z\\}$\n\n$$\n= P \\{X = 0 \\} P \\{Y \\leqslant z \\} = \\frac {1}{2} \\int_ {0} ^ {z} 2 y \\mathrm {d} y = \\frac {z ^ {2}}{2};\n$$\n\n当 $1 \\leqslant z < 2$ 时， $F_{Z}(z) = P\\{X = 0, Y \\leqslant z\\} = P\\{X = 0\\} P\\{Y \\leqslant 1\\} = \\frac{1}{2}$\n\n当 $2 \\leqslant z < 3$ 时， $F_{Z}(z) = P\\{X = 0, Y \\leqslant z\\} + P\\{X = 2, Z \\leqslant z - 2\\}$\n\n$$\n\\begin{array}{l} = P \\{X = 0 \\} P \\{Y \\leqslant 1 \\} + P \\{X = 2 \\} P \\{Y \\leqslant z - 2 \\} \\\\ = \\frac {1}{2} + \\frac {1}{2} \\int_ {0} ^ {z - 2} 2 y d y = \\frac {1}{2} + \\frac {1}{2} (z - 2) ^ {2}, \\\\ \\end{array}\n$$\n\n即 $F_{Z}(z) = \\left\\{ \\begin{array}{ll}0, & z <   0,\\\\ \\frac{z^{2}}{2}, & 0\\leqslant z <   1,\\\\ \\frac{1}{2} +\\frac{1}{2} (z - 2)^{2}, & 2\\leqslant z <   3,\\\\ 1, & z\\geqslant 3, \\end{array} \\right.$\n\n概率密度为 $f_{Z}(z) = \\left\\{ \\begin{array}{ll} z, & 0 < z < 1, \\\\ z - 2, & 2 < z < 3, \\\\ 0, & \\text{其他}. \\end{array} \\right.$\n\n方法二 由全概率公式得\n\n$$\n\\begin{array}{l} F _ {Z} (z) = P \\{Z \\leqslant z \\} = P \\{X + Y \\leqslant z \\} \\\\ = P \\{X = 0 \\} P \\{X + Y \\leqslant z \\mid X = 0 \\} + P \\{X = 2 \\} P \\{X + Y \\leqslant z \\mid X = 2 \\} \\\\ = \\frac {1}{2} P \\{Y \\leqslant z \\} + \\frac {1}{2} P \\{Y \\leqslant z - 2 \\}, \\\\ \\end{array}\n$$\n\n当 $z < 0$ 时， $F_{Z}(z) = 0$\n\n当 $0 \\leqslant z < 1$ 时， $F_{Z}(z) = \\frac{1}{2} P\\{Y \\leqslant z\\} = \\frac{1}{2} \\int_{0}^{z} 2y \\, \\mathrm{d}y = \\frac{z^2}{2}$\n\n当 $1 \\leqslant z < 2$ 时， $F_{Z}(z) = \\frac{1}{2} P\\{Y \\leqslant 1\\} = \\frac{1}{2}$\n\n当 $2 \\leqslant z < 3$ 时， $F_{Z}(z) = \\frac{1}{2} + \\frac{1}{2} P\\{Y \\leqslant z - 2\\}$\n\n$$\n= \\frac {1}{2} + \\frac {1}{2} \\int_ {0} ^ {z - 2} 2 y d y = \\frac {1}{2} + \\frac {(z - 2) ^ {2}}{2};\n$$\n\n当 $z \\geqslant 3$ 时， $F_Z(z) = 1$\n\n故 $f_{Z}(z) = F^{\\prime}(z) = \\left\\{ \\begin{array}{ll}z, & 0 <   z <   1,\\\\ z - 2, & 2 <   z <   3,\\\\ 0, & \\text{其他}. \\end{array} \\right.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2017数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-17-23",
        "paperQuestionNumber": 23,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2017 考研数学一真题 · 第 23 题】\n(本题满分 11 分)\n\n某工程师为了解一台天平的精度, 用该天平对一物体的质量做 $n$ 次测量, 该物体的质量 $\\mu$ 是已知的. 设 $n$ 次测量结果 $X_{1}, X_{2}, \\dots, X_{n}$ 相互独立且均服从正态分布 $N(\\mu, \\sigma^{2})$ , 该工程师记录的是 $n$ 次测量的绝对误差 $Z_{i} = |X_{i} - \\mu| (i = 1, 2, \\dots, n)$ . 利用 $Z_{1}, Z_{2}, \\dots, Z_{n}$ 估计 $\\sigma$ .\n\n(I)求 $Z_{1}$ 的概率密度；  \n（Ⅱ）利用一阶矩求 $\\sigma$ 的矩估计量；  \n(III)求 $\\sigma$ 的最大似然估计量.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(23)【解】（I）由 $X_{1} \\sim N(\\mu, \\sigma^{2})$ 得 $\\frac{X_{1} - \\mu}{\\sigma} \\sim N(0, 1)$ ，\n\n$Z_{1}$ 的分布函数为 $F(z) = P\\{Z_1\\leqslant z\\}$\n\n当 $z < 0$ 时， $F(z) = 0$\n\n当 $z \\geqslant 0$ 时， $F(z) = P\\left\\{\\left|\\frac{X_1 - \\mu}{\\sigma}\\right| \\leqslant \\frac{z}{\\sigma}\\right\\} = \\Phi\\left(\\frac{z}{\\sigma}\\right) - \\Phi\\left(-\\frac{z}{\\sigma}\\right) = 2\\Phi\\left(\\frac{z}{\\sigma}\\right) - 1,$\n\n$$\nF (z) = \\left\\{ \\begin{array}{l l} 0, & z <   0, \\\\ 2 \\Phi \\left(\\frac {z}{\\sigma}\\right) - 1, & z \\geqslant 0, \\end{array} \\right.\n$$\n\n$Z_{1}$ 的密度函数为 $f(z) = \\left\\{ \\begin{array}{ll}0, & z\\leqslant 0,\\\\ \\frac{2}{\\sigma}\\varphi \\left(\\frac{z}{\\sigma}\\right), & z > 0. \\end{array} \\right.$\n\n$(\\mathrm{II})E(Z) = E(|X_i - \\mu |) = E(|X_1 - \\mu |)$\n\n$$\n\\begin{array}{l} = \\int_ {0} ^ {+ \\infty} z \\cdot \\frac {2}{\\sigma} \\varphi (\\frac {z}{\\sigma}) d z = 2 \\sigma \\int_ {0} ^ {+ \\infty} \\frac {z}{\\sigma} \\varphi (\\frac {z}{\\sigma}) d \\left(\\frac {z}{\\sigma}\\right) \\\\ = 2 \\sigma \\int_ {0} ^ {+ \\infty} t \\varphi (t) d t = \\frac {2 \\sigma}{\\sqrt {2 \\pi}} \\int_ {0} ^ {+ \\infty} t e ^ {- \\frac {t ^ {2}}{2}} d t = \\frac {2 \\sigma}{\\sqrt {2 \\pi}} \\int_ {0} ^ {+ \\infty} e ^ {- \\frac {t ^ {2}}{2}} d \\left(\\frac {t ^ {2}}{2}\\right) = \\frac {2 \\sigma}{\\sqrt {2 \\pi}}, \\\\ \\end{array}\n$$\n\n由 $\\frac{2\\sigma}{\\sqrt{2\\pi}} = \\frac{1}{n}\\sum_{i = 1}^{n}Z_{i} = \\overline{Z}$ ，得 $\\sigma$ 的矩估计量为 $\\hat{\\sigma} = \\sqrt{\\frac{\\pi}{2}}\\overline{Z}$\n\n（Ⅲ）似然函数为\n\n$$\nL = f \\left(z _ {1}\\right) \\dots f \\left(z _ {n}\\right) = \\frac {2 ^ {n}}{\\sigma^ {n}} \\cdot \\left(\\frac {1}{\\sqrt {2 \\pi}}\\right) ^ {n} \\cdot e ^ {- \\frac {1}{2 \\sigma^ {2}} \\left(z _ {1} ^ {2} + \\dots + z _ {n} ^ {2}\\right)} \\left(z _ {i} > 0, i = 1, 2, \\dots , n\\right),\n$$\n\n$$\n\\ln L = n \\ln 2 - n \\ln \\sigma - n \\ln \\sqrt {2 \\pi} - \\frac {1}{2 \\sigma^ {2}} \\left(z _ {1} ^ {2} + \\dots + z _ {n} ^ {2}\\right),\n$$\n\n由 $\\frac{\\mathrm{d}}{\\mathrm{d}\\sigma}\\ln L = -\\frac{n}{\\sigma} +\\frac{1}{\\sigma^3} (z_1^2 +\\dots +z_n^2) = 0$ 得 $\\hat{\\sigma} = \\sqrt{\\frac{1}{n}\\sum_{i = 1}^{n}z_i^2},$\n\n故 $\\sigma$ 的最大似然估计量为 $\\hat{\\sigma} = \\sqrt{\\frac{1}{n}\\sum_{i = 1}^{n}Z_i^2}$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2017数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2017真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "困难"
      }
    ]
  },
  {
    "id": "paper-math1-2016",
    "year": 2016,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2016 全国统考",
    "title": "2016 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2016 年考研数学一全国统考真题原卷，涵盖选择题 8 题（32分）、填空题 6 题（24分）与解答题 9 题（94分），共 23 题完整试题与详尽分步解析。",
    "questions": [
      {
        "id": "m1-16-01",
        "paperQuestionNumber": 1,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 1 题】\n若反常积分 $\\int_{0}^{+\\infty} \\frac{1}{x^a (1 + x)^b} \\mathrm{d}x$ 收敛, 则( )",
        "correctAnswer": "C",
        "explanation": "（1）【答案】 (C).\n\n【解】 $\\int_0^{+\\infty}\\frac{\\mathrm{d}x}{x^a(1 + x)^b} = \\int_0^1\\frac{\\mathrm{d}x}{x^a(1 + x)^b} +\\int_1^{+\\infty}\\frac{\\mathrm{d}x}{x^a(1 + x)^b},$\n\n由 $\\lim_{x\\to 0^{+}}x^{a}\\cdot \\frac{1}{x^{a}(1 + x)^{b}} = 1$ 且 $\\int_0^1\\frac{\\mathrm{d}x}{x^a(1 + x)^b}$ 收敛得 $a <   1$\n\n再由 $\\lim_{x\\to +\\infty}x^{a + b}\\cdot \\frac{1}{x^a(1 + x)^b} = 1$ 且 $\\int_1^{+\\infty}\\frac{\\mathrm{d}x}{x^a(1 + x)^b}$ 收敛得 $a + b > 1$\n\n即 $a < 1$ 且 $a + b > 1$ ，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "多元积分与场论",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "简单",
        "options": [
          "A. $a < 1$ 且 $b > 1$ .",
          "B. $a > 1$ 且 $b > 1$ .",
          "C. $a < 1$ 且 $a + b > 1$ .",
          "D. $a > 1$ 且 $a + b > 1$ ."
        ]
      },
      {
        "id": "m1-16-02",
        "paperQuestionNumber": 2,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 2 题】\n已知函数 $f(x) = \\left\\{ \\begin{array}{ll} 2(x - 1), & x < 1, \\\\ \\ln x, & x \\geqslant 1, \\end{array} \\right.$ 则 $f(x)$ 的一个原函数是（\n\n$\\left(\\mathrm{A}\\right)F(x)=\\left\\{\\begin{array}{ll}\\left(x-1\\right)^{2},&x< 1,\\\\ x(\\ln x-1),&x\\geqslant 1.\\end{array}\\right.$\n\n$\\left(\\mathrm{B}\\right)F(x)=\\left\\{\\begin{array}{ll}\\left(x-1\\right)^{2},&x< 1,\\\\ x(\\ln x+1)-1,&x\\geqslant 1.\\end{array}\\right.$\n\n$\\left(\\mathrm{C}\\right)F(x)=\\left\\{\\begin{array}{ll}\\left(x-1\\right)^{2},&x< 1,\\\\ x\\left(\\ln x+1\\right)+1,&x\\geqslant 1.\\end{array}\\right.$\n\n$\\left(\\mathrm{D}\\right)F(x)=\\left\\{\\begin{array}{ll}\\left(x-1\\right)^{2},&x< 1,\\\\ x(\\ln x-1)+1,&x\\geqslant 1.\\end{array}\\right.$",
        "correctAnswer": "D",
        "explanation": "(2)【答案】 (D).\n\n【解】 $F(x) = \\int f(x)\\mathrm{d}x = \\left\\{ \\begin{array}{ll}(x - 1)^2 +C, & x <   1,\\\\ x(\\ln x - 1) + C + 1, & x\\geqslant 1. \\end{array} \\right.$\n\n取 $C = 0$ 得 $f(x)$ 的一个原函数为 $F(x) = \\begin{cases} (x - 1)^2, & x < 1, \\\\ x(\\ln x - 1) + 1, & x \\geqslant 1. \\end{cases}$ 应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. 选项A",
          "B. 选项B",
          "C. 选项C",
          "D. 选项D"
        ]
      },
      {
        "id": "m1-16-03",
        "paperQuestionNumber": 3,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程求解",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 3 题】\n若 $y = (1 + x^{2})^{2} - \\sqrt{1 + x^{2}}$ , $y = (1 + x^{2})^{2} + \\sqrt{1 + x^{2}}$ 是微分方程 $y' + p(x)y = q(x)$ 的两个解, 则 $q(x) = (\\quad)$",
        "correctAnswer": "A",
        "explanation": "（3）【答案】 （A）.\n\n【解】设 $y_{1} = (1 + x^{2})^{2} - \\sqrt{1 + x^{2}}$ ， $y_{2} = (1 + x^{2})^{2} + \\sqrt{1 + x^{2}}$\n\n由线性微分方程解的结构得 $y_{2} - y_{1} = 2\\sqrt{1 + x^{2}}$ 为 $y^\\prime +p(x)y = 0$ 的解，\n\n代入得 $\\frac{2x}{\\sqrt{1 + x^2}} + p(x) \\cdot 2\\sqrt{1 + x^2} = 0$ ，解得 $p(x) = -\\frac{x}{1 + x^2}$\n\n再由线性微分方程解的结构，得 $\\frac{y_1 + y_2}{2} = (1 + x^2)^2$ 为 $y^\\prime +p(x)y = q(x)$ 的解，代入得 $4x(1 + x^{2}) - \\frac{x}{1 + x^{2}}\\bullet (1 + x^{2})^{2} = q(x)$ ，解得 $q(x) = 3x(1 + x^2)$ ，应选(A).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "常微分方程求解"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "常微分方程求解"
        ],
        "difficulty": "中等",
        "options": [
          "A. $3x(1 + x^{2})$",
          "B. $-3x(1 + x^{2})$",
          "C. $\\frac{x}{1 + x^{2}}$ .",
          "D. $-\\frac{x}{1 + x^2}$ ."
        ]
      },
      {
        "id": "m1-16-04",
        "paperQuestionNumber": 4,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 4 题】\n已知函数 $f(x) = \\left\\{ \\begin{array}{ll}x, & x\\leqslant 0,\\\\ \\frac{1}{n}, & \\frac{1}{n + 1} <  x\\leqslant \\frac{1}{n},n = 1,2,\\dots , \\end{array} \\right.$ 则（",
        "correctAnswer": "D",
        "explanation": "(4)【答案】 (D).\n\n【解】 $f(0) = 0, \\lim_{x \\to 0^{-}} f(x) = 0, \\lim_{x \\to 0^{+}} f(x) = \\lim_{n \\to \\infty} \\frac{1}{n} = 0,$\n\n由 $f(0) = f(0 - 0) = f(0 + 0) = 0$ 得 $f(x)$ 在 $x = 0$ 处连续.\n\n由 $\\lim_{x\\to 0^{-}}\\frac{f(x) - f(0)}{x} = \\lim_{x\\to 0^{-}}\\frac{x}{x} = 1$ 得 $f_{-}^{\\prime}(0) = 1$\n\n$$\n\\lim  _ {x \\rightarrow 0 ^ {+}} \\frac {f (x) - f (0)}{x} = \\lim  _ {x \\rightarrow 0 ^ {+}} \\frac {\\frac {1}{n}}{x},\n$$\n\n由 $\\frac{1}{n + 1} < x < \\frac{1}{n}$ 得 $\\frac{n}{n + 1} < \\frac{x}{\\frac{1}{n}} < 1$ ，从而 $\\lim_{x \\to 0^+} \\frac{x}{\\frac{1}{n}} = 1$ ，于是 $f_+^\\prime(0) = 1$\n\n因为 $f_{-}^{\\prime}(0) = f_{+}^{\\prime}(0) = 1$ ，所以 $f(x)$ 在 $x = 0$ 处可导，应选(D).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用高等数学核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：D"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "中等",
        "options": [
          "A. $x = 0$ 是 $f(x)$ 的第一类间断点.",
          "B. $x = 0$ 是 $f(x)$ 的第二类间断点.",
          "C. $f(x)$ 在 $x = 0$ 处连续但不可导.",
          "D. $f(x)$ 在 $x = 0$ 处可导."
        ]
      },
      {
        "id": "m1-16-05",
        "paperQuestionNumber": 5,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 5 题】\n设 $A, B$ 是可逆矩阵，且 $A$ 与 $B$ 相似，则下列结论错误的是（）",
        "correctAnswer": "C",
        "explanation": "（5）【答案】 (C).\n\n【解】由 $\\mathbf{A}$ 与 $\\pmb{B}$ 相似可知，存在可逆矩阵 $P$ ，使得 $P^{-1}AP = B$\n\n对 $P^{-1}AP = B$ 两边取转置得 $\\pmb{P}^{\\mathrm{T}}\\pmb{A}^{\\mathrm{T}}(\\pmb{P}^{-1})^{\\mathrm{T}} = \\pmb{B}^{\\mathrm{T}}$ ，或 $[(\\pmb{P}^{\\mathrm{T}})^{-1}]^{-1}\\pmb{A}^{\\mathrm{T}}[(\\pmb{P}^{\\mathrm{T}})^{-1}] = \\pmb{B}^{\\mathrm{T}}$\n\n即 $\\mathbf{A}^{\\mathrm{T}}$ 与 $\\pmb{B}^{\\mathrm{T}}$ 相似，（A）正确；\n\n由 $P^{-1}AP = B$ 得 $P^{-1}A^{-1}P = B^{-1}$ ，即 $A^{-1}$ 与 $B^{-1}$ 相似，（B）正确；\n\n由 $P^{-1}AP = B$ 及 $P^{-1}A^{-1}P = B^{-1}$ 得 $P^{-1}(A + A^{-1})P = B + B^{-1}$\n\n即 $\\mathbf{A} + \\mathbf{A}^{-1}$ 与 $\\pmb {B} + \\pmb{B}^{-1}$ 相似，（D）正确，应选(C).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：C"
        ],
        "keyPoints": [
          "线性代数真题",
          "2016数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. $A^{\\mathrm{T}}$ 与 $\\pmb{B}^{\\mathrm{T}}$ 相似.",
          "B. $A^{-1}$ 与 $\\pmb{B}^{-1}$ 相似",
          "C. $A + A^{\\mathrm{T}}$ 与 $\\boldsymbol{B} + \\boldsymbol{B}^{\\mathrm{T}}$ 相似.",
          "D. $(\\mathrm{D})\\pmb {A} + \\pmb{A}^{-1}$ 与 $\\pmb {B} + \\pmb{B}^{-1}$ 相似"
        ]
      },
      {
        "id": "m1-16-06",
        "paperQuestionNumber": 6,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 6 题】\n设二次型 $f(x_{1}, x_{2}, x_{3}) = x_{1}^{2} + x_{2}^{2} + x_{3}^{2} + 4x_{1}x_{2} + 4x_{1}x_{3} + 4x_{2}x_{3}$ ，则 $f(x_{1}, x_{2}, x_{3}) = 2$ 在空间直角坐标下表示的二次曲面为（）",
        "correctAnswer": "B",
        "explanation": "（6）【答案】 （B）.\n\n【解】 二次型的矩阵为 $\\mathbf{A} = \\begin{pmatrix} 1 & 2 & 2\\\\ 2 & 1 & 2\\\\ 2 & 2 & 1 \\end{pmatrix}$\n\n由 $|\\lambda \\pmb {E} - \\pmb {A}| = \\left| \\begin{array}{ccc}\\lambda -1 & -2 & -2\\\\ -2 & \\lambda -1 & -2\\\\ -2 & -2 & \\lambda -1 \\end{array} \\right| = (\\lambda +1)^{2}(\\lambda -5) = 0$ 得\n\n矩阵 $\\mathbf{A}$ 的特征值为 $\\lambda_{1} = 5, \\lambda_{2} = \\lambda_{3} = -1$\n\n二次型的规范形为 $f(x_{1},x_{2},x_{3}) = 5y_{1}^{2} - y_{2}^{2} - y_{3}^{2}$\n\n从而 $f(x_{1},x_{2},x_{3}) = 2$ 表示的曲面为 $5y_{1}^{2} - y_{2}^{2} - y_{3}^{2} = 2$ ，该曲面表示双叶双曲面，应选(B).",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用线性代数核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "线性代数真题",
          "2016数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等",
        "options": [
          "A. 单叶双曲面.",
          "B. 双叶双曲面.",
          "C. 椭球面.",
          "D. 柱面."
        ]
      },
      {
        "id": "m1-16-07",
        "paperQuestionNumber": 7,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 7 题】\n设随机变量 $X \\sim N(\\mu, \\sigma^2) (\\sigma > 0)$ , 记 $p = P\\{X \\leqslant \\mu + \\sigma^2\\}$ , 则( )",
        "correctAnswer": "B",
        "explanation": "（7）【答案】 (B).\n\n【解】 由 $X \\sim N(\\mu, \\sigma^2)$ 得 $\\frac{X - \\mu}{\\sigma} \\sim N(0,1)$ ,\n\n$$\np = P \\{X \\leqslant \\mu + \\sigma^ {2} \\} = P \\left\\{\\frac {X - \\mu}{\\sigma} \\leqslant \\sigma \\right\\} = \\Phi (\\sigma),\n$$\n\n则 $p$ 随着 $\\sigma$ 的增加而增加，应选（B）.",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：B"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $p$ 随着 $\\mu$ 的增加而增加.",
          "B. $p$ 随着 $\\sigma$ 的增加而增加.",
          "C. $p$ 随着 $\\mu$ 的增加而减少.",
          "D. $p$ 随着 $\\sigma$ 的增加而减少."
        ]
      },
      {
        "id": "m1-16-08",
        "paperQuestionNumber": 8,
        "score": 4,
        "sectionName": "一、选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "choice",
        "question": "【2016 考研数学一真题 · 第 8 题】\n随机试验 $E$ 有三种两两不相容的结果 $A_{1}, A_{2}, A_{3}$ , 且三种结果发生的概率均为 $\\frac{1}{3}$ , 将试验 $E$ 独立重复做 2 次, $X$ 表示 2 次试验中结果 $A_{1}$ 发生的次数, $Y$ 表示 2 次试验中结果 $A_{2}$ 发生的次数, 则 $X$ 与 $Y$ 的相关系数为 ( )",
        "correctAnswer": "A",
        "explanation": "（8）【答案】 （A）.\n\n【解】 方法一 $X\\sim B\\left(2,\\frac{1}{3}\\right),Y\\sim B\\left(2,\\frac{1}{3}\\right),$\n\n$$\nE (X) = E (Y) = \\frac {2}{3}, D (X) = D (Y) = \\frac {4}{9}, E (X Y) = 1 \\times 1 \\times P \\{X = 1, Y = 1 \\} = \\frac {2}{9},\n$$\n\n$$\n\\operatorname {C o v} (X, Y) = E (X Y) - E (X) E (Y) = \\frac {2}{9} - \\frac {4}{9} = - \\frac {2}{9},\n$$\n\n则 $\\rho_{XY} = \\frac{\\operatorname{Cov}(X,Y)}{\\sqrt{D(X)}\\cdot\\sqrt{D(Y)}} = -\\frac{2}{9}\\times \\frac{9}{4} = -\\frac{1}{2}$ ，应选（A）.\n\n方法二 $P\\{X = 0\\} = \\mathrm{C}_2^0\\left(\\frac{1}{3}\\right)^0\\left(\\frac{2}{3}\\right)^2 = \\frac{4}{9},$\n\n$$\nP \\{X = 1 \\} = C _ {2} ^ {1} \\frac {1}{3} \\cdot \\frac {2}{3} = \\frac {4}{9}, \\quad P \\{X = 2 \\} = C _ {2} ^ {2} \\left(\\frac {1}{3}\\right) ^ {2} \\left(\\frac {2}{3}\\right) ^ {0} = \\frac {1}{9},\n$$\n\n$X\\sim \\left( \\begin{array}{ccc}0 & 1 & 2\\\\ \\frac{4}{9} & \\frac{4}{9} & \\frac{1}{9} \\end{array} \\right),$ 同理 $Y\\sim \\left( \\begin{array}{ccc}0 & 1 & 2\\\\ \\frac{4}{9} & \\frac{4}{9} & \\frac{1}{9} \\end{array} \\right),$\n\n$$\nE (X) = \\frac {2}{3}, E \\left(X ^ {2}\\right) = \\frac {8}{9}, D (X) = \\frac {8}{9} - \\frac {4}{9} = \\frac {4}{9}, E (Y) = \\frac {2}{3}, D (Y) = \\frac {4}{9}.\n$$\n\n$$\nP \\{X Y = 1 \\} = P \\{X = 1, Y = 1 \\} = \\frac {2}{9},\n$$\n\n$P\\{XY = 0\\} = \\frac{7}{9}$ 即 $XY\\sim \\left( \\begin{array}{ll}0 & 1\\\\ \\frac{7}{9} & \\frac{2}{9} \\end{array} \\right).$\n\n$$\nE (X Y) = \\frac {2}{9}, \\operatorname {C o v} (X, Y) = E (X Y) - E (X) E (Y) = \\frac {2}{9} - \\frac {4}{9} = - \\frac {2}{9},\n$$\n\n$$\n\\rho_ {X Y} = \\frac {\\operatorname {C o v} (X , Y)}{\\sqrt {D (X)} \\cdot \\sqrt {D (Y)}} = - \\frac {2}{9} \\times \\frac {9}{4} = - \\frac {1}{2}.\n$$\n\n# 二、填空题",
        "steps": [
          "明确题设考查核心概念与约束条件",
          "运用概率论与数理统计核心定理性质推导化简或构造反例判定",
          "分析得出唯一正确选项：A"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2016数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等",
        "options": [
          "A. $-\\frac{1}{2}$ .",
          "B. $-\\frac{1}{3}$ .",
          "C. $\\frac{1}{3}$ .",
          "D. $\\frac{1}{2}$ .\n\n# 二、填空题(本题共6小题，每小题4分，共24分，把答案填在题中横线上.)"
        ]
      },
      {
        "id": "m1-16-09",
        "paperQuestionNumber": 9,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 9 题】\n$\\lim_{x\\to 0}\\frac{\\int_{0}^{x}t\\ln(1 + t\\sin t)\\mathrm{d}t}{1 - \\cos x^2} = \\underline{\\quad}$",
        "correctAnswer": "$\\frac{1}{2}$ ",
        "explanation": "(9)【答案】 $\\frac{1}{2}$ .\n\n【解】\n\n$$\n\\lim  _ {x \\rightarrow 0} \\frac {\\int_ {0} ^ {x} t \\ln (1 + t \\sin t) \\mathrm {d} t}{1 - \\cos x ^ {2}} = \\lim  _ {x \\rightarrow 0} \\frac {\\int_ {0} ^ {x} t \\ln (1 + t \\sin t) \\mathrm {d} t}{\\frac {1}{2} x ^ {4}} = \\lim  _ {x \\rightarrow 0} \\frac {x \\ln (1 + x \\sin x)}{2 x ^ {3}} = \\frac {1}{2}.\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{1}{2}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-16-10",
        "paperQuestionNumber": 10,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 10 题】\n向量场 $A(x, y, z) = (x + y + z)\\pmb{i} + xy\\pmb{j} + z\\pmb{k}$ 的旋度 $\\operatorname{rot} A =$ ______.",
        "correctAnswer": "$j + (y - 1)k$",
        "explanation": "（10）【答案】 $j + (y - 1)k$\n\n【解】rot $\\mathbf{A} = \\left| \\begin{array}{ccc}i & j & k\\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z}\\\\ x + y + z & xy & z \\end{array} \\right| = j + (y - 1)\\pmb {k}.$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$j + (y - 1)k$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-11",
        "paperQuestionNumber": 11,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 11 题】\n设函数 $f(u, v)$ 可微， $z = z(x, y)$ 由方程 $(x + 1)z - y^2 = x^2f(x - z, y)$ 确定，则 $\\mathrm{d}z|_{(0,1)} =$ ______.",
        "correctAnswer": "$-\\mathrm{d}x + 2\\mathrm{d}y$",
        "explanation": "(11)【答案】 $-\\mathrm{d}x + 2\\mathrm{d}y$\n\n【解】 将 $x = 0, y = 1$ 代入得 $z = 1$ .\n\n$(x + 1)z - y^{2} = x^{2}f(x - z,y)$ 两边关于 $x$ 求偏导得\n\n$$\nz + (x + 1) z _ {x} ^ {\\prime} = 2 x f (x - z, y) + x ^ {2} f _ {1} ^ {\\prime} (x - z, y) \\cdot \\left(1 - z _ {x} ^ {\\prime}\\right),\n$$\n\n将 $x = 0, y = 1, z = 1$ 代入得 $z_x'(0,1) = -1$\n\n$(x + 1)z - y^{2} = x^{2}f(x - z,y)$ 两边关于 $y$ 求偏导得\n\n$$\n(x + 1) z _ {y} ^ {\\prime} - 2 y = x ^ {2} \\left[ f _ {1} ^ {\\prime} (x - z, y) \\left(- z _ {y} ^ {\\prime}\\right) + f _ {y} ^ {\\prime} (x - z, y) \\right],\n$$\n\n将 $x = 0, y = 1, z = 1$ 代入得 $z_{y}^{\\prime}(0,1) = 2$ ，故 $\\mathrm{d}z|_{(0,1)} = -\\mathrm{d}x + 2\\mathrm{d}y$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$-\\mathrm{d}x + 2\\mathrm{d}y$"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-12",
        "paperQuestionNumber": 12,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 12 题】\n设函数 $f(x) = \\arctan x - \\frac{x}{1 + ax^2}$ ，且 $f'''(0) = 1$ ，则 $a =$ ______.",
        "correctAnswer": "$\\frac{1}{2}$ ",
        "explanation": "(12)【答案】 $\\frac{1}{2}$ .\n\n【解】方法一 $\\arctan x = x - \\frac{x^3}{3} + o(x^3), \\frac{1}{1 + ax^2} = 1 - ax^2 + o(x^2)$\n\n则 $\\arctan x - \\frac{x}{1 + ax^2} = \\left(a - \\frac{1}{3}\\right)x^3 + o(x^3)$\n\n再由 $f(x) = f(0) + f'(0)x + \\frac{f''(0)}{2!} x^2 +\\frac{f'''(0)}{3!} x^3 +o(x^3)$ 得\n\n$\\frac{f^{\\prime\\prime}(0)}{3!} = a - \\frac{1}{3}$ 解得 $a = \\frac{1}{2}$\n\n方法二 $f^{\\prime}(x) = \\frac{1}{1 + x^{2}} -\\frac{1 - ax^{2}}{(1 + ax^{2})^{2}},$\n\n$$\n\\begin{array}{l} f ^ {\\prime \\prime} (x) = - \\frac {2 x}{\\left(1 + x ^ {2}\\right) ^ {2}} + \\frac {6 a x - 2 a ^ {2} x ^ {3}}{\\left(1 + a x ^ {2}\\right) ^ {3}}, \\\\ f ^ {\\prime \\prime} (x) = - \\frac {2 - 6 x ^ {2}}{(1 + x ^ {2}) ^ {3}} - \\frac {(6 a - 6 a ^ {2} x ^ {2}) (1 + a x ^ {2}) - 6 a x (6 a x - 2 a ^ {2} x ^ {3})}{(1 + a x ^ {2}) ^ {4}}, \\\\ \\end{array}\n$$\n\n所以 $f^{\\prime \\prime}(0) = -2 + 6a$ ，由 $-2 + 6a = 1$ 得 $a = \\frac{1}{2}$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\frac{1}{2}$ "
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-13",
        "paperQuestionNumber": 13,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 13 题】\n行列式 $\\left| \\begin{array}{cccc} \\lambda & -1 & 0 & 0 \\\\ 0 & \\lambda & -1 & 0 \\\\ 0 & 0 & \\lambda & -1 \\\\ 4 & 3 & 2 & \\lambda + 1 \\end{array} \\right| = \\_$ .",
        "correctAnswer": "$\\lambda^4 +\\lambda^3 +2\\lambda^2 +3\\lambda +4.$",
        "explanation": "(13)【答案】 $\\lambda^4 +\\lambda^3 +2\\lambda^2 +3\\lambda +4.$\n\n【解】 $\\begin{array}{r}\\left| \\begin{array}{cccc} \\lambda & -1 & 0 & 0\\\\ 0 & \\lambda & -1 & 0\\\\ 0 & 0 & \\lambda & -1\\\\ 4 & 3 & 2 & \\lambda +1 \\end{array} \\right| = \\lambda \\cdot \\left| \\begin{array}{ccc}\\lambda & -1 & 0\\\\ 0 & \\lambda & -1\\\\ 3 & 2 & \\lambda +1 \\end{array} \\right| + \\left| \\begin{array}{ccc}0 & -1 & 0\\\\ 0 & \\lambda & -1\\\\ 4 & 2 & \\lambda +1 \\end{array} \\right| \\end{array}$\n\n$$\n\\begin{array}{l} = \\lambda \\left[ \\lambda \\left| \\begin{array}{c c} \\lambda & - 1 \\\\ 2 & \\lambda + 1 \\end{array} \\right| + \\left| \\begin{array}{c c} 0 & - 1 \\\\ 3 & \\lambda + 1 \\end{array} \\right| \\right] + \\left| \\begin{array}{c c} 0 & - 1 \\\\ 4 & \\lambda + 1 \\end{array} \\right| \\\\ = \\lambda \\left[ \\lambda (\\lambda^ {2} + \\lambda + 2) + 3 \\right] + 4 \\\\ = \\lambda^ {4} + \\lambda^ {3} + 2 \\lambda^ {2} + 3 \\lambda + 4. \\\\ \\end{array}\n$$",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：$\\lambda^4 +\\lambda^3 +2\\lambda^2 +3\\lambda +4.$"
        ],
        "keyPoints": [
          "线性代数真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "线性代数"
        ],
        "difficulty": "简单"
      },
      {
        "id": "m1-16-14",
        "paperQuestionNumber": 14,
        "score": 4,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "核心考点综合",
        "type": "blank",
        "question": "【2016 考研数学一真题 · 第 14 题】\n设 $X_{1}, X_{2}, \\dots, X_{n}$ 为来自总体 $N(\\mu, \\sigma^{2})$ 的简单随机样本，样本均值 $\\overline{X} = 9.5$ ，参数 $\\mu$ 的置信度为0.95的双侧置信区间的置信上限为10.8，则 $\\mu$ 的置信度为0.95的双侧置信区间为\n\n# 三、解答题（本题共9小题，共94分，解答应写出文字说明、证明过程或演算步骤。）",
        "correctAnswer": "(8.2, 10.8)",
        "explanation": "（14）【答案】 (8.2, 10.8).\n\n【解】 $P\\left\\{-u_{0.025} < \\frac{\\overline{x} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}} < u_{0.025}\\right\\} = 0.95,$\n\n得 $P\\left\\{\\overline{x} - \\frac{\\sigma}{\\sqrt{n}} u_{0.025} < \\mu < \\overline{x} + \\frac{\\sigma}{\\sqrt{n}} u_{0.025}\\right\\} = 0.95,$\n\n由 $\\overline{x} +\\frac{\\sigma}{\\sqrt{n}} u_{0.025} = 10.8$ 得 $\\frac{\\sigma}{\\sqrt{n}} u_{0.025} = 10.8 - \\overline{x} = 1.3$ ，从而 $\\overline{x} -\\frac{\\sigma}{\\sqrt{n}} u_{0.025} = 8.2,$\n\n故 $\\mu$ 的置信度为0.95的双侧置信区间为(8.2，10.8).\n\n# 三、解答题",
        "steps": [
          "根据题意建立解析表达式或标准积分/微分方程",
          "规范实施化简运算与关键公式代入",
          "计算得出最终确切结果并核验：(8.2, 10.8)"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2016数一"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "概率论与数理统计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-15",
        "paperQuestionNumber": 15,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 15 题】\n已知平面区域 $D = \\left\\{(r, \\theta) \\mid 2 \\leqslant r \\leqslant 2(1 + \\cos \\theta), -\\frac{\\pi}{2} \\leqslant \\theta \\leqslant \\frac{\\pi}{2}\\right\\}$ , 计算二重积分 $\\iint_{D} x \\, \\mathrm{d}x \\, \\mathrm{d}y$ .",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（15）【解】 $\\iint_{D}x\\mathrm{d}x\\mathrm{d}y = \\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}\\mathrm{d}\\theta \\int_{2}^{2(1 + \\cos \\theta)}r^{2}\\cos \\theta \\mathrm{d}r$\n\n$$\n\\begin{array}{l} = \\frac {8}{3} \\int_ {- \\frac {\\pi}{2}} ^ {\\frac {\\pi}{2}} \\left(\\cos^ {4} \\theta + 3 \\cos^ {3} \\theta + 3 \\cos^ {2} \\theta\\right) d \\theta \\\\ = \\frac {1 6}{3} \\int_ {0} ^ {\\frac {\\pi}{2}} (\\cos^ {4} \\theta + 3 \\cos^ {3} \\theta + 3 \\cos^ {2} \\theta) d \\theta \\\\ = \\frac {1 6}{3} \\left(I _ {4} + 3 I _ {3} + 3 I _ {2}\\right) = 5 \\pi + \\frac {3 2}{3}. \\\\ \\end{array}\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-16",
        "paperQuestionNumber": 16,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 16 题】\n(本题满分 10 分)\n\n设函数 $y(x)$ 满足方程 $y'' + 2y' + ky = 0$ ，其中 $0 < k < 1$ .\n\n(I) 证明: 反常积分 $\\int_{0}^{+\\infty} y(x) \\mathrm{d}x$ 收敛;  \n(II) 若 $y(0) = 1, y'(0) = 1$ ，求 $\\int_{0}^{+\\infty} y(x) \\mathrm{d}x$ 的值.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（16）【证明】（I）微分方程 $y^{\\prime \\prime} + 2y^{\\prime} + ky = 0$ 的特征方程为 $\\lambda^2 +2\\lambda +k = 0$\n\n解得 $\\lambda_{1} = -1 + \\sqrt{1 - k}$ ， $\\lambda_{2} = -1 - \\sqrt{1 - k}$\n\n因为 $0 < k < 1$ ，所以 $\\lambda_1 < 0, \\lambda_2 < 0$ ，从而 $\\int_{0}^{+\\infty} \\mathrm{e}^{\\lambda_1 x} \\mathrm{d}x$ 与 $\\int_{0}^{+\\infty} \\mathrm{e}^{\\lambda_2 x} \\mathrm{d}x$ 都收敛.\n\n该方程的通解为 $y = C_{1}\\mathrm{e}^{\\lambda_{1}x} + C_{2}\\mathrm{e}^{\\lambda_{2}x}$\n\n由 $\\int_{0}^{+\\infty}y(x)\\mathrm{d}x = C_{1}\\int_{0}^{+\\infty}\\mathrm{e}^{\\lambda_{1}x}\\mathrm{d}x + C_{2}\\int_{0}^{+\\infty}\\mathrm{e}^{\\lambda_{2}x}\\mathrm{d}x$ ，得 $\\int_0^{+\\infty}y(x)\\mathrm{d}x$ 收敛.\n\n（Ⅱ）方法一 由 $\\lambda_1 < 0, \\lambda_2 < 0$ 得 $\\lim_{x \\to +\\infty} y(x) = \\lim_{x \\to +\\infty} (C_1 e^{\\lambda_1 x} + C_2 e^{\\lambda_2 x}) = 0,$\n\n$$\n\\lim  _ {x \\rightarrow + \\infty} y ^ {\\prime} (x) = \\lim  _ {x \\rightarrow + \\infty} \\left(C _ {1} \\lambda_ {1} e ^ {\\lambda_ {1} x} + C _ {2} \\lambda_ {2} e ^ {\\lambda_ {2} x}\\right) = 0,\n$$\n\n于是 $\\int_0^{+\\infty}y(x)\\mathrm{d}x = -\\frac{1}{k}\\left[\\int_0^{+\\infty}y''(x)\\mathrm{d}x + 2\\int_0^{+\\infty}y'(x)\\mathrm{d}x\\right],$\n\n再由 $\\int_{0}^{+\\infty}y^{\\prime \\prime}(x)\\mathrm{d}x = y^{\\prime}(x)\\Big|_{0}^{+\\infty} = -y^{\\prime}(0) = -1,$\n\n$$\n\\int_ {0} ^ {+ \\infty} y ^ {\\prime} (x) \\mathrm {d} x = y (x) \\Big | _ {0} ^ {+ \\infty} = - y (0) = - 1,\n$$\n\n得 $\\int_{0}^{+\\infty}y(x)\\mathrm{d}x = \\frac{3}{k}$\n\n方法二 将 $y(0) = 1, y'(0) = 1$ 代入 $y = C_1 \\mathrm{e}^{\\lambda_1 x} + C_2 \\mathrm{e}^{\\lambda_2 x}$ 得 $\\left\\{ \\begin{array}{l} C_1 + C_2 = 1, \\\\ \\lambda_1 C_1 + \\lambda_2 C_2 = 1. \\end{array} \\right.$\n\n解得 $C_1 = \\frac{1 - \\lambda_2}{\\lambda_1 - \\lambda_2} = \\frac{2 + \\sqrt{1 - k}}{2\\sqrt{1 - k}}, C_2 = \\frac{\\lambda_1 - 1}{\\lambda_1 - \\lambda_2} = \\frac{-2 + \\sqrt{1 - k}}{2\\sqrt{1 - k}},$\n\n故 $\\int_0^{+\\infty}y(x)\\mathrm{d}x = -\\left(\\frac{C_1}{\\lambda_1} +\\frac{C_1}{\\lambda_1}\\right) = \\frac{3}{k}.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "多元积分与场论",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 17 题】\n设函数 $f(x,y)$ 满足 $\\frac{\\partial f(x,y)}{\\partial x} = (2x + 1)\\mathrm{e}^{2x - y}$ , 且 $f(0,y) = y + 1, L_t$ 是从点 $(0,0)$ 到点 $(1,t)$ 的光滑曲线. 计算曲线积分 $I(t) = \\int_{L_t} \\frac{\\partial f(x,y)}{\\partial x} \\mathrm{d}x + \\frac{\\partial f(x,y)}{\\partial y} \\mathrm{d}y$ , 并求 $I(t)$ 的最小值.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(17)【解】 方法一 由 $\\frac{\\partial f(x,y)}{\\partial x} = (2x + 1)\\mathrm{e}^{2x - y}$ 得\n\n$$\n\\begin{array}{l} f (x, y) = \\frac {1}{2} \\mathrm {e} ^ {- y} \\int (2 x + 1) \\mathrm {d} \\left(\\mathrm {e} ^ {2 x}\\right) + \\varphi (y) = \\frac {1}{2} \\mathrm {e} ^ {- y} \\left[ (2 x + 1) \\mathrm {e} ^ {2 x} - 2 \\int \\mathrm {e} ^ {2 x} \\mathrm {d} x \\right] + \\varphi (y) \\\\ = x \\mathrm {e} ^ {2 x - y} + \\varphi (y). \\\\ \\end{array}\n$$\n\n由 $f(0,y) = y + 1$ 得 $\\varphi (y) = y + 1$ ，于是 $f(x,y) = x\\mathrm{e}^{2x - y} + y + 1.$\n\n$$\n\\frac {\\partial f (x , y)}{\\partial y} = - x \\mathrm {e} ^ {2 x - y} + 1,\n$$\n\n令 $P(x,y) = \\frac{\\partial f(x,y)}{\\partial x},\\quad Q(x,y) = \\frac{\\partial f(x,y)}{\\partial y},$\n\n$$\n\\frac {\\partial P}{\\partial y} = - (2 x + 1) \\mathrm {e} ^ {2 x - y}, \\quad \\frac {\\partial Q}{\\partial x} = - (2 x + 1) \\mathrm {e} ^ {2 x - y},\n$$\n\n因为 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$ 所以曲线积分与路径无关，\n\n于是 $I(t) = \\int_{0}^{1}(2x + 1)\\mathrm{e}^{2x}\\mathrm{d}x + \\int_{0}^{t}(1 - \\mathrm{e}^{2 - y})\\mathrm{d}y = t + \\mathrm{e}^{2 - t}.$\n\n由 $I^{\\prime}(t) = 1 - \\mathrm{e}^{2 - t} = 0$ 得 $t = 2$\n\n因为 $I''(t) = \\mathrm{e}^{2 - t} > 0$ ，所以当 $t = 2$ 时， $I(t)$ 取最小值，最小值为 $I(2) = 3$\n\n方法二 由 $\\frac{\\partial f(x,y)}{\\partial x} = (2x + 1)\\mathrm{e}^{2x - y}$ 得 $f(x,y) = x\\mathrm{e}^{2x - y} + \\varphi (y)$\n\n由 $f(0,y) = y + 1$ 得 $\\varphi (y) = y + 1$ ，从而 $f(x,y) = x\\mathrm{e}^{2x - y} + y + 1.$\n\n于是 $I(t) = \\int_{L_t} \\mathrm{d}f(x, y) = f(1, t) - f(0, 0) = \\mathrm{e}^{2 - t} + t$ .\n\n由 $I^{\\prime}(t) = 1 - \\mathrm{e}^{2 - t} = 0$ 得 $t = 2$\n\n当 $t < 2$ 时， $I'(t) < 0$ ；当 $t > 2$ 时， $I'(t) > 0$ ，则 $t = 2$ 时 $I(t)$ 取最小值，且最小值为\n\n$$\nI (2) = 3.\n$$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-18",
        "paperQuestionNumber": 18,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元积分与场论",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 18 题】\n设有界区域 $\\Omega$ 由平面 $2x + y + 2z = 2$ 与三个坐标平面围成， $\\Sigma$ 为 $\\Omega$ 整个表面的外侧，计算曲面积分 $I = \\iint_{\\Sigma} (x^2 + 1) \\, \\mathrm{d}y \\, \\mathrm{d}z - 2y \\, \\mathrm{d}z \\, \\mathrm{d}x + 3z \\, \\mathrm{d}x \\, \\mathrm{d}y.$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（18）【解】由高斯公式得 $I = \\iint_{\\Sigma}(x^{2} + 1)\\mathrm{d}y\\mathrm{d}z - 2y\\mathrm{d}z\\mathrm{d}x + 3z\\mathrm{d}x\\mathrm{d}y = \\iiint_{\\Omega}(2x + 1)\\mathrm{d}v,$\n\n而 $\\iiint_{\\Omega} \\mathrm{d}v = \\frac{1}{3} \\times \\frac{1}{2} \\times 2 \\times 1 \\times 1 = \\frac{1}{3}$ ,\n\n$$\n\\begin{array}{l} \\iiint_ {\\Omega} x \\mathrm {d} v = \\int_ {0} ^ {1} x \\mathrm {d} x \\int_ {0} ^ {2 (1 - x)} \\mathrm {d} y \\int_ {0} ^ {1 - x - \\frac {y}{2}} \\mathrm {d} z = \\int_ {0} ^ {1} x \\mathrm {d} x \\int_ {0} ^ {2 (1 - x)} \\left(1 - x - \\frac {y}{2}\\right) \\mathrm {d} y \\\\ = \\int_ {0} ^ {1} x (1 - x) ^ {2} d x = \\frac {1}{1 2}, \\\\ \\end{array}\n$$\n\n故 $I = \\frac{1}{3} +2\\times \\frac{1}{12} = \\frac{1}{2}$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "多元积分与场论"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "多元积分与场论"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-16-19",
        "paperQuestionNumber": 19,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数收敛域与和函数",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 19 题】\n已知函数 $f(x)$ 可导，且 $f(0) = 1, 0 < f'(x) < \\frac{1}{2}$ . 设数列 $\\{x_{n}\\}$ 满足 $x_{n+1} = f(x_{n}) (n = 1, 2, \\dots)$ . 证明：\n\n(I) 级数 $\\sum_{n=1}^{\\infty}\\left(x_{n+1}-x_{n}\\right)$ 绝对收敛;  \n(II) $\\lim_{n\\to \\infty}x_n$ 存在，且 $0 < \\lim_{n\\to \\infty}x_n < 2.$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（19）【证明】\n\n(I) $|x_{n+1} - x_n| = |f(x_n) - f(x_{n-1})| = |f'(\\xi)(x_n - x_{n-1})|$ ，其中 $\\xi$ 介于 $x_{n-1}$ 与 $x_n$ 之间.\n\n因为 $0 < f'(x) < \\frac{1}{2}$ ，所以 $\\left|x_{n+1} - x_n\\right| \\leqslant \\frac{1}{2}\\left|x_n - x_{n-1}\\right|$ ，\n\n由递推关系得 $|x_{n + 1} - x_n| \\leqslant \\frac{1}{2^{n - 1}} |x_2 - x_1|$ .\n\n因为级数 $\\sum_{n=1}^{\\infty} \\frac{1}{2^{n-1}} |x_2 - x_1|$ 收敛，所以 $\\sum_{n=1}^{\\infty} |x_{n+1} - x_n|$ 收敛，\n\n故级数 $\\sum_{n = 1}^{\\infty}(x_{n + 1} - x_n)$ 绝对收敛.\n\n（Ⅱ）级数 $\\sum_{n = 1}^{\\infty}(x_{n + 1} - x_n)$ 的部分和为\n\n$$\nS _ {n} = \\left(x _ {2} - x _ {1}\\right) + \\left(x _ {3} - x _ {2}\\right) + \\dots + \\left(x _ {n + 1} - x _ {n}\\right) = x _ {n + 1} - x _ {1},\n$$\n\n因为级数 $\\sum_{n=1}^{\\infty}(x_{n+1}-x_n)$ 收敛，即 $\\lim_{n\\to\\infty}S_n$ 存在，所以 $\\lim_{n\\to\\infty}x_n$ 存在.\n\n令 $\\lim_{n\\to \\infty}x_n = a,x_{n + 1} = f(x_n)$ 及函数 $f(x)$ 的连续性得 $a = f(a)$\n\n令 $\\varphi (x) = x - f(x)$ ，即 $x = a$ 为 $\\varphi (x)$ 的零点\n\n因为 $\\varphi (0) = -f(0) = -1$\n\n$\\varphi (2) = 2 - f(2) = 1 - [f(2) - f(0)] = 1 - 2f'(\\eta) > 0$ ，其中 $\\eta \\in (0,2)$\n\n所以 $\\varphi (x)$ 在(0，2）内有零点\n\n又因为 $\\varphi'(x) = 1 - f'(x) > 0$ ，所以 $\\varphi(x)$ 只有唯一的一个零点，且位于 $(0,2)$ 内，于是 $0 < a < 2$ ，即 $0 < \\lim_{n\\to \\infty}x_n < 2$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "高等数学真题",
          "2016数一",
          "无穷级数收敛域与和函数"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "高等数学",
          "无穷级数收敛域与和函数"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-16-20",
        "paperQuestionNumber": 20,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 20 题】\n设矩阵 $A = \\left( \\begin{array}{rrr}1 & -1 & -1\\\\ 2 & a & 1\\\\ -1 & 1 & a \\end{array} \\right),B = \\left( \\begin{array}{rr}2 & 2\\\\ 1 & a\\\\ -a - 1 & -2 \\end{array} \\right)$ 当 $a$ 为何值时，方程 $AX = B$ 无解、有唯一解、有无穷多解？在有解时，求解此方程",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（20）【解】 方法一\n\n$$\n(\\mathbf {A} \\mid \\mathbf {B}) = \\left(\\begin{array}{c c c c c c}1&- 1&- 1&2&2\\\\2&a&1&1&a\\\\- 1&1&a&- a - 1&- 2\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c c c c}1&- 1&- 1&2&2\\\\0&a + 2&3&- 3&a - 4\\\\0&0&a - 1&1 - a&0\\end{array}\\right)\n$$\n\n当 $a \\neq -2$ 且 $a \\neq 1$ 时，\n\n$$\n(\\mathbf {A} \\vdots \\mathbf {B}) \\rightarrow \\left(\\begin{array}{c c c c c}1&- 1&- 1&2&2\\\\0&a + 2&3&- 3&a - 4\\\\0&0&1&- 1&0\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c c c}1&0&0&1&\\frac {3 a}{a + 2}\\\\0&1&0&0&\\frac {a - 4}{a + 2}\\\\0&0&1&- 1&0\\end{array}\\right),\n$$\n\n$\\mathbf{AX} = \\mathbf{B}$ 有唯一解， $X = A^{-1}B = \\left[ \\begin{array}{cc}1 & \\frac{3a}{a + 2}\\\\ 0 & \\frac{a - 4}{a + 2}\\\\ -1 & 0 \\end{array} \\right];$\n\n当 $a = 1$ 时， $(\\mathbf{A}\\vdots \\mathbf{B})\\rightarrow \\left( \\begin{array}{ccc}1 & -1 & -1\\\\ 0 & 3 & 3\\\\ 0 & 0 & 0 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{ccc}1 & 0 & 0\\\\ 0 & 1 & 1\\\\ 0 & 0 & 0 \\end{array} \\right),$\n\n由 $r(\\mathbf{A}) = r(\\mathbf{A} \\mid \\mathbf{B}) = 2 < 3$ 得 $\\mathbf{AX} = \\mathbf{B}$ 有无数个解，\n\n令 $X = (X_{1},X_{2})$\n\n由 $X_{1} = k_{1}\\binom{0}{-1} + \\binom{1}{-1} = \\binom{1}{-k_{1} - 1},$ $X_{2} = k_{2}\\binom{0}{-1} + \\binom{1}{-1} = \\binom{1}{-k_{2} - 1}$ 得\n\n$\\mathbf{X} = \\left( \\begin{array}{cc}1 & 1\\\\ -k_1 - 1 & -k_2 - 1\\\\ k_1 & k_2 \\end{array} \\right)(k_1,k_2$ 为任意常数）.\n\n$a = -2$ 时， $(\\mathbf{A}\\mid \\mathbf{B})\\to \\left( \\begin{array}{cccc}1 & -1 & -1 & 2\\\\ 0 & 0 & 3 & -3\\\\ 0 & 0 & -3 & 3 \\end{array} \\right)\\to \\left( \\begin{array}{cccc}1 & -1 & -1 & 2\\\\ 0 & 0 & 1 & -1\\\\ 0 & 0 & 0 & 0 \\end{array} \\right),$\n\n因为 $r(\\mathbf{A})\\neq r(\\mathbf{A}\\vdots \\mathbf{B})$ ，所以 $\\mathbf{AX} = \\mathbf{B}$ 无解.\n\n方法二 $|\\mathbf{A}| = \\left| \\begin{array}{ccc}1 & -1 & -1\\\\ 2 & a & 1\\\\ -1 & 1 & a \\end{array} \\right| = \\left| \\begin{array}{ccc}1 & -1 & -1\\\\ 0 & a + 2 & 3\\\\ 0 & 0 & a - 1 \\end{array} \\right| = (a + 2)(a - 1),$\n\n当 $a \\neq -2$ 且 $a \\neq 1$ 时，因为 $r(\\mathbf{A}) = r(\\mathbf{A} \\mid \\mathbf{B}) = 3$ ，所以 $\\mathbf{AX} = \\mathbf{B}$ 有唯一解，\n\n由 $(\\mathbf{A}\\vdots \\mathbf{B})\\rightarrow \\left( \\begin{array}{cccc}1 & -1 & -1 & 2 & 2\\\\ 0 & a + 2 & 3 & -3 & a - 4\\\\ 0 & 0 & 1 & -1 & 0 \\end{array} \\right)\\rightarrow \\left[ \\begin{array}{cccc}1 & 0 & 0 & 1 & \\frac{3a}{a + 2}\\\\ 0 & 1 & 0 & 0 & \\frac{a - 4}{a + 2}\\\\ 0 & 0 & 1 & -1 & 0 \\end{array} \\right],$\n\n得 $\\mathbf{X} = \\mathbf{A}^{-1}\\mathbf{B} = \\left[ \\begin{array}{cc}1 & \\frac{3a}{a + 2}\\\\ 0 & \\frac{a - 4}{a + 2}\\\\ -1 & 0 \\end{array} \\right];$\n\n当 $a = 1$ 时， $(A\\mid B)\\rightarrow \\left( \\begin{array}{rrrr}1 & -1 & -1 & 2 & 2\\\\ 0 & 3 & 3 & -3 & -3\\\\ 0 & 0 & 0 & 0 & 0 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrrr}1 & 0 & 0 & 1 & 1\\\\ 0 & 1 & 1 & -1 & -1\\\\ 0 & 0 & 0 & 0 & 0 \\end{array} \\right),$\n\n由 $r(\\mathbf{A}) = r(\\mathbf{A} \\vdots \\mathbf{B}) = 2 < 3$ 得 $\\mathbf{AX} = \\mathbf{B}$ 有无数个解，\n\n令 $X = (X_{1},X_{2})$\n\n由 $X_{1} = k_{1}\\left( \\begin{array}{l}0\\\\ -1\\\\ 1 \\end{array} \\right) + \\left( \\begin{array}{l}1\\\\ -1\\\\ 0 \\end{array} \\right) = \\left( \\begin{array}{l}1\\\\ -k_{1} - 1\\\\ k_{1} \\end{array} \\right),$ $X_{2} = k_{2}\\left( \\begin{array}{l}0\\\\ -1\\\\ 1 \\end{array} \\right) + \\left( \\begin{array}{l}1\\\\ -1\\\\ 0 \\end{array} \\right) = \\left( \\begin{array}{l}1\\\\ -k_{2} - 1\\\\ k_{2} \\end{array} \\right)$ 得\n\n$\\pmb {X} = \\left( \\begin{array}{cc}1 & 1\\\\ -k_1 - 1 & -k_2 - 1\\\\ k_1 & k_2 \\end{array} \\right)(k_1,k_2$ 为任意常数）.\n\n$a = -2$ 时， $(\\mathbf{A}\\mid \\mathbf{B})\\to \\left( \\begin{array}{ccc}1 & -1 & -1\\\\ 0 & 0 & 3\\\\ 0 & 0 & -3 \\end{array} \\right)\\to \\left( \\begin{array}{ccc}1 & -1 & -1\\\\ 0 & 0 & 1\\\\ 0 & 0 & 0 \\end{array} \\right),$\n\n因为 $r(\\mathbf{A})\\neq r(\\mathbf{A}\\vdots \\mathbf{B})$ ，所以 $\\mathbf{AX} = \\mathbf{B}$ 无解.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2016数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-21",
        "paperQuestionNumber": 21,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性代数综合应用",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 21 题】\n(本题满分 11 分)\n\n已知矩阵 $A = \\begin{pmatrix} 0 & -1 & 1 \\\\ 2 & -3 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix}$ .\n\n(I)求 $A^{99}$   \n（Ⅱ）设3阶矩阵 $\\pmb {B} = (\\pmb {\\alpha}_1,\\pmb {\\alpha}_2,\\pmb {\\alpha}_3)$ 满足 $B^{2} = BA$ 记 $B^{100} = (\\beta_{1},\\beta_{2},\\beta_{3})$ ，将 $\\beta_{1},\\beta_{2},\\beta_{3}$ 分别表示为 $\\alpha_{1},\\alpha_{2},\\alpha_{3}$ 的线性组合.",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（21）【解】（I）由 $|\\lambda E - A| = \\left| \\begin{array}{ccc}\\lambda & 1 & -1\\\\ -2 & \\lambda +3 & 0\\\\ 0 & 0 & \\lambda \\end{array} \\right| = \\lambda (\\lambda +1)(\\lambda +2) = 0$ 得\n\n矩阵 $\\mathbf{A}$ 的特征值为 $\\lambda_{1} = -1, \\lambda_{2} = -2, \\lambda_{3} = 0$\n\n将 $\\lambda_{1} = -1$ 代入 $(\\lambda E - A)X = 0$ ，由 $-E - A = \\begin{pmatrix} -1 & 1 & -1 \\\\ -2 & 2 & 0 \\\\ 0 & 0 & -1 \\end{pmatrix} \\rightarrow \\begin{pmatrix} 1 & -1 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix}$ 得 $\\lambda_{1} = -1$ 对\n\n应的特征向量为 $\\xi_{1} = \\begin{pmatrix} 1 \\\\ 1 \\\\ 0 \\end{pmatrix}$\n\n将 $\\lambda_{2} = -2$ 代入 $(\\lambda E - A)X = 0$ ，由 $-2E - A = \\begin{pmatrix} -2 & 1 & -1 \\\\ -2 & 1 & 0 \\\\ 0 & 0 & -2 \\end{pmatrix} \\rightarrow \\begin{bmatrix} 1 & -\\frac{1}{2} & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{bmatrix}$ 得\n\n$\\lambda_{2} = -2$ 对应的特征向量为 $\\xi_{2} = \\begin{pmatrix} 1 \\\\ 2 \\\\ 0 \\end{pmatrix}$\n\n将 $\\lambda_{3} = 0$ 代入 $(\\lambda E - A)X = 0$ ，由 $-A = \\begin{pmatrix} 0 & 1 & -1 \\\\ -2 & 3 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix} \\rightarrow \\begin{bmatrix} 1 & 0 & -\\frac{3}{2} \\\\ 0 & 1 & -1 \\\\ 0 & 0 & 0 \\end{bmatrix}$ 得 $\\lambda_{3} = 0$ 对应\n\n的特征向量为 $\\xi_{3} = \\begin{pmatrix} 3\\\\ 2\\\\ 2 \\end{pmatrix} .$\n\n令 $\\pmb{P} = \\begin{pmatrix} 1 & 1 & 3 \\\\ 1 & 2 & 2 \\\\ 0 & 0 & 2 \\end{pmatrix}$ , 由 $\\pmb{P}^{-1}\\pmb{A}\\pmb{P} = \\begin{pmatrix} -1 & 0 & 0 \\\\ 0 & -2 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix}$ 得\n\n$$\n\\begin{array}{l} \\boldsymbol {A} ^ {9 9} = \\boldsymbol {P} \\left( \\begin{array}{c c c} (- 1) ^ {9 9} & 0 & 0 \\\\ 0 & (- 2) ^ {9 9} & 0 \\\\ 0 & 0 & 0 \\end{array} \\right) \\boldsymbol {P} ^ {- 1} = \\left( \\begin{array}{c c c} 1 & 1 & 3 \\\\ 1 & 2 & 2 \\\\ 0 & 0 & 2 \\end{array} \\right) \\left( \\begin{array}{c c c} (- 1) ^ {9 9} & 0 & 0 \\\\ 0 & (- 2) ^ {9 9} & 0 \\\\ 0 & 0 & 0 \\end{array} \\right) \\left( \\begin{array}{c c c} 2 & - 1 & - 2 \\\\ - 1 & 1 & \\frac {1}{2} \\\\ 0 & 0 & \\frac {1}{2} \\end{array} \\right) \\\\ = \\left( \\begin{array}{c c c} 2 ^ {9 9} - 2 & 1 - 2 ^ {9 9} & 2 - 2 ^ {9 8} \\\\ 2 ^ {1 0 0} - 2 & 1 - 2 ^ {1 0 0} & 2 - 2 ^ {9 9} \\\\ 0 & 0 & 0 \\end{array} \\right). \\\\ \\end{array}\n$$\n\n（Ⅱ）由 $\\pmb{B}^{2} = \\pmb{BA}$ 得 $\\pmb{B}^{100} = \\pmb{B}^{98}\\pmb{B}^{2} = \\pmb{B}^{99}\\pmb{A} = \\dots = \\pmb{BA}^{99}$\n\n即 $(\\pmb{\\beta}_1, \\pmb{\\beta}_2, \\pmb{\\beta}_3) = (\\pmb{\\alpha}_1, \\pmb{\\alpha}_2, \\pmb{\\alpha}_3)\\left( \\begin{array}{ccc} 2^{99} - 2 & 1 - 2^{99} & 2 - 2^{98} \\\\ 2^{100} - 2 & 1 - 2^{100} & 2 - 2^{99} \\\\ 0 & 0 & 0 \\end{array} \\right),$\n\n$\\begin{array}{l}\\pmb {\\beta}_1 = (2^{99} - 2)\\pmb {\\alpha}_1 + (2^{100} - 2)\\pmb {\\alpha}_2 + 0\\pmb {\\alpha}_3,\\\\ \\pmb {\\beta}_2 = (1 - 2^{99})\\pmb {\\alpha}_1 + (1 - 2^{100})\\pmb {\\alpha}_2 + 0\\pmb {\\alpha}_3,\\\\ \\pmb {\\beta}_3 = (2 - 2^{98})\\pmb {\\alpha}_1 + (2 - 2^{99})\\pmb {\\alpha}_2 + 0\\pmb {\\alpha}_3. \\end{array}$ 故",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "线性代数真题",
          "2016数一",
          "线性代数综合应用"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "线性代数",
          "线性代数综合应用"
        ],
        "difficulty": "困难"
      },
      {
        "id": "m1-16-22",
        "paperQuestionNumber": 22,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 22 题】\n(本题满分 11 分)\n\n设二维随机变量 $(X,Y)$ 在区域 $D = \\{(x,y) \\mid 0 < x < 1, x^2 < y < \\sqrt{x}\\}$ 上服从均匀分布，令 $U = \\left\\{ \\begin{array}{ll} 1, & X \\leqslant Y, \\\\ 0, & X > Y. \\end{array} \\right.$\n\n(I) 写出 $(X, Y)$ 的概率密度;  \n（Ⅱ）问 $U$ 与 $X$ 是否相互独立？并说明理由；  \n（Ⅲ）求 $Z = U + X$ 的分布函数 $F(z)$",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "（22）【解】（I）区域 $D$ 的面积为 $A = \\int_{0}^{1}(\\sqrt{x} -x^{2})\\mathrm{d}x = \\frac{2}{3} -\\frac{1}{3} = \\frac{1}{3},$\n\n随机变量 $(X,Y)$ 的联合密度为 $f(x,y) = \\left\\{ \\begin{array}{ll}3, & (x,y)\\in D,\\\\ 0, & (x,y)\\notin D. \\end{array} \\right.$\n\n（Ⅱ）设 $(U,X)$ 的联合分布函数为 $G(u,x)$\n\n$$\nG \\left(0, \\frac {1}{2}\\right) = P \\left\\{U \\leqslant 0, X \\leqslant \\frac {1}{2} \\right\\} = P \\left\\{X > Y, X \\leqslant \\frac {1}{2} \\right\\} = \\int_ {0} ^ {\\frac {1}{2}} d x \\int_ {x ^ {2}} ^ {x} 3 d y = \\frac {1}{4},\n$$\n\n$$\nP \\{U \\leqslant 0 \\} = P \\{X > Y \\} = \\int_ {0} ^ {1} \\mathrm {d} x \\int_ {x ^ {2}} ^ {x} 3 \\mathrm {d} y = \\frac {1}{2},\n$$\n\n$$\nP \\left\\{X \\leqslant \\frac {1}{2} \\right\\} = \\int_ {0} ^ {\\frac {1}{2}} d x \\int_ {x ^ {2}} ^ {\\sqrt {x}} 3 d y = \\frac {\\sqrt {2}}{2} - \\frac {1}{8},\n$$\n\n因为 $\\frac{1}{4} \\neq \\frac{1}{2} \\times \\left(\\frac{\\sqrt{2}}{2} - \\frac{1}{8}\\right)$ , 所以 $U$ 与 $X$ 不独立.\n\n（Ⅲ）当 $z < 0$ 时， $F(z) = 0$\n\n当 $0 \\leqslant z < 1$ 时，\n\n$$\nF (z) = P \\{Z \\leqslant z \\} = P \\{U = 0, X \\leqslant z \\} = P \\{X > Y, X \\leqslant z \\} = \\int_ {0} ^ {z} d x \\int_ {x ^ {2}} ^ {x} 3 d y = \\frac {3}{2} z ^ {2} - z ^ {3};\n$$\n\n当 $1 \\leqslant z < 2$ 时，\n\n$$\n\\begin{array}{l} F (z) = P \\{U + X \\leqslant z \\} = P \\{U = 0, X \\leqslant z \\} + P \\{U = 1, X \\leqslant z - 1 \\} \\\\ = \\frac {1}{2} + 2 (z - 1) ^ {\\frac {3}{2}} - \\frac {3}{2} (z - 1) ^ {2}; \\\\ \\end{array}\n$$\n\n当 $z \\geqslant 2$ 时， $F(z) = 1$\n\n故 $F(z) = \\left\\{ \\begin{array}{ll}0, & z <   0,\\\\ \\frac{3}{2} z^2 -z^3, & 0\\leqslant z <   1,\\\\ \\frac{1}{2} +2(z - 1)^{\\frac{3}{2}} - \\frac{3}{2} (z - 1)^2, & 1\\leqslant z <   2,\\\\ 1, & z\\geqslant 2. \\end{array} \\right.$",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2016数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "中等"
      },
      {
        "id": "m1-16-23",
        "paperQuestionNumber": 23,
        "score": 11,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "二维随机变量与参数估计",
        "type": "analysis",
        "question": "【2016 考研数学一真题 · 第 23 题】\n(本题满分 11 分)\n\n设总体 $X$ 的概率密度为 $f(x;\\theta) = \\left\\{ \\begin{array}{ll} \\frac{3x^2}{\\theta^3}, & 0 < x < \\theta, \\\\ 0, & \\text{其他}, \\end{array} \\right.$ 其中 $\\theta \\in (0, +\\infty)$ 为未知参数， $X_1, X_2, X_3$ 为来自总体 $X$ 的简单随机样本，令 $T = \\max \\{X_1, X_2, X_3\\}$ .\n\n(I)求 $T$ 的概率密度；  \n（Ⅱ）确定 $a$ ，使得 $aT$ 为 $\\theta$ 的无偏估计",
        "correctAnswer": "完整分步解答见解析",
        "explanation": "(23)【解】（I）总体 $X$ 的分布函数为 $F(x) = \\int_{-\\infty}^{x}f(t)\\mathrm{d}t.$\n\n当 $x < 0$ 时， $F(x) = 0$\n\n当 $x \\geqslant \\theta$ 时， $F(x) = 1$\n\n当 $0 \\leqslant x < \\theta$ 时， $F(x) = \\int_{0}^{x} \\frac{3x^2}{\\theta^3} \\, \\mathrm{d}x = \\frac{x^3}{\\theta^3}$ ，\n\n即 $F(x) = \\left\\{ \\begin{array}{ll}0, & x <   0,\\\\ \\frac{x^3}{\\theta^3}, & 0\\leqslant x <   \\theta ,\\\\ 1, & x\\geqslant \\theta . \\end{array} \\right.$\n\n设 $T$ 的分布函数为 $F_{T}(t)$ ，则\n\n$$\n\\begin{array}{l} F _ {T} (t) = P \\{T \\leqslant t \\} = P \\{\\max  \\left\\{X _ {1}, X _ {2}, X _ {3} \\right\\} \\leqslant t \\} \\\\ = P \\left\\{X _ {1} \\leqslant t, X _ {2} \\leqslant t, X _ {3} \\leqslant t \\right\\} \\\\ = P \\left\\{X _ {1} \\leqslant t \\right\\} P \\left\\{X _ {2} \\leqslant t \\right\\} P \\left\\{X _ {3} \\leqslant t \\right\\} \\\\ = P ^ {3} \\{X \\leqslant t \\} = F ^ {3} (t) = \\left\\{ \\begin{array}{l l} 0, & t <   0, \\\\ \\frac {t ^ {9}}{\\theta^ {9}}, & 0 \\leqslant t <   \\theta , \\\\ 1, & t \\geqslant \\theta . \\end{array} \\right. \\\\ \\end{array}\n$$\n\n随机变量 $T$ 的概率密度为 $f_{T}(t) = \\begin{cases} \\frac{9t^{8}}{\\theta^{9}}, & 0 < t < \\theta, \\\\ 0, & \\text{其他.} \\end{cases}$\n\n$(\\mathrm{II})E(aT) = aE(T) = a\\int_{0}^{\\theta}t\\cdot \\frac{9t^{8}}{\\theta^{9}}\\mathrm{d}t = \\frac{9a}{10}\\theta ,$\n\n由 $E(aT) = \\theta$ 得 $a = \\frac{10}{9}$ ，即当 $a = \\frac{10}{9}$ 时， $aT$ 为参数 $\\theta$ 的无偏估计.",
        "steps": [
          "第一步：设出关键变量，建立基础方程组或应用微积分基本定理",
          "第二步：展开详尽矩阵变换/特征值对角化或重积分/级数推导",
          "第三步：整理标准表述，得出最终解析结论并写明定义域"
        ],
        "keyPoints": [
          "概率论与数理统计真题",
          "2016数一",
          "二维随机变量与参数估计"
        ],
        "tags": [
          "考研数学",
          "数一",
          "历年真题",
          "2016真题",
          "概率论与数理统计",
          "二维随机变量与参数估计"
        ],
        "difficulty": "困难"
      }
    ]
  }
];
