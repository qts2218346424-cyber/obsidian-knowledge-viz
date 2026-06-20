import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, ChevronDown, ChevronUp } from 'lucide-react'
import { useAudioContext } from '../../contexts/AudioContext'

export default function MiniPlayer() {
  const { state, togglePlay, next, prev, setVolume, seek, toggleShuffle, cycleRepeat, setQueue } = useAudioContext()
  const [expanded, setExpanded] = useState(false)
  const { currentTrack, isPlaying, volume, progress, duration, shuffle, repeat, queue, queueIndex } = state

  if (!currentTrack) return null

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  const repeatIcon = repeat === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
      expanded ? 'h-64' : 'h-16'
    }`}>
      {/* Progress bar on top */}
      <div
        className="h-1 bg-cream-200 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width
          seek(x * duration)
        }}
      >
        <div
          className="h-full bg-accent-orange transition-all duration-150 relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent-orange opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Main bar */}
      <div className="h-15 bg-surface border-t border-cream-200 flex items-center px-4 gap-4">
        {/* Track info */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 min-w-0 w-48 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange/30 to-accent-peach/30 flex items-center justify-center shrink-0">
            <span className="text-lg">
              {currentTrack.type === 'ambient' ? '🎵' : '🎶'}
            </span>
          </div>
          <div className="min-w-0 text-left">
            <div className="text-xs font-medium text-warm-700 truncate">{currentTrack.title}</div>
            <div className="text-[10px] text-warm-400 truncate">{currentTrack.artist || '未知'}</div>
          </div>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-warm-400 shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 text-warm-400 shrink-0" />}
        </button>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition-colors ${shuffle ? 'text-accent-orange bg-accent-orange/10' : 'text-warm-400 hover:text-warm-600'}`}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button onClick={prev} className="p-1.5 rounded-lg text-warm-500 hover:text-warm-700 transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-accent-orange text-white flex items-center justify-center hover:bg-accent-peach transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={next} className="p-1.5 rounded-lg text-warm-500 hover:text-warm-700 transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-lg transition-colors ${repeat !== 'none' ? 'text-accent-orange bg-accent-orange/10' : 'text-warm-400 hover:text-warm-600'}`}
          >
            {repeatIcon}
          </button>
        </div>

        {/* Volume + time */}
        <div className="flex items-center gap-3 w-48 shrink-0 justify-end">
          <span className="text-[10px] text-warm-400 font-mono">{formatTime(progress)} / {formatTime(duration)}</span>
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
            className="p-1 text-warm-400 hover:text-warm-600 transition-colors"
          >
            {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-20 h-1 accent-accent-orange cursor-pointer"
          />
        </div>
      </div>

      {/* Expanded queue */}
      {expanded && queue.length > 0 && (
        <div className="bg-surface border-t border-cream-200 max-h-44 overflow-auto px-4 py-2">
          <div className="text-[10px] text-warm-400 mb-2 font-medium">播放列表</div>
          {queue.map((track, i) => (
            <div
              key={track.id}
              onClick={() => {
                // Jump to this track using context's setQueue
                setQueue(queue, i)
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                i === queueIndex
                  ? 'bg-accent-orange/10 text-accent-orange font-medium'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <span className="w-5 text-right text-warm-400">{i + 1}</span>
              <span className="truncate flex-1">{track.title}</span>
              <span className="text-warm-400 text-[10px]">{track.type === 'ambient' ? '🎵' : '📁'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
