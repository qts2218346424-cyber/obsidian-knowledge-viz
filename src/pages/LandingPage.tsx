import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  Download,
  Laptop,
  Smartphone,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Cpu,
  GraduationCap,
  Network,
  ClipboardList,
  Clock,
  ArrowLeft,
  X,
  LogIn,
  UserPlus,
  Play,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface DownloadInfo {
  desktop: {
    available: boolean
    filename?: string
    version?: string
    size?: string
    releaseDate?: string
    downloadUrl?: string
    platform?: string
  }
  android: {
    available: boolean
    filename?: string
    version?: string
    size?: string
    pwaSupported?: boolean
    downloadUrl?: string
  }
  web: {
    available: boolean
    version?: string
  }
}

type ModeType = '408' | 'math' | 'ai'

export default function LandingPage() {
  const { isAuthenticated, login, register, initAdmin, initialized } = useAuth()
  const navigate = useNavigate()

  // 3D 金属胶囊当前切换模式
  const [activeMode, setActiveMode] = useState<ModeType>('408')

  // 下载信息与二维码
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [currentUrl, setCurrentUrl] = useState<string>('')

  // Subframe 标志性“双栏交互工作台弹窗”显隐控制
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login')
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // 吐司反馈提示
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 2800)
  }

  useEffect(() => {
    // 获取安装包元数据
    fetch('/api/downloads/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setDownloadInfo(data)
        }
      })
      .catch(() => {
        setDownloadInfo({
          desktop: {
            available: true,
            filename: 'Knowledge-Viz-Setup-1.2.0.exe',
            version: '1.2.0',
            size: '109.5 MB',
            downloadUrl: '/api/downloads/desktop',
            platform: 'Windows 64位',
          },
          android: { available: false, pwaSupported: true },
          web: { available: true, version: '1.4.0' },
        })
      })

    // 生成移动端访问二维码
    const origin = window.location.origin
    setCurrentUrl(origin)
    QRCode.toDataURL(origin, {
      width: 170,
      margin: 1,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {})
  }, [])

  // 触发桌面端下载
  const handleDownloadDesktop = () => {
    setDownloading(true)
    showToast('正在为您拉取 Windows 客户端安装包...')
    const link = document.createElement('a')
    link.href = '/api/downloads/desktop'
    link.download = downloadInfo?.desktop?.filename || 'Knowledge-Viz-Setup-1.2.0.exe'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setDownloading(false), 2600)
  }

  // 模态框登录/注册快速提交
  const handleModalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (!modalUsername.trim() || !modalPassword) {
      setModalError('请填写完整账号与密码')
      return
    }

    setModalLoading(true)
    try {
      if (!initialized) {
        await initAdmin(modalUsername.trim(), modalPassword)
      } else if (modalTab === 'register') {
        await register(modalUsername.trim(), modalPassword)
      } else {
        await login(modalUsername.trim(), modalPassword)
      }
      showToast('验证成功，正在进入研学工作台...')
      setAuthModalOpen(false)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setModalError(err.message || '操作失败，请重试')
    } finally {
      setModalLoading(false)
    }
  }

  // 3D 模式切换配置映射
  const modeConfigs = {
    '408': {
      title: '研你所学，核力致胜。',
      subtitle: '408 计算机综合 · 智能双核研学工作台。',
      badge: '当前模式：408 计算机综合 —— 数据结构、计组、操作系统与计网真题即时批改与错因归因。',
      heroSubject: '408 计算机学科专业基础综合',
      cardDetail: 'AVL 树、Cache 组相连、PV 原语与 TCP 拥塞控制。知识点与真题双链织网。',
    },
    math: {
      title: '定理推导，一步不漏。',
      subtitle: '全国考研数学 · 高数、线代与概率智能解析。',
      badge: '当前模式：全国考研数学 —— 内置 KaTeX 渲染引擎，复杂极限、矩阵二次型与微积分步骤推导。',
      heroSubject: '全国硕士研究生考研数学 (数一/二/三)',
      cardDetail: '严格数学排版符号体系，AI 分步点拨证明思路，告别跳步与盲目看答案。',
    },
    ai: {
      title: '多 Agent 协同伴学。',
      subtitle: '本地 Claude Code / Codex 与云端大模型无缝联动。',
      badge: '当前模式：本地优先多智能体 —— 支持离线本地知识库检索、Agent 循环推演与沉浸答疑。',
      heroSubject: '本地优先与多 Agent 协同导师',
      cardDetail: '无厂商格式锁定，底层纯净 Markdown，支持本地终端与云端推理双轮驱动。',
    },
  }

  return (
    <div className="min-h-screen subframe-landing-bg text-[#171719] font-sans flex flex-col selection:bg-zinc-900 selection:text-white relative">
      {/* 浮动吐司通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#18181b] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl border border-white/15 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/*  */}
      <header className="relative z-30 w-full max-w-[1280px] mx-auto px-5 sm:px-8 pt-4 pb-3 flex items-center justify-between">
        {/* 左侧 Logo 标识 */}
        <Link to="/" className="group flex items-center gap-2.5 focus:outline-none">
          <div className="w-7 h-7 rounded-lg bg-[#18181b] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="17" height="5.5" rx="1" fill="currentColor" />
              <path d="M4 12.2H14.5L4 22.5V12.2Z" fill="currentColor" />
              <circle cx="17.8" cy="17.8" r="3.4" fill="currentColor" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] tracking-tight text-[#171719]">CoreForge</span>
            <span className="text-[11px] font-semibold text-zinc-500 bg-black/[0.04] px-1.5 py-0.5 rounded border border-black/[0.05]">
              研核
            </span>
          </div>
        </Link>

        {/* 中部磨砂玻璃胶囊导航 */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/35 backdrop-blur-md border border-white/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <a
            href="#features"
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            研学特性
          </a>
          <a
            href="#subjects"
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            学科双核
          </a>
          <a
            href="#download"
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            多端下载
          </a>
          <a
            href="#preview"
            onClick={(e) => {
              e.preventDefault()
              setAuthModalOpen(true)
            }}
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            工作台实景
          </a>
        </nav>

        {/* 右侧操作胶囊 */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/45 backdrop-blur-md border border-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-[#18181b] text-white hover:bg-[#27272a] transition-all shadow-sm cursor-pointer"
            >
              <span>进入研学空间</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setModalTab('login')
                  setAuthModalOpen(true)
                }}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#18181b] hover:bg-black/5 transition-colors cursor-pointer"
              >
                登录账号
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('register')
                  setAuthModalOpen(true)
                }}
                className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-[#18181b] text-white hover:bg-[#27272a] transition-all shadow-sm cursor-pointer"
              >
                免费体验
              </button>
            </>
          )}
        </div>
      </header>

      {/*  */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-10 sm:pt-14 pb-16 text-center my-auto">
        {/* Subframe 标志性 3D 镀铬金属硬件药丸切换器 (3D Metallic Chrome Switcher) */}
        <div className="relative mb-10 sm:mb-12 select-none">
          <div className="metallic-ambient-glow" />

          <div className="metallic-housing relative z-10">
            <div className="metallic-bezel flex items-center gap-1 sm:gap-2">
              {/* Tab 1: 408 计算机综合 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('408')
                  showToast('已切换至 408 计算机学科综合研学模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === '408' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Cpu className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>408 计算机</span>
              </button>

              {/* Tab 2: 考研数学 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('math')
                  showToast('已切换至 全国考研数学 智能推导模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'math' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>考研数学</span>
              </button>

              {/* Tab 3: 本地 AI 伴学 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ai')
                  showToast('已切换至 本地双核多 Agent 协同模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[12px] text-[13px] sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'ai' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>双核 Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subframe 标志性超大字号主标题 */}
        <h1 className="text-[44px] sm:text-[64px] md:text-[76px] font-bold tracking-[-0.045em] leading-[1.04] text-[#171719] mb-4 max-w-4xl mx-auto">
          {modeConfigs[activeMode].title}
        </h1>

        {/* 细腻质感副标题 */}
        <p className="text-[19px] sm:text-[26px] md:text-[30px] font-normal tracking-[-0.025em] leading-[1.25] text-[#8d9096] max-w-[720px] mb-8">
          {modeConfigs[activeMode].subtitle}
        </p>

        {/* Subframe 动态模式状态胶囊 (mode-live-pill) */}
        <div className="mb-9 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-[12px] text-[#52525b] max-w-2xl backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
          <span className="truncate">{modeConfigs[activeMode].badge}</span>
        </div>

        {/* Subframe 风格经典 CTA 按钮行 */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadDesktop}
            disabled={downloading}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[11px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[14px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>
              {downloading ? '正在拉取安装包...' : '下载电脑客户端 (Windows 64位)'}
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono">
              {downloadInfo?.desktop?.size || '109 MB'}
            </span>
          </button>

          <a
            href="#download"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[11px] bg-[#e3e4e7] hover:bg-[#d8d9dd] text-[#18181b] text-[14px] font-medium border border-black/[0.05] transition-all active:scale-[0.98]"
          >
            <Smartphone className="w-4 h-4 text-[#27272a]" />
            <span>移动端扫码</span>
          </a>

          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[11px] bg-white/80 hover:bg-white text-[#18181b] text-[14px] font-medium border border-zinc-200/90 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <Globe className="w-4 h-4 text-zinc-600" />
            <span>免安装网页版</span>
          </button>
        </div>
      </section>

      {/*  */}
      <section id="preview" className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-20">
        <div className="rounded-[18px] bg-[#e3e3e6] p-2.5 sm:p-3 shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-white/60">
          <div className="w-full bg-white rounded-[13px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.08] overflow-hidden text-left select-none">
            {/* 工作台顶部仿 Chrome 导航条 */}
            <div className="h-9 px-4 bg-[#fafafa] border-b border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-3.5">
                <span className="font-semibold text-zinc-900">408与考研数学工作台</span>
                <span className="text-zinc-400">·</span>
                <span>知识拓扑</span>
                <span className="text-zinc-800 font-medium">+ 真题导入</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-zinc-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{modeConfigs[activeMode].heroSubject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-900 font-medium text-[10px]">
                  沉浸研学
                </span>
                <span className="text-[10px] text-zinc-400">SM-2 调度活跃</span>
              </div>
            </div>

            {/* 三栏式实景编辑器视窗 */}
            <div className="grid grid-cols-12 min-h-[360px] bg-white text-[11px]">
              {/* 左栏：组件库 / 学科章节树 */}
              <div className="col-span-12 md:col-span-3 border-r border-zinc-200/80 p-3 bg-[#fbfbfc] flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3 h-3 text-zinc-400" />
                    <span className="text-[11px]">搜索考点与真题...</span>
                  </div>
                  <span className="text-zinc-400 text-xs">⌘K</span>
                </div>

                <div className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-1">
                  核心真题题库
                </div>

                <div className="space-y-1">
                  <div className="p-2 rounded-lg bg-zinc-100/80 border border-zinc-200/90 text-zinc-800 font-medium flex items-center justify-between">
                    <span>🌲 二叉平衡树 AVL 旋转</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">真题</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center justify-between">
                    <span>⚙️ Cache 组相连映射机制</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded">408</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center justify-between">
                    <span>📐 泰勒公式与高阶无穷小</span>
                    <span className="text-[10px] text-sky-600 bg-sky-50 px-1 rounded">高数</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center justify-between">
                    <span>🎲 二维正态分布协方差</span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded">概率</span>
                  </div>
                </div>
              </div>

              {/* 中栏：真题演练与 LaTeX 公式推导画板 */}
              <div className="col-span-12 md:col-span-6 p-4 sm:p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white font-mono text-[10px]">
                      2023 年 408 真题 · 第 41 题
                    </span>
                    <span className="text-zinc-400 text-[10px]">难度：⭐⭐⭐⭐</span>
                  </div>

                  <h3 className="text-[14px] font-semibold text-zinc-900 leading-snug mb-3">
                    已知二叉排序树中结点关键码各不相同，若对其进行中序遍历可得到升序序列。试分析 AVL 树插入结点失衡后的四种旋转调整策略。
                  </h3>

                  {/* 步骤启发式点拨卡片 */}
                  <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI 启发式答疑分析：</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed text-[11px]">
                      LL 旋转只需顺时针单旋一次，关键在于将被破坏平衡的根结点右子树挂接为调整后根结点的左孩子。
                    </p>
                    <div className="p-2 rounded bg-zinc-900 text-emerald-300 font-mono text-[10.5px]">
                      {'平衡因子 BF = 左子树高度 - 右子树高度 ∈ {-1, 0, 1}'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>按 ⌘+Enter 提交作答并执行 AI 批改</span>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="text-zinc-900 font-semibold hover:underline cursor-pointer"
                  >
                    在完整工作台中打开 →
                  </button>
                </div>
              </div>

              {/* 右栏：知识网络属性检查器 (Inspector) */}
              <div className="col-span-12 md:col-span-3 border-l border-zinc-200/80 p-3 bg-[#fbfbfc] flex flex-col gap-3">
                <div className="font-semibold text-zinc-900 pb-1.5 border-b border-zinc-200">
                  知识点属性检查器
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">SM-2 艾宾浩斯记忆熟练度</div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[82%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>熟练度: 82%</span>
                    <span>下次复习: 3 天后</span>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">Obsidian 双链网络关联</div>
                  <div className="space-y-1">
                    <div className="px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700">
                      🔗 [[平衡二叉树.md]]
                    </div>
                    <div className="px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700">
                      🔗 [[红黑树对比要点.md]]
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">错因归因记录</div>
                  <div className="p-2 rounded bg-amber-50/60 border border-amber-200/80 text-amber-900 text-[10.5px]">
                    混淆了 LR 旋转的双旋次序（应先对左孩子左旋，再对根节点右旋）。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      <section id="download" className="py-20 border-t border-zinc-200/80 bg-[#f4f4f6]/80 relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
              全平台多端覆盖 · 随时随地进入心流
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#71717a]">
              无论主力电脑深度刷题，还是手机随时背闪卡，同一套知识库全场景自由切换。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* 1. Windows 桌面旗舰端 */}
            <div className="rounded-[16px] bg-white border-2 border-zinc-900/10 p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#18181b] text-white text-[11px] font-bold tracking-wide shadow-sm">
                主力备考推荐
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                    v{downloadInfo?.desktop?.version || '1.2.0'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mb-2">Windows 桌面客户端</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                  笔记本与台式机首选。本地优先（Local-First），直接读取本机 Obsidian 知识库，离线断网亦可全量运行，支持本地 Claude Code / Codex CLI 智能体联动。
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700 mb-8 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>本地数据自主掌控，无厂商闭源格式锁定</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>独立运行壳，全屏沉浸防干扰</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>内嵌极速后端，安装即用无需复杂配置</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleDownloadDesktop}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1f] hover:bg-[#2a2a2e] active:scale-[0.98] py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading
                      ? '正在启动下载...'
                      : `一键下载 Windows 安装包 (${downloadInfo?.desktop?.size || '109 MB'})`}
                  </span>
                </button>
                <div className="mt-2 text-center text-[11px] text-zinc-400">
                  支持 Windows 10 / 11 (64位) · 点击直接下载
                </div>
              </div>
            </div>

            {/* 2. 移动端 (Android / PWA 扫码) */}
            <div className="rounded-[16px] bg-white border border-zinc-200/80 p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                    手机/平板扫码
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mb-2">Android / 移动伴学端</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  自习室、床头背卡片神器。单手大拇指做题与翻转闪卡，手机只负责轻量渲染，发热极低、续航持久。
                </p>

                {/* 二维码展示区 */}
                <div className="my-4 rounded-xl bg-zinc-50 p-4 border border-zinc-200/90 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shrink-0 border border-zinc-200 shadow-xs">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="手机扫码二维码" className="h-24 w-24 object-contain" />
                    ) : (
                      <div className="h-24 w-24 flex items-center justify-center text-[10px] text-zinc-400">
                        生成中...
                      </div>
                    )}
                  </div>
                  <div className="text-left text-xs space-y-1">
                    <p className="font-semibold text-zinc-900">📱 扫码即刻体验：</p>
                    <p className="text-zinc-500 text-[11px]">1. 手机微信或自带浏览器扫描二维码</p>
                    <p className="text-zinc-500 text-[11px]">
                      2. 点击菜单 <strong className="text-zinc-900">「添加到主屏幕」</strong>
                    </p>
                    <p className="text-emerald-600 text-[11px] font-semibold">
                      ✨ 3 秒秒变手机 App，沉浸全屏！
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <a
                  href="/api/downloads/android"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-300 hover:border-zinc-400 bg-zinc-100 hover:bg-zinc-200/70 py-3 px-4 text-xs font-semibold text-zinc-800 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 Android 原生 APK 安装包</span>
                </a>
                <div className="mt-2 text-center text-[11px] text-zinc-400">
                  支持安卓 8.0 及以上机型 / 鸿蒙系统
                </div>
              </div>
            </div>

            {/* 3. Web 云端版 */}
            <div className="rounded-[16px] bg-white border border-zinc-200/80 p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md">
                    免安装秒开
                  </span>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mb-2">Web 云端工作台</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                  无需安装任何客户端。在图书馆公用电脑或 iPad 随时随地打开浏览器学习。内置多用户独立沙箱隔离与防误删改保护。
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700 mb-8 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>0 门槛跨端即开，云端多用户鉴权隔离</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>做题与错题归因实时记录，多端同步</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>分级权限管理（超级管理员 / 学生只读研学）</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1f] hover:bg-[#2a2a2e] active:scale-[0.98] py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{isAuthenticated ? '直接进入研学空间' : '前往登录 / 注册空间'}</span>
                </button>
                <div className="mt-2 text-center text-[11px] text-zinc-400">
                  支持 Chrome, Edge, Safari, 现代移动浏览器
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      <section id="subjects" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            DUAL-CORE ARCHITECTURE
          </span>
          <h2 className="mt-1 text-3xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
            硬核深耕考研两大核心科目
          </h2>
          <p className="mt-3 text-sm text-[#71717a]">
            拒绝泛泛的通用笔记本，CoreForge 为 408 计算机与考研数学量身定制。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[16px] bg-white border border-zinc-200/80 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                408
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">408 计算机学科专业基础综合</h3>
                <span className="text-xs text-zinc-500">数据结构 · 计组 · 操作系统 · 计网</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-5">
              真题分项刷透并自动归因。AVL树/红黑树/B+树、流水线冒险与 Cache 映射、PV 原语与死锁检测、OSI 与 TCP 协议栈，全方位打通。
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🌲 算法与数据结构
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                ⚙️ 计算机组成原理
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🖥️ 操作系统原理
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🌐 计算机网络通信
              </div>
            </div>
          </div>

          <div className="rounded-[16px] bg-white border border-zinc-200/80 p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                ∑
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">全国硕士研究生考研数学</h3>
                <span className="text-xs text-zinc-500">高等数学 · 线性代数 · 概率统计</span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-5">
              严格遵循 KaTeX 数学公式渲染标准。高等数学泰勒公式与微分方程、线性代数矩阵特征值与二次型、概率论多维随机变量，AI 拆解思路启发式点拨。
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                📐 微积分与高等数学
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                📊 线性代数矩阵空间
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🎲 概率论与数理统计
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                ✍️ 步骤启发式证明推导
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      {authModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false)
          }}
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 transition-all"
        >
          <div className="relative w-full max-w-[940px] rounded-[18px] bg-[#e3e3e6] p-2.5 sm:p-3 shadow-[0_28px_70px_rgba(0,0,0,0.45)] border border-white/60 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden animate-fade-in-up">
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 z-40 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
              title="关闭弹窗"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 左栏：身份认证与进入系统 */}
            <div className="lg:col-span-5 bg-[#efefef] rounded-[14px] p-6 sm:p-7 flex flex-col justify-between text-left border border-white/70">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#18181b] text-white flex items-center justify-center shadow-sm mb-5">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="4" width="17" height="5.5" rx="1" fill="currentColor" />
                    <path d="M4 12.2H14.5L4 22.5V12.2Z" fill="currentColor" />
                    <circle cx="17.8" cy="17.8" r="3.4" fill="currentColor" />
                  </svg>
                </div>

                <h2 className="text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.03em] font-bold text-[#18181b] mb-4">
                  {modalTab === 'register' ? '注册研学空间' : '进入研核空间'}<br />
                  <span className="text-[#8d9096] font-normal">CoreForge Workspace</span>
                </h2>

                <ul className="space-y-2 mb-6 text-[12px] text-[#27272a] font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>本地优先，支持 Obsidian 知识库</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>SM-2 艾宾浩斯智能记忆闪卡</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>408 与 考研数学真题智能批改</span>
                  </li>
                </ul>

                {modalError && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {modalError}
                  </div>
                )}

                {/* 登录表单 */}
                <form onSubmit={handleModalAuthSubmit} className="space-y-2.5">
                  <div>
                    <input
                      type="text"
                      required
                      value={modalUsername}
                      onChange={(e) => setModalUsername(e.target.value)}
                      placeholder="用户名 / 账号 (如 admin)"
                      className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      value={modalPassword}
                      onChange={(e) => setModalPassword(e.target.value)}
                      placeholder="登录密码 (至少 6 位)"
                      className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full py-2.5 px-4 rounded-[9px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                  >
                    {modalLoading ? '正在验证...' : modalTab === 'register' ? '注册账号并登入' : '登入研学空间'}
                  </button>
                </form>

                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <button
                    type="button"
                    onClick={() => setModalTab(modalTab === 'login' ? 'register' : 'login')}
                    className="hover:text-zinc-900 underline cursor-pointer"
                  >
                    {modalTab === 'login' ? '没有账号？立即自主注册' : '已有账号？返回登录'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalUsername('admin')
                      setModalPassword('AdminPassword123!')
                    }}
                    className="text-amber-700 font-semibold hover:underline cursor-pointer"
                  >
                    填入站长账号
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 mt-4 text-[10.5px] text-zinc-400">
                支持超级管理员与学生只读多角色隔离
              </div>
            </div>

            {/* 右栏：工作台实景画板微型预览 */}
            <div className="lg:col-span-7 flex items-center justify-center p-2 overflow-hidden">
              <div className="w-full bg-white rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-black/[0.08] p-3 text-left">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3 text-[10px] text-zinc-500">
                  <span className="font-semibold text-zinc-800">研核工作台 · 实时画板</span>
                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/90 text-xs text-zinc-700">
                    <div className="font-semibold text-zinc-900 mb-1">
                      408 真题 · 2024 数据结构大题
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      正在利用双向拓扑图谱分析二叉树线索化遍历算法与时空复杂度...
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-400 text-xs">
                    <div className="font-semibold text-zinc-900 mb-1">考研数学一 · 微积分中值定理</div>
                    <p className="text-zinc-600 text-[11px]">
                      Cauchy 中值定理辅助函数构造：F(x) = f(x) - [f(b)-f(a)]/[g(b)-g(a)] * g(x)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>支持一键下载本地客户端离线使用</span>
                  <span className="font-mono text-zinc-600">v1.4.0-stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  */}
      <footer className="border-t border-zinc-200/90 bg-white py-10 text-zinc-500 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#18181b] text-white flex items-center justify-center text-[10px] font-bold">
              C
            </div>
            <span className="font-semibold text-zinc-800">CoreForge 研核</span>
            <span>· 408 & 考研数学 智能双核研学工作台</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-600 font-medium">
            <a href="#download" className="hover:text-zinc-900 transition-colors">
              客户端下载
            </a>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              登录研学空间
            </button>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-400 font-mono">Local-First & Multi-Agent Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  )
}