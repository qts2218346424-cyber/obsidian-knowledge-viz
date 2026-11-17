import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Link2,
  Play,
  Pause,
  Sparkles,
  Volume2,
  Eye,
  Columns2,
} from 'lucide-react'

export type GallerySlideId = 'graph' | 'editor' | 'quiz' | 'pomodoro'

interface LiveWorkspaceGalleryStageProps {
  slideId: GallerySlideId
}

const GRAPH_NODES = [
  {
    id: 'pv',
    label: 'PV 同步互斥',
    x: 230,
    y: 118,
    mastery: 94,
    level: 'mastered' as const,
    links: 8,
    years: '2016 / 2019 / 2023 大题',
    summary: '先执行资源信号量 P(empty)，再执行互斥信号量 P(mutex)，严防死锁。',
  },
  {
    id: 'deadlock',
    label: '死锁四大条件',
    x: 105,
    y: 72,
    mastery: 89,
    level: 'mastered' as const,
    links: 6,
    years: '2015 / 2021 / 2023 选择',
    summary: '互斥、占有且等待、不可抢占、循环等待；破坏任一条件即可预防死锁。',
  },
  {
    id: 'banker',
    label: '银行家算法',
    x: 365,
    y: 68,
    mastery: 76,
    level: 'review' as const,
    links: 5,
    years: '2013 / 2018 / 2022 统考',
    summary: '寻找 Need ≤ Work 的安全序列，属于死锁避免策略而非死锁检测。',
  },
  {
    id: 'monitor',
    label: '管程与条件变量',
    x: 112,
    y: 182,
    mastery: 58,
    level: 'weak' as const,
    links: 4,
    years: '2017 / 2024 考点',
    summary: '薄弱预警：注意区分条件变量 x.wait() 不占互斥锁与信号量 P 操作的本质差异。',
  },
  {
    id: 'paging',
    label: '两级页表变换',
    x: 358,
    y: 180,
    mastery: 91,
    level: 'mastered' as const,
    links: 7,
    years: '2014 / 2020 / 2024 大题',
    summary: '页目录号 + 页表索引 + 页内偏移，结合快表 TLB 计算有效访存时间 EAT。',
  },
  {
    id: 'cache',
    label: 'Cache 组相联',
    x: 235,
    y: 215,
    mastery: 84,
    level: 'review' as const,
    links: 6,
    years: '2016 / 2021 / 2023 大题',
    summary: '主存地址拆分为 Tag + 组号 Index + 块内偏移 Offset，联动虚拟页号转换。',
  },
]

const GRAPH_EDGES: Array<[string, string]> = [
  ['pv', 'deadlock'],
  ['pv', 'banker'],
  ['pv', 'monitor'],
  ['pv', 'paging'],
  ['deadlock', 'banker'],
  ['paging', 'cache'],
  ['monitor', 'cache'],
]

const STEP_RUBRIC = [
  { id: 's1', title: '定义信号量初值：mutex = 1, empty = N, full = 0', pts: 2 },
  { id: 's2', title: '严格按先 P(empty) 后 P(mutex) 顺序加锁防死锁', pts: 4 },
  { id: 's3', title: '临界区操作完成后执行 V(mutex) 与 V(full) 唤醒消费者', pts: 2 },
]

export function LiveWorkspaceGalleryStage({ slideId }: LiveWorkspaceGalleryStageProps) {
  // 01 图谱选中节点
  const [selectedNodeId, setSelectedNodeId] = useState<string>('pv')

  // 02 编辑器视图模式
  const [editorSplit, setEditorSplit] = useState<boolean>(true)

  // 03 模考踩分点核对状态
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({
    s1: true,
    s2: true,
    s3: false,
  })

  // 04 番茄钟与白噪音混音状态
  const [pomoRunning, setPomoRunning] = useState<boolean>(true)
  const [pomoSec, setPomoSec] = useState<number>(24 * 60 + 42)
  const [activeTracks, setActiveTracks] = useState<Record<string, boolean>>({
    rain: true,
    lofi: true,
    alpha: false,
  })

  useEffect(() => {
    if (slideId !== 'pomodoro' || !pomoRunning) return
    const timer = window.setInterval(() => {
      setPomoSec((s) => (s > 0 ? s - 1 : 25 * 60))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [slideId, pomoRunning])

  const activeNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0]
  const totalRubricScore = STEP_RUBRIC.reduce(
    (sum, item) => sum + (checkedSteps[item.id] ? item.pts : 0),
    0
  )
  const mm = String(Math.floor(pomoSec / 60)).padStart(2, '0')
  const ss = String(pomoSec % 60).padStart(2, '0')

  /* =========================================================================
     视窗 01：双链知识网络与掌握度拓扑（无任何遮挡 · 可直接点选节点查看掌握度）
     ========================================================================= */
  if (slideId === 'graph') {
    return (
      <div className="w-full min-h-[300px] sm:aspect-[16/10] bg-[#0b1020] text-slate-100 flex flex-col justify-between p-3 sm:p-4 select-none">
        {/* 顶栏指标 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-violet-500/20 border border-violet-400/30 text-violet-300 font-bold">
              知识掌握度星图
            </span>
            <span className="text-slate-400 hidden sm:inline">148 节点 · 362 双链 · 点击节点查看考情</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px]">
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              已吃透
            </span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              巩固中
            </span>
            <span className="inline-flex items-center gap-1 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              待攻克
            </span>
          </div>
        </div>

        {/* 中部可点击双链拓扑画布 */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-2 min-h-0">
          <div className="sm:col-span-7 h-full flex items-center justify-center rounded-xl bg-slate-950/80 border border-white/5 p-1">
            <svg viewBox="0 0 470 255" className="w-full h-auto max-h-[210px]">
              {GRAPH_EDGES.map(([a, b]) => {
                const na = GRAPH_NODES.find((n) => n.id === a)!
                const nb = GRAPH_NODES.find((n) => n.id === b)!
                const highlighted = selectedNodeId === a || selectedNodeId === b
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={highlighted ? '#818cf8' : '#334155'}
                    strokeWidth={highlighted ? 2.2 : 1.2}
                    strokeDasharray={highlighted ? undefined : '3 3'}
                  />
                )
              })}

              {GRAPH_NODES.map((node) => {
                const isSelected = node.id === selectedNodeId
                const fill =
                  node.level === 'mastered'
                    ? '#10b981'
                    : node.level === 'review'
                    ? '#f59e0b'
                    : '#f43f5e'
                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedNodeId(node.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedNodeId(node.id)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle cx={node.x} cy={node.y} r={22} fill={fill} opacity={0.22} />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 13 : 10}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2.5 : 1.2}
                    />
                    <text
                      x={node.x}
                      y={node.y + 26}
                      textAnchor="middle"
                      fontSize={11.5}
                      fontWeight={isSelected ? 700 : 500}
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* 右侧节点详情面板 */}
          <div className="sm:col-span-5 h-full rounded-xl bg-slate-900/90 border border-indigo-500/25 p-3 flex flex-col justify-between gap-2 text-left">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-white truncate">{activeNode.label}</span>
                <span className="text-[11px] font-mono font-bold text-emerald-300 shrink-0">
                  掌握度 {activeNode.mastery}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${activeNode.mastery}%` }}
                />
              </div>
              <div className="text-[10.5px] text-indigo-300 font-medium pt-0.5">
                考频年份：{activeNode.years}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{activeNode.summary}</p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Link2 className="w-3 h-3 text-indigo-400" />
                <span>双向关联 {activeNode.links} 篇笔记</span>
              </span>
              <span className="text-indigo-300 font-semibold">点击左侧节点可切换</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================================
     视窗 02：出版级 LaTeX 公式与双栏笔记（Obsidian 双链 + 数学公式实时渲染）
     ========================================================================= */
  if (slideId === 'editor') {
    return (
      <div className="w-full min-h-[300px] sm:aspect-[16/10] bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-3 sm:p-4 select-none">
        {/* 编辑器工具条 */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-mono font-bold text-slate-800 truncate">
              01-考研数学/微分中值定理辅助函数构造.md
            </span>
          </div>
          <button
            type="button"
            onClick={() => setEditorSplit((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10.5px] cursor-pointer shrink-0"
          >
            {editorSplit ? <Eye className="w-3 h-3" /> : <Columns2 className="w-3 h-3" />}
            <span>{editorSplit ? '切换纯预览视图' : '恢复双栏对照'}</span>
          </button>
        </div>

        {/* 双栏对照主体 */}
        <div className={`flex-1 grid ${editorSplit ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2.5 py-2.5 min-h-0`}>
          {editorSplit && (
            <div className="rounded-xl bg-slate-900 text-slate-200 p-3 font-mono text-[11px] leading-relaxed space-y-1.5 text-left overflow-hidden">
              <div className="text-slate-500">---</div>
              <div className="text-emerald-300">tags: [高等数学, 中值定理, 高频证明]</div>
              <div className="text-slate-500">---</div>
              <div className="text-sky-300 font-bold"># 积分因子法构造辅助函数</div>
              <div className="text-slate-300">
                关联前置定理：<span className="text-amber-300">[[罗尔定理]]</span> ·{' '}
                <span className="text-amber-300">[[拉格朗日中值定理]]</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 text-pink-300 text-[10.5px]">
                {'$$F(x) = e^{\\int P(x)\\,dx} \\cdot f(x)$$'}
              </div>
              <div className="text-slate-400">
                {'💡 当待证结论形如 f\'(ξ) + P(ξ)f(ξ) = 0 时，直接对左端乘积分因子即可秒凑原函数！'}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 text-left flex flex-col justify-between gap-2 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                  积分因子法构造辅助函数
                </span>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold">
                  KaTeX 实时排版
                </span>
              </div>

              <div className="text-[11px] text-slate-600">
                关联双链：
                <span className="mx-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                  罗尔定理
                </span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                  2022数一压轴大题
                </span>
              </div>

              {/* 模拟出版级数学公式渲染块 */}
              <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center font-serif">
                <div className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                  <i>F</i>(<i>x</i>) = <i>e</i>
                  <sup className="text-[10px] ml-0.5">∫ P(x)dx</sup> · <i>f</i>(<i>x</i>) ⇒{' '}
                  <i>F&prime;</i>(<i>&xi;</i>) = 0
                </div>
                <div className="text-[10.5px] font-sans text-slate-500 mt-1">
                  求导化简得：<i>f&prime;</i>(<i>&xi;</i>) + <i>P</i>(<i>&xi;</i>)<i>f</i>(<i>&xi;</i>) = 0
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-50/90 border-l-3 border-amber-500 text-[11px] text-amber-950 leading-snug">
                <strong>踩分批注：</strong>必须先写明 <i>F</i>(<i>x</i>) 在闭区间 [<i>a</i>, <i>b</i>] 连续、开区间 (<i>a</i>, <i>b</i>) 可导，否则扣 1 分步骤严谨分！
              </div>
            </div>

            <div className="text-[10.5px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>纯本地标准 .md 格式保存</span>
              <span className="text-teal-600 font-semibold">自动实时保存 ✓</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================================
     视窗 03：全真模考卷面与分步踩分导师（可亲手勾选踩分点体验实时核分）
     ========================================================================= */
  if (slideId === 'quiz') {
    return (
      <div className="w-full min-h-[300px] sm:aspect-[16/10] bg-[#0d1222] text-white flex flex-col justify-between p-3 sm:p-4 select-none">
        {/* 考场顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold">
              2023 统考 408 真题整卷模考
            </span>
            <span className="text-slate-400 hidden sm:inline">第 45 题 · 操作系统综合大题 (8 分)</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono font-bold">
            <Clock className="w-3 h-3" />
            <span>考场剩余 02:36:18</span>
          </span>
        </div>

        {/* 左右分栏：大题题干 + 分步踩分自检器 */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 py-2.5 min-h-0">
          <div className="sm:col-span-5 rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-left flex flex-col justify-between gap-2">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-sky-300">【综合应用题 · 信号量同步】</div>
              <p className="text-[11.5px] text-slate-200 leading-relaxed">
                设缓冲区容量为 N，生产者进程不断生成数据放入缓冲区，消费者进程从中取出处理。请用信号量 P、V 操作写出无死锁的伪代码实现，并逐项核对右侧阅卷踩分点。
              </p>
            </div>
            <div className="p-2 rounded-lg bg-slate-950 border border-white/5 font-mono text-[10.5px] text-emerald-300">
              semaphore mutex = 1, empty = N, full = 0;
            </div>
          </div>

          <div className="sm:col-span-7 rounded-xl bg-indigo-950/50 border border-indigo-500/30 p-3 text-left flex flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>大题分步踩分核对导师（点击勾选自评）</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-300">
                  得分：{totalRubricScore} / 8 分
                </span>
              </div>

              <div className="space-y-1.5">
                {STEP_RUBRIC.map((step) => {
                  const checked = Boolean(checkedSteps[step.id])
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() =>
                        setCheckedSteps((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
                      }
                      className={`w-full p-2 rounded-lg border text-left text-[11px] flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        checked
                          ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-100'
                          : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            checked ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{step.title}</span>
                      </span>
                      <span className="font-mono font-bold text-amber-300 shrink-0">
                        +{step.pts}分
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="text-[10.5px] text-slate-300 flex items-center justify-between pt-1.5 border-t border-white/10">
              <span>未命中的踩分步骤将自动归入个人错题本</span>
              <span className="text-emerald-300 font-bold">支持整卷计时交卷</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* =========================================================================
     视窗 04：沉浸式番茄钟与 Lofi 自习电台（高清无遮挡 · 实时倒计时与白噪音混音台）
     ========================================================================= */
  return (
    <div className="w-full min-h-[300px] sm:aspect-[16/10] bg-gradient-to-br from-[#0f172a] via-[#131836] to-[#090d1a] text-white flex flex-col justify-between p-3.5 sm:p-5 select-none">
      {/* 顶部自习室状态栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span>沉浸心流自习舱 · 第 4 个番茄</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span>今日已专注 <strong className="text-white">145 分钟</strong></span>
          <span className="text-emerald-300 font-bold">连续打卡 26 天</span>
        </div>
      </div>

      {/* 左右双栏：发光番茄计时圆环 + Lofi 电台与环境音混音器 */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center py-2 min-h-0">
        {/* 左栏：环形番茄钟 */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 gap-2.5">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="none"
                stroke="#fb923c"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="270"
                strokeDashoffset={Math.round(270 * (1 - pomoSec / (25 * 60)))}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-extrabold tracking-wider tabular-nums">
                {mm}:{ss}
              </span>
              <span className="text-[10px] text-orange-300 font-semibold mt-0.5">
                {pomoRunning ? '深度专注中' : '已暂停休息'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPomoRunning((v) => !v)}
            className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {pomoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{pomoRunning ? '暂停计时' : '继续专注'}</span>
          </button>
        </div>

        {/* 右栏：Lofi 电台与多轨白噪音混音台 */}
        <div className="sm:col-span-7 flex flex-col justify-between rounded-2xl bg-slate-950/75 border border-white/10 p-3.5 gap-3 text-left h-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lofi 沉浸电台与双耳专注白噪音</span>
              </span>
              <span className="text-[10px] text-slate-400">点击音轨可自由叠混</span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'rain', name: '深夜窗外细雨（沉浸环境音）', level: '68%' },
                { id: 'lofi', name: '午夜自习室醇厚钢琴（静谧伴学曲）', level: '52%' },
                { id: 'alpha', name: '10Hz 阿尔法心流专注脑波音', level: '35%' },
              ].map((track) => {
                const on = Boolean(activeTracks[track.id])
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() =>
                      setActiveTracks((prev) => ({ ...prev, [track.id]: !prev[track.id] }))
                    }
                    className={`w-full px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      on
                        ? 'bg-indigo-500/20 border-indigo-400/50 text-white'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Volume2 className={`w-3.5 h-3.5 shrink-0 ${on ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span className="font-semibold truncate">{track.name}</span>
                    </span>
                    <span className="font-mono text-[10.5px] shrink-0">
                      {on ? `混音 ${track.level}` : '已静音'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 底部近 7 日专注时长微柱状图 */}
          <div className="pt-2 border-t border-white/10 flex items-end justify-between gap-2">
            <span className="text-[10.5px] text-slate-400">近 7 日备考热力趋势：</span>
            <div className="flex items-end gap-1.5 h-6">
              {[45, 72, 60, 88, 76, 95, 100].map((h, idx) => (
                <span
                  key={idx}
                  className="w-2.5 rounded-t bg-gradient-to-t from-indigo-500 to-emerald-400"
                  style={{ height: `${Math.round((h / 100) * 24)}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
