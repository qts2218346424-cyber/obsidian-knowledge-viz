import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Home,
  AlertCircle,
  Cloud,
  ExternalLink,
  Folder,
  FolderOpen,
  FolderUp,
  Globe,
  Headphones,
  LoaderCircle,
  Music2,
  Play,
  Radio,
  RefreshCw,
  Upload,
  Trash2,
  HardDrive,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Smartphone,
} from 'lucide-react'
import WarmCard from '../components/ui/WarmCard'
import WarmButton from '../components/ui/WarmButton'
import FolderPickerModal from '../components/FolderPickerModal'
import { useAudioContext } from '../contexts/AudioContext'
import { api, type MusicFile } from '../services/api'
import {
  RADIO_CATEGORIES, ALL_RADIO_STATIONS, AMBIENT_EMOJIS,
  type RadioStation, type RadioCategory,
} from '../data/ambientSounds'

type MusicTab = 'radio' | 'library'
type LibrarySubTab = 'cloud' | 'device'

interface BrowserAudio {
  id: string
  name: string
  size: number
  url: string
  type: string
}

const CATEGORY_ICONS: Record<RadioCategory, typeof Headphones> = {
  lofi: Headphones,
  english: Globe,
  ambient: Cloud,
}

export default function Music() {
  const navigate = useNavigate()
  const { setQueue, play, state } = useAudioContext()

  // 顶层标签：在线电台 vs 我的曲库
  const [activeTab, setActiveTab] = useState<MusicTab>('library')
  // 曲库子模式：云端音乐（多端漫游） vs 本机音频（免上传即播）
  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>('cloud')

  // 云端音乐状态
  const [cloudFiles, setCloudFiles] = useState<MusicFile[]>([])
  const [effectivePath, setEffectivePath] = useState('')
  const [loadingCloud, setLoadingCloud] = useState(false)
  const [cloudError, setCloudError] = useState('')

  // 上传状态
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  // 纯前端本机临时音频导入（免流量、不占云端存储）
  const [deviceFiles, setDeviceFiles] = useState<BrowserAudio[]>([])

  // 高级配置（云服务器磁盘原生目录直读）折叠状态
  const [showServerAdvanced, setShowServerAdvanced] = useState(false)
  const [serverCustomPath, setServerCustomPath] = useState('')
  const [scanningServer, setScanningServer] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  // 隐藏的上传 input 引用
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const deviceFileInputRef = useRef<HTMLInputElement>(null)

  // 加载云端曲库
  const fetchCloudMusic = async (silent = false) => {
    if (!silent) setLoadingCloud(true)
    setCloudError('')
    try {
      const res = await api.scanMusicFolder()
      setCloudFiles(res.files || [])
      setEffectivePath(res.effectivePath || res.path || '')
    } catch (err: any) {
      setCloudError(err.message || '加载云端音乐失败')
    } finally {
      if (!silent) setLoadingCloud(false)
    }
  }

  // 组件挂载时拉取云端曲库
  useEffect(() => {
    fetchCloudMusic(false)
    api.getMusicPath().then(data => {
      if (data.musicPath) {
        setServerCustomPath(data.musicPath)
      }
    }).catch(() => {})
  }, [])

  // 处理手机/电脑上传到云端音乐库
  const handleCloudUploadFiles = async (files: FileList | File[]) => {
    const validAudioList: File[] = []
    const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma']

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
      if (audioExts.includes(ext) || f.type.startsWith('audio/')) {
        validAudioList.push(f)
      }
    }

    if (validAudioList.length === 0) {
      setUploadError('请选择有效的音频格式文件（支持 MP3、WAV、FLAC、OGG、M4A 等）')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadMessage(`正在上传 ${validAudioList.length} 首音乐至云端曲库，请稍候...`)

    try {
      const res = await api.uploadMusicFiles(validAudioList)
      setUploadMessage(`成功上传 ${res.files?.length ? validAudioList.length : '全部'} 首音乐！`)
      if (res.files) {
        setCloudFiles(res.files)
      } else {
        await fetchCloudMusic(true)
      }
      setTimeout(() => setUploadMessage(''), 4000)
    } catch (err: any) {
      setUploadError(err.message || '上传云端音乐失败，请检查网络或重试')
    } finally {
      setUploading(false)
    }
  }

  // 删除单首云端曲目
  const handleDeleteCloudFile = async (file: MusicFile, e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm(`确定要从云端音乐库中删除《${file.name}》吗？`)
    if (!confirmed) return

    try {
      const res = await api.deleteMusicFile(file.path)
      if (res.files) {
        setCloudFiles(res.files)
      } else {
        await fetchCloudMusic(true)
      }
    } catch (err: any) {
      alert(err.message || '删除曲目失败')
    }
  }

  // 播放单首云端曲目
  const playCloudFile = (file: MusicFile) => {
    const tracks = cloudFiles.map(f => ({
      id: f.path,
      title: f.name,
      artist: `云端音乐 (${f.ext.toUpperCase()})`,
      src: api.getMusicStreamUrl(f.path),
      type: 'local' as const,
    }))
    const idx = cloudFiles.findIndex(f => f.path === file.path)
    setQueue(tracks, idx >= 0 ? idx : 0)
  }

  // 顺序播放全部云端曲目
  const playAllCloudFiles = () => {
    if (cloudFiles.length === 0) return
    const tracks = cloudFiles.map(f => ({
      id: f.path,
      title: f.name,
      artist: `云端音乐 (${f.ext.toUpperCase()})`,
      src: api.getMusicStreamUrl(f.path),
      type: 'local' as const,
    }))
    setQueue(tracks, 0)
  }

  // 处理本机音频导入（免上传·即选即播）
  const handleDeviceFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newItems: BrowserAudio[] = Array.from(files).map(f => ({
      id: `device-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name.replace(/\.[^/.]+$/, ''),
      size: f.size,
      url: URL.createObjectURL(f),
      type: (f.name.split('.').pop() || 'AUDIO').toUpperCase(),
    }))
    setDeviceFiles(prev => [...prev, ...newItems])
    // 自动置空 input，允许重复选择相同文件
    if (deviceFileInputRef.current) {
      deviceFileInputRef.current.value = ''
    }
  }

  // 播放单首本机音频
  const playDeviceAudio = (file: BrowserAudio) => {
    const tracks = deviceFiles.map(f => ({
      id: f.id,
      title: f.name,
      artist: `本机播放 (${f.type})`,
      src: f.url,
      type: 'local' as const,
    }))
    const idx = deviceFiles.findIndex(f => f.id === file.id)
    setQueue(tracks, idx >= 0 ? idx : 0)
  }

  // 顺序播放全部本机音频
  const playAllDeviceAudio = () => {
    if (deviceFiles.length === 0) return
    const tracks = deviceFiles.map(f => ({
      id: f.id,
      title: f.name,
      artist: `本机播放 (${f.type})`,
      src: f.url,
      type: 'local' as const,
    }))
    setQueue(tracks, 0)
  }

  // 播放电台
  const playStation = (station: RadioStation) => {
    const allInCategory = RADIO_CATEGORIES.find(c => c.key === station.category)?.stations || ALL_RADIO_STATIONS
    const idx = allInCategory.findIndex(s => s.id === station.id)
    setQueue(allInCategory, idx)
  }

  // 高级：扫描自定义服务器目录
  const handleScanServerPath = async () => {
    if (!serverCustomPath.trim()) return
    setScanningServer(true)
    setCloudError('')
    try {
      const res = await api.scanMusicFolder(serverCustomPath.trim())
      setCloudFiles(res.files || [])
      await api.setMusicPath(serverCustomPath.trim())
      setEffectivePath(res.path)
    } catch (err: any) {
      setCloudError(err.message || '扫描指定目录失败')
    } finally {
      setScanningServer(false)
    }
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-10">
      {/* 隐藏的文件输入组件 */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma"
        onChange={e => {
          if (e.target.files) handleCloudUploadFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={e => {
          if (e.target.files) handleCloudUploadFiles(e.target.files)
          e.target.value = ''
        }}
        className="hidden"
      />
      <input
        type="file"
        ref={deviceFileInputRef}
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma"
        onChange={handleDeviceFilesSelect}
        className="hidden"
      />

      {/* 顶部主导航栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/dashboard')
              }
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-800 border border-warm-200/90 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700 text-warm-800 dark:text-slate-100 font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="退出音乐电台，返回上一页"
          >
            <ArrowLeft className="w-4 h-4 text-warm-700 dark:text-slate-200" />
            <span>返回</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-warm-200/90 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700 text-warm-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
            title="返回首页仪表盘"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">首页</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-warm-800 dark:text-white truncate">🎵 音乐电台</h1>
            <p className="text-xs sm:text-sm text-warm-500 dark:text-slate-400 mt-0.5 truncate">
              在线电台 + 云端曲库，全设备畅享伴学音乐
            </p>
          </div>
        </div>

        {/* 主 Tab 切换 */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-accent-orange text-white shadow-xs'
                : 'bg-cream-100 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border border-cream-200 dark:border-slate-700 hover:bg-cream-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>我的曲库</span>
            {cloudFiles.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'library' ? 'bg-white/25 text-white' : 'bg-warm-200 dark:bg-slate-700 text-warm-700 dark:text-slate-200'
              }`}>
                {cloudFiles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('radio')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'radio'
                ? 'bg-accent-orange text-white shadow-xs'
                : 'bg-cream-100 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border border-cream-200 dark:border-slate-700 hover:bg-cream-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>在线电台</span>
          </button>
        </div>
      </div>

      {/* 我的曲库视图 */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* 子模式切换：云端音乐库 vs 本机即选即播 */}
          <div className="p-1.5 bg-cream-100/80 dark:bg-slate-800/80 rounded-2xl border border-cream-200 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={() => setLibrarySubTab('cloud')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                librarySubTab === 'cloud'
                  ? 'bg-white dark:bg-slate-900 text-accent-orange shadow-2xs font-semibold'
                  : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 hover:bg-white/40'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>☁️ 云端音乐库 (手机/电脑上传·跨端同步)</span>
            </button>
            <button
              onClick={() => setLibrarySubTab('device')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                librarySubTab === 'device'
                  ? 'bg-white dark:bg-slate-900 text-accent-orange shadow-2xs font-semibold'
                  : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 hover:bg-white/40'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📱 本机免上传即播 (零流量·本地临时)</span>
            </button>
          </div>

          {/* ────────────────── 子页面 1：云端音乐库 ────────────────── */}
          {librarySubTab === 'cloud' && (
            <div className="space-y-4">
              <WarmCard className="p-4 sm:p-5">
                {/* 顶栏操作区：醒目的上传按钮群 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cream-200 dark:border-slate-700/80">
                  <div>
                    <h2 className="text-base font-bold text-warm-800 dark:text-white flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-accent-orange" />
                      <span>云端音乐资产库</span>
                      <span className="text-xs font-normal text-warm-400 dark:text-slate-400">
                        (共 {cloudFiles.length} 首歌曲)
                      </span>
                    </h2>
                    <p className="text-xs text-warm-500 dark:text-slate-400 mt-1">
                      直接从当前手机或电脑上传，上传后全设备同步漫游，随时随地播放
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 上传音乐主按钮（手机与电脑均支持批量选择） */}
                    <WarmButton
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-4 py-2 font-semibold text-xs sm:text-sm shadow-xs active:scale-95 cursor-pointer"
                    >
                      {uploading ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploading ? '上传中...' : '上传音乐'}</span>
                    </WarmButton>

                    {/* 电脑端整个文件夹上传 */}
                    <WarmButton
                      variant="secondary"
                      onClick={() => folderInputRef.current?.click()}
                      disabled={uploading}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm cursor-pointer"
                      title="选择电脑中的整个音乐文件夹进行批量上传"
                    >
                      <FolderUp className="w-4 h-4 text-warm-600 dark:text-slate-300" />
                      <span>上传文件夹</span>
                    </WarmButton>

                    {/* 刷新 */}
                    <button
                      onClick={() => fetchCloudMusic(false)}
                      disabled={loadingCloud}
                      className="p-2 rounded-xl border border-cream-200 dark:border-slate-700 hover:bg-cream-100 dark:hover:bg-slate-700 text-warm-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="刷新云端曲库"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingCloud ? 'animate-spin text-accent-orange' : ''}`} />
                    </button>

                    {/* 全部播放 */}
                    {cloudFiles.length > 0 && (
                      <WarmButton
                        variant="secondary"
                        onClick={playAllCloudFiles}
                        className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-accent-orange" />
                        <span>全部播放</span>
                      </WarmButton>
                    )}
                  </div>
                </div>

                {/* 上传进度或成功/失败状态提示条 */}
                {uploadMessage && (
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{uploadMessage}</span>
                  </div>
                )}
                {uploadError && (
                  <div className="mt-3.5 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-xs text-accent-rose flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {cloudError && (
                  <div className="mt-3.5 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-xs text-accent-rose flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cloudError}</span>
                  </div>
                )}

                {/* 桌面端拖拽上传区域 */}
                <div
                  onDragOver={e => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setIsDragOver(false)
                    if (e.dataTransfer.files) {
                      handleCloudUploadFiles(e.dataTransfer.files)
                    }
                  }}
                  className={`mt-4 rounded-2xl border-2 border-dashed transition-all p-5 text-center ${
                    isDragOver
                      ? 'border-accent-orange bg-accent-orange/10 scale-[0.99]'
                      : 'border-cream-300/80 dark:border-slate-700 bg-cream-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <Upload className="w-8 h-8 text-warm-400 dark:text-slate-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-warm-700 dark:text-slate-200">
                    点击上方按钮，或将手机/电脑中的音频文件拖拽至此上传
                  </p>
                  <p className="text-[11px] text-warm-400 dark:text-slate-400 mt-1">
                    全面支持 MP3、WAV、FLAC、OGG、M4A、AAC 等格式 · 单文件最高支持 300MB
                  </p>
                </div>

                {/* 歌曲列表 */}
                {cloudFiles.length > 0 ? (
                  <div className="mt-4">
                    <div className="max-h-96 overflow-y-auto space-y-1.5 rounded-xl border border-cream-200 dark:border-slate-700 bg-cream-50/70 dark:bg-slate-900/60 p-2">
                      {cloudFiles.map((file, i) => {
                        const isPlaying = state.currentTrack?.id === file.path
                        return (
                          <div
                            key={file.path}
                            onClick={() => playCloudFile(file)}
                            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isPlaying
                                ? 'bg-accent-orange/15 dark:bg-accent-orange/20 text-warm-900 dark:text-white border border-accent-orange/30 shadow-2xs'
                                : 'text-warm-700 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <span className="w-6 text-right text-xs text-warm-400 dark:text-slate-500 font-mono">
                              {i + 1}
                            </span>
                            {isPlaying ? (
                              <div className="flex items-end gap-0.5 h-3.5 w-4 shrink-0">
                                <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 4, animationDelay: '0ms' }} />
                                <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 8, animationDelay: '150ms' }} />
                                <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 6, animationDelay: '300ms' }} />
                              </div>
                            ) : (
                              <Music2 className="w-4 h-4 text-warm-400 dark:text-slate-500 shrink-0 group-hover:text-accent-orange" />
                            )}
                            <span className="flex-1 text-xs sm:text-sm font-medium truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-warm-200/80 dark:bg-slate-800 text-warm-600 dark:text-slate-300 shrink-0">
                              {file.ext}
                            </span>
                            <span className="text-[10px] text-warm-400 dark:text-slate-400 font-mono shrink-0 hidden sm:inline">
                              {formatSize(file.size)}
                            </span>
                            {/* 删除按钮 */}
                            <button
                              type="button"
                              onClick={e => handleDeleteCloudFile(file, e)}
                              className="p-1.5 rounded-lg text-warm-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors opacity-70 group-hover:opacity-100"
                              title="从云端音乐库删除该文件"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : !loadingCloud && (
                  <div className="text-center py-8">
                    <Music2 className="w-12 h-12 text-cream-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-warm-600 dark:text-slate-300">云端曲库暂无音乐</p>
                    <p className="text-xs text-warm-400 dark:text-slate-500 mt-1">
                      点击上方的“上传音乐”按钮，即可将您手机或电脑中的歌曲保存至云端同步
                    </p>
                  </div>
                )}
              </WarmCard>

              {/* ⚙️ 高级选项：服务器磁盘原生目录直读（折叠面板） */}
              <div className="rounded-2xl border border-cream-200 dark:border-slate-800 bg-cream-50/60 dark:bg-slate-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowServerAdvanced(!showServerAdvanced)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs text-warm-500 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-warm-400" />
                    <span className="font-medium">高级运维：云服务器原生磁盘目录直读 (自建主机 / 远程 NAS 挂载)</span>
                  </div>
                  {showServerAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showServerAdvanced && (
                  <div className="p-4 pt-1 border-t border-cream-200/80 dark:border-slate-800 space-y-3">
                    <p className="text-[11px] text-warm-400 dark:text-slate-400 leading-relaxed">
                      💡 提示：此选项仅适用于管理员或自建服务器用户，直接读取云主机本地磁盘路径。普通用户在手机或个人电脑端，建议直接使用上方的“上传音乐”即可。
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={serverCustomPath}
                        onChange={e => setServerCustomPath(e.target.value)}
                        placeholder="输入服务器路径，如 /data/music 或 D:\Music"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-cream-200 dark:border-slate-700 text-xs text-warm-700 dark:text-slate-200 placeholder-warm-300 outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/10"
                      />
                      <div className="flex items-center gap-2">
                        <WarmButton
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowPicker(true)}
                          className="flex items-center gap-1 text-xs"
                          title="在云端主机中浏览选择目录"
                        >
                          <Folder className="w-3.5 h-3.5 text-accent-orange" />
                          <span>浏览云服务器</span>
                        </WarmButton>
                        <WarmButton
                          size="sm"
                          onClick={handleScanServerPath}
                          disabled={scanningServer || !serverCustomPath.trim()}
                          className="text-xs"
                        >
                          {scanningServer ? '扫描中...' : '扫描服务器'}
                        </WarmButton>
                      </div>
                    </div>
                    {effectivePath && (
                      <div className="text-[11px] text-warm-400 dark:text-slate-500 font-mono">
                        当前云端存储物理路径：{effectivePath}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── 子页面 2：本机音频免上传即播 ────────────────── */}
          {librarySubTab === 'device' && (
            <WarmCard className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200 dark:border-slate-700/80">
                <div>
                  <h2 className="text-base font-bold text-warm-800 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-accent-orange" />
                    <span>本机免上传即播</span>
                    <span className="text-xs font-normal text-warm-400 dark:text-slate-400">
                      (已导入 {deviceFiles.length} 首)
                    </span>
                  </h2>
                  <p className="text-xs text-warm-500 dark:text-slate-400 mt-1">
                    音频文件只在您的当前手机或电脑本地浏览器内存中播放，零云端流量消耗，私密安全
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <WarmButton
                    onClick={() => deviceFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 font-semibold text-xs sm:text-sm cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>选择本机音频</span>
                  </WarmButton>

                  {deviceFiles.length > 0 && (
                    <>
                      <WarmButton
                        variant="secondary"
                        onClick={playAllDeviceAudio}
                        className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-accent-orange" />
                        <span>全部播放</span>
                      </WarmButton>
                      <button
                        onClick={() => setDeviceFiles([])}
                        className="p-2 rounded-xl border border-cream-200 dark:border-slate-700 hover:bg-accent-rose/10 hover:text-accent-rose text-warm-400 transition-colors"
                        title="清空本机列表"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 导入列表 */}
              {deviceFiles.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-1.5 rounded-xl border border-cream-200 dark:border-slate-700 bg-cream-50/70 dark:bg-slate-900/60 p-2">
                  {deviceFiles.map((file, i) => {
                    const isPlaying = state.currentTrack?.id === file.id
                    return (
                      <div
                        key={file.id}
                        onClick={() => playDeviceAudio(file)}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-accent-orange/15 dark:bg-accent-orange/20 text-warm-900 dark:text-white border border-accent-orange/30 shadow-2xs'
                            : 'text-warm-700 dark:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <span className="w-6 text-right text-xs text-warm-400 dark:text-slate-500 font-mono">
                          {i + 1}
                        </span>
                        {isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3.5 w-4 shrink-0">
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 4, animationDelay: '0ms' }} />
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 8, animationDelay: '150ms' }} />
                            <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 6, animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <Music2 className="w-4 h-4 text-warm-400 dark:text-slate-500 shrink-0 group-hover:text-accent-orange" />
                        )}
                        <span className="flex-1 text-xs sm:text-sm font-medium truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-warm-200/80 dark:bg-slate-800 text-warm-600 dark:text-slate-300 shrink-0">
                          {file.type}
                        </span>
                        <span className="text-[10px] text-warm-400 dark:text-slate-400 font-mono shrink-0">
                          {formatSize(file.size)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Smartphone className="w-12 h-12 text-cream-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-warm-600 dark:text-slate-300">尚未选择本机音频</p>
                  <p className="text-xs text-warm-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                    点击右上角“选择本机音频”，可单选或批量多选手机/电脑里的音乐即选即播，断网亦可畅听
                  </p>
                </div>
              )}
            </WarmCard>
          )}
        </div>
      )}

      {/* 在线电台视图 */}
      {activeTab === 'radio' && (
        <div className="space-y-6">
          {state.currentTrack?.type === 'radio' && state.status === 'error' && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-accent-rose/25 bg-accent-rose/10 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-rose" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-warm-700 dark:text-slate-200">
                  {state.currentTrack.title} 播放失败
                </div>
                <div className="mt-0.5 text-xs text-warm-500 dark:text-slate-400">
                  {state.error || '暂时无法连接这个电台'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => play(state.currentTrack!)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-accent-rose/20 bg-white/60 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-accent-rose transition-colors hover:bg-white"
              >
                <RefreshCw className="h-3 w-3" />
                重试
              </button>
            </div>
          )}

          {RADIO_CATEGORIES.map(category => {
            const IconComp = CATEGORY_ICONS[category.key]
            return (
              <WarmCard key={category.key}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                    <IconComp className="w-4.5 h-4.5 text-accent-orange" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-warm-700 dark:text-slate-200">
                      {category.emoji} {category.label}
                    </h2>
                    <p className="text-[11px] text-warm-400 dark:text-slate-400">{category.description}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-warm-400 dark:text-slate-400 bg-cream-200 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {category.stations.length} 个电台
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.stations.map(station => {
                    const isCurrent = state.currentTrack?.id === station.id
                    const isPlaying = isCurrent && state.isPlaying
                    const isLoading = isCurrent && state.status === 'loading'
                    const hasError = isCurrent && state.status === 'error'
                    return (
                      <button
                        key={station.id}
                        onClick={() => playStation(station)}
                        className={`group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                          isPlaying
                            ? 'bg-accent-orange/12 border-accent-orange/40 ring-1 ring-accent-orange/20'
                            : hasError
                              ? 'bg-accent-rose/10 border-accent-rose/30'
                              : 'bg-cream-50 dark:bg-slate-800/60 border-cream-200 dark:border-slate-700 hover:bg-cream-100 dark:hover:bg-slate-800 hover:border-cream-300 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{AMBIENT_EMOJIS[station.id] || '🎵'}</span>
                          {isLoading && (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent-orange" />
                          )}
                          {isPlaying && !isLoading && (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 5, animationDelay: '0ms' }} />
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 9, animationDelay: '150ms' }} />
                              <div className="w-0.5 bg-accent-orange rounded-full animate-bounce" style={{ height: 7, animationDelay: '300ms' }} />
                            </div>
                          )}
                          {hasError && (
                            <AlertCircle className="h-3.5 w-3.5 text-accent-rose" />
                          )}
                          {station.website && (
                            <a
                              href={station.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-slate-700 hover:bg-white text-warm-600 dark:text-slate-300 hover:text-accent-orange border border-cream-300 dark:border-slate-600 shadow-2xs transition-all"
                              title="访问电台官方主页 (外部跳转)"
                            >
                              <span>官网</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        <div className="text-sm font-medium text-warm-700 dark:text-slate-200 leading-tight">{station.title}</div>
                        <div className="text-[10px] text-warm-400 dark:text-slate-400 mt-0.5">{station.artist}</div>
                        <div className="text-[10px] text-warm-400 dark:text-slate-400 mt-1 truncate opacity-70">{station.description}</div>
                      </button>
                    )
                  })}
                </div>
              </WarmCard>
            )
          })}

          {/* 伴学小贴士 */}
          <WarmCard className="bg-accent-sage/5 border-accent-sage/20 dark:bg-slate-800/60 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h3 className="text-sm font-medium text-warm-700 dark:text-slate-200 mb-1">伴学建议</h3>
                <p className="text-xs text-warm-500 dark:text-slate-400 leading-relaxed">
                  Lo-fi 电台适合需要专注的深度学习，英语电台可以在休息时当作泛听磨耳朵，
                  氛围音则适合隔绝环境噪音快速进入心流状态。
                </p>
              </div>
            </div>
          </WarmCard>
        </div>
      )}

      {/* 云服务器目录选择模态窗（仅供高级运维展开时使用） */}
      {showPicker && (
        <FolderPickerModal
          title="选择云服务器磁盘目录 (高级)"
          initialPath={serverCustomPath || effectivePath}
          onSelect={folder => {
            setServerCustomPath(folder)
            setShowPicker(false)
            handleScanServerPath()
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
