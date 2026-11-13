import React, { useState, useRef, useEffect } from 'react'
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Check,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react'
import { formatTime } from '../utils'

export interface QuizTimerControlProps {
  timeElapsed: number
  timeLimitMinutes: number
  timerMode: 'countdown' | 'elapsed'
  isPaused: boolean
  isExamMode: boolean
  onToggleMode: () => void
  onTogglePause: () => void
  onChangeTimeLimit: (minutes: number) => void
  onResetTimer?: () => void
}

const PRESET_DURATIONS = [
  { minutes: 180, label: '180 分钟', tag: '真题套卷全真推荐' },
  { minutes: 120, label: '120 分钟', tag: '标准两小时模考' },
  { minutes: 90, label: '90 分钟', tag: '半卷/综合题演练' },
  { minutes: 60, label: '60 分钟', tag: '一小时限时测验' },
  { minutes: 45, label: '45 分钟', tag: '专题攻坚推荐' },
  { minutes: 30, label: '30 分钟', tag: '单选题速刷演练' },
]

export default function QuizTimerControl({
  timeElapsed,
  timeLimitMinutes,
  timerMode,
  isPaused,
  isExamMode,
  onToggleMode,
  onTogglePause,
  onChangeTimeLimit,
  onResetTimer,
}: QuizTimerControlProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [customInput, setCustomInput] = useState(String(timeLimitMinutes || 180))
  const menuRef = useRef<HTMLDivElement>(null)

  const totalLimitSec = Math.max(1, (timeLimitMinutes || 180) * 60)
  const remainingSec = Math.max(0, totalLimitSec - timeElapsed)
  const isOvertime = timerMode === 'countdown' && timeElapsed > totalLimitSec
  const overtimeSec = isOvertime ? timeElapsed - totalLimitSec : 0

  // 倒计时阶段状态判定
  const isUrgent = timerMode === 'countdown' && remainingSec > 0 && remainingSec <= 5 * 60
  const isWarning =
    timerMode === 'countdown' &&
    remainingSec > 5 * 60 &&
    remainingSec <= 15 * 60

  // 点击外部收起弹出菜单
  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(customInput, 10)
    if (!isNaN(val) && val > 0 && val <= 360) {
      onChangeTimeLimit(val)
      setIsMenuOpen(false)
    }
  }

  // 计算动态样式
  let pillStyle = 'bg-white border-slate-200/90 text-slate-700 shadow-2xs hover:border-slate-300'
  let textStyle = 'text-slate-800'
  let labelText = timerMode === 'countdown' ? '剩余' : '已用'

  if (isOvertime) {
    pillStyle = 'bg-rose-50/90 border-rose-300 text-rose-800 shadow-xs ring-1 ring-rose-200'
    textStyle = 'text-rose-700 font-bold'
    labelText = '超时'
  } else if (isUrgent) {
    pillStyle = 'bg-rose-50/80 border-rose-300 text-rose-700 shadow-xs animate-pulse ring-1 ring-rose-200'
    textStyle = 'text-rose-700 font-bold'
  } else if (isWarning) {
    pillStyle = 'bg-amber-50/80 border-amber-300 text-amber-800 shadow-xs ring-1 ring-amber-200'
    textStyle = 'text-amber-700 font-bold'
  } else if (timerMode === 'countdown') {
    pillStyle = 'bg-indigo-50/50 border-indigo-200/80 text-indigo-900 shadow-2xs hover:border-indigo-300'
    textStyle = 'text-indigo-950 font-bold'
  }

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {/* 计时器胶囊主体 */}
      <div
        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all select-none ${pillStyle}`}
      >
        {/* 点击切换正计时/倒计时 */}
        <button
          type="button"
          onClick={onToggleMode}
          className="inline-flex items-center gap-1 font-mono tracking-tight cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          title={`当前为【${timerMode === 'countdown' ? '倒计时模式' : '正向计时模式'}】，点击一键无缝切换`}
        >
          {isOvertime ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          ) : timerMode === 'countdown' ? (
            <span className="text-2xs">⏳</span>
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          )}

          <span className="text-[11px] font-sans font-medium text-slate-500">
            {labelText}
          </span>

          <span className={`font-mono text-xs tabular-nums ${textStyle}`}>
            {isOvertime
              ? `+${formatTime(overtimeSec)}`
              : timerMode === 'countdown'
              ? formatTime(remainingSec)
              : formatTime(timeElapsed)}
          </span>
        </button>

        {/* 暂停 / 恢复 快速控制微按钮 */}
        <div className="h-3 w-px bg-slate-200/80 mx-0.5" />
        <button
          type="button"
          onClick={onTogglePause}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
          title={isPaused ? '恢复计时并继续答题' : '暂停计时（防窥遮罩）'}
          aria-label={isPaused ? '恢复答题' : '暂停计时'}
        >
          {isPaused ? (
            <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
          ) : (
            <Pause className="w-3 h-3 text-slate-600" />
          )}
        </button>

        {/* 计时器设置展开按钮 */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 active:scale-90 transition-all cursor-pointer ${
            isMenuOpen ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="设置倒计时时限与模式"
          aria-label="计时器设置"
        >
          <Settings className="w-3 h-3 text-slate-500" />
        </button>
      </div>

      {/* 计时器快捷设置浮层 (Popover) */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3.5 z-40 text-left font-sans animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>全真模拟考场计时设置</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
              {isExamMode ? '全真模考' : '自测练习'}
            </span>
          </div>

          {/* 模式快速切换 */}
          <div className="mt-3 space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-500">计时模式</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (timerMode !== 'countdown') onToggleMode()
                }}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  timerMode === 'countdown'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>⏳ 倒计时模式</span>
                {timerMode === 'countdown' && <Check className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (timerMode !== 'elapsed') onToggleMode()
                }}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  timerMode === 'elapsed'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>⏱️ 正向计时模式</span>
                {timerMode === 'elapsed' && <Check className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* 倒计时预设时限 */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>考场倒计时限时</span>
              <span className="text-slate-400 font-normal">当前：{timeLimitMinutes} 分钟</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_DURATIONS.map((preset) => {
                const isActive = timeLimitMinutes === preset.minutes
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => {
                      onChangeTimeLimit(preset.minutes)
                      if (timerMode !== 'countdown') onToggleMode()
                      setIsMenuOpen(false)
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold shadow-2xs'
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">{preset.label}</span>
                      {isActive && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-none">
                      {preset.tag}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 自定义分钟数 */}
          <form onSubmit={handleApplyCustomMinutes} className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
            <span className="text-[11px] text-slate-500 shrink-0">自定义时长:</span>
            <input
              type="number"
              min={1}
              max={360}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="分钟"
            />
            <span className="text-xs text-slate-500">分</span>
            <button
              type="submit"
              className="ml-auto px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
            >
              应用
            </button>
          </form>

          {/* 重置计时 */}
          {onResetTimer && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-2xs text-slate-400">
              <span>已答题用时：{formatTime(timeElapsed)}</span>
              <button
                type="button"
                onClick={() => {
                  onResetTimer()
                  setIsMenuOpen(false)
                }}
                className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>重置计时</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
