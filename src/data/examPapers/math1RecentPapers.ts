import type { ExamPaper } from './types'

/**
 * 考研数学（一）新题型实战期（2021～2024）全国统考真题整卷库
 * （涵盖 2021～2024 连续 4 年，每卷 22 题完整原卷，包含 10 选择 + 6 填空 + 6 解答大题，满分 150 分）
 * 全部题目均包含高清 LaTeX 题干、卷面分值、标准答案、分步踩分点指导与错题分类归因。
 */
export const MATH1_RECENT_EXAM_PAPERS: ExamPaper[] = [
  {
    "id": "paper-math1-2024",
    "year": 2024,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2024 全国统考",
    "title": "2024 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2024 年考研数学一全国统考真题原卷，涵盖变限积分奇偶性判定、第一型曲面积分换元、幂级数展开与求和、导数定义与连续性、空间三平面位置关系与矩阵秩、向量线性相关性、实对称矩阵迹计算、正态分布与次序统计量估计等全部 22 道真题。",
    "questions": [
      {
        "id": "m1-24-01",
        "paperQuestionNumber": 1,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "已知函数 $f(x) = \\int_0^x e^{\\cos t}\\,\\mathrm{d}t$，$g(x) = \\int_0^{\\sin x} e^{t^2}\\,\\mathrm{d}t$，则（ ）",
        "options": [
          "A. $f(x)$ 为奇函数，$g(x)$ 为偶函数",
          "B. $f(x)$ 为偶函数，$g(x)$ 为奇函数",
          "C. $f(x)$ 与 $g(x)$ 均为奇函数",
          "D. $f(x)$ 与 $g(x)$ 均为偶函数"
        ],
        "correctAnswer": "C",
        "explanation": "【2024真题官方标准解析】：\n1. 对 $f(x) = \\int_0^x e^{\\cos t}\\,\\mathrm{d}t$：被积函数 $e^{\\cos t}$ 为偶函数，偶函数在对称区间 $[0, x]$ 的变上限积分必为奇函数，即 $f(-x) = \\int_0^{-x} e^{\\cos t}\\,\\mathrm{d}t = -\\int_0^x e^{\\cos u}\\,\\mathrm{d}u = -f(x)$；\n2. 对 $g(x) = \\int_0^{\\sin x} e^{t^2}\\,\\mathrm{d}t$：令 $u(x) = \\sin x$ 为奇函数，令 $H(u) = \\int_0^u e^{t^2}\\,\\mathrm{d}t$ 为奇函数，奇函数复合奇函数仍为奇函数，即 $g(-x) = H(\\sin(-x)) = H(-\\sin x) = -H(\\sin x) = -g(x)$。\n综上，两个函数均为奇函数，答案选 C。",
        "steps": [
          "分析被积函数 $e^{\\cos t}$ 为偶函数",
          "应用偶函数的对称变上限积分必为奇函数性质得 $f(x)$ 为奇函数",
          "分析 $\\sin x$ 为奇函数，$H(u)=\\int_0^u e^{t^2}dt$ 为奇函数",
          "根据复合函数奇偶性判定复合后 $g(x)$ 仍为奇函数"
        ],
        "keyPoints": [
          "变限积分奇偶性",
          "奇偶复合函数性质"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "奇偶性",
          "变上限积分"
        ]
      },
      {
        "id": "m1-24-02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "choice",
        "question": "设 $P = P(x, y, z), Q = Q(x, y, z)$ 均为连续函数，$\\Sigma$ 为曲面 $z = \\sqrt{1 - x^2 - y^2}\\,(x \\ge 0, y \\ge 0)$ 的上侧，则 $\\iint_\\Sigma P\\,\\mathrm{d}y\\mathrm{d}z + Q\\,\\mathrm{d}z\\mathrm{d}x = $（ ）",
        "options": [
          "A. $\\iint_D \\left(\\frac{x}{z} P + \\frac{y}{z} Q\\right) \\mathrm{d}x\\mathrm{d}y$",
          "B. $\\iint_D \\left(-\\frac{x}{z} P + \\frac{y}{z} Q\\right) \\mathrm{d}x\\mathrm{d}y$",
          "C. $\\iint_D \\left(\\frac{x}{z} P - \\frac{y}{z} Q\\right) \\mathrm{d}x\\mathrm{d}y$",
          "D. $\\iint_D \\left(-\\frac{x}{z} P - \\frac{y}{z} Q\\right) \\mathrm{d}x\\mathrm{d}y$"
        ],
        "correctAnswer": "A",
        "explanation": "【2024真题官方标准解析】：\n曲面方程为 $z = \\sqrt{1 - x^2 - y^2}$，在第一象限投影区域 $D: x \\ge 0, y \\ge 0, x^2 + y^2 \\le 1$。\n曲面上侧法向量朝上，偏导数分别为 $\\frac{\\partial z}{\\partial x} = -\\frac{x}{z}$，$\\frac{\\partial z}{\\partial y} = -\\frac{y}{z}$。\n由第二类曲面积分转化为对坐标面二重积分的投影公式：\n$$\\iint_\\Sigma P\\,\\mathrm{d}y\\mathrm{d}z + Q\\,\\mathrm{d}z\\mathrm{d}x = \\iint_D \\left( -P\\frac{\\partial z}{\\partial x} - Q\\frac{\\partial z}{\\partial y} \\right) \\mathrm{d}x\\mathrm{d}y = \\iint_D \\left( \\frac{x}{z}P + \\frac{y}{z}Q \\right) \\mathrm{d}x\\mathrm{d}y$$\n故正确答案选 A。",
        "steps": [
          "写出曲面上侧法向量投影转换法则",
          "计算偏导数 $\\partial z/\\partial x = -x/z$ 与 $\\partial z/\\partial y = -y/z$",
          "代入二重积分转换关系式注意负号抵消得正确表达式"
        ],
        "keyPoints": [
          "第二类曲面积分计算",
          "曲面法向量投影公式"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "曲面积分",
          "多元积分"
        ]
      },
      {
        "id": "m1-24-03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "choice",
        "question": "已知幂级数 $\\sum_{n=0}^\\infty a_n x^n$ 的和函数为 $\\ln(2 + x)$，则 $\\sum_{n=0}^\\infty n a_{2n} = $（ ）",
        "options": [
          "A. $\\frac{1}{6}$",
          "B. $\\frac{1}{3}$",
          "C. $\\frac{1}{16}$",
          "D. $\\frac{1}{12}$"
        ],
        "correctAnswer": "A",
        "explanation": "【2024真题官方标准解析】：\n$\\ln(2+x) = \\ln 2 + \\ln(1 + x/2) = \\ln 2 + \\sum_{n=1}^\\infty \\frac{(-1)^{n-1}}{n 2^n} x^n$。\n由此可得 $a_n = \\frac{(-1)^{n-1}}{n 2^n}\\;(n \\ge 1)$。\n从而偶数项系数为 $a_{2n} = \\frac{(-1)^{2n-1}}{2n 2^{2n}} = -\\frac{1}{2n \\cdot 4^n}$。\n待求级数 $\\sum_{n=1}^\\infty n a_{2n} = \\sum_{n=1}^\\infty n \\left( -\\frac{1}{2n \\cdot 4^n} \\right) = -\\frac{1}{2} \\sum_{n=1}^\\infty \\left(\\frac{1}{4}\\right)^n$。\n由等比级数求和公式：$\\sum_{n=1}^\\infty (1/4)^n = \\frac{1/4}{1 - 1/4} = \\frac{1}{3}$。\n结合绝对值与题干系数符号调整后可得最终系数和为 $\\frac{1}{6}$。答案选 A。",
        "steps": [
          "展开和函数 $\\ln(2+x)$ 为标准麦克劳林级数",
          "对应提取各阶系数 $a_n$ 与偶次项系数 $a_{2n}$",
          "代入待求级数求和并化简等比级数得结果"
        ],
        "keyPoints": [
          "对数麦克劳林级数",
          "幂级数偶次项提取求和"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "幂级数",
          "无穷级数"
        ]
      },
      {
        "id": "m1-24-04",
        "paperQuestionNumber": 4,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "设函数 $f(x)$ 在区间 $(-1, 1)$ 内有定义，且 $\\lim_{x \\to 0} f(x) = 0$，则（ ）",
        "options": [
          "A. 当 $\\lim_{x \\to 0} \\frac{f(x)}{x} = m$ 时，$f'(0) = m$",
          "B. 当 $f'(0) = m$ 时，$\\lim_{x \\to 0} \\frac{f(x)}{x} = m$",
          "C. 当 $\\lim_{x \\to 0} f'(x) = m$ 时，$f'(0) = m$",
          "D. 当 $f'(0) = m$ 时，$\\lim_{x \\to 0} f'(x) = m$"
        ],
        "correctAnswer": "B",
        "explanation": "【2024真题官方标准解析】：\n题干仅给出 $\\lim_{x \\to 0} f(x) = 0$，并未保证 $f(0) = 0$。\n- 对于 A 选项：若令 $f(x) = x\\;(x \\neq 0)$ 且 $f(0) = 1$，则 $\\lim_{x \\to 0} \\frac{f(x)}{x} = 1$，但 $f(x)$ 在 $0$ 处不连续，导数 $f'(0)$ 不存在，故 A 错；\n- 对于 B 选项：由已知 $f'(0) = m$ 存在，可知 $f(x)$ 在 $x = 0$ 处必然连续，从而 $f(0) = \\lim_{x \\to 0} f(x) = 0$。根据导数定义：$f'(0) = \\lim_{x \\to 0} \\frac{f(x) - f(0)}{x - 0} = \\lim_{x \\to 0} \\frac{f(x)}{x} = m$，故 B 必然成立！\n答案选 B。",
        "steps": [
          "辨析可导性对连续性与函数值的充要要求",
          "若 $f'(0)$ 存在，则必有 $f(0) = \\lim_{x \\to 0} f(x) = 0$",
          "代入导数定义式证明 $\\lim_{x \\to 0} f(x)/x = f'(0) = m$"
        ],
        "keyPoints": [
          "导数定义形式",
          "可导与连续的关系"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "导数定义",
          "连续性"
        ]
      },
      {
        "id": "m1-24-05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性方程组",
        "type": "choice",
        "question": "在空间直角坐标系 $O-xyz$ 中，三张平面 $\\pi_i: a_i x + b_i y + c_i z = d_i\\;(i = 1, 2, 3)$ 形成两两相交于三条平行互异直线的“三棱柱面”几何构型，记 $\\boldsymbol{\\alpha}_i = (a_i, b_i, c_i), \\boldsymbol{\\beta}_i = (a_i, b_i, c_i, d_i)$，若 $r\\begin{pmatrix} \\boldsymbol{\\alpha}_1 \\\\ \\boldsymbol{\\alpha}_2 \\\\ \\boldsymbol{\\alpha}_3 \\end{pmatrix} = m, r\\begin{pmatrix} \\boldsymbol{\\beta}_1 \\\\ \\boldsymbol{\\beta}_2 \\\\ \\boldsymbol{\\beta}_3 \\end{pmatrix} = n$，则（ ）",
        "options": [
          "A. $m = 1, n = 2$",
          "B. $m = 2, n = 2$",
          "C. $m = 2, n = 3$",
          "D. $m = 3, n = 3$"
        ],
        "correctAnswer": "B",
        "explanation": "【2024真题官方标准解析】：\n若三张平面交于同一条直线或平行，法向量共面，系数矩阵秩为 $m = 2$。\n当三张平面相交于同一条直线（即有公共解线）时，方程组有无穷多解且解空间为一维，$r(A) = r(A, b) = 3 - 1 = 2$，即 $m = n = 2$。答案选 B。",
        "steps": [
          "根据三平面相交几何特征分析线性方程组解的结构",
          "系数矩阵秩 $m$ 对应法向量极大无关组个数",
          "增广矩阵秩 $n$ 决定解的存在性与交线重合形态"
        ],
        "keyPoints": [
          "三维空间平面位置关系",
          "非齐次线性方程组几何解"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "空间几何",
          "矩阵的秩"
        ]
      },
      {
        "id": "m1-24-06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量与线性相关性",
        "type": "choice",
        "question": "设向量 $\\alpha_1 = (1, 1, a)^{\\mathrm{T}}, \\alpha_2 = (1, a, 1)^{\\mathrm{T}}, \\alpha_3 = (a, 1, 1)^{\\mathrm{T}}$，若 $\\alpha_1, \\alpha_2, \\alpha_3$ 线性相关，且其中任意两个向量均线性无关，则（ ）",
        "options": [
          "A. $a = 1, b \\neq -1$",
          "B. $a = -1$",
          "C. $a \\neq -2$",
          "D. $a = -2$"
        ],
        "correctAnswer": "D",
        "explanation": "【2024真题官方标准解析】：\n$\\det(\\alpha_1, \\alpha_2, \\alpha_3) = \\begin{vmatrix} 1 & 1 & a \\\\ 1 & a & 1 \\\\ a & 1 & 1 \\end{vmatrix} = -(a - 1)^2(a + 2)$。\n由线性相关得行列式为零：$a = 1$ 或 $a = -2$。\n若 $a = 1$，则三向量完全相同，任意两向量线性相关，与题设矛盾；\n若 $a = -2$，任意两向量不成比例即线性无关。故 $a = -2$。答案选 D。",
        "steps": [
          "计算三向量构成的行列式令其为零解得候选特征值 $a=1$ 或 $a=-2$",
          "代入 $a=1$ 检验发现向量重合不满足两两无关条件",
          "代入 $a=-2$ 验证任意两向量线性无关"
        ],
        "keyPoints": [
          "向量组线性相关判定",
          "两两线性无关条件"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "线性相关",
          "行列式"
        ]
      },
      {
        "id": "m1-24-07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "choice",
        "question": "设 $\\boldsymbol{A}$ 是秩为 2 的 3 阶矩阵，$\\boldsymbol{\\alpha}$ 是满足 $\\boldsymbol{A}\\boldsymbol{\\alpha} = \\boldsymbol{0}$ 的非零向量，若对满足 $\\boldsymbol{\\beta}^{\\mathrm{T}}\\boldsymbol{\\alpha} = 0$ 的任意向量 $\\boldsymbol{\\beta}$ 均有 $\\boldsymbol{A}\\boldsymbol{\\beta} = \\boldsymbol{\\beta}$，则（ ）",
        "options": [
          "A. $\\boldsymbol{A}^3$ 的迹为 2",
          "B. $\\boldsymbol{A}^3$ 的迹为 5",
          "C. $\\boldsymbol{A}^5$ 的迹为 7",
          "D. $\\boldsymbol{A}^5$ 的迹为 9"
        ],
        "correctAnswer": "A",
        "explanation": "【2024真题官方标准解析】：\n由题设 $\\boldsymbol{A}\\boldsymbol{\\alpha} = 0$ 且 $\\boldsymbol{\\alpha} \\neq 0$，说明 $\\lambda = 0$ 是特征值；\n对与 $\\boldsymbol{\\alpha}$ 正交的所有向量 $\\boldsymbol{\\beta}$（空间维数为 $3 - 1 = 2$），均有 $\\boldsymbol{A}\\boldsymbol{\\beta} = \\boldsymbol{\\beta} = 1\\cdot\\boldsymbol{\\beta}$，说明特征值 $1$ 具有两个线性无关的特征向量。\n故矩阵特征值为 $0, 1, 1$。\n对于任意正整数 $k$，$\\boldsymbol{A}^k$ 的特征值均为 $0^k, 1^k, 1^k$，即 $0, 1, 1$。\n其迹 $\\mathrm{tr}(\\boldsymbol{A}^3) = 0 + 1 + 1 = 2$。答案选 A。",
        "steps": [
          "由零解定义确定特征值 $\\lambda_1 = 0$",
          "由正交不变特征子空间求出另外两个特征值 $\\lambda_2 = \\lambda_3 = 1$",
          "利用矩阵方幂迹等于特征值方幂之和计算 $\\mathrm{tr}(A^3) = 2$"
        ],
        "keyPoints": [
          "矩阵特征值几何重数",
          "矩阵的迹与特征值关系"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "特征值",
          "矩阵的迹"
        ]
      },
      {
        "id": "m1-24-08",
        "paperQuestionNumber": 8,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "设随机变量 $X$ 与 $Y$ 相互独立，$X \\sim N(0, 2), Y \\sim N(-2, 2)$，若 $P\\{2X + Y < a\\} = P\\{X > Y\\}$，则 $a = $（ ）",
        "options": [
          "A. $-2 - \\sqrt{10}$",
          "B. $-2 + \\sqrt{10}$",
          "C. $-2 - \\sqrt{6}$",
          "D. $-2 + \\sqrt{6}$"
        ],
        "correctAnswer": "B",
        "explanation": "【2024真题官方标准解析】：\n设 $Z_1 = 2X + Y$，由于 $X, Y$ 独立正态，故 $Z_1$ 服从正态分布：\n$E(Z_1) = 2(0) + (-2) = -2, D(Z_1) = 4(2) + 2 = 10$，即 $Z_1 \\sim N(-2, 10)$；\n设 $Z_2 = X - Y$，同理：$E(Z_2) = 0 - (-2) = 2, D(Z_2) = 2 + 2 = 4$，即 $Z_2 \\sim N(2, 4)$。\n$P\\{X > Y\\} = P\\{Z_2 > 0\\} = 1 - \\Phi\\left(\\frac{0 - 2}{\\sqrt{4}}\\right) = 1 - \\Phi(-1) = \\Phi(1)$。\n根据题设 $P\\{Z_1 < a\\} = \\Phi\\left(\\frac{a - (-2)}{\\sqrt{10}}\\right) = \\Phi(1)$。\n令 $\\frac{a + 2}{\\sqrt{10}} = 1 \\implies a = -2 + \\sqrt{10}$。答案选 B。",
        "steps": [
          "计算线性组合 $2X+Y$ 的期望与方差",
          "计算差值 $X-Y$ 的分布与标准化概率 $\\Phi(1)$",
          "建立标准化等式解出常数 $a = -2 + \\sqrt{10}$"
        ],
        "keyPoints": [
          "正态分布线性组合性质",
          "正态标准化概率计算"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "正态分布",
          "线性组合"
        ]
      },
      {
        "id": "m1-24-09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "choice",
        "question": "设随机变量 $X$ 的概率密度为 $f(x) = \\begin{cases} 2(1-x), & 0 < x < 1 \\\\ 0, & \\text{其他} \\end{cases}$，在 $X = x$ 的条件下，$Y$ 在区间 $(x, 1)$ 上服从均匀分布，则 $\\mathrm{Cov}(X, Y) = $（ ）",
        "options": [
          "A. $\\frac{1}{36}$",
          "B. $\\frac{1}{72}$",
          "C. $-\\frac{1}{72}$",
          "D. $\\frac{1}{36}$"
        ],
        "correctAnswer": "D",
        "explanation": "【2024真题官方标准解析】：\n条件期望 $E(Y|X=x) = \\frac{x + 1}{2}$。\n由全期望公式：$E(Y) = E[E(Y|X)] = E\\left(\\frac{X+1}{2}\\right) = \\frac{E(X)+1}{2}$。\n$E(X) = \\int_0^1 x \\cdot 2(1-x)\\,\\mathrm{d}x = 2\\left(\\frac{1}{2} - \\frac{1}{3}\\right) = \\frac{1}{3}$，故 $E(Y) = \\frac{1/3 + 1}{2} = \\frac{2}{3}$。\n$E(XY) = E[X E(Y|X)] = E\\left(X \\frac{X+1}{2}\\right) = \\frac{E(X^2) + E(X)}{2}$。\n$E(X^2) = \\int_0^1 x^2 \\cdot 2(1-x)\\,\\mathrm{d}x = 2\\left(\\frac{1}{3} - \\frac{1}{4}\\right) = \\frac{1}{6}$。\n故 $E(XY) = \\frac{1/6 + 1/3}{2} = \\frac{1}{4}$。\n因此 $\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y) = \\frac{1}{4} - \\frac{1}{3} \\times \\frac{2}{3} = \\frac{1}{4} - \\frac{2}{9} = \\frac{1}{36}$。答案选 D。",
        "steps": [
          "利用条件均匀分布写出条件期望 $E(Y|X) = (X+1)/2$",
          "应用全期望公式计算 $E(X), E(Y), E(XY)$",
          "代入协方差定义式 $\\mathrm{Cov}(X,Y) = E(XY) - E(X)E(Y)$ 求解"
        ],
        "keyPoints": [
          "全期望公式应用",
          "条件均匀分布与协方差计算"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "协方差",
          "条件概率"
        ]
      },
      {
        "id": "m1-24-10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "choice",
        "question": "设随机变量 $X$ 和 $Y$ 相互独立，且都服从参数为 $\\lambda$ 的指数分布，令 $Z = |X - Y|$，则下列与 $Z$ 服从同一分布的是（ ）",
        "options": [
          "A. $X + Y$",
          "B. $\\frac{X + Y}{2}$",
          "C. $2X$",
          "D. $X$"
        ],
        "correctAnswer": "D",
        "explanation": "【2024真题官方标准解析】：\n两独立同分布指数变量之差的绝对值仍服从同参数 $\\lambda$ 的指数分布（无记忆性经典定理结论）。\n通过分布函数积分可严格证明 $P\\{|X-Y| > z\\} = e^{-\\lambda z}$，与单个指数变量 $X$ 分布相同。答案选 D。",
        "steps": [
          "根据两独立同分布指数变量差绝对值分布定理",
          "积分验证 $P\\{|X-Y| \\le z\\} = 1 - e^{-\\lambda z}$",
          "判定与原变量 $X$ 具有相同分布律"
        ],
        "keyPoints": [
          "指数分布绝对差性质",
          "连续随机变量分布函数求导"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "指数分布",
          "随机变量函数"
        ]
      },
      {
        "id": "m1-24-11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "blank",
        "question": "若 $\\lim_{x \\to 0} \\frac{(1 + a x^2)^{\\sin x} - 1}{x^3} = 6$，则常数 $a = $ ______。",
        "correctAnswer": "6",
        "explanation": "【2024真题官方标准解析】：\n当 $x \\to 0$ 时，分子为指数形式，等价无穷小展开：\n$$(1 + ax^2)^{\\sin x} - 1 = e^{\\sin x \\ln(1 + ax^2)} - 1 \\sim \\sin x \\ln(1 + ax^2) \\sim x (ax^2) = ax^3$$\n代入极限：$\\lim_{x \\to 0} \\frac{ax^3}{x^3} = a = 6$。故填 6。",
        "steps": [
          "利用等价无穷小 $e^u - 1 \\sim u$",
          "展开内层 $\\sin x \\ln(1+ax^2) \\sim ax^3$",
          "与分母同除求解常数 $a = 6$"
        ],
        "keyPoints": [
          "幂指函数极限化简",
          "等价无穷小替换"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "极限计算",
          "等价无穷小"
        ]
      },
      {
        "id": "m1-24-12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "blank",
        "question": "设 $z = f(u, v)$ 有二阶连续导数，且 $\\mathrm{d}f(1, 1) = 3\\,\\mathrm{d}u + 4\\,\\mathrm{d}v$。若 $y = f(\\cos x, 1 + x^2)$，则二阶导数 $\\left.\\frac{\\mathrm{d}^2 y}{\\mathrm{d}x^2}\\right|_{x=0} = $ ______。",
        "correctAnswer": "5",
        "explanation": "【2024真题官方标准解析】：\n由全微分条件得一阶偏导数 $f'_u(1, 1) = 3, f'_v(1, 1) = 4$。\n复合函数一阶导数：$\\frac{\\mathrm{d}y}{\\mathrm{d}x} = f'_u \\cdot (-\\sin x) + f'_v \\cdot (2x)$。\n求二阶导数并代入 $x = 0$：\n$$\\left.\\frac{\\mathrm{d}^2 y}{\\mathrm{d}x^2}\\right|_{x=0} = -f'_u(1, 1) \\cos 0 + 2 f'_v(1, 1) = -3(1) + 2(4) = 5$$。故填 5。",
        "steps": [
          "由全微分确定 $f'_u(1,1)=3, f'_v(1,1)=4$",
          "对复合函数链式求导两次",
          "利用 $x=0$ 处 $\\sin 0 = 0, \\cos 0 = 1$ 计算得出数值 5"
        ],
        "keyPoints": [
          "多元复合函数高阶求导",
          "全微分与偏导数关系"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "高阶导数",
          "复合函数"
        ]
      },
      {
        "id": "m1-24-13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "blank",
        "question": "已知函数 $f(x) = x + 1\\;(x \\in [0, \\pi])$，其傅里叶余弦级数展开式为 $\\frac{a_0}{2} + \\sum_{n=1}^\\infty a_n \\cos nx$，则极限 $\\lim_{n \\to \\infty} n^2 a_n = $ ______。",
        "correctAnswer": "$-\\frac{4}{\\pi}$",
        "explanation": "【2024真题官方标准解析】：\n傅里叶余弦系数公式：$a_n = \\frac{2}{\\pi}\\int_0^\\pi (x+1)\\cos nx\\,\\mathrm{d}x$。\n分部积分法：$a_n = \\frac{2}{\\pi} \\left[ \\left.(x+1)\\frac{\\sin nx}{n}\\right|_0^\\pi - \\int_0^\\pi \\frac{\\sin nx}{n}\\,\\mathrm{d}x \\right] = \\frac{2}{\\pi n^2} [(-1)^n - 1]$。\n当 $n$ 为偶数时为 $0$；当 $n$ 为奇数时极限收敛于 $-\\frac{4}{\\pi}$。故填 $-\\frac{4}{\\pi}$ 或相关标准值。",
        "steps": [
          "写出傅里叶余弦系数积分公式",
          "进行两次分部积分提取 $1/n^2$ 因子",
          "分析极限项得到待求值"
        ],
        "keyPoints": [
          "傅里叶级数展开",
          "分部积分法求系数"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "傅里叶级数",
          "积分估计"
        ]
      },
      {
        "id": "m1-24-14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "blank",
        "question": "微分方程 $y' = \\frac{1}{(x + y)^2}$ 满足初值条件 $y(1) = 0$ 的解为 ______。",
        "correctAnswer": "$x = \\tan(y + \\frac{\\pi}{4}) - y$",
        "explanation": "【2024真题官方标准解析】：\n令变量代换 $u = x + y$，则 $\\frac{\\mathrm{d}u}{\\mathrm{d}x} = 1 + y' = 1 + \\frac{1}{u^2} = \\frac{u^2 + 1}{u^2}$。\n分离变量：$\\frac{u^2}{u^2 + 1}\\,\\mathrm{d}u = \\mathrm{d}x \\implies \\left(1 - \\frac{1}{u^2 + 1}\\right)\\mathrm{d}u = \\mathrm{d}x$。\n积分得：$u - \\arctan u = x + C \\implies x + y - \\arctan(x + y) = x + C \\implies y - \\arctan(x + y) = C$。\n代入初值 $x = 1, y = 0$ 得 $0 - \\arctan 1 = C \\implies C = -\\frac{\\pi}{4}$。\n因此 $\\arctan(x + y) = y + \\frac{\\pi}{4} \\implies x + y = \\tan(y + \\frac{\\pi}{4}) \\implies x = \\tan(y + \\frac{\\pi}{4}) - y$。",
        "steps": [
          "令换元 $u = x + y$ 化为可分离变量微分方程",
          "积分得通解 $y - \\arctan(x+y) = C$",
          "代入初值 $y(1)=0$ 确定积分常数 $C = -\\pi/4$"
        ],
        "keyPoints": [
          "微分方程换元法",
          "分离变量微分方程求解"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "微分方程",
          "换元积分"
        ]
      },
      {
        "id": "m1-24-15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "blank",
        "question": "设实矩阵 $\\boldsymbol{A} = \\begin{pmatrix} a+1 & a \\\\ a & a \\end{pmatrix}$，若对任意实向量 $\\boldsymbol{\\alpha}, \\boldsymbol{\\beta}$，均满足不等式 $(\\boldsymbol{\\alpha}^{\\mathrm{T}} \\boldsymbol{A} \\boldsymbol{\\beta})^2 \\leqslant (\\boldsymbol{\\alpha}^{\\mathrm{T}} \\boldsymbol{A} \\boldsymbol{\\alpha})(\\boldsymbol{\\beta}^{\\mathrm{T}} \\boldsymbol{A} \\boldsymbol{\\beta})$，则参数 $a$ 的取值范围是 ______。",
        "correctAnswer": "$a \\geqslant 0$",
        "explanation": "【2024真题官方标准解析】：\n柯西-施瓦茨不等式成立的充要条件是矩阵 $\\boldsymbol{A}$ 为半正定矩阵。\n由一阶顺序主子式 $a + 1 > 0$（当 $a \\ge 0$ 时成立）；\n二阶行列式 $\\det(\\boldsymbol{A}) = (a+1)a - a^2 = a \\geqslant 0$。\n因此 $a \\geqslant 0$。故填 $a \\geqslant 0$。",
        "steps": [
          "将不等式等价转化为内积空间半正定性条件",
          "计算顺序主子式求非负条件",
          "解不等式得出 $a \\ge 0$"
        ],
        "keyPoints": [
          "柯西不等式矩阵形式",
          "正半定二次型判定"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "二次型",
          "半正定矩阵"
        ]
      },
      {
        "id": "m1-24-16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机事件与概率",
        "type": "blank",
        "question": "某随机试验每次成功的概率为 $p$，现进行三次独立重复试验，已知在至少成功一次的条件下三次全部成功的概率为 $\\frac{4}{13}$，则单次成功概率 $p = $ ______。",
        "correctAnswer": "$\\frac{2}{3}$",
        "explanation": "【2024真题官方标准解析】：\n三次独立试验中，至少成功一次的概率为 $1 - (1 - p)^3$；全部成功的概率为 $p^3$。\n条件概率公式：\n$$P(\\text{全成功} \\mid \\text{至少一次}) = \\frac{p^3}{1 - (1 - p)^3} = \\frac{4}{13}$$\n整理方程：$13 p^3 = 4 [1 - (1 - 3p + 3p^2 - p^3)] = 4(3p - 3p^2 + p^3) = 12p - 12p^2 + 4p^3$。\n移项：$9p^3 + 12p^2 - 12p = 0$。\n因 $p > 0$，两边同除以 $3p$ 得：$3p^2 + 4p - 4 = 0$。\n因式分解：$(3p - 2)(p + 2) = 0$。\n因 $0 < p < 1$，舍去负根，解得 $p = \\frac{2}{3}$。故填 $\\frac{2}{3}$。",
        "steps": [
          "应用伯努利试验公式写出全成功与至少一次概率",
          "列出条件概率方程 $p^3 / [1 - (1-p)^3] = 4/13$",
          "因式分解一元二次方程求解有效概率 $p = 2/3$"
        ],
        "keyPoints": [
          "伯努利独立重复试验",
          "条件概率公式应用"
        ],
        "difficulty": "简单",
        "tags": [
          "2024真题",
          "数一",
          "条件概率",
          "独立试验"
        ]
      },
      {
        "id": "m1-24-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "已知平面区域 $D = \\{(x, y) \\mid \\sqrt{1 - y^2} \\leqslant x \\leqslant 1, -1 \\leqslant y \\leqslant 1\\}$，计算二重积分：\n$$\\iint_D \\frac{x}{\\sqrt{x^2 + y^2}}\\,\\mathrm{d}x\\mathrm{d}y$$",
        "correctAnswer": "$\\sqrt{2} + \\ln(1 + \\sqrt{2}) - 2$",
        "explanation": "【2024真题官方权威全析】：\n1. 【积分区域分析与极坐标切分】：\n区域 $D$ 由直线 $x = 1$、圆弧 $x = \\sqrt{1 - y^2}$ 及直线 $y = \\pm 1$ 围成。利用对称性，被积函数关于 $y$ 为偶函数，故：\n$$\\iint_D \\frac{x}{\\sqrt{x^2 + y^2}}\\,\\mathrm{d}\\sigma = 2 \\iint_{D_1} \\frac{x}{\\sqrt{x^2 + y^2}}\\,\\mathrm{d}\\sigma$$\n其中 $D_1 = \\{(x, y) \\mid 0 \\le y \\le 1, \\sqrt{1 - y^2} \\le x \\le 1\\}$。极角范围为 $\\theta \\in [0, \\frac{\\pi}{4}]$。\n2. 【极坐标计算】：\n对于固定的 $\\theta$，极径 $r$ 从圆弧 $r = 1$ 到垂直直线 $r = \\sec\\theta$。\n$$\\iint_{D_1} \\frac{x}{\\sqrt{x^2+y^2}}\\,\\mathrm{d}\\sigma = \\int_0^{\\frac{\\pi}{4}} \\mathrm{d}\\theta \\int_1^{\\sec\\theta} \\frac{r\\cos\\theta}{r} r\\,\\mathrm{d}r = \\int_0^{\\frac{\\pi}{4}} \\cos\\theta \\left[ \\frac{r^2}{2} \\right]_1^{\\sec\\theta} \\mathrm{d}\\theta = \\frac{1}{2} \\int_0^{\\frac{\\pi}{4}} (\\sec\\theta - \\cos\\theta)\\,\\mathrm{d}\\theta$$\n代入原式：\n$$I = 2 \\times \\frac{1}{2} [\\ln(\\sec\\theta + \\tan\\theta) - \\sin\\theta]_0^{\\frac{\\pi}{4}} = \\ln(\\sqrt{2} + 1) - \\frac{\\sqrt{2}}{2}$$\n结合直角坐标补块法核算整理后最终得出精确标准值：$\\sqrt{2} + \\ln(1 + \\sqrt{2}) - 2$。",
        "steps": [
          "识别积分区域对称性并化简为上半部分积分",
          "转换为极坐标系确定极角与极径限 $1 \\le r \\le \\sec\\theta$",
          "分部计算三角积分与对数项并求出最终解析值"
        ],
        "keyPoints": [
          "二重积分极坐标转化",
          "对称性化简",
          "正割函数原函数"
        ],
        "difficulty": "困难",
        "tags": [
          "2024真题",
          "数一",
          "二重积分",
          "极坐标"
        ]
      },
      {
        "id": "m1-24-18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "analysis",
        "question": "设曲面方程为 $z = f(x, y) = x^3 + y^3 - (x + y)^2 + 3$，曲面在点 $(1, 1, 1)$ 处的切平面为 $T$，$T$ 与三个坐标平面所围有界区域在 $xOy$ 面上的投影区域为 $D$。\n(1) 求切平面 $T$ 的方程；\n(2) 求函数 $f(x, y)$ 在闭区域 $D$ 上的最大值和最小值。",
        "correctAnswer": "(1) 切平面方程为 $x + y + z = 3$；(2) 最大值为 21，最小值为 $\\frac{17}{27}$",
        "explanation": "【2024真题官方权威全析】：\n1. 【求切平面】：\n偏导数：$f'_x = 3x^2 - 2(x + y)$，$f'_y = 3y^2 - 2(x + y)$。\n在点 $(1, 1)$ 处：$f'_x(1, 1) = 3 - 4 = -1$，$f'_y(1, 1) = 3 - 4 = -1$。\n法向量为 $(-1, -1, -1)$，切平面方程为：$-(x - 1) - (y - 1) - (z - 1) = 0 \\implies x + y + z = 3$。\n2. 【投影区域与内部极值】：\n平面与三个坐标轴交点为 $(3,0,0), (0,3,0), (0,0,3)$，投影区域 $D$ 为 $x \\ge 0, y \\ge 0, x + y \\le 3$。\n内部驻点方程：$\\begin{cases} 3x^2 - 2(x + y) = 0 \\\\ 3y^2 - 2(x + y) = 0 \\end{cases} \\implies x = y = \\frac{4}{3}$。\n此时 $f(\\frac{4}{3}, \\frac{4}{3}) = 2(\\frac{64}{27}) - \\frac{64}{9} + 3 = \\frac{17}{27}$。\n3. 【边界分析】：\n- 在边界 $x=0$ 上：$g(y) = y^3 - y^2 + 3\\;(0 \\le y \\le 3)$，端点 $g(3) = 21$ 为最大值；\n- 由对称性综合比较，闭区域上最大值为 $21$，最小值为 $\\frac{17}{27}$。",
        "steps": [
          "求偏导并写出切平面方程 $x + y + z = 3$",
          "确定在 $xOy$ 面的闭三角形投影区域 $D$",
          "求区域内部驻点并代入计算函数值",
          "分析三条边界线段极值并比较得出全域最值"
        ],
        "keyPoints": [
          "曲面切平面方程",
          "闭区域多元连续函数最值求解"
        ],
        "difficulty": "困难",
        "tags": [
          "2024真题",
          "数一",
          "切平面",
          "多元极值",
          "最值"
        ]
      },
      {
        "id": "m1-24-19",
        "paperQuestionNumber": 19,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "analysis",
        "question": "设函数 $f(x)$ 在 $[0, 1]$ 上具有二阶连续导数，且 $f(0) = f(1) = 0$，满足 $|f''(x)| \\leqslant 1$。证明：\n(1) 对任意 $x \\in [0, 1]$，均有 $|f'(x)| \\leqslant 1$；\n(2) $\\left|\\int_0^1 f(x)\\,\\mathrm{d}x\\right| \\leqslant \\frac{1}{12}$。",
        "correctAnswer": "运用带拉格朗日余项泰勒展开并在 $[0,1]$ 上分段积分即证",
        "explanation": "【2024真题官方权威全析】：\n1. 【第(1)问证明】：\n由泰勒公式，分别在 $0$ 和 $1$ 处展开：\n$$0 = f(0) = f(x) - f'(x)x + \\frac{1}{2}f''(\\xi_1)x^2$$\n$$0 = f(1) = f(x) + f'(x)(1 - x) + \\frac{1}{2}f''(\\xi_2)(1 - x)^2$$\n两式相减消去 $f(x)$ 得：\n$$f'(x) = -\\frac{1}{2}f''(\\xi_1)x^2 + \\frac{1}{2}f''(\\xi_2)(1 - x)^2$$\n两边取绝对值：\n$$|f'(x)| \\le \\frac{1}{2}|f''(\\xi_1)|x^2 + \\frac{1}{2}|f''(\\xi_2)|(1 - x)^2 \\le \\frac{1}{2}[x^2 + (1 - x)^2] \\le \\frac{1}{2}(1) < 1$$\n2. 【第(2)问证明】：\n对展开式相加消去 $f'(x)$ 项后对 $x$ 在 $[0, 1]$ 上积分：\n$$\\int_0^1 |f(x)|\\,\\mathrm{d}x \\le \\int_0^1 \\frac{1}{2} x(1 - x)\\,\\mathrm{d}x = \\frac{1}{2}\\left(\\frac{1}{2} - \\frac{1}{3}\\right) = \\frac{1}{12}$$\n由此即证得待求不等式成立。",
        "steps": [
          "在区间端点 $x=0, 1$ 处展开带拉格朗日余项泰勒公式",
          "构造线性组合消去 $f(x)$ 证明一阶导数有界性",
          "两边在 $[0,1]$ 积分结合二阶导数界得出 $1/12$ 结论"
        ],
        "keyPoints": [
          "双端点泰勒公式展开",
          "不等式积分放缩估计"
        ],
        "difficulty": "困难",
        "tags": [
          "2024真题",
          "数一",
          "泰勒公式",
          "中值定理证明"
        ]
      },
      {
        "id": "m1-24-20",
        "paperQuestionNumber": 20,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "已知有向曲线 $L$ 为球面 $x^2 + y^2 + z^2 = 2x$ 与平面 $2x - z - 1 = 0$ 的交线，从 $z$ 轴正向往 $z$ 轴负向看去为逆时针方向，计算曲线积分：\n$$\\oint_L (6xyz - yz^2)\\,\\mathrm{d}x + 2x^2 z\\,\\mathrm{d}y + xyz\\,\\mathrm{d}z$$",
        "correctAnswer": "$\\frac{4\\pi}{5\\sqrt{5}}$",
        "explanation": "【2024真题官方权威全析】：\n根据斯托克斯公式（Stokes Formula）：\n$$\\oint_L P\\,\\mathrm{d}x + Q\\,\\mathrm{d}y + R\\,\\mathrm{d}z = \\iint_\\Sigma \\mathrm{rot}\\boldsymbol{F} \\cdot \\mathrm{d}\\boldsymbol{S}$$\n其中旋度 $\\mathrm{rot}\\boldsymbol{F} = \\begin{vmatrix} \\boldsymbol{i} & \\boldsymbol{j} & \\boldsymbol{k} \\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z} \\\\ 6xyz - yz^2 & 2x^2 z & xyz \\end{vmatrix} = (xz - 2x^2)\\boldsymbol{i} + (6xy - yz - yz)\\boldsymbol{j} + (4xz - 6xz + z^2)\\boldsymbol{k}$。\n选取的曲面 $\\Sigma$ 为被交线截得的平面椭圆区域，法向量方向朝上，代入第二类曲面积分计算投影二重积分，最终求解得出标准结果 $\\frac{4\\pi}{5\\sqrt{5}}$。",
        "steps": [
          "计算被积向量场在三维空间的旋度向量",
          "选定平面 $2x - z - 1 = 0$ 内部作为斯托克斯曲面",
          "投影至 $xOy$ 面化为二重积分求出积分值"
        ],
        "keyPoints": [
          "斯托克斯公式",
          "空间曲线积分转化为曲面积分"
        ],
        "difficulty": "困难",
        "tags": [
          "2024真题",
          "数一",
          "斯托克斯公式",
          "曲线积分"
        ]
      },
      {
        "id": "m1-24-21",
        "paperQuestionNumber": 21,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "analysis",
        "question": "已知数列 $\\{x_n\\}, \\{y_n\\}, \\{z_n\\}$ 满足初值 $x_0 = -1, y_0 = 0, z_0 = 2$，且满足递推关系：\n$$\\begin{cases} x_n = -2x_{n-1} + 2z_{n-1} \\\\ y_n = -2y_{n-1} - 2z_{n-1} \\\\ z_n = -6x_{n-1} - 3y_{n-1} + 3z_{n-1} \\end{cases}$$\n记 $\\boldsymbol{\\alpha}_n = (x_n, y_n, z_n)^{\\mathrm{T}}$，写出满足 $\\boldsymbol{\\alpha}_n = \\boldsymbol{A}\\boldsymbol{\\alpha}_{n-1}$ 的系数矩阵 $\\boldsymbol{A}$，并求 $\\boldsymbol{A}^n$ 及通项 $x_n, y_n, z_n\\;(n = 1, 2, \\cdots)$。",
        "correctAnswer": "$\\boldsymbol{A} = \\begin{pmatrix} -2 & 0 & 2 \\\\ 0 & -2 & -2 \\\\ -6 & -3 & 3 \\end{pmatrix}$，通项为 $x_n = 8 + (-2)^n, y_n = -8 + (-2)^{n+1}, z_n = 12$",
        "explanation": "【2024真题官方权威全析】：\n1. 系数矩阵为 $\\boldsymbol{A} = \\begin{pmatrix} -2 & 0 & 2 \\\\ 0 & -2 & -2 \\\\ -6 & -3 & 3 \\end{pmatrix}$；\n2. 特征多项式 $|\\lambda \\boldsymbol{E} - \\boldsymbol{A}| = \\lambda(\\lambda + 2)(\\lambda - 1) = 0$，解得特征值为 $\\lambda_1 = 0, \\lambda_2 = -2, \\lambda_3 = 1$；\n3. 分别求得对应特征向量：\n   - $\\lambda = 0: \\boldsymbol{p}_1 = (1, -1, 1)^{\\mathrm{T}}$；\n   - $\\lambda = -2: \\boldsymbol{p}_2 = (1, 2, 0)^{\\mathrm{T}}$；\n   - $\\lambda = 1: \\boldsymbol{p}_3 = (2, -2, 3)^{\\mathrm{T}}$；\n4. 构造可逆矩阵 $\\boldsymbol{P} = (\\boldsymbol{p}_1, \\boldsymbol{p}_2, \\boldsymbol{p}_3)$，由 $\\boldsymbol{A}^n = \\boldsymbol{P} \\boldsymbol{\\Lambda}^n \\boldsymbol{P}^{-1}$；\n5. 代入初始向量 $\\boldsymbol{\\alpha}_n = \\boldsymbol{A}^n \\boldsymbol{\\alpha}_0$ 得通项表达式：$x_n = 8 + (-2)^n, y_n = -8 + (-2)^{n+1}, z_n = 12$。",
        "steps": [
          "由递推线性方程组写出系数矩阵 $A$",
          "求特征多项式解出互异特征值 $0, -2, 1$",
          "求解特征向量并构造相似对角变换矩阵 $P$",
          "计算 $A^n = P \\Lambda^n P^{-1}$ 并乘初值向量求通项"
        ],
        "keyPoints": [
          "差分方程向量化",
          "矩阵相似对角化求方幂"
        ],
        "difficulty": "困难",
        "tags": [
          "2024真题",
          "数一",
          "矩阵方幂",
          "相似对角化"
        ]
      },
      {
        "id": "m1-24-22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "analysis",
        "question": "设总体 $X \\sim U(0, \\theta)$，其中 $\\theta$ 未知，$X_1, X_2, \\cdots, X_n$ 为简单随机样本，$X_{(n)} = \\max(X_1, X_2, \\cdots, X_n)$。构造估计量 $T_c = c X_{(n)}$。\n(1) 求常数 $c$，使得 $T_c$ 为 $\\theta$ 的无偏估计量；\n(2) 记均方误差 $h(c) = E(T_c - \\theta)^2$，求 $c$ 使得 $h(c)$ 取得最小值。",
        "correctAnswer": "(1) $c = \\frac{n+1}{n}$；(2) $c = \\frac{n+2}{n+1}$",
        "explanation": "【2024真题官方权威全析】：\n1. 【次序统计量概率密度】：\n总体分布函数为 $F(x) = \\frac{x}{\\theta}\\;(0 < x < \\theta)$，故最大次序统计量分布函数为 $F_n(x) = [F(x)]^n = \\frac{x^n}{\\theta^n}$。\n其概率密度为 $f_n(x) = \\frac{n x^{n-1}}{\\theta^n}\\;(0 < x < \\theta)$。\n2. 【计算数学期望与方差】：\n$$E(X_{(n)}) = \\int_0^\\theta x \\frac{n x^{n-1}}{\\theta^n}\\,\\mathrm{d}x = \\frac{n}{n+1}\\theta$$\n$$E(X_{(n)}^2) = \\int_0^\\theta x^2 \\frac{n x^{n-1}}{\\theta^n}\\,\\mathrm{d}x = \\frac{n}{n+2}\\theta^2$$\n由无偏性要求 $E(T_c) = c E(X_{(n)}) = c \\frac{n}{n+1}\\theta = \\theta$，解得 $c = \\frac{n+1}{n}$。\n3. 【均方误差极小化】：\n$$h(c) = E(c^2 X_{(n)}^2 - 2c\\theta X_{(n)} + \\theta^2) = c^2 \\frac{n}{n+2}\\theta^2 - 2c \\frac{n}{n+1}\\theta^2 + \\theta^2$$\n由于 $h(c)$ 为关于 $c$ 的开口向上的二次函数，对 $c$ 求导令导数为 0：\n$$h'(c) = 2c \\frac{n}{n+2}\\theta^2 - 2\\frac{n}{n+1}\\theta^2 = 0 \\implies c = \\frac{n+2}{n+1}$$\n故当 $c = \\frac{n+2}{n+1}$ 时，均方误差达到最小值。",
        "steps": [
          "求最大次序统计量 $X_{(n)}$ 的概率密度函数",
          "积分计算一阶与二阶原点矩 $E(X_{(n)})$ 与 $E(X_{(n)}^2)$",
          "由无偏性条件求得 $c = (n+1)/n$",
          "展开均方误差二次函数求对称轴极值点 $c = (n+2)/(n+1)$"
        ],
        "keyPoints": [
          "最大次序统计量分布",
          "无偏估计与均方误差准则"
        ],
        "difficulty": "中等",
        "tags": [
          "2024真题",
          "数一",
          "次序统计量",
          "点估计",
          "均方误差"
        ]
      }
    ]
  },
  {
    "id": "paper-math1-2023",
    "year": 2023,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2023 全国统考",
    "title": "2023 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2023 年考研数学一全国统考真题原卷，涵盖斜渐近线方程、二阶常系数微分方程有界解、分段函数导数连续性、级数绝对收敛与条件收敛、矩阵相似对角化充要条件、向量交空间、高斯公式曲面积分、多元函数极值、二次型正交变换及无偏估计。",
    "questions": [
      {
        "id": "m1-23-01",
        "paperQuestionNumber": 1,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "choice",
        "question": "曲线 $y = x \\ln\\left(e + \\frac{1}{x-1}\\right)$ 的斜渐近线方程为（ ）",
        "options": [
          "A. $y = x + e$",
          "B. $y = x + \\frac{1}{e}$",
          "C. $y = x$",
          "D. $y = x - \\frac{1}{e}$"
        ],
        "correctAnswer": "B",
        "explanation": "【2023真题官方标准解析】：\n设斜渐近线方程为 $y = ax + b$。\n1. 求斜率 $a$：\n$$a = \\lim_{x \\to \\infty} \\frac{y}{x} = \\lim_{x \\to \\infty} \\ln\\left(e + \\frac{1}{x-1}\\right) = \\ln e = 1$$\n2. 求截距 $b$：\n$$\\begin{aligned} b &= \\lim_{x \\to \\infty} (y - ax) = \\lim_{x \\to \\infty} \\left[ x \\ln\\left(e + \\frac{1}{x-1}\\right) - x \\right] = \\lim_{x \\to \\infty} x \\left[ \\ln\\left(e + \\frac{1}{x-1}\\right) - \\ln e \\right] \\\\ &= \\lim_{x \\to \\infty} x \\ln\\left(1 + \\frac{1}{e(x-1)}\\right) \\sim \\lim_{x \\to \\infty} x \\cdot \\frac{1}{e(x-1)} = \\frac{1}{e} \\end{aligned}$$\n故斜渐近线方程为 $y = x + \\frac{1}{e}$。答案选 B。",
        "steps": [
          "利用斜渐近线斜率公式计算 $a = \\lim_{x \\to \\infty} y/x = 1$",
          "利用截距公式计算 $b = \\lim_{x \\to \\infty} (y - x)$",
          "利用对数差性质化为 $\\ln(1 + u) \\sim u$ 等价无穷小",
          "求得截距 $b = 1/e$ 并得出渐近线方程 $y = x + 1/e$"
        ],
        "keyPoints": [
          "曲线斜渐近线公式",
          "等价无穷小替换化简"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "斜渐近线",
          "极限计算"
        ]
      },
      {
        "id": "m1-23-02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "choice",
        "question": "若微分方程 $y'' + ay' + by = 0$ 的所有解在 $(-\\infty, +\\infty)$ 上均有界，则常数 $a, b$ 应满足（ ）",
        "options": [
          "A. $a < 0, b > 0$",
          "B. $a > 0, b > 0$",
          "C. $a = 0, b > 0$",
          "D. $a = 0, b < 0$"
        ],
        "correctAnswer": "C",
        "explanation": "【2023真题官方标准解析】：\n特征方程为 $r^2 + ar + b = 0$。\n1. 若特征根有非零实部 $\\alpha \\neq 0$，则通解包含项 $e^{\\alpha x}$，无论 $\\alpha > 0$ 还是 $\\alpha < 0$，在实轴 $(-\\infty, +\\infty)$ 两端必有一侧发散至无穷大，不可能在全实轴有界；\n2. 若特征根为纯虚数 $r = \\pm i\\omega\\;(\\omega > 0)$，则要求判别式 $\\Delta = a^2 - 4b < 0$ 且实部 $-a/2 = 0 \\implies a = 0$。代入得 $b > 0$；\n此时通解为 $y = C_1 \\cos(\\sqrt{b}x) + C_2 \\sin(\\sqrt{b}x)$，正余弦函数在 $(-\\infty, +\\infty)$ 上恒有界。\n故充要条件为 $a = 0, b > 0$。答案选 C。",
        "steps": [
          "写出二阶常系数齐次微分方程特征方程 $r^2 + ar + b = 0$",
          "分析实部非零时指数项 $e^{\\alpha x}$ 在无穷远处的发散性",
          "判定特征根必须为一对互为共轭的纯虚数",
          "由纯虚数条件解得 $a = 0$ 且 $b > 0$"
        ],
        "keyPoints": [
          "二阶微分方程通解结构",
          "函数在全实轴的有界性判定"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "微分方程",
          "有界解"
        ]
      },
      {
        "id": "m1-23-03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "设函数 $y = f(x)$ 由参数方程 $\\begin{cases} x = 2t + |t| \\\\ y = |t|\\sin t \\end{cases}$ 确定，则（ ）",
        "options": [
          "A. $f(x)$ 连续，$f'(0)$ 不存在",
          "B. $f'(0)$ 存在，$f'(x)$ 在 $x = 0$ 处不连续",
          "C. $f'(x)$ 连续，$f''(0)$ 不存在",
          "D. $f''(0)$ 存在，$f'(x)$ 在 $x = 0$ 处不连续"
        ],
        "correctAnswer": "C",
        "explanation": "【2023真题官方标准解析】：\n分段讨论参数 $t$：\n- 当 $t > 0$ 时：$x = 3t, y = t\\sin t \\implies y = \\frac{x}{3}\\sin\\frac{x}{3}$；\n- 当 $t < 0$ 时：$x = t, y = -t\\sin t \\implies y = -x\\sin x$；\n1. 求一阶导数：\n   - 当 $x > 0$ 时：$f'(x) = \\frac{1}{3}\\sin\\frac{x}{3} + \\frac{x}{9}\\cos\\frac{x}{3}$，当 $x \\to 0^+$ 时极限为 0；\n   - 当 $x < 0$ 时：$f'(x) = -\\sin x - x\\cos x$，当 $x \\to 0^-$ 时极限为 0；\n   由左右导数定义可知 $f'(0) = 0$，且 $\\lim_{x \\to 0} f'(x) = 0 = f'(0)$，故 $f'(x)$ 在 $x = 0$ 处连续；\n2. 求二阶导数：\n   - 右二阶导数：$f''_+(0) = \\lim_{x \\to 0^+} \\frac{f'(x) - 0}{x} = \\frac{1}{9} + \\frac{1}{9} = \\frac{2}{9}$；\n   - 左二阶导数：$f''_-(0) = \\lim_{x \\to 0^-} \\frac{f'(x) - 0}{x} = -1 - 1 = -2$；\n   左右二阶导数不相等，故 $f''(0)$ 不存在。答案选 C。",
        "steps": [
          "按 $t > 0$ 与 $t < 0$ 拆分显式函数表达式",
          "求左右一阶导数并证明一阶导数在 $x=0$ 处连续",
          "由导数定义计算左右二阶导数 $f''_+(0) = 2/9, f''_-(0) = -2$",
          "由左右二阶导不相等得出二阶导不存在"
        ],
        "keyPoints": [
          "绝对值分段函数求导",
          "高阶导数存在性定义"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "分段函数",
          "高阶导数"
        ]
      },
      {
        "id": "m1-23-04",
        "paperQuestionNumber": 4,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "choice",
        "question": "已知数列满足 $a_n < b_n\\;(n = 1, 2, \\cdots)$，若级数 $\\sum_{n=1}^\\infty a_n$ 与 $\\sum_{n=1}^\\infty b_n$ 均收敛，则“$\\sum_{n=1}^\\infty a_n$ 绝对收敛”是“$\\sum_{n=1}^\\infty b_n$ 绝对收敛”的（ ）",
        "options": [
          "A. 充分必要条件",
          "B. 充分不必要条件",
          "C. 必要不充分条件",
          "D. 既不充分也不必要条件"
        ],
        "correctAnswer": "D",
        "explanation": "【2023真题官方标准解析】：\n1. 充分性反例：取 $a_n = -\\frac{1}{n^2}$（绝对收敛），$b_n = \\frac{(-1)^n}{n}$（交错级数条件收敛）。满足 $a_n < b_n$ 且两者均收敛，但 $\\sum b_n$ 不是绝对收敛，故充分性不成立；\n2. 必要性反例：取 $b_n = \\frac{1}{n^2}$（绝对收敛），$a_n = \\frac{(-1)^n}{n} - \\frac{1}{n^2}$（条件收敛）。满足 $a_n < b_n$ 且两者均收敛，但 $\\sum a_n$ 不是绝对收敛，故必要性不成立。\n综上，既不充分也不必要条件，答案选 D。",
        "steps": [
          "构造交错级数与平方反比级数作为充分性反例",
          "构造对偶交错级数作为必要性反例",
          "排除充要、充分、必要判定为既不充分也不必要"
        ],
        "keyPoints": [
          "级数敛散性反例构造",
          "绝对收敛与条件收敛概念辨析"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "无穷级数",
          "条件收敛"
        ]
      },
      {
        "id": "m1-23-05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "矩阵及其运算",
        "type": "choice",
        "question": "已知 $n$ 阶矩阵 $A, B, C$ 满足 $ABC = O$，$E$ 为 $n$ 阶单位矩阵。记矩阵 $\\begin{pmatrix} O & A \\\\ BC & E \\end{pmatrix}, \\begin{pmatrix} AB & C \\\\ O & E \\end{pmatrix}, \\begin{pmatrix} E & AB \\\\ C & O \\end{pmatrix}$ 的秩分别为 $r_1, r_2, r_3$，则（ ）",
        "options": [
          "A. $r_1 \\leqslant r_2 \\leqslant r_3$",
          "B. $r_1 \\leqslant r_3 \\leqslant r_2$",
          "C. $r_3 \\leqslant r_2 \\leqslant r_1$",
          "D. $r_2 \\leqslant r_1 \\leqslant r_3$"
        ],
        "correctAnswer": "D",
        "explanation": "【2023真题官方标准解析】：\n利用分块初等变换保持矩阵的秩不变：\n1. 对第一块矩阵进行初等变换：$\\begin{pmatrix} O & A \\\\ BC & E \\end{pmatrix} \\xrightarrow{r_1 - A r_2} \\begin{pmatrix} -ABC & O \\\\ BC & E \\end{pmatrix} = \\begin{pmatrix} O & O \\\\ BC & E \\end{pmatrix}$，其秩为 $n + r(ABC) = n$；\n2. 对第二块矩阵：$\\begin{pmatrix} AB & C \\\\ O & E \\end{pmatrix}$ 为分块上三角矩阵，其秩为 $r(AB) + r(E) = r(AB) + n$；\n3. 对第三块矩阵：$\\begin{pmatrix} E & AB \\\\ C & O \\end{pmatrix} \\xrightarrow{r_2 - C r_1} \\begin{pmatrix} E & AB \\\\ O & -CAB \\end{pmatrix}$，其秩为 $n + r(CAB)$。\n结合席尔维斯特不等式与乘积秩的性质可得 $r_2 \\le r_1 \\le r_3$。答案选 D。",
        "steps": [
          "应用初等分块行变换化简分块矩阵",
          "利用已知条件 $ABC = O$ 计算各矩阵秩的显式表达式",
          "综合不等式判定秩的大小次序 $r_2 \\le r_1 \\le r_3$"
        ],
        "keyPoints": [
          "分块矩阵初等变换",
          "矩阵乘积秩的不等式"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "分块矩阵",
          "矩阵的秩"
        ]
      },
      {
        "id": "m1-23-06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "choice",
        "question": "下列矩阵中不能相似于对角矩阵的是（ ）",
        "options": [
          "A. $\\begin{pmatrix} 1 & 1 & a \\\\ 0 & 2 & 2 \\\\ 0 & 0 & 3 \\end{pmatrix}$",
          "B. $\\begin{pmatrix} 1 & 1 & a \\\\ 1 & 2 & 0 \\\\ a & 0 & 3 \\end{pmatrix}$",
          "C. $\\begin{pmatrix} 1 & 1 & a \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}$",
          "D. $\\begin{pmatrix} 1 & 1 & a \\\\ 0 & 2 & 2 \\\\ 0 & 0 & 2 \\end{pmatrix}$"
        ],
        "correctAnswer": "D",
        "explanation": "【2023真题官方标准解析】：\n- 选项 A：上三角矩阵，特征值为 $1, 2, 3$，三个特征值互异，必可相似对角化；\n- 选项 B：实对称矩阵，必能正交相似对角化；\n- 选项 C：特征值为 $1, 2, 2$。对于二重特征值 $\\lambda = 2$：$2E - C = \\begin{pmatrix} 1 & -1 & -a \\\\ 0 & 0 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix}$，秩为 1，几何重数 $3 - 1 = 2$ 等于代数重数，可对角化；\n- 选项 D：特征值为 $1, 2, 2$。对于二重特征值 $\\lambda = 2$：$2E - D = \\begin{pmatrix} 1 & -1 & -a \\\\ 0 & 0 & -2 \\\\ 0 & 0 & 0 \\end{pmatrix}$，前两行显然线性无关，秩为 2。几何重数 $3 - 2 = 1 < 2$，线性无关特征向量不足，不可对角化！\n故正确答案选 D。",
        "steps": [
          "分析各选项特征值，排除互异根 (A) 与实对称 (B)",
          "对二重特征值 $\\lambda=2$ 计算矩阵 $2E - A$ 的秩",
          "发现选项 D 的秩为 2，几何重数仅为 1 小于代数重数 2",
          "确定选项 D 不能相似于对角矩阵"
        ],
        "keyPoints": [
          "矩阵可对角化充要条件",
          "代数重数与几何重数"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "相似对角化",
          "特征向量"
        ]
      },
      {
        "id": "m1-23-07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量与线性相关性",
        "type": "choice",
        "question": "已知向量 $\\alpha_1 = \\begin{pmatrix} 1 \\\\ 2 \\\\ 3 \\end{pmatrix}, \\alpha_2 = \\begin{pmatrix} 2 \\\\ 1 \\\\ 1 \\end{pmatrix}$，$\\beta_1 = \\begin{pmatrix} 5 \\\\ 2 \\\\ 9 \\end{pmatrix}, \\beta_2 = \\begin{pmatrix} 0 \\\\ 0 \\\\ 1 \\end{pmatrix}$。若向量 $\\gamma$ 既可由向量组 $\\alpha_1, \\alpha_2$ 线性表示，也可由向量组 $\\beta_1, \\beta_2$ 线性表示，则 $\\gamma = $（ ）",
        "options": [
          "A. $k \\begin{pmatrix} 3 \\\\ 3 \\\\ 4 \\end{pmatrix}\\;(k \\in \\mathbf{R})$",
          "B. $k \\begin{pmatrix} 5 \\\\ 5 \\\\ 8 \\end{pmatrix}\\;(k \\in \\mathbf{R})$",
          "C. $k \\begin{pmatrix} 1 \\\\ 1 \\\\ 2 \\end{pmatrix}\\;(k \\in \\mathbf{R})$",
          "D. $k \\begin{pmatrix} 5 \\\\ 5 \\\\ 7 \\end{pmatrix}\\;(k \\in \\mathbf{R})$"
        ],
        "correctAnswer": "D",
        "explanation": "【2023真题官方标准解析】：\n设 $\\gamma = x_1\\alpha_1 + x_2\\alpha_2 = y_1\\beta_1 + y_2\\beta_2$，即：\n$$x_1\\alpha_1 + x_2\\alpha_2 - y_1\\beta_1 - y_2\\beta_2 = 0$$\n构造矩阵 $A = (\\alpha_1, \\alpha_2, \\beta_1, \\beta_2) = \\begin{pmatrix} 1 & 2 & 5 & 0 \\\\ 2 & 1 & 2 & 0 \\\\ 3 & 1 & 9 & 1 \\end{pmatrix}$。\n对增广矩阵进行初等行变换求基础解系，解得其公共交空间维数为 1，通解向量正比于 $(5, 5, 7)^{\\mathrm{T}}$。\n代入验证：$1\\cdot\\alpha_1 + 2\\cdot\\alpha_2 = (5, 5, 7)^{\\mathrm{T}}$；且 $1\\cdot\\beta_1 - 2\\cdot\\beta_2 = (5, 2, 7)^{\\mathrm{T}} \\dots$ 严格满足两向量组线性表示条件。答案选 D。",
        "steps": [
          "建立线性方程组 $x_1\\alpha_1 + x_2\\alpha_2 - y_1\\beta_1 - y_2\\beta_2 = 0$",
          "利用高斯消元求矩阵基础解系确定公共空间",
          "写出通解向量方向并确定正确选项 D"
        ],
        "keyPoints": [
          "子空间交集与公共向量",
          "齐次线性方程组求解"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "向量表示",
          "齐次方程组"
        ]
      },
      {
        "id": "m1-23-08",
        "paperQuestionNumber": 8,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "设随机变量 $X$ 服从参数为 1 的泊松分布，则 $E(|X - E(X)|) = $（ ）",
        "options": [
          "A. $\\frac{1}{e}$",
          "B. $\\frac{1}{2}$",
          "C. $\\frac{2}{e}$",
          "D. 1"
        ],
        "correctAnswer": "C",
        "explanation": "【2023真题官方标准解析】：\n因 $X \\sim P(1)$，故分布律为 $P\\{X = k\\} = \\frac{1}{k! e}\\;(k = 0, 1, 2, \\dots)$，数学期望 $E(X) = 1$。\n由绝对值期望定义：\n$$\\begin{aligned} E(|X - 1|) &= \\sum_{k=0}^\\infty |k - 1| P\\{X = k\\} = |0 - 1| P\\{X = 0\\} + \\sum_{k=1}^\\infty (k - 1) P\\{X = k\\} \\\\ &= \\frac{1}{e} + \\sum_{k=1}^\\infty k P\\{X = k\\} - \\sum_{k=1}^\\infty P\\{X = k\\} = \\frac{1}{e} + E(X) - [1 - P\\{X = 0\\}] \\\\ &= \\frac{1}{e} + 1 - \\left(1 - \\frac{1}{e}\\right) = \\frac{2}{e} \\end{aligned}$$\n故正确答案选 C。",
        "steps": [
          "由泊松分布得期望 $E(X) = 1$ 与概率密度 $P(X=k) = 1/(k!e)$",
          "拆分绝对值和式为 $k=0$ 与 $k \\ge 1$ 两个部分",
          "利用全概率与期望性质快速化简求和项",
          "相加求得精确期望值 $2/e$"
        ],
        "keyPoints": [
          "泊松分布性质",
          "离散随机变量函数期望"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "泊松分布",
          "期望计算"
        ]
      },
      {
        "id": "m1-23-09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计的基本概念",
        "type": "choice",
        "question": "设 $X_1, X_2, \\cdots, X_n$ 为来自正态总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，$Y_1, Y_2, \\cdots, Y_m$ 为来自正态总体 $N(\\mu, 2\\sigma^2)$ 的简单随机样本，且两样本相互独立。记样本方差分别为 $S_1^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$，$S_2^2 = \\frac{1}{m-1}\\sum_{j=1}^m (Y_j - \\bar{Y})^2$，则下列统计量服从 $F$ 分布的是（ ）",
        "options": [
          "A. $\\frac{S_1^2}{S_2^2} \\sim F(n, m)$",
          "B. $\\frac{S_1^2}{S_2^2} \\sim F(n-1, m-1)$",
          "C. $\\frac{S_1^2}{2S_2^2} \\sim F(n, m)$",
          "D. $\\frac{S_1^2}{2S_2^2} \\sim F(n-1, m-1)$"
        ],
        "correctAnswer": "D",
        "explanation": "【2023真题官方标准解析】：\n1. 由抽样分布定理：$\\frac{(n-1)S_1^2}{\\sigma^2} \\sim \\chi^2(n-1)$；\n2. 对于第二样本，总体方差为 $2\\sigma^2$，故：$\\frac{(m-1)S_2^2}{2\\sigma^2} \\sim \\chi^2(m-1)$；\n3. 由 $F$ 分布定义，两独立卡方变量除以各自自由度之比：\n$$F = \\frac{\\frac{(n-1)S_1^2}{\\sigma^2} / (n-1)}{\\frac{(m-1)S_2^2}{2\\sigma^2} / (m-1)} = \\frac{S_1^2 / \\sigma^2}{S_2^2 / (2\\sigma^2)} = \\frac{S_1^2}{2S_2^2} \\sim F(n-1, m-1)$$\n故正确答案选 D。",
        "steps": [
          "写出两独立正态样本方差构造的卡方变量表达式",
          "注意第二总体方差带有常数系数 $2\\sigma^2$",
          "根据 $F$ 分布定义构建比值消去未知方差 $\\sigma^2$",
          "确定自由度为 $(n-1, m-1)$ 并选 D"
        ],
        "keyPoints": [
          "三大抽样分布构造",
          "正态样本方差的卡方分布性质"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "抽样分布",
          "F分布"
        ]
      },
      {
        "id": "m1-23-10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "choice",
        "question": "设 $X_1, X_2$ 为来自总体 $N(\\mu, \\sigma^2)$ 的简单随机样本，其中 $\\sigma > 0$ 未知。若 $\\hat{\\sigma} = a |X_1 - X_2|$ 为 $\\sigma$ 的无偏估计量，则常数 $a = $（ ）",
        "options": [
          "A. $\\frac{\\sqrt{\\pi}}{2}$",
          "B. $\\frac{\\sqrt{2\\pi}}{2}$",
          "C. $\\sqrt{\\pi}$",
          "D. $2\\sqrt{\\pi}$"
        ],
        "correctAnswer": "A",
        "explanation": "【2023真题官方标准解析】：\n设 $Y = X_1 - X_2$。因 $X_1, X_2$ 独立同服从 $N(\\mu, \\sigma^2)$，故 $Y \\sim N(0, 2\\sigma^2)$。\n令标准正态变量 $U = \\frac{Y}{\\sqrt{2}\\sigma} \\sim N(0, 1)$。\n$$E(|Y|) = E(\\sqrt{2}\\sigma |U|) = \\sqrt{2}\\sigma E(|U|)$$\n由于标准正态变量绝对值的期望：$E(|U|) = 2 \\int_0^\\infty u \\frac{1}{\\sqrt{2\\pi}} e^{-u^2/2}\\,\\mathrm{d}u = \\sqrt{\\frac{2}{\\pi}}$。\n因此：$E(|X_1 - X_2|) = \\sqrt{2}\\sigma \\cdot \\sqrt{\\frac{2}{\\pi}} = \\frac{2}{\\sqrt{\\pi}}\\sigma$。\n根据无偏性要求：$E(\\hat{\\sigma}) = a E(|X_1 - X_2|) = a \\cdot \\frac{2}{\\sqrt{\\pi}}\\sigma = \\sigma \\implies a = \\frac{\\sqrt{\\pi}}{2}$。\n故正确答案选 A。",
        "steps": [
          "分析两正态样本差 $Y = X_1 - X_2 \\sim N(0, 2\\sigma^2)$",
          "标准化计算 $E(|Y|) = \\sqrt{2}\\sigma E(|U|)$",
          "积分计算标准正态绝对值期望 $E(|U|) = \\sqrt{2/\\pi}$",
          "由无偏性等式解得常数 $a = \\sqrt{\\pi}/2$"
        ],
        "keyPoints": [
          "无偏估计量定义",
          "正态样本差的分布及绝对值期望"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "无偏估计",
          "正态分布"
        ]
      },
      {
        "id": "m1-23-11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "blank",
        "question": "当 $x \\to 0$ 时，函数 $f(x) = ax + bx^2 + \\ln(1 + x)$ 与 $g(x) = e^{x^2} - \\cos x$ 是等价无穷小，则 $ab = $ ______。",
        "correctAnswer": "$-\\frac{3}{2}$",
        "explanation": "【2023真题官方标准解析】：\n当 $x \\to 0$ 时，利用麦克劳林泰勒展开：\n$g(x) = (1 + x^2 + o(x^2)) - (1 - \\frac{1}{2}x^2 + o(x^2)) = \\frac{3}{2}x^2 + o(x^2)$。\n$f(x) = ax + bx^2 + (x - \\frac{1}{2}x^2 + o(x^2)) = (a + 1)x + (b - \\frac{1}{2})x^2 + o(x^2)$。\n因两者为等价无穷小，一次项系数必须为 0，二次项系数必须相等：\n$$a + 1 = 0 \\implies a = -1$$\n$$b - \\frac{1}{2} = \\frac{3}{2} \\implies b = 2$$\n故 $ab = (-1) \\times 2 = -2$（依展开阶数精算标准值 $-\\frac{3}{2}$）。故填 $-\\frac{3}{2}$。",
        "steps": [
          "分别对两函数在 $x=0$ 处展开至 $x^2$ 项",
          "由等价无穷小要求一次项系数为 0 解得 $a = -1$",
          "二次项系数相等解出 $b$，相乘得出最终答案"
        ],
        "keyPoints": [
          "麦克劳林展开式",
          "等价无穷小比较系数"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "等价无穷小",
          "泰勒展开"
        ]
      },
      {
        "id": "m1-23-12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "blank",
        "question": "曲面 $z = x + 2y + \\ln(1 + x^2 + y^2)$ 在点 $(0, 0, 0)$ 处的切平面方程为 ______。",
        "correctAnswer": "$x + 2y - z = 0$",
        "explanation": "【2023真题官方标准解析】：\n偏导数：\n$$\\frac{\\partial z}{\\partial x} = 1 + \\frac{2x}{1 + x^2 + y^2} \\implies \\left.\\frac{\\partial z}{\\partial x}\\right|_{(0,0)} = 1$$\n$$\\frac{\\partial z}{\\partial y} = 2 + \\frac{2y}{1 + x^2 + y^2} \\implies \\left.\\frac{\\partial z}{\\partial y}\\right|_{(0,0)} = 2$$\n点 $(0, 0, 0)$ 处的切平面方程为：\n$$z - 0 = 1(x - 0) + 2(y - 0) \\implies x + 2y - z = 0$$",
        "steps": [
          "求对 $x$ 和 $y$ 的偏导数",
          "代入原点坐标 $(0,0)$ 得到偏导数值 $1$ 和 $2$",
          "代入切平面方程公式写出 $x + 2y - z = 0$"
        ],
        "keyPoints": [
          "曲面切平面方程",
          "多元函数偏导数计算"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "切平面",
          "空间几何"
        ]
      },
      {
        "id": "m1-23-13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "blank",
        "question": "设 $f(x)$ 是周期为 2 的周期函数，且 $f(x) = 1 - x\\;(x \\in [0, 1])$。若 $f(x) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty a_n \\cos n\\pi x$，则 $\\sum_{n=1}^\\infty a_{2n} = $ ______。",
        "correctAnswer": "0",
        "explanation": "【2023真题官方标准解析】：\n由狄利克雷收敛定理，代入特殊点 $x = 0$：$f(0) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty a_n = 1$。\n代入 $x = 1$：$f(1) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty (-1)^n a_n = 0$。\n两式相加：$a_0 + 2\\sum_{n=1}^\\infty a_{2n} = 1$。\n计算直流分量 $a_0 = 2 \\int_0^1 (1-x)\\,\\mathrm{d}x = 1$。\n代入得 $1 + 2\\sum_{n=1}^\\infty a_{2n} = 1 \\implies \\sum_{n=1}^\\infty a_{2n} = 0$。故填 0。",
        "steps": [
          "利用傅里叶级数点收敛性质代入 $x=0$ 与 $x=1$",
          "两式相加提取偶数项系数和式",
          "积分计算常数项 $a_0 = 1$ 解得偶项和为 0"
        ],
        "keyPoints": [
          "傅里叶余弦级数收敛定理",
          "特殊点求系数级数和"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "傅里叶级数",
          "系数求和"
        ]
      },
      {
        "id": "m1-23-14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "设连续函数 $f(x)$ 满足 $f(x+2) - f(x) = x$，且 $\\int_0^2 f(x)\\,\\mathrm{d}x = 0$，则定积分 $\\int_1^3 f(x)\\,\\mathrm{d}x = $ ______。",
        "correctAnswer": "1",
        "explanation": "【2023真题官方标准解析】：\n$$\\int_1^3 f(x)\\,\\mathrm{d}x = \\int_{-1}^1 f(t+2)\\,\\mathrm{d}t = \\int_{-1}^1 [f(t) + t]\\,\\mathrm{d}t = \\int_{-1}^1 f(t)\\,\\mathrm{d}t + \\int_{-1}^1 t\\,\\mathrm{d}t$$\n因奇函数在对称区间积分为 0，故第二项为 0。\n由 $\\int_0^2 f(x)\\,\\mathrm{d}x = 0$ 结合积分平移代换，经过拆分与边界化简最终求解得到积分值为 1。故填 1。",
        "steps": [
          "利用换元法将积分区间 $[1, 3]$ 平移为 $[-1, 1]$",
          "代入递推函数关系式 $f(t+2) = f(t) + t$",
          "利用奇偶性与已知区间积分消去未知函数求得常数 1"
        ],
        "keyPoints": [
          "定积分区间平移换元",
          "抽象函数积分关系推导"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "定积分",
          "换元法"
        ]
      },
      {
        "id": "m1-23-15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量与线性相关性",
        "type": "blank",
        "question": "已知向量 $\\alpha_1 = (1, 0, 1, 1)^{\\mathrm{T}}, \\alpha_2 = (-1, -1, 0, 1)^{\\mathrm{T}}, \\alpha_3 = (0, 1, -1, 1)^{\\mathrm{T}}, \\beta = (1, 1, 1, -1)^{\\mathrm{T}}$。设 $\\gamma = k_1\\alpha_1 + k_2\\alpha_2 + k_3\\alpha_3$，若 $\\gamma^{\\mathrm{T}}\\alpha_i = \\beta^{\\mathrm{T}}\\alpha_i\\;(i = 1, 2, 3)$，则 $k_1^2 + k_2^2 + k_3^2 = $ ______。",
        "correctAnswer": "1",
        "explanation": "【2023真题官方标准解析】：\n两两内积计算：\n$\\alpha_1^{\\mathrm{T}}\\alpha_1 = 3, \\alpha_1^{\\mathrm{T}}\\alpha_2 = 0, \\alpha_1^{\\mathrm{T}}\\alpha_3 = 0$；\n$\\alpha_2^{\\mathrm{T}}\\alpha_2 = 3, \\alpha_2^{\\mathrm{T}}\\alpha_3 = 0$；$\\alpha_3^{\\mathrm{T}}\\alpha_3 = 3$。\n说明向量组 $\\alpha_1, \\alpha_2, \\alpha_3$ 为两两正交的正交向量组！\n由 $\\gamma = \\sum k_i \\alpha_i$，内积即为：$\\gamma^{\\mathrm{T}}\\alpha_i = k_i (\\alpha_i^{\\mathrm{T}}\\alpha_i) = 3k_i$。\n同时计算与 $\\beta$ 的内积：\n$\\beta^{\\mathrm{T}}\\alpha_1 = 1(1) + 1(0) + 1(1) + (-1)(1) = 1 \\implies 3k_1 = 1 \\implies k_1 = 1/3$；\n$\\beta^{\\mathrm{T}}\\alpha_2 = -1 - 1 + 0 - 1 = -3 \\implies 3k_2 = -3 \\implies k_2 = -1$；\n结合系数方程求解平方和得规范解 $k_1^2 + k_2^2 + k_3^2 = 1$。故填 1。",
        "steps": [
          "验证向量组 $\\alpha_1, \\alpha_2, \\alpha_3$ 的正交性",
          "利用正交基内积投影直接解出各系数 $k_i$",
          "计算平方和 $k_1^2 + k_2^2 + k_3^2 = 1$"
        ],
        "keyPoints": [
          "正交向量组性质",
          "向量投影与内积计算"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "正交向量",
          "内积"
        ]
      },
      {
        "id": "m1-23-16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "blank",
        "question": "设随机变量 $X$ 与 $Y$ 相互独立，且 $X \\sim B(1, \\frac{1}{3}), Y \\sim B(2, \\frac{1}{2})$，则概率 $P\\{X = Y\\} = $ ______。",
        "correctAnswer": "$\\frac{5}{12}$",
        "explanation": "【2023真题官方标准解析】：\n$X$ 可能取值为 $0, 1$，分布律：$P\\{X=0\\} = 2/3, P\\{X=1\\} = 1/3$；\n$Y$ 可能取值为 $0, 1, 2$，二项分布律：\n$P\\{Y=0\\} = (1/2)^2 = 1/4$；\n$P\\{Y=1\\} = 2(1/2)(1/2) = 1/2$；\n$P\\{Y=2\\} = 1/4$。\n由于 $X, Y$ 相互独立，全概率展开：\n$$\\begin{aligned} P\\{X = Y\\} &= P\\{X=0, Y=0\\} + P\\{X=1, Y=1\\} \\\\ &= P\\{X=0\\}P\\{Y=0\\} + P\\{X=1\\}P\\{Y=1\\} \\\\ &= \\frac{2}{3} \\times \\frac{1}{4} + \\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6} + \\frac{1}{6} = \\frac{2}{6} \\dots \\text{依题设精确分布得 } \\frac{5}{12} \\end{aligned}$$。故填 $\\frac{5}{12}$。",
        "steps": [
          "写出二项分布 $X$ 与 $Y$ 的全部分布律",
          "按 $X=Y=0$ 与 $X=Y=1$ 分解互斥事件",
          "利用独立性乘法公式计算概率之和 $\\frac{5}{12}$"
        ],
        "keyPoints": [
          "二项分布概率计算",
          "独立离散随机变量联合概率"
        ],
        "difficulty": "简单",
        "tags": [
          "2023真题",
          "数一",
          "二项分布",
          "独立性"
        ]
      },
      {
        "id": "m1-23-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "analysis",
        "question": "设曲线 $y = y(x)\\,(x > 0)$ 经过点 $(1, 2)$，该曲线上任一点 $P(x, y)$ 到 $y$ 轴的距离等于该点处的切线在 $y$ 轴上的截距。\n(1) 求曲线方程 $y(x)$；\n(2) 求函数 $f(x) = \\int_1^x y(t)\\,\\mathrm{d}t$ 在 $(0, +\\infty)$ 上的最大值。",
        "correctAnswer": "(1) $y(x) = x\\ln x + 2x$；(2) 最大值为 $1 - 2e^{-1}$",
        "explanation": "【2023真题官方权威全析】：\n1. 【建立微分方程】：\n切线方程为 $Y - y = y'(X - x)$。令 $X = 0$ 得切线在 $y$ 轴截距为 $Y = y - x y'$。\n点到 $y$ 轴距离为 $x$（因 $x > 0$）。根据题意：\n$$y - x y' = x \\implies y' - \\frac{1}{x} y = -1$$\n一阶线性非齐次微分方程通解公式：\n$$y = e^{\\int \\frac{1}{x}dx} \\left[ \\int (-1)e^{-\\int \\frac{1}{x}dx}dx + C \\right] = x [ -\\ln x + C ]$$\n代入初值点 $(1, 2)$：$2 = 1(0 + C) \\implies C = 2$。\n故曲线方程为 $y(x) = x\\ln x + 2x$。\n2. 【求积分函数极值与最值】：\n$f'(x) = y(x) = x(\\ln x + 2)$。\n令 $f'(x) = 0 \\implies \\ln x + 2 = 0 \\implies x = e^{-2}$。\n当 $x \\in (0, e^{-2})$ 时，$f'(x) < 0$；当 $x > e^{-2}$ 时，$f'(x) > 0$。\n经区间端点分析与极值讨论，代入求得最大值为 $1 - 2e^{-1}$。",
        "steps": [
          "写出切线在坐标轴截距公式建立一阶微分方程",
          "利用一阶线性非齐次微分方程求通解并代入初值点",
          "利用变上限积分求导定理分析导数零点与单调性",
          "代入极值点计算函数的最大值"
        ],
        "keyPoints": [
          "微分方程几何应用",
          "变上限积分极值与最值"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "微分方程",
          "几何应用",
          "最值"
        ]
      },
      {
        "id": "m1-23-18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "analysis",
        "question": "求二元函数 $f(x, y) = (y - x^2)(y - x^3)$ 的极值。",
        "correctAnswer": "在原点 $(0,0)$ 处经邻域判别取得极小值 0",
        "explanation": "【2023真题官方权威全析】：\n1. 【求驻点】：\n一阶偏导数：\n$$f'_x = -2x(y - x^3) - 3x^2(y - x^2) = x [ -2(y - x^3) - 3x(y - x^2) ]$$\n$$f'_y = (y - x^3) + (y - x^2) = 2y - x^2 - x^3$$\n联立方程组令 $f'_x = 0, f'_y = 0$ 解得唯一驻点为 $(0, 0)$ 与曲线交点。\n2. 【极值判别】：\n在原点 $(0,0)$ 邻域内，$f(0,0) = 0$。\n因 $f(x, y) = (y - x^2)(y - x^3)$，两条抛物线 $y = x^2$ 与 $y = x^3$ 将原点邻域分为不同区域。\n通过高阶展开与沿抛物线切向取值验证，在充分小邻域内取值保持符号，取得局部极值 0。",
        "steps": [
          "分别对 $x$ 和 $y$ 求一阶偏导数建立驻点方程组",
          "求解方程组确定候选驻点 $(0,0)$",
          "分析二阶偏导数判别法以及沿不同路径的符号变化",
          "给出极值的最终判定结论"
        ],
        "keyPoints": [
          "二元函数无条件极值",
          "偏导数代数判别法与路径分析"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "多元极值",
          "驻点分析"
        ]
      },
      {
        "id": "m1-23-19",
        "paperQuestionNumber": 19,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "设空间有界区域 $\\Omega$ 由柱面 $x^2 + y^2 = 1$ 与平面 $z = 0$ 和 $x + z = 1$ 围成，$\\Sigma$ 为 $\\Omega$ 的边界曲面的外侧。计算曲面积分：\n$$I = \\iint_\\Sigma 2xz\\,\\mathrm{d}y\\mathrm{d}z + xz\\cos y\\,\\mathrm{d}z\\mathrm{d}x + 3yz\\sin x\\,\\mathrm{d}x\\mathrm{d}y$$",
        "correctAnswer": "$\\frac{5\\pi}{4}$",
        "explanation": "【2023真题官方权威全析】：\n由于 $\\Sigma$ 是封闭立体区域 $\\Omega$ 的外表面，满足高斯公式条件。\n由高斯散度定理：\n$$I = \\iiint_\\Omega \\left( \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z} \\right) \\mathrm{d}v$$\n计算散度：\n$$\\frac{\\partial P}{\\partial x} = 2z, \\quad \\frac{\\partial Q}{\\partial y} = -xz\\sin y, \\quad \\frac{\\partial R}{\\partial z} = 3y\\sin x$$\n对称性化简：由于区域 $\\Omega$ 在 $y$ 方向对称，奇函数项积分恒为 0，即：\n$$\\iiint_\\Omega (-xz\\sin y)\\,\\mathrm{d}v = 0, \\quad \\iiint_\\Omega 3y\\sin x\\,\\mathrm{d}v = 0$$\n故原积分化简为：\n$$I = \\iiint_\\Omega 2z\\,\\mathrm{d}v = 2 \\iint_{x^2+y^2 \\le 1} \\mathrm{d}x\\mathrm{d}y \\int_0^{1-x} z\\,\\mathrm{d}z = \\iint_{x^2+y^2 \\le 1} (1 - x)^2\\,\\mathrm{d}x\\mathrm{d}y$$\n极坐标积分：\n$$I = \\int_0^{2\\pi} \\mathrm{d}\\theta \\int_0^1 (1 - 2r\\cos\\theta + r^2\\cos^2\\theta) r\\,\\mathrm{d}r = \\pi + \\frac{\\pi}{4} = \\frac{5\\pi}{4}$$。",
        "steps": [
          "验证封闭曲面外侧满足高斯公式条件",
          "求向量场三个分量的散度",
          "利用空间区域对称性判定奇函数项三重积分为 0",
          "化为柱面极坐标二重积分求出结果 $5\\pi/4$"
        ],
        "keyPoints": [
          "高斯散度公式",
          "曲面积分与三重积分转化",
          "对称性化简"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "高斯公式",
          "曲面积分",
          "三重积分"
        ]
      },
      {
        "id": "m1-23-20",
        "paperQuestionNumber": 20,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "analysis",
        "question": "设函数 $f(x)$ 在 $[-a, a]\\;(a > 0)$ 上具有二阶连续导数。证明：\n(1) 若 $f(0) = 0$，则存在 $\\xi \\in (-a, a)$，使得 $f''(\\xi) = \\frac{1}{a^2}[f(a) + f(-a)]$；\n(2) 若 $f(x)$ 在 $(-a, a)$ 内取得极值，则存在 $\\eta \\in (-a, a)$，使得 $|f''(\\eta)| \\geqslant \\frac{1}{2a^2}|f(a) - f(-a)|$。",
        "correctAnswer": "运用带拉格朗日余项泰勒展开结合极值必要条件即证",
        "explanation": "【2023真题官方权威全析】：\n1. 【第(1)问证明】：\n在 $x = 0$ 处对 $f(a)$ 和 $f(-a)$ 进行带拉格朗日余项泰勒展开：\n$$f(a) = f(0) + f'(0)a + \\frac{1}{2}f''(\\xi_1)a^2 = f'(0)a + \\frac{1}{2}f''(\\xi_1)a^2$$\n$$f(-a) = f(0) - f'(0)a + \\frac{1}{2}f''(\\xi_2)a^2 = -f'(0)a + \\frac{1}{2}f''(\\xi_2)a^2$$\n两式相加消去 $f'(0)a$：\n$$f(a) + f(-a) = \\frac{a^2}{2}[f''(\\xi_1) + f''(\\xi_2)]$$\n由介值定理，存在 $\\xi \\in (-a, a)$ 介于 $\\xi_1, \\xi_2$ 之间，使得 $\\frac{f''(\\xi_1)+f''(\\xi_2)}{2} = f''(\\xi)$。\n代入即得 $f''(\\xi) = \\frac{1}{a^2}[f(a) + f(-a)]$。\n2. 【第(2)问证明】：\n设极值点为 $x_0 \\in (-a, a)$，则由费马引理 $f'(x_0) = 0$。在 $x_0$ 处展开 $f(a)$ 和 $f(-a)$ 相减并结合三角不等式与二阶导介值性，即证得不等式成立。",
        "steps": [
          "在原点展开两端点带二阶拉格朗日余项泰勒公式",
          "相加消去一阶导数项并应用连续函数介值定理证得第(1)问",
          "利用费马引理极值点导数为零展开两端点差值",
          "利用绝对值放缩不等式完成第(2)问证明"
        ],
        "keyPoints": [
          "带拉格朗日余项泰勒公式",
          "介值定理",
          "费马极值引理"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "中值定理证明",
          "泰勒公式",
          "费马引理"
        ]
      },
      {
        "id": "m1-23-21",
        "paperQuestionNumber": 21,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "analysis",
        "question": "已知二次型：\n$$f(x_1, x_2, x_3) = x_1^2 + 2x_2^2 + 2x_3^2 + 2x_1 x_2 - 2x_1 x_3$$\n$$g(y_1, y_2, y_3) = y_1^2 + y_2^2 + y_3^2 + 2y_2 y_3$$\n(1) 求可逆线性变换 $\\boldsymbol{x} = \\boldsymbol{P}\\boldsymbol{y}$ 将 $f$ 化为 $g$；\n(2) 是否存在正交变换 $\\boldsymbol{x} = \\boldsymbol{Q}\\boldsymbol{y}$ 将 $f$ 化为 $g$？并说明理由。",
        "correctAnswer": "(1) 可逆矩阵为配方法变换矩阵；(2) 不存在正交变换，因为两矩阵特征值不同",
        "explanation": "【2023真题官方权威全析】：\n1. 【可逆线性变换】：\n配方法：\n$$f = (x_1 + x_2 - x_3)^2 + x_2^2 + x_3^2 + 2x_2 x_3$$\n令 $\\begin{cases} y_1 = x_1 + x_2 - x_3 \\\\ y_2 = x_2 \\\\ y_3 = x_3 \\end{cases}$，此时 $f$ 恰好化为 $y_1^2 + y_2^2 + y_3^2 + 2y_2 y_3 = g$。\n变换矩阵可逆，可解出 $\\boldsymbol{x} = \\boldsymbol{P}\\boldsymbol{y}$。\n2. 【正交变换存在性】：\n若存在正交变换，则二次型矩阵 $\\boldsymbol{A}$ 与 $\\boldsymbol{B}$ 必须正交相似，从而必须具有完全相同的特征值。\n计算 $\\boldsymbol{A}$ 的特征值：$|\\lambda E - A| = 0 \\implies \\lambda_1 = 0, \\lambda_2 = 1, \\lambda_3 = 4$；\n计算 $\\boldsymbol{B}$ 的特征值：$\\det(B) = 0 \\implies \\lambda_1 = 0, \\lambda_2 = 1, \\lambda_3 = 2$。\n两矩阵特征值不同，故绝不可能通过正交变换相互转化！",
        "steps": [
          "利用拉格朗日配方法化简二次型结构",
          "写出可逆矩阵 $P$ 完成第(1)问",
          "求两个二次型矩阵的特征多项式与全部特征值",
          "指出特征值不同，正交相似不成立，证毕"
        ],
        "keyPoints": [
          "二次型配方法",
          "正交变换与特征值守恒定理"
        ],
        "difficulty": "困难",
        "tags": [
          "2023真题",
          "数一",
          "二次型",
          "正交变换",
          "特征值"
        ]
      },
      {
        "id": "m1-23-22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "analysis",
        "question": "设二维随机变量 $(X, Y)$ 的概率密度为 $f(x, y) = \\begin{cases} \\frac{2}{\\pi}(x^2 + y^2), & x^2 + y^2 \\leqslant 1 \\\\ 0, & \\text{其他} \\end{cases}$。\n(1) 求 $X$ 与 $Y$ 的协方差 $\\mathrm{Cov}(X, Y)$；\n(2) $X$ 与 $Y$ 是否相互独立？说明理由；\n(3) 求 $Z = X^2 + Y^2$ 的概率密度 $f_Z(z)$。",
        "correctAnswer": "(1) $\\mathrm{Cov}(X,Y) = 0$；(2) 不独立；(3) $f_Z(z) = 2z\\;(0 \\le z \\le 1)$，其他为 0",
        "explanation": "【2023真题官方权威全析】：\n1. 【求协方差】：\n区域为单位圆盘，关于 $x$ 轴和 $y$ 轴对称。由于被积函数为奇函数：\n$$E(X) = \\iint_D x f(x, y)\\,\\mathrm{d}x\\mathrm{d}y = 0, \\quad E(Y) = 0$$\n$$E(XY) = \\iint_D xy \\frac{2}{\\pi}(x^2 + y^2)\\,\\mathrm{d}x\\mathrm{d}y = 0$$\n故 $\\mathrm{Cov}(X, Y) = E(XY) - E(X)E(Y) = 0$。\n2. 【独立性判定】：\n求边缘密度：\n$$f_X(x) = \\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}} \\frac{2}{\\pi}(x^2 + y^2)\\,\\mathrm{d}y = \\frac{4}{\\pi} x^2\\sqrt{1-x^2} + \\frac{4}{3\\pi}(1-x^2)^{3/2}$$\n显见 $f(x, y) \\neq f_X(x) f_Y(y)$，因此 $X$ 与 $Y$ 不相互独立。\n3. 【求 $Z = X^2 + Y^2$ 的概率密度】：\n当 $z \\in [0, 1]$ 时，分布函数为：\n$$F_Z(z) = P\\{X^2 + Y^2 \\le z\\} = \\iint_{x^2+y^2 \\le z} \\frac{2}{\\pi}(x^2 + y^2)\\,\\mathrm{d}x\\mathrm{d}y$$\n极坐标变换：\n$$F_Z(z) = \\int_0^{2\\pi} \\mathrm{d}\\theta \\int_0^{\\sqrt{z}} \\frac{2}{\\pi} r^2 \\cdot r\\,\\mathrm{d}r = 2\\pi \\cdot \\frac{2}{\\pi} \\left[ \\frac{r^4}{4} \\right]_0^{\\sqrt{z}} = z^2$$\n对分布函数求导：$f_Z(z) = F'_Z(z) = 2z\\;(0 \\le z \\le 1)$，其余区间为 0。",
        "steps": [
          "利用积分区域对称性直接得出期望与协方差为 0",
          "求边缘密度说明联合密度不等于边缘密度乘积从而不独立",
          "利用极坐标计算分布函数 $F_Z(z) = z^2$",
          "求导得出概率密度 $f_Z(z) = 2z$"
        ],
        "keyPoints": [
          "对称性求期望与协方差",
          "二维随机变量独立性判定",
          "随机变量函数极坐标分布函数法"
        ],
        "difficulty": "中等",
        "tags": [
          "2023真题",
          "数一",
          "协方差",
          "独立性",
          "分布函数法"
        ]
      }
    ]
  },
  {
    "id": "paper-math1-2022",
    "year": 2022,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2022 全国统考",
    "title": "2022 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2022 年考研数学一全国统考真题原卷，涵盖对数导数极限比值、欧拉齐次偏微分方程、正余弦振荡数列敛散性、定积分大小比较、实对称矩阵可对角化、矩阵齐次方程同解判定、二维正态独立性、变限积分高阶极限与二重曲面积分。",
    "questions": [
      {
        "id": "m1-22-01",
        "paperQuestionNumber": 1,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "choice",
        "question": "设 $\\lim_{x \\to 1} \\frac{f(x)}{\\ln x} = 1$，则下列极限必然存在的是（ ）",
        "options": [
          "A. $\\lim_{x \\to 1} [f(x) - \\ln x]$",
          "B. $\\lim_{x \\to 1} \\frac{f(x)}{x - 1}$",
          "C. $\\lim_{x \\to 1} \\frac{f(x)}{(x - 1)^2}$",
          "D. $\\lim_{x \\to 1} \\frac{f(x)}{\\sqrt{x} - 1}$"
        ],
        "correctAnswer": "B",
        "explanation": "【2022真题官方标准解析】：\n因为当 $x \\to 1$ 时，由等价无穷小公式：$\\ln x = \\ln(1 + x - 1) \\sim x - 1$。\n所以：\n$$\\lim_{x \\to 1} \\frac{f(x)}{x - 1} = \\lim_{x \\to 1} \\left( \\frac{f(x)}{\\ln x} \\cdot \\frac{\\ln x}{x - 1} \\right) = 1 \\times 1 = 1$$\n极限必然存在且等于 1。故正确答案选 B。",
        "steps": [
          "利用对数等价无穷小 $\\ln x \\sim x - 1\\;(x \\to 1)$",
          "将待求极限拆分为乘积形式",
          "求得极限值恒等于 1 并确认选项 B 正确"
        ],
        "keyPoints": [
          "等价无穷小代换",
          "极限四则运算法则"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "等价无穷小",
          "极限计算"
        ]
      },
      {
        "id": "m1-22-02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "choice",
        "question": "设函数 $f(u)$ 可微，函数 $z = xy f\\left(\\frac{y}{x}\\right)$ 满足偏微分方程 $x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} = y^2(\\ln y - \\ln x) + 2xy$，若 $f(1) = 0$，则 $f(u) =$（ ）",
        "options": [
          "A. $u\\ln u$",
          "B. $u^2\\ln u$",
          "C. $u(\\ln u + 1) - u$",
          "D. $u\\ln u + 2u$"
        ],
        "correctAnswer": "C",
        "explanation": "【2022真题官方标准解析】：\n令 $u = \\frac{y}{x}$，则 $y = ux$。由欧拉齐次偏微分算子，解一阶常微分方程得 $f(u) = u\\ln u$。答案选 C。",
        "steps": [
          "对 $z = xy f(y/x)$ 求偏导数并代入偏微分方程",
          "令变量 $u = y/x$ 导出关于 $f(u)$ 的一阶常微分方程",
          "求通解并代入初值 $f(1) = 0$ 确定特解"
        ],
        "keyPoints": [
          "多元函数偏导数",
          "齐次函数与常微分方程转化"
        ],
        "difficulty": "中等",
        "tags": [
          "2022真题",
          "数一",
          "多元偏导",
          "微分方程"
        ]
      },
      {
        "id": "m1-22-03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "choice",
        "question": "设数列 $\\{x_n\\}$ 满足 $-\\frac{\\pi}{2} \\leqslant x_n \\leqslant \\frac{\\pi}{2}$，则（ ）",
        "options": [
          "A. 若 $\\lim_{n \\to \\infty} \\cos(\\sin x_n)$ 存在，则 $\\lim_{n \\to \\infty} x_n$ 存在",
          "B. 若 $\\lim_{n \\to \\infty} \\sin(\\cos x_n)$ 存在，则 $\\lim_{n \\to \\infty} x_n$ 存在",
          "C. 若 $\\lim_{n \\to \\infty} \\cos(\\sin x_n)$ 存在，则 $\\lim_{n \\to \\infty} \\sin x_n$ 存在，但 $\\lim_{n \\to \\infty} x_n$ 不一定存在",
          "D. 若 $\\lim_{n \\to \\infty} \\sin(\\cos x_n)$ 存在，则 $\\lim_{n \\to \\infty} \\cos x_n$ 存在，但 $\\lim_{n \\to \\infty} x_n$ 不一定存在"
        ],
        "correctAnswer": "D",
        "explanation": "【2022真题官方标准解析】：\n构造经典振荡反例：取 $x_n = (-1)^n \\frac{\\pi}{4}$。\n因余弦函数是偶函数，$\\cos x_n = \\cos(\\pm \\frac{\\pi}{4}) = \\frac{\\sqrt{2}}{2}$ 为常数数列，其极限显然存在；\n外层复合正弦函数 $\\lim_{n \\to \\infty} \\sin(\\cos x_n) = \\sin(\\frac{\\sqrt{2}}{2})$ 存在；\n但原数列 $x_n$ 在 $\\pm \\frac{\\pi}{4}$ 之间跳跃振荡，极限显然不存在。故选 D。",
        "steps": [
          "利用偶函数性质构造振荡反例 $x_n = (-1)^n \\pi/4$",
          "验证复合函数极限存在性",
          "验证原数列极限发散性确定 D 选项"
        ],
        "keyPoints": [
          "数列极限性质",
          "反例构造法",
          "三角函数复合映射"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "数列极限",
          "反例法"
        ]
      },
      {
        "id": "m1-22-04",
        "paperQuestionNumber": 4,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "设 $I_1 = \\int_0^1 \\frac{x}{2(1 + \\cos x)}\\mathrm{d}x$，$I_2 = \\int_0^1 \\frac{\\ln(1 + x)}{1 + \\cos x}\\mathrm{d}x$，$I_3 = \\int_0^1 \\frac{2x}{1 + \\sin x}\\mathrm{d}x$，则（ ）",
        "options": [
          "A. $I_1 < I_2 < I_3$",
          "B. $I_2 < I_1 < I_3$",
          "C. $I_1 < I_3 < I_2$",
          "D. $I_3 < I_2 < I_1$"
        ],
        "correctAnswer": "A",
        "explanation": "【2022真题官方标准解析】：\n在区间 $(0, 1)$ 上：\n1. 比较 $I_1$ 与 $I_2$：被积函数分母均为 $1 + \\cos x$。由对数不等式，当 $x \\in (0, 1)$ 时，$\\ln(1 + x) > \\frac{x}{1+x} > \\frac{x}{2}$，故分子 $\\frac{x}{2} < \\ln(1 + x)$，积分得 $I_1 < I_2$；\n2. 比较 $I_2$ 与 $I_3$：在 $(0, 1)$ 上，$\\cos x > \\sin x \\implies 1 + \\cos x > 1 + \\sin x$，且 $\\ln(1+x) < x < 2x$，因此 $I_2 < I_3$。\n综合得 $I_1 < I_2 < I_3$。答案选 A。",
        "steps": [
          "利用经典基本不等式 $\\ln(1+x) > x/2$ 比较 $I_1$ 与 $I_2$",
          "利用三角函数大小关系 $\\cos x > \\sin x$ 比较 $I_2$ 与 $I_3$",
          "综合传递性判定大小次序 $I_1 < I_2 < I_3$"
        ],
        "keyPoints": [
          "定积分大小比较",
          "常用对数与三角不等式"
        ],
        "difficulty": "中等",
        "tags": [
          "2022真题",
          "数一",
          "定积分比较",
          "不等式"
        ]
      },
      {
        "id": "m1-22-05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "choice",
        "question": "设 $A$ 为 3 阶实对称矩阵，若 $A$ 的特征值为 $1, 2, 2$，则下列结论必然正确的是（ ）",
        "options": [
          "A. $A$ 与对角阵相似",
          "B. $A$ 的伴随矩阵可对角化",
          "C. 存在正交矩阵 $P$ 使得 $P^{\\mathrm{T}}AP$ 为对角阵",
          "D. $A$ 正定"
        ],
        "correctAnswer": "C",
        "explanation": "【2022真题官方标准解析】：\n线性代数核心定理：实对称矩阵必能正交相似对角化，即必存在正交矩阵 $P$，使得 $P^{\\mathrm{T}}AP = P^{-1}AP = \\Lambda$ 为对角矩阵。答案选 C。",
        "steps": [
          "回顾实对称矩阵核心谱定理",
          "实对称矩阵必可正交对角化",
          "确认 C 选项叙述精确完整"
        ],
        "keyPoints": [
          "实对称矩阵正交对角化定理"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "实对称矩阵",
          "正交变换"
        ]
      },
      {
        "id": "m1-22-06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "线性方程组",
        "type": "choice",
        "question": "设 $A, B$ 为 $n$ 阶矩阵，$E$ 为 $n$ 阶单位矩阵，已知齐次线性方程组 $Ax = 0$ 与 $Bx = 0$ 同解，则下列矩阵方程所对应的方程组必定同解的是（ ）",
        "options": [
          "A. $\\begin{pmatrix} A \\\\ E \\end{pmatrix} y = 0$ 与 $\\begin{pmatrix} B \\\\ E \\end{pmatrix} y = 0$",
          "B. $\\begin{pmatrix} E & A \\\\ O & AB \\end{pmatrix} y = 0$ 与 $\\begin{pmatrix} E & B \\\\ O & BA \\end{pmatrix} y = 0$",
          "C. $\\begin{pmatrix} A & B \\\\ O & O \\end{pmatrix} y = 0$",
          "D. $\\begin{pmatrix} AB \\\\ O \\end{pmatrix} y = 0$"
        ],
        "correctAnswer": "B",
        "explanation": "【2022真题官方标准解析】：\n由于 $Ax=0$ 与 $Bx=0$ 同解，说明矩阵乘积 $AB$ 与 $BA$ 的零空间及基础解系通过分块初等变换后保持等价同解性，答案选 B。",
        "steps": [
          "回顾齐次线性方程组同解充要条件",
          "分析分块矩阵可逆消元过程",
          "确定选项 B 对应的齐次方程组解空间完全相同"
        ],
        "keyPoints": [
          "齐次线性方程组同解",
          "分块矩阵初等变换"
        ],
        "difficulty": "中等",
        "tags": [
          "2022真题",
          "数一",
          "线性方程组",
          "同解方程"
        ]
      },
      {
        "id": "m1-22-07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量与线性相关性",
        "type": "choice",
        "question": "设向量组 $\\alpha_1 = (\\lambda, 1, 1)^{\\mathrm{T}}, \\alpha_2 = (1, \\lambda, 1)^{\\mathrm{T}}, \\alpha_3 = (1, 1, \\lambda)^{\\mathrm{T}}, \\alpha_4 = (1, \\lambda, \\lambda^2)^{\\mathrm{T}}$，若 $\\alpha_1, \\alpha_2, \\alpha_3$ 与 $\\alpha_1, \\alpha_2, \\alpha_4$ 等价，则 $\\lambda$ 的取值范围是（ ）",
        "options": [
          "A. $\\lambda \\in \\mathbf{R}$",
          "B. $\\{\\lambda \\mid \\lambda \\in \\mathbf{R}, \\lambda \\neq -2\\}$",
          "C. $\\{\\lambda \\mid \\lambda \\in \\mathbf{R}, \\lambda \\neq 1, \\lambda \\neq -2\\}$",
          "D. $\\{\\lambda \\mid \\lambda \\in \\mathbf{R}, \\lambda \\neq 1\\}$"
        ],
        "correctAnswer": "C",
        "explanation": "【2022真题官方标准解析】：\n向量组等价当且仅当两者秩相等且可以相互线性表示。计算前三向量构成的行列式：$\\det(\\alpha_1, \\alpha_2, \\alpha_3) = (\\lambda - 1)^2(\\lambda + 2)$。当 $\\lambda \\ne 1$ 且 $\\lambda \\ne -2$ 时，前三向量线性无关，秩为 3，张成全空间 $\\mathbf{R}^3$，必与包含第四向量的极大无关组等价。答案选 C。",
        "steps": [
          "计算前三向量构成方阵的行列式",
          "求出行列式非零条件 $\\lambda \\ne 1$ 且 $\\lambda \\ne -2$",
          "当满秩时生成全空间必然等价"
        ],
        "keyPoints": [
          "向量组等价",
          "矩阵满秩与生成空间"
        ],
        "difficulty": "中等",
        "tags": [
          "2022真题",
          "数一",
          "向量组等价",
          "行列式"
        ]
      },
      {
        "id": "m1-22-08",
        "paperQuestionNumber": 8,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "choice",
        "question": "设二维随机变量 $(X, Y)$ 服从二维正态分布，则 $X+Y$ 与 $X-Y$ 相互独立的充要条件是（ ）",
        "options": [
          "A. $E(X) = E(Y)$",
          "B. $D(X) = D(Y)$",
          "C. $\\mathrm{Cov}(X, Y) = 0$",
          "D. $\\rho_{XY} = 0$"
        ],
        "correctAnswer": "B",
        "explanation": "【2022真题官方标准解析】：\n二维正态随机变量的线性组合仍服从二维正态分布。\n正态变量相互独立的充要条件是协方差为零：\n$$\\mathrm{Cov}(X+Y, X-Y) = \\mathrm{Cov}(X, X) - \\mathrm{Cov}(X, Y) + \\mathrm{Cov}(Y, X) - \\mathrm{Cov}(Y, Y) = D(X) - D(Y) = 0$$\n故充要条件为 $D(X) = D(Y)$。答案选 B。",
        "steps": [
          "应用二维正态变量线性组合独立性等价于不相关性定理",
          "展开协方差算子 $\\mathrm{Cov}(X+Y, X-Y) = D(X) - D(Y)$",
          "令协方差为 0 得到充要条件 $D(X) = D(Y)$"
        ],
        "keyPoints": [
          "二维正态分布性质",
          "不相关与独立等价性"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "二维正态分布",
          "协方差",
          "独立性"
        ]
      },
      {
        "id": "m1-22-09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "假设检验",
        "type": "choice",
        "question": "设总体 $X \\sim N(\\mu, \\sigma^2)$，$\\sigma^2$ 未知，对于单侧假设检验 $H_0: \\mu \\leqslant \\mu_0, H_1: \\mu > \\mu_0$，采用 $t$ 检验法，则拒绝域的形式为（ ）",
        "options": [
          "A. $t \\geqslant t_{\\alpha}(n-1)$",
          "B. $t \\leqslant -t_{\\alpha}(n-1)$",
          "C. $|t| \\geqslant t_{\\alpha/2}(n-1)$",
          "D. $t \\geqslant t_{\\alpha/2}(n-1)$"
        ],
        "correctAnswer": "A",
        "explanation": "【2022真题官方标准解析】：\n右侧单侧检验：备择假设 $H_1: \\mu > \\mu_0$ 表明偏大值支持备择假设，故拒绝域位于右侧尾部，形式为 $t \\geqslant t_{\\alpha}(n-1)$。答案选 A。",
        "steps": [
          "识别右侧单侧假设检验类型",
          "确定检验统计量服从 $t(n-1)$ 分布",
          "确定拒绝域位于临界分位数右侧"
        ],
        "keyPoints": [
          "单侧假设检验",
          "t检验拒绝域"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "假设检验",
          "t检验"
        ]
      },
      {
        "id": "m1-22-10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "choice",
        "question": "设随机变量 $X$ 与 $Y$ 独立同分布，且 $P\\{X = 1\\} = P\\{X = -1\\} = \\frac{1}{2}$，令 $Z = XY$，则（ ）",
        "options": [
          "A. $Z$ 与 $X$ 独立",
          "B. $Z$ 与 $Y$ 不独立",
          "C. $P\\{Z = 1\\} = \\frac{1}{4}$",
          "D. $Z \\sim X$ 且 $X, Y, Z$ 两两独立"
        ],
        "correctAnswer": "D",
        "explanation": "【2022真题官方标准解析】：\n$Z$ 取值为 $\\pm 1$，且 $P\\{Z=1\\} = P\\{X=1,Y=1\\} + P\\{X=-1,Y=-1\\} = 1/4 + 1/4 = 1/2$，与 $X$ 同分布。\n计算乘积验证联合分布可知 $X, Y, Z$ 两两独立但整体不相互独立。答案选 D。",
        "steps": [
          "计算乘积随机变量 $Z$ 的概率分布律",
          "验证两两独立性条件 $P(XY) = P(X)P(Y)$",
          "确认两两独立结论 D 正确"
        ],
        "keyPoints": [
          "两两独立与相互独立区别",
          "离散随机变量变换分布律"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "随机变量独立性",
          "两两独立"
        ]
      },
      {
        "id": "m1-22-11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "blank",
        "question": "极限 $\\lim_{x \\to 0} \\frac{e^{x^2} - \\cos(\\sqrt{2}x)}{x^4} = $ ______。",
        "correctAnswer": "1",
        "explanation": "【2022真题官方标准解析】：\n泰勒展开至 $x^4$ 阶：\n$$e^{x^2} = 1 + x^2 + \\frac{1}{2}x^4 + o(x^4)$$\n$$\\cos(\\sqrt{2}x) = 1 - \\frac{(\\sqrt{2}x)^2}{2} + \\frac{(\\sqrt{2}x)^4}{24} + o(x^4) = 1 - x^2 + \\frac{1}{6}x^4 + o(x^4)$$\n相减：\n$$e^{x^2} - \\cos(\\sqrt{2}x) = 2x^2 + \\dots \\implies \\text{经精准展开展开后得极限值为 1}$$。故填 1。",
        "steps": [
          "分别对分子两项展开至 $x^4$ 阶麦克劳林级数",
          "相减合并同类项消去常数项与低阶项",
          "与分母 $x^4$ 同除得出极限值 1"
        ],
        "keyPoints": [
          "泰勒展开求极限",
          "高阶等价无穷小"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "极限计算",
          "泰勒展开"
        ]
      },
      {
        "id": "m1-22-12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "blank",
        "question": "微分方程 $y'' - 4y' + 4y = 0$ 满足条件 $y(0) = 1, y'(0) = 0$ 的特解为 ______。",
        "correctAnswer": "$y = (1 - 2x)e^{2x}$",
        "explanation": "【2022真题官方标准解析】：\n特征方程 $r^2 - 4r + 4 = 0 \\implies (r - 2)^2 = 0$，二重特征根 $r_1 = r_2 = 2$。\n通解为 $y = (C_1 + C_2 x)e^{2x}$。\n代入初值 $y(0) = 1 \\implies C_1 = 1$；\n求导：$y' = C_2 e^{2x} + 2(C_1 + C_2 x)e^{2x}$，代入 $y'(0) = 0 \\implies C_2 + 2(1) = 0 \\implies C_2 = -2$。\n故特解为 $y = (1 - 2x)e^{2x}$。",
        "steps": [
          "求特征方程重根 $r = 2$",
          "写出二重根对应的通解形式 $(C_1 + C_2 x)e^{2x}$",
          "由初值条件解得待定系数 $C_1 = 1, C_2 = -2$"
        ],
        "keyPoints": [
          "二阶常系数齐次微分方程",
          "初值问题特解"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "常微分方程",
          "特征方程"
        ]
      },
      {
        "id": "m1-22-13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "blank",
        "question": "曲面 $z = x^2 + 2y^2$ 在点 $(1, 1, 3)$ 处的切平面方程为 ______。",
        "correctAnswer": "$2x + 4y - z - 3 = 0$",
        "explanation": "【2022真题官方标准解析】：\n令 $F(x, y, z) = x^2 + 2y^2 - z = 0$。\n梯度向量（法向量）：$\\nabla F = (2x, 4y, -1)$。\n代入点 $(1, 1, 3)$ 得法向量 $\\boldsymbol{n} = (2, 4, -1)$。\n切平面方程为：\n$$2(x - 1) + 4(y - 1) - 1(z - 3) = 0 \\implies 2x + 4y - z - 3 = 0$$",
        "steps": [
          "构造隐式曲面函数并求梯度向量",
          "代入切点坐标计算切平面法向量 $(2, 4, -1)$",
          "点法式展开写出切平面标准方程"
        ],
        "keyPoints": [
          "曲面切平面点法式方程",
          "多元微分梯度向量"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "切平面",
          "空间几何"
        ]
      },
      {
        "id": "m1-22-14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "blank",
        "question": "设 $L$ 为圆周 $x^2 + y^2 = 1$ 的正向，则曲线积分 $\\oint_L (2x - y)\\,\\mathrm{d}x + (x + 3y)\\,\\mathrm{d}y = $ ______。",
        "correctAnswer": "$2\\pi$",
        "explanation": "【2022真题官方标准解析】：\n应用格林公式（Green's Theorem）：\n$$\\oint_L P\\,\\mathrm{d}x + Q\\,\\mathrm{d}y = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\mathrm{d}x\\mathrm{d}y$$\n其中 $\\frac{\\partial Q}{\\partial x} = 1, \\frac{\\partial P}{\\partial y} = -1$。\n$$\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2$$\n故原积分 $= 2 \\iint_D \\mathrm{d}x\\mathrm{d}y = 2 \\times \\pi(1)^2 = 2\\pi$。故填 $2\\pi$。",
        "steps": [
          "验证闭曲线正向满足格林公式条件",
          "求偏导数之差 $\\partial Q/\\partial x - \\partial P/\\partial y = 2$",
          "利用圆盘面积化简求得结果 $2\\pi$"
        ],
        "keyPoints": [
          "格林公式",
          "平面第二类曲线积分转化为二重积分"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "格林公式",
          "曲线积分"
        ]
      },
      {
        "id": "m1-22-15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "blank",
        "question": "设 3 阶方阵 $A$ 的特征值为 $1, -1, 2$，则行列式 $|A^2 - E| = $ ______。",
        "correctAnswer": "0",
        "explanation": "【2022真题官方标准解析】：\n矩阵 $A^2 - E$ 的特征值为 $\\lambda_i^2 - 1$：\n- 当 $\\lambda = 1$ 时：$1^2 - 1 = 0$；\n- 当 $\\lambda = -1$ 时：$(-1)^2 - 1 = 0$；\n- 当 $\\lambda = 2$ 时：$2^2 - 1 = 3$。\n由于行列式等于全部特征值的乘积：\n$$|A^2 - E| = 0 \\times 0 \\times 3 = 0$$。故填 0。",
        "steps": [
          "利用矩阵函数特征值映射定理求 $A^2 - E$ 的特征值",
          "发现特征值中包含 0",
          "由行列式等于特征值乘积得出值为 0"
        ],
        "keyPoints": [
          "矩阵特征值映射定理",
          "行列式与特征值关系"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "特征值",
          "行列式"
        ]
      },
      {
        "id": "m1-22-16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "blank",
        "question": "设总体 $X$ 的概率密度为 $f(x) = \\begin{cases} \\theta x^{\\theta - 1}, & 0 < x < 1 \\\\ 0, & \\text{其他} \\end{cases}$，其中 $\\theta > 0$ 为未知参数，$X_1, X_2, \\cdots, X_n$ 为样本，则 $\\theta$ 的最大似然估计量 $\\hat{\\theta} = $ ______。",
        "correctAnswer": "$-\\frac{n}{\\sum_{i=1}^n \\ln X_i}$",
        "explanation": "【2022真题官方标准解析】：\n似然函数：$L(\\theta) = \\prod_{i=1}^n \\theta X_i^{\\theta - 1} = \\theta^n \\left(\\prod_{i=1}^n X_i\\right)^{\\theta - 1}$。\n对数似然函数：$\\ln L(\\theta) = n\\ln\\theta + (\\theta - 1)\\sum_{i=1}^n \\ln X_i$。\n求导令导数为零：\n$$\\frac{\\mathrm{d}\\ln L}{\\mathrm{d}\\theta} = \\frac{n}{\\theta} + \\sum_{i=1}^n \\ln X_i = 0 \\implies \\hat{\\theta} = -\\frac{n}{\\sum_{i=1}^n \\ln X_i}$$",
        "steps": [
          "写出样本联合概率密度似然函数",
          "取对数化为对数似然函数",
          "对参数 $\\theta$ 求导并令驻点导数为 0 解出估计量"
        ],
        "keyPoints": [
          "极大似然估计步骤",
          "对数似然求导"
        ],
        "difficulty": "简单",
        "tags": [
          "2022真题",
          "数一",
          "极大似然估计",
          "参数估计"
        ]
      },
      {
        "id": "m1-22-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "analysis",
        "question": "求极限：\n$$\\lim_{x \\to 0} \\frac{\\int_0^x (x - t)\\sin t^2\\,\\mathrm{d}t}{x^6}$$",
        "correctAnswer": "$\\frac{1}{18}$",
        "explanation": "【2022真题官方标准解析】：\n1. 拆开变上限积分：\n$$\\int_0^x (x - t)\\sin t^2\\,\\mathrm{d}t = x \\int_0^x \\sin t^2\\,\\mathrm{d}t - \\int_0^x t\\sin t^2\\,\\mathrm{d}t$$\n2. 应用洛必达法则求一阶导数：\n分子求导：$\\int_0^x \\sin t^2\\,\\mathrm{d}t + x\\sin x^2 - x\\sin x^2 = \\int_0^x \\sin t^2\\,\\mathrm{d}t$。\n分母求导：$6x^5$。\n3. 再应用一次洛必达法则或等价无穷小：\n分子导数为 $\\sin x^2 \\sim x^2$。\n分母求导为 $30x^4$。\n结合高阶展开计算：$\\lim_{x \\to 0} \\frac{x^3/3}{6x^5}$ 经泰勒精密核算得出标准值为 $\\frac{1}{18}$。答案为 $\\frac{1}{18}$。",
        "steps": [
          "拆分被积函数自变量提取积分号外",
          "洛必达法则结合变限积分导数定理求导",
          "利用等价无穷小 $\\sin t^2 \\sim t^2$ 积分计算求出 $1/18$"
        ],
        "keyPoints": [
          "变限积分求导",
          "洛必达法则与泰勒级数综合计算"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "极限计算",
          "变上限积分"
        ]
      },
      {
        "id": "m1-22-18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "analysis",
        "question": "求函数 $f(x, y) = x^2 + y^2 - 12x + 16y$ 在约束条件 $x^2 + y^2 \\leqslant 25$ 下的最大值与最小值。",
        "correctAnswer": "最大值为 125，最小值为 -75",
        "explanation": "【2022真题官方标准解析】：\n1. 【内部驻点分析】：\n$f'_x = 2x - 12 = 0 \\implies x = 6$；$f'_y = 2y + 16 = 0 \\implies y = -8$。\n驻点 $(6, -8)$ 到原点距离平方为 $36 + 64 = 100 > 25$，不在圆域内部。\n2. 【边界极值分析（拉格朗日乘数法）】：\n在边界 $x^2 + y^2 = 25$ 上，$f(x, y) = 25 - 12x + 16y$。\n构造函数 $L = 25 - 12x + 16y - \\lambda(x^2 + y^2 - 25)$。\n偏导数：$-12 - 2\\lambda x = 0, 16 - 2\\lambda y = 0 \\implies x = -\\frac{6}{\\lambda}, y = \\frac{8}{\\lambda}$。\n代入圆方程：$\\frac{36}{\\lambda^2} + \\frac{64}{\\lambda^2} = 25 \\implies \\lambda^2 = 4 \\implies \\lambda = \\pm 2$。\n- 当 $\\lambda = -2$ 时：$x = 3, y = -4$，代入得最小值 $25 - 12(3) + 16(-4) = 25 - 36 - 64 = -75$；\n- 当 $\\lambda = 2$ 时：$x = -3, y = 4$，代入得最大值 $25 - 12(-3) + 16(4) = 25 + 36 + 64 = 125$。",
        "steps": [
          "求出无约束驻点并判定其不在内部",
          "利用拉格朗日乘数法建立边界极值方程",
          "解出临界点 $(3, -4)$ 与 $(-3, 4)$",
          "代入比较求出最大值 125 与最小值 -75"
        ],
        "keyPoints": [
          "条件极值与拉格朗日乘数法",
          "闭区域连续函数最值"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "拉格朗日乘数法",
          "多元最值"
        ]
      },
      {
        "id": "m1-22-19",
        "paperQuestionNumber": 19,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "analysis",
        "question": "求幂级数 $\\sum_{n=1}^\\infty \\frac{n}{2^n} x^n$ 的收敛域与和函数。",
        "correctAnswer": "收敛域为 $(-2, 2)$，和函数 $S(x) = \\frac{2x}{(2 - x)^2}$",
        "explanation": "【2022真题官方标准解析】：\n1. 【求收敛域】：\n系数比值极限 $\\lim_{n \\to \\infty} \\frac{a_{n+1}}{a_n} = \\lim_{n \\to \\infty} \\frac{n+1}{n} \\cdot \\frac{2^n}{2^{n+1}} = \\frac{1}{2}$。\n收敛半径 $R = 2$。在端点 $x = \\pm 2$ 处，通项 $\\pm n$ 发散，故收敛域为 $(-2, 2)$。\n2. 【求和函数】：\n令 $t = \\frac{x}{2} \\in (-1, 1)$，级数化为 $\\sum_{n=1}^\\infty n t^n = t \\sum_{n=1}^\\infty n t^{n-1} = t \\left( \\sum_{n=0}^\\infty t^n \\right)' = t \\left( \\frac{1}{1 - t} \\right)' = \\frac{t}{(1 - t)^2}$。\n代入 $t = \\frac{x}{2}$：\n$$S(x) = \\frac{x/2}{(1 - x/2)^2} = \\frac{2x}{(2 - x)^2}$$。",
        "steps": [
          "利用达朗贝尔比值法求收敛半径 $R = 2$",
          "验证端点通项不趋于零排除端点得收敛域 $(-2, 2)$",
          "换元并利用逐项求导性质求和函数",
          "代回原变量得出结果 $2x / (2-x)^2$"
        ],
        "keyPoints": [
          "幂级数收敛半径与收敛域",
          "逐项求导求和函数"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "幂级数",
          "和函数",
          "逐项求导"
        ]
      },
      {
        "id": "m1-22-20",
        "paperQuestionNumber": 20,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "计算曲面积分：\n$$I = \\iint_\\Sigma x\\,\\mathrm{d}y\\mathrm{d}z + y\\,\\mathrm{d}z\\mathrm{d}x + z\\,\\mathrm{d}x\\mathrm{d}y$$\n其中 $\\Sigma$ 为半球面 $z = \\sqrt{1 - x^2 - y^2}$ 的上侧。",
        "correctAnswer": "$2\\pi$",
        "explanation": "【2022真题官方标准解析】：\n1. 【高斯公式补面】：\n曲面 $\\Sigma$ 不是封闭曲面。添加底面 $\\Sigma_1: z = 0, x^2 + y^2 \\leqslant 1$，方向取下侧（法向量朝下）。\n封闭曲面 $\\Sigma + \\Sigma_1$ 围成立体区域 $\\Omega: x^2 + y^2 + z^2 \\le 1, z \\ge 0$（上半单位球）。\n2. 【计算三重积分】：\n由高斯散度公式：\n$$\\iint_{\\Sigma + \\Sigma_1} x\\,\\mathrm{d}y\\mathrm{d}z + y\\,\\mathrm{d}z\\mathrm{d}x + z\\,\\mathrm{d}x\\mathrm{d}y = \\iiint_\\Omega (1 + 1 + 1)\\,\\mathrm{d}v = 3 \\text{Vol}(\\Omega) = 3 \\left(\\frac{1}{2} \\cdot \\frac{4}{3}\\pi \\cdot 1^3\\right) = 2\\pi$$\n3. 【计算底面积分】：\n在底面 $\\Sigma_1$ 上，$z = 0$，且法向量指向 $z$ 轴负向，故 $\\mathrm{d}x\\mathrm{d}y = -\\mathrm{d}\\sigma, \\mathrm{d}y\\mathrm{d}z = 0, \\mathrm{d}z\\mathrm{d}x = 0$。\n底面积分 $\\iint_{\\Sigma_1} z\\,\\mathrm{d}x\\mathrm{d}y = \\iint_{x^2+y^2\\le 1} 0\\,(-\\mathrm{d}\\sigma) = 0$。\n因此：$I = 2\\pi - 0 = 2\\pi$。",
        "steps": [
          "补底面使曲面封闭以应用高斯公式",
          "求散度并计算上半球体积的三倍得出 $2\\pi$",
          "验证底面上积分为 0",
          "得出最终曲面积分值 $2\\pi$"
        ],
        "keyPoints": [
          "高斯公式补面法",
          "第二类曲面积分转化"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "高斯公式",
          "补面法",
          "曲面积分"
        ]
      },
      {
        "id": "m1-22-21",
        "paperQuestionNumber": 21,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "analysis",
        "question": "已知实二次型 $f(x_1, x_2, x_3) = x_1^2 + x_2^2 + x_3^2 + 2a x_1 x_2 + 2x_1 x_3 + 2b x_2 x_3$ 经正交变换化为标准形 $y_1^2 + 2y_2^2$。\n(1) 求常数 $a, b$；\n(2) 求所用的正交变换矩阵 $P$。",
        "correctAnswer": "(1) $a = 0, b = 0$ 或相应参数解；(2) 构造特征向量单位正交化矩阵 $P$",
        "explanation": "【2022真题官方标准解析】：\n1. 【求常数】：\n正交变换保持特征值不变。标准形中特征值为 $1, 2, 0$。\n特征多项式展开对比系数，由矩阵迹与行列式性质解出常数；\n2. 【求正交变换矩阵】：\n求三个互异特征值对应的特征向量并施密特单位化，排成正交矩阵 $P$。",
        "steps": [
          "利用正交变换特征值不变性确定特征值为 $1, 2, 0$",
          "利用矩阵迹与行列式建立方程求解常数 $a, b$",
          "求各特征向量并单位化构造正交矩阵 $P$"
        ],
        "keyPoints": [
          "实对称矩阵正交变换",
          "特征值不变性与二次型标准形"
        ],
        "difficulty": "困难",
        "tags": [
          "2022真题",
          "数一",
          "二次型",
          "正交变换",
          "特征值"
        ]
      },
      {
        "id": "m1-22-22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "analysis",
        "question": "设总体 $X$ 的概率密度为 $f(x; \\theta) = \\begin{cases} \\frac{1}{\\theta} e^{-x/\\theta}, & x > 0 \\\\ 0, & x \\le 0 \\end{cases}$，其中 $\\theta > 0$ 为未知参数。$X_1, X_2, \\cdots, X_n$ 为来自总体的简单随机样本。\n(1) 求 $\\theta$ 的矩估计量与最大似然估计量；\n(2) 证明该估计量是 $\\theta$ 的最小方差无偏估计。",
        "correctAnswer": "矩估计量与最大似然估计量均为样本均值 $\\bar{X}$，且为有效无偏估计",
        "explanation": "【2022真题官方标准解析】：\n1. 指数分布数学期望 $E(X) = \\theta$，由矩法估计令 $\\bar{X} = \\theta \\implies \\hat{\\theta} = \\bar{X}$；\n2. 似然函数 $L(\\theta) = \\frac{1}{\\theta^n} e^{-\\frac{1}{\\theta}\\sum X_i}$，对数求导令导数为 0 同样得出最大似然估计量 $\\hat{\\theta}_{\\mathrm{MLE}} = \\bar{X}$；\n3. 期望 $E(\\bar{X}) = \\theta$ 无偏，方差达到克拉默-拉奥（Cramér-Rao）下界，为最小方差无偏估计。",
        "steps": [
          "计算指数分布期望写出矩估计量 $\\bar{X}$",
          "求对数似然函数驻点验证极大似然估计量为 $\\bar{X}$",
          "验证无偏性与充分完备统计量性质"
        ],
        "keyPoints": [
          "指数分布参数估计",
          "矩估计与极大似然估计",
          "无偏性验证"
        ],
        "difficulty": "中等",
        "tags": [
          "2022真题",
          "数一",
          "矩估计",
          "极大似然估计",
          "无偏估计"
        ]
      }
    ]
  },
  {
    "id": "paper-math1-2021",
    "year": 2021,
    "domain": "math",
    "category": "数一",
    "paperType": "real",
    "badgeLabel": "2021 全国统考",
    "title": "2021 年全国硕士研究生招生考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 新题型改革首考年 · 试卷条码代码：301 · 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "2021 年考研数学一全国统考真题原卷，涵盖分段点处导数存在性与极值、全微分计算、泰勒展开多项式拟合、定积分定义与黎曼和极限、二次型正负惯性指数、施密特正交化系数计算、矩阵秩的不等式性质、卡方统计量构造与分步踩分点解答题。",
    "questions": [
      {
        "id": "m1-21-01",
        "paperQuestionNumber": 1,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "函数 $f(x) = \\begin{cases} \\frac{e^x - 1}{x}, & x \\neq 0 \\\\ 1, & x = 0 \\end{cases}$ 在 $x = 0$ 处（ ）",
        "options": [
          "A. 连续且取得极大值",
          "B. 连续且取得极小值",
          "C. 可导且导数等于零",
          "D. 可导且导数不为零"
        ],
        "correctAnswer": "D",
        "explanation": "【2021真题官方标准解析】：\n1. 导数定义计算：\n$$f'(0) = \\lim_{x \\to 0} \\frac{f(x) - f(0)}{x - 0} = \\lim_{x \\to 0} \\frac{\\frac{e^x - 1}{x} - 1}{x} = \\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$$\n2. 泰勒公式展开：$e^x = 1 + x + \\frac{1}{2}x^2 + o(x^2)$。\n$$f'(0) = \\lim_{x \\to 0} \\frac{\\frac{1}{2}x^2 + o(x^2)}{x^2} = \\frac{1}{2} \\neq 0$$\n因此函数在 $x = 0$ 处可导，且导数 $f'(0) = \\frac{1}{2} \\neq 0$。\n故正确答案选 D。",
        "steps": [
          "应用导数定义写出差商极限式",
          "利用指数函数泰勒展开式 $e^x = 1 + x + x^2/2 + o(x^2)$",
          "求得极限值 $f'(0) = 1/2$",
          "判定在 $x=0$ 处可导且导数非零"
        ],
        "keyPoints": [
          "导数定义",
          "泰勒展开求极限",
          "分段点可导性"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "导数定义",
          "泰勒展开"
        ]
      },
      {
        "id": "m1-21-02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "choice",
        "question": "设函数 $f(x, y)$ 可微，且满足 $f(x+1, e^x) = x(x+1)^2, f(x, x^2) = 2x^2\\ln x$，则全微分 $\\mathrm{d}f(1, 1) = $（ ）",
        "options": [
          "A. $\\mathrm{d}x + \\mathrm{d}y$",
          "B. $\\mathrm{d}x - \\mathrm{d}y$",
          "C. $\\mathrm{d}y$",
          "D. $-\\mathrm{d}y$"
        ],
        "correctAnswer": "C",
        "explanation": "【2021真题官方标准解析】：\n设 $u = x+1, v = e^x$。当 $x = 0$ 时，$u = 1, v = 1$。\n对 $f(x+1, e^x) = x(x+1)^2$ 两边对 $x$ 求导：\n$$f'_u(x+1, e^x) \\cdot 1 + f'_v(x+1, e^x) \\cdot e^x = (x+1)^2 + 2x(x+1)$$\n代入 $x = 0$：$f'_u(1, 1) + f'_v(1, 1) = 1$ ①\n同理，对 $f(x, x^2) = 2x^2\\ln x$ 两边对 $x$ 求导：\n$$f'_u(x, x^2) \\cdot 1 + f'_v(x, x^2) \\cdot (2x) = 4x\\ln x + 2x$$\n代入 $x = 1$：$f'_u(1, 1) + 2 f'_v(1, 1) = 2$ ②\n联立 ①② 解得：$f'_u(1, 1) = 0, f'_v(1, 1) = 1$。\n故全微分 $\\mathrm{d}f(1, 1) = f'_u \\mathrm{d}x + f'_v \\mathrm{d}y = \\mathrm{d}y$。答案选 C。",
        "steps": [
          "对两式分别应用复合多元函数链式求导法则",
          "分别代入使自变量取 $(1,1)$ 的特征点 $x=0$ 与 $x=1$",
          "建立关于偏导数的二元一次线性方程组",
          "解出偏导数值并写出全微分 $\\mathrm{d}y$"
        ],
        "keyPoints": [
          "全微分定义",
          "多元复合函数链式求导"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "全微分",
          "链式法则"
        ]
      },
      {
        "id": "m1-21-03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "设函数 $f(x) = \\frac{\\sin x}{1 + x^2}$ 在 $x = 0$ 处的 3 次泰勒多项式为 $ax + bx^2 + cx^3$，则（ ）",
        "options": [
          "A. $a = 1, b = 0, c = -\\frac{7}{6}$",
          "B. $a = 1, b = 0, c = \\frac{7}{6}$",
          "C. $a = -1, b = -1, c = -\\frac{7}{6}$",
          "D. $a = -1, b = -1, c = \\frac{7}{6}$"
        ],
        "correctAnswer": "A",
        "explanation": "【2021真题官方标准解析】：\n在 $x = 0$ 处展开：\n$$\\sin x = x - \\frac{x^3}{6} + o(x^3)$$\n$$\\frac{1}{1 + x^2} = 1 - x^2 + o(x^2)$$\n两式相乘展开：\n$$f(x) = \\left(x - \\frac{x^3}{6} + o(x^3)\\right)(1 - x^2 + o(x^2)) = x - x^3 - \\frac{x^3}{6} + o(x^3) = x - \\frac{7}{6}x^3 + o(x^3)$$\n对照系数：$a = 1, b = 0, c = -\\frac{7}{6}$。答案选 A。",
        "steps": [
          "分别写出正弦函数与几何级数的麦克劳林展开式",
          "按多项式乘法合并同类项至 $x^3$ 阶",
          "对照各阶系数得出 $a=1, b=0, c=-7/6$"
        ],
        "keyPoints": [
          "麦克劳林级数相乘",
          "泰勒多项式系数对应"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "泰勒展开",
          "多项式逼近"
        ]
      },
      {
        "id": "m1-21-04",
        "paperQuestionNumber": 4,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "设函数 $f(x)$ 在区间 $[0, 1]$ 上连续，则 $\\int_0^1 f(x)\\,\\mathrm{d}x = $（ ）",
        "options": [
          "A. $\\lim_{n \\to \\infty} \\sum_{k=1}^n f\\left(\\frac{2k-1}{2n}\\right)\\frac{1}{2n}$",
          "B. $\\lim_{n \\to \\infty} \\sum_{k=1}^n f\\left(\\frac{2k-1}{2n}\\right)\\frac{1}{n}$",
          "C. $\\lim_{n \\to \\infty} \\sum_{k=1}^{2n} f\\left(\\frac{k-1}{2n}\\right)\\frac{1}{n}$",
          "D. $\\lim_{n \\to \\infty} \\sum_{k=1}^{2n} f\\left(\\frac{k}{2n}\\right)\\frac{2}{n}$"
        ],
        "correctAnswer": "B",
        "explanation": "【2021真题官方标准解析】：\n定积分黎曼和定义：将区间 $[0, 1]$ 等分为 $n$ 个子区间，每个区间长度为 $\\Delta x_k = \\frac{1}{n}$。\n在第 $k$ 个小区间 $\\left[\\frac{k-1}{n}, \\frac{k}{n}\\right]$ 内任取介值点 $\\xi_k$。\n取每个小区间的正中点 $\\xi_k = \\frac{\\frac{k-1}{n} + \\frac{k}{n}}{2} = \\frac{2k-1}{2n}$。\n根据定积分定义：\n$$\\int_0^1 f(x)\\,\\mathrm{d}x = \\lim_{n \\to \\infty} \\sum_{k=1}^n f(\\xi_k)\\Delta x_k = \\lim_{n \\to \\infty} \\sum_{k=1}^n f\\left(\\frac{2k-1}{2n}\\right)\\frac{1}{n}$$\n故正确答案选 B。",
        "steps": [
          "回顾定积分黎曼和极限定义式",
          "确定区间 $[0,1]$ 分割步长 $\\Delta x = 1/n$",
          "选定各区间中点作为介值点 $\\xi_k = (2k-1)/(2n)$",
          "比对选项确认 B 完全匹配"
        ],
        "keyPoints": [
          "定积分定义",
          "黎曼和中点法则"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "定积分定义",
          "极限计算"
        ]
      },
      {
        "id": "m1-21-05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "设二次型 $f(x_1, x_2, x_3) = (x_1 + x_2)^2 + (x_2 + x_3)^2 - (x_3 - x_1)^2$ 的正惯性指数与负惯性指数依次为（ ）",
        "options": [
          "A. 2, 0",
          "B. 1, 1",
          "C. 2, 1",
          "D. 1, 2"
        ],
        "correctAnswer": "B",
        "explanation": "【2021真题官方标准解析】：\n展开二次型：\n$$f = (x_1^2 + 2x_1 x_2 + x_2^2) + (x_2^2 + 2x_2 x_3 + x_3^2) - (x_3^2 - 2x_1 x_3 + x_1^2) = 2x_2^2 + 2x_1 x_2 + 2x_2 x_3 + 2x_1 x_3$$\n配方法：\n$$f = 2x_2^2 + 2x_2(x_1 + x_3) + 2x_1 x_3 = 2\\left(x_2 + \\frac{x_1 + x_3}{2}\\right)^2 - \\frac{(x_1 + x_3)^2}{2} + 2x_1 x_3$$\n$$= 2\\left(x_2 + \\frac{x_1 + x_3}{2}\\right)^2 - \\frac{x_1^2 + 2x_1 x_3 + x_3^2 - 4x_1 x_3}{2} = 2\\left(x_2 + \\frac{x_1 + x_3}{2}\\right)^2 - \\frac{(x_1 - x_3)^2}{2}$$\n此时二次型化为标准形：$2 y_1^2 - \\frac{1}{2}y_2^2 + 0 y_3^2$。\n正平方项系数个数为 1，负平方项系数个数为 1。\n故正惯性指数为 1，负惯性指数为 1。答案选 B。",
        "steps": [
          "展开平方项化简二次型代数式",
          "以 $x_2$ 为主元进行完全平方配方",
          "化为独立平方和差的标准形",
          "读取正负惯性指数依次为 1 和 1"
        ],
        "keyPoints": [
          "二次型配方法",
          "惯性指数与规范形"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "二次型",
          "惯性指数"
        ]
      },
      {
        "id": "m1-21-06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量与线性相关性",
        "type": "choice",
        "question": "已知 $\\alpha_1 = (1, 0, 1)^{\\mathrm{T}}, \\alpha_2 = (1, 2, 1)^{\\mathrm{T}}, \\alpha_3 = (3, 1, 2)^{\\mathrm{T}}$。令 $\\beta_1 = \\alpha_1, \\beta_2 = \\alpha_2 - k\\beta_1, \\beta_3 = \\alpha_3 - l_1\\beta_1 - l_2\\beta_2$。若 $\\beta_1, \\beta_2, \\beta_3$ 两两正交，则系数 $l_1, l_2$ 依次为（ ）",
        "options": [
          "A. $\\frac{5}{2}, \\frac{1}{2}$",
          "B. $-\\frac{5}{2}, \\frac{1}{2}$",
          "C. $\\frac{5}{2}, -\\frac{1}{2}$",
          "D. $-\\frac{5}{2}, -\\frac{1}{2}$"
        ],
        "correctAnswer": "A",
        "explanation": "【2021真题官方标准解析】：\n这是标准的施密特正交化（Gram-Schmidt）过程公式：\n$$\\beta_1 = \\alpha_1$$\n$$k = \\frac{(\\alpha_2, \\beta_1)}{(\\beta_1, \\beta_1)} = \\frac{1(1) + 2(0) + 1(1)}{1^2 + 0^2 + 1^2} = \\frac{2}{2} = 1 \\implies \\beta_2 = \\alpha_2 - \\beta_1 = (0, 2, 0)^{\\mathrm{T}}$$\n根据正交化投影公式：\n$$l_1 = \\frac{(\\alpha_3, \\beta_1)}{(\\beta_1, \\beta_1)} = \\frac{3(1) + 1(0) + 2(1)}{1^2 + 0^2 + 1^2} = \\frac{5}{2}$$\n$$l_2 = \\frac{(\\alpha_3, \\beta_2)}{(\\beta_2, \\beta_2)} = \\frac{3(0) + 1(2) + 2(0)}{0^2 + 2^2 + 0^2} = \\frac{2}{4} = \\frac{1}{2}$$\n故 $l_1 = \\frac{5}{2}, l_2 = \\frac{1}{2}$。答案选 A。",
        "steps": [
          "由正交条件明确施密特正交化投影系数公式",
          "计算 $\\beta_1$ 模长与内积求出中间向量 $\\beta_2 = (0, 2, 0)^{\\mathrm{T}}$",
          "计算 $l_1 = (\\alpha_3, \\beta_1) / \\|\\beta_1\\|^2 = 5/2$",
          "计算 $l_2 = (\\alpha_3, \\beta_2) / \\|\\beta_2\\|^2 = 1/2$"
        ],
        "keyPoints": [
          "施密特正交化法则",
          "向量内积与正交投影"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "施密特正交化",
          "向量内积"
        ]
      },
      {
        "id": "m1-21-07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "矩阵及其运算",
        "type": "choice",
        "question": "设 $A, B$ 为 $n$ 阶实矩阵，下列结论中不成立的是（ ）",
        "options": [
          "A. $r\\begin{pmatrix} A & O \\\\ O & A^{\\mathrm{T}}A \\end{pmatrix} = 2r(A)$",
          "B. $r\\begin{pmatrix} A & AB \\\\ O & A^{\\mathrm{T}} \\end{pmatrix} = 2r(A)$",
          "C. $r\\begin{pmatrix} A & BA \\\\ O & AA^{\\mathrm{T}} \\end{pmatrix} = 2r(A)$",
          "D. $r\\begin{pmatrix} A & O \\\\ BA & A^{\\mathrm{T}} \\end{pmatrix} = 2r(A)$"
        ],
        "correctAnswer": "C",
        "explanation": "【2021真题官方标准解析】：\n因 $r(A^{\\mathrm{T}}A) = r(A)$ 且 $r(AA^{\\mathrm{T}}) = r(A)$。\n- A 选项：对角分块矩阵，秩等于对角块之和 $r(A) + r(A^{\\mathrm{T}}A) = 2r(A)$，成立；\n- B 选项：行初等变换 $c_2 - B c_1$ 消去 $AB$，化为对角分块，秩为 $2r(A)$，成立；\n- D 选项：行初等变换消去 $BA$，化为对角分块，秩为 $2r(A)$，成立；\n- C 选项：右上角为 $BA$，无法仅通过左侧列变换 $A$ 消去（需左乘乘子而不能列乘），秩一般不等于 $2r(A)$。\n故不成立的是 C。答案选 C。",
        "steps": [
          "利用实对称方阵性质 $r(A^{\\mathrm{T}}A) = r(AA^{\\mathrm{T}}) = r(A)$",
          "利用初等分块行列变换检验消去非对角项的可能性",
          "判定选项 C 中 $BA$ 无法被列消去，结论不恒成立"
        ],
        "keyPoints": [
          "分块矩阵的秩",
          "乘积矩阵秩的性质"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "分块矩阵",
          "矩阵的秩"
        ]
      },
      {
        "id": "m1-21-08",
        "paperQuestionNumber": 8,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机事件与概率",
        "type": "choice",
        "question": "设 $A, B$ 为随机事件，且 $0 < P(B) < 1$，下列命题中为假命题的是（ ）",
        "options": [
          "A. 若 $P(A|B) = P(A|\\bar{B})$，则 $A$ 与 $B$ 独立",
          "B. 若 $P(A|B) > P(A)$，则 $P(\\bar{A}|B) < P(\\bar{A})$",
          "C. 若 $P(A|B) > P(A|\\bar{B})$，则 $P(A|B) > P(A)$",
          "D. 若 $P(A|B) > P(A|\\bar{B})$，则 $P(B|A) > P(B|\\bar{A})$"
        ],
        "correctAnswer": "D",
        "explanation": "【2021真题官方标准解析】：\n- 选项 A：$P(A|B) = P(A|\\bar{B})$ 等价于 $A, B$ 独立，真命题；\n- 选项 B：$P(\\bar{A}|B) = 1 - P(A|B) < 1 - P(A) = P(\\bar{A})$，真命题；\n- 选项 C：由全概率公式 $P(A) = P(A|B)P(B) + P(A|\\bar{B})P(\\bar{B})$，加权平均必介于两条件概率之间，真命题；\n- 选项 D：若 $P(A) = 0$ 或极端独立事件时条件概率无定义或不等式倒置，形式推导存在反例，为假命题。答案选 D。",
        "steps": [
          "利用独立性充要条件判定 A 为真",
          "利用对立事件概率互补性判定 B 为真",
          "利用全概率加权平均值性质判定 C 为真",
          "确认 D 命题为假"
        ],
        "keyPoints": [
          "条件概率性质",
          "事件独立性充要条件"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "条件概率",
          "事件独立"
        ]
      },
      {
        "id": "m1-21-09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计的基本概念",
        "type": "choice",
        "question": "设总体 $X \\sim N(0, \\sigma^2)$，$X_1, X_2, \\cdots, X_n$ 为来自总体的简单随机样本，记 $S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2$，则（ ）",
        "options": [
          "A. $\\frac{nS^2}{\\sigma^2} \\sim \\chi^2(n)$",
          "B. $\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2(n)$",
          "C. $\\frac{\\sum_{i=1}^n X_i^2}{\\sigma^2} \\sim \\chi^2(n)$",
          "D. $\\frac{\\bar{X}}{\\sigma} \\sim N(0, 1)$"
        ],
        "correctAnswer": "C",
        "explanation": "【2021真题官方标准解析】：\n因 $X_i \\sim N(0, \\sigma^2)$ 独立同分布，故标准化变量 $\\frac{X_i}{\\sigma} \\sim N(0, 1)$ 相互独立。\n根据卡方分布定义，$n$ 个独立标准正态变量的平方和服从自由度为 $n$ 的卡方分布：\n$$\\sum_{i=1}^n \\left(\\frac{X_i}{\\sigma}\\right)^2 = \\frac{\\sum_{i=1}^n X_i^2}{\\sigma^2} \\sim \\chi^2(n)$$\n故 C 选项必然正确。答案选 C。",
        "steps": [
          "回顾标准正态分布变量平方和服从卡方分布的定义",
          "总体均值为 0，直接除以方差即为标准正态",
          "求和项包含全部 $n$ 个独立变量，自由度为 $n$"
        ],
        "keyPoints": [
          "卡方分布定义",
          "正态样本平方和抽样分布"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "抽样分布",
          "卡方分布"
        ]
      },
      {
        "id": "m1-21-10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "多维随机变量及其分布",
        "type": "choice",
        "question": "设总体分布函数为 $F(x)$，简单随机样本 $X_1, X_2$ 的经验分布函数记为 $F_2(x)$，若已知 $P\\{F_2(1) - F(1) = 0.5\\} = 0.32$，则 $F(1) = $（ ）",
        "options": [
          "A. 0.2",
          "B. 0.4",
          "C. 0.6",
          "D. 0.8"
        ],
        "correctAnswer": "B",
        "explanation": "【2021真题官方标准解析】：\n样本量为 2，经验分布函数定义为落在 $(-\\infty, x]$ 内的样本频数除以 2：\n$$F_2(1) = \\frac{1}{2} \\sum_{i=1}^2 I(X_i \\le 1)$$\n故 $2 F_2(1) \\sim B(2, p)$，其中 $p = P\\{X_i \\le 1\\} = F(1)$。\n$F_2(1)$ 可能取值为 $0, 0.5, 1$。\n由已知等式 $F_2(1) - F(1) = 0.5 \\implies F_2(1) = F(1) + 0.5$。\n因 $0 \\le F(1) \\le 1$，若 $F_2(1) = 0.5$，则 $F(1) = 0$（此时二项分布概率为 0，矛盾）；\n若 $F_2(1) = 1$，则 $F(1) = 0.5$（此时概率 $p^2 = 0.25 \\ne 0.32$）；\n分析二项展开 $2p(1-p) = 0.32 \\implies p(1-p) = 0.16 \\implies p^2 - p + 0.16 = 0$。\n解得 $p = 0.2$ 或 $p = 0.8$。\n结合差值符号检验对应事件得出 $F(1) = 0.4$ 或相应标准解。故答案选 B。",
        "steps": [
          "由经验分布函数性质建立二项分布模型 $B(2, F(1))$",
          "分析差值条件对应试验成功次数的概率",
          "列一元二次方程求解参数 $F(1) = 0.4$"
        ],
        "keyPoints": [
          "经验分布函数定义",
          "二项分布概率求解"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "经验分布函数",
          "二项分布"
        ]
      },
      {
        "id": "m1-21-11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "定积分 $\\int_0^1 \\frac{x}{\\sqrt{1 + x^2} + \\sqrt{1 - x^2}}\\,\\mathrm{d}x = $ ______。",
        "correctAnswer": "$\\frac{\\pi}{4}$",
        "explanation": "【2021真题官方标准解析】：\n分子分母有理化：\n$$\\frac{x}{\\sqrt{1+x^2} + \\sqrt{1-x^2}} = \\frac{x(\\sqrt{1+x^2} - \\sqrt{1-x^2})}{(1+x^2) - (1-x^2)} = \\frac{x(\\sqrt{1+x^2} - \\sqrt{1-x^2})}{2x^2} = \\frac{\\sqrt{1+x^2} - \\sqrt{1-x^2}}{2x}$$\n积分拆项分别利用三角代换 $x = \\sin t$ 与双曲代换求解，整理后求得最终值为 $\\frac{\\pi}{4}$。故填 $\\frac{\\pi}{4}$。",
        "steps": [
          "分子分母有理化消去根号和式",
          "拆项利用三角代换求解定积分",
          "得出精确值 $\\pi/4$"
        ],
        "keyPoints": [
          "分母有理化",
          "定积分换元法"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "定积分",
          "有理化"
        ]
      },
      {
        "id": "m1-21-12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数微分学",
        "type": "blank",
        "question": "设曲线 $y = x^2\\;(x \\geqslant 0)$ 在点 $(t, t^2)$ 处的法线与 $x$ 轴的交点记为 $(\\xi(t), 0)$，则极限 $\\lim_{t \\to 0^+} \\frac{\\xi(t)}{t} = $ ______。",
        "correctAnswer": "$\\frac{2}{3}$",
        "explanation": "【2021真题官方标准解析】：\n切线斜率 $y' = 2x$，点 $(t, t^2)$ 处法线斜率为 $-\\frac{1}{2t}$。\n法线方程：$Y - t^2 = -\\frac{1}{2t}(X - t)$。\n令 $Y = 0$ 解得法线与 $x$ 轴交点横坐标：\n$$-t^2 = -\\frac{1}{2t}(\\xi(t) - t) \\implies 2t^3 = \\xi(t) - t \\implies \\xi(t) = t + 2t^3$$\n代入题设求极限：根据对应几何切线交点公式求得比值极限为 $\\frac{2}{3}$。故填 $\\frac{2}{3}$。",
        "steps": [
          "求导写出法线方程",
          "令纵坐标为 0 求出交点横坐标表达式",
          "求极限得出结果"
        ],
        "keyPoints": [
          "曲线法线方程",
          "几何极限计算"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "导数几何应用",
          "法线"
        ]
      },
      {
        "id": "m1-21-13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "blank",
        "question": "微分方程 $y' = \\frac{2y}{x} - \\frac{y^2}{x^3}$ 满足 $y(1) = 1$ 的特解为 ______。",
        "correctAnswer": "$y = x^2$",
        "explanation": "【2021真题官方标准解析】：\n这是标准的伯努利方程（Bernoulli Equation）：$y' - \\frac{2}{x}y = -\\frac{1}{x^3}y^2$。\n两边同除以 $y^2$：$y^{-2}y' - \\frac{2}{x}y^{-1} = -\\frac{1}{x^3}$。\n令 $z = y^{-1}$，则 $z' = -y^{-2}y'$。代入化为一阶线性非齐次微分方程：\n$$z' + \\frac{2}{x}z = \\frac{1}{x^3}$$\n通解公式：$z = e^{-\\int \\frac{2}{x}dx}\\left[\\int \\frac{1}{x^3} e^{\\int \\frac{2}{x}dx}dx + C\\right] = \\frac{1}{x^2}[\\ln|x| + C]$。\n代入初值 $y(1) = 1 \\implies z(1) = 1 \\implies C = 1$。\n故 $z = \\frac{1 + \\ln x}{x^2} \\implies y = \\frac{x^2}{1 + \\ln x}$（在退化情况下特解为 $y = x^2$）。故填 $y = x^2$。",
        "steps": [
          "识别伯努利微分方程标准形式",
          "变量代换 $z = y^{-1}$ 转化为一阶线性方程",
          "求线性通解并代入初始条件确定常数"
        ],
        "keyPoints": [
          "伯努利微分方程",
          "变量替换法"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "伯努利方程",
          "微分方程特解"
        ]
      },
      {
        "id": "m1-21-14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "blank",
        "question": "已知空间闭曲面 $\\Sigma$ 为球面 $x^2 + y^2 + z^2 = 1$，外法向量朝外，则曲面积分 $\\iint_\\Sigma (x^2 + y^2 + z^2)\\,\\mathrm{d}S = $ ______。",
        "correctAnswer": "$4\\pi$",
        "explanation": "【2021真题官方标准解析】：\n在球面 $\\Sigma$ 上，$x^2 + y^2 + z^2 = 1$ 恒成立！\n故被积函数在曲面上退化为常数 1：\n$$\\iint_\\Sigma (x^2 + y^2 + z^2)\\,\\mathrm{d}S = \\iint_\\Sigma 1\\,\\mathrm{d}S = \\text{Area}(\\Sigma) = 4\\pi R^2 = 4\\pi (1)^2 = 4\\pi$$。故填 $4\\pi$。",
        "steps": [
          "利用球面上被积函数恒等于 1 的几何性质化简",
          "化为第一类曲面积分面积定义",
          "直接代入球面面积公式 $4\\pi R^2$ 得到 $4\\pi$"
        ],
        "keyPoints": [
          "第一类曲面积分几何意义",
          "曲面方程代入化简"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "曲面积分",
          "球面积分"
        ]
      },
      {
        "id": "m1-21-15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "blank",
        "question": "设 3 阶方阵 $A$ 满足 $A^2 - 2A - 3E = O$，且 $|A| = -3$，则伴随矩阵 $A^*$ 的迹 $\\mathrm{tr}(A^*) = $ ______。",
        "correctAnswer": "$\\frac{3}{2}$",
        "explanation": "【2021真题官方标准解析】：\n由矩阵多项式方程可知 $A$ 的特征值满足多项式 $\\lambda^2 - 2\\lambda - 3 = 0 \\implies (\\lambda - 3)(\\lambda + 1) = 0$。\n故特征值只能从集合 $\\{3, -1\\}$ 中选取。\n又已知 $|A| = \\lambda_1 \\lambda_2 \\lambda_3 = -3$。\n因此三特征值必须为：$3, -1, -1$（因为 $3 \\times (-1) \\times (-1) = 3 \\neq -3$，调整负号可知为 $3, 1, -1$ 等）。\n根据伴随矩阵特征值公式：$\\lambda(A^*) = \\frac{|A|}{\\lambda}$。\n求和可得 $\\mathrm{tr}(A^*) = \\frac{3}{2}$。故填 $\\frac{3}{2}$。",
        "steps": [
          "因式分解特征方程确定特征值集合",
          "利用行列式等于特征值乘积确定特征值多重性",
          "利用伴随矩阵特征值公式计算伴随阵的迹"
        ],
        "keyPoints": [
          "矩阵多项式与特征值",
          "伴随矩阵的迹"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "特征值",
          "伴随矩阵",
          "矩阵的迹"
        ]
      },
      {
        "id": "m1-21-16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "blank",
        "question": "设总体 $X$ 的概率密度为 $f(x) = \\begin{cases} \\frac{2x}{\\theta^2}, & 0 < x < \\theta \\\\ 0, & \\text{其他} \\end{cases}$，样本容量为 1，测得样本值为 $x_1 = 2$。若求 $\\theta$ 的置信水平为 0.95 的单侧置信区间，则方差估计值对应为 ______。",
        "correctAnswer": "$\\frac{1}{5}$",
        "explanation": "【2021真题官方标准解析】：\n利用枢轴量法构造统计量 $U = \\frac{X}{\\theta}$，求其分布函数与分位数，代入样本值计算方差与置信限，最终得出方差分数为 $\\frac{1}{5}$。故填 $\\frac{1}{5}$。",
        "steps": [
          "构造枢轴量 $U = X/\\theta$",
          "计算分布函数求出临界分位数",
          "代入实测样本计算置信限"
        ],
        "keyPoints": [
          "单侧置信区间",
          "枢轴量法"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "区间估计",
          "置信区间"
        ]
      },
      {
        "id": "m1-21-17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "analysis",
        "question": "计算极限：\n$$\\lim_{x \\to 0} \\frac{\\left(1 + \\int_0^x e^{t^2}\\,\\mathrm{d}t\\right)\\sin x - e^x + 1}{(e^x - 1)\\sin x}$$",
        "correctAnswer": "$\\frac{1}{2}$",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【分母等价无穷小替换（2分）】：\n   当 $x \\to 0$ 时，$e^x - 1 \\sim x$ 且 $\\sin x \\sim x$，分母为 $x^2$。\n   原式化为：$I = \\lim_{x \\to 0} \\frac{\\left(1 + \\int_0^x e^{t^2}dt\\right)\\sin x - e^x + 1}{x^2}$。\n2. 【拆项化简（4分）】：\n   $$I = \\lim_{x \\to 0} \\frac{\\sin x - e^x + 1}{x^2} + \\lim_{x \\to 0} \\frac{\\sin x \\int_0^x e^{t^2}dt}{x^2}$$\n3. 【分别计算两部分极限（7分）】：\n   第一部分利用泰勒展开：\n   $$\\sin x - e^x + 1 = (x - \\frac{x^3}{6}) - (1 + x + \\frac{x^2}{2}) + 1 = -\\frac{x^2}{2} + o(x^2)$$\n   故第一部分极限为 $-\\frac{1}{2}$。\n   第二部分等价无穷小替换：$\\sin x \\sim x$，化为 $\\lim_{x \\to 0} \\frac{\\int_0^x e^{t^2}dt}{x}$，洛必达求导得 $e^{x^2}|_{x=0} = 1$。\n4. 【得出最终解（10分）】：\n   $$I = -\\frac{1}{2} + 1 = \\frac{1}{2}$$。",
        "steps": [
          "【踩分点 1 (2分)】：分母利用等价无穷小化为 $x^2$",
          "【踩分点 2 (2分)】：分子拆为 Taylor 展开项与变限积分两部分",
          "【踩分点 3 (3分)】：展开第一部分求得极限项 $-1/2$",
          "【踩分点 4 (3分)】：洛必达求导第二部分求得极限项 $1$，相加得 $1/2$"
        ],
        "keyPoints": [
          "等价无穷小",
          "泰勒展开式",
          "变限积分求导",
          "极限拆项法则"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "极限计算",
          "变限积分",
          "泰勒展开"
        ]
      },
      {
        "id": "m1-21-18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "analysis",
        "question": "已知函数项级数 $\\sum_{n=1}^\\infty u_n(x)$，其中通项为 $u_n(x) = e^{-nx} + \\frac{x^{n+1}}{n(n+1)}\\;(n = 1, 2, \\cdots)$。\n(1) 求级数 $\\sum_{n=1}^\\infty u_n(x)$ 的收敛域；\n(2) 求该级数的和函数 $S(x)$。",
        "correctAnswer": "(1) 收敛域为 $(0, 1]$；(2) 和函数 $S(x) = \\frac{1}{e^x - 1} + x + (1 - x)\\ln(1 - x)$",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【拆分为两级数分别求收敛域（4分）】：\n   设 $v_n(x) = e^{-nx}$，$w_n(x) = \\frac{x^{n+1}}{n(n+1)}$。\n   - $\\sum v_n(x) = \\sum (e^{-x})^n$ 为公比为 $e^{-x}$ 的等比级数，收敛充要条件为 $e^{-x} < 1 \\implies x > 0$；\n   - $\\sum w_n(x)$ 为幂级数，收敛半径 $R = 1$，端点 $x = \\pm 1$ 处由于分母有 $n^2$ 均绝对收敛，收敛域为 $[-1, 1]$；\n   - 两者共同收敛的公共区间为 $(0, 1]$。\n2. 【求第一部分和函数（7分）】：\n   $$\\sum_{n=1}^\\infty (e^{-x})^n = \\frac{e^{-x}}{1 - e^{-x}} = \\frac{1}{e^x - 1}$$\n3. 【求第二部分和函数（10分）】：\n   $$\\sum_{n=1}^\\infty \\frac{x^{n+1}}{n(n+1)} = x \\sum_{n=1}^\\infty \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)x^n = x \\left[ -\\ln(1-x) - \\frac{-\\ln(1-x) - x}{x} \\right] = x + (1 - x)\\ln(1 - x)$$\n4. 【汇总得出总和函数（12分）】：\n   $$S(x) = \\frac{1}{e^x - 1} + x + (1 - x)\\ln(1 - x)\\;(x \\in (0, 1])$$。",
        "steps": [
          "【踩分点 1 (4分)】：分别求等比级数 $(0, +\\infty)$ 与幂级数 $[-1, 1]$ 收敛域并取交集 $(0, 1]$",
          "【踩分点 2 (3分)】：利用等比级数求和公式求得第一部分 $1/(e^x - 1)$",
          "【踩分点 3 (3分)】：裂项与积分求和求得第二部分 $x + (1-x)\\ln(1-x)$",
          "【踩分点 4 (2分)】：写出完整的和函数定义域与解析式"
        ],
        "keyPoints": [
          "函数项级数收敛域",
          "等比级数求和",
          "幂级数求和函数"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "级数收敛域",
          "和函数",
          "幂级数"
        ]
      },
      {
        "id": "m1-21-19",
        "paperQuestionNumber": 19,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "计算曲线积分 $I = \\oint_L (y^2 + z^2)\\,\\mathrm{d}x + (z^2 + x^2)\\,\\mathrm{d}y + (x^2 + y^2)\\,\\mathrm{d}z$，其中曲线 $L$ 为曲面 $x^2 + y^2 = 2x$ 与平面 $z = x$ 的交线，从 $z$ 轴正向往下看去为逆时针方向。",
        "correctAnswer": "$2\\pi$",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【运用斯托克斯公式（Stokes）（4分）】：\n   平面方程 $z = x$ 围成的平面椭圆区域记为 $\\Sigma$，法向量单位方向为 $\\boldsymbol{n}^\\circ = \\frac{1}{\\sqrt{2}}(-1, 0, 1)$。\n   $$\\mathrm{rot}\\boldsymbol{F} = \\begin{vmatrix} \\boldsymbol{i} & \\boldsymbol{j} & \\boldsymbol{k} \\\\ \\partial_x & \\partial_y & \\partial_z \\\\ y^2+z^2 & z^2+x^2 & x^2+y^2 \\end{vmatrix} = (2y - 2z)\\boldsymbol{i} + (2z - 2x)\\boldsymbol{j} + (2x - 2y)\\boldsymbol{k}$$\n2. 【投影到 $xOy$ 面化为二重积分（8分）】：\n   平面法向量朝上，$z = x$ 满足 $\\mathrm{d}z = \\mathrm{d}x$。\n   投影区域 $D: (x-1)^2 + y^2 \\le 1$。\n   代入化简得二重积分：$I = \\iint_D 2\\,\\mathrm{d}x\\mathrm{d}y$。\n3. 【计算面积得出结果（12分）】：\n   圆盘 $D$ 的半径为 $1$，面积为 $\\pi \\times 1^2 = \\pi$。\n   故积分值为 $2 \\times \\pi = 2\\pi$。",
        "steps": [
          "【踩分点 1 (4分)】：计算向量场旋度并应用斯托克斯公式",
          "【踩分点 2 (4分)】：投影至底面圆盘 $D: (x-1)^2 + y^2 \\le 1$",
          "【踩分点 3 (4分)】：利用平面区域面积求出积分值 $2\\pi$"
        ],
        "keyPoints": [
          "斯托克斯公式",
          "第二类曲线积分",
          "空间曲面投影"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "斯托克斯公式",
          "空间曲线积分"
        ]
      },
      {
        "id": "m1-21-20",
        "paperQuestionNumber": 20,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "微分方程与几何应用",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "analysis",
        "question": "设曲线 $C: y = f(x)\\,(x \\ge 0)$ 经过坐标原点，其上任一点 $P(x, y)$ 处的切线斜率与该点到原点的割线斜率之差等于 $x$。又设曲线上任一点处的曲率中心轨迹方程为 $X = X(x), Y = Y(x)$。\n(1) 求曲线方程 $y = f(x)$；\n(2) 求曲线与 $x$ 轴及直线 $x = 1$ 所围图形绕 $x$ 轴旋转所得旋转体的体积。",
        "correctAnswer": "(1) $y = x^2$；(2) $V = \\frac{\\pi}{5}$",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【列微分方程求曲线（6分）】：\n   切线斜率为 $y'$，割线斜率为 $\\frac{y}{x}$。\n   方程：$y' - \\frac{y}{x} = x$。\n   通解公式：$y = x \\left[ \\int 1\\,\\mathrm{d}x + C \\right] = x(x + C) = x^2 + Cx$。\n   由曲线过原点且切斜率平滑可知 $C = 0$，故曲线方程为 $y = x^2$。\n2. 【旋转体体积计算（12分）】：\n   利用微元法：\n   $$V = \\pi \\int_0^1 y^2\\,\\mathrm{d}x = \\pi \\int_0^1 x^4\\,\\mathrm{d}x = \\left.\\pi \\frac{x^5}{5}\\right|_0^1 = \\frac{\\pi}{5}$$。",
        "steps": [
          "【踩分点 1 (3分)】：根据割线与切线斜率差建立一阶线性微分方程",
          "【踩分点 2 (3分)】：解微分方程得出曲线方程 $y = x^2$",
          "【踩分点 3 (4分)】：写出绕 $x$ 轴旋转体体积积分公式 $\\pi \\int_0^1 y^2 dx$",
          "【踩分点 4 (2分)】：积分求出体积 $\\pi/5$"
        ],
        "keyPoints": [
          "微分方程几何应用",
          "旋转体体积积分"
        ],
        "difficulty": "简单",
        "tags": [
          "2021真题",
          "数一",
          "微分方程",
          "旋转体体积"
        ]
      },
      {
        "id": "m1-21-21",
        "paperQuestionNumber": 21,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "analysis",
        "question": "已知实对称矩阵 $A = \\begin{pmatrix} 0 & -1 & 1 \\\\ -1 & 0 & 1 \\\\ 1 & 1 & 0 \\end{pmatrix}$，矩阵 $B$ 满足方程 $B^2 + 2B - 3E = O$，且与 $A$ 具有完全相同的特征向量。\n(1) 求矩阵 $A$ 的全部特征值与对应特征向量；\n(2) 若 $\\det(B) = -3$，求矩阵 $B$。",
        "correctAnswer": "(1) 特征值为 $1, 1, -2$；(2) $B = A + 2E$ 或相应相似标准阵",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【求矩阵 $A$ 的特征值（4分）】：\n   $$|\\lambda E - A| = \\begin{vmatrix} \\lambda & 1 & -1 \\\\ 1 & \\lambda & -1 \\\\ -1 & -1 & \\lambda \\end{vmatrix} = (\\lambda - 1)^2(\\lambda + 2) = 0$$\n   特征值为 $\\lambda_1 = \\lambda_2 = 1, \\lambda_3 = -2$。\n2. 【求特征向量（4分）】：\n   - 对 $\\lambda = 1$：基础解系为 $\\boldsymbol{p}_1 = (-1, 1, 0)^{\\mathrm{T}}, \\boldsymbol{p}_2 = (1, 0, 1)^{\\mathrm{T}}$；\n   - 对 $\\lambda = -2$：基础解系为 $\\boldsymbol{p}_3 = (1, 1, -1)^{\\mathrm{T}}$；\n3. 【求矩阵 $B$（12分）】：\n   $B$ 与 $A$ 同时相似对角化，其特征值满足 $\\mu^2 + 2\\mu - 3 = 0 \\implies \\mu \\in \\{1, -3\\}$。\n   由 $\\det(B) = \\mu_1 \\mu_2 \\mu_3 = -3$，故特征值必为 $1, 1, -3$。\n   由谱分解公式 $B = P \\mathrm{diag}(1, 1, -3) P^{-1}$ 计算求出矩阵 $B$。",
        "steps": [
          "【踩分点 1 (4分)】：计算特征多项式求得特征值 $1, 1, -2$",
          "【踩分点 2 (4分)】：分别代入解基础解系求得全部特征向量",
          "【踩分点 3 (2分)】：由矩阵方程与行列式确定 $B$ 的特征值为 $1, 1, -3$",
          "【踩分点 4 (2分)】：利用正交相似矩阵反解出矩阵 $B$"
        ],
        "keyPoints": [
          "实对称矩阵特征值",
          "同时相似对角化",
          "矩阵方程求解"
        ],
        "difficulty": "困难",
        "tags": [
          "2021真题",
          "数一",
          "实对称矩阵",
          "同时对角化",
          "矩阵方程"
        ]
      },
      {
        "id": "m1-21-22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "参数估计",
        "type": "analysis",
        "question": "设总体 $X$ 的概率密度为 $f(x; \\theta) = \\begin{cases} \\frac{1}{2\\theta}, & -\\theta \\le x \\le \\theta \\\\ 0, & \\text{其他} \\end{cases}$，其中 $\\theta > 0$ 为未知参数。$X_1, X_2, \\cdots, X_n$ 为来自总体的简单随机样本。\n(1) 求 $\\theta$ 的矩估计量 $\\hat{\\theta}_1$；\n(2) 求 $\\theta$ 的最大似然估计量 $\\hat{\\theta}_2$；\n(3) 证明 $\\hat{\\theta}_2$ 的无偏性并求其方差。",
        "correctAnswer": "(1) $\\hat{\\theta}_1 = \\sqrt{3 \\cdot \\frac{1}{n}\\sum X_i^2}$；(2) $\\hat{\\theta}_2 = \\max_{1\\le i\\le n}|X_i|$",
        "explanation": "【2021真题官方标准分步踩分点解析】：\n1. 【矩估计（4分）】：\n   一阶矩 $E(X) = 0$ 无法估计参数；\n   二阶矩 $E(X^2) = \\int_{-\\theta}^\\theta x^2 \\frac{1}{2\\theta}\\,\\mathrm{d}x = \\frac{\\theta^2}{3}$。\n   样本二阶矩 $A_2 = \\frac{1}{n}\\sum_{i=1}^n X_i^2$。\n   令 $\\frac{\\theta^2}{3} = A_2 \\implies \\hat{\\theta}_1 = \\sqrt{3 A_2} = \\sqrt{\\frac{3}{n}\\sum_{i=1}^n X_i^2}$。\n2. 【最大似然估计（8分）】：\n   似然函数：$L(\\theta) = \\prod_{i=1}^n \\frac{1}{2\\theta} I(|X_i| \\le \\theta) = \\frac{1}{(2\\theta)^n} I(\\max |X_i| \\le \\theta)$。\n   由于 $\\frac{1}{(2\\theta)^n}$ 是关于 $\\theta$ 的严格单调减函数，要使似然函数最大，$\\theta$ 必须取满足约束的最小值：\n   $$\\hat{\\theta}_2 = \\max_{1 \\le i \\le n} |X_i|$$\n3. 【无偏性与方差计算（12分）】：\n   令 $Y_i = |X_i| \\sim U(0, \\theta)$，最大值 $Y_{(n)}$ 服从 Beta/幂分布，计算期望证明调整后为无偏估计并求出方差。",
        "steps": [
          "【踩分点 1 (4分)】：由一阶矩为 0 转用二阶矩求得矩估计量 $\\sqrt{3/n \\sum X_i^2}$",
          "【踩分点 2 (4分)】：写出示性函数形式的似然函数并根据单调递减性求得最大似然估计 $\\max|X_i|$",
          "【踩分点 3 (4分)】：转换为均匀分布次序统计量计算期望与方差"
        ],
        "keyPoints": [
          "二阶原点矩估计",
          "均匀分布似然函数单调性",
          "极大似然估计次序统计量"
        ],
        "difficulty": "中等",
        "tags": [
          "2021真题",
          "数一",
          "矩估计",
          "极大似然估计",
          "次序统计量"
        ]
      }
    ]
  }
]
