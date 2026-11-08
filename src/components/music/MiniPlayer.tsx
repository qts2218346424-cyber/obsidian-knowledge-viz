import { useState } from 'react'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useAudioContext } from '../../contexts/AudioContext'

export default function MiniPlayer() {
  const {
    state,
    togglePlay,
    next,
    prev,
    setVolume,
    seek,
    toggleShuffle,
    cycleRepeat,
    setQueue,
    stop,
  } = useAudioContext()
  const [expanded, setExpanded] = useState(false)
  const {
    currentTrack,
    isPlaying,
    status,
    error,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    queue,
    queueIndex,
  } = state

  if (!currentTrack) return null

  const formatTime = (seconds: number) => {
    if (!seconds || !Number.isFinite(seconds)) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remaining = Math.floor(seconds % 60)
    return `${minutes}:${remaining.toString().padStart(2, '0')}`
  }

  const isLive = currentTrack.type === 'radio'
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0
  const repeatIcon = repeat === 'one'
    ? <Repeat1 className="h-3.5 w-3.5" />
    : <Repeat className="h-3.5 w-3.5" />

  return (
    <div className="fixed bottom-[calc(3.95rem+env(safe-area-inset-bottom,0px))] xl:bottom-0 left-2 right-2 xl:left-0 xl:right-0 z-35 rounded-2xl xl:rounded-none overflow-hidden shadow-xl xl:shadow-none border border-slate-200/90 xl:border-x-0 xl:border-b-0 bg-white/95 backdrop-blur-xl transition-all duration-300">
      {/* Progress Track */}
      <div
        className={`group h-1 bg-slate-200/80 ${isLive ? '' : 'cursor-pointer'}`}
        onClick={(event) => {
          if (isLive || duration <= 0) return
          const rect = event.currentTarget.getBoundingClientRect()
          const position = (event.clientX - rect.left) / rect.width
          seek(position * duration)
        }}
      >
        <div
          className="relative h-full bg-indigo-600 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        >
          {!isLive && (
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>

      {/* Control Row */}
      <div className="flex h-13 sm:h-15 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 sm:w-56 sm:flex-initial min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80 cursor-pointer"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
            <span className="text-base sm:text-lg">{isLive ? '📻' : '🎵'}</span>
          </div>
          <div className="min-w-0 text-left flex-1">
            <div className="truncate text-xs font-bold text-slate-800">{currentTrack.title}</div>
            <div className={`truncate text-[10px] ${status === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>
              {status === 'loading'
                ? '正在连接音频流…'
                : status === 'error'
                  ? '播放失败，点击重试'
                  : currentTrack.artist || '专注声景'}
            </div>
          </div>
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            : <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
        </button>

        <div className="flex items-center justify-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={toggleShuffle}
            className={`hidden sm:inline-flex rounded-lg p-1.5 transition-colors cursor-pointer ${
              shuffle
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="随机播放"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={prev}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:text-slate-800 active:scale-95 cursor-pointer"
            title="上一首"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-all hover:bg-indigo-600 active:scale-95 cursor-pointer"
            title={isPlaying ? '暂停' : status === 'error' ? '重新连接' : '播放'}
          >
            {status === 'loading'
              ? <LoaderCircle className="h-4 w-4 animate-spin" />
              : isPlaying
                ? <Pause className="h-4 w-4" />
                : <Play className="ml-0.5 h-4 w-4" />}
          </button>
          <button
            onClick={next}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:text-slate-800 active:scale-95 cursor-pointer"
            title="下一首"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`hidden sm:inline-flex rounded-lg p-1.5 transition-colors cursor-pointer ${
              repeat !== 'none'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="循环模式"
          >
            {repeatIcon}
          </button>
        </div>

        {/* 右侧：电脑端音量控制 + 全平台常驻一键退出关闭按钮 */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-3">
            {status === 'error' ? (
              <span
                title={error || undefined}
                className="flex min-w-0 items-center gap-1 truncate text-[10px] text-rose-500"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span className="truncate">{error || '播放失败'}</span>
              </span>
            ) : (
              <span className="font-mono text-[10px] text-slate-400">
                {isLive ? '实时电台' : `${formatTime(progress)} / ${formatTime(duration)}`}
              </span>
            )}
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="p-1 text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
              title={volume === 0 ? '恢复音量' : '静音'}
            >
              {volume === 0
                ? <VolumeX className="h-3.5 w-3.5" />
                : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={event => setVolume(Number(event.target.value))}
              className="h-1 w-20 cursor-pointer accent-indigo-600"
              aria-label="音量"
            />
          </div>

          {/* 关闭/退出播放器悬浮条按钮 (大热区、防误触、支持手机与桌面端) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              stop()
            }}
            className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 active:scale-90 transition-all cursor-pointer shrink-0"
            title="关闭播放器并退出电台"
            aria-label="退出电台播放"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Queue */}
      {expanded && queue.length > 0 && (
        <div className="max-h-44 overflow-auto modal-scroll-contain border-t border-slate-100 bg-white px-3 sm:px-4 py-2">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>当前播放队列（{queue.length}）</span>
            <span className="md:hidden font-mono">{isLive ? '实时电台' : `${formatTime(progress)} / ${formatTime(duration)}`}</span>
          </div>
          {queue.map((track, index) => (
            <button
              type="button"
              key={track.id}
              onClick={() => setQueue(queue, index)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                index === queueIndex
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-5 text-right text-slate-400 font-mono text-[11px]">{index + 1}</span>
              <span className="flex-1 truncate">{track.title}</span>
              <span className="text-[11px]">{track.type === 'radio' ? '📻' : '🎵'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
