import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 考研数学 - 线性代数精选试题库
 */
export const linearAlgebraQuestions: UnifiedQuestion[] = [
  {
    id: 'math-la-001',
    domain: 'math',
    subject: '线性代数',
    scope: ['数一', '数二', '数三'],
    chapter: '特征值与特征向量',
    type: 'choice',
    question: '设 $A$ 为 3 阶方阵，其特征值为 $1, -1, 2$，则行列式 $|A^* + 2E| = $：',
    options: [
      'A. $0$',
      'B. $24$',
      'C. $-24$',
      'D. $12$',
    ],
    correctAnswer: 'A',
    explanation: '因为 $|A| = \\lambda_1 \\lambda_2 \\lambda_3 = 1 \\times (-1) \\times 2 = -2$。根据伴随矩阵特征值公式：若 $\\lambda$ 是 $A$ 的特征值，则 $\\frac{|A|}{\\lambda}$ 是 $A^*$ 的特征值。对应的 $A^*$ 特征值为 $-2/1 = -2, -2/(-1) = 2, -2/2 = -1$。从而 $A^* + 2E$ 的特征值为 $-2+2=0, 2+2=4, -1+2=1$。故 $|A^* + 2E| = 0 \\times 4 \\times 1 = 0$。',
    steps: [
      '求矩阵 $A$ 的行列式：$|A| = \\prod_{i=1}^3 \\lambda_i = 1 \\cdot (-1) \\cdot 2 = -2$',
      '利用公式 $A A^* = |A|E$，当 $A$ 可逆时，$A^* = |A|A^{-1}$',
      '因此 $A^*$ 的特征值为 $\\mu_i = \\frac{|A|}{\\lambda_i}$：',
      '$\\mu_1 = \\frac{-2}{1} = -2$',
      '$\\mu_2 = \\frac{-2}{-1} = 2$',
      '$\\mu_3 = \\frac{-2}{2} = -1$',
      '计算 $A^* + 2E$ 的对应特征值 $\\eta_i = \\mu_i + 2$：得到 $0, 4, 1$',
      '根据行列式等于特征值之积：$|A^* + 2E| = 0 \\cdot 4 \\cdot 1 = 0$',
    ],
    keyPoints: ['伴随矩阵特征值性质', '行列式与特征值乘积关系', '矩阵多项式特征值'],
    difficulty: '中等',
    tags: ['伴随矩阵', '特征值', '行列式'],
  },
  {
    id: 'math-la-002',
    domain: 'math',
    subject: '线性代数',
    scope: ['数一', '数二', '数三'],
    chapter: '矩阵运算与初等变换',
    type: 'choice',
    question: '设 $A, B$ 均为 $n$ 阶实对称矩阵，则下列矩阵中必为对称矩阵的是：',
    options: [
      'A. $AB$',
      'B. $A^2 B^2$',
      'C. $ABA$',
      'D. $A + AB$',
    ],
    correctAnswer: 'C',
    explanation: '对于选项 C，$(ABA)^T = A^T B^T A^T$。因为 $A, B$ 为实对称矩阵，即 $A^T = A, B^T = B$，所以 $(ABA)^T = ABA$，因此 $ABA$ 必为对称矩阵。而 $AB$ 为对称矩阵的充要条件是 $AB = BA$（即可交换）。',
    steps: [
      '对称矩阵判别标准：$M$ 为对称矩阵 $\\iff M^T = M$',
      '检验 A：$(AB)^T = B^T A^T = BA \\neq AB$（一般不满足可交换性）',
      '检验 B：$(A^2 B^2)^T = (B^2)^T (A^2)^T = B^2 A^2 \\neq A^2 B^2$',
      '检验 C：$(ABA)^T = A^T B^T A^T = ABA$，转置恒等于自身，命题成立',
      '检验 D：$(A+AB)^T = A^T + B^T A^T = A + BA \\neq A + AB$',
    ],
    keyPoints: ['矩阵转置运算律', '对称矩阵充要条件'],
    difficulty: '简单',
    tags: ['实对称矩阵', '矩阵乘法', '转置'],
  },
]
