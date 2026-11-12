import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 2026 李林《六套卷》数一 · 线性代数分类题库（30 题）
 */
export const lilin6LinearAlgebraQuestions: UnifiedQuestion[] = [
  {
    "id": "math-linalg-lilin6-s1-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T5】设 $A$ 是 3 阶实对称矩阵，$\\boldsymbol{\\alpha} = (-1, 1, 1)^T$ 满足 $(A - 2E)\\boldsymbol{\\alpha} = \\mathbf{0}$，且 $r(A) = 1$，则方程组 $A\\boldsymbol{X} = \\mathbf{0}$ 的基础解系为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $(1, 1, 0)^T, (1, 0, 1)^T$",
      "B. $(1, 1, 1)^T, (1, -1, 0)^T$",
      "C. $(1, 1, -1)^T, (-1, 0, 1)^T$",
      "D. $(1, 1, 0)^T, (-1, 0, 1)^T$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s1-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T6】设 $A = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & -\\frac{1}{2} & \\frac{1}{2} \\\\ 0 & \\frac{1}{2} & -\\frac{1}{2} \\end{pmatrix}$，$B = \\begin{pmatrix} 1 & -1 & 0 \\\\ 2 & -1 & 1 \\\\ 0 & 1 & 1 \\end{pmatrix}$，$C = \\begin{pmatrix} 1 & -1 & 0 \\\\ 2 & -2 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$，则下列选项中正确的是（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $A$ 与 $C$ 合同",
      "B. $A$ 与 $B$ 相似",
      "C. $B$ 与 $C$ 相似",
      "D. $B$ 与 $C$ 合同"
    ]
  },
  {
    "id": "math-linalg-lilin6-s1-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第1套 T7】设 $A$ 是 3 阶实对称矩阵，$B = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3)$ 是 3 阶可逆矩阵，且 $AB = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2 - 2\\boldsymbol{\\alpha}_3, \\boldsymbol{\\alpha}_3 - 2\\boldsymbol{\\alpha}_2)$，记 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，则二次型 $f(x_1, x_2, x_3) = \\text{tr}(A\\boldsymbol{X}\\boldsymbol{X}^T)$ 的规范形为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $y_1^2 - y_2^2 - y_3^2$",
      "B. $y_1^2 + y_2^2 - y_3^2$",
      "C. $y_1^2 + y_2^2 + y_3^2$",
      "D. $-y_1^2 - y_2^2 - y_3^2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s1-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第1套 T15】设 $A$ 是 3 阶矩阵，$\\boldsymbol{\\alpha}$ 为 3 维列向量，$P = (\\boldsymbol{\\alpha}, A\\boldsymbol{\\alpha}, A^2\\boldsymbol{\\alpha})$ 为可逆矩阵，$B = P^{-1}AP$，且 $A^3\\boldsymbol{\\alpha} + 2A^2\\boldsymbol{\\alpha} = 3A\\boldsymbol{\\alpha}$，则 $\\text{tr}(A + B) =$ ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s1-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第1套 T21（12分）】设矩阵 $A = \\begin{pmatrix} a & 1 & 1 \\\\ 1 & a & 1 \\\\ 1 & 1 & a \\end{pmatrix}$ 有二重特征值 $1$，二次型 $f(x_1, x_2, x_3) = \\boldsymbol{X}^T A \\boldsymbol{X}$，其中 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$。\n（I）求 $a$ 的值，并求正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$ 将 $f(x_1, x_2, x_3)$ 化为标准形；\n（II）设 $g(x_1, x_2, x_3) = \\begin{vmatrix} 0 & \\boldsymbol{X}^T \\\\ -\\boldsymbol{X} & A \\end{vmatrix}$，若对 $\\forall \\boldsymbol{X} \\ne \\mathbf{0}$，有 $f(x_1, x_2, x_3) \\le k g(x_1, x_2, x_3)$，求 $k$ 的最小取值。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s2-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "行列式",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T5】设 $A = \\begin{pmatrix} a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\\\ c_1 & c_2 & c_3 \\end{pmatrix}$，$B = \\begin{pmatrix} b_1 & b_3 & b_2 \\\\ a_1 & a_3 & a_2 \\\\ c_1+a_1 & c_3+a_3 & c_2+a_2 \\end{pmatrix}$，则（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $|A| = -|B|$",
      "B. $2|A| = |B|$",
      "C. $|A| = 2|B|$",
      "D. $|A| = |B|$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s2-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T6】设 $A, B$ 均为 $n$ 阶矩阵，$\\boldsymbol{\\alpha}, \\boldsymbol{\\beta}$ 均为 $n$ 维列向量。若 $\\boldsymbol{\\alpha}$ 可由 $A$ 的列向量线性表示，$(\\boldsymbol{\\alpha}^T, \\boldsymbol{\\beta}^T)$ 不能由 $(A^T, B^T)$ 的行向量线性表示，则下列结论中正确的是（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $r(B, \\boldsymbol{\\beta}) = r(B)$",
      "B. $r(B, \\boldsymbol{\\beta}) = r(B) + 1$",
      "C. $r\\begin{pmatrix} A^T & B^T \\\\ \\boldsymbol{\\alpha}^T & \\boldsymbol{\\beta}^T \\end{pmatrix} = r(A^T, B^T) + 1$",
      "D. $r[(A, \\boldsymbol{\\alpha}), B^T] = r\\left[(A^T, B^T)\\begin{pmatrix} A \\\\ B \\end{pmatrix}\\right]$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s2-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第2套 T7】已知 $A = \\begin{pmatrix} 1-a & a \\\\ a & a \\end{pmatrix}$，$\\boldsymbol{X} = (x_1, x_2)^T$，二次型 $f(x_1, x_2) = \\begin{vmatrix} A & \\boldsymbol{X} \\\\ -\\boldsymbol{X}^T & 0 \\end{vmatrix}$，则 $A$ 正定是 $f(x_1, x_2)$ 正定的（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. 充分不必要条件",
      "B. 必要不充分条件",
      "C. 充分必要条件",
      "D. 既不充分也不必要条件"
    ]
  },
  {
    "id": "math-linalg-lilin6-s2-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第2套 T15】设 $A, B, C$ 均为 3 阶矩阵，$A$ 的特征值为 $1, 2, 3$，$B$ 是可逆矩阵，且满足 $AB - B^2 + BC = O$，$E$ 是 3 阶单位矩阵，则行列式 $|(B - C)^{-1} + E| =$ ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s2-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第2套 T21（12分）】设正定矩阵 $B = \\begin{pmatrix} a & 0 & -\\frac{1}{2} \\\\ 0 & 1 & 0 \\\\ -\\frac{1}{2} & 0 & a \\end{pmatrix}$ 有二重特征值，$A$ 为 3 阶实对称矩阵，且满足 $AB = 3A - B$。\n（I）求 $a$ 的值，并求正交矩阵 $Q$，使得 $Q^{-1} B Q = \\Lambda$；\n（II）求一个可逆线性变换 $\\boldsymbol{X} = P\\boldsymbol{Y}$，将 $\\boldsymbol{X}^T A B \\boldsymbol{X}$ 化为规范形。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s3-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T5】设向量组 $(\\text{I})\\ \\boldsymbol{\\alpha}_1 = (1, 1, 2)^T, \\boldsymbol{\\alpha}_2 = (2, 3, 3)^T$，$(\\text{II})\\ \\boldsymbol{\\beta}_1 = (2, 3, 5)^T, \\boldsymbol{\\beta}_2 = (-1, 0, 1)^T$，$k$ 为任意常数，则可由向量组 $(\\text{I})$ 线性表示，也可由向量组 $(\\text{II})$ 线性表示的列向量 $\\boldsymbol{\\gamma} =$（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $k(2, 1, 3)^T$",
      "B. $k(-2, 1, 3)^T$",
      "C. $k(5, 6, 9)^T$",
      "D. $k(-5, 6, 9)^T$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s3-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "矩阵及其运算",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T6】设 $A, B, C$ 均为 $n$ 阶实矩阵，$A^T = A$，若对任意 $n$ 维非零列向量 $\\boldsymbol{X}$，都有 $\\text{tr}(AB\\boldsymbol{X}\\boldsymbol{X}^T) + \\text{tr}(\\boldsymbol{X}\\boldsymbol{X}^T AB) > 0$。矩阵 $\\begin{pmatrix} AB & O \\\\ B & BC \\end{pmatrix}, \\begin{pmatrix} B & A \\\\ O & AC \\end{pmatrix}, \\begin{pmatrix} A & C \\\\ O & AB \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $r_1 \\ge r_2 \\ge r_3$",
      "B. $r_1 \\ge r_3 \\ge r_2$",
      "C. $r_3 \\ge r_1 = r_2$",
      "D. $r_2 \\ge r_3 = r_1$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s3-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第3套 T7】设 3 阶实矩阵 $A$ 满足 $A^2 + 2A = O$，则二次型 $\\boldsymbol{X}^T (E + A)^T (E + A) \\boldsymbol{X}$ 的规范形为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $y_1^2 + y_2^2 - y_3^2$",
      "B. $y_1^2 - y_2^2 - y_3^2$",
      "C. $y_1^2 + y_2^2 + y_3^2$",
      "D. $-y_1^2 - y_2^2 - y_3^2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s3-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "矩阵及其运算",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第3套 T15】设 $A$ 的伴随矩阵 $A^* = \\begin{pmatrix} 1 & 0 & 0 \\\\ 1 & 1 & 0 \\\\ 1 & 1 & 1 \\end{pmatrix}$，3 阶矩阵 $B$ 满足 $A^{-1} B A + B A + 2E = O$，则行列式 $|B| =$ ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s3-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第3套 T21（12分）】设 $A = \\begin{pmatrix} a & 0 & 1 \\\\ 0 & -a & 0 \\\\ 1 & 0 & a \\end{pmatrix}$ 与 $B = \\begin{pmatrix} -1 & 1 & 0 \\\\ 1 & -1 & 0 \\\\ 0 & 0 & a^2 \\end{pmatrix}$ $(a \\ne 0)$ 相似。\n（I）求 $a$ 的值；\n（II）求正交矩阵 $Q$，使得 $Q^{-1} A Q = B$；\n（III）求一个 3 阶矩阵 $P$，使得 $AB = P^2$。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s4-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T5】设 $A$ 是 $m\\times s$ 矩阵，$B$ 是 $s\\times n$ 矩阵，则方程组 $AB\\boldsymbol{X} = \\mathbf{0}$ 与 $B\\boldsymbol{X} = \\mathbf{0}$ 同解的充分必要条件是（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $r(A) = s$",
      "B. $r(AB) = r(B)$",
      "C. $r(A) = r(B)$",
      "D. $r(A) = m$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s4-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T6】设 $A = \\begin{pmatrix} -1 & 1 \\\\ 1 & 1 \\end{pmatrix}$，非零实列向量 $\\boldsymbol{\\alpha} = (a, b)^T$，$\\boldsymbol{X} = (x_1, x_2, x_3)^T$，则二次型 $f(x_1, x_2, x_3) = \\boldsymbol{X}^T \\begin{pmatrix} A + \\boldsymbol{\\alpha}\\boldsymbol{\\alpha}^T & \\boldsymbol{\\alpha} \\\\ \\boldsymbol{\\alpha}^T & 1 \\end{pmatrix} \\boldsymbol{X}$ 的规范形为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $y_1^2 + y_2^2 + y_3^2$",
      "B. $-y_1^2 - y_2^2 - y_3^2$",
      "C. $y_1^2 + y_2^2 - y_3^2$",
      "D. $y_1^2 - y_2^2 - y_3^2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s4-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第4套 T7】若实矩阵 $A$ 与 $B$ 合同，则下列命题一定成立的个数为（ ）。\\n① $|A||B| \\ge 0$； ② $A$ 与 $B$ 等价； ③ $A$ 的行向量组与 $B$ 的行向量组等价； ④ 若 $B$ 可相似对角化，则 $A$ 也可相似对角化。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. 1",
      "B. 2",
      "C. 3",
      "D. 4"
    ]
  },
  {
    "id": "math-linalg-lilin6-s4-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第4套 T15】设 $A, B$ 均为 3 阶矩阵，$A$ 的特征值为 $0, \\frac{1}{2}, \\frac{1}{3}$，且 $B(E - A) = A$，其中 $E$ 为 3 阶单位矩阵，则 $\\text{tr}(A + B) =$ ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s4-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第4套 T21（12分）】设二次型 $f(x_1, x_2, x_3) = 2(x_1^2 + x_2^2 + x_3^2) + 2a(x_1 x_2 + x_1 x_3 + x_2 x_3)$，$a$ 为正整数。\n（I）求正交变换 $\\boldsymbol{X} = Q\\boldsymbol{Y}$，将 $f(x_1, x_2, x_3)$ 化为标准形；\n（II）若存在可逆矩阵 $P$，对任意 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，有 $f(x_1, x_2, x_3) = \\|P\\boldsymbol{X}\\|^2$，求 $a$ 的值及 $P$。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s5-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T5】设 $\\boldsymbol{A}$ 是 $3$ 阶矩阵，$\\boldsymbol{b}$ 是 $3$ 维非零列向量，则下列说法中正确的是（ ）。\n① 若 $\\boldsymbol{Ax} = \\boldsymbol{b}$ 有解，则 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 有解；\n② 若 $\\boldsymbol{Ax} = \\boldsymbol{b}$ 有解，则 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 无解；\n③ 若 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 有解，则 $\\boldsymbol{Ax} = \\boldsymbol{0}$ 有非零解；\n④ 若 $\\begin{pmatrix} \\boldsymbol{A}^T \\\\ \\boldsymbol{b}^T \\end{pmatrix}\\boldsymbol{x} = \\begin{pmatrix} \\boldsymbol{0} \\\\ 1 \\end{pmatrix}$ 无解，则 $\\boldsymbol{Ax} = \\boldsymbol{0}$ 只有零解。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. ①③",
      "B. ①④",
      "C. ②③",
      "D. ②④"
    ]
  },
  {
    "id": "math-linalg-lilin6-s5-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T6】设 $3$ 阶实对称矩阵 $\\boldsymbol{A}$ 的特征值为 $-1, -2, 1$，交换 $\\boldsymbol{A}$ 的第 $2$ 列与第 $3$ 列，再将第 $2$ 列乘以 $(-1)$ 得 $\\boldsymbol{B}$。交换 $\\boldsymbol{B}$ 的第 $2$ 行与第 $3$ 行，再将第 $2$ 行乘以 $(-1)$ 得 $\\boldsymbol{C}$，则二次型 $\\boldsymbol{X}^T\\boldsymbol{C}\\boldsymbol{X}$ 在正交变换 $\\boldsymbol{X} = \\boldsymbol{QY}$ 下的标准形为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $-y_1^2 + y_2^2 - 2y_3^2$",
      "B. $-y_1^2 + y_2^2 + 2y_3^2$",
      "C. $-y_1^2 + 2y_2^2 - y_3^2$",
      "D. $-y_1^2 - 2y_2^2 - y_3^2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s5-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "矩阵及其运算",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第5套 T7】设 $n$ 阶非零实矩阵 $\\boldsymbol{A}$ 满足 $\\boldsymbol{A}^T + \\boldsymbol{A} = \\boldsymbol{O}$，$\\boldsymbol{B}$ 为 $n$ 阶矩阵，矩阵 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{E} \\\\ -\\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{A}-\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{A} & \\boldsymbol{AB} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{A}+\\boldsymbol{E} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{A}-\\boldsymbol{E} \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $r_1 \\ge r_2 \\ge r_3$",
      "B. $r_3 \\ge r_2 \\ge r_1$",
      "C. $r_2 \\ge r_1 \\ge r_3$",
      "D. $r_3 \\ge r_1 \\ge r_2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s5-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "行列式",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第5套 T15】已知线性方程组 $\\begin{cases} a x_1 + 3x_2 + x_3 = 1, \\\\ b x_1 + 2x_2 + x_3 = 2, \\\\ x_2 + 2x_3 = 3, \\\\ x_1 + 2x_2 + 3x_3 = 1 \\end{cases}$ 有解，其中 $a, b$ 为常数，若 $\\begin{vmatrix} a & b & 0 & -1 \\\\ 3 & 2 & 1 & -2 \\\\ 1 & 1 & 2 & -3 \\\\ -1 & -2 & -3 & 2 \\end{vmatrix} = 1$，则 $\\begin{vmatrix} a & b & 0 \\\\ 3 & 2 & 1 \\\\ 1 & 1 & 2 \\end{vmatrix} =$ ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s5-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "二次型",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第5套 T21】(本题满分 12 分) 设 $3$ 阶实对称矩阵 $\\boldsymbol{A}$ 有二重特征值 $1$，且 $(\\boldsymbol{A} - 4\\boldsymbol{E})\\boldsymbol{\\alpha} = \\boldsymbol{0}$，其中 $\\boldsymbol{E}$ 是单位矩阵，$\\boldsymbol{\\alpha} = (1, 1, 1)^T$。\n(I) 求 $\\boldsymbol{A}$；\n(II) 记 $\\boldsymbol{X} = (x_1, x_2, x_3)^T$，利用正交变换，将二次型 $f(x_1, x_2, x_3) = \\begin{vmatrix} \\boldsymbol{A} & -\\boldsymbol{X} \\\\ \\boldsymbol{X}^T & 0 \\end{vmatrix}$ 化为标准形。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s6-q05",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T5】设 $\\boldsymbol{A}^T = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\cdots, \\boldsymbol{\\alpha}_{n-1})$ 是 $n \\times (n-1)$ 矩阵，$r(\\boldsymbol{A}^T) = n - 1$，$\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_2$ 是与 $\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\cdots, \\boldsymbol{\\alpha}_{n-1}$ 均正交的 $n$ 维列向量，$\\boldsymbol{\\beta}_1 \\ne \\boldsymbol{\\beta}_2$，$k$ 是任意常数，则方程组 $\\boldsymbol{AX} = \\boldsymbol{0}$ 的通解为（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $k\\boldsymbol{\\beta}_1$",
      "B. $k\\boldsymbol{\\beta}_2$",
      "C. $k(\\boldsymbol{\\beta}_1 + \\boldsymbol{\\beta}_2)$",
      "D. $k(\\boldsymbol{\\beta}_1 - \\boldsymbol{\\beta}_2)$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s6-q06",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "矩阵及其运算",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T6】设 $\\boldsymbol{A}, \\boldsymbol{B}$ 为 $n$ 阶矩阵，$\\boldsymbol{E}$ 为 $n$ 阶单位矩阵，矩阵 $\\begin{pmatrix} \\boldsymbol{A} & \\boldsymbol{B} \\\\ \\boldsymbol{O} & \\boldsymbol{E} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{BA} & \\boldsymbol{O} \\\\ \\boldsymbol{B} & \\boldsymbol{B} \\end{pmatrix}$，$\\begin{pmatrix} \\boldsymbol{E} & \\boldsymbol{A} \\\\ \\boldsymbol{B} & \\boldsymbol{O} \\end{pmatrix}$ 的秩依次为 $r_1, r_2, r_3$，则（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $r_2 \\ge r_1 \\ge r_3$",
      "B. $r_1 \\ge r_2 \\ge r_3$",
      "C. $r_3 \\ge r_2 \\ge r_1$",
      "D. $r_1 \\ge r_3 \\ge r_2$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s6-q07",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "choice",
    "question": "【2026李林六套卷·数一·第6套 T7】设 $\\boldsymbol{A} = \\begin{pmatrix} 1 & a & -1 \\\\ 1 & 5 & 1 \\\\ 4 & 12 & 6 \\end{pmatrix}$ 与 $\\boldsymbol{B} = \\begin{pmatrix} 2 & 0 & 0 \\\\ 0 & 2 & 1 \\\\ 0 & 0 & b \\end{pmatrix}$ 相似，则（ ）。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md",
    "options": [
      "A. $a = -3, b = 8$",
      "B. $a = 3, b = 8$",
      "C. $a = 2, b = 8$",
      "D. $a = -2, b = 8$"
    ]
  },
  {
    "id": "math-linalg-lilin6-s6-q15",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "向量组与线性方程组",
    "type": "blank",
    "question": "【2026李林六套卷·数一·第6套 T15】若向量 $\\boldsymbol{\\alpha} \\in \\mathbb{R}^3$ 在基 $\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3$ 下的坐标为 $(3, 2, 1)^T$，则 $\\boldsymbol{\\alpha}$ 在基 $\\boldsymbol{\\beta}_1 = \\boldsymbol{\\alpha}_1, \\boldsymbol{\\beta}_2 = \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2, \\boldsymbol{\\beta}_3 = \\boldsymbol{\\alpha}_1 + \\boldsymbol{\\alpha}_2 + \\boldsymbol{\\alpha}_3$ 下的坐标为 ______。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  },
  {
    "id": "math-linalg-lilin6-s6-q21",
    "domain": "math",
    "subject": "线性代数",
    "scope": [
      "数一"
    ],
    "chapter": "特征值与特征向量",
    "type": "analysis",
    "question": "【2026李林六套卷·数一·第6套 T21】(本题满分 12 分) 设 $\\boldsymbol{A} = \\begin{pmatrix} 1 & 1 & -1 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 1 \\end{pmatrix}$ 的单位特征向量为 $\\boldsymbol{\\alpha}_1$，且 $\\boldsymbol{\\alpha}_1$ 的各分量非负。$3$ 维列向量 $\\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3$ 满足 $(\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{\\alpha}_2 = \\boldsymbol{\\alpha}_1,\\ (\\boldsymbol{E} - \\boldsymbol{A})\\boldsymbol{\\alpha}_3 = \\boldsymbol{\\alpha}_2$，其中 $\\boldsymbol{E}$ 为 $3$ 阶单位矩阵。\n(I) 求 $\\boldsymbol{P} = (\\boldsymbol{\\alpha}_1, \\boldsymbol{\\alpha}_2, \\boldsymbol{\\alpha}_3)$，并证明 $\\boldsymbol{P}$ 可逆；\n(II) 求 $\\boldsymbol{P}^{-1}(\\boldsymbol{A} + \\boldsymbol{A}^*)\\boldsymbol{P}$，其中 $\\boldsymbol{A}^*$ 为 $\\boldsymbol{A}$ 的伴随矩阵。",
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
    "sourceNote": "01-考研数学/线性代数/26李林六套卷数一-线代分类题库与精析.md"
  }
]
