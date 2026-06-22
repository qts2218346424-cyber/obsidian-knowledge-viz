import { useState, useEffect, useRef, useCallback } from 'react'
import WarmCard from '../components/ui/WarmCard'
import WarmButton from '../components/ui/WarmButton'

// ── Types ──────────────────────────────────────────────────────────────────────

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
type TimerStatus = 'idle' | 'running' | 'paused'
type TimerType = 'countdown' | 'stopwatch'

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: '专注',
  shortBreak: '短休息',
  longBreak: '长休息',
}

const MODE_EMOJIS: Record<TimerMode, string> = {
  focus: '🍅',
  shortBreak: '☕',
  longBreak: '🌿',
}

const MODE_COLORS: Record<TimerMode, { stroke: string; bg: string; text: string; ring: string }> = {
  focus: { stroke: '#E8915A', bg: 'bg-accent-orange/10', text: 'text-accent-orange', ring: 'ring-accent-orange/20' },
  shortBreak: { stroke: '#87A878', bg: 'bg-accent-sage/10', text: 'text-accent-sage', ring: 'ring-accent-sage/20' },
  longBreak: { stroke: '#C4943D', bg: 'bg-accent-amber/10', text: 'text-accent-amber', ring: 'ring-accent-amber/20' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.5)
    // Second tone
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.3)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2)
    osc2.start(ctx.currentTime + 0.3)
    osc2.stop(ctx.currentTime + 2)
  } catch { /* ignore audio errors */ }
}

// ── Component ──────────────────────────────────────────────────────────────────

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
  const intervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  const totalDuration = mode === 'focus'
    ? focusDuration * 60
    : mode === 'shortBreak'
      ? shortBreakDuration * 60
      : longBreakDuration * 60

  const progress = timerType === 'stopwatch'
    ? (totalDuration > 0 ? Math.min(elapsed / totalDuration, 1) : 0)
    : (totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0)

  // ── Timer logic ────────────────────────────────────────────────────────────

  const tick = useCallback(() => {
    if (timerType === 'stopwatch') {
      setElapsed(prev => {
        const next = prev + 1
        if (mode === 'focus' && next === totalDuration) {
          playNotificationSound()
        }
        return next
      })
    } else {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playNotificationSound()
          return 0
        }
        return prev - 1
      })
    }
  }, [timerType, mode, totalDuration])

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

  // Handle timer completion
  useEffect(() => {
    if (timerType === 'stopwatch') {
      // Stopwatch: count pomodoro when elapsed reaches focus duration, then keep going
      if (elapsed > 0 && elapsed === totalDuration && status === 'running' && mode === 'focus') {
        const newCount = pomodoroCount + 1
        setPomodoroCount(newCount)
        setTotalFocusMinutes(prev => prev + focusDuration)
      }
      return
    }
    // Countdown: handle as before
    if (timeLeft === 0 && status === 'running') {
      setStatus('idle')
      if (mode === 'focus') {
        const newCount = pomodoroCount + 1
        setPomodoroCount(newCount)
        setTotalFocusMinutes(prev => prev + focusDuration)
        // Auto switch to break
        if (newCount % 4 === 0) {
          switchMode('longBreak')
        } else {
          switchMode('shortBreak')
        }
      } else {
        // Break finished, back to focus
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
  }

  const start = () => {
    if (timerType === 'countdown' && timeLeft === 0) {
      setTimeLeft(totalDuration)
    }
    startTimeRef.current = Date.now()
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

  const switchTimerType = (type: TimerType) => {
    if (status === 'running') return // Don't switch while running
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

  // ── SVG circle params ──────────────────────────────────────────────────────

  const size = 280
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)
  const colors = MODE_COLORS[mode]

  // ── Duration presets ───────────────────────────────────────────────────────

  const focusPresets = [15, 20, 25, 30, 45, 60]

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-warm-800">🍅 番茄钟</h1>
        <p className="text-sm text-warm-500 mt-1">专注学习，高效休息</p>
      </div>

      {/* Mode selector */}
      <div className="flex justify-center gap-2">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={status === 'running' || timerType === 'stopwatch'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m
                ? `${MODE_COLORS[m].bg} ${MODE_COLORS[m].text} border border-current/20`
                : 'bg-cream-100 text-warm-400 border border-cream-200 hover:bg-cream-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {MODE_EMOJIS[m]} {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer type toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-cream-100 rounded-xl p-1 border border-cream-200">
          <button
            onClick={() => switchTimerType('countdown')}
            disabled={status === 'running'}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timerType === 'countdown'
                ? 'bg-surface text-warm-800 shadow-sm'
                : 'text-warm-400 hover:text-warm-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ⏱ 倒计时
          </button>
          <button
            onClick={() => switchTimerType('stopwatch')}
            disabled={status === 'running'}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timerType === 'stopwatch'
                ? 'bg-surface text-warm-800 shadow-sm'
                : 'text-warm-400 hover:text-warm-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ⏲ 正计时
          </button>
        </div>
      </div>

      {/* Timer circle */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke="#E8D5BC"
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <button
              onClick={toggleTimer}
              className="group focus:outline-none"
            >
              <div className={`text-5xl font-bold text-warm-800 tracking-wider font-mono ${
                status === 'running' ? 'animate-pulse' : ''
              }`}>
                {timerType === 'stopwatch'
                  ? formatTime(elapsed, true)
                  : formatTime(timeLeft)
                }
              </div>
              <div className={`text-xs mt-2 ${colors.text} font-medium`}>
                {timerType === 'stopwatch'
                  ? (status === 'running' ? '点击暂停' : status === 'paused' ? '点击继续' : '点击开始')
                  : (status === 'running' ? '点击暂停' : status === 'paused' ? '点击继续' : '点击开始')
                }
              </div>
              {timerType === 'stopwatch' && status === 'running' && (
                <div className="text-[10px] text-warm-400 mt-1">已专注 {formatTime(elapsed, true)}</div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <WarmButton
          variant="secondary"
          size="sm"
          onClick={reset}
          className="flex items-center gap-1.5"
        >
          重置
        </WarmButton>
        <WarmButton
          variant="secondary"
          size="sm"
          onClick={() => setShowSettings(s => !s)}
          className="flex items-center gap-1.5"
          style={timerType === 'stopwatch' ? { opacity: 0.4, pointerEvents: 'none' } : {}}
        >
          {showSettings ? '收起设置' : '时长设置'}
        </WarmButton>
      </div>

      {/* Duration settings (collapsible) */}
      {showSettings && (
        <WarmCard className="animate-fade-in-up">
          <div className="space-y-4">
            {/* Focus duration */}
            <div>
              <div className="text-xs text-warm-500 font-medium mb-2">
                🍅 专注时长（当前 {focusDuration} 分钟）
              </div>
              <div className="flex flex-wrap gap-2">
                {focusPresets.map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setFocusDuration(m)
                      if (mode === 'focus' && status === 'idle') setTimeLeft(m * 60)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      focusDuration === m
                        ? 'bg-accent-orange text-white'
                        : 'bg-cream-200 text-warm-600 hover:bg-cream-300'
                    }`}
                  >
                    {m} 分钟
                  </button>
                ))}
              </div>
            </div>

            {/* Break durations */}
            <div>
              <div className="text-xs text-warm-500 font-medium mb-2">
                ☕ 休息时间
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-warm-400 mb-1">短休息</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[3, 5, 10].map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setShortBreakDuration(m)
                          if (mode === 'shortBreak' && status === 'idle') setTimeLeft(m * 60)
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                          shortBreakDuration === m
                            ? 'bg-accent-sage text-white'
                            : 'bg-cream-200 text-warm-600 hover:bg-cream-300'
                        }`}
                      >
                        {m}分
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-warm-400 mb-1">长休息（每4个番茄后）</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[10, 15, 20, 30].map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setLongBreakDuration(m)
                          if (mode === 'longBreak' && status === 'idle') setTimeLeft(m * 60)
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                          longBreakDuration === m
                            ? 'bg-accent-amber text-white'
                            : 'bg-cream-200 text-warm-600 hover:bg-cream-300'
                        }`}
                      >
                        {m}分
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WarmCard>
      )}

      {/* Today's stats */}
      <WarmCard>
        <div className="text-center space-y-3">
          <div className="text-xs text-warm-500 font-medium uppercase tracking-wider">今日专注</div>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-3xl font-bold text-accent-orange">{pomodoroCount}</div>
              <div className="text-[10px] text-warm-400 mt-0.5">番茄完成</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-sage">{totalFocusMinutes}</div>
              <div className="text-[10px] text-warm-400 mt-0.5">专注分钟</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warm-800">
                {pomodoroCount >= 4 ? Math.floor(pomodoroCount / 4) : 0}
              </div>
              <div className="text-[10px] text-warm-400 mt-0.5">轮次完成</div>
            </div>
          </div>

          {/* Tomato indicators */}
          {pomodoroCount > 0 && (
            <div className="flex justify-center gap-1 pt-1">
              {Array.from({ length: Math.min(pomodoroCount, 20) }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg transition-transform ${i % 4 === 3 ? 'mr-2' : ''}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  🍅
                </span>
              ))}
            </div>
          )}
        </div>
      </WarmCard>

      {/* Tips */}
      <WarmCard className="bg-accent-sage/5 border-accent-sage/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="text-sm font-medium text-warm-700 mb-1">番茄工作法</h3>
            <p className="text-xs text-warm-500 leading-relaxed">
              每个番茄钟 25 分钟专注 + 5 分钟休息，每完成 4 个番茄后休息 15 分钟。
              保持节奏比延长时间更重要。
            </p>
          </div>
        </div>
      </WarmCard>
    </div>
  )
}
