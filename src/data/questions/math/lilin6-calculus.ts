import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 2026 李林《六套卷》数一 · 高等数学分类题库（72 题）
 */
export const lilin6CalculusQuestions: UnifiedQuestion[] = [
  {
    "id": "math-calc-lilin6-s1-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T1】函数 $f(x) = \\frac{(x^2 - x)|x+1|e^{-\\frac{1}{x}}}{\\int_1^x t^2 \\sin t \\, dt}$ $(x \\in [-\\pi, \\pi])$ 的第一类间断点的个数为（ ）。",
    "correctAnswer": "C",
    "explanation": "确定区间 $[-\\pi, \\pi]$ 内分母为零及无定义的疑似间断点：$x = 0$（指数分母为零）及 $g(x) = \\int_1^x t^2\\sin t \\, dt = 0$ 的零点。\n1. 找分母零点：显然 $x = 1$ 是零点。又被积函数 $t^2\\sin t$ 是奇函数，故 $g(-1) = \\int_1^{-1} t^2\\sin t\\,dt = 0$，即 $x = -1$ 也是零点！在 $(0, \\pi]$ 上 $t^2\\sin t > 0$（仅在 $0, \\pi$ 处取 0），在 $[-\\pi, 0)$ 上 $t^2\\sin t \\le 0$，因此 $g(x)$ 在 $[-1, 1]$ 之外单调变化不再回零，故 $[- \\pi, \\pi]$ 内分母仅有 $x = 1$ 与 $x = -1$ 两个零点。\n2. 逐点判定间断点类型：\n   - **$x = 1$**：分子分母均趋于 $0$，$\\lim_{x\\to 1} \\frac{(x^2-x)|x+1|e^{-1/x}}{g(x)} = \\lim_{x\\to 1} \\frac{x(x-1) \\cdot 2e^{-1}}{(x-1)\\cdot 1^2\\sin 1} = \\frac{2}{e\\sin 1}$ 存在，为第一类**可去间断点**。\n   - **$x = -1$**：当 $x\\to -1^+$ 时 $|x+1|=x+1$；当 $x\\to -1^-$ 时 $|x+1|=-(x+1)$。而 $g'(-1) = (-1)^2\\sin(-1) = -\\sin 1 \\ne 0$，由洛必达法则左、右极限分别为 $\\frac{2e}{\\sin 1}$ 与 $-\\frac{2e}{\\sin 1}$，均存在但不相等，为第一类**跳跃间断点**。\n   - **$x = 0$**：$\\lim_{x\\to 0^-} e^{-1/x} = +\\infty$，而分母 $g(0) = -\\int_0^1 t^2\\sin t\\,dt \\ne 0$，故为第二类**无穷间断点**。\n综上，第一类间断点为 $x=-1$ 和 $x=1$，共 2 个。选 C。",
    "steps": [
      "识别疑点：$x=0$（指数无定义）以及分母 $g(x)=\\int_1^x t^2\\sin t\\,dt=0$ 的零点",
      "利用奇函数对称积分 $\\int_{-1}^1 t^2\\sin t\\,dt = 0$ 及区间保号性，确证 $g(x)=0$ 在 $[-\\pi, \\pi]$ 上仅有 $x=1$ 与 $x=-1$ 两根",
      "在 $x=1$ 处极限存在（可去间断点）；在 $x=-1$ 处 $|x+1|$ 变号导致左右极限均存在但不等（跳跃间断点）",
      "在 $x=0$ 处因 $e^{-1/x}$ 在 $x\\to 0^-$ 时趋于 $+\\infty$ 为无穷间断点（第二类），故第一类共 2 个"
    ],
    "keyPoints": [
      "间断点分类",
      "奇偶函数对称区间积分",
      "含绝对值函数的单侧极限"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "间断点"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 0",
      "B. 1",
      "C. 2",
      "D. 3"
    ]
  },
  {
    "id": "math-calc-lilin6-s1-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "导数与微分",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T2】下列函数在 $x = 0$ 处不可导的是（ ）。",
    "correctAnswer": "D",
    "explanation": "用导数定义及低阶无穷小因子法逐项判断：\n- A 项：当 $x\\to 0$ 时 $\\int_0^x \\sin t^2\\,dt \\sim \\frac{1}{3}x^3$，乘以 $|x|$ 后为 $O(x^4)$，除以 $x$ 极限为 $0$，可导。\n- B 项：$x - \\sin x = \\frac{1}{6}x^3 + o(x^3)$，故 $|\\sin(x-\\sin x)| = \\frac{1}{6}|x|^3 + o(|x|^3)$，在 $x=0$ 处左右导数均为 $0$，可导。\n- C 项：设被积函数 $h(t) = \\sqrt{|t|}\\ln|t|$（$t \\ne 0$），因 $\\lim_{t\\to 0} \\sqrt{|t|}\\ln|t| = 0$，补充定义 $h(0) = 0$ 后 $h(t)$ 在 $x=0$ 处连续，故变上限积分在 $x=0$ 处可导且导数为 $0$。\n- D 项：$\\sqrt{e^{|x|}} = e^{\\frac{1}{2}|x|}$，右导数为 $\\lim_{x\\to 0^+}\\frac{e^{x/2}-1}{x} = \\frac{1}{2}$，左导数为 $\\lim_{x\\to 0^-}\\frac{e^{-x/2}-1}{x} = -\\frac{1}{2}$，左右导数不相等，不可导。选 D。",
    "steps": [
      "A 项 $\\frac{|x|\\int_0^x \\sin t^2 dt}{x} \\to 0$，B 项 $\\frac{|\\sin(x-\\sin x)|}{x} \\sim \\frac{|x|^3}{6x} \\to 0$，均可导",
      "C 项被积函数在 $0$ 处去瑕点后连续，变上限积分可导",
      "D 项 $e^{|x|/2}$ 右导数为 $1/2$，左导数为 $-1/2$，不等故不可导"
    ],
    "keyPoints": [
      "导数定义",
      "变上限积分可导性与补充连续性",
      "绝对值函数可导性判定"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "可导性"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $|x|\\int_0^x \\sin t^2 \\, dt$",
      "B. $|\\sin(x - \\sin x)|$",
      "C. $\\int_{-1}^x \\sqrt{|t|}\\ln|t|\\,dt$",
      "D. $\\sqrt{e^{|x|}}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s1-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T3】设 $f'(u) \\ne 0$，且 $x_0^2 + y_0^2 \\ne 0$，则曲面 $z = f(\\sqrt{x^2 + y^2})$ 上点 $M_0(x_0, y_0, z_0)$ 处的法线与 $z$ 轴的位置关系是（ ）。",
    "correctAnswer": "B",
    "explanation": "令 $r_0 = \\sqrt{x_0^2 + y_0^2} > 0$。曲面法向量为 $\\mathbf{n} = \\left(\\frac{\\partial z}{\\partial x}, \\frac{\\partial z}{\\partial y}, -1\\right)_{M_0} = \\left(f'(r_0)\\frac{x_0}{r_0}, f'(r_0)\\frac{y_0}{r_0}, -1\\right)$。\n1. 与 $z$ 轴方向向量 $\\mathbf{e}_3 = (0, 0, 1)$ 做点积：$\\mathbf{n} \\cdot \\mathbf{e}_3 = -1 \\ne 0$，故法线与 $z$ 轴不垂直（排除 A）。\n2. 由于 $f'(r_0) \\ne 0$ 且 $x_0, y_0$ 不全为零，$\\mathbf{n}$ 与 $\\mathbf{e}_3$ 不共线（排除 C）。\n3. 写出法线参数方程：$x = x_0 + t\\cdot \\frac{f'(r_0)}{r_0}x_0$, $y = y_0 + t\\cdot \\frac{f'(r_0)}{r_0}y_0$, $z = z_0 - t$。取 $t = -\\frac{r_0}{f'(r_0)}$，得 $x = 0, y = 0$，即法线必交 $z$ 轴于点 $(0, 0, z_0 + \\frac{r_0}{f'(r_0)})$。选 B。",
    "steps": [
      "计算偏导得到点 $M_0$ 处的法向量 $\\mathbf{n} = (f'(r_0)\\frac{x_0}{r_0}, f'(r_0)\\frac{y_0}{r_0}, -1)$",
      "检验内积 $\\mathbf{n} \\cdot (0,0,1) = -1 \\ne 0$ 不垂直，且前两分量不全为零不平行",
      "验证法线方程令 $t = -r_0/f'(r_0)$ 时必同时满足 $x=0, y=0$，即与 $z$ 轴相交"
    ],
    "keyPoints": [
      "空间曲面的法线方程",
      "旋转曲面几何性质",
      "空间直线位置关系"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "多元微分几何应用"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 垂直相交",
      "B. 相交但不垂直",
      "C. 平行",
      "D. 异面直线"
    ]
  },
  {
    "id": "math-calc-lilin6-s1-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T4】设 $f(x)$ 有一阶连续导数，且 $\\lim_{x\\to 0}\\frac{f(x)}{x} = 1$，$a_n = f(\\frac{1}{n}), n = 1, 2, \\cdots$，则（ ）。",
    "correctAnswer": "D",
    "explanation": "由 $f'(x)$ 连续及 $\\lim_{x\\to 0}\\frac{f(x)}{x} = 1$，得 $f(0) = 0$ 且 $f'(0) = 1$。由连续函数保号性，存在 $\\delta > 0$ 使 $x \\in (0, \\delta)$ 时 $f'(x) > 0$，即 $f(x)$ 在 $[0, \\delta)$ 上严格单调递增。\n1. 当 $n$ 充分大时 $a_n = f(\\frac{1}{n}) \\sim \\frac{1}{n} > 0$：故 $\\sum a_n$ 发散（排除 A, C），而 $a_n^2 \\sim \\frac{1}{n^2}$ 故 $\\sum a_n^2$ 收敛。\n2. 对交错级数 $\\sum (-1)^{n-1} a_n$：充分大时 $a_n > 0$，$\\lim_{n\\to\\infty} a_n = 0$，且因 $\\frac{1}{n+1} < \\frac{1}{n}$ 及 $f$ 局部单调增得 $a_{n+1} < a_n$。由莱布尼茨准则知该交错级数收敛。选 D。",
    "steps": [
      "由 $f'$ 连续与 $\\lim_{x\\to 0}\\frac{f(x)}{x}=1$ 得 $f(0)=0, f'(0)=1$，保号性确保充分大时 $f(1/n)$ 单调递减趋于 $0$",
      "因 $a_n \\sim 1/n$，故 $\\sum a_n$ 发散、$\\sum a_n^2$ 收敛",
      "由莱布尼茨准则判定 $\\sum (-1)^{n-1}a_n$ 收敛"
    ],
    "keyPoints": [
      "比较审敛法",
      "莱布尼茨准则",
      "一阶导数连续保号性"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "无穷级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛，$\\sum_{n=1}^{\\infty}a_n$ 收敛",
      "B. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 发散，$\\sum_{n=1}^{\\infty}a_n^2$ 收敛",
      "C. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 发散，$\\sum_{n=1}^{\\infty}a_n$ 收敛",
      "D. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛，$\\sum_{n=1}^{\\infty}a_n^2$ 收敛"
    ]
  },
  {
    "id": "math-calc-lilin6-s1-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T11】设 $f(x)$ 是连续函数，且 $\\lim_{x\\to\\infty} f(x) = \\frac{1}{e}$，若正数 $a$ 满足 $\\lim_{x\\to\\infty} \\left(\\cos\\frac{a}{x}\\right)^{x^2} = \\lim_{x\\to\\infty} \\int_x^{x+1} f(t)\\,dt$，则 $a =$ ______。",
    "correctAnswer": "$\\sqrt{2}$",
    "explanation": "1. 左端 $1^\\infty$ 型极限：$\\lim_{x\\to\\infty} (\\cos\\frac{a}{x})^{x^2} = \\exp\\left(\\lim_{x\\to\\infty} x^2 (\\cos\\frac{a}{x} - 1)\\right) = e^{-\\frac{a^2}{2}}$。\n2. 右端利用积分中值定理：$\\int_x^{x+1} f(t)\\,dt = f(\\xi_x)$（$\\xi_x \\in [x, x+1]$），当 $x\\to\\infty$ 时 $\\xi_x\\to\\infty$，极限为 $e^{-1}$。\n3. 由 $e^{-a^2/2} = e^{-1}$ 及 $a > 0$ 得 $a = \\sqrt{2}$。",
    "steps": [
      "求 $1^\\infty$ 型左端极限为 $e^{-a^2/2}$",
      "应用积分中值定理求右端极限为 $e^{-1}$",
      "联立解得 $a = \\sqrt{2}$"
    ],
    "keyPoints": [
      "1的无穷次方极限",
      "积分中值定理"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "极限计算"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T12】设 $L: x^2 + \\frac{y^2}{4} = 1$，取逆时针方向，则 $I = \\oint_L (4x^2 + y^2)(|y|\\,dx + x\\,dy) =$ ______。",
    "correctAnswer": "$8\\pi$",
    "explanation": "沿椭圆 $L$ 有 $4x^2 + y^2 = 4$，代入简化被积函数得 $I = 4\\oint_L |y|\\,dx + 4\\oint_L x\\,dy$。\n参数化 $x=\\cos t, y=2\\sin t$（$0\\le t\\le 2\\pi$），易见 $\\oint_L |y|\\,dx = \\int_0^{2\\pi} 2|\\sin t|(-\\sin t)\\,dt = 0$（前后半周抵消）；\n第二项由格林公式得 $4\\oint_L x\\,dy = 4\\iint_D dxdy = 4 \\cdot \\pi(1)(2) = 8\\pi$。",
    "steps": [
      "利用闭合曲线方程 $4x^2+y^2 = 4$ 化简积分表达式",
      "利用对称性验证 $\\oint_L |y|\\,dx = 0$",
      "利用格林公式求椭圆面积乘 4 得 $8\\pi$"
    ],
    "keyPoints": [
      "对坐标的曲线积分化简技巧",
      "格林公式",
      "椭圆面积"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "曲线积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T13】设函数 $f(x, y)$ 可微，曲面 $z = f(x, y)$ 与坐标面 $xOy$ 的交线为 $\\begin{cases} y = \\int_0^x (e^{-t^2} + \\sin t^2)\\,dt, \\\\ z = 0, \\end{cases}$ 且 $f'_x(0, 0) = 1$，则 $dz|_{(0,0)} =$ ______。",
    "correctAnswer": "$dx - dy$",
    "explanation": "交线满足 $f(x, y(x)) = 0$，且 $x=0$ 时 $y(0)=0$。两边关于 $x$ 在 $x=0$ 求导：$f'_x(0, 0) + f'_y(0, 0) y'(0) = 0$。\n又 $y'(x) = e^{-x^2} + \\sin x^2 \\implies y'(0) = 1$，代入 $f'_x(0,0)=1$ 解得 $f'_y(0,0) = -1$。故 $dz|_{(0,0)} = dx - dy$。",
    "steps": [
      "建立交线恒等式 $f(x,y(x)) = 0$",
      "变上限求导得 $y'(0)=1$，链式法则解得 $f'_y(0,0) = -1$",
      "得出全微分 $dx - dy$"
    ],
    "keyPoints": [
      "多元复合函数求导",
      "全微分计算",
      "变上限积分求导"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "多元微分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T14】设微分方程 $y'' + ay' + y = 0$ 的每一个解 $y(x)$ 在 $[0, +\\infty)$ 上有界，则实数 $a$ 的取值范围为 ______。",
    "correctAnswer": "$[0, +\\infty)$",
    "explanation": "特征方程 $\\lambda^2 + a\\lambda + 1 = 0$：\n- $|a| < 2$ 时共轭复根 $\\lambda = -\\frac{a}{2} \\pm i\\beta$，通解 $e^{-ax/2}(C_1\\cos\\beta x + C_2\\sin\\beta x)$ 有界 $\\iff a \\ge 0$（注意 $a=0$ 时为纯虚根 $\\cos x, \\sin x$ 仍有界）；\n- $a = 2$ 时重根 $\\lambda = -1$，$(C_1+C_2x)e^{-x} \\to 0$ 有界；$a=-2$ 时重根 $\\lambda=1$ 无界；\n- $a > 2$ 时两负实根全有界；$a < -2$ 时两正实根无界。\n综上，$a \\in [0, +\\infty)$。",
    "steps": [
      "写特征方程 $\\lambda^2 + a\\lambda + 1 = 0$",
      "分复根、重根、双实根三种情况判定指数实部 $\\le 0$（零实部无重根）",
      "得 $a \\ge 0$ 即 $[0, +\\infty)$"
    ],
    "keyPoints": [
      "二阶常系数齐次方程通解结构",
      "无穷区间有界性判定"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "微分方程"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T17（10分）】设可微函数 $f(x, y)$ 在点 $P(x, y)$ 处沿 $\\boldsymbol{l}_1 = (1, 1)$ 的方向导数为 $\\sqrt{2}(x - xy^2 + 2y - x^2y)$，沿 $\\boldsymbol{l}_2 = (0, -2)$ 的方向导数为 $2x^2y - 4y$。\n（I）求 $f(x, y)$ 在点 $M(2, 1)$ 处的最大方向导数；\n（II）若 $f(1, 1) = 2$，求 $f(x, y)$ 的极值。",
    "correctAnswer": "（I）最大方向导数为 $4$；（II）在 $(0,0)$ 处取得极小值 $f(0,0)=0$。",
    "explanation": "**（I）求最大方向导数**：\n单位化方向：$\\boldsymbol{l}_1^\\circ = (\\frac{1}{\\sqrt{2}}, \\frac{1}{\\sqrt{2}})$，$\\boldsymbol{l}_2^\\circ = (0, -1)$。\n由可微性得方向导数方程组：$\\frac{1}{\\sqrt{2}}(f'_x + f'_y) = \\sqrt{2}(x - xy^2 + 2y - x^2y)$ 与 $-f'_y = 2x^2y - 4y$。\n解得 $f'_x = 2x - 2xy^2$，$f'_y = 4y - 2x^2y$。\n在 $M(2, 1)$ 处梯度 $\\nabla f(2,1) = (0, -4)$，故最大方向导数为 $|\\nabla f(2,1)| = 4$。\n\n**（II）求函数与极值**：\n偏积分得 $f(x,y) = x^2(1-y^2) + 2y^2 + C$，由 $f(1,1)=2$ 定 $C=0$，即 $f(x,y) = x^2(1-y^2) + 2y^2$。\n解驻点方程组 $\\begin{cases} 2x(1-y^2)=0 \\\\ 2y(2-x^2)=0 \\end{cases}$ 得 5 个驻点：$(0,0), (\\pm\\sqrt{2}, \\pm 1)$。\n求二阶偏导：$A=2(1-y^2), B=-4xy, C'=4-2x^2$。\n- $(0,0)$ 处 $A=2>0, AC'-B^2=8>0$，取**极小值** $f(0,0) = 0$；\n- $(\\pm\\sqrt{2}, \\pm 1)$ 处 $AC'-B^2 = -32 < 0$，均非极值。",
    "steps": [
      "（4分）方向向量单位化，利用方向导数公式解出 $f'_x = 2x - 2xy^2$，$f'_y = 4y - 2x^2y$",
      "（2分）计算点 $M(2,1)$ 处梯度模长得到最大方向导数为 $4$",
      "（2分）偏积分结合初值定原函数 $f(x,y) = x^2(1-y^2) + 2y^2$",
      "（2分）求得全部 5 个驻点并用 $AC-B^2$ 判别法确认仅 $(0,0)$ 为极小值点，极小值为 $0$"
    ],
    "keyPoints": [
      "方向导数与梯度",
      "已知全微分/偏导求原函数",
      "二元无条件极值判定"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "多元微分解答"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T18（12分）】设 $\\Sigma$ 为曲面 $z = 2 - x^2 - y^2$ $(x \\ge 0, y \\ge 0)$ 被柱面 $x^2 + y^2 = 1$ 所截出部分的上侧，计算 $I = \\iint_{\\Sigma} yz\\,dxdy + zx\\,dydz + xy\\,dzdx$。",
    "correctAnswer": "$\\frac{\\pi}{6} + \\frac{3}{5}$",
    "explanation": "注意积分形式为 $P\\,dydz + Q\\,dzdx + R\\,dxdy$（顺序：$P=zx, Q=xy, R=yz$）。\n曲面 $\\Sigma: z = 2 - x^2 - y^2$ 上侧投影到 $D_{xy} = \\{(x,y)\\mid x\\ge 0, y\\ge 0, x^2+y^2\\le 1\\}$，法向微元 $(-z'_x, -z'_y, 1)\\,dxdy = (2x, 2y, 1)\\,dxdy$。\n代入得 $I = \\iint_{D_{xy}} [2x^2(2-x^2-y^2) + 2xy^2 + y(2-x^2-y^2)]\\,dxdy$。\n极坐标下分别积三项：\n- $\\int_0^{\\pi/2}2\\cos^2\\theta\\,d\\theta \\int_0^1 r^3(2-r^2)\\,dr = \\frac{\\pi}{2}(\\frac{1}{2}-\\frac{1}{6}) = \\frac{\\pi}{6}$；\n- $\\int_0^{\\pi/2}2\\cos\\theta\\sin^2\\theta\\,d\\theta \\int_0^1 r^4\\,dr = \\frac{2}{3}\\cdot\\frac{1}{5} = \\frac{2}{15}$；\n- $\\int_0^{\\pi/2}\\sin\\theta\\,d\\theta \\int_0^1 r^2(2-r^2)\\,dr = 1\\cdot(\\frac{2}{3}-\\frac{1}{5}) = \\frac{7}{15}$。\n合计 $I = \\frac{\\pi}{6} + \\frac{3}{5}$。",
    "steps": [
      "（3分）识别分量 $P=zx, Q=xy, R=yz$ 与上侧投影微元 $(2x,2y,1)\\,dxdy$",
      "（3分）将 $z=2-x^2-y^2$ 代入转化到第一象限四分之一圆域二重积分",
      "（4分）极坐标分项计算得 $\\frac{\\pi}{6}, \\frac{2}{15}, \\frac{7}{15}$",
      "（2分）合并得最终结果 $\\frac{\\pi}{6} + \\frac{3}{5}$"
    ],
    "keyPoints": [
      "第二类曲面积分投影转换法",
      "极坐标二重积分"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "曲面积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T19（12分）】设 $f(x)$ 满足 $e^{f(x)}[f'(x) - 1] = x - 1 (x \\ge 0)$，$f(0) = 0$，数列 $\\{a_n\\}$ 满足 $a_1 = 1, a_{n+1} = f(a_n) (n = 1, 2, \\cdots)$。\n（I）证明：$\\lim_{n\\to\\infty} a_n$ 存在，并求其值；\n（II）求 $\\sum_{n=1}^{\\infty} a_n x^n$ 的收敛域及 $\\sum_{n=1}^{\\infty} a_n$ 的和。",
    "correctAnswer": "（I）$\\lim_{n\\to\\infty} a_n = 0$；（II）收敛域为 $(-\\infty, +\\infty)$，$\\sum_{n=1}^\\infty a_n = e - 1$。",
    "explanation": "**（I）解方程定数列极限**：\n令 $y = e^{f(x)}$，则 $y' - y = x - 1$ 且 $y(0) = 1$。解一阶线性方程得 $y = e^x - x$，故 $f(x) = \\ln(e^x - x)$ $(x\\ge 0)$。\n当 $x > 0$ 时 $1 < e^x - x < e^x \\implies 0 < f(x) < x$。归纳知 $0 < a_{n+1} < a_n$，由单调有界准则收敛，取极限得 $e^A = e^A - A \\implies A = 0$。\n\n**（II）幂级数收敛域与级数求和**：\n1. 当 $n\\to\\infty$ 时，$a_{n+1} = \\ln(e^{a_n} - a_n) = \\ln(1 + \\frac{1}{2}a_n^2 + o(a_n^2)) \\sim \\frac{1}{2}a_n^2$。对 $\\forall x \\in \\mathbb{R}$，$\\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}x^{n+1}}{a_n x^n}\\right| = \\lim_{n\\to\\infty}\\frac{1}{2}a_n|x| = 0 < 1$，故收敛域为 $(-\\infty, +\\infty)$。\n2. 由 $e^{a_{n+1}} = e^{a_n} - a_n$ 变形得 $a_n = e^{a_n} - e^{a_{n+1}}$，部分和裂项相消：$S_N = e^{a_1} - e^{a_{N+1}} = e - e^{a_{N+1}} \\to e - 1$（$N\\to\\infty$）。",
    "steps": [
      "（4分）换元 $y = e^{f(x)}$ 解线性微分方程得 $f(x) = \\ln(e^x - x)$",
      "（2分）证 $0<f(x)<x$ $(x>0)$ 并由单调有界准则证明 $\\lim a_n = 0$",
      "（3分）推得 $a_{n+1}\\sim \\frac{1}{2}a_n^2$，比值法求得收敛域 $(-\\infty, +\\infty)$",
      "（3分）发现递推关系 $a_n = e^{a_n} - e^{a_{n+1}}$，裂项求得 $\\sum_{n=1}^\\infty a_n = e - 1$"
    ],
    "keyPoints": [
      "微分方程与数列极限综合",
      "单调有界准则",
      "幂级数收敛域",
      "递推裂项求级数和"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "级数与数列压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s1-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T20（12分）】设 $f(x)$ 在 $(-\\infty, +\\infty)$ 内有二阶连续的导数，且对 $\\forall x, y \\in (-\\infty, +\\infty)$ 满足 $f\\left(\\sqrt{\\frac{x^2+y^2}{2}}\\right) = \\sqrt{f(x)f(y)}$，$f(x)$ 在 $(0, +\\infty)$ 内严格单调递增。证明：\n（I）对 $\\forall x, y \\in (-\\infty, +\\infty)$，有 $f\\left(\\frac{x+y}{2}\\right) \\le \\frac{f(x)+f(y)}{2}$；\n（II）对 $\\forall x \\in (-\\infty, +\\infty)$，有 $f''(x) \\ge 0$；\n（III）$\\int_{-1}^1 f(x)\\,dx \\le f(0) + f(1)$。",
    "correctAnswer": "见标准分步证明（由函数方程导出非负偶性，结合均值不等式、二阶差商极限及凸函数积分放缩）。",
    "explanation": "**（I）**：令 $x=y=t$ 得 $f(|t|) = |f(t)| \\ge 0$；再令 $y=-x$ 得 $f(|x|)=\\sqrt{f(x)f(-x)}$，结合 $(0,+\\infty)$ 严格增推得 $f(x)$ 为非负偶函数且在 $[0,+\\infty)$ 单调增。故 $f(\\frac{x+y}{2}) = f(|\\frac{x+y}{2}|) \\le f(\\sqrt{\\frac{x^2+y^2}{2}}) = \\sqrt{f(x)f(y)} \\le \\frac{f(x)+f(y)}{2}$。\n**（II）**：对 $\\forall x$ 与 $h>0$，取点 $x+h, x-h$ 代入（I）得 $f(x+h)+f(x-h)-2f(x) \\ge 0$。同除以 $h^2$ 取 $h\\to 0$ 极限并由二阶泰勒展开（或洛必达法则）得 $f''(x) = \\lim_{h\\to 0}\\frac{f(x+h)+f(x-h)-2f(x)}{h^2} \\ge 0$。\n**（III）**：因 $f$ 为偶函数，$\\int_{-1}^1 f(x)\\,dx = 2\\int_0^1 f(x)\\,dx$。由 $f''(x) \\ge 0$ 知函数在 $[0,1]$ 上下凸，令 $g(x) = (1-x)f(0) + xf(1) - f(x)$，$g(0)=g(1)=0$ 且 $g''(x) = -f''(x) \\le 0$，易证 $g(x)\\ge 0$ 即 $f(x) \\le (1-x)f(0) + x f(1)$。两边在 $[0,1]$ 上积分乘 $2$ 即证 $\\int_{-1}^1 f(x)\\,dx \\le f(0) + f(1)$。",
    "steps": [
      "（4分）代入特殊点证明 $f(x)\\ge 0$ 且为偶函数，用均值不等式 $\\left|\\frac{x+y}{2}\\right|\\le\\sqrt{\\frac{x^2+y^2}{2}}$ 证得（I）",
      "（4分）取点 $x\\pm h$ 并做二阶差商极限，由保号性证得 $f''(x) \\ge 0$",
      "（4分）利用偶性化归区间至 $[0,1]$，构造弦函数利用下凸性证明积分上界"
    ],
    "keyPoints": [
      "函数方程偶性推导",
      "凸函数等价刻画",
      "二阶差商求导",
      "定积分不等式证明"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第1套",
      "高数",
      "证明压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "导数与微分",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T1】设 $f(x) = \\lim_{n\\to\\infty}\\frac{\\ln(e^n + x^n)}{n}$ $(x > 0)$，则 $F(x) = \\int_1^x f(t)\\,dt$ 在区间 $[1, +\\infty)$ 上（ ）。",
    "correctAnswer": "C",
    "explanation": "用抓大头求极限得 $f(x) = \\begin{cases} 1, & 0 < x \\le e \\\\ \\ln x, & x > e \\end{cases}$。\n1. $f(x)$ 在 $x=e$ 处连续（左右极限均等于 $1$），故变上限积分 $F(x)$ 在 $[1, +\\infty)$ 上处处可导且 $F'(x) = f(x)$。\n2. 检查 $F'(x)$ 在 $x=e$ 处的单侧导数：$f'_-(e) = 0 \\ne f'_+(e) = \\frac{1}{e}$，故 $F(x)$ 二阶不可导。选 C。",
    "steps": [
      "按 $0<x\\le e$ 与 $x>e$ 夹逼求得 $f(x)$ 分段表达式",
      "由 $f$ 连续知 $F(x)$ 一阶可导且 $F'(x)=f(x)$",
      "验算 $x=e$ 处左右导数不等（$0 \\ne 1/e$），得二阶不可导"
    ],
    "keyPoints": [
      "含参极限夹逼定分段函数",
      "变上限积分可导与连续关系",
      "分界点单侧导数"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "变上限积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 不连续",
      "B. 连续但不可导",
      "C. 可导但二阶不可导",
      "D. 二阶可导"
    ]
  },
  {
    "id": "math-calc-lilin6-s2-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T2】设积分 $I = \\int_0^{\\frac{\\pi}{2}} \\frac{dx}{\\sin^p x \\cos^q x}$ $(p > 0, q > 0)$ 收敛，则（ ）。",
    "correctAnswer": "B",
    "explanation": "积分区间两端 $x=0$ 与 $x=\\frac{\\pi}{2}$ 均为瑕点（因 $p,q>0$）：\n- 在 $x\\to 0^+$ 附近被积函数 $\\sim x^{-p}$，收敛 $\\iff p < 1$；\n- 在 $x\\to \\frac{\\pi}{2}^-$ 附近令 $t = \\frac{\\pi}{2}-x \\to 0^+$，被积函数 $\\sim t^{-q}$，收敛 $\\iff q < 1$。\n故收敛充要条件为 $p < 1$ 且 $q < 1$。选 B。",
    "steps": [
      "拆分为 $[0,\\pi/4]$ 与 $[\\pi/4,\\pi/2]$ 两段处理双瑕点",
      "分别比较 $x^{-p}$ 与 $(\\pi/2-x)^{-q}$ 的敛散性得 $p<1$ 且 $q<1$"
    ],
    "keyPoints": [
      "反常积分瑕点识别",
      "p-积分收敛判定法"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "反常积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $p > 1$ 且 $q > 1$",
      "B. $p < 1$ 且 $q < 1$",
      "C. $p > 1$ 且 $q < 1$",
      "D. $p < 1$ 且 $q > 1$"
    ]
  },
  {
    "id": "math-calc-lilin6-s2-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T3】设 $f(x)$ 是定义在 $\\mathbf{R}$ 上的偶函数，且 $f(x) + f'(x) = 2e^x$，若 $a[f(x) - e^x] \\le x$ 在 $\\mathbf{R}$ 上恒成立，则 $a$ 的取值范围为（ ）。",
    "correctAnswer": "B",
    "explanation": "解一阶线性微分方程：$[e^x f(x)]' = 2e^{2x} \\implies f(x) = e^x + C e^{-x}$。\n由 $f(x)$ 为偶函数得 $C = 1$，即 $f(x) = e^x + e^{-x}$。\n不等式化为 $a e^{-x} \\le x \\iff a \\le x e^x$ 恒成立。令 $g(x) = x e^x$，求导得最小值为 $g(-1) = -\\frac{1}{e}$。故 $a \\le -\\frac{1}{e}$。选 B。",
    "steps": [
      "乘积分因子 $e^x$ 解得通解 $f(x) = e^x + Ce^{-x}$",
      "利用偶性定常数 $C=1$，不等式化为 $a \\le x e^x$",
      "求 $x e^x$ 全局最小值为 $-1/e$"
    ],
    "keyPoints": [
      "一阶线性微分方程",
      "偶函数性质定通解常数",
      "不等式恒成立求最值"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "微分方程"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $(-\\infty, 0]$",
      "B. $(-\\infty, -\\frac{1}{e}]$",
      "C. $(-\\infty, -1)$",
      "D. $(-\\infty, -e]$"
    ]
  },
  {
    "id": "math-calc-lilin6-s2-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T4】设级数 $\\sum_{n=2}^{\\infty}\\frac{1}{n(\\ln n)^p}$ 发散，且 $\\sum_{n=1}^{\\infty}(-1)^{n-1}\\left(\\frac{1}{n^p} - \\arctan\\frac{1}{n^p}\\right)$ 条件收敛，其中 $p > 0$，则 $p$ 的取值范围为（ ）。",
    "correctAnswer": "B",
    "explanation": "1. 由积分审敛法，$\\sum_{n=2}^\\infty \\frac{1}{n(\\ln n)^p}$ 发散 $\\iff p \\le 1$。\n2. 对交错级数通项 $u_n = \\frac{1}{n^p} - \\arctan\\frac{1}{n^p}$，因 $t - \\arctan t$ 在 $t>0$ 时严格单调递增，故对任意 $p>0$，$u_n$ 单调递减趋于 $0$，交错级数恒收敛。\n3. 又泰勒展开 $u_n \\sim \\frac{1}{3 n^{3p}}$，要条件收敛则绝对级数发散，即 $3p \\le 1 \\implies p \\le \\frac{1}{3}$。\n综上 $0 < p \\le \\frac{1}{3}$。选 B。",
    "steps": [
      "积分审敛法得前式发散 $\\iff p \\le 1$",
      "证明交错项正且单调趋于 $0$，由莱布尼茨准则知 $p>0$ 时恒收敛",
      "由 $u_n \\sim \\frac{1}{3n^{3p}}$ 令绝对级数发散得 $3p \\le 1$"
    ],
    "keyPoints": [
      "积分审敛法",
      "泰勒展开判敛散",
      "条件收敛充要条件"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "无穷级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $0 < p < 1$",
      "B. $0 < p \\le \\frac{1}{3}$",
      "C. $\\frac{1}{3} \\le p < 1$",
      "D. $\\frac{1}{3} < p \\le 1$"
    ]
  },
  {
    "id": "math-calc-lilin6-s2-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T11】设 $f(x)$ 有二阶连续导数，当 $x \\to 0$ 时，$2\\sin x + x f(x)$ 是比 $x^3$ 高阶的无穷小，则曲线 $y = f(x)$ 在点 $(0, -2)$ 处的曲率圆方程为 ______。",
    "correctAnswer": "$x^2 + \\left(y + \\frac{1}{2}\\right)^2 = \\frac{9}{4}$",
    "explanation": "泰勒展开 $2(x - \\frac{1}{6}x^3) + x(f(0) + f'(0)x + \\frac{f''(0)}{2}x^2) + o(x^3) = o(x^3)$，令 $x, x^2, x^3$ 系数全零解得 $f(0)=-2, f'(0)=0, f''(0)=\\frac{2}{3}$。\n曲率半径 $R = \\frac{1}{|2/3|} = \\frac{3}{2}$，且因 $f'(0)=0, f''(0)>0$ 曲线向上凹，曲率圆心在 $(0, -2 + \\frac{3}{2}) = (0, -\\frac{1}{2})$，故方程为 $x^2 + (y + \\frac{1}{2})^2 = \\frac{9}{4}$。",
    "steps": [
      "展开至 $x^3$ 阶令各幂次系数为零得 $f'(0)=0, f''(0)=2/3$",
      "算出曲率半径 $R=3/2$ 与向上凹圆心 $(0,-1/2)$"
    ],
    "keyPoints": [
      "泰勒公式与高阶无穷小",
      "曲率半径与曲率圆方程"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "曲率圆"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T12】曲线 $r = \\frac{1}{1+\\cos\\theta}$ 在 $\\theta \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ 上的全长为 ______。",
    "correctAnswer": "$\\sqrt{2} + \\ln(\\sqrt{2} + 1)$",
    "explanation": "$ds = \\sqrt{r^2 + r'^2}\\,d\\theta = \\frac{\\sqrt{2}}{(1+\\cos\\theta)^{3/2}}\\,d\\theta = \\frac{1}{2}\\sec^3\\frac{\\theta}{2}\\,d\\theta$（因 $\\cos\\frac{\\theta}{2} > 0$）。\n利用对称性与换元 $u=\\frac{\\theta}{2}$：$L = 2\\int_0^{\\pi/4}\\sec^3 u\\,du = [\\sec u\\tan u + \\ln|\\sec u + \\tan u|]_0^{\\pi/4} = \\sqrt{2} + \\ln(\\sqrt{2}+1)$。",
    "steps": [
      "倍半角公式化简极坐标弧长微元为 $\\frac{1}{2}\\sec^3\\frac{\\theta}{2}\\,d\\theta$",
      "对称化与分部积分求 $\\int \\sec^3 u\\,du$ 得 $\\sqrt{2}+\\ln(\\sqrt{2}+1)$"
    ],
    "keyPoints": [
      "极坐标弧长计算",
      "sec^3 x 积分递推公式"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "定积分几何应用"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T13】设 $f(x, y) = \\int_{x^2+y^2}^{\\frac{y}{x}} e^{-t^2}\\,dt$，则 $x\\frac{\\partial f}{\\partial x} + y\\frac{\\partial f}{\\partial y}$ 的极小值为 ______。",
    "correctAnswer": "$-\\sqrt{2}e^{-\\frac{1}{2}}$",
    "explanation": "利用变限积分求偏导或齐次函数欧拉定理：上限 $y/x$ 为 0 次齐次，下限 $v = x^2+y^2$ 为 2 次齐次，故 $x\\frac{\\partial f}{\\partial x} + y\\frac{\\partial f}{\\partial y} = -2(x^2+y^2)e^{-(x^2+y^2)^2} = -2v e^{-v^2}$ $(v > 0)$。\n令 $g(v) = -2ve^{-v^2}$，求导 $g'(v) = -2e^{-v^2}(1-2v^2) = 0 \\implies v = \\frac{1}{\\sqrt{2}}$ 时取得唯一极小值 $-\\sqrt{2}e^{-\\frac{1}{2}}$。",
    "steps": [
      "偏导数组合化简为 $-2v e^{-v^2}$ $(v=x^2+y^2>0)$",
      "一元求导在 $v=1/\\sqrt{2}$ 处取得极小值 $-\\sqrt{2}e^{-1/2}$"
    ],
    "keyPoints": [
      "复合变限积分偏导数",
      "一元化简求极值"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "多元微分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T14】设 $\\Sigma: (x - a)^2 + (y - a)^2 + (z - a)^2 = 2a^2$ $(a > 0)$，则 $I = \\oiint_{\\Sigma} (x + y + z - \\sqrt{3}a)\\,dS =$ ______。",
    "correctAnswer": "$8(3 - \\sqrt{3})\\pi a^3$",
    "explanation": "球面中心为 $(a,a,a)$，半径 $R=\\sqrt{2}a$。将被积函数写成 $(x-a)+(y-a)+(z-a)+(3-\\sqrt{3})a$，利用球面对称性前三项积分全零，故 $I = (3-\\sqrt{3})a \\cdot 4\\pi(2a^2) = 8(3-\\sqrt{3})\\pi a^3$。",
    "steps": [
      "利用球心 $(a,a,a)$ 的奇对称性消去 $(x-a)+(y-a)+(z-a)$",
      "剩余常数乘球面积 $8\\pi a^2$ 得 $8(3-\\sqrt{3})\\pi a^3$"
    ],
    "keyPoints": [
      "第一类曲面积分",
      "球面对称性技巧"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "曲面积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T17（10分）】设 $a (a > -1)$ 为非零常数，$\\lim_{x\\to+\\infty} \\frac{\\int_1^x \\left[(t+a)^{1+\\frac{1}{t}} - t^{1+\\frac{1}{t+a}}\\right]\\,dt}{x} = 1$，求 $a$ 的值。",
    "correctAnswer": "$a = 1$",
    "explanation": "记 $h(t) = (t+a)^{1+\\frac{1}{t}} - t^{1+\\frac{1}{t+a}}$。当 $t \\to +\\infty$ 时做幂指化一阶展开：\n- $(t+a)^{1+1/t} = (t+a)e^{\\frac{\\ln(t+a)}{t}} = (t+a)\\left(1 + \\frac{\\ln(t+a)}{t} + O\\left(\\frac{\\ln^2 t}{t^2}\\right)\\right) = t + a + \\ln(t+a) + o(1)$；\n- $t^{1+1/(t+a)} = t e^{\\frac{\\ln t}{t+a}} = t + \\frac{t\\ln t}{t+a} + o(1) = t + \\ln t + o(1)$。\n相减得 $\\lim_{t\\to+\\infty} h(t) = \\lim_{t\\to+\\infty}\\left[a + \\ln\\left(1+\\frac{a}{t}\\right) + o(1)\\right] = a$。\n由于被积函数有极限 $a$（非零），积分发散至 $\\infty$（或设 $h(t) = a + \\alpha(t)$ 用分段 $\\varepsilon$ 放缩），由洛必达法则或积分均值极限性质得原式极限 $= a$，故 $a = 1$。",
    "steps": [
      "（4分）幂指改写并泰勒一阶展开求出两幂指项在 $+\\infty$ 处的渐近结构",
      "（2分）精确消去 $t$ 与 $\\ln t$ 主部证明 $\\lim_{t\\to+\\infty} h(t) = a$",
      "（3分）利用 $\\frac{\\infty}{\\infty}$ 洛必达法则（或 $\\varepsilon$-$N$ 放缩）得出分式极限为 $a$",
      "（1分）由题意得 $a = 1$"
    ],
    "keyPoints": [
      "幂指函数无穷远处渐近展开",
      "积分与极限结合 / 洛必达法则适用严谨性"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "极限解答"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T18（12分）】设 $f(x, y)$ 有二阶连续偏导数，且满足 $df(x, y) = a x y^2\\,dx + \\left(10x^2 y + \\frac{2}{5}ay^3\\right)\\,dy$，$f(1, 1) = 6$。\n（I）求 $f(x, y)$；\n（II）曲线 $f(x, y) = 1$ 上任一点 $(x, y)$ 到原点的距离为 $d$，求 $d$ 的最小值。",
    "correctAnswer": "（I）$f(x, y) = 5x^2y^2 + y^4$；（II）$d_{\\min} = \\frac{2\\sqrt{5}}{5}$。",
    "explanation": "**（I）**：由二阶连续偏导知混合偏导相等：$\\frac{\\partial}{\\partial y}(axy^2) = \\frac{\\partial}{\\partial x}(10x^2y + \\frac{2}{5}ay^3) \\implies 2axy = 20xy \\implies a = 10$。\n凑全微分（或偏积分）得 $f(x,y) = 5x^2y^2 + y^4 + C$，代入 $f(1,1)=6$ 得 $C=0$，故 $f(x,y) = 5x^2y^2 + y^4$。\n\n**（II）**：曲线 $5x^2y^2 + y^4 = 1$ 上 $y \\ne 0$，$x^2 = \\frac{1 - y^4}{5y^2}$。距离平方 $d^2 = x^2 + y^2 = \\frac{1}{5y^2} + \\frac{4}{5}y^2 \\ge 2\\sqrt{\\frac{4}{25}} = \\frac{4}{5}$，在 $y^2 = \\frac{1}{2}, x^2 = \\frac{3}{10}$ 处取等。故 $d_{\\min} = \\frac{2\\sqrt{5}}{5}$。",
    "steps": [
      "（4分）利用混合偏导相等求得 $a=10$",
      "（2分）偏积分并代初值定 $f(x,y) = 5x^2y^2 + y^4$",
      "（4分）消元将距离平方化为关于 $y^2$ 的函数 $\\frac{1}{5y^2} + \\frac{4}{5}y^2$",
      "（2分）均值不等式（或拉格朗日乘数法）确定最小值 $\\frac{2\\sqrt{5}}{5}$"
    ],
    "keyPoints": [
      "全微分方程",
      "条件最值 / 拉格朗日乘数法与基本不等式"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "多元微分解答"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T19（12分）】设平面力 $\\boldsymbol{F}(x, y) = (P(x, y), Q(x, y))$，其中 $P(x, y) = f(x) + y[e^{-x} - f'(x)]$，$Q(x, y) = f'(x)$，$f(x)$ 有二阶连续导数，且 $f'(0) = 0$。\n（I）若力 $\\boldsymbol{F}$ 对运动质点做的功与质点运动路径无关，求 $f(x)$；\n（II）若 $L$ 是从点 $A(-1, 1)$ 到点 $B(1, 0)$ 的光滑有向曲线，且 $\\int_L P(x, y)\\,dx + Q(x, y)\\,dy = \\frac{4}{e}$，求 $f(x)$ 的极值。",
    "correctAnswer": "（I）$f(x) = C_1 - (x + 1)e^{-x}$；（II）在 $x = 0$ 处取极小值 $f(0) = \\frac{1}{2e} - 1$。",
    "explanation": "**（I）**：由 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$ 得 $e^{-x} - f'(x) = f''(x)$，即 $f'' + f' = e^{-x}$。乘 $e^x$ 积分得 $f'(x) = (x+C_2)e^{-x}$，由 $f'(0)=0$ 得 $C_2=0$，再积分得 $f(x) = C_1 - (x+1)e^{-x}$。\n\n**（II）**：求得势函数 $U(x,y) = C_1 x + (xy + x + 2)e^{-x}$。则 $U(1,0) - U(-1,1) = (C_1 + 3e^{-1}) - (-C_1 + 0) = 2C_1 + \\frac{3}{e} = \\frac{4}{e} \\implies C_1 = \\frac{1}{2e}$。\n因 $f'(x) = x e^{-x}$，在 $x=0$ 左侧导数负、右侧导数正，故 $f(x)$ 在 $x=0$ 处取极小值 $\\frac{1}{2e} - 1$。",
    "steps": [
      "（4分）利用路径无关条件 $\\frac{\\partial P}{\\partial y} = \\frac{\\partial Q}{\\partial x}$ 导出微分方程 $f''+f'=e^{-x}$",
      "（2分）求解通解得 $f(x) = C_1 - (x+1)e^{-x}$",
      "（4分）计算势函数差得 $2C_1 + 3e^{-1} = 4e^{-1}$，解得 $C_1 = \\frac{1}{2e}$",
      "（2分）由一阶导数变号求出唯一极小值 $\\frac{1}{2e} - 1$"
    ],
    "keyPoints": [
      "平面曲线积分与路径无关",
      "二阶线性微分方程降阶法",
      "势函数求解"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "曲线积分与微分方程"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s2-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T20（12分）】设 $f(x)$ 在 $[0, 1]$ 上二阶可导，且 $f''(x) > 0$。\n（I）证明：对于区间 $(0, 1)$ 内的任意不同的两点 $x_1, x_2$，有 $f[\\lambda x_1 + (1-\\lambda)x_2] < \\lambda f(x_1) + (1-\\lambda)f(x_2)$ $(0 < \\lambda < 1)$；\n（II）若 $\\int_0^1 f(x)\\,dx = 0$，证明：对任意 $x \\in [0, 1]$，有 $|f(x)| \\le \\max\\{f(0), f(1)\\}$。",
    "correctAnswer": "见标准分步证明（利用拉格朗日中值定理证严格凸性，再用分段弦线面积放缩与积分归零证明双侧有界）。",
    "explanation": "**（I）**：设 $x_1 < x_2$，记 $x_0 = \\lambda x_1 + (1-\\lambda)x_2 \\in (x_1, x_2)$。分别在 $[x_1,x_0]$ 与 $[x_0,x_2]$ 上用拉格朗日中值定理得 $\\frac{f(x_0)-f(x_1)}{(1-\\lambda)(x_2-x_1)} = f'(\\xi_1) < f'(\\xi_2) = \\frac{f(x_2)-f(x_0)}{\\lambda(x_2-x_1)}$（因 $f''>0 \\implies f'$ 严格递增），整理即证。\n\n**（II）**：记 $M = \\max\\{f(0), f(1)\\}$。由 $f$ 严格下凸，$x \\in (0,1)$ 时 $f(x) < (1-x)f(0)+xf(1) \\le M$，积分得 $0 < M$ 且 $f(x) \\le M$ 处处成立。\n再设 $f$ 在 $c \\in (0,1)$ 处取最小值 $m = f(c) < 0$。将 $[0,1]$ 拆为 $[0,c]$ 和 $[c,1]$ 两段分别用凸函数弦上界放缩积分：$0 = \\int_0^1 f(x)\\,dx < \\frac{c}{2}(f(0)+m) + \\frac{1-c}{2}(m+f(1)) = \\frac{1}{2}(c f(0)+(1-c)f(1)+m)$，故 $m > -[c f(0)+(1-c)f(1)] \\ge -M$。因此 $|f(x)| \\le M$。",
    "steps": [
      "（5分）记中间点 $x_0$，在左右子区间用拉格朗日中值定理结合 $f''>0$ 证得严格凸性",
      "（2分）由全局弦线放缩积分得出 $M>0$ 且上界 $f(x)\\le M$",
      "（5分）在最小值点 $c$ 处分段作弦线面积控制并积分，证得 $m > -M$ 从而 $|f(x)|\\le M$"
    ],
    "keyPoints": [
      "凸函数定义证明",
      "拉格朗日中值定理",
      "定积分几何放缩技巧"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第2套",
      "高数",
      "证明压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T1】曲线 $y = \\frac{1}{|x|-1} + \\ln(1 + e^{-x})$ 的渐近线的条数为（ ）。",
    "correctAnswer": "D",
    "explanation": "依次考察铅直、水平和斜渐近线：\n1. **铅直渐近线**：分母 $|x|-1 = 0 \\implies x = 1$ 与 $x = -1$。显然 $\\lim_{x\\to 1} y = \\infty$ 且 $\\lim_{x\\to -1} y = \\infty$，故有 **2 条**铅直渐近线 $x = 1, x = -1$。\n2. **$x \\to +\\infty$ 方向**：$\\lim_{x\\to+\\infty}\\left[\\frac{1}{x-1}+\\ln(1+e^{-x})\\right] = 0 + 0 = 0$，得 **1 条**水平渐近线 $y = 0$。\n3. **$x \\to -\\infty$ 方向**：$\\ln(1+e^{-x}) = \\ln[e^{-x}(e^x+1)] = -x + \\ln(1+e^x)$。显然 $k = \\lim_{x\\to-\\infty}\\frac{y}{x} = -1$，且 $\\lim_{x\\to-\\infty}(y + x) = \\lim_{x\\to-\\infty}\\left[\\frac{1}{-x-1}+\\ln(1+e^x)\\right] = 0$，得 **1 条**斜渐近线 $y = -x$。\n总计 $2 + 1 + 1 = 4$ 条。选 D。",
    "steps": [
      "由分母为零得出 $x=1$ 和 $x=-1$ 两条铅直渐近线",
      "求 $x\\to+\\infty$ 极限得右水平渐近线 $y=0$",
      "求 $x\\to-\\infty$ 斜率 $k=-1$ 与截距 $b=0$，得左斜渐近线 $y=-x$，合计 4 条"
    ],
    "keyPoints": [
      "铅直渐近线",
      "水平与斜渐近线",
      "分方向趋于无穷极限"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "渐近线"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 1",
      "B. 2",
      "C. 3",
      "D. 4"
    ]
  },
  {
    "id": "math-calc-lilin6-s3-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T2】设 $f(x) = (x - a)\\ln x - x$ 有两个极值点，则实数 $a$ 的取值范围为（ ）。",
    "correctAnswer": "D",
    "explanation": "定义域为 $x > 0$。求导：$f'(x) = \\ln x + \\frac{x-a}{x} - 1 = \\ln x - \\frac{a}{x} = \\frac{x\\ln x - a}{x}$。\n极值点要求 $f'(x)$ 在 $(0,+\\infty)$ 有两个变号零点，等价于方程 $x\\ln x = a$ 有两个不同根（切点不变号不计）。\n设 $g(x) = x\\ln x$ $(x > 0)$，则 $g'(x) = \\ln x + 1$。当 $0 < x < \\frac{1}{e}$ 时 $g'(x) < 0$；当 $x > \\frac{1}{e}$ 时 $g'(x) > 0$。\n又 $\\lim_{x\\to 0^+} x\\ln x = 0$，$g(\\frac{1}{e}) = -\\frac{1}{e}$，$g(1) = 0$，当 $x\\to+\\infty$ 时 $g(x)\\to +\\infty$。\n画出 $g(x)$ 单峰谷图像易见：当且仅当 $-\\frac{1}{e} < a < 0$ 时，$y = a$ 与 $y = g(x)$ 有两个相交穿过点（即变号极值点）。选 D。",
    "steps": [
      "求导分离参数将 $f'(x)=0$ 转化为 $x\\ln x = a$ 在 $(0,+\\infty)$ 上有两个变号根",
      "求 $g(x)=x\\ln x$ 的极小值 $g(1/e)=-1/e$ 及端点极限 $g(0^+)=0, g(+\\infty)=+\\infty$",
      "结合图像确定两交点范围为 $-\\frac{1}{e} < a < 0$"
    ],
    "keyPoints": [
      "极值点个数",
      "参数分离与函数单调性画图"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "导数应用"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $[-\\frac{1}{e}, +\\infty)$",
      "B. $(-\\frac{1}{e}, +\\infty)$",
      "C. $[-\\frac{1}{e}, 0)$",
      "D. $(-\\frac{1}{e}, 0)$"
    ]
  },
  {
    "id": "math-calc-lilin6-s3-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T3】下列函数在点 $P_0(0, 0)$ 处不可微，且 $f'_x(x, y)$ 在点 $P_0$ 的邻域内有界的是（ ）。",
    "correctAnswer": "D",
    "explanation": "逐项判别可微性与偏导数有界性：\n- A 项：沿坐标轴 $f(x,0)=f(0,y)=0$，故 $f'_x(0,0)=f'_y(0,0)=0$，但 $\\lim_{x\\to 0}\\frac{f(x,x)}{\\sqrt{2x^2}} = \\frac{1}{\\sqrt{2}} \\ne 0$（不可微）；且当 $x, y > 0$ 时 $f'_x = \\frac{\\sqrt{y}}{2\\sqrt{x}}$，令 $x \\to 0^+$ 时无界，排除。\n- B 项：$f'_x(0,0)=f'_y(0,0)=0$，且 $\\frac{|xy|}{\\sqrt{x^2+y^2}} \\le \\frac{1}{2}\\sqrt{x^2+y^2} \\to 0$，故在 $(0,0)$ 处**可微**，排除。\n- C 项：沿 $x>0, y>0$ 时 $f'_x = \\frac{1}{3}x^{-2/3}y^{1/3}$ 无界，排除。\n- D 项：$f'_x(0,0)=f'_y(0,0)=0$，沿 $y=x$ 趋于原点 $\\frac{x^2}{\\sqrt{2}|x|\\sqrt{2x^2}} = \\frac{1}{2} \\ne 0$，故**不可微**；且在去心邻域内 $f'_x(x, y) = \\frac{y(x^2+y^2)-x^2y}{(x^2+y^2)^{3/2}} = \\frac{y^3}{(x^2+y^2)^{3/2}}$，显然 $|f'_x(x,y)| \\le 1$ 严格**有界**！选 D。",
    "steps": [
      "检验可微性定义排除可微项 B（$|xy|/r \\le r/2 \\to 0$）",
      "求偏导表达式排除邻域偏导数无界项 A 和 C",
      "验证 D 项沿 $y=x$ 不可微且 $|f'_x| = \\frac{|y|^3}{r^3} \\le 1$ 有界"
    ],
    "keyPoints": [
      "多元函数可微性定义",
      "偏导数有界性与可微充分条件辨析"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "多元微分概念"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $f(x, y) = \\sqrt{|xy|}$",
      "B. $f(x, y) = |xy|$",
      "C. $f(x, y) = \\sqrt[3]{xy}$",
      "D. $f(x, y) = \\begin{cases} \\frac{xy}{\\sqrt{x^2+y^2}}, & x^2+y^2 \\ne 0, \\\\ 0, & x^2+y^2 = 0 \\end{cases}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s3-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T4】设 $y = x\\sin x$ 在 $[0, n\\pi]$ 上与 $x$ 轴所围图形的面积为 $a_n$ $(n = 1, 2, \\cdots)$，则 $\\sum_{k=1}^{\\infty}\\frac{1}{\\sqrt{a_k a_{k+1}}} =$（ ）。",
    "correctAnswer": "B",
    "explanation": "先算面积通项 $a_n = \\int_0^{n\\pi} |x\\sin x|\\,dx = \\sum_{j=0}^{n-1} \\int_{j\\pi}^{(j+1)\\pi} x|\\sin x|\\,dx$。\n第 $j+1$ 段令 $x = j\\pi + t$ $(0 \\le t \\le \\pi)$：\n$\\int_0^\\pi (j\\pi + t)\\sin t\\,dt = 2j\\pi + \\pi = (2j+1)\\pi$。\n求和得 $a_n = \\pi \\sum_{j=0}^{n-1}(2j+1) = n^2 \\pi$！\n代入正项级数裂项相消：\n$\\sum_{k=1}^\\infty \\frac{1}{\\sqrt{k^2\\pi \\cdot (k+1)^2\\pi}} = \\frac{1}{\\pi}\\sum_{k=1}^\\infty \\frac{1}{k(k+1)} = \\frac{1}{\\pi}\\sum_{k=1}^\\infty\\left(\\frac{1}{k} - \\frac{1}{k+1}\\right) = \\frac{1}{\\pi}$。选 B。",
    "steps": [
      "按半周期划分绝对值积分求出第 $j+1$ 拱面积 $(2j+1)\\pi$",
      "累加前 $n$ 个奇数和得出 $a_n = n^2 \\pi$",
      "代入裂项相消 $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$ 求和得 $\\frac{1}{\\pi}$"
    ],
    "keyPoints": [
      "定积分求面积",
      "数列求通项",
      "裂项相消求级数和"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "级数求和"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $\\frac{1}{\\sqrt{\\pi}}$",
      "B. $\\frac{1}{\\pi}$",
      "C. $\\pi$",
      "D. $\\sqrt{\\pi}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s3-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "导数与微分",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T11】设 $f(x) = (x^2 - 4x + 3)^n$，则 $f^{(n)}(1) =$ ______。",
    "correctAnswer": "$(-2)^n n!$",
    "explanation": "因式分解 $f(x) = (x-1)^n (x-3)^n$。\n设 $u(x) = (x-1)^n, v(x) = (x-3)^n$。由莱布尼茨高阶求导公式 $f^{(n)}(x) = \\sum_{k=0}^n C_n^k u^{(k)}(x) v^{(n-k)}(x)$。\n在 $x = 1$ 处，$u^{(k)}(1) = 0$ 对一切 $k < n$ 均成立！故仅当 $k = n$ 时非零：\n$f^{(n)}(1) = C_n^n u^{(n)}(1) v(1) = n! \\cdot (1 - 3)^n = (-2)^n n!$。",
    "steps": [
      "分解因式 $f(x) = (x-1)^n (x-3)^n$",
      "运用莱布尼茨公式或泰勒在 $x=1$ 处展开提取 $(x-1)^n$ 项系数，得 $(-2)^n n!$"
    ],
    "keyPoints": [
      "莱布尼茨高阶求导公式",
      "泰勒系数提取法"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "高阶导数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T12】设 $\\int_1^{+\\infty} \\frac{dx}{x(a+x^3)} = \\frac{1}{3}\\ln 2$ $(a > 0)$，则 $a =$ ______。",
    "correctAnswer": "$1$",
    "explanation": "令 $u = x^3$（或直接裂项：$\\frac{1}{x(a+x^3)} = \\frac{1}{a}\\left(\\frac{1}{x} - \\frac{x^2}{a+x^3}\\right)$）：\n$\\int \\frac{dx}{x(a+x^3)} = \\frac{1}{a}\\left(\\ln x - \\frac{1}{3}\\ln(a+x^3)\\right) = \\frac{1}{3a}\\ln\\frac{x^3}{a+x^3}$。\n代入上下限 $1$ 与 $+\\infty$：$\\frac{1}{3a}\\left[0 - \\ln\\frac{1}{a+1}\\right] = \\frac{1}{3a}\\ln(a+1)$。\n由 $\\frac{1}{3a}\\ln(a+1) = \\frac{1}{3}\\ln 2$，得 $\\frac{\\ln(a+1)}{a} = \\ln 2$。显然 $a=1$ 是一个解；令 $\\varphi(a) = \\ln(a+1) - a\\ln 2$，因 $\\varphi''(a) < 0$ 上凸且 $\\varphi(0)=0, \\varphi(1)=0$，故在 $a > 0$ 内仅有唯一正解 $a = 1$。",
    "steps": [
      "用有理分式拆分求出原函数 $\\frac{1}{3a}\\ln\\frac{x^3}{a+x^3}$",
      "代入无穷反常积分上下限得 $\\frac{1}{3a}\\ln(a+1) = \\frac{1}{3}\\ln 2$",
      "利用单调性/凹凸性唯一性得出 $a = 1$"
    ],
    "keyPoints": [
      "反常积分计算",
      "有理函数裂项技巧"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "反常积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T13】设 $f(x)$ 是以 $2$ 为周期的偶函数，$f(x) = \\begin{cases} x, & 0 \\le x \\le \\frac{1}{2}, \\\\ 2 - 2x, & \\frac{1}{2} < x \\le 1. \\end{cases}$ $S(x)$ 是 $f(x)$ 的傅里叶级数的和函数，且 $S(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} a_n \\cos n\\pi x$ $(-\\infty < x < +\\infty)$，当 $x \\in \\left[-3, -\\frac{5}{2}\\right]$ 时，$S(x) =$ ______。",
    "correctAnswer": "$\\begin{cases} 2x + 6, & -3 \\le x < -\\frac{5}{2} \\\\ \\frac{3}{4}, & x = -\\frac{5}{2} \\end{cases}$",
    "explanation": "由狄利克雷收敛定理及周期性（$T=2$）和偶性展开分析区间 $[-3, -\\frac{5}{2}]$：\n1. 若 $x \\in (-3, -\\frac{5}{2})$，则 $x + 2 \\in (-1, -\\frac{1}{2})$，从而 $-(x+2) \\in (\\frac{1}{2}, 1)$。因为 $f$ 在 $(-1, -\\frac{1}{2})$ 上连续且为偶函数、周期为 2，故：\n   $S(x) = f(x) = f(x+2) = f(-(x+2)) = 2 - 2(-x - 2) = 2x + 6$。\n2. 检查区间两个端点处的跳跃间断点：\n   - 左端点 $x = -3$：$f(-3^-) = f(1^-) = 0$，$f(-3^+) = f(-1^+) = f(1^-) = 0$，连续点！且 $2(-3)+6 = 0$ 恰好吻合。\n   - 右端点 $x = -\\frac{5}{2}$：由于 $f(\\frac{1}{2}^-) = \\frac{1}{2}$ 而 $f(\\frac{1}{2}^+) = 2 - 2(\\frac{1}{2}) = 1$，$x = \\pm\\frac{1}{2} + 2k$ 为第一类跳跃间断点！由狄利克雷定理，和函数在该点取左右极限平均值：$S\\left(-\\frac{5}{2}\\right) = \\frac{f(\\frac{1}{2}^-) + f(\\frac{1}{2}^+)}{2} = \\frac{\\frac{1}{2} + 1}{2} = \\frac{3}{4}$。\n故标准和函数表达式为 $\\begin{cases} 2x + 6, & -3 \\le x < -\\frac{5}{2} \\\\ \\frac{3}{4}, & x = -\\frac{5}{2} \\end{cases}$。",
    "steps": [
      "利用周期 $T=2$ 与偶性将 $x \\in (-3, -5/2)$ 平移反射至 $(1/2, 1)$，求得表达式 $2x+6$",
      "检验区间左端点 $x=-3$ 连续且值吻合为 $0$",
      "识别右端点 $x=-5/2$ 对应跳跃间断点 $1/2$，由狄利克雷收敛定理算出 $S(-5/2) = 3/4$"
    ],
    "keyPoints": [
      "傅里叶级数狄利克雷收敛定理",
      "周期性与奇偶延拓",
      "间断点处和函数取值"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "傅里叶级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T14】设曲面 $\\Sigma: x^2 + y^2 + z^2 = 2x$，$\\Sigma$ 的密度为 $\\rho = x^2 + y^2 + z^2$，则曲面 $\\Sigma$ 的质量 $m =$ ______。",
    "correctAnswer": "$8\\pi$",
    "explanation": "曲面 $\\Sigma$ 配方为 $(x-1)^2 + y^2 + z^2 = 1$，是以 $(1, 0, 0)$ 为球心、半径 $R = 1$ 的球面。\n在 $\\Sigma$ 上密度 $\\rho = x^2+y^2+z^2 = 2x$，故质量：\n$m = \\oiint_{\\Sigma} 2x\\,dS = 2\\oiint_{\\Sigma} [(x-1) + 1]\\,dS$。\n由球面关于中心 $x = 1$ 的奇对称性，$\\oiint_{\\Sigma}(x-1)\\,dS = 0$。\n因此 $m = 2 \\cdot 1 \\cdot \\text{Area}(\\Sigma) = 2 \\cdot 4\\pi (1)^2 = 8\\pi$。",
    "steps": [
      "配方识别 $\\Sigma$ 为球心 $(1,0,0)$、半径 $1$ 的球面，并代入 $\\rho = 2x$",
      "写 $2x = 2(x-1) + 2$，利用球面对称性消去 $x-1$ 项",
      "乘球面积 $4\\pi$ 得总质量 $8\\pi$"
    ],
    "keyPoints": [
      "第一类曲面积分",
      "代入曲面方程化简与对称性"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "曲面积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T17（10分）】已知 $f(x)$ 在定义域 $(0, +\\infty)$ 内可导，且 $x f(x) = 1 + \\int_0^x u^2 f(u)\\,du$。求 $f(x)$ 在 $(0, +\\infty)$ 内的最小值。",
    "correctAnswer": "$\\sqrt{e}$（在 $x = 1$ 处取得）。",
    "explanation": "1. **定边界与转化微分方程**：由题设关系易见积分收敛（且若取 $x\\to 0^+$，应有 $\\lim_{x\\to 0^+} x f(x) = 1$）。两边对 $x$ 求导：\n   $f(x) + x f'(x) = x^2 f(x) \\implies x f'(x) + (1 - x^2)f(x) = 0$。\n2. **分离变量求解通解**：\n   $\\frac{f'(x)}{f(x)} = x - \\frac{1}{x} \\implies \\ln|f(x)| = \\frac{1}{2}x^2 - \\ln x + C_1 \\implies f(x) = \\frac{C}{x}e^{\\frac{1}{2}x^2}$ $(x > 0)$。\n3. **代回原积分方程定常数 $C$**：\n   注意 $x f(x) = C e^{\\frac{1}{2}x^2}$。由原方程 $x f(x) = 1 + \\int_0^x u^2 f(u)\\,du$，当 $x \\to 0^+$ 时，$\\lim_{x\\to 0^+} \\int_0^x u^2 f(u)\\,du = \\lim_{x\\to 0^+} \\int_0^x C u e^{u^2/2}\\,du = 0$，故 $\\lim_{x\\to 0^+} x f(x) = C e^0 = 1 \\implies C = 1$。\n   （检验：$\\int_0^x u^2 \\frac{1}{u}e^{u^2/2}\\,du = \\int_0^x u e^{u^2/2}\\,du = e^{x^2/2} - 1$，完美符合原方程！）\n   所以 $f(x) = \\frac{1}{x} e^{\\frac{1}{2}x^2}$ $(x > 0)$。\n4. **求最小值**：\n   $f'(x) = \\frac{(x^2 - 1)}{x^2}e^{\\frac{1}{2}x^2}$。当 $0 < x < 1$ 时 $f'(x) < 0$；当 $x > 1$ 时 $f'(x) > 0$。故 $f(x)$ 在 $x = 1$ 处取得 $(0,+\\infty)$ 内的最小值 $f(1) = \\sqrt{e}$。",
    "steps": [
      "（3分）积分方程两边求导转化为一阶可分离变量微分方程 $x f'(x) + (1-x^2)f(x) = 0$",
      "（3分）分离变量解得通解 $f(x) = \\frac{C}{x}e^{x^2/2}$",
      "（2分）通过 $x\\to 0^+$ 取极限（或代回积分方程验算）确定 $C = 1$",
      "（2分）由 $f'(x)$ 在 $x=1$ 处由负转正求得唯一最小值 $\\sqrt{e}$"
    ],
    "keyPoints": [
      "变上限积分方程转微分方程",
      "积分定常数验算",
      "函数单调性与最值"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "微分方程"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T18（12分）】设 $f(u)$ 在 $(0, +\\infty)$ 内具有二阶导数，$z = x f\\left(\\frac{y}{x}\\right) + y f\\left(\\frac{y}{x}\\right)$ 满足 $x\\frac{\\partial^2 z}{\\partial x \\partial y} + 2y\\frac{\\partial^2 z}{\\partial y^2} = \\frac{y}{x}$，$z(x, x) = x$，$\\left.\\frac{\\partial z}{\\partial x}\\right|_{(x, x)} = -\\frac{3}{2}$，求 $f(u)$。",
    "correctAnswer": "$f(u) = \\frac{u^2 + 3u - 2}{2(u + 1)}$",
    "explanation": "令中间变量 $u = \\frac{y}{x}$，并设辅助函数 $g(u) = (1 + u)f(u)$，则函数极大化简为齐次形式：$z = (x+y)f(\\frac{y}{x}) = x g(u)$！\n依次计算各阶偏导数（注意 $u'_x = -\\frac{y}{x^2} = -\\frac{u}{x}$，$u'_y = \\frac{1}{x}$）：\n1. $\\frac{\\partial z}{\\partial x} = g(u) + x g'(u)(-\\frac{u}{x}) = g(u) - u g'(u)$；\n2. $\\frac{\\partial z}{\\partial y} = x g'(u)\\cdot\\frac{1}{x} = g'(u)$；\n3. $\\frac{\\partial^2 z}{\\partial y^2} = g''(u)\\cdot\\frac{1}{x} = \\frac{1}{x} g''(u)$；\n4. $\\frac{\\partial^2 z}{\\partial x \\partial y} = \\frac{\\partial}{\\partial x}[g'(u)] = g''(u)(-\\frac{u}{x}) = -\\frac{u}{x}g''(u)$。\n代入偏微分方程：\n$x\\left(-\\frac{u}{x}g''(u)\\right) + 2y\\left(\\frac{1}{x}g''(u)\\right) = (-u + 2u)g''(u) = u g''(u) = \\frac{y}{x} = u$。\n由于 $u > 0$，得常微分方程 $g''(u) = 1$！积分两次得 $g(u) = \\frac{1}{2}u^2 + C_1 u + C_2$。\n再代入边界条件（$y = x$ 即 $u = 1$）：\n- 由 $z(x, x) = x \\implies x g(1) = x \\implies g(1) = 1$；\n- 由 $\\left.\\frac{\\partial z}{\\partial x}\\right|_{(x, x)} = -\\frac{3}{2} \\implies g(1) - g'(1) = -\\frac{3}{2} \\implies g'(1) = 1 + \\frac{3}{2} = \\frac{5}{2}$。\n代入 $g'(u) = u + C_1$：$g'(1) = 1 + C_1 = \\frac{5}{2} \\implies C_1 = \\frac{3}{2}$。\n再代入 $g(1) = \\frac{1}{2} + \\frac{3}{2} + C_2 = 1 \\implies C_2 = -1$。\n故 $g(u) = \\frac{1}{2}u^2 + \\frac{3}{2}u - 1 = \\frac{u^2 + 3u - 2}{2}$，从而 $f(u) = \\frac{g(u)}{1+u} = \\frac{u^2 + 3u - 2}{2(u + 1)}$ $(u > 0)$。",
    "steps": [
      "（3分）引入 $u=y/x$ 与 $g(u)=(1+u)f(u)$ 将函数化为简洁形式 $z = x g(u)$",
      "（4分）利用链式法则求得 $\\frac{\\partial z}{\\partial x}, \\frac{\\partial z}{\\partial y}, \\frac{\\partial^2 z}{\\partial y^2}, \\frac{\\partial^2 z}{\\partial x \\partial y}$",
      "（3分）代入偏微分方程消元得到极其简洁的常微分方程 $g''(u) = 1$ 并求通解",
      "（2分）将 $u=1$ 对应条件 $g(1)=1, g'(1)=5/2$ 代入定常数，还原得 $f(u) = \\frac{u^2+3u-2}{2(u+1)}$"
    ],
    "keyPoints": [
      "多元抽象复合函数二阶偏导",
      "换元简化偏微分方程",
      "常微分方程初值问题"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "多元复合求导与PDE"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T19（12分）】设平面闭曲线 $L: (x^2 + y^2)^{\\frac{3}{2}} = 2\\sqrt{2} x y$，$x \\ge 0, y \\ge 0$，取逆时针方向，计算 $I = \\oint_L \\left(\\frac{1}{3}xy^3 - \\frac{1}{2}x^2y^2\\right)\\,dx + \\frac{1}{3}(x+y)^3\\,dy$。",
    "correctAnswer": "$\\frac{8}{15} + \\frac{3\\pi}{16}$",
    "explanation": "1. **应用格林公式**：记 $P = \\frac{1}{3}xy^3 - \\frac{1}{2}x^2y^2$，$Q = \\frac{1}{3}(x+y)^3$，$L$ 为第一象限内逆时针围成区域 $D$ 的闭曲线，由格林公式：\n   $I = \\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\,dxdy = \\iint_D \\left[(x+y)^2 - (xy^2 - x^2y)\\right]\\,dxdy = \\iint_D (x^2 + 2xy + y^2 - xy^2 + x^2y)\\,dxdy$。\n2. **极坐标表示区域 $D$ 及对称性简化**：\n   将 $(x^2+y^2)^{3/2} = 2\\sqrt{2}xy$ 化为极坐标：$r^3 = 2\\sqrt{2} r^2 \\cos\\theta\\sin\\theta = \\sqrt{2} r^2 \\sin 2\\theta$，即 $r = \\sqrt{2}\\sin 2\\theta$ $\\left(0 \\le \\theta \\le \\frac{\\pi}{2}\\right)$（单叶玫瑰线）。\n   **关键对称性洞察**：区域 $D$ 关于直线 $y = x$ 对称！从而 $\\iint_D x^2 y\\,dxdy = \\iint_D x y^2\\,dxdy$！于是 $-xy^2 + x^2 y$ 两项在区域 $D$ 上的积分**完全抵消为零**！\n3. **计算剩余对称积分**：\n   $I = \\iint_D (r^2 + 2r^2\\cos\\theta\\sin\\theta)\\,dxdy = \\int_0^{\\pi/2} (1 + \\sin 2\\theta)\\,d\\theta \\int_0^{\\sqrt{2}\\sin 2\\theta} r^3\\,dr$\n   $= \\int_0^{\\pi/2} (1 + \\sin 2\\theta) \\cdot \\frac{1}{4}(\\sqrt{2}\\sin 2\\theta)^4\\,d\\theta = \\int_0^{\\pi/2} (\\sin^4 2\\theta + \\sin^5 2\\theta)\\,d\\theta$。\n   令 $u = 2\\theta$（区间变为 $[0, \\pi]$，$d\\theta = \\frac{1}{2}du$，利用 $[0,\\pi]$ 关于 $\\frac{\\pi}{2}$ 对称再化到 $[0, \\frac{\\pi}{2}]$ 乘 2）：\n   $I = \\int_0^{\\pi/2} (\\sin^4 u + \\sin^5 u)\\,du$。\n   代入华莱士（Wallis）公式：\n   - $\\int_0^{\\pi/2} \\sin^4 u\\,du = \\frac{3}{4}\\cdot\\frac{1}{2}\\cdot\\frac{\\pi}{2} = \\frac{3\\pi}{16}$；\n   - $\\int_0^{\\pi/2} \\sin^5 u\\,du = \\frac{4}{5}\\cdot\\frac{2}{3}\\cdot 1 = \\frac{8}{15}$。\n   相加得 $I = \\frac{8}{15} + \\frac{3\\pi}{16}$。",
    "steps": [
      "（3分）应用格林公式转化为二重积分 $\\iint_D [(x+y)^2 - xy^2 + x^2y]\\,dxdy$",
      "（3分）将曲线转为极坐标单叶玫瑰线 $r = \\sqrt{2}\\sin 2\\theta$ $(0\\le\\theta\\le\\pi/2)$",
      "（3分）敏锐利用区域关于 $y=x$ 轮换对称性直接消去 $x^2y - xy^2$ 项",
      "（3分）展开极坐标积分并运用华莱士公式算得 $\\frac{8}{15} + \\frac{3\\pi}{16}$"
    ],
    "keyPoints": [
      "格林公式",
      "极坐标单叶玫瑰线",
      "轮换对称性消项",
      "Wallis公式"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "曲线积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s3-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T20（12分）】设可导函数 $y = f(x)$ 满足 $[x - \\ln(1+x)]y\\,dx - x^2\\,dy = 0$ $(x > 0)$，$f(1) = 4$。\n（I）证明：$y = f(x)$ 是凸函数；\n（II）若 $(1+x)^{\\frac{1}{x}} + \\left(1 + \\frac{1}{x}\\right)^x \\le a$ $(a > 0)$，求 $a$ 的最小值。",
    "correctAnswer": "（I）证明 $f''(x) > 0$（下凸函数，注：国内教材按 $f''>0$ 称凹函数或部分同济概念外称凸函数，此处依题设以二阶导恒正证明，严格来说此题中 $(x+1)^{1+1/x}$ 实为凹性还是上凸？等一等，下方解析核实 $f''(x)$ 符号与权函数！）；（II）$a$ 的最小值为 $4$。",
    "explanation": "1. **求解微分方程得 $f(x)$**：\n   分离变量：$\\frac{dy}{y} = \\frac{x - \\ln(1+x)}{x^2}\\,dx$。注意凑微分技巧：$d\\left(\\frac{\\ln(1+x)}{x}\\right) = \\frac{\\frac{x}{1+x} - \\ln(1+x)}{x^2}\\,dx$？不妨直接分部积分：\n   $\\int \\frac{-\\ln(1+x)}{x^2}\\,dx = \\frac{\\ln(1+x)}{x} - \\int \\frac{1}{x(1+x)}\\,dx = \\frac{\\ln(1+x)}{x} - \\ln\\frac{x}{1+x}$。\n   再结合 $\\int \\frac{1}{x}\\,dx = \\ln x$，两者相加巧妙消去 $\\ln x$！\n   $\\ln|y| = \\frac{\\ln(1+x)}{x} + \\ln(1+x) + C_1 = \\left(1 + \\frac{1}{x}\\right)\\ln(1+x) + C_1 \\implies y = C (1+x)^{1 + \\frac{1}{x}}$。\n   由 $f(1) = C \\cdot 2^2 = 4 \\implies C = 1$，故 $f(x) = (1+x)^{1+\\frac{1}{x}}$ $(x > 0)$。\n\n**（I）证凹凸性（注：检验二阶导数符号）**：\n先求一阶、二阶导数：设 $h(x) = \\ln f(x) = (1 + \\frac{1}{x})\\ln(1+x)$。\n$h'(x) = -\\frac{\\ln(1+x)}{x^2} + \\frac{1}{x} = \\frac{x - \\ln(1+x)}{x^2} > 0$ $(x>0)$。\n继续求导算 $h''(x) = \\frac{x^2(1 - \\frac{1}{1+x}) - 2x(x - \\ln(1+x))}{x^4} = \\frac{2\\ln(1+x) - \\frac{2x^2+x}{1+x}}{x^3}$。\n同时 $f''(x) = f(x)\\left[h''(x) + (h'(x))^2\\right]$！直接展开分子比较：\n令 $\\varphi(x) = \\left(2\\ln(1+x) - \\frac{2x^2+x}{1+x}\\right)x + \\frac{(x-\\ln(1+x))^2\\cdot 1}{...}$；不如将 $(1+x)^{1+\\frac{1}{x}} = e^{h(x)}$ 直接检验二阶导符号：\n实际上算得 $f(x)$ 在 $x>0$ 上是**上凸函数（国内教材称为凸函数/上凸，$f''(x) < 0$）**还是下凸？用数值检验 $x=1$: $f(1)=4$；$x=0^+$ 时 $\\lim_{x\\to 0^+}(1+x)^{1+1/x} = e$；$x\\to+\\infty$ 时 $f(x) \\sim x \\to +\\infty$。但从 $(0, e)$ 到 $(1, 4)$ 的斜率 $4-e \\approx 1.28$，而当 $x \\to +\\infty$ 时斜率为 $1$！这明确表明 $f''(x) < 0$（局部或全局上凸，题中称“凸函数”正是按国内同济旧版/部分模拟卷把 $f''(x)<0$ 称作凸函数，或注意检查 $f''(x)<0$ 是否在 $(0,+\\infty)$ 恒成立！）。\n让我们验证 $f''(x)$ 分子的符号：\n$f''(x) = f(x) \\cdot \\frac{x^3 h''(x) + x^3 (h'(x))^2}{x^3} = \\frac{f(x)}{x^4} \\left[ x\\left(2\\ln(1+x) - \\frac{2x^2+x}{1+x}\\right) + (x-\\ln(1+x))^2 \\right]$\n$= \\frac{f(x)}{x^4}\\left[ (\\ln(1+x))^2 - \\frac{x^3}{1+x} \\right]$！\n极其震撼的化简！来看 bracket 里：$(\\ln(1+x))^2 - \\frac{x^3}{1+x}$ 的正负！\n由于对 $x > 0$，基本对数不等式 $\\ln(1+x) < x$ 不够强，须用 $\\ln(1+x) < \\frac{x}{\\sqrt{1+x}}$？检查在 $x>0$ 时：设 $\\psi(x) = \\frac{x^{3/2}}{\\sqrt{1+x}} - \\ln(1+x)$？不对，当 $x=0.1$ 时 $\\ln(1.1)^2 \\approx 0.00908$，$\\frac{0.001}{1.1} \\approx 0.000909$！说明在 $x$ 较小时 $f''(x) > 0$？！\nWait！非常关键！在考试与题库解析中必须绝对实事求是：$f(1)=4, f(0^+)=e\\approx 2.718$，而 $f(x)$ 当 $x\\to 0^+$ 时 $(1+x)^{1+1/x} = e + \\frac{e}{2}x + O(x^2)$，$4-e \\approx 1.282 < e/2 \\approx 1.359$，确实说明它在某一段斜率在下降！\n那为什么 $x=0.1$ 时 $(\\ln 1.1)^2 > x^3/(1+x)$？因为上面少算了！重算 $h''(x)$：\n$h'(x) = \\frac{1}{x} - \\frac{\\ln(1+x)}{x^2} \\implies h''(x) = -\\frac{1}{x^2} - \\frac{\\frac{x}{1+x} - 2\\ln(1+x)}{x^3} = \\frac{-x(1+x) - x + 2(1+x)\\ln(1+x)}{x^3(1+x)} = \\frac{2(1+x)\\ln(1+x) - x^2 - 2x}{x^3(1+x)}$！\n再算 $x^4[h''(x) + (h'(x))^2]$：\n$= \\frac{x[2(1+x)\\ln(1+x) - x^2 - 2x] + (1+x)[x - \\ln(1+x)]^2}{x^4(1+x)}$\n展开分子 $= 2x(1+x)\\ln(1+x) - x^3 - 2x^2 + (1+x)x^2 - 2x(1+x)\\ln(1+x) + (1+x)[\\ln(1+x)]^2$\n$= (1+x)[\\ln(1+x)]^2 - x^2$！\n**看看那神奇的一刻**：分子竟然恰好是 $(1+x)[\\ln(1+x)]^2 - x^2$！！\n由经典不等式 $\\ln(1+x) < \\frac{x}{\\sqrt{1+x}}$? 对任何 $x > 0$，验证 $\\phi(x) = \\ln(1+x) - \\frac{x}{\\sqrt{1+x}}$：$\\phi(0) = 0$，$\\phi'(x) = \\frac{1}{1+x} - \\frac{\\sqrt{1+x} - \\frac{x}{2\\sqrt{1+x}}}{1+x} = \\frac{2\\sqrt{1+x} - (2 + 2x - x)}{2(1+x)^{3/2}} = \\frac{2\\sqrt{1+x} - (x+2)}{2(1+x)^{3/2}}$。因为 $(2\\sqrt{1+x})^2 = 4+4x < x^2+4x+4 = (x+2)^2$，所以 $\\phi'(x) < 0$ 恒成立！从而对一切 $x > 0$ 都有 $0 < \\ln(1+x) < \\frac{x}{\\sqrt{1+x}} \\implies (1+x)[\\ln(1+x)]^2 - x^2 < 0$！\n因此 **$f''(x) < 0$ 在 $(0, +\\infty)$ 上严格恒成立**！按同济教材定义 $f''(x) < 0$ 称为**凸函数（上凸）**！太震撼了，这个代数化简美极了！\n\n**（II）利用上凸性与加权琴生不等式求最值**：\n注意到 $g(x) = (1+x)^{\\frac{1}{x}} + (1+\\frac{1}{x})^x = \\frac{(1+x)^{1+1/x}}{1+x} + \\frac{(1+\\frac{1}{x})^{1+x}}{1+\\frac{1}{x}} = \\frac{1}{1+x} f(x) + \\frac{x}{1+x} f\\left(\\frac{1}{x}\\right)$！\n因为 $f(x)$ 在 $(0, +\\infty)$ 上是上凸函数（$f''(x) < 0$），设权重 $\\lambda = \\frac{1}{1+x} \\in (0, 1)$，$1 - \\lambda = \\frac{x}{1+x}$，由凸函数的加权琴生不等式（即第二套 T20 同款不等式反向）：\n$\\frac{1}{1+x} f(x) + \\frac{x}{1+x} f\\left(\\frac{1}{x}\\right) \\le f\\left(\\frac{1}{1+x}\\cdot x + \\frac{x}{1+x}\\cdot\\frac{1}{x}\\right) = f\\left(\\frac{2x}{1+x}\\right)$？Wait！代入自变量看看：\n$\\frac{1}{1+x}\\cdot x + \\frac{x}{1+x}\\cdot \\frac{1}{x} = \\frac{x + 1}{1 + x} = 1$!!\n自变量加权和竟然恒等于常数 $1$！！所以上式 $\\le f(1) = 4$，且当 $x = 1$ 时恰取等号 $2 + 2 = 4$！故 $a$ 的最小值为 $4$！",
    "steps": [
      "（4分）分离变量积分并利用 $\\frac{\\ln(1+x)}{x}$ 分部抵消求得 $f(x) = (1+x)^{1+\\frac{1}{x}}$",
      "（4分）取对数二次求导精妙化简得 $f''(x) = \\frac{f(x)}{x^4(1+x)}\\left[(1+x)\\ln^2(1+x) - x^2\\right] < 0$（证得国内同济定义下的上凸函数）",
      "（2分）将所求不等式左端拆写为凸组合 $\\frac{1}{1+x}f(x) + \\frac{x}{1+x}f(\\frac{1}{x})$",
      "（2分）应用上凸函数的琴生不等式放缩至 $f\\left(\\frac{x+1}{1+x}\\right) = f(1) = 4$，验证 $x=1$ 可取等，得 $a_{\\min} = 4$"
    ],
    "keyPoints": [
      "一阶分离变量微分方程",
      "对数求导与经典不等式证明上凸性",
      "琴生不等式加权配对秒杀最值"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第3套",
      "高数",
      "证明与最值压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T1】设 $\\lim_{x\\to+\\infty}\\frac{1}{x^b}\\int_0^{x^2}\\sqrt{1 + t^4}\\,dt = a \\ne 0$，则（ ）。",
    "correctAnswer": "B",
    "explanation": "当 $x \\to +\\infty$ 时，$\\int_0^{x^2}\\sqrt{1+t^4}\\,dt \\to +\\infty$。为使商有非零有限极限 $a$，必有 $x^b \\to +\\infty$（即 $b>0$），从而可对 $\\frac{\\infty}{\\infty}$ 使用洛必达法则：\n$\\lim_{x\\to+\\infty}\\frac{\\sqrt{1+(x^2)^4} \\cdot 2x}{b x^{b-1}} = \\lim_{x\\to+\\infty}\\frac{2 x^5 \\sqrt{1+x^{-8}}}{b x^{b-1}} = \\lim_{x\\to+\\infty}\\frac{2 x^6}{b x^b} = a \\ne 0$。\n比较无穷大阶数：必有 $b = 6$，从而 $a = \\frac{2}{6} = \\frac{1}{3}$。选 B。",
    "steps": [
      "判定为 $\\frac{\\infty}{\\infty}$ 未定式应用洛必达法则求导",
      "确定分子主部阶次为 $2x^5$、分母阶次为 $b x^{b-1}$，比较同阶得 $b=6, a=1/3$"
    ],
    "keyPoints": [
      "变上限积分洛必达法则",
      "无穷大阶数比较"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "极限计算"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $a = 6, b = \\frac{1}{3}$",
      "B. $a = \\frac{1}{3}, b = 6$",
      "C. $a = -\\frac{1}{3}, b = -6$",
      "D. $a = -6, b = -\\frac{1}{3}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s4-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T2】已知方程 $\\int_1^x \\frac{\\ln t}{1 + t}\\,dt + \\int_1^{\\frac{1}{x}} \\frac{\\ln t}{1 + t}\\,dt = a$ $(x > 0)$ 有实根，则 $a$ 的取值范围为（ ）。",
    "correctAnswer": "B",
    "explanation": "记左端函数为 $F(x) = \\int_1^x \\frac{\\ln t}{1+t}\\,dt + \\int_1^{1/x} \\frac{\\ln t}{1+t}\\,dt$ $(x > 0)$。\n求导分析单调性与值域：\n$F'(x) = \\frac{\\ln x}{1+x} + \\frac{-\\ln x}{1 + \\frac{1}{x}}\\cdot\\left(-\\frac{1}{x^2}\\right) = \\frac{\\ln x}{1+x} + \\frac{\\ln x}{x(x+1)} = \\frac{\\ln x}{x}$！\n- 当 $0 < x < 1$ 时 $F'(x) < 0$；当 $x > 1$ 时 $F'(x) > 0$，故在 $x=1$ 处取唯一最小值 $F(1) = 0$。\n- 又由积分表达式直接算得（对第二项做倒代换 $t=1/u$ 得 $\\int_1^x \\frac{\\ln u}{u(1+u)}\\,du$）$F(x) = \\int_1^x \\frac{\\ln t}{t}\\,dt = \\frac{1}{2}(\\ln x)^2$！\n当 $x > 0$ 时 $\\frac{1}{2}(\\ln x)^2$ 的值域为 $[0, +\\infty)$。选 B。",
    "steps": [
      "求导发现 $F'(x) = \\frac{\\ln x}{x}$，并由 $F(1)=0$ 得出 $F(x) = \\frac{1}{2}(\\ln x)^2$",
      "确定 $x>0$ 时值域为 $[0, +\\infty)$，即方程有根的 $a$ 范围"
    ],
    "keyPoints": [
      "变上限积分求导",
      "倒代换简化积分"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "定积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $(0, +\\infty)$",
      "B. $[0, +\\infty)$",
      "C. $(0, 1)$",
      "D. $[1, +\\infty)$"
    ]
  },
  {
    "id": "math-calc-lilin6-s4-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T3】设可微函数 $f(x, y)$ 满足 $\\frac{\\partial f(x, y)}{\\partial x} + f(x, y) = 0$，且 $f(0, y) = 1 + y^2$，则 $df|_{(0, 1)} =$（ ）。",
    "correctAnswer": "B",
    "explanation": "将 $y$ 视作常数求解关于 $x$ 的一阶齐次线性微分方程：$f(x, y) = C(y)e^{-x}$。\n代入初始条件 $f(0, y) = C(y) = 1 + y^2$，得 $f(x, y) = (1 + y^2)e^{-x}$。\n求偏导：$\\frac{\\partial f}{\\partial x} = -(1+y^2)e^{-x}$，$\\frac{\\partial f}{\\partial y} = 2y e^{-x}$。\n在 $(0, 1)$ 处：$f'_x(0,1) = -2$，$f'_y(0,1) = 2$，故 $df|_{(0,1)} = -2dx + 2dy$。选 B。",
    "steps": [
      "视 $y$ 为参变量求解关于 $x$ 的偏微分方程得 $f(x,y) = (1+y^2)e^{-x}$",
      "求点 $(0,1)$ 处偏导得全微分 $-2dx + 2dy$"
    ],
    "keyPoints": [
      "偏微分方程求解",
      "全微分计算"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "微分方程与多元微分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $dx - dy$",
      "B. $-2dx + 2dy$",
      "C. $2dx - 2dy$",
      "D. $2dx + 2dy$"
    ]
  },
  {
    "id": "math-calc-lilin6-s4-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T4】下列级数中条件收敛的是（ ）。",
    "correctAnswer": "D",
    "explanation": "逐项判别敛散性：\n- A 项：通项绝对值 $\\le n^{-3/2} + (n+1)^{-2}$，绝对收敛；\n- B 项：拆为交错收敛级数 $\\sum \\frac{(-1)^n}{\\sqrt{n}}$ 与发散调和级数 $\\sum \\frac{1}{n}$ 之和，故发散；\n- C 项：通项绝对值 $\\sim \\frac{\\sqrt{n}}{n\\sqrt{n}}\\cdot\\frac{1}{\\sqrt{n}} = \\frac{1}{n^{3/2}}$，绝对收敛；\n- D 项：$\\frac{1}{n\\ln(1+n)}$ 单调递减趋于 $0$，由莱布尼茨准则原级数收敛；而绝对值级数 $\\sum \\frac{1}{n\\ln(1+n)} \\sim \\sum \\frac{1}{n\\ln n}$，由积分判别法发散，故**条件收敛**！选 D。",
    "steps": [
      "由等价无穷小放缩判定 A、C 均绝对收敛",
      "拆分通项判定 B 为收敛加发散而发散",
      "对 D 应用莱布尼茨准则和 $\\frac{1}{n\\ln n}$ 发散性证得条件收敛"
    ],
    "keyPoints": [
      "绝对收敛与条件收敛",
      "莱布尼茨准则",
      "级数拆项判定"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "无穷级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $\\sum_{n=1}^{\\infty}(-1)^n\\left[\\frac{1}{n\\sqrt{n}} + \\frac{1}{(n+1)^2}\\right]$",
      "B. $\\sum_{n=1}^{\\infty}(-1)^n\\left[\\frac{1}{\\sqrt{n}} + \\frac{(-1)^n}{n}\\right]$",
      "C. $\\sum_{n=1}^{\\infty}\\frac{(-1)^n\\sqrt{n}}{(n+1)\\sqrt{n+2}}\\sin\\frac{1}{\\sqrt{n}}$",
      "D. $\\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}}{n\\ln(1+n)}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s4-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T11】设 $a_n = \\left(\\frac{n+2}{3n-2} \\cdot \\frac{n+4}{3n-4} \\cdots \\frac{n+2n}{3n-2n}\\right)^{\\frac{1}{n}}$，则 $\\lim_{n\\to\\infty} a_n =$ ______。",
    "correctAnswer": "$1$",
    "explanation": "取对数利用定积分定义：\n$\\ln a_n = \\frac{1}{n}\\sum_{k=1}^n \\ln\\frac{n + 2k}{3n - 2k} = \\frac{1}{n}\\sum_{k=1}^n \\ln\\frac{1 + 2\\cdot\\frac{k}{n}}{3 - 2\\cdot\\frac{k}{n}} \\to \\int_0^1 \\ln\\frac{1+2x}{3-2x}\\,dx$。\n作区间再现替换 $t = 1 - x$，注意到 $1 + 2(1-t) = 3 - 2t$ 而 $3 - 2(1-t) = 1 + 2t$，被积函数刚好变负号！故该定积分为 $0$！\n因此 $\\lim_{n\\to\\infty} a_n = e^0 = 1$。",
    "steps": [
      "取自然对数将连乘极限化为黎曼和极限 $\\int_0^1 \\ln\\frac{1+2x}{3-2x}\\,dx$",
      "利用 $x \\leftrightarrow 1-x$ 对称置换得出积分值为 $0$，还原得极限为 $1$"
    ],
    "keyPoints": [
      "定积分定义求连乘积极限",
      "区间再现对称技巧"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "定积分定义"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "导数与微分",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T12】设 $f(x)$ 连续，$\\lim_{x\\to 0}\\frac{\\ln[f(x+1) + e^{x^2}]}{x} = 1$，则 $\\lim_{x\\to 0}\\frac{f[(1+\\tan x)^2] - f(1+\\tan x)}{x} =$ ______。",
    "correctAnswer": "$1$",
    "explanation": "由前式分母趋于 $0$ 及 $f$ 连续，分子极限必为 $0 \\implies \\ln[f(1) + 1] = 0 \\implies f(1) = 0$。\n等价代换：$\\ln[1 + (f(x+1) + e^{x^2} - 1)] \\sim f(x+1) + x^2 + o(x^2)$。\n故 $\\lim_{x\\to 0}\\frac{f(1+x)}{x} = 1$，即 $f'(1) = 1$！\n再算所求极限（用“加一项减一项”拆为在 $x=1$ 处的两个导数定义）：\n令 $u = 1 + \\tan x \\to 1$（$u - 1 = \\tan x \\sim x$），则：\n$\\lim_{x\\to 0}\\frac{f(u^2) - f(1) - [f(u) - f(1)]}{x} = \\lim_{x\\to 0}\\left[\\frac{f(u^2)-f(1)}{u^2-1}\\cdot\\frac{2\\tan x + \\tan^2 x}{x} - \\frac{f(u)-f(1)}{u-1}\\cdot\\frac{\\tan x}{x}\\right] = f'(1)\\cdot 2 - f'(1)\\cdot 1 = 1$。",
    "steps": [
      "由连续性及无穷小等价得出 $f(1) = 0$ 且 $f'(1) = 1$",
      "通过加减 $f(1)$ 凑两项导数定义，算得 $2f'(1) - f'(1) = 1$"
    ],
    "keyPoints": [
      "导数定义拆项技巧",
      "等价无穷小"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "导数定义"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T13】$\\sum_{k=1}^{\\infty} \\int_k^{k+1} \\frac{\\arctan x}{x^2}\\,dx =$ ______。",
    "correctAnswer": "$\\frac{\\ln 2}{2} + \\frac{\\pi}{4}$",
    "explanation": "利用定积分区间可加性，无穷和直接合并为反常积分：\n$\\sum_{k=1}^\\infty \\int_k^{k+1} \\frac{\\arctan x}{x^2}\\,dx = \\int_1^{+\\infty} \\frac{\\arctan x}{x^2}\\,dx$。\n分部积分：$=\\left[-\\frac{\\arctan x}{x}\\right]_1^{+\\infty} + \\int_1^{+\\infty}\\frac{dx}{x(1+x^2)} = \\frac{\\pi}{4} + \\int_1^{+\\infty}\\left(\\frac{1}{x} - \\frac{x}{1+x^2}\\right)\\,dx = \\frac{\\pi}{4} + \\left[\\frac{1}{2}\\ln\\frac{x^2}{1+x^2}\\right]_1^{+\\infty} = \\frac{\\pi}{4} - \\frac{1}{2}\\ln\\frac{1}{2} = \\frac{\\ln 2}{2} + \\frac{\\pi}{4}$。",
    "steps": [
      "利用区间可加性合并级数为反常积分 $\\int_1^{+\\infty} \\frac{\\arctan x}{x^2}\\,dx$",
      "分部积分与有理分式分解计算得 $\\frac{\\ln 2}{2} + \\frac{\\pi}{4}$"
    ],
    "keyPoints": [
      "反常积分分部积分",
      "积分区间可加性"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "反常积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T14】$\\sum_{n=1}^{\\infty} \\frac{2n - 1}{2^{2n-1}}$ 的和为 ______。",
    "correctAnswer": "$\\frac{10}{9}$",
    "explanation": "令 $S(x) = \\sum_{n=1}^\\infty (2n-1)x^{2n-2} = \\left(\\sum_{n=1}^\\infty x^{2n-1}\\right)' = \\left(\\frac{x}{1-x^2}\\right)' = \\frac{1+x^2}{(1-x^2)^2}$ $(|x| < 1)$。\n所求级数恰好为 $x S(x)|_{x = \\frac{1}{2}} = \\frac{\\frac{1}{2}(1 + \\frac{1}{4})}{(1 - \\frac{1}{4})^2} = \\frac{5/8}{9/16} = \\frac{10}{9}$。\n（亦可直接错位相减：$S = \\frac{1}{2} + \\frac{3}{8} + \\frac{5}{32} + \\cdots$，$\\frac{1}{4}S = \\frac{1}{8} + \\frac{3}{32} + \\cdots$，相减 $\\frac{3}{4}S = \\frac{1}{2} + \\frac{2}{8}(1+\\frac{1}{4}+\\cdots) = \\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6} \\implies S = \\frac{10}{9}$。）",
    "steps": [
      "利用差比数列错位相减（或幂级数逐项求导）",
      "求得 $\\frac{3}{4}S = \\frac{5}{6}$，得出级数和 $\\frac{10}{9}$"
    ],
    "keyPoints": [
      "常数项级数求和",
      "幂级数逐项求导 / 错位相减"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "无穷级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T17（10分）】设 $M(x, y)$ 是曲线 $y = f(x)$ $(y > 0)$ 上任一点，曲线在点 $M$ 处的切线交 $y$ 轴于点 $P$，若 $|MP| = |PO|$，其中 $O$ 为坐标原点，且曲线过点 $(4, 3)$。求 $y = f(x)$ 的表达式，并求 $f(x)$ 的极值。",
    "correctAnswer": "$f(x) = \\sqrt{\\frac{25}{4}x - x^2}$ $(0 < x < \\frac{25}{4})$；在 $x = \\frac{25}{8}$ 处取得极大值 $\\frac{25}{8}$。",
    "explanation": "1. **列切线方程与几何条件建微分方程**：\n   过 $M(x, y)$ 的切线方程为 $Y - y = y'(X - x)$。令 $X = 0$ 得与 $y$ 轴交点 $P(0, y - x y')$。\n   计算两点距离平方：$|MP|^2 = x^2 + (x y')^2$，$|PO|^2 = (y - x y')^2$。\n   由 $|MP| = |PO|$ 平方相等得：$x^2 + x^2 y'^2 = y^2 - 2xy y' + x^2 y'^2$，即 $2xy y' - y^2 = -x^2$。\n   令 $u = y^2 > 0$，则 $u' = 2y y'$，方程化为关于 $u$ 的一阶线性微分方程：\n   $u' - \\frac{1}{x}u = -x$（注意隐含过点 $(4, 3)$，故在 $x > 0$ 区间求解）。\n2. **求通解与特解**：\n   通解公式（也可除以 $x^2$ 观察到 $(\\frac{u}{x})' = -1$！）：\n   $\\left(\\frac{u}{x}\\right)' = \\frac{x u' - u}{x^2} = -1 \\implies \\frac{u}{x} = -x + C \\implies y^2 = C x - x^2$。\n   代入初始条件 $y(4) = 3 \\implies 9 = 4C - 16 \\implies C = \\frac{25}{4}$。\n   因 $y > 0$，得 $y = f(x) = \\sqrt{\\frac{25}{4}x - x^2}$ $\\left(0 < x < \\frac{25}{4}\\right)$。\n3. **求极值**：\n   $\\frac{25}{4}x - x^2 = \\left(\\frac{25}{8}\\right)^2 - \\left(x - \\frac{25}{8}\\right)^2$，故在 $x = \\frac{25}{8}$ 处函数取得极大值（也是最大值）$f\\left(\\frac{25}{8}\\right) = \\frac{25}{8}$。",
    "steps": [
      "（3分）写出切线截距 $P(0, y-xy')$，由 $|MP|=|PO|$ 列出微分方程 $2xyy' - y^2 = -x^2$",
      "（4分）换元 $u=y^2$ 观察到 $(u/x)'=-1$，结合 $y(4)=3$ 解得 $f(x)=\\sqrt{\\frac{25}{4}x - x^2}$",
      "（3分）配方（或求导）确定唯一极大值点 $x = \\frac{25}{8}$，极大值为 $\\frac{25}{8}$"
    ],
    "keyPoints": [
      "微分方程几何应用（切线截距）",
      "一阶线性微分方程 / 凑全微分"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "微分方程几何应用"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T18（12分）】设 $f(x) = \\frac{(x - a)^2}{\\ln x}$ $(x > 0)(0 < a < 1)$，若 $f(x)$ 的 3 个极值点为 $x_1, x_2, x_3$，且 $x_1 < x_2 < x_3$。\n（I）求 $f(x)$ 的极大值；\n（II）证明：$x_1 + x_3 > \\frac{2}{\\sqrt{e}}$。",
    "correctAnswer": "（I）极大值为 $f(x_2) = f(a) = 0$；（II）见标准分步证明（利用导数零点方程等价于对称比值构造对数均值不等式）。",
    "explanation": "**（I）讨论极值点分布并求极大值**：\n求导：$f'(x) = \\frac{(x-a)[2x\\ln x - (x-a)]}{x(\\ln x)^2} = \\frac{(x-a)(a - g(x))}{x(\\ln x)^2}$，其中 $g(x) = x - 2x\\ln x$ $(x > 0)$。\n先考察 $g(x)$ 性态：$g'(x) = -1 - 2\\ln x$。\n- 在 $(0, e^{-1/2})$ 上 $g'(x) > 0$ 递增，且 $g(0^+) = 0$，$g(e^{-1/2}) = \\frac{2}{\\sqrt{e}} > 1$；\n- 在 $(e^{-1/2}, +\\infty)$ 上 $g'(x) < 0$ 递减，$g(1) = 1$，$g(+\\infty) = -\\infty$。\n因 $0 < a < 1$，故 $g(x) = a$ 在 $(0, e^{-1/2})$ 与 $(1, +\\infty)$ 上各有一根，分别记为 $r_1, r_3$。\n且注意到在 $x=a \\in (0,1)$ 处 $g(a) = a - 2a\\ln a > a$，故 $r_1 < a < 1 < r_3$，即三个极值点依次为 $x_1 = r_1 < x_2 = a < x_3 = r_3$！\n分析 $f'(x)$ 符号变化：分母 $x(\\ln x)^2 > 0$，分子 $= (x-a)(a-g(x))$：\n- $(0, x_1)$：$x < a$ 且 $g(x) < a \\implies f'(x) < 0$；\n- $(x_1, a)$：$x < a$ 且 $g(x) > a \\implies f'(x) > 0$（故 $x_1$ 极小值点）；\n- $(a, 1)$ 与 $(1, x_3)$：$x > a$ 且 $g(x) > a \\implies f'(x) < 0$（故 $x_2 = a$ 为**极大值点**）；\n- $(x_3, +\\infty)$：$x > a$ 且 $g(x) < a \\implies f'(x) > 0$（$x_3$ 极小值点）。\n因此 $f(x)$ 的极大值为 $f(x_2) = f(a) = 0$。\n\n**（II）证明极小值点之和 $x_1 + x_3 > \\frac{2}{\\sqrt{e}}$**：\n由极值点方程知 $x_1 - 2x_1\\ln x_1 = a = x_3 - 2x_3\\ln x_3$，即：\n$x_3 - x_1 = 2(x_3\\ln x_3 - x_1\\ln x_1)$。\n用对数均值/对称函数分析（或固定 $t = \\sqrt{e}x_1 \\in (0, 1), s = \\sqrt{e}x_3 > 1$！极佳的换元！！）：\n令 $t_1 = x_1 \\sqrt{e} \\in (0, 1)$，$t_3 = x_3 \\sqrt{e} > 1$（将拐点/极大值点 $x = e^{-1/2}$ 归一化到 $t = 1$！）。\n由 $x_1(1 - 2\\ln x_1) = x_3(1 - 2\\ln x_3)$，代入 $x_i = t_i e^{-1/2}$ 得 $1 - 2\\ln x_i = 2 - 2\\ln t_i$，即：\n$t_1(1 - \\ln t_1) = t_3(1 - \\ln t_3)$，目标变为证明 $t_1 + t_3 > 2$！\n**极简构造对称证明**：设 $F(t) = t(1 - \\ln t)$ $(0 < t < e)$，则 $F'(t) = -\\ln t$，$F(1) = 1$（与之前极大值一致）。\n由对称比 $t_1(1 - \\ln t_1) = t_3(1 - \\ln t_3)$，我们要证当 $0 < t_1 < 1 < t_3 < e$（注意 $t_3 < e$ 因为 $a > 0 \\implies 1 - \\ln t_3 > 0$！）时有 $t_1 + t_3 > 2$，只需证对 $t \\in (1, e)$ 有 $F(2 - t) < F(t)$！（因为 $F$ 在 $(0,1)$ 严增，若 $2 - t_3 < t_1$ 即得 $t_1 + t_3 > 2$，只需 $F(2 - t_3) < F(t_1) = F(t_3)$！）。\n检验函数 $H(t) = F(t) - F(2 - t) = t(1 - \\ln t) - (2-t)(1 - \\ln(2-t))$ $(t \\in (1, 2))$：\n- 若 $t_3 \\ge 2$，因 $t_1 > 0$ 自动有 $t_1 + t_3 > 2$；\n- 故只需讨论 $1 < t_3 < 2$！此时 $2 - t \\in (0, 1)$，求导：\n  $H'(t) = -\\ln t - \\ln(2 - t) = -\\ln[t(2 - t)] = -\\ln[1 - (t - 1)^2] > 0$（对 $t \\in (1, 2)$ 恒成立！）。\n因 $H(1) = 0$ 且 $H'(t) > 0$，故对 $\\forall t \\in (1, 2)$ 均有 $H(t) > 0 \\implies F(2 - t_3) < F(t_3) = F(t_1)$。又 $F$ 在 $(0, 1)$ 上严格单调递增，故 $2 - t_3 < t_1 \\implies t_1 + t_3 > 2$，即 $x_1 + x_3 > \\frac{2}{\\sqrt{e}}$！",
    "steps": [
      "（3分）求导分离出 $g(x) = x - 2x\\ln x$，分析单调性确定 $0 < x_1 < e^{-1/2}$ 与 $1 < x_3$ 且 $x_1 < a < x_3$",
      "（2分）判定三点两侧导数符号，确认唯一极大值点 $x_2 = a$，极大值为 $0$",
      "（3分）作归一化换元 $t = \\sqrt{e}x$，将极值方程化为 $F(t_1)=F(t_3)$（其中 $F(t)=t(1-\\ln t)$），待证变为 $t_1+t_3 > 2$",
      "（4分）分 $t_3 \\ge 2$ 与 $1 < t_3 < 2$ 讨论，利用对称差函数 $H(t)=F(t)-F(2-t)$ 求导证得 $H'(t) = -\\ln[1-(t-1)^2] > 0$ 完成证明"
    ],
    "keyPoints": [
      "导数极值点偏移压轴证明",
      "对称函数构造法",
      "归一化换元化简"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "极值点偏移压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T19（12分）】设曲面 $z = 1 + x^2 + y^2$ 上点 $P_0(x_0, y_0, z_0)$ 处的切平面为 $\\Pi$，$\\Pi$ 与 $z = x^2 + y^2$ 的交线为 $L$，从 $z$ 轴正向看 $L$ 是逆时针方向，切平面 $\\Pi$ 与 $z = x^2 + y^2$ 所围立体为 $\\Omega$。\n（I）计算 $I = \\oint_L y\\,dx - x\\,dy + (z - x^2 - y^2)\\,dz$；\n（II）求 $\\Omega$ 的体积。",
    "correctAnswer": "（I）$I = -2\\pi$；（II）$\\Omega$ 的体积为 $\\frac{\\pi}{2}$。",
    "explanation": "**（I）求切平面方程与计算曲线积分 $I$**：\n点 $P_0(x_0, y_0, z_0)$ 满足 $z_0 = 1 + x_0^2 + y_0^2$。切平面 $\\Pi$ 的法向量为 $(2x_0, 2y_0, -1)$，故切平面方程为：\n$z - (1 + x_0^2 + y_0^2) = 2x_0(x - x_0) + 2y_0(y - y_0)$，化简得 $z = 2x_0 x + 2y_0 y + 1 - x_0^2 - y_0^2$。\n将其与旋转抛物面 $z = x^2 + y^2$ 联立消去 $z$，得交线 $L$ 在 $xOy$ 面上的投影曲线 $L_{xy}$：\n$x^2 + y^2 - 2x_0 x - 2y_0 y + x_0^2 + y_0^2 = 1 \\iff (x - x_0)^2 + (y - y_0)^2 = 1$（半径为 1 的单位圆！）。\n在曲线 $L$ 上恒有 $z = x^2 + y^2$，故 $(z - x^2 - y^2)\\,dz = 0$！\n因此 $I = \\oint_{L_{xy}} y\\,dx - x\\,dy$。由格林公式（逆时针方向）：\n$I = \\iint_D (-1 - 1)\\,dxdy = -2\\cdot \\text{Area}(D) = -2\\pi\\cdot 1^2 = -2\\pi$。\n\n**（II）求封闭立体 $\\Omega$ 的体积**：\n立体 $\\Omega$ 在 $D: (x-x_0)^2 + (y-y_0)^2 \\le 1$ 上方，上顶面为切平面 $z = 2x_0 x + 2y_0 y + 1 - x_0^2 - y_0^2$，下底面为抛物面 $z = x^2 + y^2$。\n高度差为 $z_{\\text{上}} - z_{\\text{下}} = 1 - [(x - x_0)^2 + (y - y_0)^2] \\ge 0$。\n平移极坐标令 $x - x_0 = r\\cos\\theta, y - y_0 = r\\sin\\theta$（$0 \\le r \\le 1, 0 \\le \\theta \\le 2\\pi$）：\n$V = \\iint_D [1 - (x-x_0)^2 - (y-y_0)^2]\\,dxdy = \\int_0^{2\\pi} d\\theta \\int_0^1 (1 - r^2)r\\,dr = 2\\pi \\left[\\frac{r^2}{2} - \\frac{r^4}{4}\\right]_0^1 = \\frac{\\pi}{2}$。",
    "steps": [
      "（3分）写出点 $P_0$ 处的切平面方程 $z = 2x_0x + 2y_0y + 1 - x_0^2 - y_0^2$",
      "（2分）联立抛物面求出投影圆域 $D: (x-x_0)^2+(y-y_0)^2 \\le 1$",
      "（4分）代入 $z=x^2+y^2$ 消去 $dz$ 项并用格林公式求得 $I = -2\\pi$",
      "（3分）用平移极坐标计算顶面减底面的二重积分得体积 $\\frac{\\pi}{2}$"
    ],
    "keyPoints": [
      "空间曲面切平面",
      "空间曲线积分降维（格林公式）",
      "平移极坐标求立体体积"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "曲线积分与体积"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s4-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T20（12分）】设 $f(x)$ 有连续导数，$f(x)$ 不恒为零，且 $\\int_0^1 f(x)\\,dx = 0$，记 $M = \\max_{x \\in [0, 1]} |f'(x)|$。\n（I）证明：对于 $\\forall x \\in [0, 1]$，有 $|f(x)| \\le \\frac{1}{2}M$；\n（II）设 $D = \\{(x, y) \\mid 0 \\le x \\le 1, 0 \\le y \\le x\\}$，证明：$\\left|\\iint_D f(y)\\,dxdy\\right| \\le \\frac{1}{8}M$。",
    "correctAnswer": "见标准分步证明（零积分+牛顿-莱布尼茨构造双侧路径平均；二重积分换序转化为对称权函数积分估计）。",
    "explanation": "**（I）证明函数上界（经典高分技巧：构造零积分均值放缩）**：\n对任意 $x \\in [0, 1]$，由牛顿-莱布尼茨公式，对任何 $t \\in [0, 1]$ 有 $f(x) - f(t) = \\int_t^x f'(u)\\,du \\implies |f(x) - f(t)| \\le M|x - t|$。\n（或分 $[0,x]$ 和 $[x,1]$ 两段：由 $\\int_0^1 f(t)dt = 0$，一方面 $f(x) = f(x) - \\int_0^1 f(t)dt = \\int_0^1 [f(x) - f(t)]\\,dt$！直接取绝对值！）：\n$|f(x)| \\le \\int_0^1 |f(x) - f(t)|\\,dt \\le M\\int_0^1 |x - t|\\,dt = M\\left[\\int_0^x (x-t)\\,dt + \\int_x^1 (t-x)\\,dt\\right] = M \\cdot \\frac{x^2 + (1-x)^2}{2}$？等等，$(x^2+(1-x)^2)/2$ 当 $x=0$ 时是 $\\frac{1}{2}M$，但在中间还能达到 $\\frac{1}{4}M$！这样正好证明了 $\\le \\frac{1}{2}M$（而且是更紧的界 $\\frac{x^2+(1-x)^2}{2}M$）！！\n检验一下在 $x \\in [0,1]$ 时 $\\frac{x^2+(1-x)^2}{2} = x^2 - x + \\frac{1}{2} \\le \\frac{1}{2}$！完美且直接一步出！（注：也可在两段应用积分中值定理：$0 = \\int_0^1 f(t)dt = f(\\xi) \\implies f(x) = \\int_\\xi^x f'(u)du$？那样只能得 $|x-\\xi|M \\le M$ 不够紧！必须用 $f(x) = \\int_0^1 [f(x)-f(t)]\\,dt$ 或利用拉格朗日在 $[0,x]$ 与 $[x,1]$ 加权！）\n\n**（II）利用二重积分换序与最佳界（或直接用（I）所得的更强局部界 $\\frac{x^2+(1-x)^2}{2}M$！——检查是否够用）**：\n先把二重积分交换次序化为一重积分：\n$\\iint_D f(y)\\,dxdy = \\int_0^1 f(y)\\,dy \\int_y^1 dx = \\int_0^1 (1 - y)f(y)\\,dy$。\n注意因为 $\\int_0^1 f(y)\\,dy = 0$，我们可以任意往 $(1 - y)$ 里面加减一个常数 $C$ 不改变积分值！\n为了最小化 $|1 - y - C|$ 的积分，显然取中心对称常数 $C = \\frac{1}{2}$！\n$I = \\int_0^1 \\left(\\frac{1}{2} - y\\right) f(y)\\,dy$！\n**注意**：如果此时直接把 $|f(y)| \\le \\frac{1}{2}M$ 代入，得到 $\\frac{1}{2}M \\int_0^1 |\\frac{1}{2}-y|\\,dy = \\frac{1}{2}M \\cdot \\frac{1}{4} = \\frac{1}{8}M$！！\n**完美匹配 $\\frac{1}{8}M$！！** 太优雅了！一行加减常数 $\\frac{1}{2}$ 直接一击必杀！\n（核对细节：$\\int_0^1 |\\frac{1}{2}-y|\\,dy = 2\\int_0^{1/2}(\\frac{1}{2}-y)\\,dy = \\frac{1}{4}$，乘以（I）中的上界 $\\frac{1}{2}M$ 恰好等于 $\\frac{1}{8}M$！）",
    "steps": [
      "（5分）利用 $\\int_0^1 f(t)dt = 0$ 写出恒等式 $f(x) = \\int_0^1 [f(x)-f(t)]\\,dt$，用拉格朗日中值定理放缩得 $|f(x)| \\le M\\left(x^2-x+\\frac{1}{2}\\right) \\le \\frac{1}{2}M$",
      "（3分）交换二重积分次序将区域积分化为 $\\int_0^1 (1-y)f(y)\\,dy$",
      "（4分）利用 $\\int_0^1 f(y)\\,dy = 0$ 引入中心常数 $\\frac{1}{2}$ 改写为 $\\int_0^1 (\\frac{1}{2}-y)f(y)\\,dy$，结合（I）的界算出 $\\frac{1}{2}M \\cdot \\frac{1}{4} = \\frac{1}{8}M$"
    ],
    "keyPoints": [
      "零积分函数不等式估计",
      "二重积分交换积分次序",
      "常数平移优化估值上界"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第4套",
      "高数",
      "积分不等式压轴"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "函数、极限与连续",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T1】设当 $x \\to 0$ 时，有 $\\cot x = \\frac{1 + ax^2}{x + bx^3} + o(x^5)$，则（ ）。",
    "correctAnswer": "C",
    "explanation": "利用 $\\cot x = \\frac{\\cos x}{\\sin x}$ 在 $x \\to 0$ 时的麦克劳林展开并通分对比系数。\n由题设 $\\frac{\\cos x}{\\sin x} - \\frac{1 + ax^2}{x + bx^3} = o(x^5)$，通分消去分母 $(x\\sin x \\sim x^2)$ 知：\n$$(x + bx^3)\\cos x - (1 + ax^2)\\sin x = o(x^7)$$\n分别展开至 $x^5$ 项（实际只需看 $x^3$ 与 $x^5$ 项系数即可）：\n- $(x + bx^3)\\left(1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4)\\right) = x + \\left(b - \\frac{1}{2}\\right)x^3 + \\left(\\frac{1}{24} - \\frac{b}{2}\\right)x^5 + o(x^6)$\n- $(1 + ax^2)\\left(x - \\frac{x^3}{6} + \\frac{x^5}{120} + o(x^5)\\right) = x + \\left(a - \\frac{1}{6}\\right)x^3 + \\left(\\frac{1}{120} - \\frac{a}{6}\\right)x^5 + o(x^6)$\n\n对比 $x^3$ 与 $x^5$ 项系数相等：\n1. $b - \\frac{1}{2} = a - \\frac{1}{6} \\implies b - a = \\frac{1}{3}$\n2. $\\frac{1}{24} - \\frac{b}{2} = \\frac{1}{120} - \\frac{a}{6} \\implies \\frac{b}{2} - \\frac{a}{6} = \\frac{1}{24} - \\frac{1}{120} = \\frac{1}{30}$\n\n联立解得 $b = -\\frac{1}{15}$，$a = b - \\frac{1}{3} = -\\frac{6}{15} = -\\frac{2}{5}$。选 C。",
    "steps": [
      "将 $\\cot x = \\frac{\\cos x}{\\sin x}$ 与分式相减并通分转化为分子为 $o(x^7)$ 的多项式恒等条件",
      "分别将 $(x+bx^3)\\cos x$ 与 $(1+ax^2)\\sin x$ 按泰勒公式展开至 $x^5$ 项",
      "联立 $x^3$ 项和 $x^5$ 项系数方程组解得 $a = -\\frac{2}{5}, b = -\\frac{1}{15}$"
    ],
    "keyPoints": [
      "泰勒公式与麦克劳林展开",
      "有理分式逼近(Padé逼近)",
      "待定系数法"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "泰勒展开"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $a = \\frac{2}{5}, b = -\\frac{1}{15}$",
      "B. $a = -\\frac{2}{5}, b = \\frac{1}{15}$",
      "C. $a = -\\frac{2}{5}, b = -\\frac{1}{15}$",
      "D. $a = \\frac{2}{5}, b = \\frac{1}{15}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s5-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "导数与微分",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T2】设 $y = f(x)$ 由 $\\begin{cases} x = 2t + |t|, \\\\ y = |t|(e^{|t|} - 1) \\end{cases}$ 确定，则 $f(x)$ 在 $x = 0$ 处（ ）。",
    "correctAnswer": "C",
    "explanation": "分段讨论参数 $t$ 的正负（注意 $x=0 \\iff t=0$，$x$ 与 $t$ 同号且严格单调递增）：\n1. 当 $t > 0$（对应 $x > 0$）时：$x = 3t \\implies t = \\frac{x}{3}$，从而 $y = \\frac{x}{3}\\left(e^{x/3} - 1\\right)$。\n   此时一阶导数：$f'(x) = \\frac{1}{3}\\left(e^{x/3} - 1\\right) + \\frac{x}{9}e^{x/3}$，右极限 $\\lim_{x\\to 0^+} f'(x) = 0$，且右二阶导 $f''_+(0) = \\lim_{x\\to 0^+}\\frac{f'(x)-0}{x} = \\frac{1}{9} + \\frac{1}{9} = \\frac{2}{9}$。\n2. 当 $t < 0$（对应 $x < 0$）时：$x = 2t - t = t$，从而 $|t| = -x$，于是 $y = -x\\left(e^{-x} - 1\\right)$。\n   此时一阶导数：$f'(x) = -\\left(e^{-x} - 1\\right) + x e^{-x}$，左极限 $\\lim_{x\\to 0^-} f'(x) = 0$，且左二阶导 $f''_-(0) = \\lim_{x\\to 0^-}\\frac{f'(x)-0}{x} = 1 + 1 = 2$。\n3. 在 $x = 0$ 处：$f(0) = 0$，左右极限均为 $0$（连续）；由达布定理（或直接算左右导数 $\\lim_{x\\to 0^\\pm} \\frac{f(x)}{x} = 0$）知 $f'(0) = 0$。\n又因为 $\\lim_{x\\to 0^+} f'(x) = \\lim_{x\\to 0^-} f'(x) = 0 = f'(0)$，所以 $f'(x)$ 在 $x = 0$ 处**连续**；但由于 $f''_+(0) = \\frac{2}{9} \\ne 2 = f''_-(0)$，故 $f(x)$ 在 $x=0$ 处二阶不可导。选 C。",
    "steps": [
      "按 $t>0$ 与 $t<0$ 消去参数 $t$，写出分段显函数 $f(x)$ 的表达式",
      "检验 $x=0$ 处左右极限与左右一阶导数均为 $0$，确认 $f'(0)=0$ 且导函数连续",
      "分别计算左右二阶导数得 $\\frac{2}{9} \\ne 2$，排除二阶可导，确定选 C"
    ],
    "keyPoints": [
      "参数方程确定的分段函数",
      "导函数连续性判定",
      "左右导数与高阶可导性"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "分段函数求导"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 连续但不可导",
      "B. 可导但导函数不连续",
      "C. 可导且导函数连续",
      "D. 二阶可导"
    ]
  },
  {
    "id": "math-calc-lilin6-s5-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T3】已知连续函数 $f(x)$ 满足 $f(x + 2) - f(x) = \\sin x$，$\\int_0^2 f(x)\\,dx = 0$，令 $I_1 = \\int_1^3 f(x)\\,dx$，$I_2 = \\int_2^4 f(x)\\,dx$，则（ ）。",
    "correctAnswer": "B",
    "explanation": "利用函数方程 $f(x+2) = f(x) + \\sin x$ 转化积分区间并相减对比。\n1. 计算 $I_2$：令 $x = t + 2$，则\n   $$I_2 = \\int_0^2 f(t + 2)\\,dt = \\int_0^2 [f(t) + \\sin t]\\,dt = \\int_0^2 f(t)\\,dt + \\int_0^2 \\sin t\\,dt = 0 + (1 - \\cos 2) = 1 - \\cos 2 > 0$$\n2. 计算 $I_1$：拆分积分并平移 $[2, 3]$ 段：\n   $$I_1 = \\int_1^2 f(x)\\,dx + \\int_2^3 f(x)\\,dx = \\int_1^2 f(x)\\,dx + \\int_0^1 f(x + 2)\\,dx$$\n   代入 $f(x+2) = f(x) + \\sin x$：\n   $$I_1 = \\int_1^2 f(x)\\,dx + \\int_0^1 f(x)\\,dx + \\int_0^1 \\sin x\\,dx = \\int_0^2 f(x)\\,dx + (1 - \\cos 1) = 1 - \\cos 1 > 0$$\n3. 比较大小：由于在 $[0, 2]$ 上 $0 < 1 < 2 < \\pi$ 且 $\\cos x$ 单调递减，故 $\\cos 2 < \\cos 1 < 1$，从而\n   $$I_2 = 1 - \\cos 2 > 1 - \\cos 1 = I_1 > 0$$\n选 B。",
    "steps": [
      "对 $I_2$ 换元并利用函数关系与 $\\int_0^2 f(x)dx = 0$ 算得 $I_2 = 1 - \\cos 2$",
      "将 $I_1$ 拆为 $[1,2]$ 与 $[2,3]$，对后段区间平移后合并得 $I_1 = 1 - \\cos 1$",
      "利用余弦函数在 $(0,\\pi)$ 上单调递减比较得出 $I_2 > I_1 > 0$"
    ],
    "keyPoints": [
      "定积分区间平移与拆分",
      "函数方程整合求积分值",
      "三角函数大小比较"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "定积分计算"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $I_1 > I_2 > 0$",
      "B. $I_2 > I_1 > 0$",
      "C. $I_1 > 0 > I_2$",
      "D. $I_1 < I_2 < 0$"
    ]
  },
  {
    "id": "math-calc-lilin6-s5-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T4】已知重力加速度为 $g$，一个半径为 $1$ 的半球体容器盛满密度为 $\\rho$ 的水，现要将水从容器顶部全部抽出，有 (a)、(b) 两种抽水方案，如图所示，则采用方案 (a) 与方案 (b) 抽水所做功的差为（ ）。\n\n![第5套T4 半球体抽水方案(a)与(b)示意图](/images/lilin6/s5_q4.png)",
    "correctAnswer": "C",
    "explanation": "**巧解思路（质心法 / 微元积分法）**：\n设半球半径 $R = 1$，体积 $V = \\frac{2}{3}\\pi R^3 = \\frac{2}{3}\\pi$，总水重 $G = \\rho g V = \\frac{2}{3}\\rho g \\pi$。\n根据物理规律，半球体的质心距离其底面（大圆面）的高度恒为 $\\bar{h} = \\frac{3}{8}R = \\frac{3}{8}$。\n- **方案 (a)**（开口朝下，平面底在最下方，抽水口在球顶 $y=1$ 处）：质心高度为 $\\frac{3}{8}$，抽取到顶部高度 $1$ 处，提升距离 $H_a = 1 - \\frac{3}{8} = \\frac{5}{8}$。\n  做功 $W_a = G \\cdot H_a = \\frac{2}{3}\\rho g \\pi \\cdot \\frac{5}{8} = \\frac{5}{12}\\rho g\\pi$。\n- **方案 (b)**（开口朝上，抽水口在平面大圆 $y=0$ 处）：质心位于平面下方 $\\frac{3}{8}$ 处，抽取到顶面提升距离 $H_b = \\frac{3}{8}$。\n  做功 $W_b = G \\cdot H_b = \\frac{2}{3}\\rho g \\pi \\cdot \\frac{3}{8} = \\frac{1}{4}\\rho g\\pi$。\n- **做功之差**：\n  $$W_a - W_b = \\frac{5}{12}\\rho g\\pi - \\frac{3}{12}\\rho g\\pi = \\frac{1}{6}\\rho g\\pi$$\n（也可直接用微元积分验证：$W_a = \\rho g\\pi\\int_0^1 (1-y)(1-y^2)\\,dy = \\frac{5}{12}\\rho g\\pi$，$W_b = \\rho g\\pi\\int_0^1 y(1-y^2)\\,dy = \\frac{1}{4}\\rho g\\pi$，作差得 $\\rho g\\pi\\int_0^1 (1-2y)(1-y^2)\\,dy = \\frac{1}{6}\\rho g\\pi$。）选 C。",
    "steps": [
      "建系写出半球水平截面面积 $\\pi(1-y^2)$ 及水层微元重量 $\\rho g\\pi(1-y^2)dy$",
      "分别列式求出 $W_a = \\rho g\\pi\\int_0^1 (1-y)(1-y^2)dy = \\frac{5}{12}\\rho g\\pi$ 与 $W_b = \\rho g\\pi\\int_0^1 y(1-y^2)dy = \\frac{1}{4}\\rho g\\pi$",
      "作差得 $W_a - W_b = \\frac{1}{6}\\rho g\\pi$（或直接由半球质心在底面下方 $\\frac{3}{8}R$ 处一步秒杀）"
    ],
    "keyPoints": [
      "定积分物理应用(抽水做功)",
      "立体质心与做功联系"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "微积分物理应用"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $0$",
      "B. $\\frac{1}{12}\\rho g\\pi$",
      "C. $\\frac{1}{6}\\rho g\\pi$",
      "D. $\\frac{1}{4}\\rho g\\pi$"
    ]
  },
  {
    "id": "math-calc-lilin6-s5-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T11】设 $x, y \\in \\mathbb{R}$，且 $4x^2 + 4y^2 - 2xy - \\frac{5}{8} = 0$，则 $2x + y$ 的取值范围为 ______。",
    "correctAnswer": "$[-1, 1]$",
    "explanation": "本题可用**柯西不等式**或**配方法/拉格朗日乘数法**秒杀，展示配方求最值法与拉格朗日法：\n**方法一（代数配方技巧）**：\n把条件改写为 $(2x + y)$ 与含 $(x, y)$ 另一线性组合的平方和：\n注意到 $4(4x^2 + 4y^2 - 2xy) = 16x^2 + 16y^2 - 8xy = 5$？等式两边乘 $8$ 观察系数比：\n由拉格朗日乘数法，设 $L(x, y, \\lambda) = 2x + y + \\lambda(4x^2 + 4y^2 - 2xy - \\frac{5}{8})$，求偏导令零：\n- $2 + \\lambda(8x - 2y) = 0 \\implies 4x - y = -\\frac{1}{\\lambda}$\n- $1 + \\lambda(8y - 2x) = 0 \\implies -x + 4y = -\\frac{1}{2\\lambda}$\n\n两式解比例：消去 $\\lambda$，将第一式 $= 2 \\times$ 第二式得：\n$4x - y = 2(-x + 4y) \\implies 6x = 9y \\implies x = \\frac{3}{2}y$。\n代入椭圆约束方程：\n$$4\\left(\\frac{3}{2}y\\right)^2 + 4y^2 - 2\\left(\\frac{3}{2}y\\right)y = \\frac{5}{8} \\implies (9 + 4 - 3)y^2 = 10y^2 = \\frac{5}{8} \\implies y^2 = \\frac{1}{16} \\implies y = \\pm\\frac{1}{4}$$\n对应 $x = \\pm\\frac{3}{8}$。此时目标函数：\n$$2x + y = \\pm\\left(2\\cdot\\frac{3}{8} + \\frac{1}{4}\\right) = \\pm 1$$\n因为约束集合是闭椭圆（有界闭集），连续函数必取到最大值 $1$ 与最小值 $-1$ 且取遍中间一切值，故取值范围为 $[-1, 1]$。\n\n（**方法二：直接柯西配平方**）：\n校验：$16x^2 + 16y^2 - 8xy = \\frac{5}{2} = \\frac{5}{2}(2x+y)^2$ 处配得：\n$5(2x+y)^2 + (2x - 3y)^2 = 5(4x^2+4xy+y^2) + (4x^2-12xy+9y^2) = 24x^2 + 8xy + 14y^2$ 不凑巧；真正精确的恒等式是：\n$$10(4x^2 + 4y^2 - 2xy) = 40x^2 - 20xy + 40y^2 = 4(2x+y)^2 + 6(2x-3y)^2 \\quad \\text{（等下校验：}4(4x^2+4xy+y^2)+6(4x^2-12xy+9y^2) = 40x^2 - 56xy \\text{不对）}$$\n准确恒等式由配出 $2x-3y=0$ 得：$4x^2+4y^2-2xy = \\frac{5}{8}(2x+y)^2 + \\frac{3}{8}(2x-3y)^2$！\n验算：$\\frac{5}{8}(4x^2+4xy+y^2) + \\frac{3}{8}(4x^2-12xy+9y^2) = 4x^2 - 2xy + 4y^2$ 完美成立！\n故 $\\frac{5}{8}(2x+y)^2 \\le 4x^2+4y^2-2xy = \\frac{5}{8} \\implies (2x+y)^2 \\le 1 \\implies 2x+y \\in [-1, 1]$！",
    "steps": [
      "构造拉格朗日函数求驻点条件 $4x-y = 2(-x+4y)$ 得极值点满足 $x = \\frac{3}{2}y$（或配出平方分解 $\\frac{5}{8}(2x+y)^2 + \\frac{3}{8}(2x-3y)^2 = \\frac{5}{8}$）",
      "解得驻点为 $(\\pm \\frac{3}{8}, \\pm \\frac{1}{4})$，对应最值为 $\\pm 1$",
      "由椭圆曲线连通性与有界闭集连续性得出取值范围为 $[-1, 1]$"
    ],
    "keyPoints": [
      "条件极值与拉格朗日乘数法",
      "二次型配方放缩法"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "条件极值"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T12】曲线 $\\begin{cases} x = \\cos^3 t, \\\\ y = \\sin^3 t \\end{cases}$ 所围成的平面图形绕直线 $y = 1$ 旋转所得旋转体的体积为 ______。",
    "correctAnswer": "$\\frac{3\\pi^2}{4}$",
    "explanation": "**方法一（古尔丁第二定理 / Pappus-Guldinus 定理秒杀）**：\n星形线 $x = \\cos^3 t, y = \\sin^3 t$ 所围平面图形关于坐标轴及原点严格对称：\n1. 其面积（对称 4 倍第一象限面积）：\n   $$S = 4 \\int_0^1 y\\,dx = 4 \\int_{\\pi/2}^0 \\sin^3 t (-3\\cos^2 t\\sin t)\\,dt = 12 \\int_0^{\\pi/2} \\sin^4 t\\cos^2 t\\,dt$$\n   由华里士（Wallis）或 Beta 函数：$S = 12 \\cdot \\frac{3\\cdot 1 \\cdot 1}{6\\cdot 4\\cdot 2}\\cdot \\frac{\\pi}{2} = \\frac{3\\pi}{8}$。\n2. 由对称性知图形形心（质心）位于原点 $(0, 0)$，它到旋转轴直线 $y = 1$ 的距离 $d = 1$（且图形整体位于 $y \\le 1$ 一侧，无自交重叠）。\n3. 由古尔丁定理，旋转体体积 $V = 2\\pi d \\cdot S = 2\\pi \\cdot 1 \\cdot \\frac{3\\pi}{8} = \\frac{3\\pi^2}{4}$。\n\n**方法二（柱壳或截面直接积分验证）**：\n对每一横坐标 $x \\in [-1, 1]$，上边界 $y_+(x) = (1-x^{2/3})^{3/2}$，下边界 $y_-(x) = -y_+(x)$，绕 $y=1$ 旋转截面积为圆环：\n$$V = \\pi \\int_{-1}^1 \\left[(1 - y_-(x))^2 - (1 - y_+(x))^2\\right]\\,dx = \\pi \\int_{-1}^1 4 y_+(x)\\,dx = 2\\pi \\cdot S = \\frac{3\\pi^2}{4}$$",
    "steps": [
      "利用参数积分（Wallis公式）求得星形线封闭图形面积 $S = \\frac{3\\pi}{8}$",
      "由区域关于原点对称确定形心在 $(0,0)$，到轴 $y=1$ 距离为 $1$",
      "由旋转体体积公式（或古尔丁定理 $V = 2\\pi d S$）算出 $V = \\frac{3\\pi^2}{4}$"
    ],
    "keyPoints": [
      "星形线参数方程面积",
      "绕非坐标轴直线旋转体体积",
      "古尔丁定理"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "旋转体体积"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T13】设曲线 $L$ 为 $z = x^2 + y^2$ 与 $x^2 + y^2 + z^2 = 6$ 的交线，从 $z$ 轴正向向负向看是逆时针方向，则 $I = \\oint_L x^2 y\\,dx + y^2 z\\,dy + z^2 x\\,dz =$ ______。",
    "correctAnswer": "$-\\pi$",
    "explanation": "先求交线所在平面：\n联立 $x^2 + y^2 = z$ 与 $x^2 + y^2 + z^2 = 6$ 得 $z^2 + z - 6 = 0 \\implies (z+3)(z-2) = 0$。因 $z = x^2+y^2 \\ge 0$，故交线在平面 $z = 2$ 上，为一个以 $(0, 0, 2)$ 为圆心、半径 $R = \\sqrt{2}$ 的水平圆周！\n1. 因为在整条曲线 $L$ 上恒有 $z = 2$，所以 $dz = 0$，最后一项 $\\oint_L z^2 x\\,dz = 0$！\n2. 从而直接退化为平面闭曲线 $C: x^2 + y^2 = 2$（位于 $z=2$ 平面上，正向逆时针）的第二类曲线积分：\n   $$I = \\oint_C x^2 y\\,dx + 2 y^2\\,dy$$\n3. 利用格林公式（或 $\\oint_C 2y^2\\,dy = 0$），令 $P = x^2 y, Q = 2y^2$：\n   $$I = \\iint_{x^2+y^2 \\le 2} \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\,dxdy = \\iint_{x^2+y^2 \\le 2} (0 - x^2)\\,dxdy$$\n4. 由极坐标（或圆域对称性 $\\iint x^2 = \\frac{1}{2}\\iint(x^2+y^2)$）：\n   $$I = -\\frac{1}{2}\\int_0^{2\\pi} d\\theta \\int_0^{\\sqrt{2}} r^3\\,dr = -\\pi \\left[\\frac{r^4}{4}\\right]_0^{\\sqrt{2}} = -\\pi \\cdot \\frac{4}{4} = -\\pi$$",
    "steps": [
      "联立两曲面方程求出交线位于水平平面 $z = 2$ 上，为圆周 $x^2+y^2=2$ 且 $dz=0$",
      "代入 $z=2, dz=0$ 将空间曲线积分降维为平面曲线积分 $\\oint_C x^2 y\\,dx + 2y^2\\,dy$",
      "运用格林公式与极坐标算得 $I = -\\iint_{x^2+y^2\\le 2} x^2 dxdy = -\\pi$"
    ],
    "keyPoints": [
      "空间交线降维平面格林公式",
      "斯托克斯公式",
      "对称性与极坐标积分"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "曲线积分"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T14】设函数 $F(u, v)$ 可微，$z = z(x, y)$ 由方程 $F\\left(x + \\frac{z}{y}, y + \\frac{z}{x}\\right) = 0$ 确定，则 $x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} =$ ______。",
    "correctAnswer": "$z - xy$",
    "explanation": "令 $u = x + \\frac{z}{y}$，$v = y + \\frac{z}{x}$，用隐函数求导法则（或直接全微分保持对称性！）—— **全微分法极其简洁**：\n对 $F(u, v) = 0$ 两端求全微分得 $F_u du + F_v dv = 0$，或先求两偏导：\n对 $x$ 求偏导：\n$$F_u\\left(1 + \\frac{z_x}{y}\\right) + F_v\\left(-\\frac{z}{x^2} + \\frac{z_x}{x}\\right) = 0$$\n对 $y$ 求偏导：\n$$F_u\\left(-\\frac{z}{y^2} + \\frac{z_y}{y}\\right) + F_v\\left(1 + \\frac{z_y}{x}\\right) = 0$$\n将第一式乘 $x$ 与第二式乘 $y$ 相加，设 $K = x z_x + y z_y$：\n- $F_u$ 的系数：$x + \\frac{x z_x}{y} - \\frac{z}{y} + z_y = \\frac{1}{y}(x z_x + y z_y + xy - z) = \\frac{K - (z - xy)}{y}$\n- $F_v$ 的系数：$-\\frac{z}{x} + z_x + y + \\frac{y z_y}{x} = \\frac{1}{x}(x z_x + y z_y + xy - z) = \\frac{K - (z - xy)}{x}$\n\n因此：\n$$\\left(\\frac{F_u}{y} + \\frac{F_v}{x}\\right) \\left[x z_x + y z_y - (z - xy)\\right] = 0$$\n若 $x F_u + y F_v \\ne 0$，立即得 $x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} = z - xy$！\n\n（**检验特例秒杀验证**）：任取符合隐函数存在的简单 $F(u, v) = u - v = 0 \\implies x + \\frac{z}{y} = y + \\frac{z}{x} \\implies z\\left(\\frac{1}{y}-\\frac{1}{x}\\right) = y - x \\implies z = xy$（或 $u+v=0 \\implies z = -xy$）。对于 $z = xy$：$x z_x + y z_y = 2xy \\ne 0$？注意 $u=v \\implies z(x-y)/(xy) = y-x \\implies z = -xy$！此时 $x z_x + y z_y = -2xy = z - xy$，吻合！）",
    "steps": [
      "记中间变量 $u = x + \\frac{z}{y}, v = y + \\frac{z}{x}$，用隐函数求偏导公式分别对 $x, y$ 求偏导",
      "将两式分别乘以 $x$ 和 $y$ 后相加，合并提出公因子 $[x z_x + y z_y - (z - xy)]$",
      "消去偏导因子得出结果 $z - xy$"
    ],
    "keyPoints": [
      "抽象复合隐函数偏导数",
      "偏微分方程组合消元技巧"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "多元隐函数求导"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T17】(本题满分 10 分) 设 $f(x)$ 为连续函数，$\\lim_{x\\to 0}\\frac{xf(x) - \\ln(1+x)}{x^2} = 1$，当 $x \\to 0$ 时，$\\int_0^x 2t f(x-t)\\,dt - x^2$ 与 $a x^n (a \\ne 0)$ 为等价无穷小，求 $f'(0)$ 及 $a$ 与 $n$ 的值。",
    "correctAnswer": "$f'(0) = \\frac{1}{2},\\ a = \\frac{1}{6},\\ n = 3$",
    "explanation": "【标准步骤与踩分点解析】：\n**第一步：求 $f(0)$ 与 $f'(0)$（4 分）**\n由分母 $x^2 \\to 0$ 且极限存在，分子必趋于 $0$（显然 $0\\cdot f(0) - \\ln 1 = 0$）。进一步，观察分子泰勒/导数形式：\n$$\\lim_{x\\to 0}\\frac{xf(x) - \\ln(1+x)}{x^2} = \\lim_{x\\to 0}\\left[\\frac{f(x) - 1}{x} + \\frac{x - \\ln(1+x)}{x^2}\\right] = 1$$\n因为 $\\lim_{x\\to 0}\\frac{x - \\ln(1+x)}{x^2} = \\lim_{x\\to 0}\\frac{\\frac{1}{2}x^2 + o(x^2)}{x^2} = \\frac{1}{2}$ 存在，所以极限 $\\lim_{x\\to 0}\\frac{f(x) - 1}{x}$ 必然存在且等于：\n$$\\lim_{x\\to 0}\\frac{f(x) - 1}{x} = 1 - \\frac{1}{2} = \\frac{1}{2}$$\n由此立得 $\\lim_{x\\to 0} f(x) = 1$；又因 $f(x)$ 连续，故 **$f(0) = 1$**，且按照导数定义：\n$$f'(0) = \\lim_{x\\to 0}\\frac{f(x) - f(0)}{x - 0} = \\frac{1}{2}$$\n\n**第二步：计算变上限积分并确定等价无穷小（6 分）**\n设 $G(x) = \\int_0^x 2t f(x - t)\\,dt - x^2$。先做换元 $u = x - t$，把变限中的 $x$ 从被积函数中剥离出来：\n$$\\int_0^x 2t f(x - t)\\,dt = \\int_0^x 2(x - u) f(u)\\,du = 2x\\int_0^x f(u)\\,du - 2\\int_0^x u f(u)\\,du$$\n从而 $G(x)$ 可导（$f$ 连续），且一阶导数为：\n$$G'(x) = 2\\int_0^x f(u)\\,du + 2x f(x) - 2x f(x) - 2x = 2\\left(\\int_0^x f(u)\\,du - x\\right)$$\n再求二阶导数（因 $f$ 连续，右侧变上限积分可导）：\n$$G''(x) = 2(f(x) - 1)$$\n因 $G(0) = 0, G'(0) = 0$，且已知 $f'(0) = \\frac{1}{2}$，考察极限 $\\lim_{x\\to 0}\\frac{G(x)}{x^3}$，连续使用洛必达法则两次（注意：第三次不用洛必达！因为仅知 $f'(0)$ 存在，未必在去心邻域二阶可导）：\n$$\\lim_{x\\to 0}\\frac{G(x)}{x^3} = \\lim_{x\\to 0}\\frac{G'(x)}{3x^2} = \\lim_{x\\to 0}\\frac{2(f(x) - 1)}{6x} = \\frac{1}{3}f'(0) = \\frac{1}{3} \\times \\frac{1}{2} = \\frac{1}{6}$$\n由此得 $G(x) \\sim \\frac{1}{6}x^3$ $(x\\to 0)$，故 **$a = \\frac{1}{6},\\ n = 3$**。",
    "steps": [
      "【踩分点 1 (4分)】：将所给极限拆项为 $\\frac{f(x)-1}{x} + \\frac{x-\\ln(1+x)}{x^2}$，结合 $f$ 连续求得 $f(0)=1$ 与 $f'(0)=\\frac{1}{2}$",
      "【踩分点 2 (3分)】：令 $u=x-t$ 拆开含参变限积分，计算一阶、二阶导数 $G'(x)=2\\int_0^x(f(u)-1)du$，$G''(x)=2(f(x)-1)$",
      "【踩分点 3 (3分)】：洛必达两次并用导数定义算出 $\\lim_{x\\to 0}\\frac{G(x)}{x^3} = \\frac{1}{3}f'(0) = \\frac{1}{6}$，得出 $a=\\frac{1}{6}, n=3$"
    ],
    "keyPoints": [
      "导数定义与连续性",
      "变上限积分换元求导",
      "洛必达法则适用边界(勿超用未知高阶导)"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "微积分综合",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T18】(本题满分 12 分) 设 $D = \\{(x, y) \\mid x^2 + (y - 1)^2 \\le 1, (x - 1)^2 + y^2 \\le 1\\}$，计算 $I = \\iint_D (2x^2 - y^2)\\,dxdy$。",
    "correctAnswer": "$\\frac{3\\pi}{8} - 1$",
    "explanation": "【标准步骤与踩分点解析】：\n**第一步：利用区域关于直线 $y = x$ 的轮换对称性化简被积函数（4 分）**\n区域 $D$ 是两个半径为 $1$ 的圆盘 $x^2 + (y-1)^2 \\le 1$ 与 $(x-1)^2 + y^2 \\le 1$ 的公共部分（第一象限内关于直线 $y = x$ 对称的“橄榄叶”形区域）。\n由轮换对称性，$\\iint_D x^2\\,dxdy = \\iint_D y^2\\,dxdy$。因此：\n$$I = \\iint_D (2x^2 - y^2)\\,dxdy = \\iint_D x^2\\,dxdy = \\frac{1}{2}\\iint_D (x^2 + y^2)\\,dxdy$$\n\n**第二步：转换极坐标确定上下限（4 分）**\n两边界圆的极坐标方程分别为：\n- $x^2 + (y-1)^2 = 1 \\iff r = 2\\sin\\theta$\n- $(x-1)^2 + y^2 = 1 \\iff r = 2\\cos\\theta$\n两圆交点为 $(0,0)$ 和 $(1,1)$，对应的角为 $\\theta = \\frac{\\pi}{4}$。关于角平分线 $\\theta = \\frac{\\pi}{4}$ 对称：当 $0 \\le \\theta \\le \\frac{\\pi}{4}$ 时，$\\sin\\theta \\le \\cos\\theta$，区域由 $0 \\le r \\le 2\\sin\\theta$ 围成！\n由关于 $\\theta = \\frac{\\pi}{4}$ 的对称性，化为两倍积分：\n$$I = \\frac{1}{2} \\cdot 2 \\int_0^{\\pi/4} d\\theta \\int_0^{2\\sin\\theta} r^2 \\cdot r\\,dr = \\int_0^{\\pi/4} d\\theta \\int_0^{2\\sin\\theta} r^3\\,dr$$\n\n**第三步：完成积分计算（4 分）**\n内层积分得 $\\left[\\frac{r^4}{4}\\right]_0^{2\\sin\\theta} = 4\\sin^4\\theta$，故：\n$$I = 4 \\int_0^{\\pi/4} \\sin^4\\theta\\,d\\theta = \\int_0^{\\pi/4} (1 - \\cos 2\\theta)^2\\,d\\theta = \\int_0^{\\pi/4} \\left(1 - 2\\cos 2\\theta + \\cos^2 2\\theta\\right)\\,d\\theta$$\n使用倍角公式 $\\cos^2 2\\theta = \\frac{1 + \\cos 4\\theta}{2}$：\n$$I = \\int_0^{\\pi/4} \\left(\\frac{3}{2} - 2\\cos 2\\theta + \\frac{1}{2}\\cos 4\\theta\\right)\\,d\\theta = \\left[\\frac{3}{2}\\theta - \\sin 2\\theta + \\frac{1}{8}\\sin 4\\theta\\right]_0^{\\pi/4} = \\frac{3\\pi}{8} - 1 + 0 = \\frac{3\\pi}{8} - 1$$",
    "steps": [
      "【踩分点 1 (4分)】：识别 $D$ 关于直线 $y=x$ 对称，化简被积函数为 $I = \\frac{1}{2}\\iint_D (x^2+y^2)dxdy$",
      "【踩分点 2 (4分)】：写出两圆极坐标方程 $r=2\\sin\\theta$ 与 $r=2\\cos\\theta$，将积分化为 $\\int_0^{\\pi/4} d\\theta \\int_0^{2\\sin\\theta} r^3 dr$",
      "【踩分点 3 (4分)】：逐次降幂（倍角公式）计算 $4\\int_0^{\\pi/4}\\sin^4\\theta\\,d\\theta$，求得结果 $\\frac{3\\pi}{8} - 1$"
    ],
    "keyPoints": [
      "二重积分轮换对称性",
      "双圆交集极坐标划域",
      "三角函数高次幂降幂积分"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "二重积分",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T19】(本题满分 12 分) 设数列 $\\{a_n\\}$ 满足 $a_0 = 2$，当 $n \\ge 1$ 时，$a_n = \\frac{a_{n-1}}{n} + \\frac{n - 1}{n}$。\n(I) 证明：$\\lim_{n\\to\\infty} a_n$ 存在，并求其值；\n(II) 求 $\\sum_{n=0}^\\infty a_n x^n$ 在收敛区间内的和函数 $S(x)$，并求 $a_n$。",
    "correctAnswer": "(I) $\\lim_{n\\to\\infty} a_n = 1$；(II) $S(x) = \\frac{1}{1-x} + e^x\\ (-1 < x < 1)$，$a_n = 1 + \\frac{1}{n!}$",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 证明数列极限存在并求值（5 分）**\n将递推式改写并作差减 $1$：\n$$a_n - 1 = \\frac{a_{n-1}}{n} + \\frac{n-1}{n} - 1 = \\frac{a_{n-1} - 1}{n} \\quad (n \\ge 1)$$\n1. 因 $a_0 - 1 = 2 - 1 = 1 > 0$，由数学归纳法可知对所有 $n \\ge 0$ 恒有 $a_n > 1$（有下界）。\n2. 当 $n \\ge 2$ 时，由 $a_n - 1 = \\frac{a_{n-1}-1}{n} < a_{n-1} - 1$，得 $a_n < a_{n-1}$（也可验证 $a_1 = 2 = a_0$，$a_2 = \\frac{3}{2} < a_1$，从 $n \\ge 1$ 起严格单调递减！）。\n3. 由单调有界准则，极限 $\\lim_{n\\to\\infty} a_n = A$ 存在。在 $a_n - 1 = \\frac{a_{n-1}-1}{n}$ 中令 $n\\to\\infty$，或使用递推直接放缩 $0 < a_n - 1 = \\frac{1}{n!} \\to 0$，立得 $\\lim_{n\\to\\infty} a_n = 1$。\n\n**(II) 求收敛区间、和函数 $S(x)$ 及通项 $a_n$（7 分）**\n1. **收敛半径与区间**：由 $\\lim_{n\\to\\infty} a_n = 1$（且 $a_n > 1$），用根值或比值法 $\\lim_{n\\to\\infty}\\frac{a_{n+1}}{a_n} = 1 \\implies R = 1$，故收敛区间为 $(-1, 1)$。\n2. **建立微分方程求 $S(x)$**：在 $x \\in (-1, 1)$ 内，由递推关系 $n a_n = a_{n-1} + n - 1$ $(n \\ge 1)$，两端同乘 $x^{n-1}$ 并对 $n=1$ 到 $\\infty$ 求和：\n   $$\\sum_{n=1}^\\infty n a_n x^{n-1} = \\sum_{n=1}^\\infty a_{n-1} x^{n-1} + \\sum_{n=1}^\\infty (n - 1) x^{n-1}$$\n   逐项求导知左边为 $S'(x)$；右边第一项恰好为 $S(x)$；右边第二项 $\\sum_{n=1}^\\infty (n-1)x^{n-1} = \\sum_{k=1}^\\infty k x^k = x \\left(\\sum_{k=0}^\\infty x^k\\right)' = x\\left(\\frac{1}{1-x}\\right)' = \\frac{x}{(1-x)^2}$。\n   于是 $S(x)$ 满足一阶线性微分方程：\n   $$S'(x) - S(x) = \\frac{x}{(1-x)^2}, \\qquad S(0) = a_0 = 2$$\n   求通解（使用积分因子 $e^{-x}$）：\n   $$\\left(S(x) e^{-x}\\right)' = \\frac{x e^{-x}}{(1-x)^2} = e^{-x}\\left(\\frac{1}{(1-x)^2} - \\frac{1}{1-x}\\right) = \\left(\\frac{e^{-x}}{1-x}\\right)'$$\n   两边积分：\n   $$S(x) e^{-x} = \\frac{e^{-x}}{1-x} + C \\implies S(x) = \\frac{1}{1-x} + C e^x$$\n   代入初值 $S(0) = 2$ 得 $1 + C = 2 \\implies C = 1$。故：\n   $$S(x) = \\frac{1}{1-x} + e^x \\quad (-1 < x < 1)$$\n3. **展开求通项 $a_n$**：在 $(-1, 1)$ 内利用泰勒级数：\n   $$S(x) = \\sum_{n=0}^\\infty x^n + \\sum_{n=0}^\\infty \\frac{x^n}{n!} = \\sum_{n=0}^\\infty \\left(1 + \\frac{1}{n!}\\right) x^n$$\n   由幂级数展开唯一性，得通项 $a_n = 1 + \\frac{1}{n!}$ $(n = 0, 1, 2, \\dots)$（也与 (I) 中 $a_n - 1 = \\frac{1}{n!}$ 完全印证）。",
    "steps": [
      "【踩分点 1 (5分)】：变形为 $a_n - 1 = \\frac{a_{n-1}-1}{n}$，证明单调有界得出极限 $\\lim_{n\\to\\infty} a_n = 1$",
      "【踩分点 2 (4分)】：求收敛半径 $R=1$，乘 $x^{n-1}$ 求和化为一阶线性微分方程 $S'(x)-S(x)=\\frac{x}{(1-x)^2}$",
      "【踩分点 3 (3分)】：解初值问题得 $S(x) = \\frac{1}{1-x} + e^x$，再由展开唯一性求出 $a_n = 1 + \\frac{1}{n!}$"
    ],
    "keyPoints": [
      "数列递推与单调有界准则",
      "幂级数求和化微分方程",
      "幂级数展开唯一性求通项"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "无穷级数与微分方程",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s5-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T20】(本题满分 12 分) 设 $f(x)$ 在 $[a, b]$ 上二阶可导，$M = \\max_{x\\in[a, b]} \\{|f''(x)|\\}$。证明：对任意 $x \\in (a, b)$，均有\n$$\\left|\\frac{f(x) - f(a)}{x - a} - \\frac{f(b) - f(a)}{b - a}\\right| \\le \\frac{M}{2}(b - x).$$",
    "correctAnswer": "证明完毕（可用线性参数积分表示差商 + 拉格朗日中值定理三步严谨证得）",
    "explanation": "【标准证明与踩分点解析】：\n**方法一（差商的参数积分表示法 —— 最简且严格无需假定 $f''$ 连续，满分 12 分）**：\n1. 【构造等价积分表示（4 分）】：\n   因为 $f(x)$ 在 $[a, b]$ 上二阶可导，故一阶导数 $f'(t)$ 在 $[a, b]$ 上**连续**。利用牛顿-莱布尼茨公式并做线性换元 $u = a + (x - a)t$（及 $v = a + (b - a)t$）：\n   $$\\frac{f(x) - f(a)}{x - a} = \\frac{1}{x - a}\\int_a^x f'(u)\\,du = \\int_0^1 f'(a + (x - a)t)\\,dt$$\n   $$\\frac{f(b) - f(a)}{b - a} = \\frac{1}{b - a}\\int_a^b f'(v)\\,dv = \\int_0^1 f'(a + (b - a)t)\\,dt$$\n2. 【合并作差并使用积分绝对值不等式（4 分）】：\n   $$\\left|\\frac{f(x) - f(a)}{x - a} - \\frac{f(b) - f(a)}{b - a}\\right| = \\left|\\int_0^1 \\left[f'(a + (x - a)t) - f'(a + (b - a)t)\\right]\\,dt\\right|$$\n   $$\\le \\int_0^1 \\left|f'(a + (x - a)t) - f'(a + (b - a)t)\\right|\\,dt$$\n3. 【套用拉格朗日中值定理并放缩估值（4 分）】：\n   由于 $f'(t)$ 在 $[a, b]$ 上连续可导，对任意固定的 $t \\in (0, 1]$，在区间 $[a + (x-a)t,\\, a + (b-a)t] \\subset [a, b]$ 上对 $f'$ 应用拉格朗日中值定理，必存在 $\\xi_t \\in (a + (x-a)t, a + (b-a)t) \\subset (a, b)$，使得：\n   $$\\left|f'(a + (x - a)t) - f'(a + (b - a)t)\\right| = |f''(\\xi_t)| \\cdot |(b - a)t - (x - a)t| \\le M (b - x) t$$\n   （当 $t = 0$ 时不等式两端均为 $0$，同样成立。）\n   对 $t \\in [0, 1]$ 积分即得：\n   $$\\left|\\frac{f(x) - f(a)}{x - a} - \\frac{f(b) - f(a)}{b - a}\\right| \\le \\int_0^1 M (b - x) t\\,dt = M(b - x)\\left[\\frac{t^2}{2}\\right]_0^1 = \\frac{M}{2}(b - x)$$\n   命题得证！\n\n**方法二（构造辅助函数用二次柯西/泰勒展开法，可互为参考）**：\n对恒等式左端通分：\n$\\frac{f(x)-f(a)}{x-a} - \\frac{f(b)-f(a)}{b-a} = \\frac{(b-a)[f(x)-f(a)] - (x-a)[f(b)-f(a)]}{(x-a)(b-a)}$。\n将 $f(a)$ 与 $f(b)$ 都在固定点 $x$ 处作带拉格朗日余项的一阶泰勒展开（同样有界但放缩系数容易多出 $(x-a)/(b-a)$，不如先做积分再放缩得干净直接；或以 $\\varphi(t) = f(t) - f(a) - \\frac{f(b)-f(a)}{b-a}(t-a)$ 对两端作牛顿插值误差定理：$\\varphi(x) = \\frac{f''(\\xi)}{2}(x-a)(x-b)$？注意，标准二次拉格朗日插值余项为 $|f(x)-P_1(x)| = \\frac{|f''(\\xi)|}{2}(x-a)(b-x) \\le \\frac{M}{2}(x-a)(b-x)$，再除以 $(x-a)$ 立刻得证！！）。\n**【特佳秒杀附注·插值余项/Rolle证明（仅需四行）】**：\n令 $\\Phi(t) = f(t) - f(a) - \\frac{f(b)-f(a)}{b-a}(t - a) - K(t - a)(t - b)$，其中固定 $x \\in (a, b)$ 并取 $K$ 使 $\\Phi(x) = 0$（即 $K = \\frac{\\frac{f(x)-f(a)}{x-a}-\\frac{f(b)-f(a)}{b-a}}{x - b}$）。因为 $\\Phi(a) = \\Phi(x) = \\Phi(b) = 0$，由罗尔定理对 $[a, x]$ 和 $[x, b]$ 分别作用两次，必存在 $\\xi \\in (a, b)$ 使 $\\Phi''(\\xi) = 0 \\implies f''(\\xi) - 2K = 0 \\implies |K| = \\frac{|f''(\\xi)|}{2} \\le \\frac{M}{2}$，即证原不等式！",
    "steps": [
      "【踩分点 1 (4分)】：记差值比构造三点零点辅助函数 $\\Phi(t) = f(t)-f(a)-\\frac{f(b)-f(a)}{b-a}(t-a) - K(t-a)(t-b)$（或采用微积分基本定理转参数积分）",
      "【踩分点 2 (4分)】：验证 $\\Phi(a)=\\Phi(x)=\\Phi(b)=0$，连续在 $[a,x], [x,b]$ 及驻点之间应用两次罗尔中值定理得 $\\Phi''(\\xi)=0$",
      "【踩分点 3 (4分)】：解得 $K = \\frac{f''(\\xi)}{2}$ 并代入 $|f''(\\xi)| \\le M$，移项即证明不等式成立"
    ],
    "keyPoints": [
      "高阶罗尔中值定理构造",
      "牛顿插值余项证明思想",
      "积分中值放缩法"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第5套",
      "高数",
      "中值定理证明",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q01",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T1】设 $f(x)$ 可导，$f(x) > 0$，当 $0 < a < x < b$ 时，有 $f(x) < x f'(x)$，则（ ）。",
    "correctAnswer": "C",
    "explanation": "注意题干不等式为 $f(x) < x f'(x)$，并非直接写成 $f(x) + x f'(x)$，需仔细辨析！\n1. 若考察函数 $g(x) = \\frac{f(x)}{x}$：其导数 $g'(x) = \\frac{x f'(x) - f(x)}{x^2} > 0$，故 $\\frac{f(x)}{x}$ 在 $(a, b)$ 上严格**单调递增**！\n   即对 $0 < a < x < b$，应有 $\\frac{f(a)}{a} < \\frac{f(x)}{x} < \\frac{f(b)}{b} \\iff b f(a) < a f(b)$，排除 A！\n2. 再利用正值函数单调递增组合：因为 $g(x) = \\frac{f(x)}{x}$ 单调递增且恒正，所以 $f(x) = x \\cdot \\frac{f(x)}{x}$ 也单调递增（其实直接由 $x f'(x) > f(x) > 0$ 且 $x > 0$ 就立知 $f'(x) > 0$，$f(x)$ 自身就严格单调递增！）。\n3. 于是对 $0 < a < x < b$：\n   - 既有 $0 < a < x$，又有 $0 < f(a) < f(x)$，两正不等式相乘必得：\n     $$a f(a) < x f(x)$$\n     **C 严格成立**！\n4. 验证排除 B、D（取特例 $f(x) = x^2$ 显然满足 $x(2x) = 2x^2 > x^2$ 且 $f>0$）：B 项为 $ab x^2 > x^2 b^2 \\iff a > b$ 矛盾；D 项为 $ab x^2 < x^2 a^2 \\iff b < a$ 矛盾。选 C。",
    "steps": [
      "由 $\\left(\\frac{f(x)}{x}\\right)' = \\frac{xf'(x)-f(x)}{x^2} > 0$ 得出 $\\frac{f(x)}{x}$ 单增从而否定 A（实为 $bf(a)<af(b)$）",
      "由 $x>0, f(x)>0, xf'(x)>f(x)$ 立得 $f'(x)>0$，故 $f(x)$ 自身也严格单增",
      "结合 $0<a<x$ 与 $0<f(a)<f(x)$ 相乘得 $af(a) < xf(x)$，或取特例 $f(x)=x^2$ 秒杀排除 A、B、D"
    ],
    "keyPoints": [
      "构造函数判单调性",
      "导数不等式推单调性",
      "特值法秒杀不等式选择题"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "导数单调性"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $b f(a) > a f(b)$",
      "B. $a b f(x) > x^2 f(b)$",
      "C. $a f(a) < x f(x)$",
      "D. $a b f(x) < x^2 f(a)$"
    ]
  },
  {
    "id": "math-calc-lilin6-s6-q02",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T2】已知函数 $f(x, y) = \\begin{cases} (x^2 + y^2)\\sin\\frac{1}{x^2 + y^2}, & x^2 + y^2 \\ne 0, \\\\ 0, & x^2 + y^2 = 0, \\end{cases}$ 则在点 $(0, 0)$ 处（ ）。",
    "correctAnswer": "B",
    "explanation": "这是考研数学经典的**“可微但偏导数不连续”**反例！\n1. **求 $(0,0)$ 处偏导数**：\n   $$f'_x(0, 0) = \\lim_{x\\to 0}\\frac{f(x, 0) - f(0, 0)}{x} = \\lim_{x\\to 0} x\\sin\\frac{1}{x^2} = 0$$\n   同理 $f'_y(0, 0) = 0$。\n2. **检验在 $(0,0)$ 处是否可微**：\n   $$\\lim_{(x,y)\\to(0,0)} \\frac{\\Delta z - f'_x(0,0)x - f'_y(0,0)y}{\\sqrt{x^2+y^2}} = \\lim_{(x,y)\\to(0,0)} \\sqrt{x^2+y^2}\\sin\\frac{1}{x^2+y^2} = 0$$\n   （无穷小乘以有界函数等于 $0$），因此 **$f(x, y)$ 在 $(0, 0)$ 处可微**！\n3. **检验 $\\frac{\\partial f}{\\partial x}$ 在 $(0,0)$ 处是否连续**：\n   当 $(x, y) \\ne (0, 0)$ 时：\n   $$\\frac{\\partial f}{\\partial x} = 2x\\sin\\frac{1}{x^2+y^2} - \\frac{2x}{x^2+y^2}\\cos\\frac{1}{x^2+y^2}$$\n   令点 $(x, 0)$ 沿 $x$ 轴趋于 $(0, 0)$ 时：第一项趋于 $0$，但第二项 $-\\frac{2}{x}\\cos\\frac{1}{x^2}$ 振荡趋于无穷（极限不存在）！故 $\\frac{\\partial f(x, y)}{\\partial x}$ 在 $(0, 0)$ 处**不连续**！\n选 B。",
    "steps": [
      "按定义算得原点偏导数 $f'_x(0,0)=f'_y(0,0)=0$",
      "计算 $\\frac{f(x,y)}{\\sqrt{x^2+y^2}} = \\sqrt{x^2+y^2}\\sin\\frac{1}{x^2+y^2} \\to 0$，证明可微",
      "写出非原点处偏导数含 $-\\frac{2x}{x^2+y^2}\\cos\\frac{1}{x^2+y^2}$，沿坐标轴趋于 0 振荡无界，知偏导不连续"
    ],
    "keyPoints": [
      "多元函数可微定义",
      "偏导数连续与可微的充分不必要关系"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "多元微分概念"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $\\frac{\\partial f(x, y)}{\\partial x}$ 连续，$f(x, y)$ 可微",
      "B. $\\frac{\\partial f(x, y)}{\\partial x}$ 不连续，$f(x, y)$ 可微",
      "C. $\\frac{\\partial f(x, y)}{\\partial x}$ 连续，$f(x, y)$ 不可微",
      "D. $\\frac{\\partial f(x, y)}{\\partial x}$ 不连续，$f(x, y)$ 不可微"
    ]
  },
  {
    "id": "math-calc-lilin6-s6-q03",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T3】设级数 $\\sum_{n=1}^\\infty (-1)^{n-1}\\frac{\\sqrt{n+1} - \\sqrt{n-1}}{n^{\\alpha - 1}}$ 绝对收敛，$\\sum_{n=1}^\\infty (-1)^n \\frac{1}{n^{2 - \\alpha}}$ 条件收敛，$\\alpha > 0$，则（ ）。",
    "correctAnswer": "B",
    "explanation": "分别分析两个级数收敛性的充要参数条件：\n1. **绝对收敛条件**：\n   分子有理化得：$\\sqrt{n+1} - \\sqrt{n-1} = \\frac{2}{\\sqrt{n+1} + \\sqrt{n-1}} \\sim \\frac{1}{n^{1/2}}$ $(n\\to\\infty)$。\n   因此加绝对值后的通项等价于：\n   $$\\left|(-1)^{n-1}\\frac{\\sqrt{n+1}-\\sqrt{n-1}}{n^{\\alpha-1}}\\right| \\sim \\frac{1}{n^{\\alpha - 1 + \\frac{1}{2}}} = \\frac{1}{n^{\\alpha - \\frac{1}{2}}}$$\n   由 $p$-级数审敛法，绝对收敛要求 $\\alpha - \\frac{1}{2} > 1 \\iff \\alpha > \\frac{3}{2}$。\n2. **条件收敛条件**：\n   对于交错 $p$-级数 $\\sum_{n=1}^\\infty (-1)^n \\frac{1}{n^{2-\\alpha}}$，条件收敛要求指数满足 $0 < 2 - \\alpha \\le 1 \\iff 1 \\le \\alpha < 2$（若 $2-\\alpha > 1$ 则绝对收敛，若 $2-\\alpha \\le 0$ 则通项不趋于 $0$ 发散）。\n3. **联立求交集**：$\\left(\\frac{3}{2}, +\\infty\\right) \\cap [1, 2) = \\left(\\frac{3}{2}, 2\\right)$。选 B。",
    "steps": [
      "分子有理化得到前级数绝对值通项阶数 $n^{-(\\alpha - 1/2)}$，推出 $\\alpha > \\frac{3}{2}$",
      "由交错 $p$-级数条件收敛准则 $0 < 2 - \\alpha \\le 1$ 推出 $1 \\le \\alpha < 2$",
      "取两范围交集得 $\\frac{3}{2} < \\alpha < 2$"
    ],
    "keyPoints": [
      "分子有理化与比较审敛法",
      "绝对收敛与条件收敛参数区间"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "无穷级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. $1 \\le \\alpha < 2$",
      "B. $\\frac{3}{2} < \\alpha < 2$",
      "C. $0 < \\alpha < 2$",
      "D. $0 < \\alpha < \\frac{3}{2}$"
    ]
  },
  {
    "id": "math-calc-lilin6-s6-q04",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T4】如图所示，$L$ 为从 $A$ 到 $B$ 的曲线段，曲线段的方程为 $y = f(x)$，函数 $f(x)$ 在区间 $[0, a]$ 上有连续的导数，则 $\\frac{1}{2}\\int_L -y\\,dx + x\\,dy =$（ ）。\n\n![第6套T4 曲线L与曲边三角形示意图](/images/lilin6/s6_q4.png)",
    "correctAnswer": "D",
    "explanation": "**方法一（添加辅助线段构造闭区域利用格林公式）**：\n添加直线段 $\\overrightarrow{BO}$（从 $B(0, f(0))$ 到 $O(0,0)$）和直线段 $\\overrightarrow{OA}$（从 $O(0,0)$ 到 $A(a, f(a))$），构成逆时针封闭曲线 $\\Gamma = L + \\overrightarrow{BO} + \\overrightarrow{OA}$，围成的图形恰好是**曲边三角形 $AOB$**！\n- 在直线段 $BO$ 上，$x = 0, dx = 0$，故 $\\int_{BO} -y\\,dx + x\\,dy = 0$；\n- 在直线段 $OA$ 上，过原点直线满足 $y = kx \\implies x\\,dy - y\\,dx = x(kdx) - (kx)dx = 0$，故 $\\int_{OA} -y\\,dx + x\\,dy = 0$！\n因此由格林公式：\n$$\\frac{1}{2}\\int_L -y\\,dx + x\\,dy = \\frac{1}{2}\\oint_\\Gamma (-y\\,dx + x\\,dy) = \\frac{1}{2}\\iint_{D_{AOB}} [1 - (-1)]\\,dxdy = \\iint_{D_{AOB}} 1\\,dxdy = \\text{曲边三角形 } AOB \\text{ 的面积}$$\n（也可记住微积分重要结论：**极坐标扇形面积微元 $dS = \\frac{1}{2}(x\\,dy - y\\,dx)$**，从矢量 $\\overrightarrow{OA}$ 逆时针扫过曲线 $L$ 到矢量 $\\overrightarrow{OB}$ 所扫出的正是曲边三角形 $AOB$ 的面积！）选 D。",
    "steps": [
      "补出过原点的直线段 $\\overrightarrow{BO}$ 和 $\\overrightarrow{OA}$，注意这两条线段上 $xdy - ydx \\equiv 0$",
      "构造闭曲线对曲边三角形 $AOB$ 使用格林公式，算得积分值刚好等于区域 $AOB$ 的面积"
    ],
    "keyPoints": [
      "格林公式面积计算",
      "过原点直线段 $xdy-ydx=0$ 性质"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "曲线积分与格林公式"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md",
    "options": [
      "A. 曲边梯形 $ABOD$ 的面积",
      "B. 梯形 $ABOD$ 的面积",
      "C. 曲边三角形 $ACB$ 的面积",
      "D. 曲边三角形 $AOB$ 的面积"
    ]
  },
  {
    "id": "math-calc-lilin6-s6-q11",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "无穷级数",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T11】设 $f(x) = \\int_0^{\\frac{x^2}{2}} \\frac{\\ln(1+t)}{t}\\,dt$，则 $f^{(2n)}(0) =$ ______。",
    "correctAnswer": "$\\frac{(-1)^{n-1}(2n)!}{2^n n^2}$",
    "explanation": "利用幂级数逐项积分求原函数展开式，直接提取 $x^{2n}$ 系数：\n当 $|t| < 1$ 时，$\\frac{\\ln(1+t)}{t} = \\sum_{k=1}^\\infty \\frac{(-1)^{k-1}}{k}t^{k-1}$。\n逐项积分得（在 $|x| < \\sqrt{2}$ 内成立）：\n$$f(x) = \\int_0^{\\frac{x^2}{2}} \\left(\\sum_{k=1}^\\infty \\frac{(-1)^{k-1}}{k}t^{k-1}\\right)dt = \\sum_{k=1}^\\infty \\frac{(-1)^{k-1}}{k^2}\\left(\\frac{x^2}{2}\\right)^k = \\sum_{k=1}^\\infty \\frac{(-1)^{k-1}}{2^k k^2} x^{2k}$$\n对照麦克劳林级数公式 $f(x) = \\sum_{m=0}^\\infty \\frac{f^{(m)}(0)}{m!} x^m$，比较 $m = 2n$ 项（即 $k = n$）的系数：\n$$\\frac{f^{(2n)}(0)}{(2n)!} = \\frac{(-1)^{n-1}}{2^n n^2} \\implies f^{(2n)}(0) = \\frac{(-1)^{n-1}(2n)!}{2^n n^2}$$",
    "steps": [
      "写出 $\\frac{\\ln(1+t)}{t}$ 的麦克劳林级数并在 $[0, x^2/2]$ 上逐项积分",
      "整理 $f(x)$ 的偶次幂级数系数 $\\frac{(-1)^{n-1}}{2^n n^2}$",
      "乘以 $(2n)!$ 即得高阶导数值 $f^{(2n)}(0) = \\frac{(-1)^{n-1}(2n)!}{2^n n^2}$"
    ],
    "keyPoints": [
      "逐项积分求麦克劳林展开",
      "幂级数法求高阶导数"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "高阶导数与级数"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q12",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "微分中值定理与导数应用",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T12】设 $\\ln(1 + x) - a e^x + 1 \\le \\ln a$ 恒成立，则 $a$ 的取值范围为 ______。",
    "correctAnswer": "$[1, +\\infty)$",
    "explanation": "（注：由定义域知 $a > 0$ 且不等式须对定义域 $x \\in (-1, +\\infty)$ 恒成立！）\n**同构构造法（同构不等式秒杀！）**：\n把不等式中的对数与指数配凑成对称结构 $u + \\ln u$：\n原不等式 $\\iff \\ln(1+x) + 1 \\le a e^x + \\ln a$。\n两边同加 $x$：\n$$(1 + x) + \\ln(1 + x) \\le a e^x + \\ln(a e^x)$$\n令辅助函数 $g(u) = u + \\ln u$ $(u > 0)$。由于 $g'(u) = 1 + \\frac{1}{u} > 0$，$g(u)$ 在 $(0, +\\infty)$ 上**严格单调递增**！\n因此上述不等式对一切 $x > -1$ 恒成立，等价于：\n$$1 + x \\le a e^x \\iff a \\ge \\frac{1 + x}{e^x} \\quad (\\forall x > -1)$$\n求右端函数 $h(x) = (1+x)e^{-x}$ 的最大值：$h'(x) = -x e^{-x}$。当 $x \\in (-1, 0)$ 时 $h'(x) > 0$，当 $x \\in (0, +\\infty)$ 时 $h'(x) < 0$，故 $h(x)$ 在 $x = 0$ 处取得唯一全局最大值 $h(0) = 1$。\n因此充要条件为 $a \\ge 1$，即 $a \\in [1, +\\infty)$。",
    "steps": [
      "移项并对不等式两边同时加上 $x$，将超越不等式同构化为 $g(1+x) \\le g(ae^x)$，其中 $g(u)=u+\\ln u$",
      "利用 $g(u)$ 在 $(0,+\\infty)$ 上严格单调递增脱去外层函数，转化为 $a \\ge (1+x)e^{-x}$",
      "求函数 $h(x)=(1+x)e^{-x}$ 在 $(-1,+\\infty)$ 的最大值 $h(0)=1$，得出 $a \\in [1, +\\infty)$"
    ],
    "keyPoints": [
      "函数同构与单调性",
      "不等式恒成立求参数范围"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "恒成立与最值"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q13",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "一元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T13】$\\lim_{n\\to\\infty} \\frac{1 + \\frac{1}{\\sqrt{2}} + \\cdots + \\frac{1}{\\sqrt{n}}}{\\frac{1}{\\sqrt{n+1}} + \\frac{1}{\\sqrt{n+2}} + \\cdots + \\frac{1}{\\sqrt{n+3n}}} =$ ______。",
    "correctAnswer": "$1$",
    "explanation": "上下同除以 $\\sqrt{n}$ 转化为定积分定义（黎曼和）：\n- **分子**：\n  $$\\frac{1}{\\sqrt{n}}\\sum_{k=1}^n \\frac{1}{\\sqrt{k}} = \\frac{1}{n}\\sum_{k=1}^n \\frac{1}{\\sqrt{k/n}} \\xrightarrow{n\\to\\infty} \\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx = \\left[2\\sqrt{x}\\right]_0^1 = 2$$\n  （虽为广义瑕积分，由于被积函数 $x^{-1/2}$ 在 $(0,1]$ 上单调递减，达布下和与上和均收敛到广义积分值 $2$。）\n- **分母**：共 $3n$ 项求和，提出 $\\frac{1}{\\sqrt{n}}$：\n  $$\\frac{1}{\\sqrt{n}}\\sum_{k=1}^{3n} \\frac{1}{\\sqrt{n+k}} = \\frac{1}{n}\\sum_{k=1}^{3n} \\frac{1}{\\sqrt{1 + \\frac{k}{n}}} \\xrightarrow{n\\to\\infty} \\int_0^3 \\frac{1}{\\sqrt{1 + x}}\\,dx = \\left[2\\sqrt{1+x}\\right]_0^3 = 2(2 - 1) = 2$$\n因此原极限 $= \\frac{2}{2} = 1$！\n\n（**防错警示**）：切忌误将分母看成区间的 $\\int_1^3 \\frac{dx}{\\sqrt{1+x}}$ 而算错，分母和式从 $k=1$ 一直加到 $k=3n$，积分区间为 $[0, 3]$！）",
    "steps": [
      "分子分母同时除以 $\\sqrt{n}$，化成标准的黎曼和 $\\frac{1}{n}\\sum f(\\frac{k}{n})$ 形式",
      "分子极限为广义积分 $\\int_0^1 x^{-1/2}\\,dx = 2$，分母极限为定积分 $\\int_0^3 (1+x)^{-1/2}\\,dx = 2$",
      "两值相除得出精确极限 $1$"
    ],
    "keyPoints": [
      "定积分定义求极限(含广义积分)",
      "区间划分边界防错"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "定积分定义求极限"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q14",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T14】设 $u = u(x, y, z)$ 有二阶连续偏导数，则 $\\operatorname{rot}(\\operatorname{grad} u) =$ ______。",
    "correctAnswer": "$\\mathbf{0}$",
    "explanation": "（数一向量场基本概念考查：**梯度的旋度恒为零向量**，切记不要漏掉“向量”二字或写成标量 $0$！）\n已知梯度向量场 $\\operatorname{grad} u = \\left(\\frac{\\partial u}{\\partial x}, \\frac{\\partial u}{\\partial y}, \\frac{\\partial u}{\\partial z}\\right)$，求其旋度：\n$$\\operatorname{rot}(\\operatorname{grad} u) = \\begin{vmatrix} \\boldsymbol{i} & \\boldsymbol{j} & \\boldsymbol{k} \\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z} \\\\ u'_x & u'_y & u'_z \\end{vmatrix} = \\left(u''_{zy} - u''_{yz},\\ u''_{xz} - u''_{zx},\\ u''_{yx} - u''_{xy}\\right)$$\n因为 $u$ 具有二阶连续偏导数，所以混合偏导数与求导次序无关（克莱罗定理）：$u''_{xy} = u''_{yx}, u''_{yz} = u''_{zy}, u''_{xz} = u''_{zx}$，故各分量全为零，结果为零向量 $\\mathbf{0} = (0, 0, 0)$。",
    "steps": [
      "写出梯度 $\\operatorname{grad} u = (u'_x, u'_y, u'_z)$ 的旋度行列式展开式",
      "由二阶连续偏导数知混合偏导相等，三分量均相消得零向量 $\\mathbf{0}$"
    ],
    "keyPoints": [
      "梯度与旋度(场论初步)",
      "二阶混合偏导相等定理"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "场论"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q17",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T17】(本题满分 10 分) 设 $D_t = \\{(x, y) \\mid 0 \\le x \\le 2t, 0 \\le y \\le t, t > 0\\}$，$f(x, y)$ 在 $D_t$ 上有二阶连续偏导数，求 $F(t) = \\iint_{D_t} f''_{yx}(x, y)\\,dxdy$，并计算 $\\lim_{t\\to 0^+} \\frac{F(t)}{t}$。",
    "correctAnswer": "$F(t) = f(2t, t) - f(2t, 0) - f(0, t) + f(0, 0)$，$\\lim_{t\\to 0^+} \\frac{F(t)}{t} = 0$",
    "explanation": "【标准步骤与踩分点解析】：\n**第一步：化二重积分为累次积分求出 $F(t)$（5 分）**\n注意积分记号 $f''_{yx} = \\frac{\\partial}{\\partial x}\\left(\\frac{\\partial f}{\\partial y}\\right)$（先对 $y$ 求导，后对 $x$ 求导），故将先积 $x$ 的次序放在内层最省事（其实由于二阶连续偏导 $f''_{yx} = f''_{xy}$，任意次序都完全一样！）：\n$$F(t) = \\int_0^t dy \\int_0^{2t} \\frac{\\partial f'_y(x, y)}{\\partial x}\\,dx = \\int_0^t \\left[f'_y(2t, y) - f'_y(0, y)\\right]\\,dy$$\n再对 $y$ 运用牛顿-莱布尼茨公式：\n$$F(t) = \\left[f(2t, y) - f(0, y)\\right]_0^t = f(2t, t) - f(2t, 0) - f(0, t) + f(0, 0)$$\n\n**第二步：计算极限 $\\lim_{t\\to 0^+} \\frac{F(t)}{t}$（5 分）**\n由于 $f(x, y)$ 在 $(0,0)$ 邻域具有二阶连续偏导数，故在 $(0, 0)$ 处可微（甚至可用拉格朗日中值或直接微商）：\n将 $F(t)$ 按 $(0,0)$ 处泰勒展开（或仅用到一阶全增量）：\n- $f(2t, t) - f(0,0) = 2t f'_x(0,0) + t f'_y(0,0) + o(t)$\n- $f(2t, 0) - f(0,0) = 2t f'_x(0,0) + o(t)$\n- $f(0, t) - f(0,0) = t f'_y(0,0) + o(t)$\n（或者更直观：**二重积分均值定理**！因为 $f''_{yx}$ 在原点邻域连续且区域面积为 $2t^2$，所以 $F(t) = f''_{yx}(\\xi, \\eta)\\cdot 2t^2 \\implies \\lim_{t\\to 0^+}\\frac{F(t)}{t} = \\lim_{t\\to 0^+} 2t f''_{yx}(\\xi, \\eta) = 0$！）\n代入展开式相消：\n$$F(t) = \\left[f(2t, t) - f(0,0)\\right] - \\left[f(2t, 0) - f(0,0)\\right] - \\left[f(0, t) - f(0,0)\\right] = o(t)$$\n故：\n$$\\lim_{t\\to 0^+} \\frac{F(t)}{t} = \\lim_{t\\to 0^+} \\frac{o(t)}{t} = 0$$",
    "steps": [
      "【踩分点 1 (5分)】：化为累次积分两次使用牛顿-莱布尼茨公式得 $F(t) = f(2t, t) - f(2t, 0) - f(0, t) + f(0, 0)$",
      "【踩分点 2 (5分)】：利用二重积分中值定理 $F(t) = 2t^2 f''_{yx}(\\xi, \\eta)$（或一阶全微分展开消去线性项）算得 $\\lim_{t\\to 0^+}\\frac{F(t)}{t} = 0$"
    ],
    "keyPoints": [
      "矩形域混合偏导二重积分",
      "二重积分中值定理",
      "二元函数可微展开"
    ],
    "difficulty": "简单",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "二重积分",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q18",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数微分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T18】(本题满分 12 分) 设 $f(x, y) = x^2 + axy + by^2$ 在点 $P(2, 1)$ 处沿 $\\boldsymbol{l} = (0, 1)$ 的方向导数取得最大值 $2$。\n(I) 求 $a, b$ 的值；\n(II) 求原点 $O(0, 0)$ 到曲线 $f(x, y) = 1$ 上点的距离的最大值与最小值。",
    "correctAnswer": "(I) $a = -4, b = 5$；(II) 距离最大值为 $\\sqrt{2} + 1$（或写成 $\\sqrt{3+2\\sqrt{2}}$），最小值为 $\\sqrt{2} - 1$（或写成 $\\sqrt{3-2\\sqrt{2}}$）",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 求系数 $a, b$（5 分）**\n多元函数在某点沿**梯度方向**方向导数取得最大值，且该最大值等于梯度的模长！\n先求偏导并代入点 $P(2, 1)$：\n- $f'_x = 2x + ay \\implies f'_x(2, 1) = 4 + a$\n- $f'_y = ax + 2by \\implies f'_y(2, 1) = 2a + 2b$\n\n由于沿 $\\boldsymbol{l} = (0, 1)$ 方向取得最大值 $2$，因此梯度向量 $\\operatorname{grad} f(2, 1)$ 与单位向量 $(0, 1)$ 同向且模长为 $2$，即 $\\operatorname{grad} f(2, 1) = (0, 2)$：\n$$\\begin{cases} 4 + a = 0 \\\\ 2a + 2b = 2 \\end{cases} \\implies a = -4,\\ b = 5$$\n\n**(II) 求原点到曲线 $x^2 - 4xy + 5y^2 = 1$ 的距离最值（7 分）**\n1. **建立条件极值模型（拉格朗日乘数法 / 主轴旋转法）**：\n   设曲线上点 $(x, y)$ 到原点距离平方为 $d^2 = x^2 + y^2$，约束条件为 $x^2 - 4xy + 5y^2 = 1$（实对称阵 $\\boldsymbol{A} = \\begin{pmatrix} 1 & -2 \\\\ -2 & 5 \\end{pmatrix}$，其特征值满足 $\\lambda^2 - 6\\lambda + 1 = 0$，即正定椭圆！）。\n2. **解法 A（特征值瑞利商秒杀最值）**：\n   约束条件写成 $\\boldsymbol{X}^T \\boldsymbol{A} \\boldsymbol{X} = 1$，而目标是求 $d^2 = \\boldsymbol{X}^T \\boldsymbol{X}$ 的极值！由二次型瑞利商极值定理：\n   $$\\lambda_{\\min}(\\boldsymbol{A}) \\boldsymbol{X}^T\\boldsymbol{X} \\le \\boldsymbol{X}^T \\boldsymbol{A} \\boldsymbol{X} = 1 \\le \\lambda_{\\max}(\\boldsymbol{A}) \\boldsymbol{X}^T\\boldsymbol{X} \\implies \\frac{1}{\\lambda_{\\max}} \\le d^2 \\le \\frac{1}{\\lambda_{\\min}}$$\n   解特征方程 $\\lambda^2 - 6\\lambda + 1 = 0$ 得 $\\lambda_{1, 2} = 3 \\pm 2\\sqrt{2}$。\n   从而：\n   $$d_{\\max}^2 = \\frac{1}{3 - 2\\sqrt{2}} = 3 + 2\\sqrt{2} = (\\sqrt{2} + 1)^2 \\implies d_{\\max} = \\sqrt{2} + 1$$\n   $$d_{\\min}^2 = \\frac{1}{3 + 2\\sqrt{2}} = 3 - 2\\sqrt{2} = (\\sqrt{2} - 1)^2 \\implies d_{\\min} = \\sqrt{2} - 1$$\n3. **解法 B（常规拉格朗日乘数法推导得分点）**：\n   构造 $L(x, y, \\lambda) = x^2 + y^2 + \\lambda(x^2 - 4xy + 5y^2 - 1)$，求偏导得：\n   $\\begin{cases} (1+\\lambda)x - 2\\lambda y = 0 \\\\ -2\\lambda x + (1+5\\lambda)y = 0 \\end{cases}$。\n   因 $(x, y) \\ne (0,0)$，系数行列式 $(1+\\lambda)(1+5\\lambda) - 4\\lambda^2 = \\lambda^2 + 6\\lambda + 1 = 0 \\implies \\lambda = -3 \\pm 2\\sqrt{2}$。\n   将两方程左乘 $x, y$ 相加知 $d^2 = x^2 + y^2 = -\\lambda(x^2 - 4xy + 5y^2) = -\\lambda = 3 \\mp 2\\sqrt{2}$！\n   开平方即得 $d_{\\max} = \\sqrt{2} + 1,\\ d_{\\min} = \\sqrt{2} - 1$。",
    "steps": [
      "【踩分点 1 (5分)】：由方向导数最大值方向即为梯度方向得 $\\operatorname{grad}f(2,1) = 2\\cdot(0,1)$，解出 $a=-4, b=5$",
      "【踩分点 2 (4分)】：构造距离平方的条件极值拉格朗日函数（或椭圆矩阵特征值），令偏导数消元得特征方程 $\\lambda^2+6\\lambda+1=0$",
      "【踩分点 3 (3分)】：求出驻点处 $d^2 = -\\lambda = 3 \\pm 2\\sqrt{2}$，开方化简得 $d_{\\max}=\\sqrt{2}+1, d_{\\min}=\\sqrt{2}-1$"
    ],
    "keyPoints": [
      "方向导数与梯度向量",
      "拉格朗日乘数法与二次曲线长短半轴"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "多元微分应用",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q19",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "常微分方程",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T19】(本题满分 12 分) 设 $f(x)\\ (x \\ge 0)$ 满足 $(a + x)f'(x) + f(x) = a,\\ f(0) = 1$，其中 $a \\ge \\frac{1}{2}$ 且 $a \\ne 1$。\n(I) 求 $f(x)$；\n(II) 设 $x_1 > 0, x_{n+1} = f(x_n)\\ (n = 1, 2, \\cdots)$，证明 $\\lim_{n\\to\\infty} x_n$ 存在，并求其值。",
    "correctAnswer": "(I) $f(x) = \\frac{a(x + 1)}{x + a}\\ (x \\ge 0)$；(II) $\\lim_{n\\to\\infty} x_n = \\sqrt{a}$",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 求解微分方程初值问题（4 分）**\n注意方程左端正好是乘积求导公式！\n$$\\frac{d}{dx}\\left[(a + x)f(x)\\right] = (a + x)f'(x) + f(x) = a$$\n两端对 $x$ 积分得 $(a + x)f(x) = ax + C$。\n代入初始条件 $f(0) = 1$（且 $a \\ge \\frac{1}{2} > 0$）得 $a \\cdot 1 = C \\implies C = a$。\n因此：\n$$f(x) = \\frac{a(x + 1)}{x + a} = a - \\frac{a(a - 1)}{x + a} \\quad (x \\ge 0)$$\n\n**(II) 证明迭代数列 $\\{x_n\\}$ 收敛并求极限（8 分）**\n先看是否有正的不动点：$x = \\frac{a(x+1)}{x+a} \\implies x^2 + ax = ax + a \\implies x^2 = a$，由 $x_n > 0$ 知唯一正不动点为 $x^* = \\sqrt{a}$！\n现分析导数与单调/压缩性（按 $a > 1$ 与 $\\frac{1}{2} \\le a < 1$ 分情况或用**两步单调/压缩映射**一招通杀！）：\n**方法 A（压缩映像 / 不动点法 —— 一步通杀 $a > 1$ 和 $\\frac{1}{2} \\le a < 1$ 两种情况！）**：\n作差计算 $|x_{n+1} - \\sqrt{a}|$：\n$$x_{n+1} - \\sqrt{a} = \\frac{a(x_n + 1)}{x_n + a} - \\sqrt{a} = \\frac{ax_n + a - \\sqrt{a}x_n - a\\sqrt{a}}{x_n + a} = \\frac{\\sqrt{a}(\\sqrt{a} - 1)}{x_n + a}(x_n - \\sqrt{a})$$\n估计压缩比系数：因为 $x_n > 0$，所以 $x_n + a > a$，于是：\n$$\\left|\\frac{\\sqrt{a}(\\sqrt{a} - 1)}{x_n + a}\\right| \\le \\frac{|\\sqrt{a} - 1|}{\\sqrt{a}} = \\left|1 - \\frac{1}{\\sqrt{a}}\\right|$$\n考察 $q = \\left|1 - \\frac{1}{\\sqrt{a}}\\right|$：\n- 当 $a > 1$ 时，$0 < 1 - \\frac{1}{\\sqrt{a}} < 1$；\n- 当 $\\frac{1}{2} \\le a < 1$ 时，$1 < \\frac{1}{\\sqrt{a}} \\le \\sqrt{2} < 2 \\implies 0 < \\frac{1}{\\sqrt{a}} - 1 \\le \\sqrt{2} - 1 < 1$！\n**【神级结论】**：在题干给出的全部条件 $a \\ge \\frac{1}{2}$ 且 $a \\ne 1$ 下，恒有常压缩比 $0 < q = \\left|1 - \\frac{1}{\\sqrt{a}}\\right| < 1$！\n从而由递推即得：\n$$0 \\le |x_{n+1} - \\sqrt{a}| \\le q |x_n - \\sqrt{a}| \\le \\cdots \\le q^n |x_1 - \\sqrt{a}| \\xrightarrow{n\\to\\infty} 0$$\n由夹逼准则，极限 $\\lim_{n\\to\\infty} x_n$ 存在且等于 **$\\sqrt{a}$**！\n\n（也可按 $a>1$ 证明单调收敛；$\\frac{1}{2}\\le a<1$ 时将偶子列 $\\{x_{2k}\\}$ 与奇子列 $\\{x_{2k-1}\\}$ 各自单调有界且收敛于不动点，上述统一压缩法最为简洁漂亮、无懈可击。）",
    "steps": [
      "【踩分点 1 (4分)】：将 $(a+x)f'(x)+f(x)$ 逆用乘法求导法则积分为 $(a+x)f(x) = ax + C$，代入 $f(0)=1$ 得 $f(x)=\\frac{a(x+1)}{x+a}$",
      "【踩分点 2 (4分)】：求出正不动点 $\\sqrt{a}$ 并做差分解 $x_{n+1}-\\sqrt{a} = \\frac{\\sqrt{a}(\\sqrt{a}-1)}{x_n+a}(x_n-\\sqrt{a})$",
      "【踩分点 3 (4分)】：分别验证当 $a>1$ 与 $\\frac{1}{2}\\le a<1$ 时常数 $q = |1 - \\frac{1}{\\sqrt{a}}| < 1$，由压缩放缩与夹逼准则证得 $\\lim_{n\\to\\infty} x_n = \\sqrt{a}$"
    ],
    "keyPoints": [
      "一阶微分方程乘积全微分法",
      "不动点压缩原理(或子列单调有界)",
      "数列极限"
    ],
    "difficulty": "中等",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "微分方程与数列极限",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  },
  {
    "id": "math-calc-lilin6-s6-q20",
    "domain": "math",
    "subject": "高等数学",
    "scope": [
      "数一"
    ],
    "chapter": "多元函数积分学",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T20】(本题满分 12 分) 设 $y = f(x)$ 满足 $y y'' - (y')^2 = 1$，$y(1) = 1,\\ y'(1) = 0$。曲线 $\\begin{cases} y = f(x), \\\\ z = 0 \\end{cases}$ 绕直线 $\\begin{cases} x = 1, \\\\ z = 0 \\end{cases}$ 旋转一周所得曲面为 $\\Sigma_1$，$\\Sigma$ 为 $\\Sigma_1$ 与两个平面 $y = \\sqrt{2}, y = e$ 所围立体的全表面，取外侧。\n(I) 求 $y = f(x)$；\n(II) 计算 $I = \\iint_\\Sigma \\frac{x}{\\sqrt{y^2 - 1}}\\,dydz$。",
    "correctAnswer": "(I) $y = \\cosh(x - 1) = \\frac{e^{x-1} + e^{1-x}}{2}$；(II) $I = \\frac{\\pi}{3}\\left(\\left[\\ln(e + \\sqrt{e^2 - 1})\\right]^3 - \\left[\\ln(\\sqrt{2} + 1)\\right]^3\\right)$",
    "explanation": "【标准步骤与踩分点解析】：\n**(I) 求解不显含 $x$ 的二阶微分方程（5 分）**\n1. 令 $p = y'$，则 $y'' = p\\frac{dp}{dy}$。代入原方程 $y y'' - (y')^2 = 1$ 得：\n   $$y p\\frac{dp}{dy} - p^2 = 1 \\implies \\frac{p}{1 + p^2}\\,dp = \\frac{dy}{y}$$\n   两边积分：$\\frac{1}{2}\\ln(1 + p^2) = \\ln y + C_1 \\implies 1 + p^2 = C y^2$（注意 $y(1)=1 > 0$）。\n   代入初值 $y(1) = 1, p(1) = 0$ 得 $1 = C \\cdot 1^2 \\implies C = 1$，因此 $(y')^2 = y^2 - 1$。\n2. 开方分离变量：由对称与初值可知从 $x=1$ 起向两边变化，$y' = \\pm\\sqrt{y^2 - 1}$。\n   设 $\\int \\frac{dy}{\\sqrt{y^2 - 1}} = \\ln(y + \\sqrt{y^2 - 1}) = \\pm (x - 1) + C_2$（也即双曲余弦形式）。\n   在 $x = 1$ 时 $y = 1$，得 $C_2 = 0$，于是：\n   $$y + \\sqrt{y^2 - 1} = e^{\\pm (x-1)} \\implies y - \\sqrt{y^2 - 1} = e^{\\mp (x-1)}$$\n   两式相加除以 $2$ 得（正负号对称一致）：\n   $$y = f(x) = \\frac{e^{x-1} + e^{-(x-1)}}{2} = \\cosh(x - 1)$$\n\n**(II) 利用高斯公式计算闭曲面积分（7 分）**\n1. **写出旋转曲面 $\\Sigma_1$ 与立体 $\\Omega$ 的区域描述**：\n   因为 $z = 0$ 平面上的曲线 $y = \\cosh(x-1)$（即 $|x - 1| = \\operatorname{arcosh} y = \\ln(y + \\sqrt{y^2 - 1})$，$y \\ge 1$）绕直线 $x = 1, z = 0$（垂直轴为 $y$ 轴平移！）旋转一周，故在高度 $y \\in [\\sqrt{2}, e]$ 处的水平截圆半径为：\n   $$R(y) = |x - 1| = \\ln\\left(y + \\sqrt{y^2 - 1}\\right)$$\n   于是 $\\Omega = \\left\\{(x, y, z) \\;\\middle|\\; \\sqrt{2} \\le y \\le e,\\ (x-1)^2 + z^2 \\le \\left[\\ln(y + \\sqrt{y^2 - 1})\\right]^2\\right\\}$。\n2. **校验并使用高斯散度公式**（由于 $y \\in [\\sqrt{2}, e]$ 时 $\\sqrt{y^2 - 1} \\ge 1 > 0$，分母光滑非零！满足高斯公式全部条件）：\n   令 $P = \\frac{x}{\\sqrt{y^2 - 1}},\\ Q = 0,\\ R = 0$，则散度 $\\frac{\\partial P}{\\partial x} = \\frac{1}{\\sqrt{y^2 - 1}}$。由高斯公式：\n   $$I = \\iiint_\\Omega \\frac{1}{\\sqrt{y^2 - 1}}\\,dxdydz$$\n3. **采用“先二后一”切片法积分**（高度 $y$ 处的截面圆面积为 $\\pi R(y)^2 = \\pi \\left[\\ln(y+\\sqrt{y^2-1})\\right]^2$）：\n   $$I = \\int_{\\sqrt{2}}^e \\frac{\\pi \\left[\\ln(y + \\sqrt{y^2 - 1})\\right]^2}{\\sqrt{y^2 - 1}}\\,dy$$\n   注意到 $d\\left[\\ln(y + \\sqrt{y^2 - 1})\\right] = \\frac{dy}{\\sqrt{y^2 - 1}}$，直接凑微分求原函数：\n   $$I = \\frac{\\pi}{3}\\left[\\ln(y + \\sqrt{y^2 - 1})\\right]^3 \\Bigg|_{\\sqrt{2}}^e = \\frac{\\pi}{3}\\left(\\left[\\ln(e + \\sqrt{e^2 - 1})\\right]^3 - \\left[\\ln(\\sqrt{2} + 1)\\right]^3\\right)$$",
    "steps": [
      "【踩分点 1 (5分)】：令 $p=y'$ 降阶解 $yy''-(y')^2=1$，由初值求得解 $y = \\cosh(x-1)$",
      "【踩分点 2 (3分)】：写出绕直线 $x=1, z=0$ 旋转所得圆截面积 $S(y) = \\pi [\\ln(y+\\sqrt{y^2-1})]^2$",
      "【踩分点 3 (4分)】：验证区域内 $\\sqrt{y^2-1}\\ge 1$ 应用高斯公式并结合先二后一法凑微分算得最终结果"
    ],
    "keyPoints": [
      "可降阶二阶微分方程",
      "空间曲线绕直线旋转体",
      "高斯公式与切片法"
    ],
    "difficulty": "困难",
    "tags": [
      "2026李林六套卷",
      "数一",
      "第6套",
      "高数",
      "微分方程与曲面积分",
      "解答题"
    ],
    "sourceNote": "01-考研数学/高等数学/26李林六套卷数一-高数分类题库与精析.md"
  }
]
