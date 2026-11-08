import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  Clock,
  Flame,
  Coffee,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Types ───────────────────────────────────────────────────────────────────

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
type TimerStatus = 'idle' | 'running' | 'paused'
type TimerType = 'countdown' | 'stopwatch'

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: '专注推演',
  shortBreak: '短休息',
  longBreak: '长休整',
}

function formatTime(seconds: number, showHours = false): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (showHours && h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587, ctx.currentTime)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.2)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.25)
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.25)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.8)
    osc2.start(ctx.currentTime + 0.25)
    osc2.stop(ctx.currentTime + 1.8)
  } catch {}
}

export default function Pomodoro() {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus)
  const [focusDuration, setFocusDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [timerType, setTimerType] = useState<TimerType>('countdown')
  const [elapsed, setElapsed] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [subjectFocus, setSubjectFocus] = useState<'408' | 'math' | 'politics' | 'english'>('408')
  const intervalRef = useRef<number | null>(null)

  const totalDuration = mode === 'focus'
    ? focusDuration * 60
    : mode === 'shortBreak'
      ? shortBreakDuration * 60
      : longBreakDuration * 60

  const progress = timerType === 'stopwatch'
    ? (totalDuration > 0 ? Math.min(elapsed / totalDuration, 1) : 0)
    : (totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0)

  const tick = useCallback(() => {
    if (timerType === 'stopwatch') {
      setElapsed(prev => {
        const next = prev + 1
        if (mode === 'focus' && next === totalDuration && soundEnabled) {
          playNotificationSound()
        }
        return next
      })
    } else {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (soundEnabled) playNotificationSound()
          return 0
        }
        return prev - 1
      })
    }
  }, [timerType, mode, totalDuration, soundEnabled])

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = window.setInterval(tick, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [status, tick])

  useEffect(() => {
    if (timerType === 'stopwatch') {
      if (elapsed > 0 && elapsed === totalDuration && status === 'running' && mode === 'focus') {
        const newCount = pomodoroCount + 1
        setPomodoroCount(newCount)
        setTotalFocusMinutes(prev => prev + focusDuration)
      }
      return
    }
    if (timeLeft === 0 && status === 'running') {
      setStatus('idle')
      if (mode === 'focus') {
        const newCount = pomodoroCount + 1
        setPomodoroCount(newCount)
        setTotalFocusMinutes(prev => prev + focusDuration)
        if (newCount % 4 === 0) {
          switchMode('longBreak')
        } else {
          switchMode('shortBreak')
        }
      } else {
        switchMode('focus')
      }
    }
  }, [timeLeft, elapsed, status, mode, pomodoroCount, focusDuration, timerType, totalDuration])

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setStatus('idle')
    const dur = newMode === 'focus'
      ? focusDuration * 60
      : newMode === 'shortBreak'
        ? shortBreakDuration * 60
        : longBreakDuration * 60
    setTimeLeft(dur)
    setElapsed(0)
  }

  const start = () => {
    if (timerType === 'countdown' && timeLeft === 0) {
      setTimeLeft(totalDuration)
    }
    setStatus('running')
  }

  const pause = () => setStatus('paused')

  const reset = () => {
    setStatus('idle')
    if (timerType === 'stopwatch') {
      setElapsed(0)
    } else {
      setTimeLeft(totalDuration)
    }
  }

  const addFiveMinutes = () => {
    if (timerType === 'countdown') {
      setTimeLeft(prev => prev + 300)
    }
  }

  const switchTimerType = (type: TimerType) => {
    if (status === 'running') return
    setTimerType(type)
    if (type === 'stopwatch') {
      setElapsed(0)
      setStatus('idle')
    } else {
      setTimeLeft(totalDuration)
      setStatus('idle')
    }
  }

  const toggleTimer = () => {
    if (status === 'running') pause()
    else start()
  }

  // 表盘参数
  const size = 260
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-12">
      {/* 顶部双轨角落胶囊顶栏 (Subframe Screen 3 Corner Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-800">心流推演舱就绪</span>
            <span className="text-neutral-300">|</span>
            <span className="text-[11px] text-neutral-500 font-mono">精密硬件时钟 2.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 倒计时/正计时胶囊 */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-200/80 border border-neutral-300/60 text-xs font-medium">
            <button
              onClick={() => switchTimerType('countdown')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                timerType === 'countdown'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              ⏱ 倒计时
            </button>
            <button
              onClick={() => switchTimerType('stopwatch')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                timerType === 'stopwatch'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              ⏲ 正计时
            </button>
          </div>

          {/* 音效开关 */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-neutral-400" />}
          </button>
        </div>
      </div>

      {/* 主体双栏区域：左侧 3D 金属硬件表盘，右侧考点专注参数检查器 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：Subframe Screen 1 工业级 3D 金属镀铬外框硬件核心 */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#f4f4f6] rounded-[28px] p-2 sm:p-3 border border-neutral-300/80 shadow-[0_16px_40px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)]">
            {/* 3D 金属拨档外框 (Metallic Housing) */}
            <div className="metallic-housing w-full mb-3">
              <div className="metallic-bezel flex items-center justify-between gap-1">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    disabled={status === 'running'}
                    className={`flex-1 py-2 sm:py-2.5 px-3 rounded-[12px] text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                      mode === m
                        ? 'metal-tab-active font-semibold'
                        : 'metal-tab-inactive hover:text-neutral-200'
                    }`}
                  >
                    <span>
                      {m === 'focus' ? '🎯' : m === 'shortBreak' ? '☕' : '🌿'}
                    </span>
                    <span>{MODE_LABELS[m]}</span>
                    <span className="hidden sm:inline text-[10px] opacity-70">
                      ({m === 'focus' ? focusDuration : m === 'shortBreak' ? shortBreakDuration : longBreakDuration}m)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 硬件底座内胆：纯白圆角磨砂面板 */}
            <div className="bg-white rounded-[22px] border border-black/[0.06] p-6 sm:p-8 flex flex-col items-center shadow-xs">
              {/* 表盘上部：当前学科指示灯 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
                  {subjectFocus === '408' ? '408 计算机基础' : subjectFocus === 'math' ? '考研数学高数线代' : subjectFocus === 'politics' ? '政治史纲马原' : '考研英语长难句'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 font-mono">
                  {status === 'running' ? '推演中' : status === 'paused' ? '暂停' : '待命'}
                </span>
              </div>

              {/* 中央精密圆形刻度表盘 */}
              <div className="relative my-2" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                  {/* 底层微细刻度环 */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f0f0f2"
                    strokeWidth={strokeWidth}
                  />
                  {/* 刻度进度条 */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={mode === 'focus' ? '#18181b' : mode === 'shortBreak' ? '#10b981' : '#6366f1'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* 居中数字与状态 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <div
                    onClick={toggleTimer}
                    className="cursor-pointer group flex flex-col items-center"
                  >
                    <div className={`text-6xl font-bold font-mono tracking-tight text-neutral-900 ${
                      status === 'running' ? 'scale-[1.02] transition-transform duration-500' : ''
                    }`}>
                      {timerType === 'stopwatch'
                        ? formatTime(elapsed, true)
                        : formatTime(timeLeft)
                      }
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-900 transition-colors">
                      {status === 'running' ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          <span>点击暂停</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span>{status === 'paused' ? '继续推演' : '开启专注'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部实体机械按键排 */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 w-full max-w-sm">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="flex-1 py-2.5 px-4 rounded-[10px] bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {status === 'running' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>暂停</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>{status === 'paused' ? '继续' : '开始专注'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="py-2.5 px-3.5 rounded-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] text-neutral-700 text-xs font-medium transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  title="重置当前时钟"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>重置</span>
                </button>

                <button
                  type="button"
                  onClick={addFiveMinutes}
                  className="py-2.5 px-3.5 rounded-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 active:scale-[0.98] text-neutral-700 text-xs font-medium transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  title="延长 5 分钟"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+5m</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`py-2.5 px-3 rounded-[10px] border text-xs font-medium transition-all cursor-pointer shadow-xs ${
                    showSettings
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-900'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                  }`}
                  title="设置时长"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 展开时长调节配置 */}
              {showSettings && (
                <div className="w-full mt-5 pt-4 border-t border-neutral-200/80 animate-fade-in-up">
                  <div className="text-[11px] font-semibold text-neutral-500 mb-2 uppercase tracking-wider">
                    专注推演预设时长
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[15, 20, 25, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => {
                          setFocusDuration(mins)
                          if (mode === 'focus') setTimeLeft(mins * 60)
                        }}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          focusDuration === mins
                            ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：Subframe Screen 2 紧凑考点专注审计检查器 (Inspector Panel) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 专注学科绑定卡片 */}
          <div className="bg-white rounded-[16px] border border-black/[0.08] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
                <span>学科绑定推演</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">POMODORO SYNC</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSubjectFocus('408')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  subjectFocus === '408'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50/60 border-neutral-200 text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="font-semibold">408 计算机学科</div>
                <div className="text-[10px] opacity-75 mt-0.5">计组 · OS · 计网 · 数据结构</div>
              </button>

              <button
                type="button"
                onClick={() => setSubjectFocus('math')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  subjectFocus === 'math'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50/60 border-neutral-200 text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="font-semibold">考研数学</div>
                <div className="text-[10px] opacity-75 mt-0.5">微积分 · 线性代数 · 概率论</div>
              </button>

              <button
                type="button"
                onClick={() => setSubjectFocus('english')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  subjectFocus === 'english'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50/60 border-neutral-200 text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="font-semibold">考研英语</div>
                <div className="text-[10px] opacity-75 mt-0.5">2000+ 真题核心词汇复盘</div>
              </button>

              <button
                type="button"
                onClick={() => setSubjectFocus('politics')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  subjectFocus === 'politics'
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-50/60 border-neutral-200 text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="font-semibold">政治史纲</div>
                <div className="text-[10px] opacity-75 mt-0.5">1840-2026 全景时间轴</div>
              </button>
            </div>
          </div>

          {/* 专注战报指标审计小卡 (Inspector Metrics) */}
          <div className="bg-white rounded-[16px] border border-black/[0.08] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>今日研学心流审计</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                实时同步
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80">
                <div className="text-[11px] text-neutral-500">今日完成番茄</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1 flex items-baseline gap-1">
                  <span>{pomodoroCount}</span>
                  <span className="text-xs font-normal text-neutral-500">个</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80">
                <div className="text-[11px] text-neutral-500">深度推演时长</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-1 flex items-baseline gap-1">
                  <span>{totalFocusMinutes}</span>
                  <span className="text-xs font-normal text-neutral-500">分钟</span>
                </div>
              </div>
            </div>

            {/* 联动跳转行动条 */}
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>完成推演后？</span>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:underline cursor-pointer"
              >
                <span>进入真题测验巩固</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 声学白噪音伴学舱快捷卡片 */}
          <div className="bg-[#fafafa] rounded-[16px] border border-neutral-200/80 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                🎵
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-800">声学心流白噪音</div>
                <div className="text-[10px] text-neutral-500">双耳节拍 · 雨声与咖啡馆环境音</div>
              </div>
            </div>
            <Link
              to="/music"
              className="py-1.5 px-3 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-medium shadow-2xs transition-colors"
            >
              启动播放
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
