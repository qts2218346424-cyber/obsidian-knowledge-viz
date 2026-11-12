import { useEffect, useRef, useState } from 'react'
import { taylorApproxCourseware } from '../../data/coursewares/taylorApprox'
import { matrixEigenCourseware } from '../../data/coursewares/matrixEigen'

/**
 * 落地页「免登录动手试玩」：考研数学真实功能实验室 & AI 导师互动沙盒。
 * - MathTrialDemo：直接内嵌系统真实的泰勒逼近/特征值空间变换仿真课件 + 真题电子草稿作答与实时批改；
 * - AgentTrialDemo：真实可自由提问、切换学科导师、切换伴学语调与双师同台对比的交互式伴学体验。
 */

interface DemoProps {
  /** 全屏试玩模式：撑满全屏容器高度 */
  fullscreen?: boolean
  onEnter: () => void
}

/* ============================================================================
 * 1. 考研数学：真实仿真实验室 + 真题手写草稿与实时判分
 * ========================================================================== */

type MathSubTab = 'taylor' | 'eigen' | 'quiz'

interface MathPracticeItem {
  id: string
  tag: string
  title: string
  stem: string
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[]
  correct: 'A' | 'B' | 'C' | 'D'
  score: number
  steps: string[]
  trap: string
}

const MATH_PRACTICE_ITEMS: MathPracticeItem[] = [
  {
    id: 'limit-taylor',
    tag: '高等数学 · 极限与泰勒展开',
    title: '求极限 lim(x→0) [x − sin(x)] / (x² · ln(1 + x))',
    stem: '当 x → 0 时，计算分子 x − sin(x) 与分母 x² · ln(1 + x) 之比的极限值为：',
    options: [
      { key: 'A', text: '0' },
      { key: 'B', text: '1/6' },
      { key: 'C', text: '1/3' },
      { key: 'D', text: '1/2' },
    ],
    correct: 'B',
    score: 5,
    steps: [
      '判型：x → 0 时，分子分母均趋于 0，属于 0/0 型未定式；因分子存在相减项 x − sin(x)，不可直接将 sin(x) 等价替换为 x。',
      '分母等价无穷小（乘除因子可代换）：ln(1 + x) ~ x，故分母整体等价于 x² · x = x³（三阶无穷小）。',
      '分子泰勒展开到三阶：sin(x) = x − x³/6 + o(x³)，代入得 x − sin(x) = x³/6 + o(x³)。',
      '约去 x³：极限值 = (1/6) / 1 = 1/6，匹配「上下同阶展开」黄金原则。',
    ],
    trap: '致命误区：切忌在加减项 x − sin(x) 中直接用 sin(x) ~ x，否则分子变为 0 导致阶数丢失（展开阶数 2 分 + 化简 2 分 + 结论 1 分）。',
  },
  {
    id: 'mean-value',
    tag: '线代/高数 · 实对称矩阵与正交对角化',
    title: '已知 3 阶实对称矩阵 A 的特征值为 1, 2, −2，则 |A* + 2E| 等于：',
    stem: '设 A 为 3 阶实对称矩阵且特征值为 λ₁ = 1, λ₂ = 2, λ₃ = −2，E 为单位矩阵，求伴随矩阵表达式 |A* + 2E| 的值：',
    options: [
      { key: 'A', text: '−6' },
      { key: 'B', text: '0' },
      { key: 'C', text: '4' },
      { key: 'D', text: '12' },
    ],
    correct: 'B',
    score: 5,
    steps: [
      '先求行列式 |A|：矩阵行列式等于全部特征值之积，故 |A| = 1 × 2 × (−2) = −4 ≠ 0，A 可逆。',
      '求 A* 的特征值：由公式 A* 的特征值为 |A| / λᵢ，可得 μ₁ = −4/1 = −4，μ₂ = −4/2 = −2，μ₃ = −4/(−2) = 2。',
      '求 A* + 2E 的特征值：每项对应加 2，得到 −2, 0, 4。',
      '求行列式 |A* + 2E|：等于特征值乘积 (−2) × 0 × 4 = 0。',
    ],
    trap: '易错陷阱：看到矩阵表达式求行列式切勿硬算伴随矩阵 A*，优先利用「|f(A)| = ∏ f(λᵢ)」与「特征值乘积等于行列式」秒杀！',
  },
]

export function MathTrialDemo({ fullscreen, onEnter }: DemoProps) {
  const [subTab, setSubTab] = useState<MathSubTab>('taylor')
  const [qIdx, setQIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [showScratchpad, setShowScratchpad] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)

  const currentQ = MATH_PRACTICE_ITEMS[qIdx]
  const isCorrect = submitted && selectedOpt === currentQ.correct

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.setPointerCapture(e.pointerId)
    drawingRef.current = true
    const pos = getPointerPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = '#f472b6'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const pos = getPointerPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const handlePointerUp = () => {
    drawingRef.current = false
  }

  const switchQuestion = (nextIdx: number) => {
    setQIdx(nextIdx)
    setSelectedOpt(null)
    setSubmitted(false)
    clearCanvas()
  }

  return (
    <div
      className={`flex flex-col bg-[#0b0f19] text-white ${
        fullscreen ? 'w-full h-full min-h-0' : 'h-[520px]'
      }`}
    >
      {/* 顶部真实功能实验室切换条 */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold font-mono text-2xs">
            考研数学实战实验室
          </span>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setSubTab('taylor')}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                subTab === 'taylor' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              📈 泰勒逼近仿真
            </button>
            <button
              type="button"
              onClick={() => setSubTab('eigen')}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                subTab === 'eigen' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              🧲 特征值空间变换
            </button>
            <button
              type="button"
              onClick={() => setSubTab('quiz')}
              className={`px-2.5 py-1 rounded-md text-2xs font-bold transition-colors cursor-pointer ${
                subTab === 'quiz' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              ✍️ 真题草稿与判分
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-2xs text-slate-400">
          <span className="hidden md:inline">
            {subTab === 'quiz'
              ? '支持右侧直接打草稿、交卷判分与踩分核对'
              : '可直接拖动参数滑块、切换函数实时观测交互绘图'}
          </span>
          <button
            type="button"
            onClick={onEnter}
            className="text-pink-300 hover:text-pink-200 font-bold underline cursor-pointer whitespace-nowrap"
          >
            进入完整题库与全套课件 →
          </button>
        </div>
      </div>

      {/* 主体区域 */}
      {subTab === 'taylor' ? (
        <iframe
          srcDoc={taylorApproxCourseware.embedHtml}
          title="考研高数泰勒多项式动态逼近实验室"
          className="w-full flex-1 border-0 bg-transparent min-h-0"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : subTab === 'eigen' ? (
        <iframe
          srcDoc={matrixEigenCourseware.embedHtml}
          title="考研线代特征值与几何变换动态实验室"
          className="w-full flex-1 border-0 bg-transparent min-h-0"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        /* 子功能 3：真题交互作答 + 电子手写草稿纸 + 实时判分与分步解析 */
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 bg-[#0b1020]">
          {/* 左侧：做题与批改区 */}
          <div className={`${showScratchpad ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col gap-3 min-w-0`}>
            {/* 切题胶囊 + 草稿开关 */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {MATH_PRACTICE_ITEMS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchQuestion(idx)}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold border transition-colors cursor-pointer ${
                      qIdx === idx
                        ? 'bg-pink-500/20 border-pink-400/70 text-pink-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    真题 {idx + 1}（{item.score} 分）
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowScratchpad(v => !v)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-2xs text-slate-300 font-semibold cursor-pointer"
              >
                {showScratchpad ? '收起草稿本' : '展开电子草稿本 ✏️'}
              </button>
            </div>

            {/* 题干 */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-2">
              <div className="text-2xs font-semibold text-pink-300">{currentQ.tag}</div>
              <div className={`font-serif font-semibold text-slate-100 leading-relaxed ${fullscreen ? 'text-base' : 'text-sm'}`}>
                {currentQ.title}
              </div>
              <p className="text-xs text-slate-400">{currentQ.stem}</p>
            </div>

            {/* A/B/C/D 选项作答 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {currentQ.options.map(opt => {
                const picked = selectedOpt === opt.key
                let style = 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-pink-500/50'
                if (submitted) {
                  if (opt.key === currentQ.correct) {
                    style = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                  } else if (picked && opt.key !== currentQ.correct) {
                    style = 'bg-rose-500/20 border-rose-400 text-rose-200'
                  }
                } else if (picked) {
                  style = 'bg-pink-500/25 border-pink-400 text-white font-bold'
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      if (!submitted) setSelectedOpt(opt.key)
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${style}`}
                  >
                    <span className="w-5 h-5 rounded-md bg-black/40 border border-white/15 flex items-center justify-center font-mono text-2xs shrink-0">
                      {opt.key}
                    </span>
                    <span className="font-serif text-sm">{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {/* 提交与重做操作栏 */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {!submitted ? (
                <button
                  type="button"
                  disabled={!selectedOpt}
                  onClick={() => setSubmitted(true)}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {selectedOpt ? `提交选项 ${selectedOpt} 并核对踩分点` : '请先点选一个答案选项'}
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {isCorrect
                      ? `✅ 回答正确！+${currentQ.score} / ${currentQ.score} 分`
                      : `❌ 错选 ${selectedOpt}（正确答案：${currentQ.correct}）· 0 / ${currentQ.score} 分`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setSelectedOpt(null)
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-2xs text-slate-200 cursor-pointer"
                  >
                    重做本题
                  </button>
                  <button
                    type="button"
                    onClick={() => switchQuestion((qIdx + 1) % MATH_PRACTICE_ITEMS.length)}
                    className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-2xs text-pink-200 font-bold cursor-pointer"
                  >
                    下一道真题 →
                  </button>
                </div>
              )}
            </div>

            {/* 批改后自动展开：严密分步解析 + 踩分陷阱 */}
            {submitted && (
              <div className="rounded-xl border border-pink-500/30 bg-slate-900/90 p-3.5 space-y-2 animate-fade-in-up">
                <div className="text-xs font-bold text-pink-300">📖 AI 步步严谨推导（不跳步）</div>
                <ol className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                  {currentQ.steps.map((st, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="w-4 h-4 rounded-full bg-pink-500/25 text-pink-200 text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-2xs text-amber-200">
                  ⚠️ {currentQ.trap}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：真实可手绘数学电子草稿本 */}
          {showScratchpad && (
            <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden min-h-[220px]">
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-2xs">
                <span className="font-bold text-slate-200">✏️ 电子推导草稿纸（鼠标/触屏直接手写验算）</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  清空重写
                </button>
              </div>
              <div className="relative flex-1 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={320}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="w-full h-full touch-none cursor-crosshair block"
                />
                <span className="pointer-events-none absolute bottom-2 right-2.5 text-2xs text-slate-500">
                  在此区域自由推导演算
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * 2. AI 导师：真实可提问、切导师、切语调、双师同台对照的研学沙盒
 * ========================================================================== */

type DemoAgentId = '408' | 'math' | 'english' | 'politics'
type DemoTone = 'rigorous' | 'exam' | 'followup'

interface DemoAgentProfile {
  id: DemoAgentId
  icon: string
  name: string
  role: string
  accentBadge: string
  welcome: string
  quickPrompts: string[]
  notePath: string
}

const DEMO_AGENTS: Record<DemoAgentId, DemoAgentProfile> = {
  '408': {
    id: '408',
    icon: '💻',
    name: '研小核',
    role: '408 计算机全科导师',
    accentBadge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    welcome: '已挂载 408 统考大纲与你的错题图谱。直接输入困惑，或点下方真题高频追问，我按【核心结论 → 软硬机理 → 考场坑点】拆解。',
    quickPrompts: [
      'TCP 为什么建立三次握手、关闭四次挥手？',
      'LRU 与 OPT 页面置换缺页次数的核心区别？',
      'AVL 树 LR 型失衡如何确定双旋顺序？',
    ],
    notePath: '408/计算机网络/TCP状态机与三次握手.md',
  },
  math: {
    id: 'math',
    icon: '📐',
    name: '数小通',
    role: '考研数学命题专家',
    accentBadge: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    welcome: '已同步数一/二/三全套定理库。遇到不会拆的极限、不会构造的中值定理辅助函数，或者特征值与对角化难题，直接发给我！',
    quickPrompts: [
      '求极限何时不能直接用等价无穷小代换？',
      '实对称矩阵为什么一定能正交相似对角化？',
      '拉格朗日与柯西中值定理怎么快速构造辅助函数？',
    ],
    notePath: '考研数学/高等数学/泰勒展开上下同阶原则.md',
  },
  english: {
    id: 'english',
    icon: '📚',
    name: '英小研',
    role: '考研英语阅读与批改导师',
    accentBadge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    welcome: '把长难句或作文表达发给我，我可以做主干切分、20 分制踩分诊断与高阶同义替换升级。',
    quickPrompts: [
      '如何三步拆解带插入语和倒装的考研阅读长难句？',
      '帮我把 "I think it is very important" 升级为大作文一档句式',
    ],
    notePath: '考研英语/长难句/倒装与多层定语从句切分.md',
  },
  politics: {
    id: 'politics',
    icon: '🏛️',
    name: '政小思',
    role: '考研政治命题与时政导师',
    accentBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    welcome: '擅长史纲时间线串联、马原核心范畴辩证关系与选择题干扰项排雷。输入容易混淆的会议或原理，我立刻帮你画对比表。',
    quickPrompts: [
      '遵义会议与延安整风分别解决了什么路线问题？',
      '八七会议、古田会议、瓦窑堡会议的记忆口诀？',
    ],
    notePath: '考研政治/史纲/重要会议对比清单.md',
  },
}

interface DemoChatMessage {
  id: string
  role: 'user' | 'assistant'
  agentName?: string
  agentIcon?: string
  toolTrace?: string
  content: string
  noteRef?: { path: string; excerpt: string }
  peerReply?: { agentName: string; agentIcon: string; content: string }
  savedToReview?: boolean
}

function buildDemoAnswer(
  agent: DemoAgentProfile,
  question: string,
  tone: DemoTone,
  dualMode: boolean
): {
  toolTrace: string
  content: string
  noteRef: { path: string; excerpt: string }
  peerReply?: { agentName: string; agentIcon: string; content: string }
} {
  const q = question.trim()
  const toneLabel =
    tone === 'rigorous' ? '学术严谨推导' : tone === 'exam' ? '考场秒杀口诀' : '针对追问自检'

  let coreAnswer = ''
  let notePath = agent.notePath
  let noteExcerpt = '已命中本地 Vault 笔记双链与历史错因标签。'

  if (/三次握手|四次挥手|tcp/i.test(q)) {
    coreAnswer =
      '【核心结论】三次握手旨在防止“已失效的连接请求报文”误建连接并同步双方初始序列号 ISN；四次挥手因 TCP 全双工特性，被动关闭方收到 FIN 后仍有数据待发，需将 ACK 与 FIN 分两次发送。\n\n• 关键状态机：SYN-SENT → SYN-RCVD → ESTABLISHED；主动关闭方末尾必须经历 2MSL 的 TIME-WAIT。\n• 考场避坑：TIME-WAIT 等待 2MSL 有两大作用——① 确保最后一个 ACK 到达对端；② 让本连接滞留报文全部在网络中消逝。'
    notePath = '408/计算机网络/TCP状态机与三次握手.md'
    noteExcerpt = '对比记忆：握手 3 次同步双方 ISN；挥手 4 次因半关闭状态，TIME_WAIT 维持 2MSL。'
  } else if (/lru|opt|页面置换|缺页/i.test(q)) {
    coreAnswer =
      '【核心结论】OPT（最佳置换）看“未来最长时间不再访问”的页面，缺页率理论最低但不可物理实现；LRU（最近最久未使用）看“过去最长时间未被访问”的页面，满足堆栈特性无 Belady 异常。\n\n• 做题步骤：画物理块追踪表，每步标明命中(✓)或换出对象，仅统计发生换入/首次装入的次数即为缺页次数。\n• 考场避坑：注意区分“缺页次数”与“置换次数”——初始物理块装满前的空块装入属于缺页，但不计入置换次数！'
    notePath = '408/操作系统/页面置换追踪与Belady异常.md'
    noteExcerpt = '错题关联：此前错题常把初始 3 次空块装入误算作置换次数，注意审题关键词。'
  } else if (/avl|旋转|平衡/i.test(q) || /lr型|rl型/i.test(q)) {
    coreAnswer =
      '【核心结论】定位“距插入点最近的失衡祖先节点 A（|BF| > 1）”，根据从 A 向下两层的路径确定类型：LR 型（先左孩子左旋，再 A 右旋）、RL 型（先右孩子右旋，再 A 左旋）。\n\n• 秒杀校验：无论单旋还是双旋，调整完成后的树**中序遍历序列与调整前 100% 一致**！考场算完顺手做一次中序遍历即可验算是否旋转出错。'
    notePath = '408/数据结构/AVL树四种旋转口诀.md'
    noteExcerpt = '口诀：同号（LL/RR）直接单旋，异号（LR/RL）子先反向旋、父再顺向旋，中序恒不变。'
  } else if (/等价无穷小|泰勒|极限/i.test(q)) {
    coreAnswer =
      '【核心结论】乘除因子之间可直接替换等价无穷小；加减两项之间替换必须满足“消去后同阶系数不为 0”，高阶抵消场景（如 x − sin x、tan x − sin x）一律改用泰勒展开。\n\n• 做题口诀：分子分母展开到“相减不抵消的最低同阶次幂”，余项保留同阶 Peano 余项 o(xⁿ) 即可。\n• 考场避坑：切忌一见到 sin x 或 ln(1+x) 就无脑一阶替换，先心算首项系数是否相消！'
    notePath = '考研数学/高等数学/泰勒展开上下同阶原则.md'
    noteExcerpt = '经典反例：(x − sin x)/x³ 若误用 sin x ~ x 会得到错误答案 0，正解为 1/6。'
  } else if (/特征值|正交|对称矩阵/i.test(q)) {
    coreAnswer =
      '【核心结论】n 阶实对称矩阵不仅必能相似对角化，而且不同特征值对应的特征向量天然两两正交；对重特征值对应的线性无关向量仅需执行施密特正交化与单位化，即可拼出正交矩阵 Q。\n\n• 踩分步骤：① 求 |λE−A|=0 得特征值 → ② 解 (λE−A)x=0 得基础解系 → ③ 重根向量正交单位化 → ④ 写出 QᵀAQ = Λ。'
    notePath = '考研数学/线性代数/实对称矩阵正交相似对角化.md'
    noteExcerpt = '定理链条：实对称 → 特征值全为实数 → 不同 λ 向量正交 → 必存在正交阵 Q。'
  } else if (/中值定理|拉格朗日|柯西|辅助函数/i.test(q)) {
    coreAnswer =
      '【核心结论】目标等式只出现一个函数 f 且含 f\'(ξ) 时优先凑导数积分找“原函数”用罗尔定理；出现两个端点 f(b)−f(a) 与函数值比值时用柯西中值定理。\n\n• 秒杀法门：把结论中的 ξ 换回 x，移项使右端为 0，若形如 f\'(x) + P(x)f(x) = 0，直接乘积分因子 e^{∫P(x)dx} 构造辅助函数 F(x)！'
    notePath = '考研数学/高等数学/中值定理辅助函数构造六法.md'
    noteExcerpt = '高频模板：f\'(ξ)f(ξ)→取 f²(x)；f\'(ξ)+f(ξ)=0→取 e^x·f(x)。'
  } else if (/长难句|作文|升级|very good/i.test(q)) {
    coreAnswer =
      '【核心结论】长难句破解先圈出谓语动词与并列/从属连词划分“主干—修饰”层级；大作文要突破 15+ 一档分，需用强逻辑短语替换高频低龄动词和形容词。\n\n• 实战升级示范：\n  - "I think" → "From a rational standpoint, I harbor the conviction that..."\n  - "very important" → "of paramount significance / indispensable"\n  - 插入语处理：遇到双破折号或双逗号包围的成分先跳过直读主谓宾。'
    notePath = '考研英语/作文/一档表达与句式升级库.md'
    noteExcerpt = '评分硬指标：句式多样性（倒装/强调/非谓语）+ 精准学术词汇零拼写失误。'
  } else if (/遵义|延安|八七|古田|瓦窑堡|会议/i.test(q)) {
    coreAnswer =
      '【核心结论】高频会议须按“解决了什么问题”成对分辨，严防命题人张冠李戴：\n\n• 遵义会议（1935）：集中解决军事问题与组织问题（确立毛泽东领导地位，生死攸关转折点），未解决思想路线与政治路线。\n• 瓦窑堡会议（1935.12）：制定抗日民族统一战线策略（政治路线）。\n• 延安整风（1941~1945）：彻底清算主观主义、宗派主义、党八股，解决思想路线问题！'
    notePath = '考研政治/史纲/重要会议定位易错对比.md'
    noteExcerpt = '考场避坑：遵义会议只解决“军事+组织”，思想路线对应“延安整风”，政治策略对应“瓦窑堡”。'
  } else {
    coreAnswer =
      `【核心结论】收到你的提问「${q}」。作为 ${agent.name}（${agent.role}），建议从“核心概念边界 → 典型真题考法 → 易混陷阱排除”三层切入：\n\n• 知识锚点：先把该题干对应的考纲一级模块写出来，识别命题人真正想考查的核心定理或底层机制。\n• 验证方法：做完推导后务必代入边界特例或检查前提条件（如可导性、独立性、物理块初始空槽）是否满足。`
  }

  if (tone === 'exam') {
    coreAnswer = `⚡ [${toneLabel}] 直击得分要点：\n` + coreAnswer
  } else if (tone === 'followup') {
    coreAnswer +=
      '\n\n🎯 [针对追问检验]：请你尝试自测——如果把本题的一个关键前置条件取反（例如非对称矩阵 / 加减无穷小阶数抵消 / 初始队列已满），结论还成立吗？欢迎继续在下方追问！'
  } else {
    coreAnswer = `📐 [${toneLabel}]：\n` + coreAnswer
  }

  const peerMap: Record<DemoAgentId, { icon: string; name: string; content: string }> = {
    '408': {
      icon: '📐',
      name: '数小通（跨科协同校验）',
      content: '同态补充：该知识点在分析时间/概率复杂度时可转化为递推方程或数学期望求解，建议把错题公式一并记入知识双链卡片。',
    },
    math: {
      icon: '💻',
      name: '研小核（工程与验证视角）',
      content: '交叉提醒：与上一标签「泰勒逼近仿真」画布联动验证最直观——把阶数滑动条拉大，就能亲眼看到低阶误差和同阶展开的收敛差距！',
    },
    english: {
      icon: '🏛️',
      name: '政小思（逻辑结构复核）',
      content: '行文校验：英语议论文的段首主题句同样讲究“结论先行 + 辩证转折（While... / Admittedly...）”的严密逻辑架构。',
    },
    politics: {
      icon: '📚',
      name: '英小研（记忆迁移法）',
      content: '联动建议：可用时间轴与关键词对比表格做成双栏 Flashcard，结合 1/2/4/7 天艾宾浩斯节奏巩固极易混淆的会议年代。',
    },
  }

  return {
    toolTrace: `🔍 检索 Vault 笔记 (${notePath}) → ✅ 命中关联错因与考纲卡片`,
    content: coreAnswer,
    noteRef: { path: notePath, excerpt: noteExcerpt },
    peerReply: dualMode
      ? {
          agentName: peerMap[agent.id].name,
          agentIcon: peerMap[agent.id].icon,
          content: peerMap[agent.id].content,
        }
      : undefined,
  }
}

export function AgentTrialDemo({ fullscreen, onEnter }: DemoProps) {
  const [agentId, setAgentId] = useState<DemoAgentId>('408')
  const [tone, setTone] = useState<DemoTone>('rigorous')
  const [dualMode, setDualMode] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [messages, setMessages] = useState<DemoChatMessage[]>(() => [
    {
      id: 'init-welcome',
      role: 'assistant',
      agentName: DEMO_AGENTS['408'].name,
      agentIcon: DEMO_AGENTS['408'].icon,
      content: DEMO_AGENTS['408'].welcome,
    },
  ])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const activeAgent = DEMO_AGENTS[agentId]

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSelectAgent = (nextId: DemoAgentId) => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    setIsStreaming(false)
    setAgentId(nextId)
    const next = DEMO_AGENTS[nextId]
    setMessages([
      {
        id: `welcome-${nextId}-${Date.now()}`,
        role: 'assistant',
        agentName: next.name,
        agentIcon: next.icon,
        content: next.welcome,
      },
    ])
  }

  const handleSend = (rawQuestion?: string) => {
    const q = (rawQuestion ?? inputText).trim()
    if (!q || isStreaming) return
    if (!rawQuestion) setInputText('')

    const userMsg: DemoChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    }
    const aiId = `a-${Date.now() + 1}`
    const result = buildDemoAnswer(activeAgent, q, tone, dualMode)

    const placeholderMsg: DemoChatMessage = {
      id: aiId,
      role: 'assistant',
      agentName: activeAgent.name,
      agentIcon: activeAgent.icon,
      toolTrace: result.toolTrace,
      content: '',
    }

    setMessages(prev => [...prev, userMsg, placeholderMsg])
    setIsStreaming(true)

    let cursor = 0
    const fullText = result.content
    timerRef.current = window.setInterval(() => {
      cursor += Math.max(4, Math.ceil(fullText.length / 26))
      const slice = fullText.slice(0, cursor)
      const done = cursor >= fullText.length

      setMessages(prev =>
        prev.map(m =>
          m.id === aiId
            ? {
                ...m,
                content: slice,
                ...(done ? { noteRef: result.noteRef, peerReply: result.peerReply } : {}),
              }
            : m
        )
      )

      if (done) {
        if (timerRef.current) window.clearInterval(timerRef.current)
        timerRef.current = null
        setIsStreaming(false)
      }
    }, 28)
  }

  const toggleSaveToReview = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, savedToReview: !m.savedToReview } : m)))
  }

  return (
    <div
      className={`flex flex-col bg-[#0a0f1c] text-white ${
        fullscreen ? 'w-full h-full min-h-0' : 'h-[520px]'
      }`}
    >
      {/* 顶部工作台控制栏：4大名师 + 伴学语调 + 双师同台 */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-900/95 border-b border-violet-500/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(DEMO_AGENTS) as DemoAgentId[]).map(id => {
            const ag = DEMO_AGENTS[id]
            const active = agentId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectAgent(id)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-2xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  active
                    ? 'bg-violet-600 border-violet-400 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>{ag.icon}</span>
                <span>{ag.name}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-2xs">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            {[
              { key: 'rigorous' as const, label: '📐 严谨' },
              { key: 'exam' as const, label: '⚡ 冲刺' },
              { key: 'followup' as const, label: '🎯 追问' },
            ].map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTone(item.key)}
                className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                  tone === item.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDualMode(v => !v)}
            className={`px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
              dualMode
                ? 'bg-orange-500/20 border-orange-400/70 text-orange-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="开启后同一提问将同时生成另一学科专家的交叉对比研讨"
          >
            👥 双师同台 {dualMode ? '已开' : '关'}
          </button>

          <button
            type="button"
            onClick={onEnter}
            className="text-violet-300 hover:text-violet-200 font-bold underline cursor-pointer ml-1 whitespace-nowrap"
          >
            完整工作台 →
          </button>
        </div>
      </div>

      {/* 对话消息流 */}
      <div
        ref={scrollRef}
        className={`flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 space-y-3 ${
          fullscreen ? 'max-w-5xl w-full mx-auto' : ''
        }`}
      >
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-white text-slate-900 font-medium shadow-xs'
                  : 'bg-slate-900/95 border border-violet-500/25 text-slate-100'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xs font-bold text-violet-300 flex items-center gap-1">
                    <span>{m.agentIcon}</span>
                    <span>{m.agentName}</span>
                  </span>
                  {m.toolTrace && (
                    <span className="text-2xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full truncate max-w-[260px]">
                      {m.toolTrace}
                    </span>
                  )}
                </div>
              )}

              <div className="whitespace-pre-wrap">{m.content || '正在推理并检索关联笔记...'}</div>

              {m.noteRef && (
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-2xs">
                  <span className="text-slate-300 font-mono truncate max-w-full">
                    🔗 引用笔记：{m.noteRef.path}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSaveToReview(m.id)}
                    className={`px-2 py-0.5 rounded-md font-bold border transition-colors cursor-pointer ${
                      m.savedToReview
                        ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                        : 'bg-violet-500/15 border-violet-400/40 text-violet-200 hover:bg-violet-500/25'
                    }`}
                  >
                    {m.savedToReview ? '✓ 已加入今日 SM-2 复习队列' : '📌 存入错题复习队列'}
                  </button>
                </div>
              )}

              {m.peerReply && (
                <div className="mt-2 p-2.5 rounded-xl bg-orange-500/10 border border-orange-400/30 text-2xs text-orange-100 space-y-1">
                  <div className="font-bold text-orange-300">
                    {m.peerReply.agentIcon} {m.peerReply.agentName}
                  </div>
                  <div>{m.peerReply.content}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 快捷真题预设 + 真实自由提问输入栏 */}
      <div
        className={`px-3 sm:px-5 py-2.5 bg-slate-900/90 border-t border-slate-800 space-y-2 shrink-0 ${
          fullscreen ? 'max-w-5xl w-full mx-auto rounded-t-2xl' : ''
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-2xs text-slate-400 shrink-0">一键试问：</span>
          {activeAgent.quickPrompts.map(qp => (
            <button
              key={qp}
              type="button"
              disabled={isStreaming}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-violet-600/30 border border-slate-700 hover:border-violet-400/60 text-2xs text-slate-200 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`向 ${activeAgent.name} 输入考研问题（例如：等价无穷小什么时候不能直接换？或点上方快捷问题）`}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-violet-400 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            {isStreaming ? '推演中...' : '发送提问'}
          </button>
        </form>
      </div>
    </div>
  )
}
