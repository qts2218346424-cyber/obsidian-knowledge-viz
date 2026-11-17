import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Home,
  ClipboardCheck,
  BookOpen,
  Timer,
  Flame,
  CheckCircle2,
  Sparkles,
  RotateCw,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { useExamCountdown } from '../../utils/examDate'
import { updateTrialBridgeState } from '../../utils/trialStateBridge'

interface MobilePreviewModalProps {
  open: boolean
  isAuthenticated: boolean
  onClose: () => void
  onOpenRegister: (hint?: string) => void
  onEnterWorkspace: () => void
}

type MobileTab = 'home' | 'quiz' | 'vocab' | 'focus'

const MOBILE_QUIZ_ITEMS = [
  {
    id: 'm-os-pv',
    subject: '408 操作系统 · 2023 真题精炼',
    stem: '系统中有 3 个并发进程共享 4 个同类临界资源，若每个进程最多申请 2 个该类资源，该系统是否会发生死锁？',
    options: [
      { key: 'A' as const, text: '一定会发生死锁' },
      { key: 'B' as const, text: '绝对不会发生死锁' },
      { key: 'C' as const, text: '仅在同时申请时死锁' },
      { key: 'D' as const, text: '取决于进程调度算法' },
    ],
    correct: 'B' as const,
    analysis:
      '由抽屉原理（死锁避免不等式）：3 个进程若每个先分得 (2 − 1) = 1 个资源，共占用 3 个资源；此时剩余的第 4 个资源无论分给谁，都能使其凑齐 2 个资源顺利执行完毕并释放，故绝对不会死锁！',
  },
  {
    id: 'm-pol-1935',
    subject: '考研政治 · 史纲高频辨析',
    stem: '中国共产党在长征途中召开的「遵义会议」集中解决了当时具有决定意义的什么问题？',
    options: [
      { key: 'A' as const, text: '思想路线与党的作风问题' },
      { key: 'B' as const, text: '抗日民族统一战线策略问题' },
      { key: 'C' as const, text: '军事问题和组织问题' },
      { key: 'D' as const, text: '工农武装割据理论问题' },
    ],
    correct: 'C' as const,
    analysis:
      '核心必背：遵义会议集中解决「军事问题和组织问题」；政治路线（抗日民族统一战线）在瓦窑堡会议解决；思想路线在延安整风运动中解决。',
  },
]

const MOBILE_VOCAB_ITEMS = [
  {
    word: 'intricate',
    phonetic: '/ˈɪntrɪkət/',
    meaning: 'adj. 错综复杂的；精细难懂的',
    sentence: 'The brain is an intricate network of neurons that adapts continuously.',
    translation: '大脑是一个不断适应变化的错综复杂的神经元网络。（英语一阅读真题同源句）',
    root: 'in(向内) + tric(缠绕/琐事) + ate → 内部交织缠绕的 → 错综复杂的',
  },
  {
    word: 'underscore',
    phonetic: '/ˌʌndəˈskɔːr/',
    meaning: 'v. 强调，突显；在…下面划线',
    sentence: 'Recent empirical findings underscore the necessity of spaced repetition.',
    translation: '近期实证研究突显了间隔重复记忆的必要性。（大作文高分替换 emphasize）',
    root: 'under(在下面) + score(划线) → 在重点文字下划线 → 强调、突显',
  },
  {
    word: 'compromise',
    phonetic: '/ˈkɒmprəmaɪz/',
    meaning: 'n./v. 妥协；【熟词僻义】危及，损害',
    sentence: 'Lack of sleep will severely compromise your cognitive performance.',
    translation: '睡眠不足会严重损害你的认知表现。（完型与阅读极高频熟词僻义！）',
    root: 'com(共同) + promise(承诺) → 双方共同让步承诺；引申为因让步而损害原则/健康',
  },
]

export function MobilePreviewModal({
  open,
  isAuthenticated,
  onClose,
  onOpenRegister,
  onEnterWorkspace,
}: MobilePreviewModalProps) {
  const countdown = useExamCountdown()
  const [tab, setTab] = useState<MobileTab>('home')

  // 单手刷题状态
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<'A' | 'B' | 'C' | 'D' | null>(null)

  // 拇指背词状态
  const [vIdx, setVIdx] = useState(0)
  const [showMeaning, setShowMeaning] = useState(false)

  // 番茄钟预览状态
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [ambientTag, setAmbientTag] = useState<'rain' | 'library' | 'forest'>('rain')

  useEffect(() => {
    if (!open) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!running || !open) return
    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(t)
  }, [running, open])

  if (!open) return null

  const currentQ = MOBILE_QUIZ_ITEMS[qIdx]
  const currentV = MOBILE_VOCAB_ITEMS[vIdx]
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  const handlePickOption = (key: 'A' | 'B' | 'C' | 'D') => {
    setPicked(key)
    if (key !== currentQ.correct) {
      updateTrialBridgeState((prev) => ({
        flashcardRatedItems: [
          ...prev.flashcardRatedItems.filter((x) => x.question !== currentQ.stem),
          {
            subject: currentQ.subject,
            question: currentQ.stem,
            answer: `正确答案 ${currentQ.correct}。${currentQ.analysis}`,
            rating: `生疏（误选 ${key}）`,
          },
        ],
      }))
    }
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-[125] bg-black/70 backdrop-blur-md flex items-center justify-center sm:p-4 overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="免登录移动端伴学界面预览"
    >
      {/* 手机端占满全屏，桌面端呈现高仿真手机壳交互视窗 */}
      <div className="relative w-full h-dvh sm:w-[408px] sm:h-[min(86dvh,780px)] sm:rounded-[38px] bg-[#f7f8fa] sm:border-[6px] sm:border-slate-900 shadow-[0_32px_80px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden text-slate-900">
        {/* 顶部免登录预览提示状态栏 */}
        <div className="px-4 pt-[max(0.65rem,env(safe-area-inset-top,0px))] pb-2.5 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>免登录手机版预览</span>
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate">随身刷题与背卡实景</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭手机版预览"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 主体可滚动交互视图 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3.5">
          {tab === 'home' && (
            <>
              {/* 冲刺倒计时头卡 */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{countdown.targetLabel}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-amber-300 font-bold text-2xs">
                    手机自适应视图
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xs text-slate-300">距初试开考剩余</div>
                    <div className="text-3xl font-extrabold tracking-tight tabular-nums mt-0.5">
                      {countdown.days} <span className="text-xs font-normal text-slate-300">天</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xs text-emerald-300 font-bold">今日待抗遗忘</div>
                    <div className="text-lg font-extrabold">18 张闪卡</div>
                  </div>
                </div>
              </div>

              {/* 快捷体验入口 */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTab('quiz')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-left space-y-1.5 shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">单手秒刷真题</div>
                  <div className="text-[11px] text-slate-500">点选即判分 · 错因秒收</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('vocab')}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-left space-y-1.5 shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">拇指翻转背词</div>
                  <div className="text-[11px] text-slate-500">熟词僻义 · 真题原句</div>
                </button>
              </div>

              {/* 模拟打卡热力格 */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>随身碎片化研学热力示范</span>
                  </span>
                  <span className="text-2xs text-emerald-600 font-bold">电脑与手机实时同步</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {[2, 3, 1, 4, 3, 4, 2, 3, 4, 4, 2, 3, 4, 4].map((lv, i) => (
                    <div
                      key={i}
                      className={`h-6 rounded-md ${
                        lv === 4
                          ? 'bg-emerald-500'
                          : lv === 3
                          ? 'bg-emerald-400/80'
                          : lv === 2
                          ? 'bg-emerald-300/70'
                          : 'bg-emerald-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  排队打饭、地铁通勤与睡前 15 分钟刷过的每一道题，回到书桌打开电脑自动同步在你的个人错题本中。
                </p>
              </div>
            </>
          )}

          {tab === 'quiz' && (
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/70">
                  {currentQ.subject}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQIdx((i) => (i + 1) % MOBILE_QUIZ_ITEMS.length)
                    setPicked(null)
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  切换下一题 ({qIdx + 1}/{MOBILE_QUIZ_ITEMS.length})
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-sm font-bold text-slate-900 leading-relaxed">
                {currentQ.stem}
              </div>

              <div className="space-y-2">
                {currentQ.options.map((opt) => {
                  const isSelected = picked === opt.key
                  const isRight = opt.key === currentQ.correct
                  let cls = 'bg-white border-slate-200 text-slate-800'
                  if (picked) {
                    if (isRight) cls = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    else if (isSelected) cls = 'bg-rose-50 border-rose-400 text-rose-900'
                  }
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handlePickOption(opt.key)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              {picked && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1.5 animate-fade-in-up">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {picked === currentQ.correct
                        ? '回答正确！单手秒杀核心考点'
                        : `错因已暂存（标准答案：${currentQ.correct}），注册后自动归入错题本`}
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11.5px]">{currentQ.analysis}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'vocab' && (
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">考研英语核心熟词僻义卡</span>
                <span className="font-mono">
                  {vIdx + 1} / {MOBILE_VOCAB_ITEMS.length}
                </span>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowMeaning((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setShowMeaning((v) => !v)
                  }
                }}
                className="min-h-[230px] p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between cursor-pointer select-none"
              >
                <div className="flex items-center justify-between text-2xs text-slate-400">
                  <span>大纲高频核心词</span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                    <RotateCw className="w-3 h-3" />
                    <span>点击卡片显隐释义</span>
                  </span>
                </div>

                <div className="my-3 text-center space-y-1">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {currentV.word}
                  </div>
                  <div className="text-xs font-mono text-slate-400">{currentV.phonetic}</div>
                </div>

                {showMeaning ? (
                  <div className="space-y-2 pt-3 border-t border-slate-100 animate-fade-in-up">
                    <div className="text-xs font-bold text-emerald-700">{currentV.meaning}</div>
                    <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
                      词根拆解：{currentV.root}
                    </div>
                    <p className="text-[11px] text-slate-600 italic">{currentV.sentence}</p>
                    <p className="text-[11px] text-slate-500">{currentV.translation}</p>
                  </div>
                ) : (
                  <p className="text-xs text-center text-slate-500 italic">“{currentV.sentence}”</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMeaning((v) => !v)}
                  className="py-3 rounded-xl bg-slate-200/80 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  {showMeaning ? '收起中文释义' : '查看释义与词根'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVIdx((i) => (i + 1) % MOBILE_VOCAB_ITEMS.length)
                    setShowMeaning(false)
                  }}
                  className="py-3 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  下一个核心词 →
                </button>
              </div>
            </div>
          )}

          {tab === 'focus' && (
            <div className="space-y-3.5 text-center">
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white space-y-4">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-2xs font-bold text-indigo-200">
                  沉浸番茄自习舱 · 手机锁屏伴学
                </span>
                <div className="text-5xl font-mono font-extrabold tracking-wider tabular-nums">
                  {mm}:{ss}
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRunning((r) => !r)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{running ? '暂停专注' : '体验计时'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRunning(false)
                      setSecondsLeft(25 * 60)
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-left space-y-2">
                <div className="text-xs font-bold text-slate-800">自习环境白噪音预设</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'rain' as const, label: '深夜细雨' },
                    { id: 'library' as const, label: '静谧书馆' },
                    { id: 'forest' as const, label: '山林松涛' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAmbientTag(item.id)}
                      className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        ambientTag === item.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部明确边界的注册/进入完整空间转化条 */}
        <div className="px-3.5 py-2.5 bg-indigo-50/95 border-t border-indigo-200/80 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-medium text-indigo-950 truncate">
            {isAuthenticated ? '您已登录正式账号' : '注册账号即可永久同步手机刷题记录'}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose()
              if (isAuthenticated) {
                onEnterWorkspace()
              } else {
                onOpenRegister('注册或登录后即可进入完整手机网页版并同步所有进度')
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isAuthenticated ? '进入正式版' : '免费注册开启'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 仿真手机底部四栏 Tab 导航（适配安全区） */}
        <nav
          aria-label="手机端预览底部导航"
          className="grid grid-cols-4 bg-white border-t border-slate-200 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shrink-0"
        >
          {[
            { id: 'home' as const, label: '概览', icon: Home },
            { id: 'quiz' as const, label: '刷题', icon: ClipboardCheck },
            { id: 'vocab' as const, label: '背词', icon: BookOpen },
            { id: 'focus' as const, label: '专注', icon: Timer },
          ].map((nav) => {
            const Icon = nav.icon
            const active = tab === nav.id
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setTab(nav.id)}
                className={`py-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
                  active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{nav.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>,
    document.body
  )
}
