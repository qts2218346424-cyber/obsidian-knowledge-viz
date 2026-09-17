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
} from 'lucide-react'

interface NetworkInfo {
  port: number
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

export default function MobileDeviceModal({ isOpen, onClose }: MobileDeviceModalProps) {
  const [activeTab, setActiveTab] = useState<'lan' | 'remote' | 'apk'>('lan')
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchNetwork = async () => {
    setLoading(true)
    try {
      let res = await fetch('/api/network')
      if (!res.ok) {
        res = await fetch('/api/system/network')
      }
      if (res.ok) {
        const data = await res.json()
        setNetworkInfo(data)
        const initUrl = data.preferredUrl || (data.lanUrls?.[0]?.url) || window.location.origin
        setSelectedUrl(initUrl)
      } else {
        // Fallback to window host
        const port = window.location.port || '3001'
        const fallbackUrl = `http://${window.location.hostname}:${port}`
        setSelectedUrl(fallbackUrl)
      }
    } catch {
      const port = window.location.port || '3001'
      const fallbackUrl = `http://${window.location.hostname}:${port}`
      setSelectedUrl(fallbackUrl)
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
    if (selectedUrl) {
      QRCode.toDataURL(selectedUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('QR code generation error:', err))
    }
  }, [selectedUrl])

  if (!isOpen) return null

  const handleCopy = () => {
    if (!selectedUrl) return
    navigator.clipboard.writeText(selectedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900 text-slate-100 shadow-2xl shadow-indigo-950/40 animate-scale-up">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                安卓手机 / 平板端连线
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  支持 PWA & 原生 APK
                </span>
              </h2>
              <p className="text-xs text-slate-400">床头刷题、自习室伴学、移动端知识库随时调阅</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('lan')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'lan'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="h-4 w-4" />
            局域网秒连 (PWA 模式 · 推荐)
          </button>
          <button
            onClick={() => setActiveTab('remote')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'remote'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" />
            异地研学 (图书馆/5G穿透)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
              activeTab === 'apk'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            打包独立 APK (Capacitor)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {activeTab === 'lan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR Code Container */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  {qrDataUrl ? (
                    <div className="relative group">
                      <div className="p-2.5 bg-white rounded-xl shadow-lg">
                        <img
                          src={qrDataUrl}
                          alt="Mobile Access QR Code"
                          className="w-48 h-48 rounded-lg object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <QrCode className="h-3 w-3 text-indigo-400" />
                        手机微信 / 相机 / 浏览器直接扫码
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center text-slate-500 text-xs">
                      {loading ? '正在探测局域网 IP...' : '生成二维码失败'}
                    </div>
                  )}
                </div>

                {/* Connection Address & Step Guide */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>本机局域网服务地址</span>
                      <button
                        onClick={fetchNetwork}
                        title="刷新网络适配器"
                        className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        刷新
                      </button>
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={selectedUrl}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-indigo-300 select-all outline-none"
                      />
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? '已复制' : '复制'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multiple Interfaces switch if available */}
                  {networkInfo && networkInfo.lanUrls.length > 1 && (
                    <div>
                      <span className="text-[11px] text-slate-400">切换网络网卡：</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {networkInfo.lanUrls.map(item => (
                          <button
                            key={item.url}
                            onClick={() => setSelectedUrl(item.url)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all ${
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

                  {/* 3 Step Instant Setup */}
                  <div className="space-y-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      3 步立享移动端原生体验（无需安装任何软件）：
                    </div>
                    <ul className="space-y-1.5 text-slate-400 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-400">1.</span>
                        <span>手机连接与电脑相同的 <b>Wi-Fi</b>（或手机开启热点电脑连接）。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-400">2.</span>
                        <span>手机浏览器扫码或输入上方地址访问。</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-400">3.</span>
                        <span>
                          在浏览器菜单中点击 <b>「添加到主屏幕」</b>（Add to Home Screen）。
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Advantage Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">手机 0 耗电</div>
                    <div className="text-[11px] text-slate-400">AI 与索引算力全由电脑承担</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">全屏沉浸刷题</div>
                    <div className="text-[11px] text-slate-400">无浏览器地址栏，原生手势响应</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">实时双向同步</div>
                    <div className="text-[11px] text-slate-400">手机做错的题电脑端即时归档</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <div className="font-semibold text-indigo-300 flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  图书馆 / 自习室 / 4G 5G 远程访问方案
                </div>
                <p className="text-slate-300 leading-relaxed">
                  当您离开宿舍或家中 Wi-Fi，在图书馆或教室使用手机 5G 刷题做题时，可通过以下两种最主流方式无障碍远程连线回您的电脑：
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-sm">方案 A：Cloudflare Tunnel（极速推荐）</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      免费 · HTTPS · 0配置
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    在电脑端命令行执行一句话，即可生成专属安全的临时 HTTPS 网址：
                  </p>
                  <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto select-all">
                    npx cloudflared tunnel --url http://localhost:3001
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    终端会打印出一个 <code className="text-indigo-300">https://xxxx.trycloudflare.com</code> 网址，手机随时随地输入即可登录！
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-sm">方案 B：Tailscale 虚拟组网</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      稳定 · 终生固定 IP
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    电脑与手机均安装 <b>Tailscale</b>（免费应用），登录同个账号。
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>电脑将分配一个固定内网 IP（如 <code className="text-indigo-300">100.x.x.x</code>）</li>
                    <li>手机在任何地方输入 <code className="text-indigo-300">http://100.x.x.x:3001</code> 即可永续秒开！</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-800/40 space-y-2">
                <div className="font-semibold text-violet-300 flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  Capacitor 原生 Android APK 编译流程
                </div>
                <p className="text-slate-300 leading-relaxed">
                  本项目已完全配置好 <code className="text-violet-300">capacitor.config.ts</code>。如果您想生成独立的 <code className="text-violet-300">CoreForge.apk</code> 安装包安装到手机，按照以下步骤即可完成：
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="font-semibold text-slate-200">打包操作命令清单：</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-slate-400 text-[11px] mb-1">1. 构建静态资源与服务端：</div>
                    <pre className="p-2 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-200 select-all">
                      npm run build:all
                    </pre>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] mb-1">2. 添加 Android 原生工程（首次执行）：</div>
                    <pre className="p-2 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-200 select-all">
                      npm install @capacitor/core @capacitor/cli @capacitor/android
                      npx cap add android
                    </pre>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px] mb-1">3. 同步代码并打开 Android Studio 导出 APK：</div>
                    <pre className="p-2 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-200 select-all">
                      npx cap sync android
                      npx cap open android
                    </pre>
                  </div>
                </div>
                <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                  💡 在 Android Studio 中点击 <b>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</b>，即可在输出目录获得生成的安装包！
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-6 py-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>服务端端口已绑定 0.0.0.0，局域网跨域已放通</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
