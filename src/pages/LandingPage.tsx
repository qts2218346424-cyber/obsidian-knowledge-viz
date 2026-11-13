import { avlTreeCourseware } from '../data/coursewares/avlTree'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  Download,
  Laptop,
  Smartphone,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Cpu,
  GraduationCap,
  Landmark,
  Network,
  ClipboardList,
  Clock,
  ArrowLeft,
  X,
  LogIn,
  UserPlus,
  Play,
  ExternalLink,
  KeyRound,
  HelpCircle,
  ShieldAlert,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MathTrialDemo, AgentTrialDemo } from './landing/TrialDemos'
import { PoliticsTrialDemo } from './landing/PoliticsTrialDemo'
import { getSecurityQuestion, resetPassword } from '../services/auth'

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

type ModeType = '408' | 'math' | 'politics' | 'english' | 'ai'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)

export default function LandingPage() {
  const { isAuthenticated, login, register, initAdmin, initialized } = useAuth()
  const navigate = useNavigate()

  // 3D 金属胶囊当前切换模式
  const [activeMode, setActiveMode] = useState<ModeType>('408')
  // 政治时空大屏试玩当前选中的节点索引 (0: 1851 金田起义, 1: 1935 遵义会议, 2: 1945 中共七大)

  // 🎮 手机/全平台试玩全屏沉浸视窗显隐
  const [fullScreenSandbox, setFullScreenSandbox] = useState(false)

  // 监听全屏试玩时的背景滚动锁定与 Esc 退出
  useEffect(() => {
    if (!fullScreenSandbox) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullScreenSandbox(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullScreenSandbox])

  // 下载信息与二维码
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [currentUrl, setCurrentUrl] = useState<string>('')

  // Subframe 标志性“双栏交互工作台弹窗”显隐控制
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalConfirmPassword, setModalConfirmPassword] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // 找回密码（Forgot Password）相关交互状态
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [forgotUsername, setForgotUsername] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null)
  const [hasSecurityQuestion, setHasSecurityQuestion] = useState<boolean>(false)
  const [hasRecoveryCode, setHasRecoveryCode] = useState<boolean>(false)
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [useRecoveryCodeMode, setUseRecoveryCodeMode] = useState(false)
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null)

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
            // 接口不可用时不再展示硬编码的过期版本号与安装包体积
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

    if (modalTab === 'register' || !initialized) {
      if (modalPassword.length < 6) {
        setModalError('密码至少需要 6 位')
        return
      }
      if (modalTab === 'register' && modalPassword !== modalConfirmPassword) {
        setModalError('两次输入的密码不一致')
        return
      }
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

  // 找回密码第一步：查询密保问题
  const handleQuerySecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    if (!forgotUsername.trim()) {
      setModalError('请输入需要找回密码的用户名')
      return
    }
    setModalLoading(true)
    try {
      const res = await getSecurityQuestion(forgotUsername.trim())
      setSecurityQuestion(res.securityQuestion)
      setHasSecurityQuestion(res.hasSecurityQuestion)
      setHasRecoveryCode(res.hasRecoveryCode)
      setForgotStep(2)
      if (!res.hasSecurityQuestion) {
        setUseRecoveryCodeMode(true)
      } else {
        setUseRecoveryCodeMode(false)
      }
    } catch (err: any) {
      setModalError(err.message || '查询密保信息失败，请检查用户名是否输入正确')
    } finally {
      setModalLoading(false)
    }
  }

  // 找回密码第二步：提交验证并重置新密码
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    if (newPasswordInput.length < 6) {
      setModalError('新密码长度不能少于 6 位')
      return
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setModalError('两次输入的新密码不一致')
      return
    }
    if (!useRecoveryCodeMode && !securityAnswer.trim()) {
      setModalError('请输入安全密保答案')
      return
    }
    if (useRecoveryCodeMode && !recoveryCodeInput.trim()) {
      setModalError('请输入备用安全救援码（例如 CF-XXXX-XXXX）')
      return
    }

    setModalLoading(true)
    try {
      const res = await resetPassword({
        username: forgotUsername.trim(),
        answer: useRecoveryCodeMode ? undefined : securityAnswer.trim(),
        recoveryCode: useRecoveryCodeMode ? recoveryCodeInput.trim() : undefined,
        newPassword: newPasswordInput.trim(),
      })
      showToast('密码重置成功，请使用新密码登录')
      setResetSuccessMessage(res.message)
      setModalUsername(forgotUsername.trim())
      setModalPassword(newPasswordInput.trim())
      setTimeout(() => {
        setModalTab('login')
        setForgotStep(1)
        setSecurityAnswer('')
        setRecoveryCodeInput('')
        setNewPasswordInput('')
        setConfirmPasswordInput('')
        setResetSuccessMessage(null)
      }, 1600)
    } catch (err: any) {
      setModalError(err.message || '重置密码失败，请核对凭证')
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
    politics: {
      title: '时空浩瀚，史纲通达。',
      subtitle: '考研政治 · 全屏史纲时空轴与肖秀荣精选题库。',
      badge: '当前模式：考研政治 —— 阿里 DataV 高精矢量中国地图、1840~2024 近代史会议、肖秀荣 1000 题与考点遮罩背诵。',
      heroSubject: '考研政治 · 史纲时空大本营与 1000 题精粹',
      cardDetail: '金田起义、遵义会议、中共七大与十一届三中全会。时空地图发光轨迹与考点一键收藏。',
    },
    english: {
      title: '笔耕不辍，下笔有神。',
      subtitle: '考研英语 · 高分作文模板与 AI 智能多维批改。',
      badge: '当前模式：考研英语 —— 英语一图画/英语二图表万能三段论模板、20 分考研标准分换算、平庸词升级与真题长难句剖析。',
      heroSubject: '考研英语 · 全题型研学中枢与 AI 智能批改',
      cardDetail: '建议信、道歉信、招募告示；四维极速智能精批 (~1.2s)；2000+ 大纲核心词汇艾宾浩斯复盘。',
    },
    ai: {
      title: '分科 AI 导师，随时陪学。',
      subtitle: '结合个人错题与考研大纲，提供实时解析与备考规划。',
      badge: '当前模式：分科 AI 导师 —— 涵盖 408、高数、政治、英语与备考规划，直连你的错题本与笔记。',
      heroSubject: '分科专属 AI 导师伴学中枢',
      cardDetail: '笔记随时可导出，AI 导师紧贴考研大纲答疑解惑，让每一次刷题都有回响。',
    },
  }

  return (
    <div className="min-h-screen subframe-landing-bg text-[#171719] font-sans flex flex-col selection:bg-slate-900 selection:text-white relative overflow-x-hidden w-full max-w-full">
      {/* 浮动吐司通知 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#18181b] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-white/15 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/*  */}
      <header className="relative z-30 w-full max-w-[1280px] mx-auto px-5 sm:px-8 pt-4 pb-3 flex items-center justify-between">
        {/* 左侧 Logo 标识 */}
        <Link to="/" className="group flex items-center gap-2.5 focus:outline-none">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shadow-xs ring-1 ring-rose-200/70 group-hover:scale-105 transition-transform shrink-0">
            <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] tracking-tight text-[#171719]">CoreForge</span>
            <span className="text-2xs font-semibold text-slate-500 bg-black/[0.04] px-1.5 py-0.5 rounded border border-black/[0.05]">
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
            考研四核
          </a>
          <a
            href="#download"
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            电脑端与扫码
          </a>
          <a
            href="#preview"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="px-3.5 py-1 rounded-lg text-[13px] font-medium text-[#6e7178] hover:text-[#171719] hover:bg-white/50 transition-colors"
          >
            动手试玩
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
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-[13px] font-medium text-[#18181b] hover:bg-black/5 transition-colors cursor-pointer"
              >
                登录账号
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('register')
                  setAuthModalOpen(true)
                }}
                className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-[13px] font-medium bg-[#18181b] text-white hover:bg-[#27272a] transition-all shadow-sm cursor-pointer"
              >
                免费体验
              </button>
            </>
          )}
        </div>
      </header>

      {/*  */}
      <section className="relative z-10 w-full min-w-0 flex-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-5 sm:pt-14 pb-8 sm:pb-16 text-center my-auto">
        {/* Subframe 标志性 3D 镀铬金属硬件药丸切换器 (3D Metallic Chrome Switcher, 移动端紧凑自适应) */}
        <div className="relative w-full max-w-full flex justify-center mb-4 sm:mb-12 select-none">
          <div className="metallic-ambient-glow max-w-full" />

          <div className="metallic-housing relative z-10 max-w-full">
            <div className="metallic-bezel flex items-center gap-0.5 sm:gap-2 p-0.5 sm:p-1 max-w-full overflow-x-auto no-scrollbar">
              {/* Tab 1: 408 计算机综合 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('408')
                  showToast('已切换至 408 计算机学科综合研学模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-0.5 sm:gap-2 px-1.5 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                  activeMode === '408' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Cpu className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>408 计算机</span>
              </button>

              {/* Tab 2: 考研数学 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('math')
                  showToast('已切换至 全国考研数学 智能推导模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-0.5 sm:gap-2 px-1.5 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                  activeMode === 'math' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>考研数学</span>
              </button>

              {/* Tab 3: 考研政治 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('politics')
                  showToast('已切换至 考研政治 全屏史纲时空轴模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-5 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                  activeMode === 'politics' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Landmark className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>考研政治</span>
              </button>

              {/* Tab 4: 考研英语 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('english')
                  showToast('已切换至 考研英语 作文模板与智能批改模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-5 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                  activeMode === 'english' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>考研英语</span>
              </button>

              {/* Tab 5: 本地 AI 伴学 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ai')
                  showToast('已切换至 分科专属 AI 导师陪学模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-0.5 sm:gap-2 px-1.5 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                  activeMode === 'ai' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span>AI 导师</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subframe 标志性主标题 (移动端紧凑精致 21px，桌面端澎湃大字) */}
        <h1 className="text-[21px] sm:text-[56px] md:text-[76px] font-bold tracking-[-0.04em] leading-[1.12] sm:leading-[1.04] text-[#171719] mb-2.5 sm:mb-4 max-w-4xl mx-auto">
          {modeConfigs[activeMode].title}
        </h1>

        {/* 细腻质感副标题 (移动端适度紧凑 12px，留白适度) */}
        <p className="text-xs sm:text-[24px] md:text-[30px] font-normal tracking-[-0.015em] leading-[1.38] sm:leading-[1.25] text-[#8d9096] max-w-[720px] mb-3 sm:mb-8 px-2 sm:px-0">
          {modeConfigs[activeMode].subtitle}
        </p>

        {/* Subframe 动态模式状态胶囊 (mode-live-pill) */}
        <div className="mb-4 sm:mb-9 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-2xs sm:text-xs text-[#52525b] max-w-full sm:max-w-2xl backdrop-blur-xs overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
          <span className="min-w-0 truncate">{modeConfigs[activeMode].badge}</span>
        </div>

        {/* 核心三大优势：笔记 · AI · 知识库（首屏直达核心卖点） */}
        <div className="w-full max-w-3xl mx-auto mb-5 sm:mb-8 grid grid-cols-3 gap-2 sm:gap-4 px-1">
          <div className="min-w-0 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border border-zinc-200/80 shadow-xs text-left overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 min-w-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[11px] sm:text-[15px] font-bold text-zinc-900 truncate">沉浸笔记</span>
            </div>
            <p className="text-[10px] sm:text-[12px] text-zinc-500 leading-snug break-words">
              手写批注、公式推导与真题双链自动沉淀，复习直接回顾。
            </p>
          </div>

          <div className="min-w-0 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border border-zinc-200/80 shadow-xs text-left overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 min-w-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[11px] sm:text-[15px] font-bold text-zinc-900 truncate">AI 导师</span>
            </div>
            <p className="text-[10px] sm:text-[12px] text-zinc-500 leading-snug break-words">
              408/数/英/政/规划专属导师随时答疑，逐题纠错不跳步。
            </p>
          </div>

          <div className="min-w-0 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm border border-zinc-200/80 shadow-xs text-left overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 min-w-0">
              <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Network className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="text-[11px] sm:text-[15px] font-bold text-zinc-900 truncate">考研知识库</span>
            </div>
            <p className="text-[10px] sm:text-[12px] text-zinc-500 leading-snug break-words">
              全科考纲知识点图谱与仿真课件串联，系统化不遗漏。
            </p>
          </div>
        </div>

        {/* 📱 移动端专属自适应 CTA 按钮组（免安装网页版置顶，下载客户端移至页底小入口） */}
        <div className="w-full max-w-sm sm:hidden space-y-2.5 px-3">
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard')
              } else {
                setAuthModalOpen(true)
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1c1c1f] hover:bg-black text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm shadow-black/15 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>立即开启研学 (免安装网页版)</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          <div className="flex items-center justify-center gap-3 pt-0.5 text-2xs text-slate-500">
            <a
              href="#preview"
              className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
            >
              <Play className="w-3 h-3" />
              <span>免登录互动试玩</span>
            </a>
            <span className="text-zinc-300">|</span>
            <a
              href="#download"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>电脑客户端下载 ↓</span>
            </a>
          </div>
        </div>

        {/* 💻 桌面端 / 平板端 CTA 按钮组（主视觉聚焦网页研学与核心能力，客户端下载提供轻量页底入口） */}
        <div className="hidden sm:flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/dashboard')
                } else {
                  setModalTab('login')
                  setAuthModalOpen(true)
                }
              }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#1c1c1f] hover:bg-black text-white text-[15px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.22)] ring-1 ring-white/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>立即开启研学 (免安装网页版)</span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            <a
              href="#preview"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/85 hover:bg-white text-[#18181b] text-[14px] font-semibold border border-slate-200/90 shadow-xs transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 text-indigo-600" />
              <span>免登录动手试玩</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-slate-500">
            <a
              href="#download"
              className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 Windows 客户端{downloadInfo?.desktop?.size ? ` (${downloadInfo.desktop.size})` : ''} 或手机端扫码 ↓</span>
            </a>
          </div>
        </div>
      </section>

      {/*  */}
      <section id="preview" className="w-full min-w-0 max-w-[1280px] mx-auto px-3 sm:px-8 pb-20">
        {/* 📱 手机端专属沉浸全屏试玩推荐横幅 (紧凑精致) */}
        <div className="sm:hidden w-full min-w-0 mb-2.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border border-indigo-400/40 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base shrink-0">🎮</span>
            <div className="min-w-0 flex-1">
              <div className="text-2xs font-bold text-white flex items-center gap-1 min-w-0">
                <span className="truncate">手机端沉浸全屏试玩</span>
                <span className="text-[8.5px] px-1 py-0.2 rounded-full bg-amber-400 text-amber-950 font-extrabold shrink-0">推荐</span>
              </div>
              <div className="text-2xs text-indigo-200/90 truncate">画布宽广 · 无黑边截断 · 顺畅滑动</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFullScreenSandbox(true)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white text-2xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            title="一键全屏打开试玩功能"
          >
            <Maximize2 className="w-3 h-3" />
            <span>全屏打开</span>
          </button>
        </div>

        {/* 试玩模式与视窗切换药丸控制栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-2xs font-bold text-emerald-700 shadow-xs max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">免登录沉浸试玩体验已就绪</span>
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">· 无需注册，直接动手体验 408 动画课件与时空时局图</span>
          </div>

        </div>

        {/* 视窗外壳 */}
        <div className="w-full min-w-0 rounded-2xl bg-[#e3e3e6] p-2 sm:p-3 shadow-[0_24px_64px_rgba(0,0,0,0.12)] border border-white/60">
          <div className="w-full min-w-0 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.08] overflow-hidden text-left select-none">
            {/* 工作台顶部仿 Chrome 导航条 */}
            <div className="h-9 px-3 sm:px-4 bg-[#fafafa] border-b border-slate-200/80 flex items-center justify-between gap-2 text-2xs text-slate-500 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                <span className="font-semibold text-slate-900 truncate">CoreForge 考研研核 · 沉浸实景视窗</span>
                <span className="text-slate-400 hidden sm:inline shrink-0">·</span>
                <span className="hidden sm:inline shrink-0">🎮 动态仿真试玩实验室</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 font-medium text-slate-800 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-2xs sm:text-2xs">{modeConfigs[activeMode].heroSubject}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFullScreenSandbox(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-2xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                  title="全屏沉浸试玩（无黑边截断，大屏操作更舒适）"
                >
                  <Maximize2 className="w-3 h-3 text-indigo-600" />
                  <span>全屏试玩</span>
                </button>
                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) navigate('/dashboard')
                      else setAuthModalOpen(true)
                    }}
                    className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-medium text-2xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    进入完整工作台 →
                  </button>
                </div>
              </div>
            </div>

            {/* ── 免登录动手试玩专区 ── */}
            <div className="w-full min-w-0 min-h-[500px] bg-slate-950 text-white relative overflow-hidden">
                {activeMode === '408' ? (
                  /* 408 模块：直接嵌入 AVL 平衡二叉树仿真课件 */
                  <div className="flex flex-col h-[520px] w-full min-w-0">
                    <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
                      <div className="flex items-center gap-2 min-w-0 max-w-full">
                        <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold font-mono shrink-0">
                          408 数据结构真题实验室
                        </span>
                        <span className="text-slate-300 font-semibold truncate min-w-0">
                          🌳 AVL 平衡二叉树四种自平衡旋转 (LL/RR/LR/RL)
                        </span>
                      </div>
                      <span className="text-2xs text-slate-400">
                        提示：可在下方画布中直接动手点击插入节点或单步右旋
                      </span>
                    </div>
                    <iframe
                      srcDoc={avlTreeCourseware.embedHtml}
                      title="AVL 树动态仿真课件"
                      className="w-full flex-1 border-0 bg-transparent min-w-0"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : activeMode === 'politics' ? (
                  <PoliticsTrialDemo onEnter={() => (isAuthenticated ? navigate('/politics') : setAuthModalOpen(true))} />
                ) : activeMode === 'math' ? (
                  <MathTrialDemo onEnter={() => (isAuthenticated ? navigate('/quiz') : setAuthModalOpen(true))} />
                ) : activeMode === 'ai' ? (
                  <AgentTrialDemo onEnter={() => (isAuthenticated ? navigate('/chat') : setAuthModalOpen(true))} />
                ) : (
                  /* 英语模块试玩 */
                  <div className="flex flex-col h-[520px] w-full min-w-0 overflow-y-auto bg-slate-900 p-4 sm:p-6 text-white justify-between gap-4">
                    <div className="space-y-4 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
                        <span className="font-bold text-indigo-300 text-xs sm:text-sm">考研英语 · 20 分制 AI 智能批改示范</span>
                        <span className="text-2xs sm:text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-lg shrink-0">~1.2s 极速精批</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs min-w-0">
                        <div className="min-w-0 p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-slate-400 font-bold">考生原始作答草稿：</span>
                          <p className="font-mono text-slate-300 leading-relaxed text-2xs break-words">
                            "As is vividly depicted in the cartoon, two individuals are standing at a crossroads. Many people lose their minds in smartphones. I think it is very good if government can help us make better rules."
                          </p>
                        </div>
                        <div className="min-w-0 p-3.5 sm:p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                          <span className="text-amber-300 font-bold">AI 20 分制深度诊断与词汇升级：</span>
                          <p className="font-mono text-indigo-200 leading-relaxed text-2xs break-words">
                            得分：18.5 / 20.0 (一档良好)<br />
                            平庸词升级：<br />
                            • very good → of paramount importance<br />
                            • I think → I harbor the firm conviction that<br />
                            • lose minds → succumb to digital distraction
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
                      <span>支持拍照 OCR 录入、历年图画/图表真题模板对比</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (isAuthenticated) navigate('/english')
                          else setAuthModalOpen(true)
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer shrink-0"
                      >
                        进入英语作文研学舱 →
                      </button>
                    </div>
                  </div>
                )}
              </div>

          </div>
        </div>
      </section>

      <section id="download" className="w-full min-w-0 py-16 sm:py-20 border-t border-slate-200/80 bg-[#f4f4f6]/80 relative overflow-hidden">
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-8 min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14 min-w-0">
            <h2 className="text-xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em] break-words">
              全平台多端覆盖 · 随时随地进入心流
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#71717a] break-words">
              电脑大屏深度学习，手机随时刷题背卡，学习进度与错题记录实时同步。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch min-w-0">
            {/* 1. Windows 桌面旗舰端 */}
            <div className="min-w-0 rounded-2xl bg-white border-2 border-slate-900/10 p-4 sm:p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#18181b] text-white text-2xs font-bold tracking-wide shadow-sm">
                主力备考推荐
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                    {downloadInfo?.desktop?.version ? `桌面版 v${downloadInfo.desktop.version}` : '桌面版'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 break-words">Windows 桌面客户端</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 break-words">
                  笔记本与台式机首选。独立桌面端运行更稳定，支持离线查看已下载的讲义与真题笔记，备考更专注。
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8 font-medium">
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">独立软件窗口，全屏沉浸复习少分心</span>
                  </li>
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">本地笔记一键导出备份，复习资料安心保存</span>
                  </li>
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">下载安装即可使用，无需复杂设置</span>
                  </li>
                </ul>
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleDownloadDesktop}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1f] hover:bg-[#2a2a2e] active:scale-[0.98] py-3 px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="break-words">
                    {downloading
                      ? '正在启动下载...'
                      : `一键下载 Windows 安装包${downloadInfo?.desktop?.size ? ` (${downloadInfo.desktop.size})` : ''}`}
                  </span>
                </button>
                <div className="mt-2 text-center text-2xs text-slate-400 break-words">
                  支持 Windows 10 / 11 (64位) · 点击直接下载
                </div>
              </div>
            </div>

            {/* 2. 移动端 (手机扫码) */}
            <div className="min-w-0 rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                    手机/平板扫码
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 break-words">手机 / 移动伴学端</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 break-words">
                  自习室、睡前背卡片神器。单手即可刷题与翻转记忆卡，省电流畅、随时掏出手机就能学。
                </p>

                {/* 二维码展示区 */}
                <div className="my-4 rounded-xl bg-slate-50 p-3.5 sm:p-4 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0 overflow-hidden">
                  <div className="bg-white p-2 rounded-lg shrink-0 border border-slate-200 shadow-xs">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="手机扫码二维码" className="h-24 w-24 object-contain" />
                    ) : (
                      <div className="h-24 w-24 flex items-center justify-center text-2xs text-slate-400">
                        生成中...
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left text-xs space-y-1 min-w-0 w-full sm:w-auto">
                    <p className="font-semibold text-slate-900 break-words">📱 手机扫码即刻使用：</p>
                    <p className="text-slate-500 text-2xs break-words">1. 用手机相机或微信扫描二维码</p>
                    <p className="text-slate-500 text-2xs break-words">
                      2. 点击浏览器菜单 <strong className="text-slate-900">「添加到主屏幕」</strong>
                    </p>
                    <p className="text-emerald-600 text-2xs font-semibold break-words">
                      ✨ 桌面直接生成图标，打开就是全屏体验！
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/dashboard')
                    } else {
                      setModalTab('login')
                      setAuthModalOpen(true)
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-100 hover:bg-slate-200/70 py-3 px-4 text-xs font-semibold text-slate-800 transition-all text-center cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span className="break-words">直接进入手机网页版（免安装）</span>
                </button>
                <div className="mt-2 text-center text-2xs text-slate-400 break-words">
                  支持安卓 / 鸿蒙 / iPhone 手机浏览器直接使用
                </div>
              </div>
            </div>

            {/* 3. Web 在线版 */}
            <div className="min-w-0 rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] flex flex-col justify-between">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                    打开即用
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 break-words">网页在线版</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 break-words">
                  无需安装任何软件。在图书馆公用电脑、iPad 或手机浏览器中打开就能开始学习，个人账号数据独立保存。
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8 font-medium">
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">零门槛打开即学，不占用设备存储空间</span>
                  </li>
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">做题进度、错题本与复习笔记多端实时同步</span>
                  </li>
                  <li className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">支持电脑、平板与手机跨设备无缝接力复习</span>
                  </li>
                </ul>
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1c1c1f] hover:bg-[#2a2a2e] active:scale-[0.98] py-3 px-4 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  <span className="break-words">{isAuthenticated ? '直接进入研学空间' : '前往登录 / 注册账号'}</span>
                </button>
                <div className="mt-2 text-center text-2xs text-slate-400 break-words">
                  兼容常见电脑、平板与手机浏览器
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  */}
      <section id="subjects" className="w-full min-w-0 py-16 sm:py-20 max-w-[1280px] mx-auto px-3 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="text-2xs sm:text-2xs font-bold text-slate-400 uppercase tracking-widest">
            QUAD-CORE ECOSYSTEM
          </span>
          <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
            全面覆盖考研四大主力科目
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#71717a]">
            拒绝泛泛的通用笔记本，CoreForge 为 408 计算机、考研数学、考研政治与考研英语量身定制四核研学生态。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm sm:text-base">
                408
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">408 计算机基础综合</h3>
                <span className="text-2xs sm:text-xs text-slate-500">数据结构 · 计组 · 操作系统 · 计网</span>
              </div>
            </div>
            <p className="text-2xs sm:text-xs text-slate-600 leading-relaxed mb-4 sm:mb-5">
              真题分项刷透并自动归因。AVL树/红黑树/B+树、流水线冒险与 Cache 映射、PV 原语与死锁检测、OSI 与 TCP 协议栈，全方位打通。
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-2xs sm:text-xs">
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                🌲 算法与数据结构
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                ⚙️ 计算机组成原理
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                🖥️ 操作系统原理
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                🌐 计算机网络通信
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm sm:text-base">
                ∑
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">全国考研数学</h3>
                <span className="text-2xs sm:text-xs text-slate-500">高等数学 · 线性代数 · 概率统计</span>
              </div>
            </div>
            <p className="text-2xs sm:text-xs text-slate-600 leading-relaxed mb-4 sm:mb-5">
              严格遵循 KaTeX 数学公式渲染标准。高等数学泰勒公式与微分方程、线性代数矩阵特征值与二次型、概率论多维随机变量，AI 拆解思路启发式点拨。
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-2xs sm:text-xs">
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                📐 微积分与高等数学
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                📊 线性代数矩阵空间
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                🎲 概率论与数理统计
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">
                ✍️ 步骤启发式证明推导
              </div>
            </div>
          </div>

          {/* 3. 考研政治 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                  <Landmark className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">考研政治 史纲时空大本营</h3>
                  <span className="text-xs text-slate-500">时空轴 · 中国地图 · 肖秀荣1000题</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                阿里 DataV 高精矢量中国地图与球形墨卡托对齐。1840~2024 近代史重要会议与重大事件全屏滑动，肖秀荣 1000 题即时判分与考点遮罩背诵。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                🗺️ 高精矢量中国地图
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                ⏱️ 1840~2024 时空大屏
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                📝 肖秀荣 1000 题精粹
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                🔒 核心考点遮罩自测
              </div>
            </div>
          </div>

          {/* 4. 考研英语 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">考研英语 全题型研学中枢</h3>
                  <span className="text-xs text-slate-500">作文模板 · AI批改 · 真题精读</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                英语一图画与英语二图表黄金三段论模板。考研 20 分四维标准分智能批改，识别平庸词并给出高阶替换卡，历年真题长难句树状语法拆解。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                📜 大小作文高分模板
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                ⚡ 考研标准分 AI 批改
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                🌳 长难句树状语法拆解
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                📈 2000+ 词汇艾宾浩斯
              </div>
            </div>
          </div>

        </div>
      </section>

      {/*  */}
      {authModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false)
          }}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto modal-scroll-contain overscroll-contain animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-[940px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(90dvh,720px)] rounded-3xl bg-[#e3e3e6] p-2.5 sm:p-3 shadow-[0_28px_70px_rgba(0,0,0,0.5)] border border-white/60 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* 固定的关闭按钮（右上角常驻、大点击热区） */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 active:scale-90 text-slate-800 flex items-center justify-center transition-all cursor-pointer border border-white/40 shadow-xs"
              title="关闭弹窗 (ESC)"
              aria-label="关闭登录弹窗"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 左栏：身份认证、注册与找回密码 (手机端独立纵向滚动，高度自适应，紧凑排版) */}
            <div className="lg:col-span-5 bg-[#efefef] rounded-xl p-3.5 sm:p-7 flex flex-col justify-between text-left border border-white/70 overflow-y-auto max-h-[calc(100dvh-3rem)] lg:max-h-none modal-scroll-contain overscroll-contain">
              <div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-xs ring-1 ring-rose-200/70 mb-3 sm:mb-5 shrink-0">
                  <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
                </div>

                <h2 className="text-[16.5px] sm:text-[25px] leading-[1.2] tracking-tight font-bold text-[#18181b] mb-2 sm:mb-4">
                  {modalTab === 'forgot'
                    ? '找回研学密码'
                    : modalTab === 'register'
                    ? '注册研学空间'
                    : '进入研核空间'}
                  <br />
                  <span className="text-2xs sm:text-[13px] text-[#8d9096] font-normal">
                    {modalTab === 'forgot'
                      ? 'Account Security Recovery'
                      : 'CoreForge Workspace'}
                  </span>
                </h2>

                {modalTab !== 'forgot' && (
                  <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-6 text-2xs sm:text-xs text-[#27272a] font-medium">
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                      <span>本地优先，支持 Obsidian 知识库</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                      <span>SM-2 艾宾浩斯智能记忆闪卡</span>
                    </li>
                    <li className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                      <span>408 与 考研数学真题智能批改</span>
                    </li>
                  </ul>
                )}

                {modalError && (
                  <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{modalError}</span>
                  </div>
                )}

                {resetSuccessMessage && (
                  <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}

                {/* 模式一：登录表单 (紧凑输入与按钮) */}
                {modalTab === 'login' && (
                  <form noValidate onSubmit={handleModalAuthSubmit} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={modalUsername}
                        onChange={(e) => setModalUsername(e.target.value)}
                        placeholder="用户名 / 账号 (如 admin)"
                        className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        value={modalPassword}
                        onChange={(e) => setModalPassword(e.target.value)}
                        placeholder="登录密码 (至少 6 位)"
                        className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setModalTab('forgot')
                          setModalError(null)
                          setForgotStep(1)
                          setForgotUsername(modalUsername)
                        }}
                        className="text-2xs sm:text-2xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        忘记密码？
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-lg bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      {modalLoading ? '正在验证...' : '登入研学空间'}
                    </button>
                  </form>
                )}

                {/* 模式二：注册表单 (紧凑输入与按钮) */}
                {modalTab === 'register' && (
                  <form noValidate onSubmit={handleModalAuthSubmit} className="space-y-2">
                    <div>
                      <input
                        type="text"
                        required
                        value={modalUsername}
                        onChange={(e) => setModalUsername(e.target.value)}
                        placeholder="设置账号用户名 (如 kaoyan2026)"
                        className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        value={modalPassword}
                        onChange={(e) => setModalPassword(e.target.value)}
                        placeholder="设置登录密码 (至少 6 位)"
                        className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        value={modalConfirmPassword}
                        onChange={(e) => setModalConfirmPassword(e.target.value)}
                        placeholder="再次输入密码"
                        autoComplete="new-password"
                        className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-xs sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                      />
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-lg bg-slate-200/60 border border-slate-300/60 text-2xs sm:text-2xs text-slate-600">
                      💡 注册成功后将为您自动颁发专属救援码，支持在遗忘密码时自助找回！
                    </div>

                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-lg bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      {modalLoading ? '正在创建...' : '注册账号并登入'}
                    </button>
                  </form>
                )}

                {/* 模式三：找回密码 / 密码重置表单 */}
                {modalTab === 'forgot' && (
                  <div className="space-y-3">
                    {forgotStep === 1 ? (
                      <form onSubmit={handleQuerySecurityQuestion} className="space-y-2.5">
                        <div className="text-xs text-slate-600 leading-relaxed">
                          请输入您的研学用户名，系统将检索您的安全密保问题或救援通道：
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="请输入用户名 / 账号"
                            className="w-full py-2 px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={modalLoading}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                        >
                          {modalLoading ? '正在检索密保...' : '下一步：验证身份'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-200/80 text-slate-700 font-medium">
                          <span>账号：{forgotUsername}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep(1)
                              setModalError(null)
                            }}
                            className="text-slate-500 hover:text-slate-900 underline cursor-pointer text-2xs"
                          >
                            更换账号
                          </button>
                        </div>

                        {/* 密保问题回答 OR 备用救援码输入 */}
                        {!useRecoveryCodeMode && hasSecurityQuestion ? (
                          <div className="space-y-2">
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                              <span className="font-bold">安全密保问题：</span>
                              <div className="mt-0.5 font-medium">{securityQuestion}</div>
                            </div>
                            <input
                              type="text"
                              required
                              value={securityAnswer}
                              onChange={(e) => setSecurityAnswer(e.target.value)}
                              placeholder="请输入您的密保答案"
                              className="w-full py-2 px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                            />
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => setUseRecoveryCodeMode(true)}
                                className="text-2xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                              >
                                忘记答案？改用专属救援码验证 →
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs leading-relaxed">
                              {hasSecurityQuestion ? (
                                <span>请输入注册时保存的 8 位专属救援码（格式如 CF-XXXX-XXXX）：</span>
                              ) : (
                                <span>该账号未预设密保问题。请输入您的备用救援码（格式 CF-XXXX-XXXX），或联系管理员在后台协助重置：</span>
                              )}
                            </div>
                            <input
                              type="text"
                              required
                              value={recoveryCodeInput}
                              onChange={(e) => setRecoveryCodeInput(e.target.value)}
                              placeholder="请输入救援码 (如 CF-78A9-2B4C)"
                              className="w-full py-2 px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all uppercase"
                            />
                            {hasSecurityQuestion && (
                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() => setUseRecoveryCodeMode(false)}
                                  className="text-2xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                >
                                  ← 改用密保问题答案验证
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 设置新密码 */}
                        <div>
                          <input
                            type="password"
                            required
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="设置新密码 (至少 6 位)"
                            className="w-full py-2 px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                          />
                        </div>

                        <div>
                          <input
                            type="password"
                            required
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            placeholder="再次确认新密码"
                            className="w-full py-2 px-3 rounded-lg bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={modalLoading}
                          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                        >
                          {modalLoading ? '正在重置密码...' : '确认重置新密码'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 底部模式切换按钮 (紧凑字体) */}
                <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-2xs sm:text-2xs text-slate-500">
                  {modalTab === 'forgot' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('login')
                        setModalError(null)
                        setForgotStep(1)
                      }}
                      className="hover:text-slate-900 underline cursor-pointer font-medium"
                    >
                      ← 想起密码了？返回登录
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab(modalTab === 'login' ? 'register' : 'login')
                        setModalError(null)
                      }}
                      className="hover:text-slate-900 underline cursor-pointer"
                    >
                      {modalTab === 'login' ? '没有账号？立即自主注册' : '已有账号？返回登录'}
                    </button>
                  )}

                  <span className="text-slate-400">多端同步 · 隐私保护</span>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 border-t border-slate-200 mt-2.5 sm:mt-4 text-2xs sm:text-2xs text-slate-400">
                支持安全密保问答与 8 位应急救援码双轨找回
              </div>
            </div>

            {/* 右栏：工作台实景画板微型预览 */}
            <div className="hidden lg:flex lg:col-span-7 items-center justify-center p-2 overflow-hidden">
              <div className="w-full bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-black/[0.08] p-3 text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 text-2xs text-slate-500">
                  <span className="font-semibold text-slate-800">研核工作台 · 实时画板</span>
                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs text-slate-700">
                    <div className="font-semibold text-slate-900 mb-1">
                      408 真题 · 2024 数据结构大题
                    </div>
                    <p className="text-slate-500 text-2xs leading-relaxed">
                      正在利用双向拓扑图谱分析二叉树线索化遍历算法与时空复杂度...
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-400 text-xs">
                    <div className="font-semibold text-slate-900 mb-1">考研数学一 · 微积分中值定理</div>
                    <p className="text-slate-600 text-2xs">
                      Cauchy 中值定理辅助函数构造：F(x) = f(x) - [f(b)-f(a)]/[g(b)-g(a)] * g(x)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                  <span>支持一键下载本地客户端离线使用</span>
                  <span className="font-mono text-slate-600">{downloadInfo?.web?.version ? `网页版 v${downloadInfo.web.version}` : '网页版'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/*  */}
      <footer className="border-t border-slate-200/90 bg-white py-10 text-slate-500 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#18181b] text-white flex items-center justify-center text-2xs font-bold">
              C
            </div>
            <span className="font-semibold text-slate-800">CoreForge 研核</span>
            <span>· 408 & 考研数学 智能双核研学工作台</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <a href="#download" className="hover:text-slate-900 transition-colors">
              客户端下载
            </a>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              登录研学空间
            </button>
          </div>
        </div>
      </footer>
      {/* ── 📱 全屏沉浸式试玩视窗模态框 (document.body Portal) ── */}
      {fullScreenSandbox && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-dvh overflow-hidden select-none animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* 全屏顶栏 (移动端紧凑自适应) */}
          <div className="h-11 sm:h-13 px-2 sm:px-5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-1.5 shrink-0 pt-[env(safe-area-inset-top,0px)]">
            {/* 左侧：Logo + 标题 */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center overflow-hidden rounded-lg border border-rose-200/30 shadow-xs shrink-0">
                <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
              </div>
              <span className="hidden xs:inline font-extrabold text-white text-2xs sm:text-sm whitespace-nowrap">
                试玩实验室
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                免登录免注册
              </span>
            </div>

            {/* 中间：学科切换胶囊（含手机端横向滚动，确保 AI 导师随时可点） */}
            <div className="flex-1 min-w-0 flex justify-center">
              <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-slate-800/80 border border-slate-700 text-2xs sm:text-xs max-w-full overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveMode('408')}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeMode === '408' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">408</span>
                  <span className="hidden sm:inline">408 仿真</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('politics')}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeMode === 'politics' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">史纲</span>
                  <span className="hidden sm:inline">史纲时空</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('math')}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeMode === 'math' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">数学</span>
                  <span className="hidden sm:inline">数学推导</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('english')}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeMode === 'english' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">英语</span>
                  <span className="hidden sm:inline">英语批改</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('ai')}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    activeMode === 'ai' ? 'bg-violet-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">AI 导师</span>
                  <span className="hidden sm:inline">AI 导师</span>
                </button>
              </div>
            </div>

            {/* 右侧：横屏提示 + 退出全屏按钮 */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-2xs text-slate-400 hidden lg:inline">
                💡 手机横屏操作更自如 · 支持双指缩放与拖动
              </span>
              <button
                type="button"
                onClick={() => setFullScreenSandbox(false)}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-2xs sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                title="退出全屏试玩 (或按 ESC 键)"
              >
                <Minimize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">退出全屏</span>
                <span className="xs:hidden">退出</span>
              </button>
            </div>
          </div>

          {/* 全屏主体试玩内容 */}
          <div className="flex-1 w-full min-h-0 bg-slate-950 relative overflow-hidden flex flex-col">
            {activeMode === '408' ? (
              <div className="w-full h-full flex flex-col overflow-hidden">
                <iframe
                  srcDoc={avlTreeCourseware.embedHtml}
                  title="AVL 树全屏沉浸仿真课件"
                  className="w-full flex-1 border-0 bg-transparent"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : activeMode === 'politics' ? (
              <div className="w-full h-full overflow-y-auto flex bg-[#070b14]">
                <PoliticsTrialDemo
                  fullscreen
                  onEnter={() => {
                    setFullScreenSandbox(false)
                    if (isAuthenticated) navigate('/politics')
                    else setAuthModalOpen(true)
                  }}
                />
              </div>
            ) : activeMode === 'math' ? (
              <div className="w-full h-full flex flex-col overflow-hidden bg-[#0b0f19]">
                <MathTrialDemo
                  fullscreen
                  onEnter={() => {
                    setFullScreenSandbox(false)
                    if (isAuthenticated) navigate('/quiz')
                    else setAuthModalOpen(true)
                  }}
                />
              </div>
            ) : activeMode === 'ai' ? (
              <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0f1c]">
                <AgentTrialDemo
                  fullscreen
                  onEnter={() => {
                    setFullScreenSandbox(false)
                    if (isAuthenticated) navigate('/chat')
                    else setAuthModalOpen(true)
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-slate-900 text-white flex flex-col">
                <div className="w-full max-w-5xl mx-auto mt-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                    <span className="font-bold text-indigo-300 text-base">考研英语 · 20 分制 AI 智能批改示范 (全屏版)</span>
                    <span className="text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-lg">~1.2s 极速精批</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-slate-400 font-bold">考生原始作答草稿：</span>
                      <p className="font-mono text-slate-300 leading-relaxed text-xs">
                        "As is vividly depicted in the cartoon, two individuals are standing at a crossroads. Many people lose their minds in smartphones. I think it is very good if government can help us make better rules."
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                      <span className="text-amber-300 font-bold">AI 20 分制深度诊断与词汇升级：</span>
                      <p className="font-mono text-indigo-200 leading-relaxed text-xs">
                        得分：18.5 / 20.0 (一档良好)<br />
                        平庸词升级：<br />
                        • very good → of paramount importance<br />
                        • I think → I harbor the firm conviction that<br />
                        • lose minds → succumb to digital distraction
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-5xl mx-auto mb-auto pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 mt-4">
                  <span>支持拍照 OCR 录入、历年图画/图表真题模板对比</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFullScreenSandbox(false)
                      if (isAuthenticated) navigate('/english')
                      else setAuthModalOpen(true)
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                  >
                    进入完整英语作文研学舱 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}