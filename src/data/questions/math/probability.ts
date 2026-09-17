import type { UnifiedQuestion } from '../../../types/subject'

/**
 * 考研数学 - 概率论与数理统计精选试题库
 * （注：适用于数一、数三）
 */
export const probabilityQuestions: UnifiedQuestion[] = [
  {
    id: 'math-prob-001',
    domain: 'math',
    subject: '概率论与数理统计',
    scope: ['数一', '数三'],
    chapter: '一维随机变量及其分布',
    type: 'choice',
    question: '设随机变量 $X \\sim N(0, 1)$，其概率密度为 $\\varphi(x)$，分布函数为 $\\Phi(x)$。则对于任意实数 $x$，下列等式恒成立的是：',
    options: [
      'A. $\\Phi(x) + \\Phi(-x) = 1$',
      'B. $\\Phi(-x) = 1 + \\Phi(x)$',
      'C. $\\varphi(x) + \\varphi(-x) = 1$',
      'D. $\\Phi(x) = \\Phi(-x)$',
    ],
    correctAnswer: 'A',
    explanation: '标准正态分布概率密度函数 $\\varphi(x) = \\frac{1}{\\sqrt{2\\pi}}e^{-x^2/2}$ 是关于 $y$ 轴对称的偶函数。根据对称性，其分布函数满足 $\\Phi(-x) = P(X \\le -x) = P(X \\ge x) = 1 - \\Phi(x)$，整理即得 $\\Phi(x) + \\Phi(-x) = 1$。',
    steps: [
      '标准正态分布随机变量 $X \\sim N(0, 1)$ 的概率密度 $\\varphi(x)$ 满足 $\\varphi(-x) = \\varphi(x)$，即关于 $x=0$ 对称',
      '计算累积分布函数定义：$\\Phi(-x) = \\int_{-\\infty}^{-x} \\varphi(t) dt$',
      '做变量替换 $u = -t$：$\\int_{x}^{\\infty} \\varphi(-u) du = \\int_x^{\\infty} \\varphi(u) du = P(X > x) = 1 - \\Phi(x)$',
      '移项得到恒等式：$\\Phi(x) + \\Phi(-x) = 1$',
    ],
    keyPoints: ['标准正态分布对称性', '分布函数与概率密度转换'],
    difficulty: '简单',
    tags: ['正态分布', '分布函数', '对称性'],
  },
  {
    id: 'math-prob-002',
    domain: 'math',
    subject: '概率论与数理统计',
    scope: ['数一', '数三'],
    chapter: '数字特征',
    type: 'blank',
    question: '设 $X, Y$ 相互独立，且 $E(X) = 2, D(X) = 1, E(Y) = 3, D(Y) = 4$，则方差 $D(2X - 3Y + 5) = $ _______',
    options: [
      'A. $25$',
      'B. $40$',
      'C. $45$',
      'D. $13$',
    ],
    correctAnswer: 'B',
    explanation: '方差性质：$D(aX + bY + c) = a^2 D(X) + b^2 D(Y) + 2ab\\text{Cov}(X,Y)$。因为 $X, Y$ 独立，所以 $\\text{Cov}(X,Y) = 0$。因此 $D(2X - 3Y + 5) = 2^2 D(X) + (-3)^2 D(Y) = 4 \\times 1 + 9 \\times 4 = 4 + 36 = 40$。常数项 $+5$ 不影响方差。',
    steps: [
      '回顾方差性质：常数项方差为 0，即 $D(c) = 0$',
      '系数提出方差需平方：$D(aX) = a^2 D(X)$',
      '利用独立性：当 $X, Y$ 独立时，$\\text{Cov}(X, Y) = 0$，故 $D(aX + bY) = a^2 D(X) + b^2 D(Y)$',
      '代入数值计算：$D(2X - 3Y + 5) = 2^2 \\cdot D(X) + (-3)^2 \\cdot D(Y) = 4 \\cdot 1 + 9 \\cdot 4 = 4 + 36 = 40$',
    ],
    keyPoints: ['方差运算性质', '随机变量独立性', '协方差为零'],
    difficulty: '简单',
    tags: ['方差', '独立性', '数字特征'],
  },
]
