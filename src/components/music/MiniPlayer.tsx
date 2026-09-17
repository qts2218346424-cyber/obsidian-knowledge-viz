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
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
      expanded ? 'h-64' : 'h-16'
    }`}>
      <div
        className={`group h-1 bg-cream-200 ${isLive ? '' : 'cursor-pointer'}`}
        onClick={(event) => {
          if (isLive || duration <= 0) return
          const rect = event.currentTarget.getBoundingClientRect()
          const position = (event.clientX - rect.left) / rect.width
          seek(position * duration)
        }}
      >
        <div
          className="relative h-full bg-accent-orange transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        >
          {!isLive && (
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent-orange opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>

      <div className="flex h-15 items-center gap-4 border-t border-cream-200 bg-surface px-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-48 min-w-0 shrink-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-orange/30 to-accent-peach/30">
            <span className="text-lg">{isLive ? '📻' : '🎵'}</span>
          </div>
          <div className="min-w-0 text-left">
            <div className="truncate text-xs font-medium text-warm-700">{currentTrack.title}</div>
            <div className={`truncate text-[10px] ${status === 'error' ? 'text-accent-rose' : 'text-warm-400'}`}>
              {status === 'loading'
                ? '正在连接…'
                : status === 'error'
                  ? '播放失败'
                  : currentTrack.artist || '未知'}
            </div>
          </div>
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-warm-400" />
            : <ChevronUp className="h-3.5 w-3.5 shrink-0 text-warm-400" />}
        </button>

        <div className="flex flex-1 items-center justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`rounded-lg p-1.5 transition-colors ${
              shuffle
                ? 'bg-accent-orange/10 text-accent-orange'
                : 'text-warm-400 hover:text-warm-600'
            }`}
            title="随机播放"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={prev}
            className="rounded-lg p-1.5 text-warm-500 transition-colors hover:text-warm-700"
            title="上一个"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-orange text-white shadow-sm transition-colors hover:bg-accent-peach"
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
            className="rounded-lg p-1.5 text-warm-500 transition-colors hover:text-warm-700"
            title="下一个"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`rounded-lg p-1.5 transition-colors ${
              repeat !== 'none'
                ? 'bg-accent-orange/10 text-accent-orange'
                : 'text-warm-400 hover:text-warm-600'
            }`}
            title="循环模式"
          >
            {repeatIcon}
          </button>
        </div>

        <div className="flex w-48 shrink-0 items-center justify-end gap-3">
          {status === 'error' ? (
            <span
              title={error || undefined}
              className="flex min-w-0 items-center gap-1 truncate text-[10px] text-accent-rose"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="truncate">{error || '播放失败'}</span>
            </span>
          ) : (
            <span className="font-mono text-[10px] text-warm-400">
              {isLive ? '直播' : `${formatTime(progress)} / ${formatTime(duration)}`}
            </span>
          )}
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            className="p-1 text-warm-400 transition-colors hover:text-warm-600"
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
            className="h-1 w-20 cursor-pointer accent-accent-orange"
            aria-label="音量"
          />
        </div>
      </div>

      {expanded && queue.length > 0 && (
        <div className="max-h-44 overflow-auto border-t border-cream-200 bg-surface px-4 py-2">
          <div className="mb-2 text-[10px] font-medium text-warm-400">播放列表</div>
          {queue.map((track, index) => (
            <button
              type="button"
              key={track.id}
              onClick={() => setQueue(queue, index)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                index === queueIndex
                  ? 'bg-accent-orange/10 font-medium text-accent-orange'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <span className="w-5 text-right text-warm-400">{index + 1}</span>
              <span className="flex-1 truncate">{track.title}</span>
              <span className="text-[10px] text-warm-400">{track.type === 'radio' ? '📻' : '🎵'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
