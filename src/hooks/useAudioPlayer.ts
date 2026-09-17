import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioTrack {
  id: string
  title: string
  artist?: string
  src: string
  type: 'local' | 'ambient' | 'radio'
  duration?: number
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface PlayerState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
  status: PlayerStatus
  error: string | null
  volume: number
  progress: number
  duration: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
  queue: AudioTrack[]
  queueIndex: number
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  status: 'idle',
  error: null,
  volume: 0.7,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  queue: [],
  queueIndex: -1,
}

function describeMediaError(error: MediaError | null, track: AudioTrack | null) {
  const subject = track?.type === 'radio' ? '电台' : '音频'
  switch (error?.code) {
    case 1:
      return `${subject}播放已中止，请重试`
    case 2:
      return `${subject}连接失败，请检查网络或代理设置`
    case 3:
      return `${subject}音频解码失败，请切换其他频道`
    case 4:
      return `${subject}地址已失效或格式不受支持`
    default:
      return `${subject}暂时无法播放，请稍后重试`
  }
}

function describePlayError(error: unknown, track: AudioTrack | null) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return '浏览器阻止了自动播放，请再次点击播放按钮'
    }
    if (error.name === 'NotSupportedError') {
      return track?.type === 'radio'
        ? '电台地址已失效或音频格式不受支持'
        : '音频格式不受支持'
    }
  }
  return error instanceof Error && error.message
    ? `播放失败：${error.message}`
    : '播放失败，请检查网络后重试'
}

export function useAudioPlayer() {
  const [state, setState] = useState<PlayerState>(initialState)
  const stateRef = useRef<PlayerState>(initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeTrackRef = useRef<AudioTrack | null>(null)
  const wantsPlaybackRef = useRef(false)
  const animFrameRef = useRef<number>(0)
  const playRequestRef = useRef(0)
  const nextRef = useRef<() => void>(() => {})

  const updateState = useCallback((updater: (current: PlayerState) => PlayerState) => {
    setState(current => {
      const next = updater(current)
      stateRef.current = next
      return next
    })
  }, [])

  const stopProgress = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
  }, [])

  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    if (audio && !audio.paused) {
      updateState(current => ({ ...current, progress: audio.currentTime || 0 }))
      animFrameRef.current = requestAnimationFrame(updateProgress)
    }
  }, [updateState])

  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current

    const audio = new Audio()
    audio.preload = 'none'
    audio.volume = initialState.volume

    const updateDuration = () => {
      updateState(current => ({
        ...current,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      }))
    }

    audio.addEventListener('ended', () => nextRef.current())
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('playing', () => {
      wantsPlaybackRef.current = true
      updateState(current => ({
        ...current,
        isPlaying: true,
        status: 'playing',
        error: null,
      }))
      stopProgress()
      animFrameRef.current = requestAnimationFrame(updateProgress)
    })
    audio.addEventListener('pause', () => {
      stopProgress()
      if (wantsPlaybackRef.current) return
      updateState(current => {
        if (current.status === 'error' || current.status === 'idle') return current
        return { ...current, isPlaying: false, status: 'paused' }
      })
    })
    audio.addEventListener('waiting', () => {
      if (!audio.paused) {
        updateState(current => ({ ...current, isPlaying: false, status: 'loading' }))
      }
    })
    audio.addEventListener('stalled', () => {
      if (!audio.paused) {
        updateState(current => ({ ...current, isPlaying: false, status: 'loading' }))
      }
    })
    audio.addEventListener('error', () => {
      wantsPlaybackRef.current = false
      stopProgress()
      updateState(current => ({
        ...current,
        isPlaying: false,
        status: 'error',
        error: describeMediaError(audio.error, activeTrackRef.current),
      }))
    })

    audioRef.current = audio
    return audio
  }, [stopProgress, updateProgress, updateState])

  const startTrack = useCallback((
    track: AudioTrack,
    queueUpdate?: Partial<Pick<PlayerState, 'queue' | 'queueIndex'>>,
  ) => {
    const audio = getAudio()
    const requestId = ++playRequestRef.current
    activeTrackRef.current = track
    wantsPlaybackRef.current = true
    stopProgress()
    audio.pause()

    updateState(current => ({
      ...current,
      ...queueUpdate,
      currentTrack: track,
      isPlaying: false,
      status: 'loading',
      error: null,
      progress: 0,
      duration: 0,
    }))

    audio.src = track.src
    audio.load()
    audio.play().then(() => {
      if (requestId !== playRequestRef.current || audio.paused) return
      updateState(current => ({
        ...current,
        isPlaying: true,
        status: 'playing',
        error: null,
      }))
    }).catch(error => {
      if (requestId !== playRequestRef.current) return
      wantsPlaybackRef.current = false
      stopProgress()
      updateState(current => ({
        ...current,
        isPlaying: false,
        status: 'error',
        error: describePlayError(error, track),
      }))
    })
  }, [getAudio, stopProgress, updateState])

  const resume = useCallback(() => {
    const audio = getAudio()
    const track = stateRef.current.currentTrack
    if (!track) return

    const requestId = ++playRequestRef.current
    wantsPlaybackRef.current = true
    updateState(current => ({
      ...current,
      isPlaying: false,
      status: 'loading',
      error: null,
    }))
    audio.play().then(() => {
      if (requestId !== playRequestRef.current || audio.paused) return
      updateState(current => ({
        ...current,
        isPlaying: true,
        status: 'playing',
        error: null,
      }))
    }).catch(error => {
      if (requestId !== playRequestRef.current) return
      wantsPlaybackRef.current = false
      updateState(current => ({
        ...current,
        isPlaying: false,
        status: 'error',
        error: describePlayError(error, track),
      }))
    })
  }, [getAudio, updateState])

  const play = useCallback((track?: AudioTrack) => {
    if (track) {
      startTrack(track)
    } else {
      resume()
    }
  }, [resume, startTrack])

  const pause = useCallback(() => {
    playRequestRef.current += 1
    wantsPlaybackRef.current = false
    const audio = audioRef.current
    if (audio) audio.pause()
    stopProgress()
    updateState(current => ({
      ...current,
      isPlaying: false,
      status: current.currentTrack ? 'paused' : 'idle',
    }))
  }, [stopProgress, updateState])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !stateRef.current.currentTrack) return
    if (audio.paused || stateRef.current.status === 'error') {
      resume()
    } else {
      pause()
    }
  }, [pause, resume])

  const setVolume = useCallback((vol: number) => {
    const nextVolume = Math.max(0, Math.min(1, vol))
    const audio = audioRef.current
    if (audio) audio.volume = nextVolume
    updateState(current => ({ ...current, volume: nextVolume }))
  }, [updateState])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = Math.max(0, Math.min(audio.duration, time))
    updateState(current => ({ ...current, progress: audio.currentTime }))
  }, [updateState])

  const handleNext = useCallback(() => {
    const current = stateRef.current
    if (current.queue.length === 0) {
      pause()
      return
    }

    let nextIndex = current.queueIndex
    if (current.repeat !== 'one') {
      if (current.shuffle) {
        nextIndex = Math.floor(Math.random() * current.queue.length)
      } else {
        nextIndex += 1
        if (nextIndex >= current.queue.length) {
          if (current.repeat === 'all') {
            nextIndex = 0
          } else {
            pause()
            return
          }
        }
      }
    }

    const track = current.queue[nextIndex]
    if (track) startTrack(track, { queueIndex: nextIndex })
  }, [pause, startTrack])

  const handlePrev = useCallback(() => {
    const current = stateRef.current
    if (current.queue.length === 0) return
    const previousIndex = current.queueIndex <= 0
      ? current.queue.length - 1
      : current.queueIndex - 1
    const track = current.queue[previousIndex]
    if (track) startTrack(track, { queueIndex: previousIndex })
  }, [startTrack])

  nextRef.current = handleNext

  const setQueue = useCallback((tracks: AudioTrack[], startIdx: number = 0) => {
    const safeIndex = Math.max(0, Math.min(tracks.length - 1, startIdx))
    const track = tracks[safeIndex]
    if (!track) return
    startTrack(track, { queue: tracks, queueIndex: safeIndex })
  }, [startTrack])

  const toggleShuffle = useCallback(() => {
    updateState(current => ({ ...current, shuffle: !current.shuffle }))
  }, [updateState])

  const cycleRepeat = useCallback(() => {
    updateState(current => ({
      ...current,
      repeat: current.repeat === 'none' ? 'all' : current.repeat === 'all' ? 'one' : 'none',
    }))
  }, [updateState])

  useEffect(() => {
    return () => {
      playRequestRef.current += 1
      wantsPlaybackRef.current = false
      stopProgress()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
        audioRef.current = null
      }
    }
  }, [stopProgress])

  return {
    state,
    play,
    pause,
    togglePlay,
    setVolume,
    seek,
    next: handleNext,
    prev: handlePrev,
    setQueue,
    toggleShuffle,
    cycleRepeat,
  }
}
