import { createContext, useContext } from 'react'
import { useAudioPlayer, type PlayerState, type AudioTrack } from '../hooks/useAudioPlayer'

interface AudioContextValue {
  state: PlayerState
  play: (track?: AudioTrack) => void
  pause: () => void
  togglePlay: () => void
  setVolume: (vol: number) => void
  seek: (time: number) => void
  next: () => void
  prev: () => void
  setQueue: (tracks: AudioTrack[], startIdx?: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
}

const AudioPlayerContext = createContext<AudioContextValue | null>(null)

export function useAudioContext() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error('useAudioContext must be used within AudioProvider')
  return ctx
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer()

  return (
    <AudioPlayerContext.Provider value={player}>
      {children}
    </AudioPlayerContext.Provider>
  )
}
