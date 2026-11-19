import { useState } from 'react'
import {
  Smartphone,
  Wifi,
  Globe2,
  Maximize2,
  Moon,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Terminal,
  HelpCircle,
} from 'lucide-react'

export default function MobileStudyGuideCard() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'D'>('A')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  const handleOpenMobileModal = () => {
    window.dispatchEvent(new CustomEvent('open-mobile-modal'))
  }

  return (
    <section className="bento-card bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* 头部大标题横幅 */}
      <div className="p-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-indigo-50/70 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                📱 手机 / 平板随时随地跨端研学指南
              </h2>
              <span className="text-2xs font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                必学秘籍
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              将您的电脑秒变<strong>「私人研学微服务器」</strong>，笔记数据 100% 留在本地，手机躺床背词、自习室刷题实时接力！
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenMobileModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <QrCode className="h-4 w-4" />
          <span>打开手机互联控制台 (扫码)</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 核心概念认知卡 */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Laptop className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>电脑角色：</strong>本地总枢纽与私人微服务器（提供 408 真题库、大纲拓扑与本地 AI 算力）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-teal-600 shrink-0" />
          <span>
            <strong>手机角色：</strong>随身无感终端（无论同 Wi-Fi 还是 4G/5G 外网，扫码即用）
          </span>
        </div>
      </div>

      {/* 场景 Tab 切换 */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'A' as const,
              icon: Wifi,
              title: '场景 A：同寝室 / 同 Wi-Fi',
              sub: '局域网秒连 + 防火墙放行',
              color: 'text-emerald-700 border-emerald-300 bg-emerald-50/80',
            },
            {
              id: 'B' as const,
              icon: Globe2,
              title: '场景 B：自习室异地外网',
              sub: '4G/5G 免费临时隧道秒连',
              color: 'text-teal-700 border-teal-300 bg-teal-50/80',
            },
            {
              id: 'C' as const,
              icon: Maximize2,
              title: '场景 C：手机全屏沉浸',
              sub: 'PWA 无地址栏比肩 App',
              color: 'text-indigo-700 border-indigo-300 bg-indigo-50/80',
            },
            {
              id: 'D' as const,
              icon: Moon,
              title: '保障：后台常驻防休眠',
              sub: '人去自习室电脑不待机',
              color: 'text-purple-700 border-purple-300 bg-purple-50/80',
            },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeScenario === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScenario(tab.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? `${tab.color} shadow-xs font-bold ring-2 ring-emerald-500/20`
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-current' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold truncate">{tab.title}</span>
                </div>
                <div className="text-2xs text-slate-500 truncate">{tab.sub}</div>
              </button>
            )
          })}
        </div>

        {/* 场景 A 详情 */}
        {activeScenario === 'A' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold">场景 A 适用：宿舍或家里，手机和电脑连接同一个 Wi-Fi（路由器）</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  无需流量，走宿舍局域网内网传输，速度极快（0 延迟加载图片与题目），躺在床上用手机背单词、刷 408 错题最舒服！
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-2xs flex items-center justify-center font-bold">1</span>
                  <span>电脑端启动服务</span>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  在电脑上打开 CoreForge 桌面客户端，或在工程目录运行 <code className="px-1 py-0.5 rounded bg-slate-200 font-mono text-slate-900">npm run dev:all</code> 启动。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-2xs flex items-center justify-center font-bold">2</span>
                  <span>点击顶栏「手机互联」</span>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  点击软件顶部工具栏的<strong>「📱 手机互联」</strong>按钮，系统会自动检测电脑的局域网 Wi-Fi IP 并生成专属二维码。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-2xs flex items-center justify-center font-bold">3</span>
                  <span>手机微信/相机扫码即进</span>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  拿手机相机或微信直接扫描屏幕上的二维码，即可在手机浏览器中瞬间开启全功能研学工作台！
                </p>
              </div>
            </div>

            {/* 常见踩坑与一键解决 */}
            <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/70 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>排错绝招：手机扫码后提示“网页无法打开”或一直转圈？</span>
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  99% 是 Windows 防火墙拦截
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Windows 默认防火墙可能会阻断外部设备连接 3001 端口。我们为您编写了<strong>一键放行脚本</strong>，请在电脑终端（管理员命令行）执行：
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs">
                <Terminal className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="flex-1 select-all">npm run lan:allow</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run lan:allow', 'lan-allow')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCmd === 'lan-allow' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'lan-allow' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <p className="text-2xs text-amber-700">
                💡 亦可直接在项目根目录找到并右键运行 <code className="font-mono font-bold">scripts/allow-lan-port.bat</code>，执行后刷新手机即可秒开！
              </p>
            </div>
          </div>
        )}

        {/* 场景 B 详情 */}
        {activeScenario === 'B' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-teal-950">
              <Globe2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold">场景 B 适用：人去图书馆/自习室，手机用 4G/5G 流量，电脑留在宿舍</h3>
                <p className="text-xs text-teal-800 leading-relaxed">
                  手机和电脑不在同一个 Wi-Fi。<strong>无需购买阿里云/腾讯云服务器，无需买域名和做备案</strong>，使用系统自带的一键穿透隧道即可免费秒连！
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-2xs flex items-center justify-center font-bold">1</span>
                <span>离开电脑前，在终端运行穿透指令：</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 text-white font-mono text-xs">
                <Terminal className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span className="flex-1 select-all">npm run remote</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('npm run remote', 'remote')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCmd === 'remote' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'remote' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <div className="text-2xs text-slate-500 space-y-1 leading-relaxed">
                <p>• 该命令会自动通过 Cloudflare 免费安全隧道为您的电脑分配一个专享的临时 HTTPS 网址（如 <code className="text-teal-700 font-mono">https://xxxx.trycloudflare.com</code>）；</p>
                <p>• 终端会直接打印出二维码，拍照保存到手机相册，去自习室随时随地扫码即可登录您的私人研学微服务器！</p>
              </div>
            </div>
          </div>
        )}

        {/* 场景 C 详情 */}
        {activeScenario === 'C' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-950">
              <Maximize2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold">场景 C 体验升华：手机消除浏览器地址栏，变身全屏原生独立 App (PWA)</h3>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  通过浏览器「添加到主屏幕」，手机桌面上会生成带有官方图标的 CoreForge App，点开即全屏，沉浸感比肩专业考研题库软件！
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* iOS */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Apple iOS</span>
                  <span>iPhone / iPad (Safari 浏览器)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>在 <strong>Safari 浏览器</strong> 中打开手机互联链接；</li>
                  <li>点击浏览器底部的<strong>「分享」</strong>按钮（带有向上箭头的方框）；</li>
                  <li>在菜单中向下滑动，点击<strong>「添加到主屏幕」</strong>并点击添加；</li>
                  <li>回到桌面，点击 CoreForge 图标即可享受纯净全屏！</li>
                </ol>
              </div>

              {/* Android */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Android / 鸿蒙</span>
                  <span>各大安卓手机 (Chrome / 手机自带浏览器)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>在 <strong>Chrome 或手机自带浏览器</strong> 中打开链接；</li>
                  <li>点击右上角<strong>「三个点 (菜单)」</strong>；</li>
                  <li>选择<strong>「添加到主屏幕」</strong>或<strong>「安装应用」</strong>；</li>
                  <li>确认后，手机桌面直接生成纯净无地址栏的研学视窗！</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 场景 D 详情 */}
        {activeScenario === 'D' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 text-purple-950">
              <Moon className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold">后台常驻保护：人离开电脑去自习室，防止笔记本电脑待机断连</h3>
                <p className="text-xs text-purple-800 leading-relaxed">
                  很多同学人离开寝室后，笔记本合盖或待机 10 分钟自动进入睡眠，导致自习室的手机连不上。CoreForge 已内置电源保护策略！
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>客户端内置 Keep-Awake 策略</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-2xs">
                  只要 CoreForge 桌面客户端保持运行，系统主进程会自动向操作系统申请后台电源保活，防止系统在后台服务运行时自动进入深度休眠。
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-purple-600" />
                  <span>Windows 笔记本合盖设置小技巧</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-2xs">
                  若希望合上笔记本屏幕也继续提供手机刷题服务：进入 Windows「控制面板 → 电源选项 → 选择关闭笔记本计算机盖的功能」，将「接通电源时」改为<strong>「不采取任何操作」</strong>即可安心合盖！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 底部一键启动大按钮 */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            💡 遇到任何手机网络问题？点击右侧一键打开控制台，实时查看所有网卡地址与穿透状态。
          </div>
          <button
            type="button"
            onClick={handleOpenMobileModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            <span>立即弹出实时二维码控制台</span>
          </button>
        </div>
      </div>
    </section>
  )
}
