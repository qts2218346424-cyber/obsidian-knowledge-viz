import type { ExamPaper } from './types'

/**
 * 2026 李林考研数学冲刺预测 6 套卷（数学一）完整整卷库
 * 包含全部 6 套 × 22 题 = 132 道全真试题、标准答案、分步踩分点解析与分类标签
 */
export const LILIN6_EXAM_PAPERS: ExamPaper[] = [
  {
    "id": "paper-lilin6-2026-01",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第一套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 1/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖导数微元与极值、广义积分敛散性、幂级数展开求和、隐函数条件极值与二次曲线最值、二维均匀分布卷积、向量组极大无关组与正交相似对角化。",
    "questions": [
      {
        "id": "lilin6-2026-s1-q01",
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
        "question": "【2026李林六套卷·数一·第1套 T1】函数 $f(x) = \\frac{(x^2 - x)|x+1|e^{-\\frac{1}{x}}}{\\int_1^x t^2 \\sin t \\, dt}$ $(x \\in [-\\pi, \\pi])$ 的第一类间断点的个数为（ ）。",
        "options": [
          "A. 0",
          "B. 1",
          "C. 2",
          "D. 3"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T2】下列函数在 $x = 0$ 处不可导的是（ ）。",
        "options": [
          "A. $|x|\\int_0^x \\sin t^2 \\, dt$",
          "B. $|\\sin(x - \\sin x)|$",
          "C. $\\int_{-1}^x \\sqrt{|t|}\\ln|t|\\,dt$",
          "D. $\\sqrt{e^{|x|}}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T3】设 $f'(u) \\ne 0$，且 $x_0^2 + y_0^2 \\ne 0$，则曲面 $z = f(\\sqrt{x^2 + y^2})$ 上点 $M_0(x_0, y_0, z_0)$ 处的法线与 $z$ 轴的位置关系是（ ）。",
        "options": [
          "A. 垂直相交",
          "B. 相交但不垂直",
          "C. 平行",
          "D. 异面直线"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q04",
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
        "question": "【2026李林六套卷·数一·第1套 T4】设 $f(x)$ 有一阶连续导数，且 $\\lim_{x\\to 0}\\frac{f(x)}{x} = 1$，$a_n = f(\\frac{1}{n}), n = 1, 2, \\cdots$，则（ ）。",
        "options": [
          "A. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛，$\\sum_{n=1}^{\\infty}a_n$ 收敛",
          "B. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 发散，$\\sum_{n=1}^{\\infty}a_n^2$ 收敛",
          "C. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 发散，$\\sum_{n=1}^{\\infty}a_n$ 收敛",
          "D. $\\sum_{n=1}^{\\infty}(-1)^{n-1}a_n$ 收敛，$\\sum_{n=1}^{\\infty}a_n^2$ 收敛"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T5】设 $A$ 是 3 阶实对称矩阵，$\\boldsymbol{\\alpha} = (-1, 1, 1)^T$ 满足 $(A - 2E)\\boldsymbol{\\alpha} = \\mathbf{0}$，且 $r(A) = 1$，则方程组 $A\\boldsymbol{X} = \\mathbf{0}$ 的基础解系为（ ）。",
        "options": [
          "A. $(1, 1, 0)^T, (1, 0, 1)^T$",
          "B. $(1, 1, 1)^T, (1, -1, 0)^T$",
          "C. $(1, 1, -1)^T, (-1, 0, 1)^T$",
          "D. $(1, 1, 0)^T, (-1, 0, 1)^T$"
        ],
        "correctAnswer": "A",
        "explanation": "因为 $(A - 2E)\\boldsymbol{\\alpha} = \\mathbf{0}$ 且 $\\boldsymbol{\\alpha} \\ne \\mathbf{0}$，所以 $\\boldsymbol{\\alpha} = (-1, 1, 1)^T$ 是 $A$ 对应特征值 $2$ 的特征向量。又 $r(A) = 1$，故 $0$ 是 $A$ 的二重特征值，$A\\boldsymbol{X} = \\mathbf{0}$ 的解空间即为特征值 $0$ 的二维特征子空间。\n由于实对称矩阵不同特征值对应的特征向量正交，任意解向量 $\\boldsymbol{\\xi}$ 须满足 $\\boldsymbol{\\alpha}^T \\boldsymbol{\\xi} = 0$（即 $-x_1 + x_2 + x_3 = 0$）。逐项点积验证，仅 A 项中 $(1,1,0)^T$ 与 $(1,0,1)^T$ 均与 $(-1,1,1)^T$ 正交且线性无关。选 A。",
        "steps": [
          "识别 $\\boldsymbol{\\alpha}=(-1,1,1)^T$ 为特征值 $2$ 的特征向量",
          "由 $r(A)=1$ 知 $Ax=0$ 解空间维数为 $2$，对应特征值 $0$",
          "利用实对称矩阵正交性得解向量须满足 $-x_1+x_2+x_3=0$，检验唯一选项 A 符合"
        ],
        "keyPoints": [
          "实对称矩阵正交性",
          "基础解系",
          "矩阵的秩与零特征子空间"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第1套",
          "线代",
          "实对称矩阵"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T6】设 $A = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & -\\frac{1}{2} & \\frac{1}{2} \\\\ 0 & \\frac{1}{2} & -\\frac{1}{2} \\end{pmatrix}$，$B = \\begin{pmatrix} 1 & -1 & 0 \\\\ 2 & -1 & 1 \\\\ 0 & 1 & 1 \\end{pmatrix}$，$C = \\begin{pmatrix} 1 & -1 & 0 \\\\ 2 & -2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$，则下列选项中正确的是（ ）。",
        "options": [
          "A. $A$ 与 $C$ 合同",
          "B. $A$ 与 $B$ 相似",
          "C. $B$ 与 $C$ 相似",
          "D. $B$ 与 $C$ 合同"
        ],
        "correctAnswer": "D",
        "explanation": "本题考查**一般矩阵的合同关系**（$P^T B P = C$）：\n- 排除 A：$A$ 对称而 $C$ 不对称，对称矩阵合同后的矩阵必仍对称。\n- 排除 B、C：算迹 $\\text{tr}(A) = 0, \\text{tr}(B) = 1, \\text{tr}(C) = 0$，迹不相等则必不相似。\n- 验证 D：对 $B$ 作合同初等变换（第 2 行减去第 3 行，再第 2 列减去第 3 列），即取可逆矩阵 $P = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & -1 & 1 \\end{pmatrix}$，计算得 $P^T B P = \\begin{pmatrix} 1 & -1 & 0 \\\\ 2 & -2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix} = C$！故 $B$ 与 $C$ 合同。选 D。",
        "steps": [
          "由对称性保持排除 $A$ 与 $C$ 合同",
          "由 $\\text{tr}(A)=0, \\text{tr}(B)=1, \\text{tr}(C)=0$ 排除 A-B、B-C 相似",
          "构造可逆阵 $P = \\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&-1&1\\end{pmatrix}$ 作成对初等行列变换验证 $P^T B P = C$"
        ],
        "keyPoints": [
          "一般矩阵的合同关系",
          "矩阵相似必要条件（迹）",
          "成对初等变换化合同"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第1套",
          "线代",
          "矩阵合同与相似"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T7】设 $A$ 是 3 阶实对称矩阵，$B = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3)$ 是 3 阶可逆矩阵，且 $AB = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2 - 2\\boldsymbol{\\alpha}_3, \\boldsymbol{\\alpha}_3 - 2\\boldsymbol{\\alpha}_2)$，记 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，则二次型 $f(x_1, x_2, x_3) = \\text{tr}(A\\boldsymbol{X}\\boldsymbol{X}^T)$ 的规范形为（ ）。",
        "options": [
          "A. $y_1^2 - y_2^2 - y_3^2$",
          "B. $y_1^2 + y_2^2 - y_3^2$",
          "C. $y_1^2 + y_2^2 + y_3^2$",
          "D. $-y_1^2 - y_2^2 - y_3^2$"
        ],
        "correctAnswer": "B",
        "explanation": "1. 化简二次型表达式：$\\text{tr}(A\\boldsymbol{X}\\boldsymbol{X}^T) = \\text{tr}(\\boldsymbol{X}^T A\\boldsymbol{X}) = \\boldsymbol{X}^T A\\boldsymbol{X}$。\n2. 由题设矩阵列关系：$AB = B \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & -2 \\\\ 0 & -2 & 1 \\end{pmatrix} = BC$。因 $B$ 可逆，故 $B^{-1} A B = C$，即 $A \\sim C$。\n3. 求 $C$ 的特征值：分块易得 $\\lambda_1 = 1$，右下角子块特征值为 $1\\pm 2$ 即 $3, -1$。\n因此 $A$ 有 2 个正特征值和 1 个负特征值，规范形为 $y_1^2 + y_2^2 - y_3^2$。选 B。",
        "steps": [
          "利用迹循环恒等式转化 $\\text{tr}(A\\boldsymbol{X}\\boldsymbol{X}^T) = \\boldsymbol{X}^T A \\boldsymbol{X}$",
          "改写为 $AB = BC$ 并由 $B$ 可逆得出 $A \\sim C$",
          "求 $C$ 特征值为 $1, 3, -1$，得正负惯性指数 $p=2, q=1$"
        ],
        "keyPoints": [
          "矩阵迹与二次型关系",
          "相似矩阵特征值相同",
          "惯性定理与规范形"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第1套",
          "线代",
          "二次型规范形"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q08",
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
        "question": "【2026李林六套卷·数一·第1套 T8】设每次试验只有两个结果 $A$ 与 $\\bar{A}$，已知 $P(A) = p$ $(0 < p < 1)$，重复独立进行该实验直至 $A$ 与 $\\bar{A}$ 都出现为止，且试验次数 $X$ 的数学期望为 $3$，则 $p = $（ ）。",
        "options": [
          "A. $\\frac{1}{2}$",
          "B. $\\frac{1}{3}$",
          "C. $\\frac{1}{4}$",
          "D. $\\frac{2}{3}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T9】设 $(X, Y) \\sim N\\left(1, 0; 9, 16; -\\frac{1}{2}\\right)$，$Z = \\frac{1}{3}X + \\frac{1}{2}Y$，则（ ）。",
        "options": [
          "A. $X$ 与 $Z$ 不相关",
          "B. $X$ 与 $Z$ 不相互独立",
          "C. $Y$ 与 $Z$ 不相关",
          "D. $Y$ 与 $Z$ 相互独立"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第1套 T10】连续不间断独立地对同一目标射击，直到命中为止。设进行 $n (n \\ge 1)$ 轮射击，各轮射击的次数依次为 $k_1, k_2, \\cdots, k_n$，且每次击中目标的概率均为 $p (0 < p < 1)$，则 $p$ 的矩估计值与最大似然估计值分别为（ ）。",
        "options": [
          "A. $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}, \\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}$",
          "B. $\\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}, \\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$",
          "C. $\\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}, \\hat{p} = \\frac{n}{\\sum_{i=1}^n k_i}$",
          "D. $\\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}, \\hat{p} = \\frac{\\sum_{i=1}^n k_i}{n}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q11",
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
        "question": "【2026李林六套卷·数一·第1套 T11】设 $f(x)$ 是连续函数，且 $\\lim_{x\\to\\infty} f(x) = \\frac{1}{e}$，若正数 $a$ 满足 $\\lim_{x\\to\\infty} \\left(\\cos\\frac{a}{x}\\right)^{x^2} = \\lim_{x\\to\\infty} \\int_x^{x+1} f(t)\\,dt$，则 $a =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第1套 T12】设 $L: x^2 + \\frac{y^2}{4} = 1$，取逆时针方向，则 $I = \\oint_L (4x^2 + y^2)(|y|\\,dx + x\\,dy) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q13",
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
        "question": "【2026李林六套卷·数一·第1套 T13】设函数 $f(x, y)$ 可微，曲面 $z = f(x, y)$ 与坐标面 $xOy$ 的交线为 $\\begin{cases} y = \\int_0^x (e^{-t^2} + \\sin t^2)\\,dt, \\\\ z = 0, \\end{cases}$ 且 $f'_x(0, 0) = 1$，则 $dz|_{(0,0)} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q14",
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
        "question": "【2026李林六套卷·数一·第1套 T14】设微分方程 $y'' + ay' + y = 0$ 的每一个解 $y(x)$ 在 $[0, +\\infty)$ 上有界，则实数 $a$ 的取值范围为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q15",
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
        "question": "【2026李林六套卷·数一·第1套 T15】设 $A$ 是 3 阶矩阵，$\\boldsymbol{\\alpha}$ 为 3 维列向量，$P = (\\boldsymbol{\\alpha}, A\\boldsymbol{\\alpha}, A^2\\boldsymbol{\\alpha})$ 为可逆矩阵，$B = P^{-1}AP$，且 $A^3\\boldsymbol{\\alpha} + 2A^2\\boldsymbol{\\alpha} = 3A\\boldsymbol{\\alpha}$，则 $\\text{tr}(A + B) =$ ______。",
        "options": [],
        "correctAnswer": "$-4$",
        "explanation": "由 $A^3\\boldsymbol{\\alpha} = 3A\\boldsymbol{\\alpha} - 2A^2\\boldsymbol{\\alpha}$，得 $AP = (A\\boldsymbol{\\alpha}, A^2\\boldsymbol{\\alpha}, A^3\\boldsymbol{\\alpha}) = P\\begin{pmatrix} 0 & 0 & 0 \\\\ 1 & 0 & 3 \\\\ 0 & 1 & -2 \\end{pmatrix}$。\n故 $B = P^{-1}AP = \\begin{pmatrix} 0 & 0 & 0 \\\\ 1 & 0 & 3 \\\\ 0 & 1 & -2 \\end{pmatrix}$。因 $A \\sim B$，故 $\\text{tr}(A) = \\text{tr}(B) = -2$，因此 $\\text{tr}(A+B) = -4$。",
        "steps": [
          "构造关系 $AP = PB$ 直接写出 $B$ 的矩阵元素",
          "读取主对角线和得 $\\text{tr}(B) = -2$",
          "由相似阵迹相等得 $\\text{tr}(A+B) = 2\\text{tr}(B) = -4$"
        ],
        "keyPoints": [
          "相似矩阵与迹",
          "友矩阵构造技巧"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第1套",
          "线代",
          "矩阵相似"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第1套 T16】设二维随机变量 $(X, Y)$ 服从 $D$ 上的均匀分布，其中 $D = \\{(x, y) \\mid 0 \\le x \\le 3, 0 \\le y \\le 3\\}$，记 $U = (X+Y)^2, V = (X-Y)^2$，则 $\\text{Cov}(U, V) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第1套 T17（10分）】设可微函数 $f(x, y)$ 在点 $P(x, y)$ 处沿 $\\boldsymbol{l}_1 = (1, 1)$ 的方向导数为 $\\sqrt{2}(x - xy^2 + 2y - x^2y)$，沿 $\\boldsymbol{l}_2 = (0, -2)$ 的方向导数为 $2x^2y - 4y$。\n（I）求 $f(x, y)$ 在点 $M(2, 1)$ 处的最大方向导数；\n（II）若 $f(1, 1) = 2$，求 $f(x, y)$ 的极值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第1套 T18（12分）】设 $\\Sigma$ 为曲面 $z = 2 - x^2 - y^2$ $(x \\ge 0, y \\ge 0)$ 被柱面 $x^2 + y^2 = 1$ 所截出部分的上侧，计算 $I = \\iint_{\\Sigma} yz\\,dxdy + zx\\,dydz + xy\\,dzdx$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q19",
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
        "question": "【2026李林六套卷·数一·第1套 T19（12分）】设 $f(x)$ 满足 $e^{f(x)}[f'(x) - 1] = x - 1 (x \\ge 0)$，$f(0) = 0$，数列 $\\{a_n\\}$ 满足 $a_1 = 1, a_{n+1} = f(a_n) (n = 1, 2, \\cdots)$。\n（I）证明：$\\lim_{n\\to\\infty} a_n$ 存在，并求其值；\n（II）求 $\\sum_{n=1}^{\\infty} a_n x^n$ 的收敛域及 $\\sum_{n=1}^{\\infty} a_n$ 的和。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q20",
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
        "question": "【2026李林六套卷·数一·第1套 T20（12分）】设 $f(x)$ 在 $(-\\infty, +\\infty)$ 内有二阶连续的导数，且对 $\\forall x, y \\in (-\\infty, +\\infty)$ 满足 $f\\left(\\sqrt{\\frac{x^2+y^2}{2}}\\right) = \\sqrt{f(x)f(y)}$，$f(x)$ 在 $(0, +\\infty)$ 内严格单调递增。证明：\n（I）对 $\\forall x, y \\in (-\\infty, +\\infty)$，有 $f\\left(\\frac{x+y}{2}\\right) \\le \\frac{f(x)+f(y)}{2}$；\n（II）对 $\\forall x \\in (-\\infty, +\\infty)$，有 $f''(x) \\ge 0$；\n（III）$\\int_{-1}^1 f(x)\\,dx \\le f(0) + f(1)$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q21",
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
        "question": "【2026李林六套卷·数一·第1套 T21（12分）】设矩阵 $A = \\begin{pmatrix} a & 1 & 1 \\\\ 1 & a & 1 \\\\ 1 & 1 & a \\end{pmatrix}$ 有二重特征值 $1$，二次型 $f(x_1, x_2, x_3) = \\boldsymbol{X}^T A \\boldsymbol{X}$，其中 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$。\n（I）求 $a$ 的值，并求正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$ 将 $f(x_1, x_2, x_3)$ 化为标准形；\n（II）设 $g(x_1, x_2, x_3) = \\begin{vmatrix} 0 & \\boldsymbol{X}^T \\\\ -\\boldsymbol{X} & A \\end{vmatrix}$，若对 $\\forall \\boldsymbol{X} \\ne \\mathbf{0}$，有 $f(x_1, x_2, x_3) \\le k g(x_1, x_2, x_3)$，求 $k$ 的最小取值。",
        "options": [],
        "correctAnswer": "（I）$a = 2$，标准形为 $y_1^2 + y_2^2 + 4y_3^2$；（II）$k$ 的最小值为 $4$。",
        "explanation": "**（I）**：由 $|\\lambda E - A| = (\\lambda - a + 1)^2(\\lambda - a - 2)$，已知二重特征值为 $1$，故 $a - 1 = 1 \\implies a = 2$，特征值为 $1, 1, 4$。\n分别求正交单位特征向量得 $Q = \\begin{pmatrix} -\\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ \\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ 0 & \\frac{2}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\end{pmatrix}$，在 $\\boldsymbol{X} = Q\\boldsymbol{Y}$ 下化为 $f = y_1^2 + y_2^2 + 4y_3^2$。\n\n**（II）**：利用分块矩阵 Schur 补公式：$g = \\begin{vmatrix} 0 & \\boldsymbol{X}^T \\\\ -\\boldsymbol{X} & A \\end{vmatrix} = |A|\\boldsymbol{X}^T A^{-1}\\boldsymbol{X} = \\boldsymbol{X}^T A^* \\boldsymbol{X}$。\n在同一正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$ 下，$Q^T A^* Q = \\text{diag}(4, 4, 1)$，即 $g = 4y_1^2 + 4y_2^2 + y_3^2$。\n恒不等式 $y_1^2 + y_2^2 + 4y_3^2 \\le k(4y_1^2 + 4y_2^2 + y_3^2)$ 对 $\\forall \\boldsymbol{Y} \\ne \\mathbf{0}$ 成立当且仅当 $4k \\ge 1$ 且 $k \\ge 4$，故 $k_{\\min} = 4$。",
        "steps": [
          "（3分）求得特征值 $(a-1, a-1, a+2)$，结合二重特征值 $1$ 解出 $a=2$",
          "（4分）求正交化特征向量构造正交矩阵 $Q$，给出标准形 $y_1^2+y_2^2+4y_3^2$",
          "（3分）用 Schur 补将加边行列式转化为 $g = |A|\\boldsymbol{X}^T A^{-1}\\boldsymbol{X} = \\boldsymbol{X}^T A^* \\boldsymbol{X}$",
          "（2分）在共同正交基下比较特征值比，得 $k_{\\min} = 4$"
        ],
        "keyPoints": [
          "实对称矩阵正交对角化",
          "加边行列式与伴随矩阵二次型",
          "二次型不等式恒成立问题"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第1套",
          "线代",
          "二次型大题"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s1-q22",
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
        "question": "【2026李林六套卷·数一·第1套 T22（12分）】设随机变量 $X$ 的概率密度为 $f(x) = \\frac{1}{\\pi(1+x^2)} (-\\infty < x < +\\infty)$，$Y = \\operatorname{arccot} X$，随机变量 $Z \\sim N(0, 1)$，且 $Y$ 与 $Z$ 相互独立。\n（I）求 $Y$ 的分布函数与概率密度；\n（II）求 $U = Z + Y$ 的概率密度。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第一套-全真试题与全析.md"
      }
    ]
  },
  {
    "id": "paper-lilin6-2026-02",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第二套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 2/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖分段函数拐点与渐近线、旋转体表面积与重心、双变量偏微分与全微分、方向导数与曲面积分、可分离与二阶常系数微分方程、正交相似矩阵特征值与泊松/正态估计。",
    "questions": [
      {
        "id": "lilin6-2026-s2-q01",
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
        "question": "【2026李林六套卷·数一·第2套 T1】设 $f(x) = \\lim_{n\\to\\infty}\\frac{\\ln(e^n + x^n)}{n}$ $(x > 0)$，则 $F(x) = \\int_1^x f(t)\\,dt$ 在区间 $[1, +\\infty)$ 上（ ）。",
        "options": [
          "A. 不连续",
          "B. 连续但不可导",
          "C. 可导但二阶不可导",
          "D. 二阶可导"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T2】设积分 $I = \\int_0^{\\frac{\\pi}{2}} \\frac{dx}{\\sin^p x \\cos^q x}$ $(p > 0, q > 0)$ 收敛，则（ ）。",
        "options": [
          "A. $p > 1$ 且 $q > 1$",
          "B. $p < 1$ 且 $q < 1$",
          "C. $p > 1$ 且 $q < 1$",
          "D. $p < 1$ 且 $q > 1$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T3】设 $f(x)$ 是定义在 $\\mathbf{R}$ 上的偶函数，且 $f(x) + f'(x) = 2e^x$，若 $a[f(x) - e^x] \\le x$ 在 $\\mathbf{R}$ 上恒成立，则 $a$ 的取值范围为（ ）。",
        "options": [
          "A. $(-\\infty, 0]$",
          "B. $(-\\infty, -\\frac{1}{e}]$",
          "C. $(-\\infty, -1)$",
          "D. $(-\\infty, -e]$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q04",
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
        "question": "【2026李林六套卷·数一·第2套 T4】设级数 $\\sum_{n=2}^{\\infty}\\frac{1}{n(\\ln n)^p}$ 发散，且 $\\sum_{n=1}^{\\infty}(-1)^{n-1}\\left(\\frac{1}{n^p} - \\arctan\\frac{1}{n^p}\\right)$ 条件收敛，其中 $p > 0$，则 $p$ 的取值范围为（ ）。",
        "options": [
          "A. $0 < p < 1$",
          "B. $0 < p \\le \\frac{1}{3}$",
          "C. $\\frac{1}{3} \\le p < 1$",
          "D. $\\frac{1}{3} < p \\le 1$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "行列式",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T5】设 $A = \\begin{pmatrix} a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\\\ c_1 & c_2 & c_3 \\end{pmatrix}$，$B = \\begin{pmatrix} b_1 & b_3 & b_2 \\\\ a_1 & a_3 & a_2 \\\\ c_1+a_1 & c_3+a_3 & c_2+a_2 \\end{pmatrix}$，则（ ）。",
        "options": [
          "A. $|A| = -|B|$",
          "B. $2|A| = |B|$",
          "C. $|A| = 2|B|$",
          "D. $|A| = |B|$"
        ],
        "correctAnswer": "D",
        "explanation": "对 $A$ 依次作如下行列式初等变换：\n1. 互换第 1、2 行（行列式乘 $-1$）；\n2. 互换第 2、3 列（行列式再乘 $-1$，累计符号 $+1$）；\n3. 第 2 行加到第 3 行（行列式不变），即得矩阵 $B$。\n因此 $|B| = |A|$。选 D。",
        "steps": [
          "第 1、2 行互换变号一次",
          "第 2、3 列互换再变号一次，两负号相抵",
          "倍加行变换不改变行列式，得 $|B| = |A|$"
        ],
        "keyPoints": [
          "行列式初等变换性质",
          "行列互换符号规则"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第2套",
          "线代",
          "行列式"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T6】设 $A, B$ 均为 $n$ 阶矩阵，$\\boldsymbol{\\alpha}, \\boldsymbol{\\beta}$ 均为 $n$ 维列向量。若 $\\boldsymbol{\\alpha}$ 可由 $A$ 的列向量线性表示，$(\\boldsymbol{\\alpha}^T, \\boldsymbol{\\beta}^T)$ 不能由 $(A^T, B^T)$ 的行向量线性表示，则下列结论中正确的是（ ）。",
        "options": [
          "A. $r(B, \\boldsymbol{\\beta}) = r(B)$",
          "B. $r(B, \\boldsymbol{\\beta}) = r(B) + 1$",
          "C. $r\\begin{pmatrix} A^T & B^T \\\\ \\boldsymbol{\\alpha}^T & \\boldsymbol{\\beta}^T \\end{pmatrix} = r(A^T, B^T) + 1$",
          "D. $r[(A, \\boldsymbol{\\alpha}), B^T] = r\\left[(A^T, B^T)\\begin{pmatrix} A \\\\ B \\end{pmatrix}\\right]$"
        ],
        "correctAnswer": "C",
        "explanation": "因为行向量 $(\\boldsymbol{\\alpha}^T, \\boldsymbol{\\beta}^T)$ 不能由 $(A^T, B^T)$ 的行向量线性表示，将其作为增广行添至 $(A^T, B^T)$ 下方必使行秩严格增加 1，即 $r\\begin{pmatrix} A^T & B^T \\\\ \\boldsymbol{\\alpha}^T & \\boldsymbol{\\beta}^T \\end{pmatrix} = r(A^T, B^T) + 1$。\n可用特例排除 A、B：取 $A=E_2, B=O_2, \\boldsymbol{\\alpha}=(1,0)^T, \\boldsymbol{\\beta}=(1,0)^T$ 否决 A；取 $A=B=E_2, \\boldsymbol{\\alpha}=(1,0)^T, \\boldsymbol{\\beta}=(0,0)^T$ 否决 B。选 C。",
        "steps": [
          "利用“向量不能被线性表出等价于添加该向量后矩阵秩加 1”直接得出 C 成立",
          "构造反例检验其余选项均不恒成立"
        ],
        "keyPoints": [
          "线性表出与矩阵的秩",
          "反例排除法"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第2套",
          "线代",
          "向量组与秩"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T7】已知 $A = \\begin{pmatrix} 1-a & a \\\\ a & a \\end{pmatrix}$，$\\boldsymbol{X} = (x_1, x_2)^T$，二次型 $f(x_1, x_2) = \\begin{vmatrix} A & \\boldsymbol{X} \\\\ -\\boldsymbol{X}^T & 0 \\end{vmatrix}$，则 $A$ 正定是 $f(x_1, x_2)$ 正定的（ ）。",
        "options": [
          "A. 充分不必要条件",
          "B. 必要不充分条件",
          "C. 充分必要条件",
          "D. 既不充分也不必要条件"
        ],
        "correctAnswer": "C",
        "explanation": "展开加边行列式得 $f(x_1, x_2) = a x_1^2 - 2a x_1 x_2 + (1-a)x_2^2 = \\boldsymbol{X}^T A^* \\boldsymbol{X}$。\n- $A$ 正定 $\\iff 1-a > 0$ 且 $|A| = a(1-2a) > 0 \\iff 0 < a < \\frac{1}{2}$；\n- $f(x_1, x_2)$ 正定 $\\iff a > 0$ 且 $|A^*| = a(1-2a) > 0 \\iff 0 < a < \\frac{1}{2}$。\n二者等价，为充分必要条件。选 C。",
        "steps": [
          "展开 3 阶加边行列式得二次型矩阵 $A^* = \\begin{pmatrix}a & -a \\\\ -a & 1-a\\end{pmatrix}$",
          "用顺序主子式分别判定 $A$ 正定与 $A^*$ 正定，均等价于 $0 < a < 1/2$"
        ],
        "keyPoints": [
          "正定矩阵充要条件",
          "顺序主子式",
          "伴随矩阵与二次型"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第2套",
          "线代",
          "正定二次型"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q08",
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
        "question": "【2026李林六套卷·数一·第2套 T8】设 $A, B, C$ 是三个随机事件，$P(ABC) = 0$，$0 < P(C) < 1$，则正确的是（ ）。",
        "options": [
          "A. $P(ABC) = P(A)P(B)P(C)$",
          "B. $P(A \\cup B \\cup C) = P(A) + P(B) + P(C)$",
          "C. $P[(A \\cup B) \\mid \\bar{C}] = P(A \\mid \\bar{C}) + P(B \\mid \\bar{C})$",
          "D. $P[(A \\cup B) \\mid C] = P(A \\mid C) + P(B \\mid C)$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T9】设随机变量 $X_1 \\sim B(1, p)$，$X_2 \\sim B(2, p)$ $(0 < p < 1)$，且 $X_1$ 与 $X_2$ 相互独立，记 $Z_1 = 2X_1 + X_2, Z_2 = X_1 - X_2$，则（ ）。",
        "options": [
          "A. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 相互独立",
          "B. $Z_1$ 与 $Z_2$ 不相关，$Z_1$ 与 $Z_2$ 不相互独立",
          "C. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 相互独立",
          "D. $Z_1$ 与 $Z_2$ 相关，$Z_1$ 与 $Z_2$ 不相互独立"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第2套 T10】设随机变量 $X$ 在 $[0, \\theta]$ $(\\theta > 0)$ 上服从均匀分布，其中 $\\theta$ 未知，$X_1, X_2, \\cdots, X_n$ 为总体 $X$ 的简单随机样本，$\\hat{\\theta}$ 为 $\\theta$ 的最大似然估计量，若 $k\\hat{\\theta}$ 为 $\\theta$ 的无偏估计量，则 $k =$（ ）。",
        "options": [
          "A. $\\frac{n}{n+1}$",
          "B. $\\frac{n+1}{n}$",
          "C. $\\frac{1}{n+1}$",
          "D. $\\frac{1}{n}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第2套 T11】设 $f(x)$ 有二阶连续导数，当 $x \\to 0$ 时，$2\\sin x + x f(x)$ 是比 $x^3$ 高阶的无穷小，则曲线 $y = f(x)$ 在点 $(0, -2)$ 处的曲率圆方程为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第2套 T12】曲线 $r = \\frac{1}{1+\\cos\\theta}$ 在 $\\theta \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ 上的全长为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q13",
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
        "question": "【2026李林六套卷·数一·第2套 T13】设 $f(x, y) = \\int_{x^2+y^2}^{\\frac{y}{x}} e^{-t^2}\\,dt$，则 $x\\frac{\\partial f}{\\partial x} + y\\frac{\\partial f}{\\partial y}$ 的极小值为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q14",
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
        "question": "【2026李林六套卷·数一·第2套 T14】设 $\\Sigma: (x - a)^2 + (y - a)^2 + (z - a)^2 = 2a^2$ $(a > 0)$，则 $I = \\oiint_{\\Sigma} (x + y + z - \\sqrt{3}a)\\,dS =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q15",
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
        "question": "【2026李林六套卷·数一·第2套 T15】设 $A, B, C$ 均为 3 阶矩阵，$A$ 的特征值为 $1, 2, 3$，$B$ 是可逆矩阵，且满足 $AB - B^2 + BC = O$，$E$ 是 3 阶单位矩阵，则行列式 $|(B - C)^{-1} + E| =$ ______。",
        "options": [],
        "correctAnswer": "$4$",
        "explanation": "将方程改写为 $B(B - C) = AB \\implies B - C = B^{-1}AB \\sim A$。故 $B-C$ 的特征值为 $1, 2, 3$，从而 $(B-C)^{-1} + E$ 特征值为 $2, \\frac{3}{2}, \\frac{4}{3}$，相乘得行列式为 $4$。",
        "steps": [
          "提公因子并左乘 $B^{-1}$ 得 $B-C \\sim A$",
          "求映射后矩阵的特征值乘积 $2\\times\\frac{3}{2}\\times\\frac{4}{3}=4$"
        ],
        "keyPoints": [
          "相似矩阵判定",
          "特征值代数运算",
          "行列式与特征值乘积"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第2套",
          "线代",
          "特征值"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q16",
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
        "question": "【2026李林六套卷·数一·第2套 T16】设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从二项分布 $B\\left(4, \\frac{1}{2}\\right)$，$Y$ 服从 $\\lambda = 1$ 的泊松分布，则 $P\\{1 < \\max(X, Y) \\le 3\\} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q17",
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
        "question": "【2026李林六套卷·数一·第2套 T17（10分）】设 $a (a > -1)$ 为非零常数，$\\lim_{x\\to+\\infty} \\frac{\\int_1^x \\left[(t+a)^{1+\\frac{1}{t}} - t^{1+\\frac{1}{t+a}}\\right]\\,dt}{x} = 1$，求 $a$ 的值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q18",
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
        "question": "【2026李林六套卷·数一·第2套 T18（12分）】设 $f(x, y)$ 有二阶连续偏导数，且满足 $df(x, y) = a x y^2\\,dx + \\left(10x^2 y + \\frac{2}{5}ay^3\\right)\\,dy$，$f(1, 1) = 6$。\n（I）求 $f(x, y)$；\n（II）曲线 $f(x, y) = 1$ 上任一点 $(x, y)$ 到原点的距离为 $d$，求 $d$ 的最小值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q19",
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
        "question": "【2026李林六套卷·数一·第2套 T19（12分）】设平面力 $\\boldsymbol{F}(x, y) = (P(x, y), Q(x, y))$，其中 $P(x, y) = f(x) + y[e^{-x} - f'(x)]$，$Q(x, y) = f'(x)$，$f(x)$ 有二阶连续导数，且 $f'(0) = 0$。\n（I）若力 $\\boldsymbol{F}$ 对运动质点做的功与质点运动路径无关，求 $f(x)$；\n（II）若 $L$ 是从点 $A(-1, 1)$ 到点 $B(1, 0)$ 的光滑有向曲线，且 $\\int_L P(x, y)\\,dx + Q(x, y)\\,dy = \\frac{4}{e}$，求 $f(x)$ 的极值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q20",
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
        "question": "【2026李林六套卷·数一·第2套 T20（12分）】设 $f(x)$ 在 $[0, 1]$ 上二阶可导，且 $f''(x) > 0$。\n（I）证明：对于区间 $(0, 1)$ 内的任意不同的两点 $x_1, x_2$，有 $f[\\lambda x_1 + (1-\\lambda)x_2] < \\lambda f(x_1) + (1-\\lambda)f(x_2)$ $(0 < \\lambda < 1)$；\n（II）若 $\\int_0^1 f(x)\\,dx = 0$，证明：对任意 $x \\in [0, 1]$，有 $|f(x)| \\le \\max\\{f(0), f(1)\\}$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q21",
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
        "question": "【2026李林六套卷·数一·第2套 T21（12分）】设正定矩阵 $B = \\begin{pmatrix} a & 0 & -\\frac{1}{2} \\\\ 0 & 1 & 0 \\\\ -\\frac{1}{2} & 0 & a \\end{pmatrix}$ 有二重特征值，$A$ 为 3 阶实对称矩阵，且满足 $AB = 3A - B$。\n（I）求 $a$ 的值，并求正交矩阵 $Q$，使得 $Q^{-1} B Q = \\Lambda$；\n（II）求一个可逆线性变换 $\\boldsymbol{X} = P\\boldsymbol{Y}$，将 $\\boldsymbol{X}^T A B \\boldsymbol{X}$ 化为规范形。",
        "options": [],
        "correctAnswer": "（I）$a = \\frac{3}{2}$，$Q = \\begin{pmatrix}0 & \\frac{1}{\\sqrt{2}} & \\frac{1}{\\sqrt{2}} \\\\ 1 & 0 & 0 \\\\ 0 & -\\frac{1}{\\sqrt{2}} & \\frac{1}{\\sqrt{2}}\\end{pmatrix}$；（II）$P = \\begin{pmatrix}0 & 1 & \\frac{1}{2\\sqrt{2}} \\\\ \\sqrt{2} & 0 & 0 \\\\ 0 & -1 & \\frac{1}{2\\sqrt{2}}\\end{pmatrix}$，规范形 $y_1^2 + y_2^2 + y_3^2$。",
        "explanation": "**（I）**：特征值 $1, a+\\frac{1}{2}, a-\\frac{1}{2}$ 全正 $\\implies a > \\frac{1}{2}$，又重根必为 $a-\\frac{1}{2}=1 \\implies a = \\frac{3}{2}$（$B$ 特征值为 $1,1,2$）。\n对应 $\\lambda=1$ 正交单位特征向量 $(0,1,0)^T, \\frac{1}{\\sqrt{2}}(1,0,-1)^T$；对应 $\\lambda=2$ 为 $\\frac{1}{\\sqrt{2}}(1,0,1)^T$，拼成 $Q$。\n\n**（II）**：由 $AB = 3A - B \\implies A = B(3E - B)^{-1}$，故 $AB = B^2(3E-B)^{-1}$ 与 $B$ 共享同一正交对角阵 $Q$，且 $Q^T (AB) Q = \\text{diag}(\\frac{1}{2}, \\frac{1}{2}, 4)$。\n复合伸缩阵 $D = \\text{diag}(\\sqrt{2}, \\sqrt{2}, \\frac{1}{2})$，令 $P = QD$ 即得可逆变换将 $\\boldsymbol{X}^T AB\\boldsymbol{X}$ 化为规范形 $y_1^2 + y_2^2 + y_3^2$。",
        "steps": [
          "（3分）求特征值结合正定与二重特征值定 $a = 3/2$",
          "（4分）正交单位化构造正交矩阵 $Q$",
          "（3分）解出 $AB = B^2(3E-B)^{-1}$，得同正交基下特征值 $\\frac{1}{2}, \\frac{1}{2}, 4$",
          "（2分）复合尺度矩阵 $D$ 给出可逆阵 $P = QD$ 及规范形"
        ],
        "keyPoints": [
          "正定矩阵与特征值",
          "同时正交对角化",
          "二次型规范形的可逆变换构造"
        ],
        "difficulty": "困难",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第2套",
          "线代",
          "矩阵与二次型"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s2-q22",
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
        "question": "【2026李林六套卷·数一·第2套 T22（12分）】设随机变量 $X$ 与 $Y$ 相互独立且服从同一分布，当 $x \\le 0$ 时，$X$ 的概率密度 $f(x) = 0$，当 $x > 0$ 时，$f(x)$ 满足方程 $f'(x) + 2x f(x) = 0$。$Z = \\sqrt{X^2 + Y^2}$，求：\n（I）$Z$ 的分布函数与概率密度；\n（II）$D(Z)$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第二套-全真试题与全析.md"
      }
    ]
  },
  {
    "id": "paper-lilin6-2026-03",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第三套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 3/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖斜渐近线与可微性有界性判别、弧形面积与幂级数裂项求和、狄利克雷傅里叶级数、第一类曲面积分与球面对称、极值最值几何应用、矩阵相似对角化及独立样本估计方差。",
    "questions": [
      {
        "id": "lilin6-2026-s3-q01",
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
        "question": "【2026李林六套卷·数一·第3套 T1】曲线 $y = \\frac{1}{|x|-1} + \\ln(1 + e^{-x})$ 的渐近线的条数为（ ）。",
        "options": [
          "A. 1",
          "B. 2",
          "C. 3",
          "D. 4"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T2】设 $f(x) = (x - a)\\ln x - x$ 有两个极值点，则实数 $a$ 的取值范围为（ ）。",
        "options": [
          "A. $[-\\frac{1}{e}, +\\infty)$",
          "B. $(-\\frac{1}{e}, +\\infty)$",
          "C. $[-\\frac{1}{e}, 0)$",
          "D. $(-\\frac{1}{e}, 0)$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T3】下列函数在点 $P_0(0, 0)$ 处不可微，且 $f'_x(x, y)$ 在点 $P_0$ 的邻域内有界的是（ ）。",
        "options": [
          "A. $f(x, y) = \\sqrt{|xy|}$",
          "B. $f(x, y) = |xy|$",
          "C. $f(x, y) = \\sqrt[3]{xy}$",
          "D. $f(x, y) = \\begin{cases} \\frac{xy}{\\sqrt{x^2+y^2}}, & x^2+y^2 \\ne 0, \\\\ 0, & x^2+y^2 = 0 \\end{cases}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q04",
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
        "question": "【2026李林六套卷·数一·第3套 T4】设 $y = x\\sin x$ 在 $[0, n\\pi]$ 上与 $x$ 轴所围图形的面积为 $a_n$ $(n = 1, 2, \\cdots)$，则 $\\sum_{k=1}^{\\infty}\\frac{1}{\\sqrt{a_k a_{k+1}}} =$（ ）。",
        "options": [
          "A. $\\frac{1}{\\sqrt{\\pi}}$",
          "B. $\\frac{1}{\\pi}$",
          "C. $\\pi$",
          "D. $\\sqrt{\\pi}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T5】设向量组 $(\\text{I})\\ \\boldsymbol{\\alpha}_1 = (1, 1, 2)^T, \\boldsymbol{\\alpha}_2 = (2, 3, 3)^T$，$(\\text{II})\\ \\boldsymbol{\\beta}_1 = (2, 3, 5)^T, \\boldsymbol{\\beta}_2 = (-1, 0, 1)^T$，$k$ 为任意常数，则可由向量组 $(\\text{I})$ 线性表示，也可由向量组 $(\\text{II})$ 线性表示的列向量 $\\boldsymbol{\\gamma} =$（ ）。",
        "options": [
          "A. $k(2, 1, 3)^T$",
          "B. $k(-2, 1, 3)^T$",
          "C. $k(5, 6, 9)^T$",
          "D. $k(-5, 6, 9)^T$"
        ],
        "correctAnswer": "C",
        "explanation": "求两个二维子空间交集的一维基向量（或直接逐项检验是否满足 $r(\\boldsymbol{\\alpha}_1,\\boldsymbol{\\alpha}_2,\\boldsymbol{\\gamma})=2$ 且 $r(\\boldsymbol{\\beta}_1,\\boldsymbol{\\beta}_2,\\boldsymbol{\\gamma})=2$）：\n令 $\\boldsymbol{\\gamma} = x_1\\boldsymbol{\\alpha}_1 + x_2\\boldsymbol{\\alpha}_2 = y_1\\boldsymbol{\\beta}_1 + y_2\\boldsymbol{\\beta}_2$：\n- $(1,1,2)$ 与 $(2,3,3)$ 叉乘得法向量 $(-3, 1, 1)$，即子空间 $\\text{I}$ 满足 $-3z_1 + z_2 + z_3 = 0$；\n- $(2,3,5)$ 与 $(-1,0,1)$ 叉乘得法向量 $(3, -7, 3)$，即子空间 $\\text{II}$ 满足 $3z_1 - 7z_2 + 3z_3 = 0$。\n联立两平面交线方程：相加得 $-6z_2 + 4z_3 = 0 \\implies z_3 = \\frac{3}{2}z_2$，回代得 $z_1 = \\frac{5}{6}z_2$。取 $z_2 = 6$ 即得基向量 $(5, 6, 9)^T$。因此 $\\boldsymbol{\\gamma} = k(5, 6, 9)^T$。选 C。",
        "steps": [
          "分别求两二维生成子空间的法向量建立交线齐次方程组",
          "也可依次消元求解 $x_1\\boldsymbol{\\alpha}_1+x_2\\boldsymbol{\\alpha}_2 - y_1\\boldsymbol{\\beta}_1-y_2\\boldsymbol{\\beta}_2 = 0$",
          "解得一维公共交向量为 $k(5, 6, 9)^T$"
        ],
        "keyPoints": [
          "子空间的交",
          "线性表出",
          "齐次线性方程组求解"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第3套",
          "线代",
          "向量组"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "矩阵及其运算",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T6】设 $A, B, C$ 均为 $n$ 阶实矩阵，$A^T = A$，若对任意 $n$ 维非零列向量 $\\boldsymbol{X}$，都有 $\\text{tr}(AB\\boldsymbol{X}\\boldsymbol{X}^T) + \\text{tr}(\\boldsymbol{X}\\boldsymbol{X}^T AB) > 0$。矩阵 $\\begin{pmatrix} AB & O \\\\ B & BC \\end{pmatrix}, \\begin{pmatrix} B & A \\\\ O & AC \\end{pmatrix}, \\begin{pmatrix} A & C \\\\ O & AB \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
        "options": [
          "A. $r_1 \\ge r_2 \\ge r_3$",
          "B. $r_1 \\ge r_3 \\ge r_2$",
          "C. $r_3 \\ge r_1 = r_2$",
          "D. $r_2 \\ge r_3 = r_1$"
        ],
        "correctAnswer": "C",
        "explanation": "1. **关键推论（判定可逆性）**：利用迹的循环不变性化简条件：\n   $\\text{tr}(AB\\boldsymbol{X}\\boldsymbol{X}^T) + \\text{tr}(\\boldsymbol{X}\\boldsymbol{X}^T AB) = \\boldsymbol{X}^T AB\\boldsymbol{X} + \\boldsymbol{X}^T AB\\boldsymbol{X} = 2\\boldsymbol{X}^T AB\\boldsymbol{X} > 0$（对 $\\forall \\boldsymbol{X} \\ne \\mathbf{0}$ 成立）。\n   这立即推出 $AB$ 必可逆！（若存在 $\\boldsymbol{X} \\ne \\mathbf{0}$ 使 $AB\\boldsymbol{X}=\\mathbf{0}$，则 $\\boldsymbol{X}^T AB\\boldsymbol{X}=0$ 矛盾！）。\n   既然 $n$ 阶方阵 $AB$ 可逆，则 $|AB|=|A||B|\\ne 0 \\implies A$ 和 $B$ **均满秩可逆**！\n2. **分别计算 $r_1, r_2, r_3$**：\n   - 第一个矩阵作初等行/列变换：因为 $B$ 可逆，$\\begin{pmatrix} AB & O \\\\ B & BC \\end{pmatrix}$ 用行/列倍加消去 $AB$ 与 $BC$ 均不能全消？Wait！仔细化简：\n     左乘 $\\begin{pmatrix} E & -A \\\\ O & E \\end{pmatrix}$：$\\begin{pmatrix} AB - AB & -ABC \\\\ B & BC \\end{pmatrix} = \\begin{pmatrix} O & -ABC \\\\ B & BC \\end{pmatrix}$。再用 $B$ 可逆做列变换（第 2 列块减去 $C$ 倍第 1 列块），变为 $\\begin{pmatrix} O & -ABC \\\\ B & O \\end{pmatrix}$，因 $A,B$ 均可逆，故 $r_1 = r(B) + r(-ABC) = n + r(C)$！\n   - 第二个矩阵：右乘消去？注意 $A, B$ 可逆：用 $\\begin{pmatrix} B^{-1} & O \\\\ O & A^{-1} \\end{pmatrix}$ 左乘第二个矩阵 $\\begin{pmatrix} B & A \\\\ O & AC \\end{pmatrix}$ 得 $\\begin{pmatrix} E & B^{-1}A \\\\ O & C \\end{pmatrix}$！再列消元变为 $\\begin{pmatrix} E & O \\\\ O & C \\end{pmatrix}$，故 $r_2 = n + r(C)$！\n   - 第三个矩阵 $\\begin{pmatrix} A & C \\\\ O & AB \\end{pmatrix}$：由于 $A$ 可逆且 $AB$ 可逆，对其左下角为 $O$、两个主对角分块满秩的准上三角阵，不论 $C$ 是多少，整体行列式 $|A||AB| \\ne 0$，秩必定满秩 $r_3 = 2n$！\n综上，$r_3 = 2n \\ge n + r(C) = r_1 = r_2$。选 C。",
        "steps": [
          "（核心突破）将迹不等式化为 $\\boldsymbol{X}^T AB \\boldsymbol{X} > 0$ $(\\forall \\boldsymbol{X}\\ne\\mathbf{0})$，推得 $AB$ 可逆从而 $A, B$ 均满秩可逆",
          "利用 $A, B$ 可逆对前两个分块矩阵作可逆初等变换，均化简出 $r_1 = r_2 = n + r(C)$",
          "由分块上三角阵两对角块 $A, AB$ 均满秩，得出 $r_3 = 2n \\ge r_1 = r_2$"
        ],
        "keyPoints": [
          "迹与二次型结合判定矩阵可逆性",
          "分块矩阵的秩",
          "准对角化初等变换技巧"
        ],
        "difficulty": "困难",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第3套",
          "线代",
          "分块矩阵的秩"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T7】设 3 阶实矩阵 $A$ 满足 $A^2 + 2A = O$，则二次型 $\\boldsymbol{X}^T (E + A)^T (E + A) \\boldsymbol{X}$ 的规范形为（ ）。",
        "options": [
          "A. $y_1^2 + y_2^2 - y_3^2$",
          "B. $y_1^2 - y_2^2 - y_3^2$",
          "C. $y_1^2 + y_2^2 + y_3^2$",
          "D. $-y_1^2 - y_2^2 - y_3^2$"
        ],
        "correctAnswer": "C",
        "explanation": "注意由条件 $A^2 + 2A = O \\implies (E + A)^2 = E + 2A + A^2 = E$！\n这说明矩阵 $E + A$ 必定**可逆**（且其逆就是它本身）。\n对任意非零实列向量 $\\boldsymbol{X} \\ne \\mathbf{0}$，令 $\\boldsymbol{Z} = (E+A)\\boldsymbol{X} \\ne \\mathbf{0}$，则二次型为 $\\boldsymbol{X}^T (E+A)^T (E+A) \\boldsymbol{X} = \\boldsymbol{Z}^T \\boldsymbol{Z} = \\|\\boldsymbol{Z}\\|^2 > 0$。\n因此该二次型是正定二次型，正惯性指数为 $3$，规范形为 $y_1^2 + y_2^2 + y_3^2$。选 C。",
        "steps": [
          "配方得 $(E+A)^2 = E$，确证实矩阵 $E+A$ 可逆",
          "将二次型写成 $\\|(E+A)\\boldsymbol{X}\\|^2 > 0$ $(\\forall \\boldsymbol{X}\\ne\\mathbf{0})$，判定为正定二次型",
          "得规范形 $y_1^2 + y_2^2 + y_3^2$"
        ],
        "keyPoints": [
          "正定二次型定义",
          "矩阵多项式可逆判定"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第3套",
          "线代",
          "二次型"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q08",
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
        "question": "【2026李林六套卷·数一·第3套 T8】设 $A, B$ 是两个随机事件，$P(A) = 0.2$，$P(B \\mid A) = P(B \\mid \\bar{A})$，$P(A \\cup B) = 0.6$，则 $P(\\bar{A} \\cup \\bar{B}) =$（ ）。",
        "options": [
          "A. 0.4",
          "B. 0.5",
          "C. 0.8",
          "D. 0.9"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T9】设 $X_1, X_2$ 相互独立，且均服从参数为 $\\frac{1}{2}$ 的 $0-1$ 分布，记 $U = -(X_1 + X_2) + X_1 X_2$，$V = -(X_1 + X_2) - X_1 X_2$，则 $\\text{Cov}(U, V) =$（ ）。",
        "options": [
          "A. $\\frac{1}{16}$",
          "B. $\\frac{3}{16}$",
          "C. $\\frac{5}{16}$",
          "D. 0"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第3套 T10】设总体 $X \\sim N(\\mu, \\sigma^2)$ $(\\sigma > 0)$，从 $X$ 中分别抽取容量为 $n_1, n_2$ 的两个独立样本，其样本均值分别为 $\\bar{X}_1, \\bar{X}_2$。若使 $D[a\\bar{X}_1 + (1-a)\\bar{X}_2]$ 达到最小，则 $a =$（ ）。",
        "options": [
          "A. $\\frac{n_1}{n_1 + n_2}$",
          "B. $\\frac{n_2}{n_1 + n_2}$",
          "C. $\\frac{n_1 + n_2}{n_2}$",
          "D. $\\frac{n_1 + n_2}{n_1}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第3套 T11】设 $f(x) = (x^2 - 4x + 3)^n$，则 $f^{(n)}(1) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第3套 T12】设 $\\int_1^{+\\infty} \\frac{dx}{x(a+x^3)} = \\frac{1}{3}\\ln 2$ $(a > 0)$，则 $a =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q13",
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
        "question": "【2026李林六套卷·数一·第3套 T13】设 $f(x)$ 是以 $2$ 为周期的偶函数，$f(x) = \\begin{cases} x, & 0 \\le x \\le \\frac{1}{2}, \\\\ 2 - 2x, & \\frac{1}{2} < x \\le 1. \\end{cases}$ $S(x)$ 是 $f(x)$ 的傅里叶级数的和函数，且 $S(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} a_n \\cos n\\pi x$ $(-\\infty < x < +\\infty)$，当 $x \\in \\left[-3, -\\frac{5}{2}\\right]$ 时，$S(x) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q14",
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
        "question": "【2026李林六套卷·数一·第3套 T14】设曲面 $\\Sigma: x^2 + y^2 + z^2 = 2x$，$\\Sigma$ 的密度为 $\\rho = x^2 + y^2 + z^2$，则曲面 $\\Sigma$ 的质量 $m =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "矩阵及其运算",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第3套 T15】设 $A$ 的伴随矩阵 $A^* = \\begin{pmatrix} 1 & 0 & 0 \\\\ 1 & 1 & 0 \\\\ 1 & 1 & 1 \\end{pmatrix}$，3 阶矩阵 $B$ 满足 $A^{-1} B A + B A + 2E = O$，则行列式 $|B| =$ ______。",
        "options": [],
        "correctAnswer": "$-1$",
        "explanation": "先求 $|A|$：由 $|A^*| = |A|^{3-1} = |A|^2 = 1$，得 $|A| = \\pm 1$。\n由 $A A^* = |A| E \\implies A^{-1} = \\frac{1}{|A|} A^* = |A| A^*$。\n将矩阵方程右乘 $A^{-1}$ 整理得：$(A^{-1} + E)B = -2A^{-1}$。\n两边取行列式：$|A^{-1} + E|\\cdot |B| = (-2)^3 |A^{-1}| = -8 |A|$。\n分别检验 $|A| = \\pm 1$：\n- 若 $|A| = -1$，则 $A^{-1} = -A^*$，$A^{-1} + E = \\begin{pmatrix} 0 & 0 & 0 \\\\ -1 & 0 & 0 \\\\ -1 & -1 & 0 \\end{pmatrix}$ 不可逆，左端行列式为 $0$，而右端 $-8(-1) = 8 \\ne 0$，矛盾！故 $|A| \\ne -1$；\n- 故必有 $|A| = +1$，此时 $A^{-1} + E = \\begin{pmatrix} 2 & 0 & 0 \\\\ 1 & 2 & 0 \\\\ 1 & 1 & 2 \\end{pmatrix}$，行列式为 $8$，右端为 $-8$，故 $8|B| = -8 \\implies |B| = -1$。",
        "steps": [
          "由 $|A^*|=1$ 定 $|A| = \\pm 1$，并用 $A^{-1} = |A|A^*$ 写出 $A^{-1}$",
          "矩阵方程右乘 $A^{-1}$ 化简为 $(A^{-1}+E)B = -2A^{-1}$ 并两边取行列式",
          "利用矛盾排除 $|A|=-1$（左零右非零），代入 $|A|=1$ 解得 $|B|=-1$"
        ],
        "keyPoints": [
          "伴随矩阵行列式与逆矩阵公式",
          "矩阵方程化简取行列式"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第3套",
          "线代",
          "伴随矩阵"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q16",
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
        "question": "【2026李林六套卷·数一·第3套 T16】设随机变量 $X$ 与 $Y$ 相互独立，$X$ 服从区间 $(0, 1)$ 内的均匀分布，$Y$ 服从参数为 $\\lambda$ 的指数分布，则 $P\\left\\{1 \\le \\frac{Y}{X} \\le 2\\right\\} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q17",
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
        "question": "【2026李林六套卷·数一·第3套 T17（10分）】已知 $f(x)$ 在定义域 $(0, +\\infty)$ 内可导，且 $x f(x) = 1 + \\int_0^x u^2 f(u)\\,du$。求 $f(x)$ 在 $(0, +\\infty)$ 内的最小值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q18",
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
        "question": "【2026李林六套卷·数一·第3套 T18（12分）】设 $f(u)$ 在 $(0, +\\infty)$ 内具有二阶导数，$z = x f\\left(\\frac{y}{x}\\right) + y f\\left(\\frac{y}{x}\\right)$ 满足 $x\\frac{\\partial^2 z}{\\partial x \\partial y} + 2y\\frac{\\partial^2 z}{\\partial y^2} = \\frac{y}{x}$，$z(x, x) = x$，$\\left.\\frac{\\partial z}{\\partial x}\\right|_{(x, x)} = -\\frac{3}{2}$，求 $f(u)$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q19",
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
        "question": "【2026李林六套卷·数一·第3套 T19（12分）】设平面闭曲线 $L: (x^2 + y^2)^{\\frac{3}{2}} = 2\\sqrt{2} x y$，$x \\ge 0, y \\ge 0$，取逆时针方向，计算 $I = \\oint_L \\left(\\frac{1}{3}xy^3 - \\frac{1}{2}x^2y^2\\right)\\,dx + \\frac{1}{3}(x+y)^3\\,dy$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q20",
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
        "question": "【2026李林六套卷·数一·第3套 T20（12分）】设可导函数 $y = f(x)$ 满足 $[x - \\ln(1+x)]y\\,dx - x^2\\,dy = 0$ $(x > 0)$，$f(1) = 4$。\n（I）证明：$y = f(x)$ 是凸函数；\n（II）若 $(1+x)^{\\frac{1}{x}} + \\left(1 + \\frac{1}{x}\\right)^x \\le a$ $(a > 0)$，求 $a$ 的最小值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q21",
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
        "question": "【2026李林六套卷·数一·第3套 T21（12分）】设 $A = \\begin{pmatrix} a & 0 & 1 \\\\ 0 & -a & 0 \\\\ 1 & 0 & a \\end{pmatrix}$ 与 $B = \\begin{pmatrix} -1 & 1 & 0 \\\\ 1 & -1 & 0 \\\\ 0 & 0 & a^2 \\end{pmatrix}$ $(a \\ne 0)$ 相似。\n（I）求 $a$ 的值；\n（II）求正交矩阵 $Q$，使得 $Q^{-1} A Q = B$；\n（III）求一个 3 阶矩阵 $P$，使得 $AB = P^2$。",
        "options": [],
        "correctAnswer": "（I）$a = -1$；（II）$Q = \\begin{pmatrix}\\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}} \\\\ 0 & 1 & 0 \\\\ -\\frac{1}{\\sqrt{2}} & 0 & \\frac{1}{\\sqrt{2}}\\end{pmatrix}$（注意列对应或正交基组合构造，使 $Q^{-1}AQ=B$）；（III）$P = (AB)^2 = \\begin{pmatrix}-1&1&0\\\\0&0&1\\\\1&-1&0\\end{pmatrix}$。",
        "explanation": "**（I）**：算 $A$ 的特征值：$-a, a+1, a-1$；算 $B$ 的特征值：$0, -2, a^2$。\n由 $A \\sim B$ 特征值集合相等且 $a \\ne 0$，显然仅当 $a = -1$ 时，特征值集合同为 $\\{1, 0, -2\\}$。\n\n**（II）求正交矩阵 $Q$ 使 $Q^T A Q = B$**：\n当 $a=-1$ 时，$A = \\begin{pmatrix}-1&0&1\\\\0&1&0\\\\1&0&-1\\end{pmatrix}$，$B = \\begin{pmatrix}-1&1&0\\\\1&-1&0\\\\0&0&1\\end{pmatrix}$。\n仔细看结构：$B$ 是将 $A$ 的第 2、3 坐标对换得到的吗？不！令 $B$ 右下角 $1$ 对应 $A$ 的第 2 坐标（特征值 $1$），因此只需把第 2 坐标放到第 3 坐标，将第 1、3 坐标的 $\\begin{pmatrix}-1&1\\\\1&-1\\end{pmatrix}$ 放到左上角即可！\n检查置换矩阵 $Q = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 1 & 0 \\end{pmatrix}$（显然为正交阵，$Q^{-1}=Q^T$）！\n计算 $Q^T A Q$：对 $A$ 换第 2、3 行再换第 2、3 列：\n$\\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&1&0\\end{pmatrix}\\begin{pmatrix}-1&0&1\\\\0&1&0\\\\1&0&-1\\end{pmatrix}\\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&1&0\\end{pmatrix} = \\begin{pmatrix}-1&1&0\\\\1&-1&0\\\\0&0&1\\end{pmatrix} = B$！\n（亦可按标准分别找 $A$ 与 $B$ 的同一套对角化正交基 $Q_1^T A Q_1 = \\Lambda = Q_2^T B Q_2 \\implies Q = Q_1 Q_2^T$，结果同样可得该简洁正交阵。）\n\n**（III）构造 $P$ 使 $P^2 = AB$**：\n算得 $AB = \\begin{pmatrix}-1&0&1\\\\0&1&0\\\\1&0&-1\\end{pmatrix}\\begin{pmatrix}-1&1&0\\\\1&-1&0\\\\0&0&1\\end{pmatrix} = \\begin{pmatrix}1&-1&1\\\\1&-1&0\\\\-1&1&-1\\end{pmatrix}$。\n求 $AB$ 的特征多项式：$|\\lambda E - AB| = \\begin{vmatrix}\\lambda-1 & 1 & -1 \\\\ -1 & \\lambda+1 & 0 \\\\ 1 & -1 & \\lambda+1\\end{vmatrix} = \\lambda(\\lambda^2 + \\lambda + 1)$。\n由 Cayley-Hamilton 定理（或直接计算幂次）：$(AB)^3 + (AB)^2 + AB$? 不，特征方程 $\\lambda(\\lambda^2+\\lambda+1) = \\lambda^3+\\lambda^2+\\lambda = 0$，乘 $(\\lambda-1)$ 得 $\\lambda^4 - \\lambda = 0$！\n这意味着矩阵 $AB$ 满足极其优美的恒等式：$(AB)^4 = AB$！\n因此只需取 $P = (AB)^2 = \\begin{pmatrix} -1 & 1 & 0 \\\\ 0 & 0 & 1 \\\\ 1 & -1 & 0 \\end{pmatrix}$，立刻就有 $P^2 = (AB)^4 = AB$！",
        "steps": [
          "（3分）分别求 $A$ 与 $B$ 的特征值并比较集合定出 $a = -1$",
          "（5分）利用特征向量同构或直接构造置换正交阵 $Q = \\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&1&0\\end{pmatrix}$ 满足 $Q^{-1}AQ=B$",
          "（4分）算出 $AB$ 的特征多项式 $\\lambda(\\lambda^2+\\lambda+1)$ 发现 $(AB)^4 = AB$，从而直接取 $P = (AB)^2$"
        ],
        "keyPoints": [
          "实对称矩阵正交相似构造",
          "置换正交矩阵妙用",
          "矩阵高次幂周期性构造平方根矩阵"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第3套",
          "线代",
          "相似与正交"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s3-q22",
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
        "question": "【2026李林六套卷·数一·第3套 T22（12分）】设随机变量 $X$ 在区间 $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ 内服从均匀分布，$Y$ 的分布律为 $P\\{Y = 0\\} = P\\{Y = 1\\} = \\frac{1}{2}$，且 $X$ 与 $Y$ 相互独立，记 $Z = |\\sin X|$。\n（I）求 $Z$ 的概率密度；\n（II）求 $V = Y + Z$ 的概率密度。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第三套-全真试题与全析.md"
      }
    ]
  },
  {
    "id": "paper-lilin6-2026-04",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第四套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 4/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖分段周期极限与间断点、重积分交换次序与极坐标转换、带参数反常积分、微分方程求解、向量空间基变换与矩阵秩、二维分布独立性与最大似然估计。",
    "questions": [
      {
        "id": "lilin6-2026-s4-q01",
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
        "question": "【2026李林六套卷·数一·第4套 T1】设 $\\lim_{x\\to+\\infty}\\frac{1}{x^b}\\int_0^{x^2}\\sqrt{1 + t^4}\\,dt = a \\ne 0$，则（ ）。",
        "options": [
          "A. $a = 6, b = \\frac{1}{3}$",
          "B. $a = \\frac{1}{3}, b = 6$",
          "C. $a = -\\frac{1}{3}, b = -6$",
          "D. $a = -6, b = -\\frac{1}{3}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T2】已知方程 $\\int_1^x \\frac{\\ln t}{1 + t}\\,dt + \\int_1^{\\frac{1}{x}} \\frac{\\ln t}{1 + t}\\,dt = a$ $(x > 0)$ 有实根，则 $a$ 的取值范围为（ ）。",
        "options": [
          "A. $(0, +\\infty)$",
          "B. $[0, +\\infty)$",
          "C. $(0, 1)$",
          "D. $[1, +\\infty)$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T3】设可微函数 $f(x, y)$ 满足 $\\frac{\\partial f(x, y)}{\\partial x} + f(x, y) = 0$，且 $f(0, y) = 1 + y^2$，则 $df|_{(0, 1)} =$（ ）。",
        "options": [
          "A. $dx - dy$",
          "B. $-2dx + 2dy$",
          "C. $2dx - 2dy$",
          "D. $2dx + 2dy$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q04",
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
        "question": "【2026李林六套卷·数一·第4套 T4】下列级数中条件收敛的是（ ）。",
        "options": [
          "A. $\\sum_{n=1}^{\\infty}(-1)^n\\left[\\frac{1}{n\\sqrt{n}} + \\frac{1}{(n+1)^2}\\right]$",
          "B. $\\sum_{n=1}^{\\infty}(-1)^n\\left[\\frac{1}{\\sqrt{n}} + \\frac{(-1)^n}{n}\\right]$",
          "C. $\\sum_{n=1}^{\\infty}\\frac{(-1)^n\\sqrt{n}}{(n+1)\\sqrt{n+2}}\\sin\\frac{1}{\\sqrt{n}}$",
          "D. $\\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}}{n\\ln(1+n)}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T5】设 $A$ 是 $m\\times s$ 矩阵，$B$ 是 $s\\times n$ 矩阵，则方程组 $AB\\boldsymbol{X} = \\mathbf{0}$ 与 $B\\boldsymbol{X} = \\mathbf{0}$ 同解的充分必要条件是（ ）。",
        "options": [
          "A. $r(A) = s$",
          "B. $r(AB) = r(B)$",
          "C. $r(A) = r(B)$",
          "D. $r(A) = m$"
        ],
        "correctAnswer": "B",
        "explanation": "首先，$B\\boldsymbol{X} = \\mathbf{0} \\implies AB\\boldsymbol{X} = \\mathbf{0}$ 恒成立，即 $B\\boldsymbol{X} = \\mathbf{0}$ 的解集始终含于 $AB\\boldsymbol{X} = \\mathbf{0}$ 的解集。\n故两方程组同解当且仅当解空间维数相等，即 $n - r(AB) = n - r(B) \\iff r(AB) = r(B)$。选 B。（注：A 项只是充分条件而非必要条件，例如 $A$ 不列满秩但 $B$ 列空间落在 $A$ 零空间补上。）",
        "steps": [
          "确认包含关系：$\\text{Sol}(B\\boldsymbol{X}=0) \\subseteq \\text{Sol}(AB\\boldsymbol{X}=0)$",
          "两有限维子空间相等充要条件是维数相等：$n - r(AB) = n - r(B)$"
        ],
        "keyPoints": [
          "同解方程组",
          "矩阵的秩与解空间维数"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第4套",
          "线代",
          "同解问题"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T6】设 $A = \\begin{pmatrix} -1 & 1 \\\\ 1 & 1 \\end{pmatrix}$，非零实列向量 $\\boldsymbol{\\alpha} = (a, b)^T$，$\\boldsymbol{X} = (x_1, x_2, x_3)^T$，则二次型 $f(x_1, x_2, x_3) = \\boldsymbol{X}^T \\begin{pmatrix} A + \\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T & \\boldsymbol{\\alpha} \\\\ \\boldsymbol{\\alpha}^T & 1 \\end{pmatrix} \\boldsymbol{X}$ 的规范形为（ ）。",
        "options": [
          "A. $y_1^2 + y_2^2 + y_3^2$",
          "B. $-y_1^2 - y_2^2 - y_3^2$",
          "C. $y_1^2 + y_2^2 - y_3^2$",
          "D. $y_1^2 - y_2^2 - y_3^2$"
        ],
        "correctAnswer": "C",
        "explanation": "对分块对称矩阵作**合同消去变换**（配方法思想）消除非对角块 $\\boldsymbol{\\alpha}$！\n令 $P = \\begin{pmatrix} E_2 & \\mathbf{0} \\\\ -\\boldsymbol{\\alpha}^T & 1 \\end{pmatrix}$，计算合同变换矩阵：\n$P^T \\begin{pmatrix} A + \\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T & \\boldsymbol{\\alpha} \\\\ \\boldsymbol{\\alpha}^T & 1 \\end{pmatrix} P = \\begin{pmatrix} E_2 & -\\boldsymbol{\\alpha} \\\\ \\mathbf{0}^T & 1 \\end{pmatrix} \\begin{pmatrix} A + \\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T & \\boldsymbol{\\alpha} \\\\ \\boldsymbol{\\alpha}^T & 1 \\end{pmatrix} \\begin{pmatrix} E_2 & \\mathbf{0} \\\\ -\\boldsymbol{\\alpha}^T & 1 \\end{pmatrix} = \\begin{pmatrix} A & \\mathbf{0} \\\\ \\mathbf{0}^T & 1 \\end{pmatrix}$！\n太惊艳了！矩阵直接合同于 $\\text{diag}(A, 1)$！\n而 $|A| = -1 - 1 = -2 < 0$，说明 $A$ 的两个特征值一正一负，再加上最后的 $+1$，总共有 2 个正惯性指数、1 个负惯性指数，故规范形为 $y_1^2 + y_2^2 - y_3^2$。选 C。",
        "steps": [
          "构造下三角合同消元阵 $P = \\begin{pmatrix}E_2 & 0 \\\\ -\\boldsymbol{\\alpha}^T & 1\\end{pmatrix}$ 将 $\\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T$ 消去，合同于 $\\text{diag}(A, 1)$",
          "由 $|A| = -2 < 0$ 知 $A$ 含一正一负特征值，总计两正一负"
        ],
        "keyPoints": [
          "分块矩阵合同变换（配方法本质）",
          "惯性定理与规范形"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第4套",
          "线代",
          "二次型"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q07",
        "paperQuestionNumber": 7,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T7】若实矩阵 $A$ 与 $B$ 合同，则下列命题一定成立的个数为（ ）。\\n① $|A||B| \\ge 0$； ② $A$ 与 $B$ 等价； ③ $A$ 的行向量组与 $B$ 的行向量组等价； ④ 若 $B$ 可相似对角化，则 $A$ 也可相似对角化。",
        "options": [
          "A. 1",
          "B. 2",
          "C. 3",
          "D. 4"
        ],
        "correctAnswer": "B",
        "explanation": "$A$ 与 $B$ 合同指存在可逆矩阵 $C$ 使得 $C^T A C = B$：\n- **① 成立**：$|B| = |C|^2 |A|$，因 $|C|^2 > 0$，故 $|A||B| = |C|^2 |A|^2 \\ge 0$。\n- **② 成立**：因 $C^T$ 与 $C$ 均可逆，故 $B = C^T A C$ 说明 $A$ 与 $B$ 必等价（秩相等）。\n- **③ 不一定**：合同包含行变换 $C^T$，会改变列空间（行变换不改变行空间吗？不对！对 $A$ 左乘可逆矩阵 $C^T$ 才是行向量组的线性组合，不改行空间；但右乘 $C$ 会改变列之间的组合从而改变行向量组等价性！反例：$A = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$，取置换可逆矩阵 $C=\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$，则 $B = C^T A C = \\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}$，$A$ 的行向量组为 $(1,0)$，$B$ 的为 $(0,1)$，显然不等价！）。\n- **④ 不一定**：反例（一般矩阵合同）：若 $A$ 不对称，合同不保对称性也不保可相似对角化（比如取若尔当块 $J = \\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$ 或构造实矩阵，甚至取对称可对角化的 $B$ 和不可对角化的非对称 $A$：例如 $B = \\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$ 不可，反过来拿 $B = \\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}$ 是对称的怎么可能与非对称 $A$ 合同？注意 $B = C^T A C$ 若 $B$ 对称则 $A$ 必对称！那拿可对角化但**非对称**的 $B$ 呢？比如 $B = \\begin{pmatrix}1&1\\\\0&2\\end{pmatrix}$ 可对角化，取 $C = \\begin{pmatrix}1&0\\\\c&1\\end{pmatrix}$ 可构造出某 $A$ 使 $A$ 拥有重特征值不可对角化，例如 $A=\\begin{pmatrix}1&1\\\\-1&3\\end{pmatrix}$ 特征值为二重 2 且 $r(2E-A)=1$ 不可对角化，取 $C=\\begin{pmatrix}1&0\\\\0&2\\end{pmatrix}$，则 $C^T A C = \\begin{pmatrix}1&2\\\\-2&12\\end{pmatrix}$ 特征多项式 $(\\lambda-1)(\\lambda-12)+4 = \\lambda^2-13\\lambda+16$ 判别式大于 0 有两不同实根从而**可相似对角化**！绝妙的反例！！）。\n综上，仅有 ①② 2 个命题一定成立。选 B。",
        "steps": [
          "验证 $|B|=|C|^2|A|$ 得 ① 恒成立；由 $C^T, C$ 可逆得等价 ② 恒成立",
          "构造对换阵反例证明行向量组未必等价（③ 错）",
          "利用非对称矩阵一般合同不保持相似特征值重数，举反例否决 ④"
        ],
        "keyPoints": [
          "矩阵合同性质",
          "等价/相似/合同对比",
          "非对称矩阵合同反例"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第4套",
          "线代",
          "合同与等价"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q08",
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
        "question": "【2026李林六套卷·数一·第4套 T8】设 $A_1, A_2, B$ 是随机事件，$0 < P(B) < 1$，且 $P[(A_1 + A_2) \\mid B] = P(A_1 \\mid B) + P(A_2 \\mid B)$，则（ ）。",
        "options": [
          "A. $P(A_1 + A_2) = P(A_1) + P(A_2)$",
          "B. $P(A_1 + A_2) = P(A_1 \\mid B) + P(A_2 \\mid B)$",
          "C. $P(A_1 B + A_2 B) = P(A_1 B) + P(A_2 B)$",
          "D. $P[(A_1 + A_2) \\mid \\bar{B}] = P(A_1 \\mid \\bar{B}) + P(A_2 \\mid \\bar{B})$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "一维随机变量及其分布",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T9】设随机变量 $X$ 在 $(0, 1)$ 内服从均匀分布，则 $P\\{1 \\le X^{\\ln X} \\le e\\} =$（ ）。",
        "options": [
          "A. $\\frac{1}{e}$",
          "B. $1 - \\frac{1}{e}$",
          "C. $\\frac{1}{\\sqrt{e}}$",
          "D. $1 - \\frac{1}{\\sqrt{e}}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "大数定律与中心极限定理",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第4套 T10】设 $X_1, X_2, \\cdots, X_n$ 为来自总体 $X$ 的简单随机样本，$X$ 服从参数 $\\lambda = 1$ 的泊松分布，$\\Phi(x)$ 为 $N(0, 1)$ 的分布函数，则 $\\lim_{n\\to\\infty} P\\left\\{\\sum_{k=1}^n X_k \\le n\\right\\} =$（ ）。",
        "options": [
          "A. $\\Phi(0)$",
          "B. $\\Phi(\\frac{1}{2})$",
          "C. $\\Phi(1)$",
          "D. $\\Phi(\\sqrt{2})$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q11",
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
        "question": "【2026李林六套卷·数一·第4套 T11】设 $a_n = \\left(\\frac{n+2}{3n-2} \\cdot \\frac{n+4}{3n-4} \\cdots \\frac{n+2n}{3n-2n}\\right)^{\\frac{1}{n}}$，则 $\\lim_{n\\to\\infty} a_n =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第4套 T12】设 $f(x)$ 连续，$\\lim_{x\\to 0}\\frac{\\ln[f(x+1) + e^{x^2}]}{x} = 1$，则 $\\lim_{x\\to 0}\\frac{f[(1+\\tan x)^2] - f(1+\\tan x)}{x} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第4套 T13】$\\sum_{k=1}^{\\infty} \\int_k^{k+1} \\frac{\\arctan x}{x^2}\\,dx =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第4套 T14】$\\sum_{n=1}^{\\infty} \\frac{2n - 1}{2^{2n-1}}$ 的和为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q15",
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
        "question": "【2026李林六套卷·数一·第4套 T15】设 $A, B$ 均为 3 阶矩阵，$A$ 的特征值为 $0, \\frac{1}{2}, \\frac{1}{3}$，且 $B(E - A) = A$，其中 $E$ 为 3 阶单位矩阵，则 $\\text{tr}(A + B) =$ ______。",
        "options": [],
        "correctAnswer": "$\\frac{7}{3}$",
        "explanation": "因 $A$ 的特征值不含 $1$，故 $E - A$ 可逆，解得 $B = A(E - A)^{-1}$。\n从而 $A + B = A + A(E-A)^{-1}$。对于 $A$ 的任一特征值 $\\lambda$，对应 $A+B$ 的特征值为 $\\lambda + \\frac{\\lambda}{1-\\lambda}$：\n- $\\lambda_1 = 0 \\implies 0$；\n- $\\lambda_2 = \\frac{1}{2} \\implies \\frac{1}{2} + 1 = \\frac{3}{2}$；\n- $\\lambda_3 = \\frac{1}{3} \\implies \\frac{1}{3} + \\frac{1}{2} = \\frac{5}{6}$。\n故 $\\text{tr}(A + B) = 0 + \\frac{3}{2} + \\frac{5}{6} = \\frac{14}{6} = \\frac{7}{3}$。",
        "steps": [
          "确定 $E-A$ 可逆解得 $B = A(E-A)^{-1}$",
          "算出 $A+B$ 的特征值 $0, 3/2, 5/6$ 求迹得 $\\frac{7}{3}$"
        ],
        "keyPoints": [
          "矩阵的迹与特征值之和",
          "矩阵表达式的特征值映射"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第4套",
          "线代",
          "特征值"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第4套 T16】设总体 $X$ 与总体 $Y$ 相互独立，且都服从 $N(0, \\sigma^2)$ $(\\sigma > 0)$，$X_1, X_2, \\cdots, X_n$ 与 $Y_1, Y_2, \\cdots, Y_m$ 分别为来自总体 $X$ 与 $Y$ 的简单随机样本，若 $T = \\frac{2\\sum_{i=1}^n X_i}{\\sqrt{\\sum_{i=1}^m Y_i^2}}$ 服从 $t$ 分布，则 $\\frac{n}{m} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q17",
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
        "question": "【2026李林六套卷·数一·第4套 T17（10分）】设 $M(x, y)$ 是曲线 $y = f(x)$ $(y > 0)$ 上任一点，曲线在点 $M$ 处的切线交 $y$ 轴于点 $P$，若 $|MP| = |PO|$，其中 $O$ 为坐标原点，且曲线过点 $(4, 3)$。求 $y = f(x)$ 的表达式，并求 $f(x)$ 的极值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第4套 T18（12分）】设 $f(x) = \\frac{(x - a)^2}{\\ln x}$ $(x > 0)(0 < a < 1)$，若 $f(x)$ 的 3 个极值点为 $x_1, x_2, x_3$，且 $x_1 < x_2 < x_3$。\n（I）求 $f(x)$ 的极大值；\n（II）证明：$x_1 + x_3 > \\frac{2}{\\sqrt{e}}$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q19",
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
        "question": "【2026李林六套卷·数一·第4套 T19（12分）】设曲面 $z = 1 + x^2 + y^2$ 上点 $P_0(x_0, y_0, z_0)$ 处的切平面为 $\\Pi$，$\\Pi$ 与 $z = x^2 + y^2$ 的交线为 $L$，从 $z$ 轴正向看 $L$ 是逆时针方向，切平面 $\\Pi$ 与 $z = x^2 + y^2$ 所围立体为 $\\Omega$。\n（I）计算 $I = \\oint_L y\\,dx - x\\,dy + (z - x^2 - y^2)\\,dz$；\n（II）求 $\\Omega$ 的体积。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q20",
        "paperQuestionNumber": 20,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第4套 T20（12分）】设 $f(x)$ 有连续导数，$f(x)$ 不恒为零，且 $\\int_0^1 f(x)\\,dx = 0$，记 $M = \\max_{x \\in [0, 1]} |f'(x)|$。\n（I）证明：对于 $\\forall x \\in [0, 1]$，有 $|f(x)| \\le \\frac{1}{2}M$；\n（II）设 $D = \\{(x, y) \\mid 0 \\le x \\le 1, 0 \\le y \\le x\\}$，证明：$\\left|\\iint_D f(y)\\,dxdy\\right| \\le \\frac{1}{8}M$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q21",
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
        "question": "【2026李林六套卷·数一·第4套 T21（12分）】设二次型 $f(x_1, x_2, x_3) = 2(x_1^2 + x_2^2 + x_3^2) + 2a(x_1 x_2 + x_1 x_3 + x_2 x_3)$，$a$ 为正整数。\n（I）求正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$，将 $f(x_1, x_2, x_3)$ 化为标准形；\n（II）若存在可逆矩阵 $P$，对任意 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，有 $f(x_1, x_2, x_3) = \\|P\\boldsymbol{X}\\|^2$，求 $a$ 的值及 $P$。",
        "options": [],
        "correctAnswer": "（I）$Q = \\begin{pmatrix} -\\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ \\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ 0 & \\frac{2}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\end{pmatrix}$，标准形 $(2-a)y_1^2 + (2-a)y_2^2 + (2+2a)y_3^2$；（II）$a = 1$，$P = \\text{diag}(1, 1, 2) Q^T$（或可任意左乘正交阵，取对称正定平方根 $P = Q \\text{diag}(1, 1, 2) Q^T = \\frac{1}{3}\\begin{pmatrix}4&1&1\\\\1&4&1\\\\1&1&4\\end{pmatrix}$ 或用配方法得上三角阵）。",
        "explanation": "**（I）**：二次型矩阵为 $A = \\begin{pmatrix} 2 & a & a \\\\ a & 2 & a \\\\ a & a & 2 \\end{pmatrix} = (2-a)E + a\\boldsymbol{1}\\boldsymbol{1}^T$。\n因为 $a$ 为正整数，$a \\ne 0$，故 $A$ 的特征值为 $\\lambda_1 = \\lambda_2 = 2 - a$（二重），$\\lambda_3 = 2 + 2a$（单重）。\n施密特正交化得出正交单位向量构成：\n$Q = \\begin{pmatrix} -\\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ \\frac{1}{\\sqrt{2}} & -\\frac{1}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\\\ 0 & \\frac{2}{\\sqrt{6}} & \\frac{1}{\\sqrt{3}} \\end{pmatrix}$。\n正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$ 化为标准形 $f = (2-a)y_1^2 + (2-a)y_2^2 + (2+2a)y_3^2$。\n\n**（II）**：由于 $\\|P\\boldsymbol{X}\\|^2 = \\boldsymbol{X}^T (P^T P)\\boldsymbol{X}$，条件等价于 $A = P^T P$。因为 $P$ 可逆，所以 $A$ 必须为**正定矩阵**！\n这要求所有特征值严格大于 0：$2 - a > 0 \\implies a < 2$。\n又已知 $a$ 为正整数，故唯一解为 $a = 1$！\n当 $a = 1$ 时特征值为 $1, 1, 4$，令 $\\Lambda^{\\frac{1}{2}} = \\text{diag}(1, 1, 2)$。因 $A = Q \\Lambda Q^T = (\\Lambda^{\\frac{1}{2}} Q^T)^T (\\Lambda^{\\frac{1}{2}} Q^T)$，故可取：\n$P = \\Lambda^{\\frac{1}{2}} Q^T = \\begin{pmatrix} -\\frac{1}{\\sqrt{2}} & \\frac{1}{\\sqrt{2}} & 0 \\\\ -\\frac{1}{\\sqrt{6}} & -\\frac{1}{\\sqrt{6}} & \\frac{2}{\\sqrt{6}} \\\\ \\frac{2}{\\sqrt{3}} & \\frac{2}{\\sqrt{3}} & \\frac{2}{\\sqrt{3}} \\end{pmatrix}$（或取对称矩阵 $P = Q \\Lambda^{\\frac{1}{2}} Q^T = \\frac{1}{3}\\begin{pmatrix}4&1&1\\\\1&4&1\\\\1&1&4\\end{pmatrix}$，或由配方法得 $P = \\begin{pmatrix}1&1/2&1/2\\\\0&\\sqrt{3}/2&\\sqrt{3}/6\\\\0&0&\\sqrt{6}/3\\end{pmatrix}$ 均正确）。",
        "steps": [
          "（5分）分解 $A = (2-a)E + a\\mathbf{1}\\mathbf{1}^T$ 求特征值 $2-a, 2-a, 2+2a$ 及正交阵 $Q$",
          "（3分）识别 $f = \\|P\\boldsymbol{X}\\|^2 \\iff A = P^T P$ 且 $P$ 可逆等价于 $A$ 正定，由 $2-a>0$ 与正整数条件解得 $a=1$",
          "（4分）取正特征值平方根矩阵构造可逆阵 $P = \\Lambda^{1/2}Q^T$（或对称开方 / Cholesky 配方法矩阵）"
        ],
        "keyPoints": [
          "实对称矩阵正交化",
          "正定矩阵分解 A=P^TP",
          "正整数约束定参"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第4套",
          "线代",
          "二次型与正定分解"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s4-q22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第4套 T22（12分）】设随机变量 $X$ 与 $Y$ 相互独立，且服从同一分布 $N\\left(\\mu, \\frac{\\sigma^2}{2}\\right)$，其中 $\\sigma$ $(\\sigma > 0)$ 是未知参数，记 $Z = X - Y$。\n（I）若 $Z_1, Z_2, \\cdots, Z_{2n}$ $(n \\ge 2)$ 是总体 $Z$ 的简单随机样本，求 $\\sigma^2$ 的最大似然估计量 $\\widehat{\\sigma^2}$；\n（II）记 $U = \\sum_{i=1}^{n+1} Z_i$，$V = \\sum_{i=n}^{2n} Z_i$，求相关系数 $\\rho_{UV}$（注：原卷印刷写“利用 (I) 的 $\\widehat{\\sigma^2}$，求相关系数 $\\rho_{UV}$”，实质在求线性相关系数时总体方差 $\\sigma^2$ 或替换估计 $\\widehat{\\sigma^2}$ 分子分母完全相消）。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第四套-全真试题与全析.md"
      }
    ]
  },
  {
    "id": "paper-lilin6-2026-05",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第五套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 5/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖有理逼近泰勒展开、参数方程高阶可导性、函数方程积分比较、半球体抽水做功物理应用、橄榄叶对称二重积分、高阶插值余项/罗尔中值证明、舒尔补二次型与正态/Gamma分布卷积。",
    "questions": [
      {
        "id": "lilin6-2026-s5-q01",
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
        "question": "【2026李林六套卷·数一·第5套 T1】设当 $x \\to 0$ 时，有 $\\cot x = \\frac{1 + ax^2}{x + bx^3} + o(x^5)$，则（ ）。",
        "options": [
          "A. $a = \\frac{2}{5}, b = -\\frac{1}{15}$",
          "B. $a = -\\frac{2}{5}, b = \\frac{1}{15}$",
          "C. $a = -\\frac{2}{5}, b = -\\frac{1}{15}$",
          "D. $a = \\frac{2}{5}, b = \\frac{1}{15}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q02",
        "paperQuestionNumber": 2,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "导数与微分",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T2】设 $y = f(x)$ 由 $\\begin{cases} x = 2t + |t|, \\\\ y = |t|(e^{|t|} - 1) \\end{cases}$ 确定，则 $f(x)$ 在 $x = 0$ 处（ ）。",
        "options": [
          "A. 连续但不可导",
          "B. 可导但导函数不连续",
          "C. 可导且导函数连续",
          "D. 二阶可导"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q03",
        "paperQuestionNumber": 3,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T3】已知连续函数 $f(x)$ 满足 $f(x + 2) - f(x) = \\sin x$，$\\int_0^2 f(x)\\,dx = 0$，令 $I_1 = \\int_1^3 f(x)\\,dx$，$I_2 = \\int_2^4 f(x)\\,dx$，则（ ）。",
        "options": [
          "A. $I_1 > I_2 > 0$",
          "B. $I_2 > I_1 > 0$",
          "C. $I_1 > 0 > I_2$",
          "D. $I_1 < I_2 < 0$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q04",
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
        "question": "【2026李林六套卷·数一·第5套 T4】已知重力加速度为 $g$，一个半径为 $1$ 的半球体容器盛满密度为 $\\rho$ 的水，现要将水从容器顶部全部抽出，有 (a)、(b) 两种抽水方案，如图所示，则采用方案 (a) 与方案 (b) 抽水所做功的差为（ ）。\n\n![第5套T4 半球体抽水方案(a)与(b)示意图](/images/lilin6/s5_q4.png)",
        "options": [
          "A. $0$",
          "B. $\\frac{1}{12}\\rho g\\pi$",
          "C. $\\frac{1}{6}\\rho g\\pi$",
          "D. $\\frac{1}{4}\\rho g\\pi$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T5】设 $\\boldsymbol{A}$ 是 $3$ 阶矩阵，$\\boldsymbol{b}$ 是 $3$ 维非零列向量，则下列说法中正确的是（ ）。\n① 若 $\\boldsymbol{Ax} = \\boldsymbol{b}$ 有解，则 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 有解；\n② 若 $\\boldsymbol{Ax} = \\boldsymbol{b}$ 有解，则 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 无解；\n③ 若 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 有解，则 $\\boldsymbol{Ax} = \\boldsymbol{0}$ 有非零解；\n④ 若 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 无解，则 $\\boldsymbol{Ax} = \\boldsymbol{0}$ 只有零解。",
        "options": [
          "A. ①③",
          "B. ①④",
          "C. ②③",
          "D. ②④"
        ],
        "correctAnswer": "C",
        "explanation": "利用矩阵秩与内积反证法（Fredholm 择一性定理）：\n设存在向量 $\\boldsymbol{x}_0$ 满足 $\\boldsymbol{A}\\boldsymbol{x}_0 = \\boldsymbol{b}$，且假定同时存在 $\\boldsymbol{y}_0$ 满足 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{y}_0 = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$，即 $\\boldsymbol{A}^T\\boldsymbol{y}_0 = \\boldsymbol{0}$ 且 $\\boldsymbol{b}^T\\boldsymbol{y}_0 = 1$。\n两边左乘 $\\boldsymbol{x}_0^T$ 得：\n$$1 = \\boldsymbol{b}^T \\boldsymbol{y}_0 = (\\boldsymbol{Ax}_0)^T \\boldsymbol{y}_0 = \\boldsymbol{x}_0^T \\boldsymbol{A}^T \\boldsymbol{y}_0 = \\boldsymbol{x}_0^T \\boldsymbol{0} = 0$$\n产生矛盾！由此立即证明：**若 $\\boldsymbol{Ax} = \\boldsymbol{b}$ 有解，则 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 必无解**，故 **② 正确**、① 错误！\n再看 ③ 和 ④：若 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 有解 $\\boldsymbol{y}_0$，显然由 $\\boldsymbol{b}^T\\boldsymbol{y}_0 = 1 \\ne 0$ 可知 $\\boldsymbol{y}_0 \\ne \\boldsymbol{0}$ 且 $\\boldsymbol{A}^T\\boldsymbol{y}_0 = \\boldsymbol{0}$，于是 $r(\\boldsymbol{A}) = r(\\boldsymbol{A}^T) < 3$，故齐次方程组 $\\boldsymbol{Ax} = \\boldsymbol{0}$ 必有非零解！因此 **③ 正确**！\n至于 ④，即使 $\\boldsymbol{b}$ 可由 $\\boldsymbol{A}$ 的列向量线性表示（此时该分块方程无解），$\\boldsymbol{A}$ 也完全可能降秩（例如取 $\\boldsymbol{A}=\\begin{pmatrix}1&0&0\\\\0&0&0\\\\0&0&0\\end{pmatrix}, \\boldsymbol{b}=\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}$），此时 $\\boldsymbol{Ax}=\\boldsymbol{0}$ 仍有无穷多非零解，故 ④ 错。选 C。",
        "steps": [
          "利用列空间与零空间正交关系（$\\boldsymbol{b}^T\\boldsymbol{y} = \\boldsymbol{x}_0^T\\boldsymbol{A}^T\\boldsymbol{y}=0$ 矛盾）证明 ② 正确",
          "由 $\\boldsymbol{A}^T\\boldsymbol{y}_0=\\boldsymbol{0}$ 且 $\\boldsymbol{y}_0\\ne\\boldsymbol{0}$ 推知 $r(\\boldsymbol{A}) = r(\\boldsymbol{A}^T) < 3$，从而 $\\boldsymbol{Ax}=\\boldsymbol{0}$ 必有非零解，证明 ③ 正确",
          "构造降秩反例说明 ④ 错误，锁定答案 ②③"
        ],
        "keyPoints": [
          "非齐次线性方程组解的判定",
          "正交补与转置矩阵的秩",
          "Fredholm择一性定理"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第5套",
          "线代",
          "线性方程组"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "二次型",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T6】设 $3$ 阶实对称矩阵 $\\boldsymbol{A}$ 的特征值为 $-1, -2, 1$，交换 $\\boldsymbol{A}$ 的第 $2$ 列与第 $3$ 列，再将第 $2$ 列乘以 $(-1)$ 得 $\\boldsymbol{B}$。交换 $\\boldsymbol{B}$ 的第 $2$ 行与第 $3$ 行，再将第 $2$ 行乘以 $(-1)$ 得 $\\boldsymbol{C}$，则二次型 $\\boldsymbol{X}^T\\boldsymbol{C}\\boldsymbol{X}$ 在正交变换 $\\boldsymbol{X} = \\boldsymbol{QY}$ 下的标准形为（ ）。",
        "options": [
          "A. $-y_1^2 + y_2^2 - 2y_3^2$",
          "B. $-y_1^2 + y_2^2 + 2y_3^2$",
          "C. $-y_1^2 + 2y_2^2 - y_3^2$",
          "D. $-y_1^2 - 2y_2^2 - y_3^2$"
        ],
        "correctAnswer": "A",
        "explanation": "用初等矩阵表示列变换与行变换（特别注意操作顺序！）：\n1. 对 $\\boldsymbol{A}$ 先交换第 $2, 3$ 列（右乘 $\\boldsymbol{E}(2,3)$），再将第 $2$ 列乘 $(-1)$（右乘 $\\boldsymbol{E}_2(-1)$），得：\n   $$\\boldsymbol{B} = \\boldsymbol{A}\\boldsymbol{E}(2,3)\\boldsymbol{E}_2(-1)$$\n2. 对 $\\boldsymbol{B}$ 先交换第 $2, 3$ 行（左乘 $\\boldsymbol{E}(2,3)$），再将第 $2$ 行乘 $(-1)$（左乘 $\\boldsymbol{E}_2(-1)$），得：\n   $$\\boldsymbol{C} = \\boldsymbol{E}_2(-1)\\boldsymbol{E}(2,3)\\boldsymbol{A}\\boldsymbol{E}(2,3)\\boldsymbol{E}_2(-1)$$\n3. 令 $\\boldsymbol{P} = \\boldsymbol{E}(2,3)\\boldsymbol{E}_2(-1)$。注意到初等矩阵 $\\boldsymbol{E}(2,3)$ 与 $\\boldsymbol{E}_2(-1)$ 均是实对称矩阵且互逆矩阵就是自身（正交矩阵！），所以：\n   $$\\boldsymbol{P}^T = (\\boldsymbol{E}_2(-1))^T (\\boldsymbol{E}(2,3))^T = \\boldsymbol{E}_2(-1)\\boldsymbol{E}(2,3) = \\boldsymbol{P}^{-1}$$\n   即 $\\boldsymbol{C} = \\boldsymbol{P}^T \\boldsymbol{A} \\boldsymbol{P} = \\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}$！\n这说明 $\\boldsymbol{C}$ 与 $\\boldsymbol{A}$ 不仅**合同**，而且直接**正交相似**！因此 $\\boldsymbol{C}$ 与 $\\boldsymbol{A}$ 具有完全相同的特征值 $-1, -2, 1$（两个负特征值，一个正特征值；或直接由系数符号与绝对值知正交标准形必含系数 $-1, -2, 1$），只有 A 选项系数集合为 $\\{-1, 1, -2\\}$。选 A。",
        "steps": [
          "分别将行变换和列变换写成左乘和右乘初等矩阵 $\\boldsymbol{C} = \\boldsymbol{E}_2(-1)\\boldsymbol{E}(2,3)\\boldsymbol{A}\\boldsymbol{E}(2,3)\\boldsymbol{E}_2(-1)$",
          "验证变换矩阵 $\\boldsymbol{P} = \\boldsymbol{E}(2,3)\\boldsymbol{E}_2(-1)$ 为正交矩阵（$\\boldsymbol{P}^T = \\boldsymbol{P}^{-1}$）",
          "由正交相似不改变特征值可知 $\\boldsymbol{C}$ 的特征值仍为 $-1, -2, 1$，对应标准形选 A"
        ],
        "keyPoints": [
          "初等变换与正交相似",
          "正交变换化二次型标准形",
          "特征值不变性"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第5套",
          "线代",
          "二次型"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q07",
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
        "question": "【2026李林六套卷·数一·第5套 T7】设 $n$ 阶非零实矩阵 $\\boldsymbol{A}$ 满足 $\\boldsymbol{A}^T + \\boldsymbol{A} = \\boldsymbol{O}$，$\\boldsymbol{B}$ 为 $n$ 阶矩阵，矩阵 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{E} \\\\ -\\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{A}-\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{A} & \\boldsymbol{AB} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{A}+\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{A}-\\boldsymbol{E} \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
        "options": [
          "A. $r_1 \\ge r_2 \\ge r_3$",
          "B. $r_3 \\ge r_2 \\ge r_1$",
          "C. $r_2 \\ge r_1 \\ge r_3$",
          "D. $r_3 \\ge r_1 \\ge r_2$"
        ],
        "correctAnswer": "D",
        "explanation": "先用反对称矩阵性质判断 $\\boldsymbol{A} \\pm \\boldsymbol{E}$ 的可逆性：\n由于 $\\boldsymbol{A}^T = -\\boldsymbol{A}$，任取特征值 $\\lambda$，设对应特征向量为 $\\boldsymbol{\\alpha} \\ne \\boldsymbol{0}$，考察 $\\boldsymbol{\\alpha}^H \\boldsymbol{A} \\boldsymbol{\\alpha}$（实反对称矩阵的实特征值只能为 $0$，若 $\\lambda \\in \\mathbb{R}$ 则 $\\boldsymbol{\\alpha}^T\\boldsymbol{A}\\boldsymbol{\\alpha} = 0 \\implies \\lambda\\boldsymbol{\\alpha}^T\\boldsymbol{\\alpha} = 0 \\implies \\lambda = 0$，即反对称实阵没有任何非零实特征值！），因此 $\\pm 1$ 都不是 $\\boldsymbol{A}$ 的特征值，即 $|\\boldsymbol{A} + \\boldsymbol{E}| \\ne 0$ 且 $|\\boldsymbol{A} - \\boldsymbol{E}| \\ne 0$，$\\boldsymbol{A} \\pm \\boldsymbol{E}$ 均**可逆**！\n\n逐个计算三个分块矩阵的秩：\n1. 对于第 3 个矩阵：$r_3 = r\\begin{pmatrix} \\boldsymbol{A}+\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{A}-\\boldsymbol{E} \\end{pmatrix}$。因主对角分块均满秩可逆，该分块下三角矩阵可逆，故 $r_3 = 2n$（取最大可能值）！\n2. 对于第 1 个矩阵：第 1 列块加第 2 列块：\n   $$\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{E} \\\\ -\\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} \\xrightarrow{c_1+c_2} \\begin{pmatrix} \\boldsymbol{A}+\\boldsymbol{E} & \\boldsymbol{E} \\\\ \\boldsymbol{O} & \\boldsymbol{B} \\end{pmatrix}$$\n   再用 $\\boldsymbol{A}+\\boldsymbol{E}$ 消去右上角（因为可逆），或注意 $r\\begin{pmatrix} \\boldsymbol{A}+\\boldsymbol{E} & \\boldsymbol{E} \\\\ \\boldsymbol{O} & \\boldsymbol{B} \\end{pmatrix} = r(\\boldsymbol{A}+\\boldsymbol{E}) + r(\\boldsymbol{B}) = n + r(\\boldsymbol{B})$！（左乘分块阵 $\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{E} \\end{pmatrix}$ 并右乘消去 $\\boldsymbol{E}$ 得 $\\text{diag}(\\boldsymbol{A}+\\boldsymbol{E}, \\boldsymbol{B})$）。故 $r_1 = n + r(\\boldsymbol{B})$。\n3. 对于第 2 个矩阵：$\\boldsymbol{A} - \\boldsymbol{E}$ 可逆，左乘消去第 2 行第 1 列块 $\\boldsymbol{A}$ 后变为 $\\begin{pmatrix} \\boldsymbol{A}-\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{AB} \\end{pmatrix}$，故 $r_2 = r(\\boldsymbol{A}-\\boldsymbol{E}) + r(\\boldsymbol{AB}) = n + r(\\boldsymbol{AB})$。\n\n由矩阵乘法秩不等式 $r(\\boldsymbol{AB}) \\le r(\\boldsymbol{B}) \\le n$，立刻得到：\n$$r_3 = 2n \\ge n + r(\\boldsymbol{B}) = r_1 \\ge n + r(\\boldsymbol{AB}) = r_2$$\n即 $r_3 \\ge r_1 \\ge r_2$。选 D。",
        "steps": [
          "由反对称实矩阵 $\\boldsymbol{A}^T=-\\boldsymbol{A}$ 无非零实特征值证明 $\\boldsymbol{A}+\\boldsymbol{E}$ 与 $\\boldsymbol{A}-\\boldsymbol{E}$ 均可逆",
          "直接判定 $r_3 = 2n$，并通过分块初等变换化简得出 $r_1 = n + r(\\boldsymbol{B})$ 与 $r_2 = n + r(\\boldsymbol{AB})$",
          "结合 $r(\\boldsymbol{AB}) \\le r(\\boldsymbol{B}) \\le n$ 得出大小顺序 $r_3 \\ge r_1 \\ge r_2$"
        ],
        "keyPoints": [
          "反对称矩阵特征值性质",
          "分块矩阵的秩",
          "乘积矩阵的秩不等式"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第5套",
          "线代",
          "分块矩阵与秩"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q08",
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
        "question": "【2026李林六套卷·数一·第5套 T8】设随机变量 $X$ 与 $Y$ 相互独立，且服从同一分布 $P\\{X = k\\} = P\\{Y = k\\} = p(1 - p)^{k - 1}$，$0 < p < 1, k = 1, 2, \\cdots$，对于给定的 $m(m \\ge 2)$，则 $P\\{X = k \\mid X + Y = m\\} =$（ ）。",
        "options": [
          "A. $\\frac{1}{m - 1}$",
          "B. $\\frac{1}{m}$",
          "C. $\\frac{1}{m + 1}$",
          "D. $\\frac{m - 1}{m}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T9】设 $X_1$ 与 $X_2$ 相互独立，且均服从 $N(\\mu, \\sigma^2)$，$\\bar{X} = \\frac{1}{2}(X_1 + X_2)$，则（ ）。",
        "options": [
          "A. $X_1 - \\bar{X}$ 与 $X_2 - \\bar{X}$ 相互独立",
          "B. $X_1 - \\bar{X}$ 与 $X_2 - \\bar{X}$ 相关",
          "C. $X_1 + X_2$ 与 $X_1 - X_2$ 不相互独立",
          "D. $X_1 + X_2$ 与 $X_1 - X_2$ 相关"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第5套 T10】设 $X_1, X_2, \\cdots, X_n$ 是来自总体 $X \\sim N(0, 1)$ 的简单随机样本，$Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$ $(m < n)$，则 $E(Y)$ 与 $D(Y)$ 分别为（ ）。（注：原卷印刷第一项括号外漏印平方符号 $^2$，结合四个选项及命题结构此处按正常标准题型补充完整）",
        "options": [
          "A. $0, n$",
          "B. $0, 2$",
          "C. $n, 2n$",
          "D. $2, 4$"
        ],
        "correctAnswer": "D",
        "explanation": "【印刷勘误提示】：原卷 PDF 第 22 页第 10 题印作 $Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right) + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$，前一项漏印括号外的平方 `$^2$`；若按漏印原式则 $E(Y)=1, D(Y)=2+\\frac{1}{m}$，与四个选项均不匹配。按正规命题 $Y = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 + \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2$ 解析如下：\n\n构造标准正态随机变量的平方和（$\\chi^2$ 分布）：\n1. 令 $U = \\frac{1}{\\sqrt{m}}\\sum_{i=1}^m X_i$。因 $X_i \\stackrel{\\text{i.i.d.}}{\\sim} N(0, 1)$，故 $U \\sim N(0, 1)$，从而 $U^2 = \\frac{1}{m}\\left(\\sum_{i=1}^m X_i\\right)^2 \\sim \\chi^2(1)$。\n2. 令 $V = \\frac{1}{\\sqrt{n-m}}\\sum_{i=m+1}^n X_i$。同理 $V \\sim N(0, 1)$，从而 $V^2 = \\frac{1}{n-m}\\left(\\sum_{i=m+1}^n X_i\\right)^2 \\sim \\chi^2(1)$。\n3. 由于两组样本下标互不相交，$U$ 与 $V$ 相互独立，由 $\\chi^2$ 分布的可加性得：\n   $$Y = U^2 + V^2 \\sim \\chi^2(1 + 1) = \\chi^2(2)$$\n4. 由 $\\chi^2(k)$ 分布的数字特征公式 $E = k, D = 2k$：\n   $$E(Y) = 2, \\qquad D(Y) = 2 \\times 2 = 4$$\n选 D。",
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T11】设 $x, y \\in \\mathbb{R}$，且 $4x^2 + 4y^2 - 2xy - \\frac{5}{8} = 0$，则 $2x + y$ 的取值范围为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T12】曲线 $\\begin{cases} x = \\cos^3 t, \\\\ y = \\sin^3 t \\end{cases}$ 所围成的平面图形绕直线 $y = 1$ 旋转所得旋转体的体积为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T13】设曲线 $L$ 为 $z = x^2 + y^2$ 与 $x^2 + y^2 + z^2 = 6$ 的交线，从 $z$ 轴正向向负向看是逆时针方向，则 $I = \\oint_L x^2 y\\,dx + y^2 z\\,dy + z^2 x\\,dz =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q14",
        "paperQuestionNumber": 14,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数微分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T14】设函数 $F(u, v)$ 可微，$z = z(x, y)$ 由方程 $F\\left(x + \\frac{z}{y}, y + \\frac{z}{x}\\right) = 0$ 确定，则 $x\\frac{\\partial z}{\\partial x} + y\\frac{\\partial z}{\\partial y} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "行列式",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T15】已知线性方程组 $\\begin{cases} a x_1 + 3x_2 + x_3 = 1, \\\\ b x_1 + 2x_2 + x_3 = 2, \\\\ x_2 + 2x_3 = 3, \\\\ x_1 + 2x_2 + 3x_3 = 1 \\end{cases}$ 有解，其中 $a, b$ 为常数，若 $\\begin{vmatrix} a & b & 0 & -1 \\\\ 3 & 2 & 1 & -2 \\\\ 1 & 1 & 2 & -3 \\\\ -1 & -2 & -3 & 2 \\end{vmatrix} = 1$，则 $\\begin{vmatrix} a & b & 0 \\\\ 3 & 2 & 1 \\\\ 1 & 1 & 2 \\end{vmatrix} =$ ______。",
        "options": [],
        "correctAnswer": "$1$",
        "explanation": "**方法一（行列式拆项神技·10秒秒杀）**：\n将已知的 $4$ 阶行列式同时将第 $4$ 行乘以 $-1$、第 $4$ 列乘以 $-1$，整体因子 $(-1)(-1) = 1$ 不改变行列式值，得到：\n$$\\begin{vmatrix} a & b & 0 & 1 \\\\ 3 & 2 & 1 & 2 \\\\ 1 & 1 & 2 & 3 \\\\ 1 & 2 & 3 & 2 \\end{vmatrix} = 1$$\n注意到右上到左下各列刚好与原非齐次方程组增广矩阵 $\\bar{\\boldsymbol{A}}$ 的转置只差第 $(4,4)$ 个元素！将第 $4$ 列（或第 $4$ 行）中的 $2$ 拆为 $1 + 1$：\n$$\\begin{vmatrix} a & b & 0 & 1 \\\\ 3 & 2 & 1 & 2 \\\\ 1 & 1 & 2 & 3 \\\\ 1 & 2 & 3 & 1 \\end{vmatrix} + \\begin{vmatrix} a & b & 0 & 0 \\\\ 3 & 2 & 1 & 0 \\\\ 1 & 1 & 2 & 0 \\\\ 1 & 2 & 3 & 1 \\end{vmatrix} = 1$$\n因为已知原 $4$ 个方程 $3$ 个未知数的非齐次方程组 $\\boldsymbol{Ax} = \\boldsymbol{\\beta}$ 有解，故其增广矩阵 $4$ 个列向量线性相关，即 $|\\bar{\\boldsymbol{A}}|^T = |\\bar{\\boldsymbol{A}}| = 0$，于是上面第一项为 $0$！\n第二项按第 $4$ 列展开即得待求 $3$ 阶行列式：\n$$\\begin{vmatrix} a & b & 0 \\\\ 3 & 2 & 1 \\\\ 1 & 1 & 2 \\end{vmatrix} = 1$$\n\n**方法二（求解 $(a, b)$ 验证）**：\n由增广矩阵行列式 $|\\bar{\\boldsymbol{A}}| = -11a + 17b + 4 = 0$ 及已知行列式 $-4(2a - 3b - 1) = 1$，联立解得 $a = \\frac{3}{4}, b = \\frac{1}{4}$。代入 $3$ 阶行列式得 $3a - 5b = \\frac{9}{4} - \\frac{5}{4} = 1$。",
        "steps": [
          "将已知 4 阶行列式第 4 行与第 4 列同乘 $-1$（值不变），观察其与增广矩阵转置 $\\bar{\\boldsymbol{A}}^T$ 的关系",
          "将右下角元素 $2$ 拆为 $1+1$ 并按第 4 列拆成两行列式之和",
          "由方程组有解知 $|\\bar{\\boldsymbol{A}}^T| = 0$，直接推出待求 3 阶行列式值为 $1$"
        ],
        "keyPoints": [
          "行列式拆项性质",
          "方程组有解与增广矩阵行列式为零",
          "转置不改变行列式"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第5套",
          "线代",
          "行列式与方程组"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第5套 T16】设二维随机变量 $(X, Y)$ 在 $D = \\{(x, y) \\mid 0 \\le x \\le 2, 0 \\le y \\le 1\\}$ 上服从均匀分布，$Z = \\max(X, Y)$，则 $D(Z) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q17",
        "paperQuestionNumber": 17,
        "score": 10,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第5套 T17】(本题满分 10 分) 设 $f(x)$ 为连续函数，$\\lim_{x\\to 0}\\frac{xf(x) - \\ln(1+x)}{x^2} = 1$，当 $x \\to 0$ 时，$\\int_0^x 2t f(x-t)\\,dt - x^2$ 与 $a x^n (a \\ne 0)$ 为等价无穷小，求 $f'(0)$ 及 $a$ 与 $n$ 的值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q18",
        "paperQuestionNumber": 18,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第5套 T18】(本题满分 12 分) 设 $D = \\{(x, y) \\mid x^2 + (y - 1)^2 \\le 1, (x - 1)^2 + y^2 \\le 1\\}$，计算 $I = \\iint_D (2x^2 - y^2)\\,dxdy$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q19",
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
        "question": "【2026李林六套卷·数一·第5套 T19】(本题满分 12 分) 设数列 $\\{a_n\\}$ 满足 $a_0 = 2$，当 $n \\ge 1$ 时，$a_n = \\frac{a_{n-1}}{n} + \\frac{n - 1}{n}$。\n(I) 证明：$\\lim_{n\\to\\infty} a_n$ 存在，并求其值；\n(II) 求 $\\sum_{n=0}^\\infty a_n x^n$ 在收敛区间内的和函数 $S(x)$，并求 $a_n$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q20",
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
        "question": "【2026李林六套卷·数一·第5套 T20】(本题满分 12 分) 设 $f(x)$ 在 $[a, b]$ 上二阶可导，$M = \\max_{x\\in[a, b]} \\{|f''(x)|\\}$。证明：对任意 $x \\in (a, b)$，均有\n$$\\left|\\frac{f(x) - f(a)}{x - a} - \\frac{f(b) - f(a)}{b - a}\\right| \\le \\frac{M}{2}(b - x).$$",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q21",
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
        "question": "【2026李林六套卷·数一·第5套 T21】(本题满分 12 分) 设 $3$ 阶实对称矩阵 $\\boldsymbol{A}$ 有二重特征值 $1$，且 $(\\boldsymbol{A} - 4\\boldsymbol{E})\\boldsymbol{\\alpha} = \\boldsymbol{0}$，其中 $\\boldsymbol{E}$ 是单位矩阵，$\\boldsymbol{\\alpha} = (1, 1, 1)^T$。\n(I) 求 $\\boldsymbol{A}$；\n(II) 记 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，利用正交变换，将二次型 $f(x_1, x_2, x_3) = \\begin{vmatrix} \\boldsymbol{A} & -\\boldsymbol{X} \\\\ \\boldsymbol{X}^T & 0 \\end{vmatrix}$ 化为标准形。",
        "options": [],
        "correctAnswer": "(I) $\\boldsymbol{A} = \\begin{pmatrix} 2 & 1 & 1 \\\\ 1 & 2 & 1 \\\\ 1 & 1 & 2 \\end{pmatrix}$；(II) 正交标准形为 $4y_1^2 + 4y_2^2 + y_3^2$",
        "explanation": "【标准步骤与踩分点解析】：\n**(I) 求实对称矩阵 $\\boldsymbol{A}$（6 分）**\n1. 由题设 $(\\boldsymbol{A} - 4\\boldsymbol{E})\\boldsymbol{\\alpha} = \\boldsymbol{0}$ 且 $\\boldsymbol{\\alpha} \\ne \\boldsymbol{0}$ 可知，$4$ 是 $\\boldsymbol{A}$ 的特征值，且 $\\boldsymbol{\\alpha} = (1, 1, 1)^T$ 是对应的特征向量。结合已知二重特征值 $1$，得 $\\boldsymbol{A}$ 的全部特征值为 $\\lambda_1 = \\lambda_2 = 1, \\lambda_3 = 4$。\n2. 因 $\\boldsymbol{A}$ 为实对称矩阵，可用谱分解定理（或正交相似对角化直接算出 $\\boldsymbol{A}$）！\n   属于 $\\lambda_3 = 4$ 的单位特征向量 $\\boldsymbol{q}_3 = \\frac{1}{\\sqrt{3}}(1, 1, 1)^T$。\n   属于二重特征值 $1$ 的特征子空间与 $\\boldsymbol{\\alpha}$ 正交，直接利用谱分解公式 $\\boldsymbol{A} = \\boldsymbol{Q}\\boldsymbol{\\Lambda}\\boldsymbol{Q}^T = \\boldsymbol{E} + (4 - 1)\\boldsymbol{q}_3 \\boldsymbol{q}_3^T$（或先求正交基 $(\\boldsymbol{q}_1, \\boldsymbol{q}_2, \\boldsymbol{q}_3)$ 再 $\\boldsymbol{Q}\\boldsymbol{\\Lambda}\\boldsymbol{Q}^T$）：\n   $$\\boldsymbol{A} = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix} + 3 \\cdot \\frac{1}{3}\\begin{pmatrix} 1 \\\\ 1 \\\\ 1 \\end{pmatrix}(1, 1, 1) = \\begin{pmatrix} 2 & 1 & 1 \\\\ 1 & 2 & 1 \\\\ 1 & 1 & 2 \\end{pmatrix}$$\n\n**(II) 求分块行列式对应的二次型及其正交标准形（6 分）**\n1. **利用舒尔（Schur）补计算分块行列式**（注意符号！）：\n   因 $|\\boldsymbol{A}| = 1\\times 1\\times 4 = 4 \\ne 0$，将第 $1$ 行块左乘 $(-\\boldsymbol{X}^T \\boldsymbol{A}^{-1})$ 加到第 $2$ 行块：\n   $$\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{O} \\\\ -\\boldsymbol{X}^T \\boldsymbol{A}^{-1} & 1 \\end{pmatrix}\\begin{pmatrix} \\boldsymbol{A} & -\\boldsymbol{X} \\\\ \\boldsymbol{X}^T & 0 \\end{pmatrix} = \\begin{pmatrix} \\boldsymbol{A} & -\\boldsymbol{X} \\\\ \\boldsymbol{O} & \\boldsymbol{X}^T \\boldsymbol{A}^{-1} \\boldsymbol{X} \\end{pmatrix}$$\n   （仔细核对 $(2,2)$ 元素：$0 + (-\\boldsymbol{X}^T \\boldsymbol{A}^{-1})(-\\boldsymbol{X}) = +\\boldsymbol{X}^T \\boldsymbol{A}^{-1} \\boldsymbol{X}$！）\n   故二次型为：\n   $$f(x_1, x_2, x_3) = |\\boldsymbol{A}| \\boldsymbol{X}^T \\boldsymbol{A}^{-1} \\boldsymbol{X} = \\boldsymbol{X}^T \\boldsymbol{A}^* \\boldsymbol{X}$$\n   （也可直接展开验证，如当 $\\boldsymbol{X}=(1,0,0)^T$ 时 $\\det\\begin{pmatrix}2&1&1&-1\\\\1&2&1&0\\\\1&1&2&0\\\\1&0&0&0\\end{pmatrix} = +1\\cdot(-1)\\det\\begin{pmatrix}1&1&-1\\\\2&1&0\\\\1&2&0\\end{pmatrix}$？按第 4 行展开：$-1\\cdot \\det\\begin{pmatrix}1&1&-1\\\\2&1&0\\\\1&2&0\\end{pmatrix} = (-1)\\cdot(-1)(4-1) = +3$，恰好等于 $(\\boldsymbol{A}^*)_{11} = \\begin{vmatrix}2&1\\\\1&2\\end{vmatrix} = 3 > 0$！）\n2. **求矩阵 $\\boldsymbol{A}^*$ 的特征值与正交变换**：\n   因 $\\boldsymbol{A}$ 的特征值为 $1, 1, 4$，且 $|\\boldsymbol{A}| = 4$，故伴随矩阵 $\\boldsymbol{A}^* = |\\boldsymbol{A}|\\boldsymbol{A}^{-1}$ 的特征值为：\n   $$\\frac{4}{1} = 4, \\quad \\frac{4}{1} = 4, \\quad \\frac{4}{4} = 1$$\n   且与 $\\boldsymbol{A}$ 共有同一组正交特征向量：\n   - 对 $\\lambda^* = 4$（对应 $\\boldsymbol{A}$ 的 $\\lambda = 1$）：解 $x_1 + x_2 + x_3 = 0$，取基础解系 $\\boldsymbol{\\xi}_1 = (-1, 1, 0)^T, \\boldsymbol{\\xi}_2 = (-1, 0, 1)^T$，施密特正交单位化得：\n     $\\boldsymbol{q}_1 = \\frac{1}{\\sqrt{2}}(-1, 1, 0)^T,\\ \\boldsymbol{q}_2 = \\frac{1}{\\sqrt{6}}(-1, -1, 2)^T$。\n   - 对 $\\lambda^* = 1$（对应 $\\boldsymbol{A}$ 的 $\\lambda = 4$）：$\\boldsymbol{q}_3 = \\frac{1}{\\sqrt{3}}(1, 1, 1)^T$。\n   取正交矩阵 $\\boldsymbol{Q} = (\\boldsymbol{q}_1, \\boldsymbol{q}_2, \\boldsymbol{q}_3)$，作正交变换 $\\boldsymbol{X} = \\boldsymbol{Q}\\boldsymbol{Y}$，二次型化为标准形：\n   $$f = 4y_1^2 + 4y_2^2 + y_3^2$$",
        "steps": [
          "【踩分点 1 (6分)】：确定 $\\boldsymbol{A}$ 的全部特征值 $1, 1, 4$，由实对称矩阵谱分解（或求正交矩阵 $\\boldsymbol{Q}\\boldsymbol{\\Lambda}\\boldsymbol{Q}^T$）算得 $\\boldsymbol{A} = \\boldsymbol{E} + \\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T$",
          "【踩分点 2 (3分)】：用分块打洞（舒尔补）化简行列式得出二次型矩阵为 $+\\boldsymbol{A}^* = |\\boldsymbol{A}|\\boldsymbol{A}^{-1}$",
          "【踩分点 3 (3分)】：求 $\\boldsymbol{A}^*$ 的特征值 $4, 4, 1$ 及正交特征向量构成 $\\boldsymbol{Q}$，写出标准形 $4y_1^2 + 4y_2^2 + y_3^2$"
        ],
        "keyPoints": [
          "实对称矩阵谱分解重构",
          "舒尔补分块行列式",
          "伴随矩阵二次型正交标准形"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第5套",
          "线代",
          "二次型",
          "解答题"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s5-q22",
        "paperQuestionNumber": 22,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "一维随机变量及其分布",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第5套 T22】(本题满分 12 分) 设某手机一个月的需求量 $X$ 是随机变量，其概率密度为 $f(x) = \\begin{cases} x e^{-x}, & x > 0, \\\\ 0, & x \\le 0, \\end{cases}$ 记 $k$ 个月的需求量为 $Y_k$，设各个月的需求量相互独立。\n(I) 求 $Y_2$ 与 $Y_3$ 的概率密度函数 $f_2(x)$ 与 $f_3(x)$；\n(II) 记连续三个月中的月最大需求量为 $Y$，求 $Y$ 的概率密度函数。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第五套-全真试题与全析.md"
      }
    ]
  },
  {
    "id": "paper-lilin6-2026-06",
    "year": 2026,
    "domain": "math",
    "category": "数一",
    "paperType": "mock",
    "badgeLabel": "2026 冲刺模拟",
    "title": "2026 李林考研数学冲刺预测六套卷 · 数学（一）第六套",
    "subtitle": "李林全家桶⑧ · 冲刺模拟卷（第 6/6 套）· 满分 150 分",
    "totalScore": 150,
    "durationMinutes": 180,
    "description": "覆盖可微但偏导不连续经典反例、交错级数条件与绝对收敛、格林公式面积应用、同构不等式恒成立、定积分黎曼和定义、方向导数梯度极值、可降阶微分方程、旋转体高斯散度积分及Jordan特征向量链。",
    "questions": [
      {
        "id": "lilin6-2026-s6-q01",
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
        "question": "【2026李林六套卷·数一·第6套 T1】设 $f(x)$ 可导，$f(x) > 0$，当 $0 < a < x < b$ 时，有 $f(x) < x f'(x)$，则（ ）。",
        "options": [
          "A. $b f(a) > a f(b)$",
          "B. $a b f(x) > x^2 f(b)$",
          "C. $a f(a) < x f(x)$",
          "D. $a b f(x) < x^2 f(a)$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q02",
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
        "question": "【2026李林六套卷·数一·第6套 T2】已知函数 $f(x, y) = \\begin{cases} (x^2 + y^2)\\sin\\frac{1}{x^2 + y^2}, & x^2 + y^2 \\ne 0, \\\\ 0, & x^2 + y^2 = 0, \\end{cases}$ 则在点 $(0, 0)$ 处（ ）。",
        "options": [
          "A. $\\frac{\\partial f(x, y)}{\\partial x}$ 连续，$f(x, y)$ 可微",
          "B. $\\frac{\\partial f(x, y)}{\\partial x}$ 不连续，$f(x, y)$ 可微",
          "C. $\\frac{\\partial f(x, y)}{\\partial x}$ 连续，$f(x, y)$ 不可微",
          "D. $\\frac{\\partial f(x, y)}{\\partial x}$ 不连续，$f(x, y)$ 不可微"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q03",
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
        "question": "【2026李林六套卷·数一·第6套 T3】设级数 $\\sum_{n=1}^\\infty (-1)^{n-1}\\frac{\\sqrt{n+1} - \\sqrt{n-1}}{n^{\\alpha - 1}}$ 绝对收敛，$\\sum_{n=1}^\\infty (-1)^n \\frac{1}{n^{2 - \\alpha}}$ 条件收敛，$\\alpha > 0$，则（ ）。",
        "options": [
          "A. $1 \\le \\alpha < 2$",
          "B. $\\frac{3}{2} < \\alpha < 2$",
          "C. $0 < \\alpha < 2$",
          "D. $0 < \\alpha < \\frac{3}{2}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q04",
        "paperQuestionNumber": 4,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "多元函数积分学",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T4】如图所示，$L$ 为从 $A$ 到 $B$ 的曲线段，曲线段的方程为 $y = f(x)$，函数 $f(x)$ 在区间 $[0, a]$ 上有连续的导数，则 $\\frac{1}{2}\\int_L -y\\,dx + x\\,dy =$（ ）。\n\n![第6套T4 曲线L与曲边三角形示意图](/images/lilin6/s6_q4.png)",
        "options": [
          "A. 曲边梯形 $ABOD$ 的面积",
          "B. 梯形 $ABOD$ 的面积",
          "C. 曲边三角形 $ACB$ 的面积",
          "D. 曲边三角形 $AOB$ 的面积"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q05",
        "paperQuestionNumber": 5,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T5】设 $\\boldsymbol{A}^T = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\cdots, \\boldsymbol{\\alpha}_{n-1})$ 是 $n \\times (n-1)$ 矩阵，$r(\\boldsymbol{A}^T) = n - 1$，$\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_2$ 是与 $\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\cdots, \\boldsymbol{\\alpha}_{n-1}$ 均正交的 $n$ 维列向量，$\\boldsymbol{\\beta}_1 \\ne \\boldsymbol{\\beta}_2$，$k$ 是任意常数，则方程组 $\\boldsymbol{AX} = \\boldsymbol{0}$ 的通解为（ ）。",
        "options": [
          "A. $k\\boldsymbol{\\beta}_1$",
          "B. $k\\boldsymbol{\\beta}_2$",
          "C. $k(\\boldsymbol{\\beta}_1 + \\boldsymbol{\\beta}_2)$",
          "D. $k(\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2)$"
        ],
        "correctAnswer": "D",
        "explanation": "因为 $\\boldsymbol{A}$ 是 $(n-1) \\times n$ 矩阵，且 $r(\\boldsymbol{A}) = r(\\boldsymbol{A}^T) = n - 1$，所以齐次方程组 $\\boldsymbol{AX} = \\boldsymbol{0}$ 的基础解系维数为：\n$$n - r(\\boldsymbol{A}) = n - (n - 1) = 1$$\n即通解为 $k\\boldsymbol{\\eta}$，其中 $\\boldsymbol{\\eta}$ 是 $\\boldsymbol{AX} = \\boldsymbol{0}$ 的**任意一个非零解**！\n1. 已知 $\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_2$ 均与 $\\boldsymbol{A}$ 的行向量 $\\boldsymbol{\\alpha}_1^T, \\dots, \\boldsymbol{\\alpha}_{n-1}^T$ 正交，故 $\\boldsymbol{A}\\boldsymbol{\\beta}_1 = \\boldsymbol{0}$ 且 $\\boldsymbol{A}\\boldsymbol{\\beta}_2 = \\boldsymbol{0}$。\n2. 从而 $\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2$ 也是 $\\boldsymbol{AX} = \\boldsymbol{0}$ 的解！而且由于题目明确给出 $\\boldsymbol{\\beta}_1 \\ne \\boldsymbol{\\beta}_2$，所以必有 **$\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2 \\ne \\boldsymbol{0}$**（非零解完全有保证！）。\n3. 反观选项 A、B、C：题设并没有排除 $\\boldsymbol{\\beta}_1 = \\boldsymbol{0}$、$\\boldsymbol{\\beta}_2 = \\boldsymbol{0}$ 或 $\\boldsymbol{\\beta}_1 = -\\boldsymbol{\\beta}_2 \\implies \\boldsymbol{\\beta}_1 + \\boldsymbol{\\beta}_2 = \\boldsymbol{0}$ 的情况！（零向量不能张成一维解空间基础解系！）选 D。",
        "steps": [
          "由 $r(\\boldsymbol{A}) = r(\\boldsymbol{A}^T) = n-1$ 确定 $\\boldsymbol{AX}=\\boldsymbol{0}$ 解空间维数为 $1$",
          "利用正交条件得到 $\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_2$ 均为解，故其差 $\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2$ 也是解",
          "由 $\\boldsymbol{\\beta}_1 \\ne \\boldsymbol{\\beta}_2$ 确保 $\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2 \\ne \\boldsymbol{0}$，排除其余三个可能为零向量的选项"
        ],
        "keyPoints": [
          "基础解系维数",
          "非零向量保障(隐含零向量陷阱)"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第6套",
          "线代",
          "齐次线性方程组"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q06",
        "paperQuestionNumber": 6,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "矩阵及其运算",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T6】设 $\\boldsymbol{A}, \\boldsymbol{B}$ 为 $n$ 阶矩阵，$\\boldsymbol{E}$ 为 $n$ 阶单位矩阵，矩阵 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{B} \\\\ \\boldsymbol{O} & \\boldsymbol{E} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{A} \\\\ \\boldsymbol{B} & \\boldsymbol{O} \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
        "options": [
          "A. $r_2 \\ge r_1 \\ge r_3$",
          "B. $r_1 \\ge r_2 \\ge r_3$",
          "C. $r_3 \\ge r_2 \\ge r_1$",
          "D. $r_1 \\ge r_3 \\ge r_2$"
        ],
        "correctAnswer": "D",
        "explanation": "分别计算或用初等分块消元化简三个 $2n$ 阶矩阵的秩：\n1. **$r_1$**：在 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{B} \\\\ \\boldsymbol{O} & \\boldsymbol{E} \\end{pmatrix}$ 中，用第 $2$ 行块左乘 $(-\\boldsymbol{B})$ 加到第 $1$ 行块，化为对角块 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{E} \\end{pmatrix}$，因此：\n   $$r_1 = r(\\boldsymbol{A}) + n$$\n2. **$r_3$**：在 $\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{A} \\\\ \\boldsymbol{B} & \\boldsymbol{O} \\end{pmatrix}$ 中，用第 $1$ 行块左乘 $(-\\boldsymbol{B})$ 加到第 $2$ 行块，化为 $\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{A} \\\\ \\boldsymbol{O} & -\\boldsymbol{BA} \\end{pmatrix}$，再消去右上角 $\\boldsymbol{A}$，因此：\n   $$r_3 = n + r(\\boldsymbol{BA})$$\n3. **$r_2$**：在 $\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$ 中（列打洞）：用第 $2$ 列块左起加负号减到第 $1$ 列块，或把矩阵分解为乘积：\n   $$\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} = \\begin{pmatrix} \\boldsymbol{B} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{B} \\end{pmatrix}\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{O} \\\\ \\boldsymbol{E} & \\boldsymbol{E} \\end{pmatrix}$$\n   Wait！看这里能直接出上界！更直接：比较 $r_2$ 与 $r_3$！\n   一方面由第 2 列块：$r_2 = r\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} \\le r(\\boldsymbol{BA}) + r\\begin{pmatrix}\\boldsymbol{O}\\\\ \\boldsymbol{B}\\end{pmatrix}$？不对！按行或拆成两块看：\n   $$\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} \\xrightarrow{\\text{列}2\\text{乘}-1\\text{加列}1\\text{再看? 不, }\\boldsymbol{B}\\text{在第二行块!}} \\text{用列}2\\text{减去列}1 \\implies \\begin{pmatrix} \\boldsymbol{BA} & -\\boldsymbol{BA} \\\\ \\boldsymbol{B} & \\boldsymbol{O} \\end{pmatrix} = \\begin{pmatrix} \\boldsymbol{B} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{B} \\end{pmatrix}\\cdots$$\n   直接按分解 $\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} = \\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{O} & \\boldsymbol{B} \\end{pmatrix}\\text{行变换? 需}\\boldsymbol{B}\\text{行加到上!}$ 对！看：\n   把第 $2$ 列块加到第 $1$ 列块没用，不如看列空间维度（或直接用分块矩阵秩基本不等式）：\n   把第 1 列块拆两行看，实际上：\n   - 矩阵 2 等于 $\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$，注意用公式 $r\\begin{pmatrix} \\boldsymbol{M} & \\boldsymbol{O} \\\\ \\boldsymbol{P} & \\boldsymbol{Q} \\end{pmatrix} \\le r(\\boldsymbol{M}) + r(\\boldsymbol{P}, \\boldsymbol{Q})?$ 不，是 $r(\\text{第1行块}) + r(\\text{第2行块}) = r(\\boldsymbol{BA}) + r(\\boldsymbol{B})$！\n   更精妙的不等式：$r\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix} \\le r(\\boldsymbol{BA}) + r(\\boldsymbol{B}) \\le r(\\boldsymbol{BA}) + n = r_3$！\n   校验！第一行块的秩是 $r(\\boldsymbol{BA})$，第二行块的秩是 $r(\\boldsymbol{B}, \\boldsymbol{B}) = r(\\boldsymbol{B}) \\le n$，故整个分块矩阵的秩必不超过两行块秩之和：\n   $$r_2 \\le r(\\boldsymbol{BA}) + r(\\boldsymbol{B}) \\le r(\\boldsymbol{BA}) + n = r_3$$\n   又因为 $r(\\boldsymbol{BA}) \\le r(\\boldsymbol{A})$，所以 $r_3 = n + r(\\boldsymbol{BA}) \\le n + r(\\boldsymbol{A}) = r_1$！\n   综合两不等式即得 **$r_1 \\ge r_3 \\ge r_2$**！选 D。",
        "steps": [
          "利用分块消元分别求出 $r_1 = n + r(\\boldsymbol{A})$ 与 $r_3 = n + r(\\boldsymbol{BA})$",
          "由 $r(\\boldsymbol{BA}) \\le r(\\boldsymbol{A})$ 直接得 $r_1 \\ge r_3$",
          "利用 $r_2$ 的上下两行块秩之和上界 $r_2 \\le r(\\boldsymbol{BA}) + r(\\boldsymbol{B}) \\le r(\\boldsymbol{BA}) + n = r_3$，得 $r_1 \\ge r_3 \\ge r_2$"
        ],
        "keyPoints": [
          "分块矩阵初等变换求秩",
          "矩阵按行分块的秩不等式"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第6套",
          "线代",
          "分块矩阵与秩"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q07",
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
        "question": "【2026李林六套卷·数一·第6套 T7】设 $\\boldsymbol{A} = \\begin{pmatrix} 1 & a & -1 \\\\ 1 & 5 & 1 \\\\ 4 & 12 & 6 \\end{pmatrix}$ 与 $\\boldsymbol{B} = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 2 & 1 \\\\ 0 & 0 & b \\end{pmatrix}$ 相似，则（ ）。",
        "options": [
          "A. $a = -3, b = 8$",
          "B. $a = 3, b = 8$",
          "C. $a = 2, b = 8$",
          "D. $a = -2, b = 8$"
        ],
        "correctAnswer": "A",
        "explanation": "利用相似矩阵的**迹相等**与**行列式相等**（必要条件秒杀！）：\n1. **迹相等**：\n   $$\\text{tr}(\\boldsymbol{A}) = 1 + 5 + 6 = 12 = \\text{tr}(\\boldsymbol{B}) = 2 + 2 + b \\implies b = 8$$\n2. **行列式相等**：\n   $$|\\boldsymbol{B}| = 2 \\times 2 \\times 8 = 32$$\n   计算 $|\\boldsymbol{A}|$：\n   $$|\\boldsymbol{A}| = \\begin{vmatrix} 1 & a & -1 \\\\ 1 & 5 & 1 \\\\ 4 & 12 & 6 \\end{vmatrix} = 1(30 - 12) - a(6 - 4) - 1(12 - 20) = 18 - 2a + 8 = 26 - 2a$$\n   令 $26 - 2a = 32 \\implies -2a = 6 \\implies a = -3$！\n3. **验证相似充分性**（双保险）：当 $a=-3, b=8$ 时，$\\boldsymbol{A} - 2\\boldsymbol{E} = \\begin{pmatrix} -1 & -3 & -1 \\\\ 1 & 3 & 1 \\\\ 4 & 12 & 4 \\end{pmatrix}$ 秩为 $1$，而 $\\boldsymbol{B} - 2\\boldsymbol{E} = \\begin{pmatrix} 0 & 0 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 6 \\end{pmatrix}$ 秩也为 $1$（Jordan 块同为 $\\text{diag}(J_2(2), 8)$），严格相似！选 A。",
        "steps": [
          "由相似矩阵迹相等 $\\text{tr}(\\boldsymbol{A}) = \\text{tr}(\\boldsymbol{B})$ 算得 $12 = 4+b \\implies b = 8$",
          "由行列式相等 $|\\boldsymbol{A}| = |\\boldsymbol{B}| = 32$ 列方程 $26-2a=32$ 解得 $a = -3$"
        ],
        "keyPoints": [
          "相似矩阵不变性质(迹、行列式、秩)"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第6套",
          "线代",
          "相似矩阵"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q08",
        "paperQuestionNumber": 8,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T8】设总体 $X \\sim N(\\mu, \\sigma^2)(\\sigma > 0)$，$X_1, X_2, \\cdots, X_n$ 为来自总体 $X$ 的简单随机样本，$\\bar{X}$ 为样本均值，若 $P\\{|X - \\mu| < a\\} = P\\{|\\bar{X} - \\mu| < \\pi\\}$，则 $a =$（ ）。",
        "options": [
          "A. $n\\pi$",
          "B. $\\sqrt{n\\pi}$",
          "C. $\\sqrt{n}\\,\\pi$",
          "D. $(n - 1)\\pi$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q09",
        "paperQuestionNumber": 9,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "随机变量的数字特征",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T9】设 $(X, Y) \\sim N(1, 1; 2, 2; 0)$，$U = X + 2Y$，$V = X - 2Y$，则 $\\rho_{UV} =$（ ）。",
        "options": [
          "A. $-\\frac{2}{5}$",
          "B. $-\\frac{3}{5}$",
          "C. $\\frac{3}{5}$",
          "D. $\\frac{2}{5}$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q10",
        "paperQuestionNumber": 10,
        "score": 5,
        "sectionName": "一、单项选择题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "数理统计与参数估计",
        "type": "choice",
        "question": "【2026李林六套卷·数一·第6套 T10】设 $X_1, X_2, \\cdots, X_{2n}$ 为来自总体 $X \\sim N(0, 1)$ 的简单随机样本，记 $T_1 = \\sum_{i=1}^{2n}\\left(X_i - \\frac{1}{2n}\\sum_{i=1}^{2n}X_i\\right)^2$，$T_2 = \\frac{1}{2}\\sum_{i=1}^{2n} X_i^2 + \\sum_{i=1}^n X_{2i-1}X_{2i}$，则（ ）。",
        "options": [
          "A. $E(T_1) = 2n, D(T_2) = n$",
          "B. $E(T_1) = n, D(T_2) = 2n - 1$",
          "C. $E(T_2) = n, D(T_1) = 2(2n - 1)$",
          "D. $E(T_2) = 2n, D(T_1) = 2n - 1$"
        ],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q11",
        "paperQuestionNumber": 11,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "无穷级数",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第6套 T11】设 $f(x) = \\int_0^{\\frac{x^2}{2}} \\frac{\\ln(1+t)}{t}\\,dt$，则 $f^{(2n)}(0) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q12",
        "paperQuestionNumber": 12,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "微分中值定理与导数应用",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第6套 T12】设 $\\ln(1 + x) - a e^x + 1 \\le \\ln a$ 恒成立，则 $a$ 的取值范围为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q13",
        "paperQuestionNumber": 13,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "一元函数积分学",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第6套 T13】$\\lim_{n\\to\\infty} \\frac{1 + \\frac{1}{\\sqrt{2}} + \\cdots + \\frac{1}{\\sqrt{n}}}{\\frac{1}{\\sqrt{n+1}} + \\frac{1}{\\sqrt{n+2}} + \\cdots + \\frac{1}{\\sqrt{n+3n}}} =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q14",
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
        "question": "【2026李林六套卷·数一·第6套 T14】设 $u = u(x, y, z)$ 有二阶连续偏导数，则 $\\operatorname{rot}(\\operatorname{grad} u) =$ ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q15",
        "paperQuestionNumber": 15,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "线性代数",
        "scope": [
          "数一"
        ],
        "chapter": "向量组与线性方程组",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第6套 T15】若向量 $\\boldsymbol{\\alpha} \\in \\mathbb{R}^3$ 在基 $\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3$ 下的坐标为 $(3, 2, 1)^T$，则 $\\boldsymbol{\\alpha}$ 在基 $\\boldsymbol{\\beta}_1 = \\boldsymbol{\\alpha}_1, \\boldsymbol{\\beta}_2 = \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2, \\boldsymbol{\\beta}_3 = \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3$ 下的坐标为 ______。",
        "options": [],
        "correctAnswer": "$(1, 1, 1)^T$",
        "explanation": "**口算直代法（10秒秒杀）**：\n由题意 $\\boldsymbol{\\alpha} = 3\\boldsymbol{\\alpha}_1 + 2\\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3$。\n由新基定义反解出 $\\boldsymbol{\\alpha}_1 = \\boldsymbol{\\beta}_1$，$\\boldsymbol{\\alpha}_2 = \\boldsymbol{\\beta}_2 - \\boldsymbol{\\beta}_1$，$\\boldsymbol{\\alpha}_3 = \\boldsymbol{\\beta}_3 - \\boldsymbol{\\beta}_2$。代入整理或直接从后向前配凑：\n$$\\boldsymbol{\\alpha} = \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3 = \\boldsymbol{\\alpha}_1 + (\\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2) + (\\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3) = \\boldsymbol{\\beta}_1 + \\boldsymbol{\\beta}_2 + \\boldsymbol{\\beta}_3$$\n故在新基下的坐标为 $(1, 1, 1)^T$。\n（也可用过渡矩阵 $\\boldsymbol{C} = \\begin{pmatrix}1&1&1\\\\0&1&1\\\\0&0&1\\end{pmatrix}$ 计算 $\\boldsymbol{C}^{-1}(3, 2, 1)^T = (3-2, 2-1, 1)^T = (1, 1, 1)^T$。）",
        "steps": [
          "写出 $\\boldsymbol{\\alpha} = 3\\boldsymbol{\\alpha}_1 + 2\\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3$",
          "依次凑出 $(\\boldsymbol{\\alpha}_1+\\boldsymbol{\\alpha}_2+\\boldsymbol{\\alpha}_3)$、$(\\boldsymbol{\\alpha}_1+\\boldsymbol{\\alpha}_2)$ 与 $\\boldsymbol{\\alpha}_1$（或乘过渡矩阵逆矩阵 $\\boldsymbol{C}^{-1}$），得坐标 $(1, 1, 1)^T$"
        ],
        "keyPoints": [
          "基变换与过渡矩阵",
          "坐标变换公式"
        ],
        "difficulty": "简单",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第6套",
          "线代",
          "向量空间坐标"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q16",
        "paperQuestionNumber": 16,
        "score": 5,
        "sectionName": "二、填空题",
        "domain": "math",
        "subject": "概率论与数理统计",
        "scope": [
          "数一"
        ],
        "chapter": "假设检验",
        "type": "blank",
        "question": "【2026李林六套卷·数一·第6套 T16】设 $X_1, X_2, \\cdots, X_n$ 为来自总体 $X \\sim N(\\mu, \\sigma^2)$ 的简单随机样本，$\\sigma^2$ 未知，$\\bar{X}$ 为样本均值，$S^2$ 为样本方差，检验水平为 $\\alpha$，则 $H_0: \\mu \\ge \\mu_0,\\ H_1: \\mu < \\mu_0$ 的拒绝域为 ______。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q17",
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
        "question": "【2026李林六套卷·数一·第6套 T17】(本题满分 10 分) 设 $D_t = \\{(x, y) \\mid 0 \\le x \\le 2t, 0 \\le y \\le t, t > 0\\}$，$f(x, y)$ 在 $D_t$ 上有二阶连续偏导数，求 $F(t) = \\iint_{D_t} f''_{yx}(x, y)\\,dxdy$，并计算 $\\lim_{t\\to 0^+} \\frac{F(t)}{t}$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q18",
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
        "question": "【2026李林六套卷·数一·第6套 T18】(本题满分 12 分) 设 $f(x, y) = x^2 + axy + by^2$ 在点 $P(2, 1)$ 处沿 $\\boldsymbol{l} = (0, 1)$ 的方向导数取得最大值 $2$。\n(I) 求 $a, b$ 的值；\n(II) 求原点 $O(0, 0)$ 到曲线 $f(x, y) = 1$ 上点的距离的最大值与最小值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q19",
        "paperQuestionNumber": 19,
        "score": 12,
        "sectionName": "三、解答题",
        "domain": "math",
        "subject": "高等数学",
        "scope": [
          "数一"
        ],
        "chapter": "常微分方程",
        "type": "analysis",
        "question": "【2026李林六套卷·数一·第6套 T19】(本题满分 12 分) 设 $f(x)\\ (x \\ge 0)$ 满足 $(a + x)f'(x) + f(x) = a,\\ f(0) = 1$，其中 $a \\ge \\frac{1}{2}$ 且 $a \\ne 1$。\n(I) 求 $f(x)$；\n(II) 设 $x_1 > 0, x_{n+1} = f(x_n)\\ (n = 1, 2, \\cdots)$，证明 $\\lim_{n\\to\\infty} x_n$ 存在，并求其值。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q20",
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
        "question": "【2026李林六套卷·数一·第6套 T20】(本题满分 12 分) 设 $y = f(x)$ 满足 $y y'' - (y')^2 = 1$，$y(1) = 1,\\ y'(1) = 0$。曲线 $\\begin{cases} y = f(x), \\\\ z = 0 \\end{cases}$ 绕直线 $\\begin{cases} x = 1, \\\\ z = 0 \\end{cases}$ 旋转一周所得曲面为 $\\Sigma_1$，$\\Sigma$ 为 $\\Sigma_1$ 与两个平面 $y = \\sqrt{2}, y = e$ 所围立体的全表面，取外侧。\n(I) 求 $y = f(x)$；\n(II) 计算 $I = \\iint_\\Sigma \\frac{x}{\\sqrt{y^2 - 1}}\\,dydz$。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q21",
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
        "question": "【2026李林六套卷·数一·第6套 T21】(本题满分 12 分) 设 $\\boldsymbol{A} = \\begin{pmatrix} 1 & 1 & -1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 1 \\end{pmatrix}$ 的单位特征向量为 $\\boldsymbol{\\alpha}_1$，且 $\\boldsymbol{\\alpha}_1$ 的各分量非负。$3$ 维列向量 $\\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3$ 满足 $(\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{\\alpha}_2 = \\boldsymbol{\\alpha}_1,\\ (\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{\\alpha}_3 = \\boldsymbol{\\alpha}_2$，其中 $\\boldsymbol{E}$ 为 $3$ 阶单位矩阵。\n(I) 求 $\\boldsymbol{P} = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3)$，并证明 $\\boldsymbol{P}$ 可逆；\n(II) 求 $\\boldsymbol{P}^{-1}(\\boldsymbol{A} + \\boldsymbol{A}^*)\\boldsymbol{P}$，其中 $\\boldsymbol{A}^*$ 为 $\\boldsymbol{A}$ 的伴随矩阵。",
        "options": [],
        "correctAnswer": "(I) $\\boldsymbol{\\alpha}_1 = (1,0,0)^T,\\ \\boldsymbol{\\alpha}_2 = (c_1, -1, 0)^T,\\ \\boldsymbol{\\alpha}_3 = (c_2, 1-c_1, 1)^T$（其中 $c_1, c_2 \\in \\mathbb{R}$ 为任意常数，可取最简特解 $c_1=c_2=0$ 得 $\\boldsymbol{P}=\\begin{pmatrix}1&0&0\\\\0&-1&1\\\\0&0&1\\end{pmatrix}$），$|\\boldsymbol{P}|=-1\\ne 0$ 故可逆；(II) $\\boldsymbol{P}^{-1}(\\boldsymbol{A}+\\boldsymbol{A}^*)\\boldsymbol{P} = \\begin{pmatrix} 2 & 0 & 1 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}$",
        "explanation": "【标准步骤与踩分点解析】：\n**(I) 求解特征向量链（Jordan 广义特征向量）$\\boldsymbol{P}$ 并证明可逆（7 分）**\n1. 上三角阵 $\\boldsymbol{A}$ 的三重特征值为 $\\lambda_1 = \\lambda_2 = \\lambda_3 = 1$。解 $(\\boldsymbol{A} - \\boldsymbol{E})\\boldsymbol{x} = \\boldsymbol{0}$，其中 $\\boldsymbol{A} - \\boldsymbol{E} = \\begin{pmatrix} 0 & 1 & -1 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix}$，得 $x_3 = 0, x_2 = 0$。\n   结合 $\\boldsymbol{\\alpha}_1$ 为单位非负特征向量，唯一确定：\n   $$\\boldsymbol{\\alpha}_1 = (1, 0, 0)^T$$\n2. 记 $\\boldsymbol{B} = \\boldsymbol{E} - \\boldsymbol{A} = \\begin{pmatrix} 0 & -1 & 1 \\\\ 0 & 0 & -1 \\\\ 0 & 0 & 0 \\end{pmatrix}$。解非齐次方程组 $\\boldsymbol{B}\\boldsymbol{\\alpha}_2 = \\boldsymbol{\\alpha}_1 = (1, 0, 0)^T$：\n   即 $-x_2 + x_3 = 1,\\ -x_3 = 0 \\implies x_3 = 0, x_2 = -1$，$x_1$ 为自由未知量，令 $x_1 = c_1 \\in \\mathbb{R}$，得：\n   $$\\boldsymbol{\\alpha}_2 = (c_1, -1, 0)^T$$\n3. 再解 $\\boldsymbol{B}\\boldsymbol{\\alpha}_3 = \\boldsymbol{\\alpha}_2 = (c_1, -1, 0)^T$：\n   即 $-x_2 + x_3 = c_1,\\ -x_3 = -1 \\implies x_3 = 1,\\ x_2 = 1 - c_1$，$x_1 = c_2 \\in \\mathbb{R}$ 为自由未知量，得：\n   $$\\boldsymbol{\\alpha}_3 = (c_2, 1 - c_1, 1)^T$$\n   （注意：本题中 $\\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3$ 并非唯一，包含任意常数 $c_1, c_2$；取 $c_1=c_2=0$ 时可写出最简矩阵 $\\boldsymbol{P} = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & -1 & 1 \\\\ 0 & 0 & 1 \\end{pmatrix}$。）\n4. **证明 $\\boldsymbol{P}$ 可逆**：直接计算行列式（对任意 $c_1, c_2$ 均为上三角矩阵！）：\n   $$|\\boldsymbol{P}| = \\begin{vmatrix} 1 & c_1 & c_2 \\\\ 0 & -1 & 1 - c_1 \\\\ 0 & 0 & 1 \\end{vmatrix} = 1 \\times (-1) \\times 1 = -1 \\ne 0$$\n   因此 $\\boldsymbol{P}$ 必可逆！\n\n**(II) 利用矩阵链关系巧妙求 $\\boldsymbol{P}^{-1}(\\boldsymbol{A} + \\boldsymbol{A}^*)\\boldsymbol{P}$（5 分）**\n**千万注意无需直接硬求 $\\boldsymbol{P}^{-1}$ 和 $\\boldsymbol{A}^*$，用相似变换定义秒杀（结果完全与 $c_1, c_2$ 无关）**！\n由条件 $\\boldsymbol{B}\\boldsymbol{\\alpha}_1 = \\boldsymbol{0},\\ \\boldsymbol{B}\\boldsymbol{\\alpha}_2 = \\boldsymbol{\\alpha}_1,\\ \\boldsymbol{B}\\boldsymbol{\\alpha}_3 = \\boldsymbol{\\alpha}_2$（其中 $\\boldsymbol{B} = \\boldsymbol{E} - \\boldsymbol{A}$），写成矩阵列分块：\n$$(\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{P} = (\\boldsymbol{0}, \\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2) = \\boldsymbol{P}\\begin{pmatrix} 0 & 1 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix} \\implies \\boldsymbol{P}^{-1}(\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{P} = \\begin{pmatrix} 0 & 1 & 0 \\\\ 0 & 0 & 1 \\\\ 0 & 0 & 0 \\end{pmatrix} = \\boldsymbol{N}$$\n从而得到 $\\boldsymbol{A}$ 在基底 $\\boldsymbol{P}$ 下的相似标准矩阵：\n$$\\boldsymbol{J} := \\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P} = \\boldsymbol{E} - \\boldsymbol{N} = \\begin{pmatrix} 1 & -1 & 0 \\\\ 0 & 1 & -1 \\\\ 0 & 0 & 1 \\end{pmatrix}$$\n又因 $|\\boldsymbol{A}| = 1 \\implies \\boldsymbol{A}^* = |\\boldsymbol{A}|\\boldsymbol{A}^{-1} = \\boldsymbol{A}^{-1}$！故：\n$$\\boldsymbol{P}^{-1}\\boldsymbol{A}^*\\boldsymbol{P} = (\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P})^{-1} = \\boldsymbol{J}^{-1} = (\\boldsymbol{E} - \\boldsymbol{N})^{-1}$$\n因为 $\\boldsymbol{N}^3 = \\boldsymbol{O}$，使用级数有限展开 $(\\boldsymbol{E} - \\boldsymbol{N})^{-1} = \\boldsymbol{E} + \\boldsymbol{N} + \\boldsymbol{N}^2$：\n$$\\boldsymbol{P}^{-1}\\boldsymbol{A}^*\\boldsymbol{P} = \\boldsymbol{E} + \\boldsymbol{N} + \\boldsymbol{N}^2 = \\begin{pmatrix} 1 & 1 & 1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 1 \\end{pmatrix}$$\n两矩阵相加（$\\boldsymbol{J} + \\boldsymbol{J}^{-1} = (\\boldsymbol{E} - \\boldsymbol{N}) + (\\boldsymbol{E} + \\boldsymbol{N} + \\boldsymbol{N}^2) = 2\\boldsymbol{E} + \\boldsymbol{N}^2$！）：\n$$\\boldsymbol{P}^{-1}(\\boldsymbol{A} + \\boldsymbol{A}^*)\\boldsymbol{P} = 2\\boldsymbol{E} + \\boldsymbol{N}^2 = \\begin{pmatrix} 2 & 0 & 1 \\\\ 0 & 2 & 0 \\\\ 0 & 0 & 2 \\end{pmatrix}$$",
        "steps": [
          "【踩分点 1 (5分)】：求 $\\boldsymbol{A}$ 的单位非负特征向量 $\\boldsymbol{\\alpha}_1=(1,0,0)^T$，逐级解非齐次方程得 $\\boldsymbol{\\alpha}_2=(c_1,-1,0)^T, \\boldsymbol{\\alpha}_3=(c_2,1-c_1,1)^T$",
          "【踩分点 2 (2分)】：计算上三角行列式 $|\\boldsymbol{P}| = -1 \\ne 0$ 证明可逆",
          "【踩分点 3 (5分)】：由 $\\boldsymbol{P}^{-1}(\\boldsymbol{E}-\\boldsymbol{A})\\boldsymbol{P}=\\boldsymbol{N}$ 得 $\\boldsymbol{P}^{-1}\\boldsymbol{A}\\boldsymbol{P}=\\boldsymbol{E}-\\boldsymbol{N}$，利用 $\\boldsymbol{A}^*=\\boldsymbol{A}^{-1}$ 和 $\\boldsymbol{N}^3=\\boldsymbol{O}$ 算出 $\\boldsymbol{P}^{-1}(\\boldsymbol{A}+\\boldsymbol{A}^*)\\boldsymbol{P} = 2\\boldsymbol{E}+\\boldsymbol{N}^2$"
        ],
        "keyPoints": [
          "Jordan广义特征向量链",
          "相似矩阵的逆与伴随变换",
          "幂零矩阵求逆公式"
        ],
        "difficulty": "中等",
        "tags": [
          "2026李林六套卷",
          "数一",
          "第6套",
          "线代",
          "矩阵相似",
          "解答题"
        ],
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      },
      {
        "id": "lilin6-2026-s6-q22",
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
        "question": "【2026李林六套卷·数一·第6套 T22】(本题满分 12 分) 设随机变量 $X$ 在区间 $(1, 2)$ 内服从均匀分布，在 $X = x$ 的条件下，$Y$ 服从参数为 $x$ 的指数分布，记 $Z = XY$。\n(I) 求 $Z$ 的概率密度 $f_Z(z)$；\n(II) 问 $X$ 与 $Z$ 是否相关？说明理由。",
        "options": [],
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
        "sourceNote": "06-原始资料库/考研数学/模拟题/26李林六套卷数一/第六套-全真试题与全析.md"
      }
    ]
  }
]
