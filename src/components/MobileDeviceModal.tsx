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
  Sparkles,
  ShieldCheck,
  X,
  RefreshCw,
  RotateCw,
  Laptop,
  Terminal,
  ExternalLink,
  AlertTriangle,
  Shield,
  Zap,
  Radio,
} from 'lucide-react'

interface NetworkInfo {
  port: number
  deploymentMode?: 'cloud' | 'local'
  publicOrigin?: string | null
  tunnelUrl?: string | null
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
  const [activeTab, setActiveTab] = useState<'lan' | 'remote' | 'pwa' | 'simulator'>('lan')
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [copiedFirewall, setCopiedFirewall] = useState(false)
  const [copiedRemoteCmd, setCopiedRemoteCmd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mobile simulator state
  const [simulatorRoute, setSimulatorRoute] = useState('/dashboard')
  const [deviceModel, setDeviceModel] = useState<'android' | 'iphone' | 'tablet'>('android')
  const [isLandscape, setIsLandscape] = useState(false)

  const fetchNetwork = async () => {
    setLoading(true)
    try {
      let res = await fetch('/api/network')
      if (!res.ok) {
        res = await fetch('/api/system/network')
      }
      if (res.ok) {
        const data: NetworkInfo = await res.json()
        setNetworkInfo(data)
        // 优先采用活跃的隧道地址或 Wi-Fi 局域网地址
        const initUrl = data.tunnelUrl || data.preferredUrl || data.lanUrls?.[0]?.url || window.location.origin
        setSelectedUrl(initUrl)
        if (data.tunnelUrl && activeTab === 'lan') {
          // 若检测到异地隧道已激活，可自动引导
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

  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const firewallCmd = `netsh advfirewall firewall add rule name="CoreForge 研核 3001 端口" dir=in action=allow protocol=TCP localport=3001`

  const handleCopyFirewall = () => {
    navigator.clipboard.writeText(firewallCmd)
    setCopiedFirewall(true)
    setTimeout(() => setCopiedFirewall(false), 2000)
  }

  const remoteCmd = `npm run remote`

  const handleCopyRemoteCmd = () => {
    navigator.clipboard.writeText(remoteCmd)
    setCopiedRemoteCmd(true)
    setTimeout(() => setCopiedRemoteCmd(false), 2000)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full ${
          activeTab === 'simulator' ? 'max-w-5xl' : 'max-w-3xl'
        } overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-2xl shadow-indigo-950/50 transition-all duration-300 animate-scale-up`}
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
                <span>手机 / 平板移动端互联中心</span>
                <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  开源单机版 · 纯本地私密互联
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">
                电脑作为本地研学核心，手机在宿舍同一 Wi-Fi 或自习室外网扫码秒连、随时刷题背词
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
            onClick={() => {
              setActiveTab('lan')
              if (networkInfo?.preferredUrl) setSelectedUrl(networkInfo.preferredUrl)
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'lan'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="h-4 w-4" />
            <span>🏠 局域网极速连 (同一 Wi-Fi)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('remote')
              if (networkInfo?.tunnelUrl) setSelectedUrl(networkInfo.tunnelUrl)
            }}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'remote'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>🌍 异地公网远程连 (自习室 / 4G流量)</span>
            {networkInfo?.tunnelUrl && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>📲 手机桌面全屏沉浸 (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>💻 电脑真机仿真器</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: 局域网极速连 */}
          {activeTab === 'lan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  {qrDataUrl ? (
                    <div className="relative group text-center">
                      <div className="p-2.5 bg-white rounded-xl shadow-xl inline-block">
                        <img
                          src={qrDataUrl}
                          alt="局域网访问二维码"
                          className="w-48 h-48 rounded-lg object-contain"
                        />
                      </div>
                      <div className="mt-2.5 text-2xs text-slate-400 flex items-center justify-center gap-1">
                        <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                        <span>手机自带相机 / 浏览器直接扫码</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center text-slate-500 text-xs">
                      {loading ? '正在获取局域网地址...' : '正在生成二维码...'}
                    </div>
                  )}
                </div>

                {/* Right Panel: Address & Actions */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>本机局域网服务地址 (LAN IP:Port)</span>
                      <button
                        onClick={fetchNetwork}
                        title="重新刷新网络"
                        className="text-2xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        <span>刷新探测</span>
                      </button>
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedUrl}
                        onChange={e => setSelectedUrl(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-700 focus:border-indigo-500 bg-slate-950 px-3 py-2 text-xs font-mono text-indigo-300 outline-none"
                      />
                      <button
                        onClick={() => handleCopy(selectedUrl)}
                        className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer shrink-0"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? '已复制' : '复制'}</span>
                      </button>
                    </div>
                  </div>

                  {networkInfo && networkInfo.lanUrls && networkInfo.lanUrls.length > 1 && (
                    <div>
                      <span className="text-2xs text-slate-400">切换可用物理网卡：</span>
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

                  {/* 局域网排错助手：Windows 防火墙放行 */}
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>手机打不开？90% 是 Windows 防火墙拦截</span>
                    </div>
                    <p className="text-2xs text-slate-300 leading-relaxed">
                      Windows 默认会阻止入站网络请求。请在电脑端以管理员身份运行项目中的放行脚本，或点击下方一键复制命令在管理员终端执行：
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <code className="flex-1 bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-lg text-2xs font-mono text-slate-300 truncate">
                        {firewallCmd}
                      </code>
                      <button
                        onClick={handleCopyFirewall}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-2xs font-semibold shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedFirewall ? '已复制命令' : '一键复制放行命令'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 异地公网远程连 */}
          {activeTab === 'remote' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  {networkInfo?.tunnelUrl ? (
                    <div className="relative group text-center">
                      <div className="p-2.5 bg-white rounded-xl shadow-xl inline-block">
                        <img
                          src={qrDataUrl}
                          alt="公网远程访问二维码"
                          className="w-48 h-48 rounded-lg object-contain"
                        />
                      </div>
                      <div className="mt-2.5 text-2xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" />
                        <span>公网隧道活跃中 · 任何网络扫码立连</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-48 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs space-y-2">
                      <Radio className="w-8 h-8 text-indigo-400/60 animate-pulse" />
                      <span>尚未开启公网隧道</span>
                      <span className="text-2xs text-slate-500">在电脑终端运行一条命令即可一键开启</span>
                    </div>
                  )}
                </div>

                {/* Right Info */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span>免云服务器 · Cloudflare 免费公网穿透</span>
                      </span>
                      {networkInfo?.tunnelUrl ? (
                        <span className="text-2xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          已就绪
                        </span>
                      ) : (
                        <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          待启动
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-slate-300 leading-relaxed">
                      人在图书馆、自习室，手机使用 4G/5G 移动流量时，电脑无需公网 IP、无需购买服务器与域名，只需运行一条命令即可获得专属免费 HTTPS 安全公网网址：
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="text-2xs font-semibold text-slate-300">
                      第 1 步：在电脑端项目根目录下运行一键穿透命令：
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-emerald-400">
                        {remoteCmd}
                      </code>
                      <button
                        onClick={handleCopyRemoteCmd}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedRemoteCmd ? '已复制' : '复制命令'}
                      </button>
                    </div>
                    <div className="text-2xs text-slate-400 leading-normal">
                      💡 首次运行若缺少 cloudflared，控制台会给出官方免费下载指引，绿色无广告，随开随关。
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-1.5 text-2xs text-slate-300">
                    <div className="font-semibold text-indigo-300 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>全链路私密保障</span>
                    </div>
                    <p>
                      隧道端对端加密直连你的本地电脑，所有 Obsidian 笔记、真题练习进度完全保存在本地磁盘中，零云端中转泄露风险。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 手机 PWA 全屏沉浸指引 */}
          {activeTab === 'pwa' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-1.5">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>像原生 App 一样全屏免地址栏做题背词</span>
                </div>
                <p className="text-2xs text-slate-300 leading-relaxed">
                  系统已完整支持现代 PWA 标准。手机扫码打开后，只需将网页「添加到主屏幕」，即可消除浏览器顶部地址栏和底部控制栏，享受纯粹沉浸的考研自习环境！
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* iOS Safari */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🍏 iPhone / iPad (Safari 浏览器)</span>
                  </div>
                  <ol className="space-y-2 text-2xs text-slate-300 pl-4 list-decimal leading-relaxed">
                    <li>
                      用系统自带 <strong className="text-white">Safari 浏览器</strong> 打开扫码获得的访问链接；
                    </li>
                    <li>
                      点击屏幕底部中间的 <strong className="text-indigo-400">「分享 / 向上箭头」</strong> 图标；
                    </li>
                    <li>
                      在弹出菜单中向下滑动，选择 <strong className="text-emerald-400">「添加到主屏幕」</strong> 并点右上角「添加」即可。
                    </li>
                  </ol>
                </div>

                {/* Android Chrome */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🤖 安卓手机 (Chrome / 夸克 / 系统浏览器)</span>
                  </div>
                  <ol className="space-y-2 text-2xs text-slate-300 pl-4 list-decimal leading-relaxed">
                    <li>
                      使用 <strong className="text-white">Chrome 或系统自带浏览器</strong> 打开访问链接；
                    </li>
                    <li>
                      点击右上角 <strong className="text-indigo-400">「三个点菜单」</strong>；
                    </li>
                    <li>
                      选择 <strong className="text-emerald-400">「安装应用」</strong> 或 <strong className="text-emerald-400">「添加到主屏幕」</strong>，确认后即可从手机桌面一键启动。
                    </li>
                  </ol>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-2xs text-slate-400 flex items-center justify-between">
                <span>💡 提示：电脑端已内置防休眠守护（Keep-Awake），外出自习期间电脑不锁机断连。</span>
                <button
                  onClick={() => setActiveTab('lan')}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  去扫码连接 →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 手机仿真器 */}
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
                      Android
                    </button>
                    <button
                      onClick={() => setDeviceModel('iphone')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        deviceModel === 'iphone'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      iPhone 16
                    </button>
                    <button
                      onClick={() => setDeviceModel('tablet')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        deviceModel === 'tablet'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      平板
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

              {/* Right Controls */}
              <div className="flex-1 space-y-4 w-full">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>仿真器快速直达</span>
                  </div>
                  <p className="text-2xs text-slate-400">
                    点击在左侧手机预览中切换各个考研研学模块，实时验证移动端交互
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

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    <span>真机调试技巧</span>
                  </div>
                  <p className="text-2xs text-slate-400">
                    在电脑浏览器中按 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-emerald-400">F12</kbd> 并开启移动端设备仿真模式（Ctrl+Shift+M），可精确检查不同屏幕尺寸下的渲染效果。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
