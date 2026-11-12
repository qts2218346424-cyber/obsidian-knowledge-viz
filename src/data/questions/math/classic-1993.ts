import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 1993 年全国硕士研究生入学统一考试 · 数学（一）真题全集（23 题 · 满分 100 分）
 */
export const classic1993Questions: UnifiedQuestion[] = [
  {
    "id": "m1-93-01",
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
