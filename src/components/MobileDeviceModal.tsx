import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  Smartphone,
  Wifi,
  QrCode,
  Copy,
  Check,
  Globe,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  RefreshCw,
  RotateCw,
  Laptop,
  Cloud,
  Server,
} from 'lucide-react'

interface NetworkInfo {
  port: number
  deploymentMode?: 'cloud' | 'local'
  publicOrigin?: string | null
  preferredUrl: string
  lanUrls: Array<{
    iface: string
    address: string
    url: string
  }>
}

interface MobileDeviceModalProps {
  isOpen: boolean
  onClose: () => void
}

function detectBrowserCloudOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  if (!h || h === 'localhost' || h === '127.0.0.1') return false
  if (/^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) {
    return false
  }
  return true
}

export default function MobileDeviceModal({ isOpen, onClose }: MobileDeviceModalProps) {
  const [activeTab, setActiveTab] = useState<'simulator' | 'pwa' | 'cloud' | 'apk'>('simulator')
  const [envMode, setEnvMode] = useState<'cloud' | 'local'>(() =>
    detectBrowserCloudOrigin() ? 'cloud' : 'local'
  )
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [copiedNginx, setCopiedNginx] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mobile simulator state
  const [simulatorRoute, setSimulatorRoute] = useState('/dashboard')
  const [deviceModel, setDeviceModel] = useState<'android' | 'iphone' | 'tablet'>('android')
  const [isLandscape, setIsLandscape] = useState(false)

  const fetchNetwork = async () => {
    setLoading(true)
    const browserIsCloud = detectBrowserCloudOrigin()
    try {
      let res = await fetch('/api/network')
      if (!res.ok) {
        res = await fetch('/api/system/network')
      }
      if (res.ok) {
        const data: NetworkInfo = await res.json()
        setNetworkInfo(data)
        const detectedCloud = browserIsCloud || data.deploymentMode === 'cloud'
        setEnvMode(detectedCloud ? 'cloud' : 'local')
        if (detectedCloud) {
          setSelectedUrl(window.location.origin)
        } else {
          const initUrl = data.preferredUrl || data.lanUrls?.[0]?.url || window.location.origin
          setSelectedUrl(initUrl)
        }
      } else {
        setSelectedUrl(window.location.origin)
      }
    } catch {
      setSelectedUrl(window.location.origin)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNetwork()
    }
  }, [isOpen])

  useEffect(() => {
    const trimmed = selectedUrl.trim()
    if (trimmed) {
      QRCode.toDataURL(trimmed, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''))
    }
  }, [selectedUrl])

  if (!isOpen) return null

  const handleSwitchEnvMode = (nextMode: 'cloud' | 'local') => {
    setEnvMode(nextMode)
    if (nextMode === 'cloud') {
      if (detectBrowserCloudOrigin()) {
        setSelectedUrl(window.location.origin)
      } else if (networkInfo?.publicOrigin) {
        setSelectedUrl(networkInfo.publicOrigin)
      }
    } else if (networkInfo?.lanUrls?.[0]?.url) {
      setSelectedUrl(networkInfo.lanUrls[0].url)
    }
  }

  const handleCopy = () => {
    if (!selectedUrl) return
    navigator.clipboard.writeText(selectedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nginxSnippet = `location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # 关键：关闭缓冲以保障 AI 伴学流式输出与知识库 SSE 实时同步不卡顿
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 3600s;
    client_max_body_size 200m;
}`

  const handleCopyNginx = () => {
    navigator.clipboard.writeText(nginxSnippet)
    setCopiedNginx(true)
    setTimeout(() => setCopiedNginx(false), 2000)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full ${
          activeTab === 'simulator' ? 'max-w-5xl' : 'max-w-3xl'
        } overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-xl shadow-indigo-950/40 transition-all duration-300 animate-scale-up`}
      >
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>手机 / 平板跨端直连与预览中心</span>
                <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  支持云端 PWA & 原生 APK
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {envMode === 'cloud'
                  ? '☁️ 云服务器模式：手机 4G/5G 全网扫码即用、一键添加主屏全屏刷题、多端实时同步'
                  : '💻 本地开发模式：支持电脑实时仿真、局域网扫码秒连与云服务器上线指引'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* 云端 / 本地双模切换开关 */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-2xs">
              <button
                type="button"
                onClick={() => handleSwitchEnvMode('cloud')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  envMode === 'cloud'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cloud className="w-3 h-3" />
                <span>云服务器</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchEnvMode('local')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  envMode === 'local'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3 h-3" />
                <span>本地局域网</span>
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="关闭"
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-4 sm:px-6 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>实时手机预览 (仿真器)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {envMode === 'cloud' ? <Cloud className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            <span>{envMode === 'cloud' ? '云端扫码 & 安装 PWA' : '扫码秒连 (PWA 模式)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>云服务器 HTTPS 与反代配置</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'apk'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>打包独立 APK (Capacitor)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'simulator' && (
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Phone Frame Simulator */}
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-2 mb-3 text-xs flex-wrap justify-center">
                  <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
                    <button
                      onClick={() => setDeviceModel('android')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        deviceModel === 'android'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Android (390×844)
                    </button>
                    <button
                      onClick={() => setDeviceModel('iphone')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        deviceModel === 'iphone'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      iPhone 16 (393×852)
                    </button>
                    <button
                      onClick={() => setDeviceModel('tablet')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        deviceModel === 'tablet'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      平板 (480×640)
                    </button>
                  </div>

                  <button
                    onClick={() => setIsLandscape(!isLandscape)}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="横竖屏旋转"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const iframe = document.getElementById(
                        'mobile-preview-iframe'
                      ) as HTMLIFrameElement
                      if (iframe) iframe.src = iframe.src
                    }}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="重新加载手机画面"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div
                  style={{
                    width: isLandscape ? '600px' : deviceModel === 'tablet' ? '460px' : '375px',
                    height: isLandscape ? '360px' : deviceModel === 'tablet' ? '600px' : '640px',
                  }}
                  className="rounded-[44px] border-[10px] border-slate-800 bg-black shadow-xl p-1 relative flex flex-col overflow-hidden ring-1 ring-slate-700/50"
                >
                  {!isLandscape && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-between px-3 h-5 w-24 rounded-full bg-black border border-slate-800/80">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                      <span className="w-2 h-2 rounded-full bg-blue-900/60" />
                    </div>
                  )}

                  <div className="h-6 shrink-0 bg-slate-950 flex items-center justify-between px-6 text-2xs text-slate-400 select-none z-10">
                    <span className="font-semibold">09:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3" />
                      <span>5G</span>
                      <div className="w-4 h-2 border border-slate-400 rounded-xs p-0.2 flex items-center">
                        <div className="h-full w-full bg-emerald-400 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  <iframe
                    id="mobile-preview-iframe"
                    src={`${window.location.origin}${simulatorRoute}`}
                    className="flex-1 w-full border-none bg-white rounded-b-[36px]"
                    title="移动端实时预览"
                  />

                  <div className="h-4 shrink-0 bg-slate-950 flex items-center justify-center z-10">
                    <div className="w-32 h-1 bg-slate-600 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="flex-1 space-y-4 w-full">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>仿真器页面直达</span>
                  </div>
                  <p className="text-2xs text-slate-400">
                    点击快速在左侧手机预览中切换各个考研研学模块，实时验证移动端响应式交互
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { route: '/dashboard', label: '📊 首页看板' },
                      { route: '/study', label: '📚 讲义与真题' },
                      { route: '/quiz', label: '🎯 考研刷题模式' },
                      { route: '/chat', label: '🤖 AI 智能伴学' },
                      { route: '/vocabulary', label: '📖 408 核心词汇' },
                      { route: '/pomodoro', label: '🍅 研学番茄钟' },
                    ].map(r => (
                      <button
                        key={r.route}
                        onClick={() => setSimulatorRoute(r.route)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                          simulatorRoute === r.route
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 云服务器直连提示卡 */}
                <div className="p-4 rounded-2xl bg-indigo-950/35 border border-indigo-800/50 space-y-2.5">
                  <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Cloud className="w-4 h-4" />
                      <span>已部署到云服务器？手机直接扫码即用</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchEnvMode('cloud')
                        setActiveTab('pwa')
                      }}
                      className="text-2xs px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer transition-colors"
                    >
                      打开扫码页 →
                    </button>
                  </div>
                  <p className="text-2xs text-slate-300 leading-relaxed">
                    项目部署到云服务器后，不再需要局域网共连 Wi-Fi 或内网穿透。手机在自习室、图书馆用
                    5G 扫描云端地址二维码，点击浏览器菜单「添加到主屏幕」即可获得原生全屏 App 体验。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    <span>真机调试辅助工具</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>1. 浏览器 DevTools 设备仿真</span>
                        <span className="text-2xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Ctrl + Shift + M
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        按 F12 后开启设备仿真，支持模拟任意安卓 / iPhone 视口尺寸与触摸滑动。
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>2. Chrome 远程真机审查</span>
                        <span className="text-2xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          chrome://inspect
                        </span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-1">
                        手机连接电脑或直接用手机浏览器访问你的云服务器域名，实时排查移动端样式与网络请求。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  {qrDataUrl ? (
                    <div className="relative group">
                      <div className="p-2.5 bg-white rounded-xl shadow-xl">
                        <img
                          src={qrDataUrl}
                          alt="移动端访问二维码"
                          className="w-48 h-48 rounded-lg object-contain"
                        />
                      </div>
                      <div className="mt-2.5 text-center text-2xs text-slate-400 flex items-center justify-center gap-1">
                        <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                        <span>手机相机 / 浏览器直接扫码打开</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center text-slate-500 text-xs">
                      {loading ? '正在获取访问地址...' : '请在右侧输入有效的服务地址'}
                    </div>
                  )}
                </div>

                {/* Address & Guide */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>
                        {envMode === 'cloud'
                          ? '云服务器公网域名 / IP 地址（可自定义修改，二维码实时联动）'
                          : '本机局域网服务地址（支持手动输入服务器公网地址）'}
                      </span>
                      <button
                        onClick={fetchNetwork}
                        title="重新识别当前地址"
                        className="text-2xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>重置</span>
                      </button>
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedUrl}
                        onChange={e => setSelectedUrl(e.target.value)}
                        placeholder="例如 https://study.yourdomain.com 或 http://公网IP:3001"
                        className="flex-1 rounded-xl border border-slate-700 focus:border-indigo-500 bg-slate-950 px-3 py-2 text-xs font-mono text-indigo-300 outline-none"
                      />
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer shrink-0"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copied ? '已复制' : '复制'}</span>
                      </button>
                    </div>
                    {envMode === 'cloud' && selectedUrl.startsWith('http://') && (
                      <p className="mt-1.5 text-2xs text-amber-400/90">
                        💡 提示：若已绑定域名并配置 HTTPS，建议输入{' '}
                        <code className="font-mono">https://</code> 地址，可解锁移动端浏览器原生 PWA
                        一键安装弹窗。
                      </p>
                    )}
                  </div>

                  {envMode === 'local' && networkInfo && networkInfo.lanUrls.length > 0 && (
                    <div>
                      <span className="text-2xs text-slate-400">切换本机网卡地址：</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {networkInfo.lanUrls.map(item => (
                          <button
                            key={item.url}
                            onClick={() => setSelectedUrl(item.url)}
                            className={`rounded-lg px-2.5 py-1 text-2xs font-mono transition-all cursor-pointer ${
                              selectedUrl === item.url
                                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                            }`}
                          >
                            {item.iface}: {item.address}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>
                        {envMode === 'cloud'
                          ? '云服务器 3 步安装手机桌面全屏版（推荐）：'
                          : '局域网 3 步开启移动端体验：'}
                      </span>
                    </div>
                    {envMode === 'cloud' ? (
                      <ul className="space-y-1.5 text-slate-300 pl-1">
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">1.</span>
                          <span>
                            手机使用 <b>Chrome / Edge / Safari / 系统浏览器</b>{' '}
                            扫描左侧二维码登录账号（4G/5G/Wi-Fi 均可）。
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">2.</span>
                          <span>
                            点击浏览器菜单中的 <b>「添加到主屏幕」</b> 或 <b>「安装应用」</b>（iOS
                            点击底部分享图标 → 添加到主屏幕）。
                          </span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">3.</span>
                          <span>
                            从手机桌面点击「研核 CoreForge」图标启动，即享<b>隐藏地址栏的全屏原生体验</b>，与电脑端共享同一云端知识库与刷题记录！
                          </span>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-1.5 text-slate-400 pl-1">
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">1.</span>
                          <span>手机连接与电脑相同的 Wi-Fi（若已部署云服务器请切至右上角「云服务器」模式）。</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">2.</span>
                          <span>手机浏览器扫描左侧二维码打开页面。</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="font-bold text-indigo-400">3.</span>
                          <span>在浏览器菜单中点击「添加到主屏幕」开启全屏沉浸模式。</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">云端算力托管</div>
                    <div className="text-2xs text-slate-400">PDF 解析与 AI 检索全由服务端完成</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">全屏沉浸刷题</div>
                    <div className="text-2xs text-slate-400">PWA 独立窗口运行，无浏览器地址栏</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">多端实时同步</div>
                    <div className="text-2xs text-slate-400">手机刷题与随手记，电脑端秒级同步</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-950/35 border border-indigo-800/50 space-y-2">
                <div className="font-semibold text-indigo-300 flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4" />
                  <span>云服务器部署必检清单（保障移动端与 AI 流式体验满分）</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  既然你已将项目部署在云服务器上，不再需要折腾内网穿透。建议核对以下两项关键配置，确保手机端
                  PWA 安装、大体积 PDF 讲义上传及 AI 伴学打字机流式响应丝滑稳定：
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 text-sm">
                    1. Nginx / Caddy 反向代理推荐配置（开启 HTTPS + 关闭流式缓冲）
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNginx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-2xs font-semibold cursor-pointer"
                  >
                    {copiedNginx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNginx ? '已复制配置' : '复制 Nginx 片段'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-2xs text-emerald-300 overflow-x-auto leading-relaxed">
                  {nginxSnippet}
                </pre>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-2xs">
                  <li>
                    <b className="text-slate-200">为什么必须加 proxy_buffering off</b>：AI
                    伴学工作台与知识库实时变动采用 SSE 流式推送，若未关闭缓冲，Nginx
                    会攒够一整段才吐给手机，造成回复卡顿假死。
                  </li>
                  <li>
                    <b className="text-slate-200">为什么推荐配置 HTTPS 证书</b>：安卓 Chrome 与 iOS
                    Safari 要求在 HTTPS 域名下才启用完整 PWA 应用安装、剪贴板一键复制与安全登录态持久化。
                  </li>
                </ul>
              </div>

              <details className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3.5">
                <summary className="font-semibold text-slate-400 cursor-pointer hover:text-slate-200 select-none">
                  附：若偶尔在本地个人电脑运行，如何临时穿透外网？（点击展开）
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-200">Cloudflare Tunnel 临时 HTTPS</div>
                    <pre className="p-2 rounded-lg bg-slate-950 font-mono text-2xs text-emerald-300 overflow-x-auto select-all">
                      npx cloudflared tunnel --url http://localhost:3001
                    </pre>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-slate-200">Tailscale 异地虚拟组网</div>
                    <p className="text-slate-400 text-2xs">
                      电脑与手机登录同一 Tailscale 账号，通过分配的 <code className="text-indigo-300">100.x.x.x:3001</code> 直连。
                    </p>
                  </div>
                </div>
              </details>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-violet-950/35 border border-violet-800/50 space-y-2">
                <div className="font-semibold text-violet-300 flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span>云服务器专属：打包「云端直连原生 APK」（免重装热更新）</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  项目已升级支持 <code className="text-violet-300">CAP_SERVER_URL</code> 环境变量！只需在打包时指向你的云服务器地址，生成的{' '}
                  <code className="text-violet-300">CoreForge.apk</code> 启动后直连云端服务——<b>今后你在服务器上更新前端界面或导入新讲义题库，手机端无需重新打包重装 APK，打开即刻同步最新版本！</b>
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-200">打包操作命令清单（在有 Android Studio 的电脑上执行一次即可）：</div>
                <div className="space-y-2.5">
                  <div>
                    <div className="text-slate-400 text-2xs mb-1">
                      1. 构建前端资源并添加 Android 工程（首次执行）：
                    </div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 font-mono text-2xs text-slate-200 overflow-x-auto select-all">
{`npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android`}
                    </pre>
                  </div>
                  <div>
                    <div className="text-slate-400 text-2xs mb-1">
                      2. 绑定你的云服务器地址并同步到 Android 工程（将地址替换为你的服务器域名或公网 IP）：
                    </div>
                    <pre className="p-2.5 rounded-lg bg-slate-900 font-mono text-2xs text-emerald-300 overflow-x-auto select-all">
{`# PowerShell 示例：
$env:CAP_SERVER_URL="${selectedUrl || 'https://你的服务器域名'}"; npx cap sync android; npx cap open android`}
                    </pre>
                  </div>
                </div>
                <p className="text-slate-400 text-2xs pt-2 border-t border-slate-800">
                  💡 在打开的 Android Studio 中点击 <b>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</b> 即可导出安装包发到手机安装。其实在大多数场景下，直接使用第二个标签页的<b>「云端 PWA 添加到主屏幕」</b>就已经能获得几乎一致的全屏体验，且完全免编译！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-5 sm:px-6 py-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">
              {envMode === 'cloud'
                ? `当前直连目标：${selectedUrl || window.location.origin}`
                : '服务端已监听 0.0.0.0，支持云端反代与局域网跨端访问'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
