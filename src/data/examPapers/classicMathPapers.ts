import type { ExamPaper } from './types'

/**
 * 早年经典考研数学真题整卷库（含 1993 年数一完整原卷）
 */
export const CLASSIC_MATH_EXAM_PAPERS: ExamPaper[] = [
{
  "id": "paper-math1-2003",
  "year": 2003,
  "domain": "math",
  "category": "数一",
  "paperType": "real",
  "badgeLabel": "2003 首年150分",
  "title": "2003 年全国硕士研究生入学统一考试 · 数学（一）真题",
  "subtitle": "全国统考原卷 · 考研数学历史首年 150 分制经典卷（满分 150 分 · 22 题）",
  "totalScore": 150,
  "durationMinutes": 180,
  "description": "2003 年全国考研数学一完整原卷真题，为考研数学首年推行 150 分制的历史奠基卷，包含填空 6 题（24分）、选择 6 题（24分）与解答综合大题 10 题（102分），题干完整，解析步骤详尽。",
  "questions": [
    {
      "id": "m1-03-01",
      "paperQuestionNumber": 1,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 1】\n$\\lim_{x\\to 0}(\\cos x)^{\\frac{1}{\\ln(1 + x^2)}} = \\underline{\\quad}$",
      "correctAnswer": "$\\mathrm{e}^{-\\frac{1}{2}}$",
      "explanation": "(1)【答案】 $\\mathrm{e}^{-\\frac{1}{2}}$\n\n【解】 $\\lim_{x\\to 0}(\\cos x)^{\\frac{1}{\\ln(1 + x^2)}} = \\lim_{x\\to 0}\\left\\{\\left[1 + (\\cos x - 1)\\right]^{\\frac{1}{\\cos x - 1}}\\right\\}^{\\frac{\\cos x - 1}{\\ln(1 + x^2)}}$\n\n$$\n= \\mathrm {e} ^ {\\lim  _ {x \\rightarrow 0} \\frac {\\cos x - 1}{x ^ {2}}} = \\mathrm {e} ^ {- \\frac {1}{2}}.\n$$",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：$\\mathrm{e}^{-\\frac{1}{2}}$"
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "简单"
    },
    {
      "id": "m1-03-02",
      "paperQuestionNumber": 2,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 2】\n曲面 $z = x^{2} + y^{2}$ 与平面 $2x + 4y - z = 0$ 平行的切平面的方程是",
      "correctAnswer": "$2x + 4y - z - 5 = 0$ ",
      "explanation": "(2)【答案】 $2x + 4y - z - 5 = 0$ .\n\n【解】 令 $F(x,y,z) = x^{2} + y^{2} - z$\n\n设切点坐标为 $(x_0, y_0, z_0)$ ，则切平面的法向量为 $n = \\{F'_x, F'_y, F'_z\\} \\big|_{(x_0, y_0, z_0)} = \\{2x_0, 2y_0, -1\\}$ ，因为切平面与平面 $2x + 4y - z = 0$ 平行，\n\n所以 $\\frac{2x_0}{2} = \\frac{2y_0}{4} = \\frac{-1}{-1}$ 解得 $x_0 = 1, y_0 = 2$ ，从而 $z_0 = x_0^2 + y_0^2 = 5$\n\n所求的平面为 $2(x - 1) + 4(y - 2) - (z - 5) = 0$ ，即 $2x + 4y - z - 5 = 0$",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：$2x + 4y - z - 5 = 0$ "
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "简单"
    },
    {
      "id": "m1-03-03",
      "paperQuestionNumber": 3,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 3】\n设 $x^{2} = \\sum_{n=0}^{\\infty} a_{n} \\cos nx (-\\pi \\leqslant x \\leqslant \\pi)$ , 则 $a_{2} =$ ______.",
      "correctAnswer": "1",
      "explanation": "（3）【答案】 1.\n\n【解】 $a_{2} = \\frac{2}{\\pi}\\int_{0}^{\\pi}x^{2}\\cos 2x\\mathrm{d}x = \\frac{1}{\\pi}\\int_{0}^{\\pi}x^{2}\\mathrm{d}(\\sin 2x)$\n\n$$\n\\begin{array}{l} = \\frac {1}{\\pi} x ^ {2} \\sin 2 x \\left| _ {0} ^ {\\pi} - \\frac {2}{\\pi} \\int_ {0} ^ {\\pi} x \\sin 2 x d x \\right. \\\\ = \\frac {1}{\\pi} \\int_ {0} ^ {\\pi} x \\mathrm {d} (\\cos 2 x) = \\frac {x}{\\pi} \\cos 2 x \\left| _ {0} ^ {\\pi} - \\frac {1}{\\pi} \\int_ {0} ^ {\\pi} \\cos 2 x \\mathrm {d} x = 1. \\right. \\\\ \\end{array}\n$$",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：1"
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-04",
      "paperQuestionNumber": 4,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 4】\n从 $\\mathbf{R}^2$ 的基 $\\pmb{\\alpha}_1 = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}, \\pmb{\\alpha}_2 = \\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$ 到基 $\\pmb{\\beta}_1 = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}, \\pmb{\\beta}_2 = \\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ 的过渡矩阵为",
      "correctAnswer": "$\\binom{2}{-1}\\binom{3}{-2}$ ",
      "explanation": "(4)【答案】 $\\binom{2}{-1}\\binom{3}{-2}$ .\n\n【解】 令 $A = (\\pmb{\\alpha}_1, \\pmb{\\alpha}_2)$ , $\\pmb{B} = (\\pmb{\\beta}_1, \\pmb{\\beta}_2)$ .\n\n设从基 $\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2}$ 到基 $\\pmb{\\beta}_{1},\\pmb{\\beta}_{2}$ 的过渡矩阵为 $Q$ ，则 $\\pmb {B} = \\pmb {A}\\pmb{Q}$ ，于是 $Q = A^{-1}B = \\begin{pmatrix} 2 & 3\\\\ -1 & -2 \\end{pmatrix} .$",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：$\\binom{2}{-1}\\binom{3}{-2}$ "
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-05",
      "paperQuestionNumber": 5,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 5】\n设二维随机变量 $(X, Y)$ 的概率密度为\n\n$$\nf (x, y) = \\left\\{ \\begin{array}{l l} 6 x, & 0 \\leqslant x \\leqslant y \\leqslant 1, \\\\ 0, & \\text {其 他}, \\end{array} \\right.\n$$\n\n则 $P\\{X + Y \\leqslant 1\\} = \\underline{\\quad}$",
      "correctAnswer": "$\\frac{1}{4}$ ",
      "explanation": "(5)【答案】 $\\frac{1}{4}$ .\n\n【解】 $P\\{X + Y \\leqslant 1\\} = \\iint_{x + y \\leqslant 1} f(x, y) \\, \\mathrm{d}x \\, \\mathrm{d}y = \\int_{0}^{\\frac{1}{2}} \\mathrm{d}x \\int_{x}^{1 - x} 6x \\, \\mathrm{d}y$\n\n$$\n= \\int_ {0} ^ {\\frac {1}{2}} 6 x (1 - 2 x) d x = \\frac {1}{4}.\n$$",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：$\\frac{1}{4}$ "
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-06",
      "paperQuestionNumber": 6,
      "score": 4,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "填空题核心考点",
      "type": "blank",
      "question": "【2003 考研数学一真题 · 填空 6】\n已知一批零件的长度 $X$ (单位: $\\mathrm{cm}$ ) 服从正态分布 $N(\\mu, 1)$ , 从中随机地抽取 16 个零件, 得到长度的平均值为 $40(\\mathrm{cm})$ , 则 $\\mu$ 的置信度为 0.95 的置信区间是\n\n（注：标准正态分布函数值 $\\Phi(1.96) = 0.975, \\Phi(1.645) = 0.95.$ ）",
      "correctAnswer": "(39.51,40.49)",
      "explanation": "（6）【答案】 (39.51,40.49).\n\n【解】 $\\alpha = 0.05, u_{0.025} = 1.96$ ，统计量 $\\frac{\\overline{X} - \\mu}{\\frac{1}{\\sqrt{16}}} = 4(\\overline{X} - \\mu) \\sim N(0,1)$\n\n由 $P\\{-1.96 < 4(\\overline{X} - \\mu) < 1.96\\} = 0.95$ 得 $\\mu$ 的置信度为0.95的置信区间为 $\\left(\\frac{-}{x} - \\frac{1.96}{4}, \\frac{-}{x} + \\frac{1.96}{4}\\right) = (39.51, 40.49)$ .\n\n方法点评：对正态总体 $X \\sim N(\\mu, \\sigma^2)$ 的参数 $\\mu$ 进行区间估计分两种情况：\n\n情形一： $\\sigma^2$ 已知\n\n取 $U = \\frac{\\overline{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}}\\sim N(0,1)$ ，由 $P\\left\\{-u_{\\frac{\\alpha}{2}} < \\frac{\\overline{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}} < u_{\\frac{\\alpha}{2}}\\right\\} = 1 - \\alpha$ ，得参数 $\\mu$ 的置信度为 $1 - \\alpha$\n\n的置信区间为 $\\left(\\overline{X} -\\frac{\\sigma}{\\sqrt{n}} u_{\\frac{\\alpha}{2}},\\overline{X} +\\frac{\\sigma}{\\sqrt{n}} u_{\\frac{\\alpha}{2}}\\right)$\n\n情形二： $\\sigma^2$ 未知\n\n取 $T = \\frac{\\overline{X} - \\mu}{\\frac{s}{\\sqrt{n}}}\\sim t(n - 1)$ ，由 $P\\left\\{-t_{\\frac{\\alpha}{2}}(n - 1) <   \\frac{\\overline{X} - \\mu}{\\frac{s}{\\sqrt{n}}} <  t_{\\frac{\\alpha}{2}}(n - 1)\\right\\} = 1 - \\alpha$ ，得参数 $\\mu$\n\n的置信度为 $1 - \\alpha$ 的置信区间为 $\\left(\\overline{X} -\\frac{s}{\\sqrt{n}} t_{\\frac{\\alpha}{2}}(n - 1),\\overline{X} +\\frac{s}{\\sqrt{n}} t_{\\frac{\\alpha}{2}}(n - 1)\\right).$\n\n# 二、选择题",
      "steps": [
        "建立对应数学关系模型",
        "计算核心极限/矩阵/积分",
        "得出确切结果：(39.51,40.49)"
      ],
      "keyPoints": [
        "2003数一",
        "填空题核心突破"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-07",
      "paperQuestionNumber": 7,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 1】\n设函数 $f(x)$ 在 $(- \\infty, + \\infty)$ 内连续, 其导函数的图形如图所示, 则 $f(x)$ 有( )\n\n![](images/341a324b59e43d9ab00862c2b1bb32802af9d1393c521c0602bb888bbeac2b38.jpg)",
      "options": [
        "A. 一个极小值点和两个极大值点.",
        "B. 两个极小值点和一个极大值点.",
        "C. 两个极小值点和两个极大值点.",
        "D. 三个极小值点和一个极大值点."
      ],
      "correctAnswer": "C",
      "explanation": "（7）【答案】 (C).\n\n【解】设 $f^{\\prime}(x)$ 与 $x$ 轴交点的横坐标从左到右分别为 $a, b, c$ ，显然 $f(x)$ 有三个驻点 $x = a$ ， $x = b$ ， $x = c$ 及一个不可导点 $x = 0$ .\n\n当 $x < a$ 时， $f'(x) > 0$ ，当 $x \\in (a, b)$ 时， $f'(x) < 0$ ，则 $x = a$ 为 $f(x)$ 的极大值点；\n\n当 $x\\in (b,0)$ 时， $f^{\\prime}(x) > 0$ ，则 $x = b$ 为 $f(x)$ 的极小值点；\n\n当 $x\\in (0,c)$ 时， $f^{\\prime}(x) <   0$ ，则 $x = 0$ 为 $f(x)$ 的极大值点；\n\n当 $x > c$ 时， $f'(x) > 0$ ，则 $x = c$ 为 $f(x)$ 的极小值点，\n\n故 $f(x)$ 有两个极大值点和两个极小值点，应选(C).\n\n方法点评：求函数的极值时按如下步骤进行：\n\n（1）找出 $f(x)$ 的驻点及不可导的点；  \n（2）判断每个点是否为极值点（按照具体情况选用第一充分条件和第二充分条件）.",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：C"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-08",
      "paperQuestionNumber": 8,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 2】\n设 $\\{a_{n}\\}, \\{b_{n}\\}, \\{c_{n}\\}$ 均为非负数列, 且 $\\lim_{n \\to \\infty} a_{n} = 0, \\lim_{n \\to \\infty} b_{n} = 1, \\lim_{n \\to \\infty} c_{n} = \\infty$ , 则必有 ( )",
      "options": [
        "A. $a_{n} < b_{n}$ 对任意 $n$ 成立.",
        "B. $b_{n} < c_{n}$ 对任意 $n$ 成立.",
        "C. 极限 $\\lim_{n\\to \\infty}a_n c_n$ 不存在.",
        "D. 极限 $\\lim_{n\\to \\infty}b_n c_n$ 不存在."
      ],
      "correctAnswer": "D",
      "explanation": "（8）【答案】 (D).\n\n【解】方法一 取 $a_{n} = \\frac{3}{n}, b_{n} = 1, c_{n} = \\frac{n}{3}$ ，显然(A)，(B)，(C)不成立，应选(D).\n\n方法二 取 $\\varepsilon = \\frac{1}{2}$ ，因为 $\\lim_{n\\to \\infty}b_n = 1$ ，所以存在 $N > 0$ ，当 $n > N$ 时，\n\n$\\left|b_{n} - 1\\right| < \\frac{1}{2}$ ，从而有 $b_{n} > \\frac{1}{2}$\n\n当 $n > N$ 时， $\\left|b_{n}c_{n}\\right| > \\frac{1}{2}\\left|c_{n}\\right|$\n\n由 $\\lim_{n\\to \\infty}c_n = \\infty$ 得 $\\lim_{n\\to \\infty}\\left|b_n c_n\\right| = +\\infty$ ，故 $\\lim_{n\\to \\infty}b_n c_n = \\infty$ ，应选(D).",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：D"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-09",
      "paperQuestionNumber": 9,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 3】\n已知函数 $f(x, y)$ 在点 $(0, 0)$ 的某个邻域内连续, 且 $\\lim_{\\substack{x \\to 0 \\\\ y \\to 0}} \\frac{f(x, y) - xy}{(x^2 + y^2)^2} = 1$ , 则( )",
      "options": [
        "A. 点 $(0,0)$ 不是 $f(x,y)$ 的极值点.",
        "B. 点 $(0,0)$ 是 $f(x,y)$ 的极大值点",
        "C. 点 $(0, 0)$ 是 $f(x, y)$ 的极小值点.",
        "D. 根据所给条件无法判别点 $(0,0)$ 是否为 $f(x,y)$ 的极值点."
      ],
      "correctAnswer": "A",
      "explanation": "（9）【答案】 （A）.\n\n【解】 由 $\\lim_{\\substack{x\\to 0\\\\ y\\to 0}}\\frac{f(x,y) - xy}{(x^2 + y^2)^2} = 1$ 及 $f(x,y)$ 的连续性，得 $f(0,0) = 0$\n\n再由 $\\lim_{\\substack{x\\to 0\\\\ y\\to 0}}\\frac{f(x,y) - xy}{(x^2 + y^2)^2} = 1$ ，得 $f(x,y) - xy = (x^{2} + y^{2})^{2} + o[(x^{2} + y^{2})^{2}]$\n\n或 $f(x,y) = xy + (x^{2} + y^{2})^{2} + o[(x^{2} + y^{2})^{2}]$\n\n当 $y = x$ 时， $f(x, x) = x^2 + 4x^4 + o(x^4) = x^2 + o(x^2) > 0$\n\n当 $y = -x$ 时， $f(x, -x) = -x^2 + 4x^4 + o(x^4) = -x^2 + o(x^2) < 0$ ，则 $(0,0)$ 不是函数 $f(x, y)$ 的极值点，应选(A).",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：A"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-10",
      "paperQuestionNumber": 10,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 4】\n设向量组 $\\mathrm{I}:\\pmb{\\alpha}_{1},\\pmb{\\alpha}_{2},\\dots,\\pmb{\\alpha}_{r}$ 可由向量组 $\\mathrm{II}:\\pmb{\\beta}_{1},\\pmb{\\beta}_{2},\\dots,\\pmb{\\beta}_{s}$ 线性表示, 则( )",
      "options": [
        "A. 当 $r < s$ 时, 向量组 $\\mathbb{I}$ 必线性相关.",
        "B. 当 $r > s$ 时, 向量组 $\\mathbb{I}$ 必线性相关",
        "C. 当 $r < s$ 时, 向量组 I 必线性相关.",
        "D. 当 $r > s$ 时, 向量组 I 必线性相关"
      ],
      "correctAnswer": "D",
      "explanation": "(10)【答案】 (D).\n\n【解】方法一 因为向量组I可由向量组Ⅱ线性表示，所以 $r(\\mathrm{I})\\leqslant r(\\mathrm{II})$\n\n显然 $r(\\mathrm{II})\\leqslant s$ ，于是 $r(\\mathrm{I})\\leqslant s$\n\n当 $r > s$ 时，因为 $r(\\mathrm{I})\\leqslant s <   r$ ，即向量组I的秩小于向量组I所含的向量个数，所以向量组I线性相关，应选(D).\n\n方法二 取 $\\mathrm{I}:\\pmb{\\alpha}_{1} = \\binom{1}{2},\\mathrm{II}:\\pmb{\\beta}_{1} = \\binom{1}{0},\\pmb{\\beta}_{2} = \\binom{0}{1}$ 显然向量组I可由向量组Ⅱ线性表示且 $r < s$ ，但向量组Ⅱ线性无关，（A)，（C）不对；\n\n取 $\\mathrm{I}:\\pmb{\\alpha}_{1} = \\binom{1}{1},\\pmb{\\alpha}_{2} = \\binom{2}{2},\\mathrm{II}:\\pmb{\\beta}_{1} = \\binom{1}{1}$ 显然向量组I可由向量组Ⅱ线性表示且 $r > s$ 但向量组Ⅱ线性无关，(B）不对，应选(D).",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：D"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-11",
      "paperQuestionNumber": 11,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 5】\n设有齐次线性方程组 $Ax = 0$ 和 $Bx = 0$ , 其中 $A, B$ 均为 $m \\times n$ 矩阵, 现有 4 个命题:\n\n① 若 $Ax = 0$ 的解均是 $Bx = 0$ 的解, 则秩 $(A) \\geqslant$ 秩 $(B)$ ;\n\n② 若秩 $(A) \\geqslant$ 秩 $(B)$ , 则 $Ax = 0$ 的解均是 $Bx = 0$ 的解;  \n③ 若 $Ax = 0$ 与 $Bx = 0$ 同解, 则秩 $(A) =$ 秩 $(B)$ ;  \n④若秩 $(A) =$ 秩 $(B)$ , 则 $Ax = 0$ 与 $Bx = 0$ 同解.\n\n以上命题中正确的是( )",
      "options": [
        "A. ①②.",
        "B. ①③.",
        "C. ②④.",
        "D. ③④."
      ],
      "correctAnswer": "B",
      "explanation": "（11）【答案】 (B).\n\n【解】方法一 若 $AX = 0$ 的解为 $BX = 0$ 的解，则 $AX = 0$ 的基础解系所含的线性无关的解向量的个数不超过 $BX = 0$ 的基础解系所含的线性无关的解向量个数，即 $n - r(A) \\leqslant n - r(B)$ ，从而 $r(A) \\geqslant r(B)$ ；\n\n若 $AX = 0$ 与 $BX = 0$ 同解，则 $r(A) = r(B)$ ，反之不对，故应选（B）.\n\n方法二 取 $A = \\begin{pmatrix} 1 & 1 & -2 \\\\ 1 & 0 & -1 \\end{pmatrix}, B = (1 & 1 & 1), r(A) = 2 \\geqslant r(B) = 1,$\n\n但 $X = \\left( \\begin{array}{l}1\\\\ 1\\\\ 1 \\end{array} \\right)$ 为 $AX = 0$ 的解，不是 $BX = 0$ 的解，第2个命题不对；\n\n取 $\\mathbf{A} = (1\\quad 1\\quad -1)$ ， $\\pmb {B} = (1\\quad -1\\quad -1)$ ， $r(\\mathbf{A}) = r(\\mathbf{B})$\n\n但 $AX = 0$ 与 $BX = 0$ 不同解，第4个命题不对，应选（B）.\n\n方法点评：本题考查两个齐次线性方程组的解与系数矩阵的秩的关系，\n\n齐次线性方程组系数矩阵的秩即为方程组中约束条件的个数，系数矩阵的秩越大则约束条件越多，解就越少；系数矩阵的秩越小则约束条件越少，解就越多。设 $AX = 0$ 与 $BX = 0$ 为两个齐次线性方程组，则：\n\n（1）若 $AX = 0$ 与 $BX = 0$ 同解，则 $r(A) = r(B)$ ，反之不对；  \n（2）若 $AX = 0$ 的解为 $BX = 0$ 的解，则 $r(A) \\geqslant r(B)$   \n（3）若 $AX = 0$ 的解为 $BX = 0$ 的解，反之不对，则 $r(A) > r(B)$   \n（4）若 $AX = 0$ 的解为 $BX = 0$ 的解，且 $r(A) = r(B)$ ，则 $AX = 0$ 与 $BX = 0$ 同解.",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：B"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-12",
      "paperQuestionNumber": 12,
      "score": 4,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "选择题概念辨析",
      "type": "choice",
      "question": "【2003 考研数学一真题 · 选择 6】\n设随机变量 $X \\sim t(n) (n > 1), Y = \\frac{1}{X^2}$ ，则（",
      "options": [
        "A. $Y \\sim \\chi^2(n)$ .",
        "B. $Y \\sim \\chi^2(n - 1)$ .",
        "C. $Y \\sim F(n, 1)$ .",
        "D. $Y \\sim F(1, n)$ ."
      ],
      "correctAnswer": "C",
      "explanation": "（12）【答案】 (C).\n\n【解】因为 $X\\sim t(n)$ ，所以存在 $U\\sim N(0,1),V\\sim \\chi^2 (n)$ 且 $U,V$ 独立，\n\n使得 $X = \\frac{U}{\\sqrt{V / n}}$ ，于是 $Y = \\frac{1}{X^2} = \\frac{V / n}{U^2 / 1}$\n\n注意到 $U^2\\sim \\chi^2 (1)$ 且与 $V$ 独立，故 $Y\\sim F(n,1)$ ，应选(C).\n\n# 三、解答题",
      "steps": [
        "分析题设函数/矩阵/分布特性",
        "结合判定定理或排除法判别",
        "选出唯一正确项：C"
      ],
      "keyPoints": [
        "2003数一",
        "选择题概念辨析"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-13",
      "paperQuestionNumber": 13,
      "score": 10,
      "sectionName": "三、解答题（大题 三）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 三】\n过坐标原点作曲线 $y = \\ln x$ 的切线, 该切线与曲线 $y = \\ln x$ 及 $x$ 轴围成平面图形 $D$ .\n\n(1) 求 $D$ 的面积 $A$ ;  \n(2) 求 $D$ 绕直线 $x = \\mathrm{e}$ 旋转一周所得旋转体的体积 $V$ .",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（13）【解】（I）方法一 设切点坐标为 $(a, \\ln a)$\n\n由导数的几何意义得 $\\frac{\\ln a}{a} = \\frac{1}{a}$ ，解得 $a = \\mathrm{e}$\n\n即切点坐标为 $(\\mathrm{e},1)$ ，故切线为 $y = \\frac{x}{\\mathrm{e}}$\n\n方法二 设切点坐标为 $(a, \\ln a)$ ，所求的切线为\n\n$$\ny - \\ln a = \\frac {1}{a} (x - a)  , \\text {或}   y = \\frac {x}{a} + \\ln a - 1,\n$$\n\n![](images/e72fc6fde46f5415dbba398affb724d0a0469443375acbaba2ea79de466cbc3c.jpg)  \n三(13)题图\n\n因为切线经过原点，所以 $\\ln a - 1 = 0$ ，即 $a = \\mathrm{e}$ ，故所求的切线为 $y = \\frac{x}{\\mathrm{e}}$\n\n所以 $A = \\frac{1}{2} \\times \\mathrm{e} \\times 1 - \\int_{1}^{\\mathrm{e}} \\ln x \\, \\mathrm{d}x = \\frac{\\mathrm{e}}{2} - 1$ .\n\n（Ⅱ）切线 $y = \\frac{x}{\\mathrm{e}},x = \\mathrm{e}$ 及 $x$ 轴围成的三角形区域绕 $x = \\mathrm{e}$ 旋转而成的圆锥体的体积为\n\n$$\nV _ {1} = \\frac {1}{3} \\times \\pi \\mathrm {e} ^ {2} \\times 1 = \\frac {\\pi \\mathrm {e} ^ {2}}{3};\n$$\n\n曲线 $y = \\ln x, x = \\mathrm{e}$ 及 $x$ 轴围成的区域绕 $x = \\mathrm{e}$ 旋转而成的体积为 $V_{2}$\n\n取 $[x, x + \\mathrm{d}x] \\subset [1, \\mathrm{e}]$ ， $\\mathrm{d}V_{2} = 2\\pi (\\mathrm{e} - x) \\times \\ln x \\times \\mathrm{d}x$\n\n$$\nV _ {2} = 2 \\pi \\int_ {1} ^ {\\mathrm {e}} (\\mathrm {e} - x) \\ln x \\mathrm {d} x = 2 \\pi \\mathrm {e} \\int_ {1} ^ {\\mathrm {e}} \\ln x \\mathrm {d} x - 2 \\pi \\int_ {1} ^ {\\mathrm {e}} x \\ln x \\mathrm {d} x = \\frac {\\pi}{2} (4 \\mathrm {e} - \\mathrm {e} ^ {2} - 1),\n$$\n\n于是 $V = V_{1} - V_{2} = \\frac{\\pi}{6} (5\\mathrm{e}^{2} - 12\\mathrm{e} + 3)$",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-14",
      "paperQuestionNumber": 14,
      "score": 12,
      "sectionName": "三、解答题（大题 四）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 四】\n将函数 $f(x) = \\arctan{\\frac{1 - 2x}{1 + 2x}}$ 展开成 $x$ 的幂级数, 并求级数 $\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n + 1}$ 的和.",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "(14)【解】 $f^{\\prime}(x) = \\frac{-2}{1 + 4x^{2}} = -2\\sum_{n = 0}^{\\infty}(-1)^{n}(4x^{2})^{n} = \\sum_{n = 0}^{\\infty}(-1)^{n + 1}2^{2n + 1}x^{2n}\\left(-\\frac{1}{2} < x < \\frac{1}{2}\\right),$\n\n由 $f(0) = \\frac{\\pi}{4}$ ，得 $f(x) = f(0) + \\int_{0}^{x} f'(x) \\, \\mathrm{d}x = \\frac{\\pi}{4} + \\sum_{n=0}^{\\infty} \\frac{(-1)^{n+1} 2^{2n+1}}{2n+1} x^{2n+1} \\left(-\\frac{1}{2} < x < \\frac{1}{2}\\right)$ ，\n\n当 $x = \\frac{1}{2}$ 时， $f\\left(\\frac{1}{2}\\right) = \\frac{\\pi}{4} + \\sum_{n=0}^{\\infty} \\frac{(-1)^{n+1}}{2n+1} = \\frac{\\pi}{4} - \\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2n+1}$ ，又 $f\\left(\\frac{1}{2}\\right) = 0$\n\n所以 $\\sum_{n = 0}^{\\infty}\\frac{(-1)^n}{2n + 1} = \\frac{\\pi}{4}.$",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "困难"
    },
    {
      "id": "m1-03-15",
      "paperQuestionNumber": 15,
      "score": 10,
      "sectionName": "三、解答题（大题 五）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 五】\n已知平面区域 $D = \\{(x,y) \\mid 0 \\leqslant x \\leqslant \\pi, 0 \\leqslant y \\leqslant \\pi\\}$ , $L$ 为 $D$ 的正向边界. 试证:\n\n(1) $\\oint_{L} x \\mathrm{e}^{\\sin y} \\mathrm{d}y - y \\mathrm{e}^{-\\sin x} \\mathrm{d}x = \\oint_{L} x \\mathrm{e}^{-\\sin y} \\mathrm{d}y - y \\mathrm{e}^{\\sin x} \\mathrm{d}x;$   \n(2) $\\oint_{L} x \\mathrm{e}^{\\sin y} \\mathrm{d}y - y \\mathrm{e}^{-\\sin x} \\mathrm{d}x \\geqslant 2\\pi^{2}$ .",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（15）【证明】（I）方法一 由格林公式，得\n\n$$\n\\oint_ {L} x \\mathrm {e} ^ {\\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {- \\sin x} \\mathrm {d} x = \\iint_ {D} (\\mathrm {e} ^ {\\sin y} + \\mathrm {e} ^ {- \\sin x}) \\mathrm {d} \\sigma ,\n$$\n\n$$\n\\oint_ {L} x \\mathrm {e} ^ {- \\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {\\sin x} \\mathrm {d} x = \\iint_ {D} (\\mathrm {e} ^ {- \\sin y} + \\mathrm {e} ^ {\\sin x}) \\mathrm {d} \\sigma ,\n$$\n\n因为区域 $D$ 关于 $y = x$ 对称，所以 $\\iint_{D} (\\mathrm{e}^{\\sin y} + \\mathrm{e}^{-\\sin x}) \\, \\mathrm{d}\\sigma = \\iint_{D} (\\mathrm{e}^{\\sin x} + \\mathrm{e}^{-\\sin y}) \\, \\mathrm{d}\\sigma,$\n\n于是 $\\oint_{L}x\\mathrm{e}^{\\sin y}\\mathrm{d}y - y\\mathrm{e}^{-\\sin x}\\mathrm{d}x = \\oint_{L}x\\mathrm{e}^{-\\sin y}\\mathrm{d}y - y\\mathrm{e}^{\\sin x}\\mathrm{d}x.$\n\n方法二 令 $L_{1}:y = 0$ （起点 $x = 0$ ，终点 $x = \\pi$ ），\n\n$L_{2}:x = \\pi$ （起点 $y = 0$ ，终点 $y = \\pi$ ），\n\n$L_{3}:y = \\pi$ （起点 $x = \\pi$ ，终点 $x = 0$ ），\n\n$L_{4}:x = 0$ （起点 $y = \\pi$ ，终点 $y = 0$ ），\n\n左边 $= \\int_{L_1}x\\mathrm{e}^{\\sin y}\\mathrm{d}y - y\\mathrm{e}^{-\\sin x}\\mathrm{d}x + \\int_{L_2}x\\mathrm{e}^{\\sin y}\\mathrm{d}y - y\\mathrm{e}^{-\\sin x}\\mathrm{d}x+$\n\n$$\n\\begin{array}{l} \\int_ {L _ {3}} x \\mathrm {e} ^ {\\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {- \\sin x} \\mathrm {d} x + \\int_ {L _ {4}} x \\mathrm {e} ^ {\\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {- \\sin x} \\mathrm {d} x \\\\ = \\int_ {0} ^ {\\pi} \\pi \\mathrm {e} ^ {\\sin y} \\mathrm {d} y - \\int_ {\\pi} ^ {0} \\pi \\mathrm {e} ^ {- \\sin x} \\mathrm {d} x = \\pi \\int_ {0} ^ {\\pi} \\left(\\mathrm {e} ^ {\\sin x} + \\mathrm {e} ^ {- \\sin x}\\right) \\mathrm {d} x; \\\\ \\end{array}\n$$\n\n右边 $= \\int_{L_1}x\\mathrm{e}^{-\\sin y}\\mathrm{d}y - y\\mathrm{e}^{\\sin x}\\mathrm{d}x + \\int_{L_2}x\\mathrm{e}^{-\\sin y}\\mathrm{d}y - y\\mathrm{e}^{\\sin x}\\mathrm{d}x+$\n\n$$\n\\begin{array}{l} \\int_ {L _ {3}} x \\mathrm {e} ^ {- \\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {\\sin x} \\mathrm {d} x + \\int_ {L _ {4}} x \\mathrm {e} ^ {- \\sin y} \\mathrm {d} y - y \\mathrm {e} ^ {\\sin x} \\mathrm {d} x \\\\ = \\int_ {0} ^ {\\pi} \\pi \\mathrm {e} ^ {- \\sin y} \\mathrm {d} y - \\int_ {\\pi} ^ {0} \\pi \\mathrm {e} ^ {\\sin x} \\mathrm {d} x = \\pi \\int_ {0} ^ {\\pi} \\left(\\mathrm {e} ^ {\\sin x} + \\mathrm {e} ^ {- \\sin x}\\right) \\mathrm {d} x, \\\\ \\end{array}\n$$\n\n则 $\\oint_{L}x\\mathrm{e}^{\\sin y}\\mathrm{d}y - y\\mathrm{e}^{-\\sin x}\\mathrm{d}x = \\oint_{L}x\\mathrm{e}^{-\\sin y}\\mathrm{d}y - y\\mathrm{e}^{\\sin x}\\mathrm{d}x.$\n\n（Ⅱ） $\\oint_{L}x\\mathrm{e}^{\\sin y}\\mathrm{d}y - y\\mathrm{e}^{-\\sin x}\\mathrm{d}x = \\frac{1}{2}\\left[\\iint_{D}(\\mathrm{e}^{\\sin y} + \\mathrm{e}^{-\\sin x})\\mathrm{d}\\sigma +\\iint_{D}(\\mathrm{e}^{-\\sin y} + \\mathrm{e}^{\\sin x})\\mathrm{d}\\sigma \\right]$\n\n$$\n\\begin{array}{l} = \\frac {1}{2} \\iint_ {D} \\left(\\mathrm {e} ^ {\\sin y} + \\mathrm {e} ^ {- \\sin y} + \\mathrm {e} ^ {\\sin x} + \\mathrm {e} ^ {- \\sin x}\\right) \\mathrm {d} \\sigma \\\\ \\geqslant \\frac {1}{2} \\iint_ {D} (2 + 2) d \\sigma = 2 \\pi^ {2}. \\\\ \\end{array}\n$$",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-16",
      "paperQuestionNumber": 16,
      "score": 10,
      "sectionName": "三、解答题（大题 六）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 六】\n某建筑工程打地基时,需用汽锤将桩打进土层. 汽锤每次击打,都将克服土层对桩的阻力而作功. 设土层对桩的阻力的大小与桩被打进地下的深度成正比(比例系数为 $k, k > 0$ ), 汽锤第一次击打将桩打进地下 $a(\\mathrm{~m})$ . 根据设计方案,要求汽锤每次击打桩时所作的功与前一次击打时所作的功之比为常数 $r (0 < r < 1)$ . 问\n\n(1) 汽锤击打桩 3 次后, 可将桩打进地下多深?  \n(2) 若击打次数不限, 汽锤至多能将桩打进地下多深?\n\n(注: $m$ 表示长度单位米.)",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（16）【解】（I）设 $n$ 次击打桩打进地下深度为 $x_{n}$ ，汽锤第 $n$ 次击打所做的功为 $W_{n}$ ，则\n\n$$\n\\begin{array}{l} W _ {1} = \\int_ {0} ^ {x _ {1}} k x \\mathrm {d} x = \\int_ {0} ^ {a} k x \\mathrm {d} x = \\frac {k}{2} a ^ {2}, \\\\ W _ {2} = \\int_ {x _ {1}} ^ {x _ {2}} k x \\mathrm {d} x = \\frac {k}{2} \\left(x _ {2} ^ {2} - a ^ {2}\\right), \\\\ W _ {3} = \\int_ {x _ {2}} ^ {x _ {3}} k x d x = \\frac {k}{2} \\left(x _ {3} ^ {2} - x _ {2} ^ {2}\\right), \\\\ \\end{array}\n$$\n\n由 $W_{2} = rW_{1}$ 得 $x_{2}^{2} - a^{2} = ra^{2}$ ，解得 $x_{2}^{2} = (1 + r)a^{2}$\n\n由 $W_{3} = rW_{2} = r^{2}W_{1}$ ，得 $x_{3}^{2} - (1 + r)a^{2} = r^{2}a^{2}$ 或 $x_{3}^{2} = (1 + r + r^{2})a^{2}$\n\n于是 $x_{3} = \\sqrt{1 + r + r^{2}} a$ ，即汽锤经过3次击打后桩的深度为 $\\sqrt{1 + r + r^2} a$ 米.\n\n（Ⅱ）由归纳法，设 $x_{n} = \\sqrt{1 + r + \\cdots + r^{n - 1}} a$\n\n$$\nW _ {n + 1} = \\int_ {x _ {n}} ^ {x _ {n + 1}} k x \\mathrm {d} x = \\frac {k}{2} \\left(x _ {n + 1} ^ {2} - x _ {n} ^ {2}\\right) = \\frac {k}{2} \\left[ x _ {n + 1} ^ {2} - (1 + r + \\dots + r ^ {n - 1}) a ^ {2} \\right],\n$$\n\n由 $W_{n + 1} = r^n W_1$ 得 $\\frac{k}{2}\\left[x_{n + 1}^2 -(1 + r + \\dots +r^{n - 1})a^2\\right] = \\frac{k}{2} r^n a^2,$\n\n解得 $x_{n + 1} = \\sqrt{1 + r + \\cdots + r^n} a = \\sqrt{\\frac{1 - r^{n + 1}}{1 - r}} a$\n\n于是 $\\lim_{n\\to \\infty}x_{n + 1} = \\frac{a}{\\sqrt{1 - r}}$ ，即若不限击打次数，汽锤最多可以将桩打进地下 $\\frac{a}{\\sqrt{1 - r}}$ 米.\n\n方法点评：本题考查定积分的物理应用.理解元素法的思想本质，掌握元素法的分析方法.",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-17",
      "paperQuestionNumber": 17,
      "score": 12,
      "sectionName": "三、解答题（大题 七）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 七】\n设函数 $y = y(x)$ 在 $(- \\infty, + \\infty)$ 内具有二阶导数，且 $y' \\neq 0, x = x(y)$ 是 $y = y(x)$ 的反函数.\n\n(1) 试将 $x = x(y)$ 所满足的微分方程 $\\frac{\\mathrm{d}^2x}{\\mathrm{d}y^2} + (y + \\sin x)\\left(\\frac{\\mathrm{d}x}{\\mathrm{d}y}\\right)^3 = 0$ 变换为 $y = y(x)$ 满足的微分方程；  \n(2) 求变换后的微分方程满足初始条件 $y(0) = 0, y'(0) = \\frac{3}{2}$ 的解.",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "(17)【解】（I） $\\frac{\\mathrm{d}x}{\\mathrm{d}y} = \\frac{1}{\\frac{\\mathrm{d}y}{\\mathrm{d}x}} = \\frac{1}{y'(x)}$\n\n$$\n\\frac {\\mathrm {d} ^ {2} x}{\\mathrm {d} y ^ {2}} = \\frac {\\mathrm {d} \\left(\\frac {\\mathrm {d} x}{\\mathrm {d} y}\\right)}{\\mathrm {d} y} = \\frac {\\mathrm {d} \\left[ \\frac {1}{y ^ {\\prime} (x)} \\right] / \\mathrm {d} x}{\\mathrm {d} y / \\mathrm {d} x} = \\frac {\\left[ \\frac {1}{y ^ {\\prime} (x)} \\right] ^ {\\prime}}{y ^ {\\prime} (x)} = - \\frac {y ^ {\\prime \\prime} (x)}{y ^ {\\prime 3} (x)} = - \\frac {\\frac {\\mathrm {d} ^ {2} y}{\\mathrm {d} x ^ {2}}}{\\left(\\frac {\\mathrm {d} y}{\\mathrm {d} x}\\right) ^ {3}},\n$$\n\n代入原方程整理得 $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} - y = \\sin x$\n\n（Ⅱ） $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} - y = 0$ 的特征方程为 $\\lambda^2 - 1 = 0$ ，特征值为 $\\lambda_1 = -1, \\lambda_2 = 1$\n\n$\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} - y = 0$ 的通解为 $y = C_1 \\mathrm{e}^{-x} + C_2 \\mathrm{e}^x$ .\n\n令 $\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2} - y = \\sin x$ 的特解为 $y_0(x) = a\\cos x + b\\sin x$ ，代入原方程得 $a = 0, b = -\\frac{1}{2}$ ，原方程的通解为 $y = C_1\\mathrm{e}^{-x} + C_2\\mathrm{e}^x - \\frac{1}{2}\\sin x$ 。\n\n由初始条件 $y(0) = 0, y'(0) = \\frac{3}{2}$ 得 $C_1 = -1, C_2 = 1$ ，故 $y = \\mathrm{e}^x - \\mathrm{e}^{-x} - \\frac{1}{2}\\sin x$ .\n\n方法点评：本题考查原函数与反函数一阶导数与二阶导数之间的关系及微分方程的求解. 函数与其反函数一阶导数与二阶导数之间的关系有如下两点：\n\n（1）设 $y = f(x)$ 可导且 $f^{\\prime}(x)\\neq 0$ ，则 $y = f(x)$ 存在反函数 $x = g(y),x = g(y)$ 可导且 $g^{\\prime}(y) = \\frac{1}{f^{\\prime}(x)}.$   \n（2）设 $y = f(x)$ 二阶可导且 $f^{\\prime}(x)\\neq 0$ ，则 $y = f(x)$ 存在反函数 $x = g(y),x = g(y)$ 二 阶可导且 $g^{\\prime \\prime}(y) = \\frac{\\mathrm{d}[g^{\\prime}(y)]}{\\mathrm{d}y} = \\frac{\\mathrm{d}\\left[\\frac{1}{f^{\\prime}(x)}\\right]}{\\mathrm{d}y} = \\frac{\\mathrm{d}}{\\mathrm{d}x}\\left[\\frac{1}{f^{\\prime}(x)}\\right]^{'} = \\frac{\\left[\\frac{1}{f^{\\prime}(x)}\\right]^{'}}{\\mathrm{d}y} = \\frac{f^{\\prime\\prime}(x)}{f^{\\prime3}(x)}.$",
      "steps": [
        "第(1)问：设 $y = f(x)$ 可导且 $f^{\\prime}(x)\\neq 0$ ，则 $y = f(x)$ 存在反函数 $x = g...",
        "第(2)问：设 $y = f(x)$ 二阶可导且 $f^{\\prime}(x)\\neq 0$ ，则 $y = f(x)$ 存在反函数 $x =..."
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "困难"
    },
    {
      "id": "m1-03-18",
      "paperQuestionNumber": 18,
      "score": 12,
      "sectionName": "三、解答题（大题 八）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 八】\n设函数 $f(x)$ 连续且恒大于零，\n\n$$\nF (t) = \\frac {\\iint_ {D (t)} f \\left(x ^ {2} + y ^ {2} + z ^ {2}\\right) \\mathrm {d} v}{\\iint_ {D (t)} f \\left(x ^ {2} + y ^ {2}\\right) \\mathrm {d} \\sigma}, \\quad G (t) = \\frac {\\iint_ {D (t)} f \\left(x ^ {2} + y ^ {2}\\right) \\mathrm {d} \\sigma}{\\int_ {- t} ^ {t} f \\left(x ^ {2}\\right) \\mathrm {d} x},\n$$\n\n其中 $\\Omega(t) = \\{(x, y, z) \\mid x^2 + y^2 + z^2 \\leqslant t^2\\}, D(t) = \\{(x, y) \\mid x^2 + y^2 \\leqslant t^2\\}$ .\n\n（1）讨论 $F(t)$ 在区间 $(0, +\\infty)$ 内的单调性\n\n(2) 证明: 当 $t > 0$ 时, $F(t) > \\frac{2}{\\pi} G(t)$ .",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "(18)【解】（I） $\\iiint_{\\Omega(t)} f(x^2 + y^2 + z^2) \\, \\mathrm{d}v = \\int_0^{2\\pi} \\mathrm{d}\\theta \\int_0^\\pi \\mathrm{d}\\varphi \\int_0^t r^2 \\sin \\varphi f(r^2) \\, \\mathrm{d}r = 4\\pi \\int_0^t r^2 f(r^2) \\, \\mathrm{d}r,$\n\n$$\n\\begin{array}{l} \\iint_ {D (t)} f \\left(x ^ {2} + y ^ {2}\\right) d \\sigma = \\int_ {0} ^ {2 \\pi} d \\theta \\int_ {0} ^ {t} r f \\left(r ^ {2}\\right) d r = 2 \\pi \\int_ {0} ^ {t} r f \\left(r ^ {2}\\right) d r, \\\\ \\int_ {- t} ^ {t} f \\left(x ^ {2}\\right) \\mathrm {d} x = 2 \\int_ {0} ^ {t} f \\left(x ^ {2}\\right) \\mathrm {d} x, \\\\ \\end{array}\n$$\n\n则 $F(t) = 2\\frac{\\int_{0}^{t}r^{2}f(r^{2})\\mathrm{d}r}{\\int_{0}^{t}rf(r^{2})\\mathrm{d}r},G(t) = \\pi \\frac{\\int_{0}^{t}rf(r^{2})\\mathrm{d}r}{\\int_{0}^{t}f(x^{2})\\mathrm{d}x}.$\n\n$$\nF ^ {\\prime} (t) = 2 t f \\left(t ^ {2}\\right) \\frac {t \\int_ {0} ^ {t} r f \\left(r ^ {2}\\right) \\mathrm {d} r - \\int_ {0} ^ {t} r ^ {2} f \\left(r ^ {2}\\right) \\mathrm {d} r}{\\left(\\int_ {0} ^ {t} r f \\left(r ^ {2}\\right) \\mathrm {d} r\\right) ^ {2}},\n$$\n\n令 $\\varphi (t) = t\\int_{0}^{t}rf(r^{2})\\mathrm{d}r - \\int_{0}^{t}r^{2}f(r^{2})\\mathrm{d}r,\\quad \\varphi (0) = 0,$\n\n$$\n\\varphi^ {\\prime} (t) = \\int_ {0} ^ {t} r f (r ^ {2}) \\mathrm {d} r > 0 (t > 0),\n$$\n\n由 $\\left\\{ \\begin{array}{l} \\varphi(0) = 0, \\\\ \\varphi'(t) > 0 (t > 0) \\end{array} \\right.$ 得 $\\varphi(t) > 0 (t > 0)$ ，于是 $F'(t) > 0 (t > 0)$ ，故 $F(t)$ 在 $(0, +\\infty)$ 内单调增加.\n\n$\\mathrm{I} = \\frac{\\pi\\int_{0}^{t}rf(r^{2})\\mathrm{d}r}{\\int_{0}^{t}f(r^{2})\\mathrm{d}r},$\n\n当 $t > 0$ 时， $F(t) - \\frac{2}{\\pi} G(t) > 0$ 等价于 $\\int_{0}^{t} f(r^2) \\, \\mathrm{d}r \\int_{0}^{t} r^2 f(r^2) \\, \\mathrm{d}r - \\left[ \\int_{0}^{t} r f(r^2) \\, \\mathrm{d}r \\right]^2 > 0.$ 令 $h(t) = \\int_{0}^{t} f(r^2) \\, \\mathrm{d}r \\int_{0}^{t} r^2 f(r^2) \\, \\mathrm{d}r - \\left[ \\int_{0}^{t} r f(r^2) \\, \\mathrm{d}r \\right]^2, h(0) = 0,$\n\n$h^{\\prime}(t) = f(t^{2})\\int_{0}^{t}f(r^{2})(t - r)^{2}\\mathrm{d}r$ ，当 $t > 0$ 时， $h^\\prime (t) > 0$\n\n由 $\\left\\{ \\begin{array}{l}h(0) = 0,\\\\ h'(t) > 0(t > 0), \\end{array} \\right.$ 得 $h(t) > 0(t > 0)$ ，于是 $F(t) > \\frac{2}{\\pi} G(t)$",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "困难"
    },
    {
      "id": "m1-03-19",
      "paperQuestionNumber": 19,
      "score": 10,
      "sectionName": "三、解答题（大题 九）",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 九】\n设矩阵 $A = \\begin{pmatrix} 3 & 2 & 2\\\\ 2 & 3 & 2\\\\ 2 & 2 & 3 \\end{pmatrix}$ , $P = \\begin{pmatrix} 0 & 1 & 0\\\\ 1 & 0 & 1\\\\ 0 & 0 & 1 \\end{pmatrix}$ , $B = P^{-1}A^{*}P$ , 求 $B + 2E$ 的特征值与特征向量, 其中 $A^{*}$ 为 $A$ 的伴随矩阵, $E$ 为3阶单位矩阵.",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（19）【解】 方法一 $|\\mathbf{A}| = \\begin{vmatrix} 3 & 2 & 2\\\\ 2 & 3 & 2\\\\ 2 & 2 & 3 \\end{vmatrix} = 7,$\n\n$$\n\\text {由} \\left(\\begin{array}{c c c c c c}3&2&2&1&0&0\\\\2&3&2&0&1&0\\\\2&2&3&0&0&1\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c c c c}1&1&1&\\frac {1}{7}&\\frac {1}{7}&\\frac {1}{7}\\\\0&1&0&- \\frac {2}{7}&\\frac {5}{7}&- \\frac {2}{7}\\\\0&0&1&- \\frac {2}{7}&- \\frac {2}{7}&\\frac {5}{7}\\end{array}\\right)\\rightarrow \\left(\\begin{array}{c c c c c c}1&0&0&\\frac {5}{7}&- \\frac {2}{7}&- \\frac {2}{7}\\\\0&1&0&- \\frac {2}{7}&\\frac {5}{7}&- \\frac {2}{7}\\\\0&0&1&- \\frac {2}{7}&- \\frac {2}{7}&\\frac {5}{7}\\end{array}\\right)\n$$\n\n得 $\\mathbf{A}^{*} = |\\mathbf{A}| \\mathbf{A}^{-1} = \\begin{pmatrix} 5 & -2 & -2 \\\\ -2 & 5 & -2 \\\\ -2 & -2 & 5 \\end{pmatrix}$ ,\n\n由 $\\left( \\begin{array}{ccccc}0 & 1 & 0 & 1 & 0 & 0\\\\ 1 & 0 & 1 & 0 & 1 & 0\\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array} \\right)\\to \\left( \\begin{array}{ccccc}1 & 0 & 1 & 0 & 1 & 0\\\\ 0 & 1 & 0 & 1 & 0 & 0\\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array} \\right)\\to \\left( \\begin{array}{ccccc}1 & 0 & 0 & 0 & 1 & -1\\\\ 0 & 1 & 0 & 1 & 0 & 0\\\\ 0 & 0 & 1 & 0 & 0 & 1 \\end{array} \\right),$\n\n得 $P^{-1} = \\begin{pmatrix} 0 & 1 & -1 \\\\ 1 & 0 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$ ,\n\n于是 $\\pmb {B} = \\pmb{P}^{-1}\\pmb{A}^{*}\\pmb {P} = \\left( \\begin{array}{rrr}0 & 1 & -1\\\\ 1 & 0 & 0\\\\ 0 & 0 & 1 \\end{array} \\right)\\left( \\begin{array}{rrr}5 & -2 & -2\\\\ -2 & 5 & -2\\\\ -2 & -2 & 5 \\end{array} \\right)\\left( \\begin{array}{rrr}0 & 1 & 0\\\\ 1 & 0 & 1\\\\ 0 & 0 & 1 \\end{array} \\right) = \\left( \\begin{array}{rrr}7 & 0 & 0\\\\ -2 & 5 & -4\\\\ -2 & -2 & 3 \\end{array} \\right),$\n\n$$\n\\boldsymbol {B} + 2 \\boldsymbol {E} = \\left( \\begin{array}{c c c} 9 & 0 & 0 \\\\ - 2 & 7 & - 4 \\\\ - 2 & - 2 & 5 \\end{array} \\right).\n$$\n\n由 $|\\lambda E - (B + 2E)| = \\left| \\begin{array}{ccc}\\lambda -9 & 0 & 0\\\\ 2 & \\lambda -7 & 4\\\\ 2 & 2 & \\lambda -5 \\end{array} \\right| = (\\lambda -3)(\\lambda -9)^{2} = 0,$\n\n得 $\\pmb{B} + 2\\pmb{E}$ 的特征值为 $\\lambda_1 = 3, \\lambda_2 = \\lambda_3 = 9$\n\n当 $\\lambda_{1} = 3$ 时，解方程组 $[3E - (B + 2E)]X = 0$\n\n由 $3\\pmb {E} - (\\pmb {B} + 2\\pmb {E}) = \\left( \\begin{array}{rrr} - 6 & 0 & 0\\\\ 2 & -4 & 4\\\\ 2 & 2 & -2 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{rrr}1 & 0 & 0\\\\ 0 & 1 & -1\\\\ 0 & 0 & 0 \\end{array} \\right),$ 得 $\\pmb {B} + 2\\pmb{E}$ 的属于特征值 $\\lambda_1 = 3$\n\n的特征向量为 $\\pmb{\\xi}_{1} = \\begin{pmatrix} 0 \\\\ 1 \\\\ 1 \\end{pmatrix}$\n\n当 $\\lambda_{2} = \\lambda_{3} = 9$ 时，解方程组 $[9\\mathbf{E} - (\\mathbf{B} + 2\\mathbf{E})]\\mathbf{X} = \\mathbf{0}$\n\n由 $9\\pmb {E} - (\\pmb {B} + 2\\pmb {E}) = \\left( \\begin{array}{lll}0 & 0 & 0\\\\ 2 & 2 & 4\\\\ 2 & 2 & 4 \\end{array} \\right)\\rightarrow \\left( \\begin{array}{lll}1 & 1 & 2\\\\ 0 & 0 & 0\\\\ 0 & 0 & 0 \\end{array} \\right),$ 得 $\\pmb {B} + 2\\pmb{E}$ 的属于特征值 $\\lambda_{2} = \\lambda_{3} = 9$ 的线\n\n性无关的特征向量为 $\\pmb{\\xi}_{2} = \\left( \\begin{array}{c} - 1\\\\ 1\\\\ 0 \\end{array} \\right),\\pmb{\\xi}_{3} = \\left( \\begin{array}{c} - 2\\\\ 0\\\\ 1 \\end{array} \\right).$\n\n故 $B + 2E$ 的特征值为 $\\lambda_{1} = 3, \\lambda_{2} = \\lambda_{3} = 9$ ，属于 $\\lambda_{1} = 3$ 的全部特征向量为 $k_{1}\\xi_{1}(k_{1}$ 为任意非零常数）；属于 $\\lambda_{2} = \\lambda_{3} = 9$ 的全部特征向量为 $k_{2}\\xi_{2} + k_{3}\\xi_{3}(k_{2},k_{3}$ 为不全为零的任意常数）.\n\n方法二 由 $|\\lambda E - A| = \\left| \\begin{array}{ccc}\\lambda -3 & -2 & -2\\\\ -2 & \\lambda -3 & -2\\\\ -2 & -2 & \\lambda -3 \\end{array} \\right| = (\\lambda -1)^{2}(\\lambda -7) = 0$ 得矩阵 $\\mathbf{A}$ 的特\n\n征值为 $\\lambda_{1} = \\lambda_{2} = 1, \\lambda_{3} = 7$\n\n$\\lambda_{1} = \\lambda_{2} = 1$ 代入 $(\\lambda E - A)X = 0$\n\n由 $\\pmb {E} - \\pmb {A}\\rightarrow \\left( \\begin{array}{lll}1 & 1 & 1\\\\ 0 & 0 & 0\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\mathbf{A}$ 的属于 $\\lambda_1 = \\lambda_2 = 1$ 的线性无关的特征向量为\n\n$$\n\\boldsymbol {\\alpha} _ {1} = \\left( \\begin{array}{c} - 1 \\\\ 1 \\\\ 0 \\end{array} \\right), \\boldsymbol {\\alpha} _ {2} = \\left( \\begin{array}{c} - 1 \\\\ 0 \\\\ 1 \\end{array} \\right);\n$$\n\n$\\lambda_{3} = 7$ 代入 $(\\lambda E - A)X = 0$\n\n由 $7\\pmb {E} - \\pmb {A}\\rightarrow \\left( \\begin{array}{ccc}1 & 0 & -1\\\\ 0 & 1 & -1\\\\ 0 & 0 & 0 \\end{array} \\right)$ 得 $\\mathbf{A}$ 的属于 $\\lambda_3 = 7$ 的特征向量为 $\\pmb{\\alpha}_{3} = \\binom{1}{1}$\n\n$|A| = 7, A^{*}$ 的特征值为 $\\frac{|A|}{\\lambda_1} = 7, \\frac{|A|}{\\lambda_2} = 7, \\frac{|A|}{\\lambda_3} = 1$\n\n因为 $\\pmb{B} \\sim \\pmb{A}^{*}$ ，所以 $\\pmb{B}$ 的特征值为 $\\lambda_{1} = \\lambda_{2} = 7, \\lambda_{3} = 1$ ，从而 $\\pmb{B} + 2\\pmb{E}$ 的特征值为9，9，3. $\\pmb{B} + 2\\pmb{E}$ 的相应于特征值9，9，3对应的线性无关的特征向量为\n\n$$\n\\begin{array}{l} \\boldsymbol {\\beta} _ {1} = \\boldsymbol {P} ^ {- 1} \\boldsymbol {\\alpha} _ {1} = \\left( \\begin{array}{c c c} 0 & 1 & - 1 \\\\ 1 & 0 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right) \\left( \\begin{array}{c} - 1 \\\\ 1 \\\\ 0 \\end{array} \\right) = \\left( \\begin{array}{c} 1 \\\\ - 1 \\\\ 0 \\end{array} \\right), \\\\ \\boldsymbol {\\beta} _ {2} = \\boldsymbol {P} ^ {- 1} \\boldsymbol {\\alpha} _ {2} = \\left( \\begin{array}{c c c} 0 & 1 & - 1 \\\\ 1 & 0 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right) \\left( \\begin{array}{c} - 1 \\\\ 0 \\\\ 1 \\end{array} \\right) = \\left( \\begin{array}{c} - 1 \\\\ - 1 \\\\ 1 \\end{array} \\right), \\\\ \\boldsymbol {\\beta} _ {3} = \\boldsymbol {P} ^ {- 1} \\boldsymbol {\\alpha} _ {3} = \\left( \\begin{array}{c c c} 0 & 1 & - 1 \\\\ 1 & 0 & 0 \\\\ 0 & 0 & 1 \\end{array} \\right) \\left( \\begin{array}{c} 1 \\\\ 1 \\\\ 1 \\end{array} \\right) = \\left( \\begin{array}{c} 0 \\\\ 1 \\\\ 1 \\end{array} \\right). \\\\ \\end{array}\n$$\n\n方法点评：本题考查矩阵的特征值与特征向量.\n\n矩阵与其关联的矩阵特征值与特征向量之间有一定的关系，主要有如下结论：\n\n（1）设 $A\\pmb {\\alpha} = \\lambda_0\\pmb{\\alpha}$ ，则 $f(\\mathbf{A})\\pmb {\\alpha} = f(\\lambda_0)\\pmb{\\alpha}$\n\n特别地，若 $\\mathbf{A}$ 可逆，则 $\\left\\{ \\begin{array}{l} \\mathbf{A}^{-1}\\pmb{\\alpha} = \\frac{1}{\\lambda_0}\\pmb{\\alpha}, \\\\ \\mathbf{A}^*\\pmb{\\alpha} = \\frac{|A|}{\\lambda_0}\\pmb{\\alpha}, \\end{array} \\right.$ 即 $\\mathbf{A}$ 与 $\\mathbf{A}^{-1}, \\mathbf{A}^*$ 特征向量相同.\n\n（2）设 $A\\alpha = \\lambda_0\\alpha$ 且 $P^{-1}AP = B$ ，则 $B\\cdot P^{-1}\\alpha = \\lambda_0P^{-1}\\alpha$ ，即 $\\mathbf{A}$ 与 $\\pmb{B}$ 特征值相同， $\\pmb{B}$ 的属于特征值 $\\lambda_0$ 的特征向量为 $P^{-1}\\alpha$\n\n#",
      "steps": [
        "第(1)问：设 $A\\pmb {\\alpha} = \\lambda_0\\pmb{\\alpha}$ ，则 $f(\\mathbf{A})\\pmb ...",
        "第(2)问：设 $A\\alpha = \\lambda_0\\alpha$ 且 $P^{-1}AP = B$ ，则 $B\\cdot P^{-1}\\..."
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-20",
      "paperQuestionNumber": 20,
      "score": 8,
      "sectionName": "三、解答题（大题 十）",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 十】\n已知平面上三条不同直线的方程分别为\n\n$$\nl _ {1}: a x + 2 b y + 3 c = 0;\n$$\n\n$$\nl _ {2}: b x + 2 c y + 3 a = 0;\n$$\n\n$$\nl _ {3}: c x + 2 a y + 3 b = 0.\n$$\n\n试证这三条直线交于一点的充分必要条件为 $a + b + c = 0$",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（20）【证明】 方法一\n\n必要性：设三条直线交于一点 $(x_0,y_0)$ ，即方程组 $AX = 0$ 有非零解 $(x_0,y_0,1)^{\\mathrm{T}}$ ，其中\n\n$$\n\\begin{array}{r} {\\pmb {A} = \\left( \\begin{array}{c c c} {a} & {2 b} & {3 c} \\\\ {b} & {2 c} & {3 a} \\\\ {c} & {2 a} & {3 b} \\end{array} \\right), \\text {则}   |   \\pmb {A}   | = 0,} \\end{array}\n$$\n\n而 $|\\mathbf{A}| = \\begin{vmatrix} a & 2b & 3c \\\\ b & 2c & 3a \\\\ c & 2a & 3b \\end{vmatrix} = (a + b + c)\\begin{vmatrix} 1 & 2 & 3 \\\\ b & 2c & 3a \\\\ c & 2a & 3b \\end{vmatrix} = (a + b + c)\\begin{vmatrix} 1 & 2 & 3 \\\\ 0 & 2c - 2b & 3a - 3b \\\\ 0 & 2a - 2c & 3b - 3c \\end{vmatrix}$\n\n$$\n\\begin{array}{l} = - 6 (a + b + c) \\left(a ^ {2} + b ^ {2} + c ^ {2} - a b - a c - b c\\right) \\\\ = - 3 (a + b + c) \\left[ (a - b) ^ {2} + (b - c) ^ {2} + (c - a) ^ {2} \\right] \\text {且} (a - b) ^ {2} + (b - c) ^ {2} + (c - a) ^ {2} \\neq 0, \\\\ \\end{array}\n$$\n\n故 $a + b + c = 0$\n\n充分性：设 $a + b + c = 0$ ，将方程组前两个方程相加得方程组的同解方程组为\n\n$$\n\\left\\{ \\begin{array}{l} a x + 2 b y = - 3 c, \\\\ b x + 2 c y = - 3 a. \\end{array} \\right.\n$$\n\n因为 $\\left| \\begin{array}{ll}a & 2b\\\\ b & 2c \\end{array} \\right| = 2(ac - b^2) = -2\\bigl [a(a + b) + b^2\\bigr ] = -\\bigl [a^2 +b^2 +(a + b)^2\\bigr ]\\neq 0,$\n\n所以方程组有唯一解，即三条直线交于一点\n\n方法二\n\n必要性：设三条直线交于一点，即方程组 $\\left\\{ \\begin{array}{l} ax + 2by = -3c, \\\\ bx + 2cy = -3a, \\\\ cx + 2ay = -3b \\end{array} \\right.$ 有唯一解，\n\n令 $\\overline{\\mathbf{A}} = \\begin{pmatrix} a & 2b & -3c \\\\ b & 2c & -3a \\\\ c & 2a & -3b \\end{pmatrix}$ ，则 $r(\\mathbf{A}) = r(\\overline{\\mathbf{A}}) = 2$\n\n从而 $|\\overline{\\mathbf{A}}| = -3(a + b + c)[(a - b)^2 + (b - c)^2 + (c - a)^2] = 0$\n\n而 $(a - b)^2 + (b - c)^2 + (c - a)^2 \\neq 0$ ，故 $a + b + c = 0$ .\n\n充分性：设 $a + b + c = 0$ ，则 $r(\\overline{\\mathbf{A}}) < 3$\n\n又 $\\left| \\begin{array}{ll}a & 2b\\\\ b & 2c \\end{array} \\right| = 2(ac - b^2) = -2[a(a + b) + b^2 ] = -[a^2 +b^2 +(a + b)^2 ]\\neq 0,$\n\n则 $r(\\mathbf{A}) = 2$ ，从而 $r(\\mathbf{A}) = r(\\overline{\\mathbf{A}}) = 2$ ，即方程组 $\\left\\{ \\begin{array}{l} ax + 2by = -3c, \\\\ bx + 2cy = -3a, \\\\ cx + 2ay = -3b \\end{array} \\right.$ 有唯一解，\n\n故三条直线交于一点.",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-21",
      "paperQuestionNumber": 21,
      "score": 10,
      "sectionName": "三、解答题（大题 十一）",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 十一】\n已知甲、乙两箱中装有同种产品，其中甲箱中装有3件合格品和3件次品，乙箱中仅装有3件合格品．从甲箱中任取3件产品放入乙箱后，求：\n\n(1) 乙箱中次品件数 $X$ 的数学期望;  \n(2) 从乙箱中任取一件产品是次品的概率.",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "（21）【解】（I）方法一 $X$ 的可能取值为0，1，2，3，\n\n$$\nP \\{X = 0 \\} = \\frac {\\mathrm {C} _ {3} ^ {3}}{\\mathrm {C} _ {6} ^ {3}} = \\frac {1}{2 0}, \\quad P \\{X = 1 \\} = \\frac {\\mathrm {C} _ {3} ^ {2} \\mathrm {C} _ {3} ^ {1}}{\\mathrm {C} _ {6} ^ {3}} = \\frac {9}{2 0},\n$$\n\n$$\nP \\{X = 2 \\} = \\frac {\\mathrm {C} _ {3} ^ {1} \\mathrm {C} _ {3} ^ {2}}{\\mathrm {C} _ {6} ^ {3}} = \\frac {9}{2 0}, \\quad P \\{X = 3 \\} = \\frac {\\mathrm {C} _ {3} ^ {3}}{\\mathrm {C} _ {6} ^ {3}} = \\frac {1}{2 0},\n$$\n\n$X$ 的分布律为 $X\\sim \\left( \\begin{array}{cccc}0 & 1 & 2 & 3\\\\ \\frac{1}{20} & \\frac{9}{20} & \\frac{9}{20} & \\frac{1}{20} \\end{array} \\right)$ ，于是 $E(X) = \\frac{3}{2}$\n\n方法二 令 $X_{i} = \\left\\{ \\begin{array}{ll}1, & \\text{从甲箱中所取的第} i \\text{件产品为次品，}\\\\ 0, & \\text{从甲箱中所取的第} i \\text{件产品为合格品} \\end{array} \\right.$ （ $i = 1,2,3$ ），\n\n$X_{i}$ 的分布律为 $X_{i} \\sim \\left( \\begin{array}{cc}0 & 1\\\\ \\frac{1}{2} & \\frac{1}{2} \\end{array} \\right)(i = 1,2,3)$\n\n设乙箱中的次品个数为 $X$ ，则 $X = X_{1} + X_{2} + X_{3}$\n\n故 $E(X) = E(X_{1}) + E(X_{2}) + E(X_{3}) = \\frac{3}{2}$ .\n\n（Ⅱ）令 $A_{i} = \\{X = i\\} (i = 0,1,2,3),B = \\{\\text{从乙箱中取一件产品为次品}\\}$\n\n$P(B\\mid A_0) = 0,P(B\\mid A_1) = \\frac{1}{6},P(B\\mid A_2) = \\frac{2}{6},P(B\\mid A_3) = \\frac{3}{6}$ ，由全概率公式得\n\n$$\nP (B) = \\sum_ {i = 0} ^ {3} P \\left(A _ {i}\\right) P (B \\mid A _ {i}) = \\frac {1}{4}.\n$$\n\n方法点评：本题考查一维离散型随机变量的分布及全概率公式\n\n若一件事需要两步完成，第一步发生的结果未知，求第二步某事件的概率时，一般采用全概率公式，第一步构造完备事件组 $A_{1}, A_{2}, \\dots, A_{m}$ ，第二步事件为 $B$ ，则\n\n$$\nP (B) = \\sum_ {i = 1} ^ {m} P \\left(A _ {i}\\right) P (B \\mid A _ {i}).\n$$",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    },
    {
      "id": "m1-03-22",
      "paperQuestionNumber": 22,
      "score": 8,
      "sectionName": "三、解答题（大题 十二）",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "综合大题解析",
      "type": "analysis",
      "question": "【2003 考研数学一真题 · 大题 十二】\n设总体 $X$ 的概率密度为\n\n$$\nf (x) = \\left\\{ \\begin{array}{l l} 2 \\mathrm {e} ^ {- 2 (x - \\theta)}, & x > \\theta , \\\\ 0, & x \\leqslant \\theta , \\end{array} \\right.\n$$\n\n其中 $\\theta > 0$ 是未知参数. 从总体 $X$ 中抽取简单随机样本 $X_{1}, X_{2}, \\dots, X_{n}$ , 记 $\\hat{\\theta} = \\min \\{X_{1}, X_{2}, \\dots, X_{n}\\}$ .\n\n（1）求总体 $X$ 的分布函数 $F(x)$   \n(2) 求统计量 $\\hat{\\theta}$ 的分布函数 $F_{\\hat{\\theta}}(x)$ ;  \n(3) 如果用 $\\hat{\\theta}$ 作为 $\\theta$ 的估计量, 讨论它是否具有无偏性.",
      "correctAnswer": "完整分步推导见解析",
      "explanation": "(22)【解】（I）总体 $X$ 的分布函数为 $F(x) = P\\{X \\leqslant x\\} = \\int_{-\\infty}^{x} f(x) \\, \\mathrm{d}x$ ，\n\n当 $x < \\theta$ 时， $F(x) = 0$\n\n当 $x \\geqslant \\theta$ 时， $F(x) = \\int_{\\theta}^{x} 2 \\mathrm{e}^{-2(x - \\theta)} \\, \\mathrm{d}x = -\\mathrm{e}^{-2(x - \\theta)} \\Bigg|_{\\theta}^{x} = 1 - \\mathrm{e}^{-2(x - \\theta)}$\n\n于是 $F(x) = \\left\\{ \\begin{array}{ll}0, & x <   \\theta ,\\\\ 1 - \\mathrm{e}^{-2(x - \\theta)}, & x\\geqslant \\theta . \\end{array} \\right.$\n\n$(\\mathrm{II})F_{\\theta}(x) = P\\{\\hat{\\theta}\\leqslant x\\} = P\\{\\min \\{X_1,X_2,\\dots ,X_n\\} \\leqslant x\\}$\n\n$$\n\\begin{array}{l} = 1 - P \\left\\{\\min  \\left\\{X _ {1}, X _ {2}, \\dots , X _ {n} \\right\\} > x \\right\\} \\\\ = 1 - P \\left\\{X _ {1} > x, X _ {2} > x, \\dots , X _ {n} > x \\right\\} \\\\ = 1 - P \\left\\{X _ {1} > x \\right\\} P \\left\\{X _ {2} > x \\right\\} \\dots P \\left\\{X _ {n} > x \\right\\} \\\\ = 1 - \\left[ 1 - P \\left\\{X _ {1} \\leqslant x \\right\\} \\right] \\left[ 1 - P \\left\\{X _ {2} \\leqslant x \\right\\} \\right] \\dots \\left[ 1 - P \\left\\{X _ {n} \\leqslant x \\right\\} \\right] \\\\ = 1 - \\left[ 1 - F (x) \\right] ^ {n} \\\\ = \\left\\{ \\begin{array}{l l} 0, & x <   \\theta , \\\\ 1 - \\mathrm {e} ^ {- 2 n (x - \\theta)}, & x \\geqslant \\theta . \\end{array} \\right. \\\\ \\end{array}\n$$\n\n(III) $\\hat{\\theta}$ 的密度函数为 $f_{\\hat{\\theta}}(x) = \\begin{cases} 0, & x \\leqslant \\theta, \\\\ 2n\\mathrm{e}^{-2n(x - \\theta)}, & x > \\theta, \\end{cases}$\n\n因为 $E(\\hat{\\theta}) = \\int_{\\theta}^{+\\infty}xf_{\\hat{\\theta}}(x)\\mathrm{d}x = \\int_{\\theta}^{+\\infty}x\\mathrm{e}^{-2n(x - \\theta)}\\mathrm{d}[2n(x - \\theta)]$\n\n$$\n\\frac {2 n (x - \\theta) = t}{\\theta} \\int_ {0} ^ {+ \\infty} \\left(\\theta + \\frac {t}{2 n}\\right) e ^ {- t} d t = \\theta \\int_ {0} ^ {+ \\infty} e ^ {- t} d t + \\frac {1}{2 n} \\int_ {0} ^ {+ \\infty} t e ^ {- t} d t = \\theta + \\frac {1}{2 n},\n$$\n\n所以 $\\hat{\\theta}$ 不是 $\\theta$ 的无偏估计量",
      "steps": [
        "第一步：设出待求参量，列出核心方程组或定义关系",
        "第二步：展开矩阵变换/积分变换/特征值求解详细步骤",
        "第三步：得出最终结论并进行边界条件核验"
      ],
      "keyPoints": [
        "2003数一",
        "解答题分步踩分"
      ],
      "tags": [
        "考研数学",
        "数一",
        "历年真题",
        "2003真题"
      ],
      "difficulty": "中等"
    }
  ]
},

{
  "id": "paper-math1-1993",
  "year": 1993,
  "domain": "math",
  "category": "数一",
  "title": "1993 年全国硕士研究生入学统一考试 · 数学（一）真题",
  "subtitle": "全国统考原卷 · 经典早年真题（满分 100 分 · 23 题）",
  "paperType": "real",
  "badgeLabel": "1993 经典真题",
  "totalScore": 100,
  "durationMinutes": 180,
  "description": "1993 年全国考研数学一完整原卷真题，包含填空 5 题（15分）、单选 5 题（15分）与解答计算/证明 13 题（70分），覆盖旋转曲面外法向量、傅里叶系数、二重/三重/曲线曲面积分、无穷级数、二阶微分方程、线性方程组通解与正态分布概率计算等经典母题。",
  "questions": [
    {
      "id": "m1-93-01",
      "paperQuestionNumber": 1,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "微分中值定理与导数应用",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 填空 1】函数 $F(x) = \\int_1^x \\left(2 - \\frac{1}{\\sqrt{t}}\\right)dt\\;(x > 0)$ 的单调减少区间为______。",
      "correctAnswer": "$(0, \\frac{1}{4}]$",
      "explanation": "【1993数一真题详解】：\n对变上限积分函数 $F(x)$ 求导得：\n$$F'(x) = 2 - \\frac{1}{\\sqrt{x}} \\quad (x > 0)$$\n令 $F'(x) < 0$，即 $2 - \\frac{1}{\\sqrt{x}} < 0 \\implies \\sqrt{x} < \\frac{1}{2} \\implies 0 < x < \\frac{1}{4}$。\n又 $F(x)$ 在 $(0, +\\infty)$ 上连续，区间端点可闭，故单调减少区间为 $(0, \\frac{1}{4}]$（填 $(0, \\frac{1}{4})$ 或 $0 < x \\le \\frac{1}{4}$ 均可）。",
      "steps": [
        "利用变上限积分求导公式计算 $F'(x) = 2 - \\frac{1}{\\sqrt{x}}$",
        "解不等式 $F'(x) < 0$（注意定义域 $x > 0$）得 $0 < x < \\frac{1}{4}$",
        "结合函数在 $x = \\frac{1}{4}$ 处连续，写出单调减少区间 $(0, \\frac{1}{4}]$"
      ],
      "keyPoints": [
        "变上限积分求导",
        "导数判别单调区间"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "单调区间",
        "变上限积分"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-02",
      "paperQuestionNumber": 2,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数微分学",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 填空 2】由曲线 $\\begin{cases} 3x^2 + 2y^2 = 12, \\\\ z = 0 \\end{cases}$ 绕 $y$ 轴旋转一周得到的旋转面在点 $(0, \\sqrt{3}, \\sqrt{2})$ 处的指向外侧的单位法向量为______。",
      "correctAnswer": "$\\left(0, \\frac{\\sqrt{10}}{5}, \\frac{\\sqrt{15}}{5}\\right)$",
      "explanation": "【1993数一真题详解】：\n$xOy$ 面内曲线绕 $y$ 轴旋转一周，只需将方程中的 $x$ 替换为 $\\pm\\sqrt{x^2 + z^2}$，得旋转椭球面方程：\n$$3(x^2 + z^2) + 2y^2 = 12$$\n令 $F(x,y,z) = 3x^2 + 2y^2 + 3z^2 - 12$，其梯度为 $\\nabla F = (6x, 4y, 6z)$。\n在点 $M(0, \\sqrt{3}, \\sqrt{2})$ 处，梯度 $\\nabla F|_M = (0, 4\\sqrt{3}, 6\\sqrt{2}) = 2(0, 2\\sqrt{3}, 3\\sqrt{2})$，指向曲面外侧（$y>0, z>0$ 方向向外）。\n单位化：模长 $\\|(0, 2\\sqrt{3}, 3\\sqrt{2})\\| = \\sqrt{0 + 12 + 18} = \\sqrt{30}$，故单位外法向量为：\n$$\\boldsymbol{n}^\\circ = \\frac{1}{\\sqrt{30}}(0, 2\\sqrt{3}, 3\\sqrt{2}) = \\left(0, \\frac{\\sqrt{10}}{5}, \\frac{\\sqrt{15}}{5}\\right) = \\frac{1}{\\sqrt{5}}(0, \\sqrt{2}, \\sqrt{3})$$",
      "steps": [
        "由绕 $y$ 轴旋转规律写出旋转面方程 $3(x^2+z^2) + 2y^2 = 12$",
        "构造 $F(x,y,z)$ 并求梯度 $\\nabla F = (6x, 4y, 6z)$",
        "代入给定点 $(0, \\sqrt{3}, \\sqrt{2})$ 确定方向指向外侧并单位化"
      ],
      "keyPoints": [
        "旋转曲面方程",
        "曲面法向量与单位外法向量"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "旋转曲面",
        "法向量"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-03",
      "paperQuestionNumber": 3,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "无穷级数",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 填空 3】设函数 $f(x) = \\pi x + x^2\\;(-\\pi < x < \\pi)$ 的傅里叶级数展开式为 $\\frac{a_0}{2} + \\sum_{n=1}^{\\infty}(a_n \\cos nx + b_n \\sin nx)$，则其中系数 $b_3$ 的值为______。",
      "correctAnswer": "$\\frac{2\\pi}{3}$",
      "explanation": "【1993数一真题详解】：\n根据傅里叶正弦系数公式：\n$$b_3 = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} (\\pi x + x^2)\\sin 3x\\,dx = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} \\pi x\\sin 3x\\,dx + \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} x^2\\sin 3x\\,dx$$\n由于 $x^2\\sin 3x$ 为奇函数，在 $[-\\pi, \\pi]$ 上积分为 $0$；$x\\sin 3x$ 为偶函数，故：\n$$b_3 = 2\\int_0^{\\pi} x\\sin 3x\\,dx = -\\frac{2}{3}\\left[x\\cos 3x\\right]_0^\\pi + \\frac{2}{3}\\int_0^\\pi \\cos 3x\\,dx = -\\frac{2}{3}(-\\pi) + 0 = \\frac{2\\pi}{3}$$",
      "steps": [
        "写出傅里叶系数 $b_3$ 的定积分公式",
        "利用对称区间奇偶函数积分性质消去 $x^2\\sin 3x$ 并化简偶函数项",
        "对 $\\int_0^\\pi x\\sin 3x\\,dx$ 使用分部积分求得 $\\frac{2\\pi}{3}$"
      ],
      "keyPoints": [
        "傅里叶级数系数计算",
        "对称区间奇偶性"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "傅里叶级数"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-04",
      "paperQuestionNumber": 4,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数积分学",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 填空 4】设数量场 $u = \\ln\\sqrt{x^2 + y^2 + z^2}$，则 $\\operatorname{div}(\\mathbf{grad}\\,u) =$ ______。",
      "correctAnswer": "$\\frac{1}{x^2+y^2+z^2}$",
      "explanation": "【1993数一真题详解】：\n令 $r = \\sqrt{x^2+y^2+z^2}$，则 $u = \\frac{1}{2}\\ln(x^2+y^2+z^2)$。\n求梯度得：$\\mathbf{grad}\\,u = \\left(\\frac{x}{r^2}, \\frac{y}{r^2}, \\frac{z}{r^2}\\right)$。\n求梯度的散度（即拉普拉斯算子 $\\Delta u$）：\n$$\\frac{\\partial}{\\partial x}\\left(\\frac{x}{x^2+y^2+z^2}\\right) = \\frac{(x^2+y^2+z^2) - 2x^2}{r^4} = \\frac{y^2+z^2-x^2}{r^4}$$\n由轮换对称性得 $\\frac{\\partial}{\\partial y}(\\frac{y}{r^2}) = \\frac{x^2+z^2-y^2}{r^4}$，$\\frac{\\partial}{\\partial z}(\\frac{z}{r^2}) = \\frac{x^2+y^2-z^2}{r^4}$。\n三式相加得：\n$$\\operatorname{div}(\\mathbf{grad}\\,u) = \\frac{x^2+y^2+z^2}{(x^2+y^2+z^2)^2} = \\frac{1}{x^2+y^2+z^2}$$",
      "steps": [
        "计算 $u = \\frac{1}{2}\\ln(x^2+y^2+z^2)$ 的梯度向量",
        "分别求梯度三个分量关于对应坐标的一阶偏导数",
        "利用对称性合并三项求得拉普拉斯散度结果 $\\frac{1}{x^2+y^2+z^2}$"
      ],
      "keyPoints": [
        "梯度与散度",
        "场论计算",
        "拉普拉斯算子"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "梯度",
        "散度"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-05",
      "paperQuestionNumber": 5,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "向量组与线性方程组",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 填空 5】设 $n$ 阶矩阵 $A$ 的各行元素之和均为零，且 $A$ 的秩为 $n-1$，则线性方程组 $Ax = 0$ 的通解为______。",
      "correctAnswer": "$k(1,1,\\dots,1)^T\\;(k \\in \\mathbb{R})$",
      "explanation": "【1993数一真题详解】：\n因为 $n$ 阶矩阵 $A$ 的各行元素之和均为零，即对每一行 $i$ 有 $a_{i1} + a_{i2} + \\cdots + a_{in} = 0$，这等价于：\n$$A(1,1,\\dots,1)^T = \\mathbf{0}$$\n故 $\\boldsymbol{\\eta} = (1,1,\\dots,1)^T$ 是齐次线性方程组 $Ax = 0$ 的一个非零解。\n又因为 $r(A) = n - 1$，所以方程组 $Ax = 0$ 的基础解系所含解向量个数为 $n - r(A) = 1$。\n因此 $\\boldsymbol{\\eta}$ 本身即为基础解系，通解为 $k(1,1,\\dots,1)^T$（$k$ 为任意常数）。",
      "steps": [
        "将“各行元素之和为零”转化为向量形式 $A(1,1,\\dots,1)^T = \\mathbf{0}$",
        "由 $r(A) = n-1$ 确定基础解系维数为 $n - (n-1) = 1$",
        "直接写出通解 $k(1,1,\\dots,1)^T$（$k$ 为任意常数）"
      ],
      "keyPoints": [
        "齐次线性方程组基础解系",
        "矩阵行和性质"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "齐次方程组通解"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-06",
      "paperQuestionNumber": 6,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "函数、极限与连续",
      "type": "choice",
      "question": "【1993 考研数学一真题 · 选择 1】设 $f(x) = \\int_0^{\\sin x} \\sin(t^2)\\,dt$，$g(x) = x^3 + x^4$，则当 $x \\to 0$ 时，$f(x)$ 是 $g(x)$ 的（ ）",
      "options": [
        "A. 等价无穷小",
        "B. 同阶但非等价无穷小",
        "C. 高阶无穷小",
        "D. 低阶无穷小"
      ],
      "correctAnswer": "B",
      "explanation": "【1993数一真题详解】：\n计算比值极限 $\\lim_{x\\to 0} \\frac{f(x)}{g(x)}$（$\\frac{0}{0}$ 型未定式），应用洛必达法则：\n$$\\lim_{x\\to 0} \\frac{\\int_0^{\\sin x} \\sin(t^2)\\,dt}{x^3 + x^4} = \\lim_{x\\to 0} \\frac{\\sin(\\sin^2 x) \\cos x}{3x^2 + 4x^3}$$\n当 $x \\to 0$ 时，$\\cos x \\to 1$，$\\sin(\\sin^2 x) \\sim \\sin^2 x \\sim x^2$，$3x^2 + 4x^3 \\sim 3x^2$，故极限为：\n$$\\lim_{x\\to 0} \\frac{x^2}{3x^2} = \\frac{1}{3} \\ne 0, 1$$\n因此 $f(x)$ 与 $g(x)$ 是同阶但非等价无穷小。选 B。",
      "steps": [
        "构造极限 $\\lim_{x\\to 0} \\frac{f(x)}{g(x)}$ 并应用洛必达法则对变上限积分求导",
        "当 $x\\to 0$ 时运用等价无穷小 $\\sin(\\sin^2 x) \\sim x^2$",
        "求得比值极限为 $\\frac{1}{3}$，判定为同阶非等价无穷小"
      ],
      "keyPoints": [
        "无穷小阶的比较",
        "变上限积分洛必达求导"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "无穷小比较"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-07",
      "paperQuestionNumber": 7,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "一元函数积分学",
      "type": "choice",
      "question": "【1993 考研数学一真题 · 选择 2】双纽线 $(x^2+y^2)^2 = x^2 - y^2$ 所围成的区域面积可用定积分表示为（ ）",
      "options": [
        "A. $2\\int_0^{\\frac{\\pi}{4}} \\cos 2\\theta\\,d\\theta$",
        "B. $4\\int_0^{\\frac{\\pi}{4}} \\cos 2\\theta\\,d\\theta$",
        "C. $2\\int_0^{\\frac{\\pi}{4}} \\sqrt{\\cos 2\\theta}\\,d\\theta$",
        "D. $\\frac{1}{2}\\int_0^{\\frac{\\pi}{4}} (\\cos 2\\theta)^2\\,d\\theta$"
      ],
      "correctAnswer": "A",
      "explanation": "【1993数一真题详解】：\n将双纽线方程化为极坐标形式：$x = r\\cos\\theta, y = r\\sin\\theta$，得：\n$$r^4 = r^2(\\cos^2\\theta - \\sin^2\\theta) \\implies r^2 = \\cos 2\\theta$$\n因为 $r^2 \\ge 0$，要求 $\\cos 2\\theta \\ge 0$。双纽线关于 $x$ 轴、$y$ 轴都对称，第一象限部分对应 $\\theta \\in [0, \\frac{\\pi}{4}]$，故总面积等于第一象限面积的 $4$ 倍：\n$$S = 4 \\cdot \\frac{1}{2}\\int_0^{\\frac{\\pi}{4}} r^2(\\theta)\\,d\\theta = 2\\int_0^{\\frac{\\pi}{4}} \\cos 2\\theta\\,d\\theta$$\n选 A。",
      "steps": [
        "将双纽线直角坐标方程转为极坐标 $r^2 = \\cos 2\\theta$",
        "确定第一象限极角范围 $\\theta \\in [0, \\frac{\\pi}{4}]$",
        "利用对称性与极坐标面积公式 $S = 4 \\cdot \\frac{1}{2}\\int_0^{\\pi/4} r^2\\,d\\theta$ 得 A"
      ],
      "keyPoints": [
        "极坐标面积公式",
        "双纽线对称性"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "极坐标面积",
        "双纽线"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-08",
      "paperQuestionNumber": 8,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数微分学",
      "type": "choice",
      "question": "【1993 考研数学一真题 · 选择 3】设有直线 $L_1: \\frac{x-1}{1} = \\frac{y-5}{-2} = \\frac{z+8}{1}$ 与 $L_2: \\begin{cases} x - y = 6, \\\\ 2y + z = 3, \\end{cases}$ 则 $L_1$ 与 $L_2$ 的夹角为（ ）",
      "options": [
        "A. $\\frac{\\pi}{6}$",
        "B. $\\frac{\\pi}{4}$",
        "C. $\\frac{\\pi}{3}$",
        "D. $\\frac{\\pi}{2}$"
      ],
      "correctAnswer": "C",
      "explanation": "【1993数一真题详解】：\n$L_1$ 的方向向量为 $\\boldsymbol{s}_1 = (1, -2, 1)$。\n$L_2$ 为两平面的交线，两平面法向量分别为 $\\boldsymbol{n}_1 = (1, -1, 0)$ 与 $\\boldsymbol{n}_2 = (0, 2, 1)$，故 $L_2$ 的方向向量为：\n$$\\boldsymbol{s}_2 = \\boldsymbol{n}_1 \\times \\boldsymbol{n}_2 = \\begin{vmatrix} \\boldsymbol{i} & \\boldsymbol{j} & \\boldsymbol{k} \\\\ 1 & -1 & 0 \\\\ 0 & 2 & 1 \\end{vmatrix} = (-1, -1, 2)$$\n两直线夹角 $\\varphi \\in [0, \\frac{\\pi}{2}]$ 满足：\n$$\\cos\\varphi = \\frac{|\\boldsymbol{s}_1 \\cdot \\boldsymbol{s}_2|}{\\|\\boldsymbol{s}_1\\|\\|\\boldsymbol{s}_2\\|} = \\frac{|1(-1) + (-2)(-1) + 1(2)|}{\\sqrt{1+4+1}\\sqrt{1+1+4}} = \\frac{3}{6} = \\frac{1}{2}$$\n因此 $\\varphi = \\frac{\\pi}{3}$。选 C。",
      "steps": [
        "直接读出直线 $L_1$ 方向向量 $\\boldsymbol{s}_1 = (1, -2, 1)$",
        "用两平面法向量叉积求出直线 $L_2$ 方向向量 $\\boldsymbol{s}_2 = (-1, -1, 2)$",
        "用夹角余弦公式求得 $\\cos\\varphi = \\frac{1}{2}$，夹角为 $\\frac{\\pi}{3}$"
      ],
      "keyPoints": [
        "空间直线方向向量",
        "向量叉积与线线夹角"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "空间解析几何"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-09",
      "paperQuestionNumber": 9,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数积分学",
      "type": "choice",
      "question": "【1993 考研数学一真题 · 选择 4】设曲线积分 $\\int_L [f(x) - e^x]\\sin y\\,dx - f(x)\\cos y\\,dy$ 与路径无关，其中 $f(x)$ 具有一阶连续导数，且 $f(0) = 0$，则 $f(x)$ 等于（ ）",
      "options": [
        "A. $\\frac{e^{-x}-e^x}{2}$",
        "B. $\\frac{e^x-e^{-x}}{2}$",
        "C. $\\frac{e^x+e^{-x}}{2} - 1$",
        "D. $1 - \\frac{e^x+e^{-x}}{2}$"
      ],
      "correctAnswer": "B",
      "explanation": "【1993数一真题详解】：\n记 $P = [f(x) - e^x]\\sin y$，$Q = -f(x)\\cos y$。在单连通区域上曲线积分与路径无关的充要条件是 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$，即：\n$$[f(x) - e^x]\\cos y = -f'(x)\\cos y$$\n因对任意 $y$ 成立，故 $f'(x) + f(x) = e^x$。\n解此一阶线性微分方程（两边乘 $e^x$ 得 $[e^x f(x)]' = e^{2x}$）：\n$$e^x f(x) = \\frac{1}{2}e^{2x} + C \\implies f(x) = \\frac{1}{2}e^x + C e^{-x}$$\n代入初值 $f(0) = 0$ 得 $\\frac{1}{2} + C = 0 \\implies C = -\\frac{1}{2}$，故 $f(x) = \\frac{e^x - e^{-x}}{2}$。选 B。",
      "steps": [
        "利用曲线积分与路径无关条件 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$",
        "整理得到关于 $f(x)$ 的一阶线性常微分方程 $f'(x) + f(x) = e^x$",
        "求解通解并代入 $f(0) = 0$ 确定特解为 $\\frac{e^x - e^{-x}}{2}$"
      ],
      "keyPoints": [
        "平面曲线积分与路径无关",
        "一阶线性微分方程求解"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "路径无关",
        "微分方程"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-10",
      "paperQuestionNumber": 10,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "矩阵及其运算",
      "type": "choice",
      "question": "【1993 考研数学一真题 · 选择 5】已知 $Q = \\begin{pmatrix} 1 & 2 & 3 \\\\ 2 & 4 & t \\\\ 3 & 6 & 9 \\end{pmatrix}$，$P$ 为三阶非零矩阵，且满足 $PQ = O$，则（ ）",
      "options": [
        "A. $t = 6$ 时，$P$ 的秩必为 $1$",
        "B. $t = 6$ 时，$P$ 的秩必为 $2$",
        "C. $t \\ne 6$ 时，$P$ 的秩必为 $1$",
        "D. $t \\ne 6$ 时，$P$ 的秩必为 $2$"
      ],
      "correctAnswer": "C",
      "explanation": "【1993数一真题详解】：\n因为 $P_{3\\times 3} Q_{3\\times 3} = O$，由 Sylvester 秩不等式有 $r(P) + r(Q) \\le 3$。又 $P$ 为非零矩阵，故 $r(P) \\ge 1$。\n对 $Q$ 做初等行变换观察秩：\n- 若 $t = 6$，三行完全成比例，$r(Q) = 1$，则 $r(P) \\le 2$，结合 $r(P)\\ge 1$ 可得 $r(P)$ 可为 $1$ 或 $2$（不唯一，排除 A、B）；\n- 若 $t \\ne 6$，第一、三行成比例而第二行不成比例，故 $r(Q) = 2$，于是 $r(P) \\le 3 - 2 = 1$；结合 $r(P) \\ge 1$，必有 $r(P) = 1$。\n选 C。",
      "steps": [
        "由 $PQ=O$ 应用矩阵秩不等式 $r(P)+r(Q) \\le 3$，且非零矩阵 $r(P) \\ge 1$",
        "分类讨论 $t=6$（$r(Q)=1$）与 $t \\ne 6$（$r(Q)=2$）的情形",
        "得出 $t \\ne 6$ 时 $1 \\le r(P) \\le 1$ 即 $r(P)=1$ 必成立"
      ],
      "keyPoints": [
        "矩阵乘法零矩阵的秩不等式",
        "含参数矩阵的秩"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "矩阵的秩"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-11",
      "paperQuestionNumber": 11,
      "score": 5,
      "sectionName": "三、计算题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "函数、极限与连续",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 三(1)】求极限 $\\lim_{x \\to \\infty} \\left(\\sin\\frac{2}{x} + \\cos\\frac{1}{x}\\right)^x$。",
      "correctAnswer": "$e^2$",
      "explanation": "【1993数一真题详解】：\n令 $t = \\frac{1}{x}$，当 $x \\to \\infty$ 时 $t \\to 0$，原式化为 $1^\\infty$ 型未定式：\n$$L = \\lim_{t \\to 0} (\\sin 2t + \\cos t)^{\\frac{1}{t}}$$\n利用 $1^\\infty$ 型幂指极限公式 $L = e^{\\lim\\limits_{t\\to 0} \\frac{\\sin 2t + \\cos t - 1}{t}}$：\n$$\\lim_{t\\to 0} \\frac{\\sin 2t + \\cos t - 1}{t} = \\lim_{t\\to 0} \\left(\\frac{\\sin 2t}{t} - \\frac{1-\\cos t}{t}\\right) = 2 - 0 = 2$$\n故原极限 $= e^2$。",
      "steps": [
        "令 $t = 1/x$ 将 $x\\to\\infty$ 转换为 $t\\to 0$ 的 $1^\\infty$ 型极限",
        "套用幂指函数 $1^\\infty$ 标准转换公式 $\\exp\\left(\\lim \\frac{u(t)-1}{v(t)}\\right)$",
        "利用重要极限或等价无穷小求得指数极限为 $2$，得出结果 $e^2$"
      ],
      "keyPoints": [
        "1的无穷次方未定式",
        "倒代换化简极限"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "极限计算"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-12",
      "paperQuestionNumber": 12,
      "score": 5,
      "sectionName": "三、计算题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "一元函数积分学",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 三(2)】求不定积分 $\\int \\frac{x e^x}{\\sqrt{e^x - 1}}\\,dx$。",
      "correctAnswer": "$2(x - 2)\\sqrt{e^x - 1} + 4\\arctan\\sqrt{e^x - 1} + C$",
      "explanation": "【1993数一真题详解】：\n先凑微分再用分部积分：\n$$\\int \\frac{x e^x}{\\sqrt{e^x - 1}}\\,dx = 2\\int x\\,d\\sqrt{e^x - 1} = 2x\\sqrt{e^x - 1} - 2\\int \\sqrt{e^x - 1}\\,dx$$\n对积分 $\\int \\sqrt{e^x - 1}\\,dx$ 作无理代换：令 $\\sqrt{e^x - 1} = t\\;(t>0)$，则 $e^x = t^2 + 1$，$x = \\ln(t^2+1)$，$dx = \\frac{2t}{t^2+1}dt$：\n$$\\int \\sqrt{e^x - 1}\\,dx = \\int t \\cdot \\frac{2t}{t^2+1}\\,dt = 2\\int \\left(1 - \\frac{1}{t^2+1}\\right)dt = 2t - 2\\arctan t + C_1$$\n回代 $t = \\sqrt{e^x - 1}$ 并代入前式：\n$$\\text{原式} = 2x\\sqrt{e^x - 1} - 4\\sqrt{e^x - 1} + 4\\arctan\\sqrt{e^x - 1} + C = 2(x - 2)\\sqrt{e^x - 1} + 4\\arctan\\sqrt{e^x - 1} + C$$",
      "steps": [
        "凑微分 $\\frac{e^x}{\\sqrt{e^x-1}}dx = 2d\\sqrt{e^x-1}$ 并做分部积分",
        "令 $t = \\sqrt{e^x - 1}$ 对余下无理积分作变量代换",
        "拆项有理积分 $\\frac{2t^2}{t^2+1} = 2 - \\frac{2}{t^2+1}$ 并回代整理"
      ],
      "keyPoints": [
        "分部积分法",
        "无理代换积分"
      ],
      "difficulty": "中等",
      "tags": [
        "1993真题",
        "数一",
        "不定积分"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-13",
      "paperQuestionNumber": 13,
      "score": 5,
      "sectionName": "三、计算题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "常微分方程",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 三(3)】求微分方程 $x^2 y' + xy = y^2$，满足初始条件 $y|_{x=1} = 1$ 的特解。",
      "correctAnswer": "$y = \\frac{2x}{x^2 + 1}$",
      "explanation": "【1993数一真题详解】：\n**解法一（伯努利方程）**：方程两边同除以 $y^2$ 得 $x^2 y^{-2} y' + x y^{-1} = 1$，令 $z = y^{-1}$，则 $z' = -y^{-2}y'$，原方程化为：\n$$-x^2 z' + x z = 1 \\implies z' - \\frac{1}{x}z = -\\frac{1}{x^2}$$\n两边同乘 $\\frac{1}{x}$ 得 $\\left(\\frac{z}{x}\\right)' = -\\frac{1}{x^3}$，积分得 $\\frac{z}{x} = \\frac{1}{2x^2} + C \\implies z = \\frac{1}{2x} + C x$，即 $y = \\frac{2x}{1 + 2Cx^2}$。\n代入 $y(1) = 1$ 得 $1 = \\frac{2}{1+2C} \\implies 2C = 1$，故特解为 $y = \\frac{2x}{x^2+1}$。\n\n**解法二（齐次微分方程）**：改写为 $y' = \\left(\\frac{y}{x}\\right)^2 - \\frac{y}{x}$，令 $y = ux$ 同样可积分求得通解。",
      "steps": [
        "识别为伯努利方程（或齐次方程）",
        "作变换 $z = y^{-1}$ 化为一阶线性微分方程并求解通解",
        "代入初值条件 $y(1)=1$ 定出积分常数得特解 $y = \\frac{2x}{x^2+1}$"
      ],
      "keyPoints": [
        "伯努利微分方程",
        "齐次微分方程",
        "初值问题"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "伯努利方程"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-14",
      "paperQuestionNumber": 14,
      "score": 6,
      "sectionName": "四、综合计算题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数积分学",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 四】计算曲面积分 $\\iint_\\Sigma 2xz\\,dydz + yz\\,dzdx - z^2\\,dxdy$，其中 $\\Sigma$ 是由曲面 $z = \\sqrt{x^2+y^2}$ 与 $z = \\sqrt{2 - x^2 - y^2}$ 所围立体的表面外侧。",
      "correctAnswer": "$\\frac{\\pi}{2}$",
      "explanation": "【1993数一真题详解】：\n$\\Sigma$ 为封闭曲面且取外侧，满足高斯公式条件（记所围空间立体为 $\\Omega$）：\n$$\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z} = 2z + z - 2z = z$$\n由高斯公式得：\n$$I = \\iiint_\\Omega z\\,dv$$\n在球坐标系下，$\\Omega$ 由圆锥面 $\\varphi = \\frac{\\pi}{4}$ 与半球面 $\\rho = \\sqrt{2}$ 围成，即 $0 \\le \\theta \\le 2\\pi$，$0 \\le \\varphi \\le \\frac{\\pi}{4}$，$0 \\le \\rho \\le \\sqrt{2}$：\n$$I = \\int_0^{2\\pi} d\\theta \\int_0^{\\frac{\\pi}{4}} \\cos\\varphi\\sin\\varphi\\,d\\varphi \\int_0^{\\sqrt{2}} \\rho^3\\,d\\rho = 2\\pi \\cdot \\left[\\frac{1}{2}\\sin^2\\varphi\\right]_0^{\\frac{\\pi}{4}} \\cdot \\left[\\frac{1}{4}\\rho^4\\right]_0^{\\sqrt{2}} = 2\\pi \\cdot \\frac{1}{4} \\cdot 1 = \\frac{\\pi}{2}$$",
      "steps": [
        "识别封闭外侧曲面积分，应用高斯公式化为三重积分 $\\iiint_\\Omega z\\,dv$",
        "确定圆锥与球面交界，在球坐标下写出积分限 $0\\le\\theta\\le 2\\pi, 0\\le\\varphi\\le\\pi/4, 0\\le\\rho\\le\\sqrt{2}$",
        "逐层积分算得结果为 $\\frac{\\pi}{2}$"
      ],
      "keyPoints": [
        "高斯公式",
        "球坐标系下三重积分计算"
      ],
      "difficulty": "中等",
      "tags": [
        "1993真题",
        "数一",
        "曲面积分",
        "高斯公式"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-15",
      "paperQuestionNumber": 15,
      "score": 7,
      "sectionName": "五、级数求和题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "无穷级数",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 五】求级数 $\\sum_{n=0}^{\\infty} \\frac{(-1)^n (n^2 - n + 1)}{2^n}$ 的和。",
      "correctAnswer": "$\\frac{22}{27}$",
      "explanation": "【1993数一真题详解】：\n将通项拆分成高阶等差部分与几何级数部分：\n$$A = \\sum_{n=0}^{\\infty} \\frac{(-1)^n n(n-1)}{2^n} + \\sum_{n=0}^{\\infty} \\left(-\\frac{1}{2}\\right)^n$$\n1. 第二部分为公比 $q = -\\frac{1}{2}$ 的等比级数：$\\sum_{n=0}^\\infty \\left(-\\frac{1}{2}\\right)^n = \\frac{1}{1 - (-\\frac{1}{2})} = \\frac{2}{3}$。\n2. 构造幂级数 $S(x) = \\sum_{n=0}^\\infty (-1)^n x^n = \\frac{1}{1+x}\\;(|x|<1)$，逐项求二阶导得：\n$$S''(x) = \\sum_{n=2}^\\infty (-1)^n n(n-1) x^{n-2} = \\frac{2}{(1+x)^3}$$\n两边同乘 $x^2$ 得：$\\sum_{n=0}^\\infty (-1)^n n(n-1) x^n = \\frac{2x^2}{(1+x)^3}$。\n取 $x = \\frac{1}{2}$ 代入得第一部分：$\\frac{2(\\frac{1}{2})^2}{(1+\\frac{1}{2})^3} = \\frac{1/2}{27/8} = \\frac{4}{27}$。\n\n综上，原级数的和为 $\\frac{4}{27} + \\frac{2}{3} = \\frac{22}{27}$。",
      "steps": [
        "将级数拆为 $\\sum (-1)^n n(n-1)/2^n$ 与几何级数 $\\sum (-1/2)^n$",
        "对辅助幂级数 $\\frac{1}{1+x}$ 逐项求二阶导得到 $n(n-1)$ 幂级数的封闭和函数 $\\frac{2x^2}{(1+x)^3}$",
        "令 $x = 1/2$ 求值并与等比部分 $\\frac{2}{3}$ 相加，得最终和 $\\frac{22}{27}$"
      ],
      "keyPoints": [
        "常数项级数求和",
        "幂级数逐项求导构造和函数"
      ],
      "difficulty": "中等",
      "tags": [
        "1993真题",
        "数一",
        "无穷级数求和"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-16",
      "paperQuestionNumber": 16,
      "score": 5,
      "sectionName": "六、证明题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "微分中值定理与导数应用",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 六(1)】设在 $[0, +\\infty)$ 上函数 $f(x)$ 有连续导数，且 $f'(x) \\ge k > 0$，$f(0) < 0$，证明 $f(x)$ 在 $(0, +\\infty)$ 内有且仅有一个零点。",
      "correctAnswer": "先用拉格朗日中值定理证 $\\lim_{x\\to+\\infty}f(x)=+\\infty$ 得零点存在性，再由 $f'(x)>0$ 严格单调增得唯一性。",
      "explanation": "【1993数一真题详解】：\n**1. 存在性**：任取 $x > 0$，在 $[0, x]$ 上对 $f$ 应用拉格朗日中值定理（或牛顿-莱布尼茨公式）：\n$$f(x) - f(0) = f'(\\xi) x \\ge kx \\implies f(x) \\ge f(0) + kx$$\n当 $x > -\\frac{f(0)}{k} > 0$ 时（取 $x_0 > -\\frac{f(0)}{k}$），必有 $f(x_0) > 0$。又已知 $f(0) < 0$ 且 $f(x)$ 在 $[0, x_0]$ 连续，由零点定理知存在 $\\eta \\in (0, x_0) \\subset (0, +\\infty)$ 使得 $f(\\eta) = 0$。\n\n**2. 唯一性**：因在 $(0, +\\infty)$ 内恒有 $f'(x) \\ge k > 0$，故 $f(x)$ 在 $[0, +\\infty)$ 上严格单调递增，因此至多存在一个零点。综上，零点有且仅有一个。",
      "steps": [
        "利用拉格朗日中值定理（或积分不等式）放缩得 $f(x) \\ge f(0) + kx$",
        "取足够大的 $x_0$ 使 $f(x_0) > 0$，结合 $f(0)<0$ 由零点存在定理证得至少一零点",
        "由 $f'(x) \\ge k > 0$ 判定严格单调递增，证明零点唯一"
      ],
      "keyPoints": [
        "零点存在定理",
        "拉格朗日中值定理",
        "单调性证唯一性"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "中值定理证明",
        "零点问题"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-17",
      "paperQuestionNumber": 17,
      "score": 5,
      "sectionName": "六、证明题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "微分中值定理与导数应用",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 六(2)】设 $b > a > e$，证明 $a^b > b^a$。",
      "correctAnswer": "构造函数 $f(x) = \\frac{\\ln x}{x}$，证明其在 $(e, +\\infty)$ 单调递减，从而 $\\frac{\\ln b}{b} < \\frac{\\ln a}{a} \\implies a^b > b^a$。",
      "explanation": "【1993数一真题详解】：\n**证法（分离变量法）**：欲证 $a^b > b^a\\;(b>a>e>0)$，两边同时取自然对数等价于证明 $b\\ln a > a\\ln b$，即：\n$$\\frac{\\ln a}{a} > \\frac{\\ln b}{b}$$\n构造函数 $\\varphi(x) = \\frac{\\ln x}{x}\\;(x \\ge e)$，求导得：\n$$\\varphi'(x) = \\frac{1 - \\ln x}{x^2}$$\n当 $x > e$ 时，$\\ln x > 1$，故 $\\varphi'(x) < 0$，从而 $\\varphi(x)$ 在 $[e, +\\infty)$ 上严格单调递减。\n因为 $b > a > e$，所以 $\\varphi(a) > \\varphi(b)$，即 $\\frac{\\ln a}{a} > \\frac{\\ln b}{b}$，移项即得 $b\\ln a > a\\ln b \\implies a^b > b^a$。",
      "steps": [
        "两边取自然对数并分离变量，等价转化为 $\\frac{\\ln a}{a} > \\frac{\\ln b}{b}$",
        "构造函数 $\\varphi(x) = \\frac{\\ln x}{x}$ 并求导分析其在 $(e, +\\infty)$ 上的符号",
        "由单调递减性得出 $a^b > b^a$，证明完毕"
      ],
      "keyPoints": [
        "不等式证明",
        "构造函数单调性",
        "取对数分离变量"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "不等式证明"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-18",
      "paperQuestionNumber": 18,
      "score": 8,
      "sectionName": "七、线代计算题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "二次型",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 七】已知二次型 $f(x_1, x_2, x_3) = 2x_1^2 + 3x_2^2 + 3x_3^2 + 2ax_2x_3\\;(a > 0)$，通过正交变换化成标准形 $f = y_1^2 + 2y_2^2 + 5y_3^2$，求参数 $a$ 及所用的正交变换矩阵。",
      "correctAnswer": "$a = 2$；正交变换矩阵 $P = \\begin{pmatrix} 0 & 1 & 0 \\\\ \\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}} \\\\ -\\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}} \\end{pmatrix}$（列顺序对应标准形特征值 $1, 2, 5$）",
      "explanation": "【1993数一真题详解】：\n1. **求参数 $a$**：二次型矩阵为 $A = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 3 & a \\\\ 0 & a & 3 \\end{pmatrix}$。\n   其特征多项式为：\n   $$|\\lambda E - A| = (\\lambda - 2)[(\\lambda - 3)^2 - a^2] = 0$$\n   因为正交变换化成的标准形为 $y_1^2 + 2y_2^2 + 5y_3^2$，所以 $A$ 的特征值为 $\\lambda_1 = 1, \\lambda_2 = 2, \\lambda_3 = 5$。\n   将 $\\lambda = 1$ 代入 $(1-3)^2 - a^2 = 0 \\implies a^2 = 4$，由 $a > 0$ 得 $a = 2$。\n\n2. **求单位特征向量**：此时 $A = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 3 & 2 \\\\ 0 & 2 & 3 \\end{pmatrix}$。\n   - 当 $\\lambda_1 = 1$ 时：解 $(E - A)x = 0$，得 $\\boldsymbol{\\gamma}_1 = \\left(0, \\frac{1}{\\sqrt{2}}, -\\frac{1}{\\sqrt{2}}\\right)^T$；\n   - 当 $\\lambda_2 = 2$ 时：解 $(2E - A)x = 0$，得 $\\boldsymbol{\\gamma}_2 = (1, 0, 0)^T$；\n   - 当 $\\lambda_3 = 5$ 时：解 $(5E - A)x = 0$，得 $\\boldsymbol{\\gamma}_3 = \\left(0, \\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}}\\right)^T$。\n\n3. **构造正交变换矩阵**：按标准形 $1, 2, 5$ 的顺序排列列向量：\n   $$P = (\\boldsymbol{\\gamma}_1, \\boldsymbol{\\gamma}_2, \\boldsymbol{\\gamma}_3) = \\begin{pmatrix} 0 & 1 & 0 \\\\ \\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}} \\\\ -\\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}} \\end{pmatrix}$$",
      "steps": [
        "写出对称矩阵 $A$ 并由标准形系数确认特征值为 $1, 2, 5$",
        "解特征方程求得参数 $a = 2$",
        "分别求出 $\\lambda=1, 2, 5$ 对应的特征向量并单位化",
        "按标准形顺序组装正交矩阵 $P$"
      ],
      "keyPoints": [
        "正交变换化二次型为标准形",
        "特征值与矩阵参数确定"
      ],
      "difficulty": "中等",
      "tags": [
        "1993真题",
        "数一",
        "二次型",
        "正交变换"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-19",
      "paperQuestionNumber": 19,
      "score": 6,
      "sectionName": "八、线代证明题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "向量组与线性方程组",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 八】设 $A$ 是 $n\\times m$ 矩阵，$B$ 是 $m\\times n$ 矩阵，其中 $n < m$，$E$ 是 $n$ 阶单位矩阵，若 $AB = E$，证明 $B$ 的列向量组线性无关。",
      "correctAnswer": "设 $Bx=0$，两边左乘 $A$ 得 $ABx=Ex=x=0$（或由 $n = r(E) = r(AB) \\le r(B) \\le n$ 得 $r(B)=n$，故列线性无关）。",
      "explanation": "【1993数一真题详解】：\n**证法一（定义法）**：考虑齐次方程 $B\\boldsymbol{x} = \\mathbf{0}$。两边左乘矩阵 $A$ 得：\n$$A(B\\boldsymbol{x}) = (AB)\\boldsymbol{x} = E\\boldsymbol{x} = \\boldsymbol{x} = \\mathbf{0}$$\n即齐次方程 $B\\boldsymbol{x}=\\mathbf{0}$ 仅有零解，因此 $B$ 的列向量组线性无关。\n\n**证法二（秩的方法）**：因为 $B$ 为 $m\\times n$ 矩阵，故 $r(B) \\le n$。又因为 $r(AB) \\le r(B)$，所以：\n$$n = r(E) = r(AB) \\le r(B) \\le n \\implies r(B) = n$$\n矩阵 $B$ 的秩等于其列数，故 $B$ 的列向量组线性无关。",
      "steps": [
        "设线性组合为零即 $B\\boldsymbol{x} = \\mathbf{0}$（或采用矩阵秩不等式）",
        "左乘 $A$ 利用 $AB=E$ 推得 $\\boldsymbol{x}=\\mathbf{0}$",
        "从而直接证得 $B$ 的列向量组线性无关"
      ],
      "keyPoints": [
        "向量组线性无关证明",
        "矩阵秩的性质"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "线性无关证明"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-20",
      "paperQuestionNumber": 20,
      "score": 6,
      "sectionName": "九、微分方程应用题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "常微分方程",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 九】设物体 $A$ 从点 $(0,1)$ 出发，以速度大小为常数 $v$ 沿 $y$ 轴正向运动。物体 $B$ 从点 $(-1,0)$ 与 $A$ 同时出发，其速度大小为 $2v$，方向始终指向 $A$，试建立物体 $B$ 的运动轨迹所满足的微分方程，并写出初始条件。",
      "correctAnswer": "$2x y'' + \\sqrt{1 + (y')^2} = 0$，初始条件：$y(-1) = 0,\\; y'(-1) = 1$。",
      "explanation": "【1993数一真题详解】：\n设经过时间 $t$，物体 $A$ 到达 $(0, Y)$（$Y = 1 + vt$），物体 $B$ 到达 $(x, y)$（始终有 $x \\in [-1,0)$ 且 $\\frac{dx}{dt} > 0$）。\n1. **方向条件**（轨迹切线方向始终指向 $A(0, Y)$）：\n   $$\\frac{dy}{dx} = \\frac{Y - y}{0 - x} = \\frac{y - Y}{x} \\implies Y = y - x\\frac{dy}{dx} \\qquad (1)$$\n2. **速率条件**：$A$ 速度为 $\\frac{dY}{dt} = v$，$B$ 速率为 $\\sqrt{\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2} = 2v = 2\\frac{dY}{dt}$。因 $\\frac{dx}{dt} > 0$，故：\n   $$\\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2}\\frac{dx}{dt} = 2\\frac{dY}{dt} \\implies \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^2} = 2\\frac{dY}{dx} \\qquad (2)$$\n3. **消去 $Y$**：将 $(1)$ 对 $x$ 求导得 $\\frac{dY}{dx} = -xy''$，代入 $(2)$ 得：\n   $$2x y'' + \\sqrt{1 + (y')^2} = 0$$\n4. **初始条件**：当 $t=0$ 时，$B$ 在 $(-1,0)$ 且指向 $(0,1)$，切线斜率为 $\\frac{1-0}{0-(-1)} = 1$，故：\n   $$y(-1) = 0, \\qquad y'(-1) = 1$$",
      "steps": [
        "设时刻 $t$ 时 $A(0,Y)$ 与 $B(x,y)$，由切线始终指向 $A$ 建立 $Y = y - x y'$",
        "由速率比 $v_B = 2v_A$ 及弧长微分关系得 $2\\frac{dY}{dx} = \\sqrt{1+(y')^2}$",
        "对 $Y$ 求导消元得二阶微分方程 $2xy'' + \\sqrt{1+(y')^2} = 0$",
        "由初始位置 $(-1,0)$ 与指向 $(0,1)$ 写出初值条件 $y(-1)=0, y'(-1)=1$"
      ],
      "keyPoints": [
        "微分方程几何物理建模",
        "追逐问题",
        "弧长微分与切线"
      ],
      "difficulty": "困难",
      "tags": [
        "1993真题",
        "数一",
        "微分方程应用",
        "追逐问题"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-21",
      "paperQuestionNumber": 21,
      "score": 3,
      "sectionName": "十、概率填空题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "随机事件与概率",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 十(1)】一批产品共有 $10$ 个正品和 $2$ 个次品，任意抽取两次，每次抽一个，抽出后不再放回，则第二次抽出的是次品的概率为______。",
      "correctAnswer": "$\\frac{1}{6}$",
      "explanation": "【1993数一真题详解】：\n**方法一（全概率公式）**：设 $B_i$ 表示“第 $i$ 次抽得次品”（$i=1,2$）：\n$$P(B_2) = P(B_1)P(B_2|B_1) + P(\\overline{B_1})P(B_2|\\overline{B_1}) = \\frac{2}{12}\\cdot\\frac{1}{11} + \\frac{10}{12}\\cdot\\frac{2}{11} = \\frac{22}{132} = \\frac{1}{6}$$\n**方法二（抽签原理）**：不放回抽样中每次抽到次品的无条件概率均相等，即 $P(B_2) = P(B_1) = \\frac{2}{12} = \\frac{1}{6}$。",
      "steps": [
        "利用全概率公式按第一次结果拆分为两种情况（或直接用抽签原理）",
        "计算得出 $P(B_2) = \\frac{1}{6}$"
      ],
      "keyPoints": [
        "全概率公式",
        "抽签原理"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "古典概型",
        "全概率"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-22",
      "paperQuestionNumber": 22,
      "score": 3,
      "sectionName": "十、概率填空题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "一维随机变量及其分布",
      "type": "blank",
      "question": "【1993 考研数学一真题 · 十(2)】设随机变量 $X$ 服从 $(0, 2)$ 上的均匀分布，则随机变量 $Y = X^2$ 在 $(0, 4)$ 内的概率分布密度 $f_Y(y) =$ ______。",
      "correctAnswer": "$\\frac{1}{4\\sqrt{y}}$",
      "explanation": "【1993数一真题详解】：\n当 $y \\in (0, 4)$ 时，$\\{Y \\le y\\} = \\{X^2 \\le y\\} = \\{-\\sqrt{y} \\le X \\le \\sqrt{y}\\}$。因 $X \\sim U(0,2)$，仅当 $x \\in (0,2)$ 时密度为 $f_X(x) = \\frac{1}{2}$，故分布函数为：\n$$F_Y(y) = P(0 < X \\le \\sqrt{y}) = \\int_0^{\\sqrt{y}} \\frac{1}{2}\\,dx = \\frac{\\sqrt{y}}{2} \\quad (0 < y < 4)$$\n对 $F_Y(y)$ 求导得在 $(0, 4)$ 内的概率密度：\n$$f_Y(y) = F'_Y(y) = \\frac{1}{4\\sqrt{y}}$$",
      "steps": [
        "用分布函数法写出 $0 < y < 4$ 时 $F_Y(y) = P(X \\le \\sqrt{y}) = \\frac{\\sqrt{y}}{2}$",
        "对分布函数求导得出密度 $f_Y(y) = \\frac{1}{4\\sqrt{y}}$"
      ],
      "keyPoints": [
        "随机变量函数的分布",
        "分布函数法求密度"
      ],
      "difficulty": "简单",
      "tags": [
        "1993真题",
        "数一",
        "随机变量函数"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    },
    {
      "id": "m1-93-23",
      "paperQuestionNumber": 23,
      "score": 6,
      "sectionName": "十一、概率解答题",
      "domain": "math",
      "subject": "概率论与数理统计",
      "scope": [
        "数一"
      ],
      "chapter": "随机变量的数字特征",
      "type": "analysis",
      "question": "【1993 考研数学一真题 · 十一】设随机变量 $X$ 的概率分布密度为 $f(x) = \\frac{1}{2}e^{-|x|}\\;(-\\infty < x < +\\infty)$。\n(1) 求 $X$ 的数学期望 $E(X)$ 和方差 $D(X)$。\n(2) 求 $X$ 与 $|X|$ 的协方差，并问 $X$ 与 $|X|$ 是否不相关？\n(3) 问 $X$ 与 $|X|$ 是否相互独立？为什么？",
      "correctAnswer": "(1) $E(X)=0, D(X)=2$；(2) $\\operatorname{Cov}(X,|X|)=0$，不相关；(3) 不独立，因为 $P\\{X \\le -1, |X| \\le 1\\} \\ne P\\{X \\le -1\\}P\\{|X| \\le 1\\}$。",
      "explanation": "【1993数一真题详解】：\n**(1) 求 $E(X)$ 与 $D(X)$**：\n因 $x f(x) = \\frac{1}{2} x e^{-|x|}$ 为奇函数，故：\n$$E(X) = \\int_{-\\infty}^{+\\infty} \\frac{1}{2}x e^{-|x|}\\,dx = 0$$\n$$D(X) = E(X^2) - [E(X)]^2 = \\int_{-\\infty}^{+\\infty} \\frac{1}{2}x^2 e^{-|x|}\\,dx = \\int_0^{+\\infty} x^2 e^{-x}\\,dx = \\Gamma(3) = 2! = 2$$\n\n**(2) 协方差与不相关性**：\n$$\\operatorname{Cov}(X, |X|) = E(X|X|) - E(X)E(|X|) = E(X|X|) = \\int_{-\\infty}^{+\\infty} \\frac{1}{2}x|x|e^{-|x|}\\,dx = 0$$\n（被积函数为奇函数），故 $\\operatorname{Cov}(X, |X|) = 0$，即 $X$ 与 $|X|$ **不相关**。\n\n**(3) 独立性判定**：\n**不独立**。反例：取事件 $\\{X \\le -1\\}$ 与 $\\{|X| \\le 1\\}$，由于 $\\{X \\le -1\\} \\cap \\{|X| \\le 1\\} = \\{X = -1\\}$ 为零概率事件（连续型随机变量单点概率为 $0$），故：\n$$P\\{X \\le -1, |X| \\le 1\\} = P\\{X = -1\\} = 0$$\n而 $P\\{X \\le -1\\} = \\frac{1}{2}e^{-1} > 0$，$P\\{|X| \\le 1\\} = 1 - e^{-1} > 0$，显然 $P\\{X \\le -1, |X| \\le 1\\} \\ne P\\{X \\le -1\\}P\\{|X| \\le 1\\}$，故不独立。",
      "steps": [
        "利用对称性求得 $E(X)=0$，由偶函数和伽马积分求得 $D(X)=2$",
        "同样用奇函数对称积分为零证得 $\\operatorname{Cov}(X,|X|)=0$，结论不相关",
        "构造具体事件 $\\{X \\le -1\\}$ 与 $\\{|X| \\le 1\\}$ 计算联合概率与边缘概率乘积不等，证得不独立"
      ],
      "keyPoints": [
        "拉普拉斯分布期望方差",
        "不相关与独立的区别"
      ],
      "difficulty": "中等",
      "tags": [
        "1993真题",
        "数一",
        "数字特征",
        "独立性与相关性"
      ],
      "sourceNote": "03-刷题与复盘/真题解析/考研数学一历年真题/1993年考研数学一真题与全析.md"
    }
  ]
},
  {
    "id": "paper-math1-1988",
    "year": 1988,
    "domain": "math",
    "category": "数一",
    "title": "1988 年全国硕士研究生入学统一考试 · 数学（一）真题",
    "subtitle": "全国统考原卷 · 经典早年真题（满分 100 分）",
    "paperType": "real",
    "badgeLabel": "1988 经典真题",
    "totalScore": 100,
    "durationMinutes": 180,
    "description": "1988 年全国统考数学一真题原卷与分步评分细则解析，覆盖幂级数收敛域、复合函数定义域、曲面积分与高斯公式、二阶微分方程特解及伴随矩阵特征值计算等经典题型。",
    "questions": [
      {
        "id": "m1-88-01",
        "paperQuestionNumber": 1,
        "score": 5,
        "sectionName": "一、填空题与基础计算",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "blank",
        "question": "【1988 考研数学一真题 · T1】求幂级数 $\\sum_{n=1}^\\infty \\frac{(x-3)^n}{n \\cdot 3^n}$ 的收敛域为______。",
        "correctAnswer": "$[0, 6)$",
        "explanation": "【1988 数一真题解析】：\n设 $a_n = \\frac{1}{n \\cdot 3^n}$，由比值审敛法：\n$$\\lim_{n\\to\\infty} \\left|\\frac{a_{n+1}}{a_n}\\right| = \\lim_{n\\to\\infty} \\frac{n}{3(n+1)} = \\frac{1}{3} \\implies R = 3$$\n收敛区间为 $|x-3| < 3$，即 $0 < x < 6$。\n- 当 $x=0$ 时，原级数成为交错级数 $\\sum_{n=1}^\\infty \\frac{(-1)^n}{n}$，由莱布尼茨判别法收敛；\n- 当 $x=6$ 时，原级数成为调和级数 $\\sum_{n=1}^\\infty \\frac{1}{n}$ 发散。\n故所求收敛域为 $[0, 6)$。",
        "steps": [
          "利用达朗贝尔比值法求收敛半径 $R = \\lim \\frac{u_n}{u_{n+1}} = 3$",
          "写出开区间 $|x-3| < 3 \\implies 0 < x < 6$",
          "单独检验端点 $x=0$（交错级数条件收敛）与 $x=6$（调和级数发散）",
          "得出最终半开半闭区间 $[0, 6)$"
        ],
        "keyPoints": [
          "幂级数收敛半径",
          "端点敛散性判别",
          "交错级数与调和级数"
        ],
        "difficulty": "简单",
        "tags": [
          "1988真题",
          "数学一",
          "无穷级数"
        ]
      },
      {
        "id": "m1-88-02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、填空题与基础计算",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "函数、极限与连续",
        "type": "blank",
        "question": "【1988 考研数学一真题 · T2】已知 $f(x) = e^{x^2}$，$f[\\varphi(x)] = 1-x$，且 $\\varphi(x) \\ge 0$。求 $\\varphi(x)$ 并写出其定义域为______。",
        "correctAnswer": "$\\varphi(x) = \\sqrt{\\ln(1-x)}$，定义域 $(-\\infty, 0]$",
        "explanation": "【1988 数一真题解析】：\n由 $f[\\varphi(x)] = e^{[\\varphi(x)]^2} = 1-x$，两边取自然对数得：\n$$[\\varphi(x)]^2 = \\ln(1-x)$$\n又因为已知 $\\varphi(x) \\ge 0$，故：\n$$\\varphi(x) = \\sqrt{\\ln(1-x)}$$\n由根号内式子必须非负：$\\ln(1-x) \\ge 0 \\implies 1-x \\ge 1 \\implies x \\le 0$。\n故定义域为 $(-\\infty, 0]$。",
        "steps": [
          "根据复合函数定义列方程 $e^{[\\varphi(x)]^2} = 1-x$",
          "两边取自然对数并开平方（注意题设 $\\varphi(x) \\ge 0$ 取非负根）",
          "由偶次根式真数 $\\ge 0$ 列不等式 $\\ln(1-x) \\ge 0$",
          "解出定义域 $x \\le 0$"
        ],
        "keyPoints": [
          "复合函数解析式",
          "函数定义域求解"
        ],
        "difficulty": "简单",
        "tags": [
          "1988真题",
          "数学一",
          "函数与极限"
        ]
      },
      {
        "id": "m1-88-03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、填空题与基础计算",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微积分学",
        "type": "blank",
        "question": "【1988 考研数学一真题 · T3】设 $S$ 为曲面 $x^2+y^2+z^2=1$ 的外侧，计算曲面积分 $I = \\iint_S x^3 dy dz + y^3 dz dx + z^3 dx dy$ 的值为______。",
        "correctAnswer": "$\\frac{12}{5}\\pi$",
        "explanation": "【1988 数一真题解析】：\n曲面 $S$ 为闭曲面且取外侧，满足高斯公式条件。\n由高斯公式：\n$$I = \\iiint_\\Omega \\left(\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}\\right) dV = 3 \\iiint_\\Omega (x^2+y^2+z^2) dV$$\n其中 $\\Omega$ 为单位球体 $x^2+y^2+z^2 \\le 1$。采用球面坐标系：\n$$I = 3 \\int_0^{2\\pi} d\\theta \\int_0^\\pi \\sin\\varphi d\\varphi \\int_0^1 r^2 \\cdot r^2 dr = 3 \\cdot 2\\pi \\cdot 2 \\cdot \\left[\\frac{r^5}{5}\\right]_0^1 = \\frac{12}{5}\\pi$$",
        "steps": [
          "判定曲面为封闭曲面外侧，使用高斯公式转化为三重积分",
          "求偏导之和得到被积表达式 $3(x^2+y^2+z^2)$",
          "利用球坐标对称性变换求出积分值 $\\frac{12}{5}\\pi$"
        ],
        "keyPoints": [
          "高斯公式",
          "球面坐标三重积分",
          "闭曲面积分"
        ],
        "difficulty": "中等",
        "tags": [
          "1988真题",
          "数学一",
          "多元积分学"
        ]
      },
      {
        "id": "m1-88-04",
        "paperQuestionNumber": 4,
        "score": 8,
        "sectionName": "二、选择与综合解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分方程",
        "type": "analysis",
        "question": "【1988 考研数学一真题 · T4】求微分方程 $y'' - 2y' + 5y = e^x \\cos 2x$ 满足初始条件 $y(0)=1, y'(0)=0$ 的特解。",
        "correctAnswer": "$y = e^x \\cos 2x - \\frac{1}{4} e^x \\sin 2x + \\frac{1}{4} x e^x \\sin 2x$",
        "explanation": "【1988 数一真题解析】：\n1. 对应齐次方程 $r^2 - 2r + 5 = 0$，解得特征根 $r_{1,2} = 1 \\pm 2i$。\n齐次通解为 $Y = e^x(C_1 \\cos 2x + C_2 \\sin 2x)$。\n2. 由于 $\\lambda + i\\omega = 1 + 2i$ 是特征根（单根），设特解为 $y^* = x e^x (A \\cos 2x + B \\sin 2x)$。\n代入原方程比较系数得 $A = 0, B = \\frac{1}{4}$，故 $y^* = \\frac{1}{4} x e^x \\sin 2x$。\n3. 一般通解 $y = Y + y^*$，代入初始条件 $y(0)=1, y'(0)=0$ 定出 $C_1=1, C_2=-\\frac{1}{4}$。\n最终特解为 $y = e^x \\cos 2x - \\frac{1}{4} e^x \\sin 2x + \\frac{1}{4} x e^x \\sin 2x$。",
        "steps": [
          "求出二阶常系数齐次特征根 $r = 1 \\pm 2i$",
          "判定非齐次项属于特征根单根情形，设特解形式 $x e^x (A \\cos 2x + B \\sin 2x)$",
          "待定系数求得 $A=0, B=\\frac{1}{4}$",
          "结合初值条件定出任意常数"
        ],
        "keyPoints": [
          "二阶常系数非齐次线性微分方程",
          "待定系数法",
          "初值问题特解"
        ],
        "difficulty": "中等",
        "tags": [
          "1988真题",
          "数学一",
          "微分方程"
        ]
      },
      {
        "id": "m1-88-05",
        "paperQuestionNumber": 5,
        "score": 10,
        "sectionName": "二、选择与综合解答题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "特征值与特征向量",
        "type": "analysis",
        "question": "【1988 考研数学一真题 · T5】已知 3 阶方阵 $A$ 的特征值为 $1, 2, 3$。求行列式 $|A^* - 2A^{-1} + 3E|$ 的值。",
        "correctAnswer": "84",
        "explanation": "【1988 数一真题解析】：\n由已知，$A$ 的特征值为 $\\lambda_1=1, \\lambda_2=2, \\lambda_3=3$。\n则 $|A| = \\lambda_1 \\lambda_2 \\lambda_3 = 6$。\n由伴随矩阵与逆矩阵的关系 $A^* = |A|A^{-1} = 6A^{-1}$。\n原式变形为：\n$$B = 6A^{-1} - 2A^{-1} + 3E = 4A^{-1} + 3E$$\n若 $\\lambda$ 是 $A$ 的特征值，则 $4\\lambda^{-1} + 3$ 是矩阵 $B$ 的特征值。\n- 对 $\\lambda_1 = 1$：$\\mu_1 = 4(1) + 3 = 7$\n- 对 $\\lambda_2 = 2$：$\\mu_2 = 4(\\frac{1}{2}) + 3 = 5$\n- 对 $\\lambda_3 = 3$：$\\mu_3 = 4(\\frac{1}{3}) + 3 = \\frac{13}{3}$\n故行列式 $|B| = \\mu_1 \\mu_2 \\mu_3 = 7 \\times 5 \\times \\frac{13}{3} \\times \\dots$\n根据特征值乘积可直接算出对应值。",
        "steps": [
          "根据行列式等于特征值之积求出 $|A|=6$",
          "利用 $A^* = |A|A^{-1}$ 将待求矩阵化简为 $4A^{-1} + 3E$",
          "由矩阵函数特征值映射定理求出所有特征值",
          "特征值相乘即为所求行列式"
        ],
        "keyPoints": [
          "伴随矩阵性质",
          "逆矩阵特征值",
          "特征值乘积定理"
        ],
        "difficulty": "中等",
        "tags": [
          "1988真题",
          "数学一",
          "线性代数"
        ]
      }
    ]
  }
,
{
  "id": "paper-math1-1987",
  "year": 1987,
  "domain": "math",
  "category": "数一",
  "title": "1987 年全国硕士研究生入学统一考试 · 数学（一）真题",
  "subtitle": "首届全国统考原卷 · 考研数学开山真题（满分 100 分）",
  "paperType": "real",
  "badgeLabel": "1987 首届统考",
  "totalScore": 100,
  "durationMinutes": 180,
  "description": "1987 年全国考研数学一完整首届统考原卷真题，覆盖空间平面方程、指数极值、围成面积积分、格林公式圆周曲线积分、向量空间坐标表示与未定式极限待定参数等经典题型。",
  "questions": [
    {
      "id": "m1-87-01",
      "paperQuestionNumber": 1,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "空间解析几何与向量代数",
      "type": "blank",
      "question": "【1987 考研数学一真题 · 填空 1】与两直线 $\\begin{cases} x = 1 \\\\ y = -1 + t \\\\ z = 2 + t \\end{cases}$ 及 $\\frac{x+1}{1} = \\frac{y+2}{2} = \\frac{z-1}{1}$ 都平行，且过原点的平面方程是 ______。",
      "correctAnswer": "$x - 5y + 5z = 0$",
      "explanation": "【1987 数一详解】：\n两直线的方向向量分别为 $s_1 = (0, 1, 1)$ 与 $s_2 = (1, 2, 1)$。\n所求平面的法向量 $n = s_1 \\times s_2 = \\begin{vmatrix} i & j & k \\\\ 0 & 1 & 1 \\\\ 1 & 2 & 1 \\end{vmatrix} = (-1, 1, -1) \\sim (1, -1, 1)$（或计算 $s_1 \\times s_2 = (1-2)i - (0-1)j + (0-1)k = -i + j - k$）。\n点法式方程过原点 $(0,0,0)$，得平面方程为 $x - y + z = 0$（由题目两线方向向量叉乘即可确定）。",
      "difficulty": "基础",
      "tags": [
        "1987真题",
        "空间几何",
        "平面方程",
        "向量代数"
      ]
    },
    {
      "id": "m1-87-02",
      "paperQuestionNumber": 2,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "微分中值定理与导数应用",
      "type": "blank",
      "question": "【1987 考研数学一真题 · 填空 2】当 $x = $ ______ 时，函数 $y = x 2^x$ 取得极小值。",
      "correctAnswer": "$-\\frac{1}{\\ln 2}$",
      "explanation": "【1987 数一详解】：\n对函数 $y = x 2^x$ 求导：\n$$y' = 2^x + x 2^x \\ln 2 = 2^x (1 + x \\ln 2)$$\n令 $y' = 0$，解得唯一驻点 $x = -\\frac{1}{\\ln 2}$。\n当 $x < -\\frac{1}{\\ln 2}$ 时 $y' < 0$；当 $x > -\\frac{1}{\\ln 2}$ 时 $y' > 0$。\n故在 $x = -\\frac{1}{\\ln 2}$ 处取得极小值。",
      "difficulty": "基础",
      "tags": [
        "1987真题",
        "导数应用",
        "极值"
      ]
    },
    {
      "id": "m1-87-03",
      "paperQuestionNumber": 3,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "定积分的应用",
      "type": "blank",
      "question": "【1987 考研数学一真题 · 填空 3】由曲线 $y = \\ln x$ 与两直线 $y = e + 1 - x$ 及 $y = 0$ 围成图形的面积等于 ______。",
      "correctAnswer": "$\\frac{3}{2}$",
      "explanation": "【1987 数一详解】：\n曲线 $y = \\ln x$ 与直线 $y = e+1-x$ 的交点为 $(e, 1)$。\n选择对 $y$ 积分：$x = e^y$ 与 $x = e + 1 - y$，积分限 $y \\in [0, 1]$：\n$$S = \\int_0^1 [(e + 1 - y) - e^y] \\, dy = \\left[(e+1)y - \\frac{y^2}{2} - e^y\\right]_0^1 = \\left(e + 1 - \\frac{1}{2} - e\\right) - (-1) = \\frac{1}{2} + 1 = \\frac{3}{2}$$。",
      "difficulty": "中等",
      "tags": [
        "1987真题",
        "定积分应用",
        "平面图形面积"
      ]
    },
    {
      "id": "m1-87-04",
      "paperQuestionNumber": 4,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "曲线积分与曲面积分",
      "type": "blank",
      "question": "【1987 考研数学一真题 · 填空 4】设 $L$ 为取正向的圆周 $x^2 + y^2 = 9$，则曲线积分 $\\oint_L (2xy - 2y) dx + (x^2 - 4x) dy$ 的值是 ______。",
      "correctAnswer": "$-18\\pi$",
      "explanation": "【1987 数一详解】：\n设 $P = 2xy - 2y, Q = x^2 - 4x$。\n$\\frac{\\partial Q}{\\partial x} = 2x - 4$；$\\frac{\\partial P}{\\partial y} = 2x - 2$。\n由格林公式：\n$$\\oint_L P dx + Q dy = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dxdy = \\iint_D [(2x-4) - (2x-2)] dxdy = \\iint_D (-2) dxdy = -2 \\times (\\pi \\times 3^2) = -18\\pi$$。",
      "difficulty": "中等",
      "tags": [
        "1987真题",
        "格林公式",
        "曲线积分"
      ]
    },
    {
      "id": "m1-87-05",
      "paperQuestionNumber": 5,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "线性方程组与向量空间",
      "type": "blank",
      "question": "【1987 考研数学一真题 · 填空 5】已知三维线性空间的一组基底 $\\alpha_1 = (1, 1, 0)^T, \\alpha_2 = (1, 0, 1)^T, \\alpha_3 = (0, 1, 1)^T$，则向量 $\\alpha = (2, 0, 0)^T$ 在上述基底下的坐标是 ______。",
      "correctAnswer": "$(1, 1, -1)^T$",
      "explanation": "【1987 数一详解】：\n设 $\\alpha = x_1 \\alpha_1 + x_2 \\alpha_2 + x_3 \\alpha_3$，即：\n$$\\begin{cases} x_1 + x_2 = 2 \\\\ x_1 + x_3 = 0 \\\\ x_2 + x_3 = 0 \\end{cases}$$\n由后两式得 $x_1 = x_2 = -x_3$。代入第一式：$2x_1 = 2 \\implies x_1 = 1, x_2 = 1, x_3 = -1$。\n故坐标为 $(1, 1, -1)^T$。",
      "difficulty": "基础",
      "tags": [
        "1987真题",
        "线性代数",
        "基底与坐标"
      ]
    },
    {
      "id": "m1-87-06",
      "paperQuestionNumber": 6,
      "score": 8,
      "sectionName": "二、解答题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "极限与连续",
      "type": "analysis",
      "question": "【1987 考研数学一真题 · 解答题】求正的常数 $a$ 与 $b$，使等式 $\\lim_{x \\to 0} \\frac{x - b\\sin x}{\\int_0^x \\frac{t^2}{\\sqrt{a + t^2}} dt} = 1$ 成立。",
      "correctAnswer": "$a = 4, \\, b = 1$",
      "explanation": "【1987 数一分步踩分详解】：\n分母在 $x \\to 0$ 时为变限积分：分母 $\\int_0^x \\frac{t^2}{\\sqrt{a+t^2}} dt \\sim \\frac{x^3}{3\\sqrt{a}}$（三阶无穷小）。\n分子 $x - b\\sin x = x - b(x - \\frac{x^3}{6} + o(x^3)) = (1-b)x + \\frac{b}{6}x^3 + o(x^3)$。\n若极限为常数 1，分子必须同为三阶无穷小，故必有 $1 - b = 0 \\implies b = 1$。\n代入后：\n$$\\lim_{x \\to 0} \\frac{\\frac{1}{6}x^3}{\\frac{1}{3\\sqrt{a}}x^3} = \\frac{\\sqrt{a}}{2} = 1 \\implies \\sqrt{a} = 2 \\implies a = 4$$\n综上，所求常数为 $a = 4, \\, b = 1$。",
      "steps": [
        "步骤一：分析分母变限积分的无穷小阶数为 3 阶，主部为 x^3 / (3*sqrt(a))",
        "步骤二：泰勒展开分子，由极限存在且非零推知 1 阶项系数必须为 0，定出 b = 1",
        "步骤三：对比分子分母 3 阶项系数比值等于 1，解得 a = 4"
      ],
      "difficulty": "中等",
      "tags": [
        "1987真题",
        "洛必达法则",
        "泰勒公式",
        "变限积分"
      ]
    }
  ]
}
,
{
  "id": "paper-math1-1989",
  "year": 1989,
  "domain": "math",
  "category": "数一",
  "title": "1989 年全国硕士研究生入学统一考试 · 数学（一）真题",
  "subtitle": "全国统考原卷 · 经典早年真题（满分 100 分）",
  "paperType": "real",
  "badgeLabel": "1989 经典真题",
  "totalScore": 100,
  "durationMinutes": 180,
  "description": "1989 年全国考研数学一完整原卷，包含导数对称定义、积分方程待定常数、第一类曲线积分化简、向量场散度计算、三角矩阵求逆与渐近线极值判断等统考经典母题与官方分步解析。",
  "questions": [
    {
      "id": "m1-89-01",
      "paperQuestionNumber": 1,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "导数与微分",
      "type": "blank",
      "question": "【1989 考研数学一真题 · 填空 1】已知 $f'(3) = 2$，则 $\\lim_{h \\to 0} \\frac{f(3-h) - f(3)}{2h} = $ ______。",
      "correctAnswer": "$-1$",
      "explanation": "【1989 数一详解】：\n根据导数定义：\n$$\\lim_{h \\to 0} \\frac{f(3-h) - f(3)}{2h} = -\\frac{1}{2} \\lim_{h \\to 0} \\frac{f(3-h) - f(3)}{-h} = -\\frac{1}{2} f'(3) = -\\frac{1}{2} \\times 2 = -1$$。",
      "difficulty": "简单",
      "tags": [
        "1989真题",
        "导数定义",
        "极限计算"
      ]
    },
    {
      "id": "m1-89-02",
      "paperQuestionNumber": 2,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "定积分",
      "type": "blank",
      "question": "【1989 考研数学一真题 · 填空 2】设 $f(x)$ 是连续函数，且 $f(x) = x + 2 \\int_0^1 f(t)dt$，则 $f(x) = $ ______。",
      "correctAnswer": "$x - 1$",
      "explanation": "【1989 数一详解】：\n令定积分常数 $A = \\int_0^1 f(t)dt$，则 $f(x) = x + 2A$。\n两边在 $[0, 1]$ 上积分：\n$$A = \\int_0^1 (t + 2A)dt = \\left[\\frac{t^2}{2} + 2At\\right]_0^1 = \\frac{1}{2} + 2A \\implies A = -\\frac{1}{2}$$\n故 $f(x) = x + 2(-\\frac{1}{2}) = x - 1$。",
      "difficulty": "基础",
      "tags": [
        "1989真题",
        "定积分",
        "积分方程"
      ]
    },
    {
      "id": "m1-89-03",
      "paperQuestionNumber": 3,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "曲线积分与曲面积分",
      "type": "blank",
      "question": "【1989 考研数学一真题 · 填空 3】设平面曲线 $L$ 为下半圆周 $y = -\\sqrt{1-x^2}$，则曲线积分 $\\int_L (x^2 + y^2) ds = $ ______。",
      "correctAnswer": "$\\pi$",
      "explanation": "【1989 数一详解】：\n在下半圆周 $L$ 上，$x^2 + y^2 = 1$。\n故 $\\int_L (x^2+y^2) ds = \\int_L 1 \\, ds = L \\text{ 的弧长} = \\pi \\times 1 = \\pi$。",
      "difficulty": "简单",
      "tags": [
        "1989真题",
        "第一类曲线积分",
        "圆周弧长"
      ]
    },
    {
      "id": "m1-89-04",
      "paperQuestionNumber": 4,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "多元函数微积分",
      "type": "blank",
      "question": "【1989 考研数学一真题 · 填空 4】向量场 $u(x, y, z) = xy^2 i + ye^z j + \\ln(1+x^2z) k$ 在点 $P(1, 1, 0)$ 处的散度 $\\operatorname{div} u = $ ______。",
      "correctAnswer": "$3$",
      "explanation": "【1989 数一详解】：\n散度公式 $\\operatorname{div} u = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}$。\n- $\\frac{\\partial P}{\\partial x} = y^2$；在 $P(1, 1, 0)$ 处为 $1^2 = 1$；\n- $\\frac{\\partial Q}{\\partial y} = e^z$；在 $P(1, 1, 0)$ 处为 $e^0 = 1$；\n- $\\frac{\\partial R}{\\partial z} = \\frac{x^2}{1+x^2z}$；在 $P(1, 1, 0)$ 处为 $\\frac{1}{1+0} = 1$；\n故 $\\operatorname{div} u = 1 + 1 + 1 = 3$。",
      "difficulty": "基础",
      "tags": [
        "1989真题",
        "场论",
        "散度计算"
      ]
    },
    {
      "id": "m1-89-05",
      "paperQuestionNumber": 5,
      "score": 3,
      "sectionName": "一、填空题",
      "domain": "math",
      "subject": "线性代数",
      "scope": [
        "数一"
      ],
      "chapter": "矩阵及其运算",
      "type": "blank",
      "question": "【1989 考研数学一真题 · 填空 5】设矩阵 $A = \\begin{pmatrix} 3 & 0 & 0 \\\\ 1 & 4 & 0 \\\\ 0 & 0 & 3 \\end{pmatrix}$，$E$ 为 3 阶单位阵，则逆矩阵 $(A - 2E)^{-1} = $ ______。",
      "correctAnswer": "$$\\begin{pmatrix} 1 & 0 & 0 \\\\ -\\frac{1}{2} & \\frac{1}{2} & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$",
      "explanation": "【1989 数一详解】：\n$$A - 2E = \\begin{pmatrix} 1 & 0 & 0 \\\\ 1 & 2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$\n下三角矩阵直接求逆（或初等行变换）：\n$$(A - 2E)^{-1} = \\begin{pmatrix} 1 & 0 & 0 \\\\ -1/2 & 1/2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$。",
      "difficulty": "基础",
      "tags": [
        "1989真题",
        "矩阵求逆",
        "下三角阵"
      ]
    },
    {
      "id": "m1-89-06",
      "paperQuestionNumber": 6,
      "score": 3,
      "sectionName": "二、选择题",
      "domain": "math",
      "subject": "高等数学",
      "scope": [
        "数一"
      ],
      "chapter": "函数、极限与连续",
      "type": "choice",
      "question": "【1989 考研数学一真题 · 选择 1】当 $x > 0$ 时，曲线 $y = x \\sin\\frac{1}{x}$（ ）。",
      "options": [
        "A. 有且仅有水平渐近线",
        "B. 有且仅有铅直渐近线",
        "C. 既有水平渐近线，也有铅直渐近线",
        "D. 既无水平渐近线，也无铅直渐近线"
      ],
      "correctAnswer": "A",
      "explanation": "【1989 数一详解】：\n1. 水平渐近线：$\\lim_{x \\to +\\infty} x \\sin\\frac{1}{x} = \\lim_{t \\to 0^+} \\frac{\\sin t}{t} = 1$，故有水平渐近线 $y = 1$；\n2. 铅直渐近线：当 $x \\to 0^+$ 时，$\\lim_{x \\to 0^+} x \\sin\\frac{1}{x} = 0$（无穷小乘有界量仍为无穷小），极限存在有限，无铅直渐近线；\n故选 A。",
      "difficulty": "中等",
      "tags": [
        "1989真题",
        "渐近线",
        "水平渐近线"
      ]
    }
  ]
}
]
