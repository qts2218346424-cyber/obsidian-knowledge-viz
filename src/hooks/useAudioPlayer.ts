import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioTrack {
  id: string
  title: string
  artist?: string
  src: string
  type: 'local' | 'ambient' | 'radio'
  duration?: number
}

export interface PlayerState {
  currentTrack: AudioTrack | null
  isPlaying: boolean
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
  volume: 0.7,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  queue: [],
  queueIndex: -1,
}

export function useAudioPlayer() {
  const [state, setState] = useState<PlayerState>(initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number>(0)

  // Create a persistent Audio element
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = initialState.volume

      audioRef.current.addEventListener('ended', () => {
        handleNext()
      })

      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setState(s => ({ ...s, duration: audioRef.current!.duration }))
        }
      })

      audioRef.current.addEventListener('error', () => {
        setState(s => ({ ...s, isPlaying: false }))
      })
    }
    return audioRef.current
  }, [])

  // Progress update loop
  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    if (audio && !audio.paused) {
      setState(s => ({ ...s, progress: audio.currentTime }))
      animFrameRef.current = requestAnimationFrame(updateProgress)
    }
  }, [])

  const play = useCallback((track?: AudioTrack) => {
    const audio = getAudio()

    if (track) {
      if (audio.src !== track.src) {
        audio.src = track.src
      }
      setState(s => ({
        ...s,
        currentTrack: track,
        isPlaying: true,
        progress: 0,
      }))
    } else {
      setState(s => ({ ...s, isPlaying: true }))
    }

    audio.play().catch(() => {
      setState(s => ({ ...s, isPlaying: false }))
    })
    animFrameRef.current = requestAnimationFrame(updateProgress)
  }, [getAudio, updateProgress])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      cancelAnimationFrame(animFrameRef.current)
    }
    setState(s => ({ ...s, isPlaying: false }))
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !state.currentTrack) return
    if (audio.paused) {
      audio.play().catch(() => {})
      setState(s => ({ ...s, isPlaying: true }))
      animFrameRef.current = requestAnimationFrame(updateProgress)
    } else {
      audio.pause()
      cancelAnimationFrame(animFrameRef.current)
      setState(s => ({ ...s, isPlaying: false }))
    }
  }, [state.currentTrack, updateProgress])

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current
    if (audio) audio.volume = vol
    setState(s => ({ ...s, volume: vol }))
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = time
      setState(s => ({ ...s, progress: time }))
    }
  }, [])

  const handleNext = useCallback(() => {
    setState(s => {
      if (s.queue.length === 0) return { ...s, isPlaying: false }

      let nextIdx: number
      if (s.repeat === 'one') {
        nextIdx = s.queueIndex
      } else if (s.shuffle) {
        nextIdx = Math.floor(Math.random() * s.queue.length)
      } else {
        nextIdx = s.queueIndex + 1
        if (nextIdx >= s.queue.length) {
          if (s.repeat === 'all') {
            nextIdx = 0
          } else {
            return { ...s, isPlaying: false }
          }
        }
      }

      const nextTrack = s.queue[nextIdx]
      const audio = audioRef.current
      if (audio && nextTrack) {
        audio.src = nextTrack.src
        audio.play().catch(() => {})
        animFrameRef.current = requestAnimationFrame(updateProgress)
      }

      return { ...s, currentTrack: nextTrack, queueIndex: nextIdx, isPlaying: true, progress: 0 }
    })
  }, [updateProgress])

  const handlePrev = useCallback(() => {
    setState(s => {
      if (s.queue.length === 0) return s
      const prevIdx = s.queueIndex <= 0 ? s.queue.length - 1 : s.queueIndex - 1
      const prevTrack = s.queue[prevIdx]
      const audio = audioRef.current
      if (audio && prevTrack) {
        audio.src = prevTrack.src
        audio.play().catch(() => {})
        animFrameRef.current = requestAnimationFrame(updateProgress)
      }
      return { ...s, currentTrack: prevTrack, queueIndex: prevIdx, isPlaying: true, progress: 0 }
    })
  }, [updateProgress])

  const setQueue = useCallback((tracks: AudioTrack[], startIdx: number = 0) => {
    const track = tracks[startIdx]
    if (!track) return
    const audio = getAudio()
    audio.src = track.src
    audio.play().catch(() => {})
    animFrameRef.current = requestAnimationFrame(updateProgress)
    setState(s => ({
      ...s,
      queue: tracks,
      queueIndex: startIdx,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    }))
  }, [getAudio, updateProgress])

  const toggleShuffle = useCallback(() => {
    setState(s => ({ ...s, shuffle: !s.shuffle }))
  }, [])

  const cycleRepeat = useCallback(() => {
    setState(s => ({
      ...s,
      repeat: s.repeat === 'none' ? 'all' : s.repeat === 'all' ? 'one' : 'none',
    }))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

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
