import { useState, useEffect } from 'react'
import { FolderOpen, Play, ExternalLink, Music2, Radio, Headphones, Globe, Cloud } from 'lucide-react'
import WarmCard from '../components/ui/WarmCard'
import WarmButton from '../components/ui/WarmButton'
import { useAudioContext } from '../contexts/AudioContext'
import { api, type MusicFile } from '../services/api'
import {
  RADIO_CATEGORIES, ALL_RADIO_STATIONS, AMBIENT_EMOJIS,
  type RadioStation, type RadioCategory,
} from '../data/ambientSounds'

type MusicTab = 'radio' | 'local'

const CATEGORY_ICONS: Record<RadioCategory, typeof Headphones> = {
  lofi: Headphones,
  english: Globe,
  ambient: Cloud,
}

export default function Music() {
  const { setQueue, state } = useAudioContext()
  const [musicPath, setMusicPath] = useState('')
  const [savedPath, setSavedPath] = useState('')
  const [localFiles, setLocalFiles] = useState<MusicFile[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [activeTab, setActiveTab] = useState<MusicTab>('radio')

  // Load saved music path on mount
  useEffect(() => {
    api.getMusicPath().then(data => {
      if (data.musicPath) {
        setMusicPath(data.musicPath)
        setSavedPath(data.musicPath)
      }
    }).catch(() => {})
  }, [])

  const handleScan = async () => {
    if (!musicPath.trim()) return
    setScanning(true)
    setScanError('')
    try {
      const result = await api.scanMusicFolder(musicPath.trim())
      setLocalFiles(result.files)
      await api.setMusicPath(musicPath.trim())
      setSavedPath(musicPath.trim())
    } catch (err: any) {
      setScanError(err.message || '扫描失败')
      setLocalFiles([])
    } finally {
      setScanning(false)
    }
  }

  const playStation = (station: RadioStation) => {
    const allInCategory = RADIO_CATEGORIES.find(c => c.key === station.category)?.stations || ALL_RADIO_STATIONS
    const idx = allInCategory.findIndex(s => s.id === station.id)
    setQueue(allInCategory, idx)
  }

  const playLocal = (file: MusicFile) => {
    const tracks = localFiles.map(f => ({
      id: f.path,
      title: f.name,
      artist: f.ext.toUpperCase(),
      src: api.getMusicStreamUrl(f.path),
      type: 'local' as const,
    }))
    const idx = localFiles.findIndex(f => f.path === file.path)
    setQueue(tracks, idx)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">🎵 音乐电台</h1>
          <p className="text-sm text-warm-500 mt-1">在线电台 + 本地音乐，学习时随心切换</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('radio')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'radio'
                ? 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30'
                : 'bg-cream-100 text-warm-500 border border-cream-200 hover:bg-cream-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            在线电台
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30'
                : 'bg-cream-100 text-warm-500 border border-cream-200 hover:bg-cream-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            本地音乐
          </button>
        </div>
      </div>

      {/* Radio Tab */}
      {activeTab === 'radio' && (
        <div className="space-y-6">
          {RADIO_CATEGORIES.map(category => {
            const IconComp = CATEGORY_ICONS[category.key]
            return (
              <WarmCard key={category.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                    <IconComp className="w-4.5 h-4.5 text-accent-orange" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-warm-700">
                      {category.emoji} {category.label}
                    </h2>
                    <p className="text-[11px] text-warm-400">{category.description}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-warm-400 bg-cream-200 px-2 py-1 rounded-full">
                    {category.stations.length} 个电台
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.stations.map(station => {
                    const isPlaying = state.currentTrack?.id === station.id && state.isPlaying
                    return (
                      <button
                        key={station.id}
                        onClick={() => playStation(station)}
                        className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                          isPlaying
                            ? 'bg-accent-orange/12 border-accent-orange/40 ring-1 ring-accent-orange/20'
                            : 'bg-cream-50 border-cream-200 hover:bg-cream-100 hover:border-cream-300 hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Emoji + playing indicator */}
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{AMBIENT_EMOJIS[station.id] || '🎵'}</span>
                          {isPlaying && (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 5, animationDelay: '0ms' }} />
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 9, animationDelay: '150ms' }} />
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 7, animationDelay: '300ms' }} />
                            </div>
                          )}
                          {station.website && !isPlaying && (
                            <a
                              href={station.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-cream-200 transition-all"
                              title="访问电台网站"
                            >
                              <ExternalLink className="w-3 h-3 text-warm-400" />
                            </a>
                          )}
                        </div>

                        {/* Station info */}
                        <div className="text-sm font-medium text-warm-700 leading-tight">{station.title}</div>
                        <div className="text-[10px] text-warm-400 mt-0.5">{station.artist}</div>
                        <div className="text-[10px] text-warm-400 mt-1 truncate opacity-70">{station.description}</div>
                      </button>
                    )
                  })}
                </div>
              </WarmCard>
            )
          })}

          {/* Study tip */}
          <WarmCard className="bg-accent-sage/5 border-accent-sage/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h3 className="text-sm font-medium text-warm-700 mb-1">学习小贴士</h3>
                <p className="text-xs text-warm-500 leading-relaxed">
                  Lo-fi 电台适合需要专注的深度学习，英语电台可以在休息时当作听力练习，
                  氛围音则适合隔绝外部噪音进入心流状态。推荐音量控制在 30-50%。
                </p>
              </div>
            </div>
          </WarmCard>
        </div>
      )}

      {/* Local Music Tab */}
      {activeTab === 'local' && (
        <div className="space-y-4">
          <WarmCard>
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-accent-orange" />
              <h2 className="text-base font-semibold text-warm-700">本地音乐库</h2>
            </div>

            {/* Path input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={musicPath}
                onChange={e => setMusicPath(e.target.value)}
                placeholder="输入音乐文件夹路径，如 D:\Music 或 /home/user/Music"
                className="flex-1 px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-sm text-warm-700 placeholder-warm-300 outline-none focus:border-accent-orange/40 focus:ring-2 focus:ring-accent-orange/10 transition-all"
              />
              <WarmButton onClick={handleScan} disabled={scanning || !musicPath.trim()}>
                {scanning ? '扫描中...' : '扫描'}
              </WarmButton>
            </div>

            {scanError && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-xs text-accent-rose">
                {scanError}
              </div>
            )}

            {savedPath && (
              <div className="mb-3 text-xs text-warm-400">
                已保存路径：<span className="font-mono text-warm-600">{savedPath}</span>
              </div>
            )}

            {/* File list */}
            {localFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-warm-500">找到 {localFiles.length} 首音乐</span>
                  <WarmButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (localFiles.length > 0) {
                        const tracks = localFiles.map(f => ({
                          id: f.path,
                          title: f.name,
                          artist: f.ext.toUpperCase(),
                          src: api.getMusicStreamUrl(f.path),
                          type: 'local' as const,
                        }))
                        setQueue(tracks, 0)
                      }
                    }}
                  >
                    <Play className="w-3 h-3 inline mr-1" /> 全部播放
                  </WarmButton>
                </div>
                <div className="max-h-96 overflow-auto space-y-1 rounded-xl border border-cream-200 bg-cream-50 p-2">
                  {localFiles.map((file, i) => {
                    const isPlaying = state.currentTrack?.id === file.path
                    return (
                      <button
                        key={file.path}
                        onClick={() => playLocal(file)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          isPlaying
                            ? 'bg-accent-orange/15 text-warm-800'
                            : 'text-warm-600 hover:bg-cream-100'
                        }`}
                      >
                        <span className="w-6 text-right text-[10px] text-warm-400">{i + 1}</span>
                        {isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3 w-4">
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 4, animationDelay: '0ms' }} />
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 8, animationDelay: '150ms' }} />
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 6, animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <Music2 className="w-3.5 h-3.5 text-warm-400" />
                        )}
                        <span className="flex-1 text-sm truncate">{file.name}</span>
                        <span className="text-[10px] text-warm-400 uppercase">{file.ext}</span>
                        <span className="text-[10px] text-warm-400">{formatSize(file.size)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {localFiles.length === 0 && !scanning && !scanError && (
              <div className="text-center py-8">
                <Music2 className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                <p className="text-sm text-warm-400">输入文件夹路径并点击扫描</p>
                <p className="text-xs text-warm-300 mt-1">支持 MP3, WAV, OGG, FLAC, M4A 等格式</p>
              </div>
            )}
          </WarmCard>
        </div>
      )}
    </div>
  )
}
