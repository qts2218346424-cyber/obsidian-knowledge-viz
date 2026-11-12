import { useState } from 'react'

/**
 * 落地页「免登录试玩」中的考研数学 / 双核 Agent 演示。
 * 修复：此前这两个学科标签会错误回退到英语作文批改演示。
 * 公式使用 Unicode 排版而非 KaTeX，避免落地页首屏加载 Markdown/KaTeX 引擎。
 */

interface DemoProps {
  /** 全屏试玩模式：放大字号并在视窗内居中 */
  fullscreen?: boolean
  onEnter: () => void
}

const MATH_STEPS = [
  {
    title: '识别题型',
    body: '待定型 0/0，分子分母在 x → 0 时同时趋于 0，可用泰勒展开或洛必达法则。',
    formula: 'lim(x→0) [eˣ − 1 − x] / x²',
  },
  {
    title: '泰勒展开到二阶',
    body: '展开到与分母同阶即可，高阶项并入 o(x²)。',
    formula: 'eˣ = 1 + x + x²/2 + o(x²)',
  },
  {
    title: '代入化简',
    body: '分子只剩二阶主项，约去 x²。',
    formula: '[x²/2 + o(x²)] / x² → 1/2',
  },
  {
    title: '得出结论并核对踩分点',
    body: '展开阶数正确 (2 分) · 余项处理规范 (1 分) · 结论 (1 分)。',
    formula: '原式 = 1/2',
  },
]

export function MathTrialDemo({ fullscreen, onEnter }: DemoProps) {
  const [step, setStep] = useState(0)
  const done = step >= MATH_STEPS.length - 1

  return (
    <div
      className={`flex flex-col bg-[#0b1020] text-white ${
        fullscreen ? 'w-full max-w-4xl m-auto p-4 sm:p-8 gap-6' : 'h-[520px] p-5 sm:p-6 justify-between'
      }`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-pink-500/20">
          <span className={`font-bold text-pink-300 ${fullscreen ? 'text-base' : 'text-sm'}`}>
            考研数学 · AI 分步推导与踩分核对
          </span>
          <span className="text-xs text-pink-300 bg-pink-500/15 px-2 py-0.5 rounded-lg">高等数学 · 极限</span>
        </div>

        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
          <div className="text-2xs text-slate-400 font-semibold mb-1.5">例题</div>
          <div className={`font-serif tracking-wide text-slate-100 ${fullscreen ? 'text-xl' : 'text-lg'}`}>
            求极限 lim<sub className="text-xs">x→0</sub> (eˣ − 1 − x) / x²
          </div>
        </div>

        <ol className="space-y-2">
          {MATH_STEPS.slice(0, step + 1).map((s, i) => (
            <li
              key={s.title}
              className="flex gap-3 rounded-xl border border-pink-500/20 bg-pink-500/[0.06] px-3.5 py-2.5 animate-fade-in-up"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/25 text-2xs font-bold text-pink-200">
                {i + 1}
              </span>
              <div className="min-w-0 space-y-1">
                <div className="text-xs font-bold text-pink-200">{s.title}</div>
                <div className="text-xs leading-relaxed text-slate-300">{s.body}</div>
                <div className="font-serif text-sm text-white/90">{s.formula}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setStep((s) => (done ? 0 : s + 1))}
          className="whitespace-nowrap rounded-lg bg-pink-500/90 hover:bg-pink-500 px-3 py-1.5 font-bold text-white transition-colors cursor-pointer"
        >
          {done ? '重新推导' : `下一步 (${step + 1}/${MATH_STEPS.length})`}
        </button>
        <button
          type="button"
          onClick={onEnter}
          className="text-pink-300 hover:text-pink-200 font-bold underline cursor-pointer whitespace-nowrap"
        >
          进入数学真题研学舱 →
        </button>
      </div>
    </div>
  )
}

const AGENT_MESSAGES = [
  { from: 'user', name: '你', text: '帮我把今天错的三道操作系统题整理进笔记，并安排明天复习。' },
  { from: 'web', name: '网页 AI · 讲解', text: '三题都卡在「页面置换 + 缺页次数」：LRU 与 OPT 的淘汰对象混淆。已生成对比表和 1 道变式题。' },
  { from: 'local', name: '本地 Agent · 执行', text: '已写入 Vault：408/操作系统/错题-页面置换.md，并加入明天 09:00 的 SM-2 复习队列。' },
]

export function AgentTrialDemo({ fullscreen, onEnter }: DemoProps) {
  const [shown, setShown] = useState(1)
  const done = shown >= AGENT_MESSAGES.length

  return (
    <div
      className={`flex flex-col bg-[#0a0f1c] text-white ${
        fullscreen ? 'w-full max-w-4xl m-auto p-4 sm:p-8 gap-6' : 'h-[520px] p-5 sm:p-6 justify-between'
      }`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-violet-500/20">
          <span className={`font-bold text-violet-300 ${fullscreen ? 'text-base' : 'text-sm'}`}>
            双核 Agent · 讲解与执行协同
          </span>
          <span className="text-xs text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-lg">
            网页 AI + Claude Code / Codex
          </span>
        </div>

        <div className="space-y-2.5">
          {AGENT_MESSAGES.slice(0, shown).map((m) => (
            <div
              key={m.name}
              className={`flex animate-fade-in-up ${
                m.from === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-white text-slate-900'
                    : m.from === 'web'
                      ? 'bg-violet-500/15 border border-violet-500/25 text-slate-100'
                      : 'bg-emerald-500/10 border border-emerald-500/25 text-slate-100'
                }`}
              >
                <div
                  className={`mb-1 text-2xs font-bold ${
                    m.from === 'user' ? 'text-slate-500' : m.from === 'web' ? 'text-violet-300' : 'text-emerald-300'
                  }`}
                >
                  {m.name}
                </div>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setShown((n) => (done ? 1 : n + 1))}
          className="whitespace-nowrap rounded-lg bg-violet-500/90 hover:bg-violet-500 px-3 py-1.5 font-bold text-white transition-colors cursor-pointer"
        >
          {done ? '重新演示' : '下一条消息'}
        </button>
        <button
          type="button"
          onClick={onEnter}
          className="text-violet-300 hover:text-violet-200 font-bold underline cursor-pointer whitespace-nowrap"
        >
          进入 AI 工作台 →
        </button>
      </div>
    </div>
  )
}
