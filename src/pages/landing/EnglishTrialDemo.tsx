import { useState } from 'react'
import { Sparkles, CheckCircle2, RotateCcw, Wand2, ArrowUpRight, BookOpenCheck } from 'lucide-react'

interface EnglishTrialDemoProps {
  fullscreen?: boolean
  onEnter: () => void
}

interface UpgradeToken {
  id: string
  basic: string
  advanced: string
  reason: string
  boost: number
}

interface EssaySample {
  id: 'eng1' | 'eng2' | 'letter'
  badge: string
  title: string
  maxScore: number
  baseScore: number
  segments: Array<{ text?: string; tokenId?: string }>
  tokens: Record<string, UpgradeToken>
}

const ESSAY_SAMPLES: EssaySample[] = [
  {
    id: 'eng1',
    badge: '英语一 · 图画议论文',
    title: '智能手机与深度思考的博弈',
    maxScore: 20,
    baseScore: 13.5,
    segments: [
      { text: 'As is vividly depicted in the cartoon, two youngsters stand at a crossroads, yet ' },
      { tokenId: 't1' },
      { text: ' smartphones. ' },
      { tokenId: 't2' },
      { text: ' cultivating deep reading habits is ' },
      { tokenId: 't3' },
      { text: ' for postgraduate candidates, and universities should ' },
      { tokenId: 't4' },
      { text: ' to foster an immersive academic atmosphere.' },
    ],
    tokens: {
      t1: {
        id: 't1',
        basic: 'many people lose their minds in',
        advanced: 'a multitude of contemporaries succumb to digital distraction from',
        reason: '用 a multitude of 替代泛化的 many people，动词词组 succumb to（屈服/沉溺于）精准契合阅卷一档词汇标准。',
        boost: 1.4,
      },
      t2: {
        id: 't2',
        basic: 'I think',
        advanced: 'I harbor the firm conviction that',
        reason: '告别口语化的 I think，升级为同位语从句高分句型，瞬间拉开第三段观点句档次。',
        boost: 1.3,
      },
      t3: {
        id: 't3',
        basic: 'very good',
        advanced: 'of paramount significance',
        reason: '“be + of + 抽象名词”结构是考研大作文黄金语法加分项，消除小学生词汇感。',
        boost: 1.3,
      },
      t4: {
        id: 't4',
        basic: 'help us make better rules',
        advanced: 'formulate constructive initiatives',
        reason: '措施段避免流水账 help us make，改用学术动词 formulate 与 constructive initiatives 体现严谨策论思维。',
        boost: 1.3,
      },
    },
  },
  {
    id: 'eng2',
    badge: '英语二 · 动态图表作文',
    title: '高校学子数字化研学工具渗透率',
    maxScore: 15,
    baseScore: 9.8,
    segments: [
      { text: 'According to the bar chart above, the proportion of students using intelligent study tools ' },
      { tokenId: 'e1' },
      { text: ' from 28% to 79% over the past five years. ' },
      { tokenId: 'e2' },
      { text: ' two core factors: for one thing, structured flashcards ' },
      { tokenId: 'e3' },
      { text: '; for another, instant feedback makes revision ' },
      { tokenId: 'e4' },
      { text: '.' },
    ],
    tokens: {
      e1: {
        id: 'e1',
        basic: 'went up very fast',
        advanced: 'witnessed a dramatic surge',
        reason: '图表首段切忌口语化 went up，使用无灵主语 witnessed a dramatic surge 地道展现数据跃升。',
        boost: 1.2,
      },
      e2: {
        id: 'e2',
        basic: 'This is because of',
        advanced: 'This remarkable trend can be attributed to',
        reason: '二段过渡承上启下经典模板句，被动语态 can be attributed to 自然引出成因剖析。',
        boost: 1.1,
      },
      e3: {
        id: 'e3',
        basic: 'help students remember things',
        advanced: 'consolidate long-term retention systematically',
        reason: '将笼统的 remember things 提炼为精准学术搭配 consolidate long-term retention。',
        boost: 1.1,
      },
      e4: {
        id: 'e4',
        basic: 'much easier and faster',
        advanced: 'markedly more targeted and efficient',
        reason: '用副词 markedly 修饰高级形容词 targeted and efficient，收尾铿锵有力。',
        boost: 1.0,
      },
    },
  },
  {
    id: 'letter',
    badge: '小作文 · 改进建议信',
    title: '致图书馆馆长的自习空间优化建议',
    maxScore: 10,
    baseScore: 6.5,
    segments: [
      { text: 'Dear Sir or Madam, ' },
      { tokenId: 'l1' },
      { text: ' share several constructive proposals regarding our reading room. ' },
      { tokenId: 'l2' },
      { text: ' add power outlets at each desk. ' },
      { tokenId: 'l3' },
      { text: ' for your time and consideration, and ' },
      { tokenId: 'l4' },
      { text: '.' },
    ],
    tokens: {
      l1: {
        id: 'l1',
        basic: 'I am writing this letter to',
        advanced: 'I am writing with sincere appreciation to',
        reason: '书信首句遵循“先肯定致谢、再委婉提议”礼貌原则，瞬间赢得阅卷印象分。',
        boost: 0.8,
      },
      l2: {
        id: 'l2',
        basic: 'You need to',
        advanced: 'It would be immensely advisable if we could',
        reason: '建议信严禁生硬祈使句 You need to，虚拟语气委婉提议是小作文一档核心标尺。',
        boost: 0.9,
      },
      l3: {
        id: 'l3',
        basic: 'Thank you very much',
        advanced: 'I would like to extend my heartfelt gratitude',
        reason: '地道公务信函致谢句式，格调端庄得体。',
        boost: 0.7,
      },
      l4: {
        id: 'l4',
        basic: 'please reply to me soon',
        advanced: 'I look forward to your favorable reply at your earliest convenience',
        reason: '标准考研书信满分收尾句，句式完整且语域恰当。',
        boost: 0.8,
      },
    },
  },
]

export function EnglishTrialDemo({ fullscreen, onEnter }: EnglishTrialDemoProps) {
  const [sampleIdx, setSampleIdx] = useState(0)
  const [upgradedIds, setUpgradedIds] = useState<Record<string, boolean>>({ t1: true })
  const [activeTokenId, setActiveTokenId] = useState<string>('t1')

  const sample = ESSAY_SAMPLES[sampleIdx]
  const tokenKeys = Object.keys(sample.tokens)
  const upgradedCount = tokenKeys.filter((k) => upgradedIds[k]).length

  const currentScore = Math.min(
    sample.maxScore,
    Number(
      (
        sample.baseScore +
        tokenKeys.reduce((acc, k) => acc + (upgradedIds[k] ? sample.tokens[k].boost : 0), 0)
      ).toFixed(1)
    )
  )

  const scoreRatio = Math.round((currentScore / sample.maxScore) * 100)
  const activeToken = sample.tokens[activeTokenId] || sample.tokens[tokenKeys[0]]

  const handleSelectSample = (idx: number) => {
    const next = ESSAY_SAMPLES[idx]
    const firstKey = Object.keys(next.tokens)[0]
    setSampleIdx(idx)
    setUpgradedIds({ [firstKey]: true })
    setActiveTokenId(firstKey)
  }

  const toggleToken = (id: string) => {
    setActiveTokenId(id)
    setUpgradedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const upgradeAll = () => {
    const next: Record<string, boolean> = {}
    tokenKeys.forEach((k) => {
      next[k] = true
    })
    setUpgradedIds(next)
    setActiveTokenId(tokenKeys[tokenKeys.length - 1])
  }

  const resetAll = () => {
    setUpgradedIds({})
    setActiveTokenId(tokenKeys[0])
  }

  return (
    <div
      className={`flex flex-col w-full min-w-0 overflow-hidden bg-[#0a0f1d] text-white ${
        fullscreen ? 'h-full min-h-0' : 'h-[520px]'
      }`}
    >
      {/* 顶部控制条 */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-900/95 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-2xs shrink-0">
            <BookOpenCheck className="w-3 h-3" />
            <span>考研英语精批沙盒</span>
          </span>
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 max-w-full overflow-x-auto no-scrollbar">
            {ESSAY_SAMPLES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSample(idx)}
                className={`px-2.5 py-1 rounded-md text-2xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  sampleIdx === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.badge}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs">
          <button
            type="button"
            onClick={upgradedCount === tokenKeys.length ? resetAll : upgradeAll}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold transition-colors cursor-pointer"
          >
            {upgradedCount === tokenKeys.length ? (
              <>
                <RotateCcw className="w-3 h-3" />
                <span>还原考生初稿</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                <span>一键满级润色 ({upgradedCount}/{tokenKeys.length})</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="inline-flex items-center gap-0.5 text-indigo-300 hover:text-indigo-200 font-bold underline cursor-pointer whitespace-nowrap"
          >
            <span>批改我的作文</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 主体交互区 */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 ${
          fullscreen ? 'max-w-6xl mx-auto w-full content-start' : ''
        }`}
      >
        {/* 左栏：可点击升格交互正文 */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-slate-950/90 border border-slate-800/90 p-3.5 sm:p-5 gap-3 min-w-0">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-100">{sample.title}</div>
                <div className="text-2xs text-slate-400 mt-0.5">
                  点击文中带横线的词句，亲手体验平庸表达向一档满分句式的蜕变
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-2xs font-bold shrink-0">
                已升格 {upgradedCount}/{tokenKeys.length} 处
              </span>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#0d1426] border border-indigo-500/20 leading-[2.05] text-xs sm:text-[13.5px] font-serif text-slate-200 tracking-wide select-text">
              {sample.segments.map((seg, i) => {
                if (seg.text) {
                  return <span key={i}>{seg.text}</span>
                }
                const tk = sample.tokens[seg.tokenId!]
                const isUpgraded = Boolean(upgradedIds[tk.id])
                const isSelected = activeTokenId === tk.id
                return (
                  <button
                    key={tk.id}
                    type="button"
                    onClick={() => toggleToken(tk.id)}
                    className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md font-sans text-xs sm:text-[13px] font-semibold transition-all cursor-pointer align-baseline text-left ${
                      isUpgraded
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-amber-500/15 text-amber-200 border border-dashed border-amber-400/60 hover:bg-amber-500/25'
                    } ${isSelected ? 'ring-2 ring-white/40' : ''}`}
                    title={isUpgraded ? '点击可对比原句' : '点击一键升格为高分表达'}
                  >
                    {isUpgraded && <Sparkles className="w-3 h-3 text-emerald-300 shrink-0 inline" />}
                    <span>{isUpgraded ? tk.advanced : tk.basic}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-2xs text-slate-400">
            <span>琥珀虚线 = 原稿平庸词 · 翠绿高亮 = 阅卷一档加分句</span>
            <span>支持手写作文拍照 OCR 秒级识别</span>
          </div>
        </div>

        {/* 右栏：动态卷面分仪表盘 + 名师逐句精析 */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-indigo-950/70 to-slate-950 border border-indigo-500/30 p-3.5 sm:p-5 gap-3.5 min-w-0">
          <div className="space-y-3">
            {/* 实时动态得分卡 */}
            <div className="flex items-end justify-between pb-3 border-b border-indigo-400/20">
              <div>
                <div className="text-2xs font-semibold text-indigo-300 uppercase tracking-wider">
                  AI 阅卷标准预估得分
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums transition-all">
                    {currentScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">/ {sample.maxScore}.0 分</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-2xs font-bold border ${
                  scoreRatio >= 85
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : scoreRatio >= 75
                    ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                    : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                }`}
              >
                {scoreRatio >= 85 ? '第五档 · 惊艳高分卷' : scoreRatio >= 75 ? '第四档 · 良好稳健卷' : '第三档 · 基础及格卷'}
              </span>
            </div>

            {/* 四维评分进度条 */}
            <div className="grid grid-cols-2 gap-2.5 text-2xs">
              {[
                { label: '词汇丰富度', val: Math.min(98, 62 + upgradedCount * 9) },
                { label: '句式多变性', val: Math.min(96, 65 + upgradedCount * 8) },
                { label: '逻辑衔接度', val: Math.min(95, 74 + upgradedCount * 5) },
                { label: '切题与格式', val: 94 },
              ].map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{metric.label}</span>
                    <span className="font-mono font-bold text-indigo-200">{metric.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${metric.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 当前选中词块的深度诊断 */}
            {activeToken && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-amber-300 font-bold text-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>名师升格批注 (+{activeToken.boost} 分)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleToken(activeToken.id)}
                    className="text-2xs font-semibold text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    {upgradedIds[activeToken.id] ? '已应用升格' : '点击立即应用'}
                  </button>
                </div>
                <div className="text-2xs text-slate-400 line-through">{activeToken.basic}</div>
                <div className="text-xs font-semibold text-emerald-300 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{activeToken.advanced}</span>
                </div>
                <p className="text-2xs text-slate-300 leading-relaxed pt-1 border-t border-white/5">
                  {activeToken.reason}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onEnter}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>解锁全套大小作文黄金模板与 AI 批改舱 →</span>
          </button>
        </div>
      </div>
    </div>
  )
}
