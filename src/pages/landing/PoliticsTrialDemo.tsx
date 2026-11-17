import { useEffect, useState } from 'react'
import {
  loadTrialBridgeState,
  subscribeTrialBridge,
  updateTrialBridgeState,
} from '../../utils/trialStateBridge'

/**
 * 落地页「免登录试玩」中的考研政治 · 史纲时空演示。
 * 用轻量 SVG 时间轴呈现 1840~2024 三个历史时期与 3 个试玩节点，
 * 替代此前只有三张卡片、却宣称「已载入 3D 中国地图」的版本。
 * 内联预览与全屏试玩共用同一组件，避免两份文案各自漂移。
 */

interface PoliticsTrialDemoProps {
  /** 全屏试玩模式：放大字号并在视窗内居中 */
  fullscreen?: boolean
  onEnter: () => void
}

const START = 1839
const END = 2026

const ERAS = [
  { from: 1839, to: 1919, label: '旧民主主义革命', color: '#64748b' },
  { from: 1919, to: 1949, label: '新民主主义', color: '#d97706' },
  { from: 1949, to: 2026, label: '社会主义建设与新时代', color: '#b91c1c' },
]

const NODES = [
  {
    year: 1841,
    title: '三元里人民抗英',
    city: '广东广州',
    anchor: 'start' as const,
    tag: '史上第一次',
    focus: '必背“第一次”：近代大规模反侵略武装斗争',
    body: '1841 年广州三元里人民的抗英斗争，是中国近代史上中国人民第一次大规模的反侵略武装斗争，显示了中国人民不甘屈服和敢于抗击外国侵略者的英雄气概。',
    trap: '粉碎帝国主义瓜分中国图谋的根本原因是「中华民族进行的不屈不挠的反侵略斗争」，而非帝国主义列强之间的矛盾！',
  },
  {
    year: 1935,
    title: '遵义会议伟大转折',
    city: '贵州遵义',
    anchor: 'end' as const,
    tag: '生死攸关',
    focus: '转折标志：军事与组织领导地位确立',
    body: '遵义会议集中解决了当时具有决定意义的军事问题和组织问题，结束了王明“左”倾冒险主义在党中央的统治，是中国共产党第一次独立自主地运用马克思主义基本原理解决自己的路线、方针和政策问题。',
    trap: '遵义会议并未解决思想路线问题（思想路线问题在延安整风运动中解决）。',
  },
  {
    year: 1945,
    title: '中共七大与思想确立',
    city: '陕西延安',
    anchor: 'start' as const,
    tag: '毛泽东思想',
    focus: '思想里程碑：毛泽东思想写入党章',
    body: '中共七大总结了中国新民主主义革命二十多年曲折发展的历史经验，制定了正确的政治路线，把毛泽东思想确立为全党的指导思想并写入党章，为争取抗日战争的彻底胜利奠定了思想基础。',
    trap: '中共七大确立毛泽东思想为指导思想；八大开始全面探索社会主义建设道路。',
  },
  {
    year: 2025,
    title: '十五五规划与新质生产力',
    city: '首都北京',
    anchor: 'end' as const,
    tag: '时政热点',
    focus: '新时代定性：因地制宜发展新质生产力',
    body: '围绕推进中国式现代化进一步全面深化改革，科学谋划“十五五”时期经济社会发展，以科技创新引领产业创新，加快构建高水平社会主义市场经济体制。',
    trap: '高质量发展是全面建设社会主义现代化国家的「首要任务」；科技创新是发展新质生产力的「核心要素」。',
  },
]

const W = 600
const H = 120
const PAD = 24
const x = (year: number) => PAD + ((year - START) / (END - START)) * (W - PAD * 2)

export function PoliticsTrialDemo({ fullscreen, onEnter }: PoliticsTrialDemoProps) {
  const [idx, setIdxState] = useState<number>(() => loadTrialBridgeState().politicsNodeIdx || 0)

  useEffect(() => {
    return subscribeTrialBridge((next) => {
      if (typeof next.politicsNodeIdx === 'number') {
        setIdxState(next.politicsNodeIdx)
      }
    })
  }, [])

  const setIdx = (nextIdx: number) => {
    setIdxState(nextIdx)
    updateTrialBridgeState({ politicsNodeIdx: nextIdx, politicsInteracted: true })
  }

  const node = NODES[idx] || NODES[0]

  return (
    <div
      className={`w-full min-w-0 flex flex-col bg-[#070b14] text-slate-100 ${
        fullscreen ? 'max-w-5xl m-auto p-4 sm:p-8 gap-5' : 'h-[520px] p-4 sm:p-6 gap-3 overflow-y-auto overflow-x-hidden'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 motion-safe:animate-pulse" />
          <span className={`font-bold text-amber-300 tracking-wide ${fullscreen ? 'text-base' : 'text-sm'}`}>
            考研政治 · 1839–2026 史纲时空轴
          </span>
          <span className="text-2xs text-amber-300/90 border border-amber-500/30 px-2 py-0.5 rounded-full">
            试玩演示
          </span>
        </div>
        <span className="text-xs text-slate-300">点击时间轴上的节点切换考点</span>
      </div>

      {/* 时间轴：三大时期色带 + 可点击节点 */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto select-none"
        role="group"
        aria-label="1839 至 2026 年中国近现代史与新时代时政时间轴"
      >
        {ERAS.map((era) => (
          <g key={era.from}>
            <rect x={x(era.from)} y={52} width={x(era.to) - x(era.from)} height={8} fill={era.color} opacity={0.55} />
            <text x={(x(era.from) + x(era.to)) / 2} y={84} textAnchor="middle" fontSize={14} fill="#cbd5e1">
              {era.label}
            </text>
          </g>
        ))}
        {[1839, 1919, 1949, 1978, 2026].map((year) => (
          <g key={year}>
            <line x1={x(year)} x2={x(year)} y1={48} y2={64} stroke="#94a3b8" strokeWidth={1} />
            <text x={x(year)} y={104} textAnchor={year === START ? 'start' : year === END ? 'end' : 'middle'} fontSize={13} fill="#94a3b8" fontFamily="ui-monospace, monospace">
              {year}
            </text>
          </g>
        ))}
        {NODES.map((n, i) => {
          const active = i === idx
          return (
            <g
              key={n.year}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${n.year} 年 ${n.title}`}
              onClick={() => setIdx(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIdx(i)
                }
              }}
              className="cursor-pointer outline-none"
            >
              <line x1={x(n.year)} x2={x(n.year)} y1={22} y2={56} stroke={active ? '#fbbf24' : '#475569'} strokeWidth={active ? 2 : 1} />
              <circle cx={x(n.year)} cy={56} r={active ? 9 : 6} fill={active ? '#fbbf24' : '#1e293b'} stroke="#fbbf24" strokeWidth={2} />
              <text
                x={x(n.year) + (n.anchor === 'end' ? -3 : n.anchor === 'start' ? 3 : 0)}
                y={16}
                textAnchor={n.anchor}
                fontSize={14}
                fontWeight={700}
                fill={active ? '#fde68a' : '#94a3b8'}
                fontFamily="ui-monospace, monospace"
              >
                {n.year}
              </text>
            </g>
          )
        })}
      </svg>

      {/* 节点卡片（与时间轴同步，便于小屏点按） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 min-w-0">
        {NODES.map((n, i) => (
          <button
            key={n.year}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === idx}
            className={`min-w-0 p-2 sm:p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              i === idx
                ? 'bg-amber-500/15 border-amber-400/80 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-white truncate">{n.title}</div>
            <div className="text-2xs text-slate-300 mt-1 flex items-center justify-between gap-1">
              <span className="truncate">📍 {n.city}</span>
              <span className="hidden sm:inline text-2xs px-1.5 rounded bg-white/10 text-amber-200 shrink-0">{n.tag}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-4 sm:p-5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold text-amber-300">📜 核心命题点</span>
          <span className="text-2xs sm:text-xs text-amber-200 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
            {node.focus}
          </span>
        </div>
        <p className={`text-slate-100 leading-relaxed ${fullscreen ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>{node.body}</p>
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-2xs sm:text-xs text-amber-100">
          <span className="font-bold">易混淆点：</span>
          {node.trap}
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <span>试玩版展示 4 个代表节点，完整舱室覆盖 1839–2026 全景中国历史地图与同城史实联动</span>
        <button type="button" onClick={onEnter} className="text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer">
          打开完整史纲地图 →
        </button>
      </div>
    </div>
  )
}
