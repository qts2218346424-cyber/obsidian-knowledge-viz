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
  Clock,
  X,
  LogIn,
  UserPlus,
  Play,
  KeyRound,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Menu,
  Eye,
  EyeOff,
  Copy,
  Check,
  Gift,
  Compass,
  Layers,
  Binary,
  Calculator,
  Languages,
  Award,
  Share2,
  BookmarkCheck,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MathTrialDemo, AgentTrialDemo } from './landing/TrialDemos'
import { PoliticsTrialDemo } from './landing/PoliticsTrialDemo'
import { EnglishTrialDemo } from './landing/EnglishTrialDemo'
import { InteractiveBentoShowcase } from './landing/InteractiveBentoShowcase'
import { MobilePreviewModal } from './landing/MobilePreviewModal'
import { TrustAndTestimonialsSection } from './landing/TrustAndTestimonialsSection'
import { getSecurityQuestion, resetPassword, getStoredUser } from '../services/auth'
import { useExamCountdown } from '../utils/examDate'
import {
  getTrialActivitySummary,
  inheritTrialDataToUserWorkspace,
  subscribeTrialBridge,
  type InheritResult,
  type TrialActivitySummary,
} from '../utils/trialStateBridge'

const OFFICIAL_DOMAIN = 'https://claudexxb.online'
const OFFICIAL_DOMAIN_HOST = 'claudexxb.online'

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

interface PendingTarget {
  path: string
  label: string
}

interface RegisteredWelcomeInfo {
  username: string
  points: number
  recoveryCode?: string
  targetPath: string
  targetLabel: string
  inheritResult?: InheritResult
}

// 严格对齐页面从上到下的黄金叙事顺序：建立认知 -> 动手试玩 -> 了解全科覆盖 -> 信任背书 -> 多端下载转化
const NAV_LINKS = [
  { href: '#preview', label: '动手试玩' },
  { href: '#features', label: '互动黑科技' },
  { href: '#subjects', label: '考研四核' },
  { href: '#hub', label: '全景功能舱' },
  { href: '#trust', label: '真题与口碑' },
  { href: '#download', label: '多端下载' },
] as const

export default function LandingPage() {
  const { isAuthenticated, login, register, initAdmin, initialized } = useAuth()
  const navigate = useNavigate()
  const countdown = useExamCountdown()

  // 3D 金属胶囊当前切换模式
  const [activeMode, setActiveMode] = useState<ModeType>('408')

  // 试玩足迹实时统计（驱动“注册后自动继承 N 项试玩成果”提示）
  const [trialSummary, setTrialSummary] = useState<TrialActivitySummary>(() =>
    getTrialActivitySummary()
  )

  useEffect(() => {
    return subscribeTrialBridge((next) => {
      setTrialSummary(getTrialActivitySummary(next))
    })
  }, [])

  // 顶栏滚动感知、移动端折叠菜单与底部悬浮转化栏状态
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 全屏沉浸试玩视窗 & 免登录手机伴学预览视窗显隐
  const [fullScreenSandbox, setFullScreenSandbox] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  // 下载信息与二维码
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [shareSiteUrl, setShareSiteUrl] = useState<string>(OFFICIAL_DOMAIN)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // 双栏高转化认证弹窗控制与意图路由记忆
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register' | 'forgot'>('register')
  const [pendingTarget, setPendingTarget] = useState<PendingTarget>({
    path: '/dashboard',
    label: '研核全景工作台',
  })
  const [contextBannerHint, setContextBannerHint] = useState<string | null>(null)

  const [modalUsername, setModalUsername] = useState('')
  const [modalDisplayName, setModalDisplayName] = useState('')
  const [modalPassword, setModalPassword] = useState('')
  const [modalConfirmPassword, setModalConfirmPassword] = useState('')
  const [showModalPassword, setShowModalPassword] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // 新人注册成功后的仪式感欢迎、试玩成果继承与救援码备份状态
  const [registeredWelcome, setRegisteredWelcome] = useState<RegisteredWelcomeInfo | null>(null)
  const [copiedRecovery, setCopiedRecovery] = useState(false)

  // 找回密码相关交互状态
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
    }, 3000)
  }

  // 监听滚动：驱动动态吸顶毛玻璃导航头与移动端底部悬浮转化栏
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 20)
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 260
      setShowMobileStickyCta(y > 380 && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 监听模态框或全屏试玩时的背景滚动锁定与 Esc 退出
  useEffect(() => {
    if (!fullScreenSandbox && !authModalOpen) return
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullScreenSandbox) setFullScreenSandbox(false)
        if (authModalOpen && !registeredWelcome) setAuthModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullScreenSandbox, authModalOpen, registeredWelcome])

  useEffect(() => {
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
            downloadUrl: '/api/downloads/desktop',
            platform: 'Windows 64位',
          },
          android: { available: false, pwaSupported: true },
          web: { available: true, version: '1.4.0' },
        })
      })

    // 若在公网或 IP 访问，优先使用官方域名生成扫码链接，本地 localhost 调试则保留当前地址以便局域网联调
    const origin = window.location.origin
    const isLocalDev = /localhost|127\.0\.0\.1/.test(origin)
    const targetQrUrl = isLocalDev ? origin : OFFICIAL_DOMAIN
    setShareSiteUrl(targetQrUrl)
    QRCode.toDataURL(targetQrUrl, {
      width: 176,
      margin: 1,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {})
  }, [])

  // 统一打开认证弹窗辅助函数（支持目标路由记忆与试玩成果自动继承提示）
  const openAuthWithIntent = (
    tab: 'login' | 'register',
    target: PendingTarget = { path: '/dashboard', label: '研核全景工作台' },
    hint?: string
  ) => {
    const footprints = getTrialActivitySummary().totalFootprints
    const defaultHint =
      footprints > 0
        ? `检测到您有 ${footprints} 项试玩问答/做题记录，完成后将自动同步至您的个人空间`
        : undefined
    setModalTab(tab)
    setPendingTarget(target)
    setContextBannerHint(hint || defaultHint || null)
    setModalError(null)
    setRegisteredWelcome(null)
    setMobileMenuOpen(false)
    setAuthModalOpen(true)
  }

  // 全景导航舱或功能模块直达器：已登录直接进，未登录带意图记忆唤起极速注册
  const handleLaunchModule = (path: string, label: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      const footprints = getTrialActivitySummary().totalFootprints
      const extra = footprints > 0 ? `，并同步刚才的 ${footprints} 项试玩记录` : ''
      openAuthWithIntent(
        'register',
        { path, label },
        `完成注册或登录后，将直接为您打开「${label}」${extra}`
      )
    }
  }

  // 平滑锚点跳转
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id.replace('#', ''))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 复制官方网址
  const handleCopySiteUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareSiteUrl)
      setCopiedUrl(true)
      showToast(`已复制官方网址 ${shareSiteUrl}，可发送至微信或电脑浏览器打开`)
      setTimeout(() => setCopiedUrl(false), 2400)
    } catch {
      showToast(`请手动复制官方域名：${OFFICIAL_DOMAIN}`)
    }
  }

  // 复制新人应急救援码
  const handleCopyRecoveryCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedRecovery(true)
      showToast('专属应急救援码已复制到剪贴板')
      setTimeout(() => setCopiedRecovery(false), 2500)
    } catch {
      showToast('复制失败，请长按手动记录该救援码')
    }
  }

  // 触发桌面端下载
  const handleDownloadDesktop = () => {
    setDownloading(true)
    showToast('正在为您拉取 Windows 客户端安装包...')
    const link = document.createElement('a')
    link.href = '/api/downloads/desktop'
    link.download = downloadInfo?.desktop?.filename || 'Knowledge-Viz-Setup-1.4.0.exe'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setDownloading(false), 2600)
  }

  // 模态框登录/注册快速提交 + 自动执行试玩成果状态继承！
  const handleModalAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)

    const cleanUser = modalUsername.trim()
    if (!cleanUser || !modalPassword) {
      setModalError('请填写完整账号名称与登录密码')
      return
    }

    if (modalTab === 'register' || !initialized) {
      if (cleanUser.length < 3) {
        setModalError('用户名长度至少需要 3 个字符')
        return
      }
      if (modalPassword.length < 6) {
        setModalError('登录密码至少需要 6 位字符')
        return
      }
      if (modalTab === 'register' && modalPassword !== modalConfirmPassword) {
        setModalError('两次输入的密码不一致，请重新核对')
        return
      }
    }

    setModalLoading(true)
    try {
      if (!initialized) {
        await initAdmin(cleanUser, modalPassword, modalDisplayName.trim() || undefined)
        const stored = getStoredUser()
        await inheritTrialDataToUserWorkspace(stored?.id)
        showToast('管理员空间初始化成功，正在进入工作台...')
        setAuthModalOpen(false)
        navigate(pendingTarget.path, { replace: true })
      } else if (modalTab === 'register') {
        await register(cleanUser, modalPassword, modalDisplayName.trim() || undefined)
        const stored = getStoredUser()
        const inheritRes = await inheritTrialDataToUserWorkspace(stored?.id)
        // 若用户刚在 AI 试玩区提问过且未专门指定其他舱室，引导他可直达包含该会话或首篇笔记的工作台
        const smartTarget: PendingTarget =
          pendingTarget.path === '/dashboard' && inheritRes.conversationsSynced > 0
            ? { path: '/chat', label: 'AI 伴学工作台（含刚才的试玩问答）' }
            : pendingTarget

        setRegisteredWelcome({
          username: stored?.displayName || cleanUser,
          points: typeof stored?.points === 'number' ? stored.points : 5.0,
          recoveryCode: stored?.recoveryCode,
          targetPath: smartTarget.path,
          targetLabel: smartTarget.label,
          inheritResult: inheritRes,
        })
        showToast(
          inheritRes.inherited
            ? '账号创建成功！已为您自动导入试玩问答与错题笔记'
            : '账号创建成功！已为您发放新人 5.0 研学积分'
        )
      } else {
        await login(cleanUser, modalPassword)
        const stored = getStoredUser()
        const inheritRes = await inheritTrialDataToUserWorkspace(stored?.id)
        showToast(
          inheritRes.inherited
            ? `验证通过！已将刚才的试玩问答与错题同步至您的空间`
            : `验证通过，正在为您打开${pendingTarget.label}...`
        )
        setAuthModalOpen(false)
        const dest =
          pendingTarget.path === '/dashboard' && inheritRes.conversationsSynced > 0
            ? '/chat'
            : pendingTarget.path
        navigate(dest, { replace: true })
      }
    } catch (err: any) {
      setModalError(err.message || '操作失败，请检查输入后重试')
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
      setUseRecoveryCodeMode(!res.hasSecurityQuestion)
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
  const modeConfigs: Record<
    ModeType,
    {
      title: string
      subtitle: string
      badge: string
      heroSubject: string
      targetPath: string
      targetLabel: string
    }
  > = {
    '408': {
      title: '研你所学，核力致胜。',
      subtitle: '408 计算机与考研全科 · 本地优先智能研学工作台',
      badge: '408 计算机综合：数据结构、计组、操作系统与计网历年真题分步拆解与双链错题本',
      heroSubject: '408 计算机学科专业基础综合',
      targetPath: '/quiz?domain=cs_408',
      targetLabel: '408 计算机真题实战舱',
    },
    math: {
      title: '定理推导，一步不漏。',
      subtitle: '全国考研数学 · 高数、线代与概率大题启发式拆解',
      badge: '考研数学（数一/二/三）：出版级 KaTeX 公式渲染，泰勒展开与矩阵特征值动态可视化仿真',
      heroSubject: '全国硕士研究生考研数学 (数一/二/三)',
      targetPath: '/quiz?domain=math',
      targetLabel: '考研数学推导实战舱',
    },
    politics: {
      title: '时空浩瀚，史纲通达。',
      subtitle: '考研政治 · 1840–2024 史纲时空轴与千题遮罩精练',
      badge: '考研政治百炼中枢：近代史重大会议时空编年对照、肖秀荣精选千题与混淆考点辨析',
      heroSubject: '考研政治 · 史纲时空大本营与千题精粹',
      targetPath: '/politics',
      targetLabel: '考研政治史纲大本营',
    },
    english: {
      title: '笔耕不辍，下笔有神。',
      subtitle: '考研英语 · 大小作文黄金模板与 20 分制智能精批',
      badge: '考研英语实战舱：图画/图表万能三段论模板、平庸词一键升格与 2000+ 大纲核心词艾宾浩斯复盘',
      heroSubject: '考研英语 · 全题型研学与智能批改舱',
      targetPath: '/english',
      targetLabel: '考研英语作文精批舱',
    },
    ai: {
      title: '分科名师，随时陪学。',
      subtitle: '直连个人错题本与双链笔记，多智能体协同答疑推演',
      badge: '分科专属 AI 导师：涵盖 408、高数、英语、政治四大导师双师同台研讨，错因直接沉淀闪卡',
      heroSubject: '分科专属 AI 导师协同工作台',
      targetPath: '/chat',
      targetLabel: '多智能体伴学工作台',
    },
  }

  return (
    <div
      className={`min-h-dvh subframe-landing-bg text-[#171719] font-sans flex flex-col selection:bg-slate-900 selection:text-white relative w-full max-w-full ${
        !isAuthenticated ? 'pb-20 md:pb-0' : ''
      }`}
    >
      {/* 建筑级微米坐标暗纹顶层装饰 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[680px] landing-architectural-grid z-0"
      />

      {/* 浮动吐司通知 */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[130] flex items-center gap-2.5 bg-[#18181b] text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-white/15 animate-fade-in-up max-w-[calc(100vw-2rem)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="break-words">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          第一幕：建立认知 —— 动态吸顶导航栏 + 首屏五核 Hero 舞台
         ===================================================================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 pt-[env(safe-area-inset-top,0px)] ${
          isScrolled || mobileMenuOpen
            ? 'bg-white/88 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.05)]'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* 左侧：品牌标识 + 考研初试实时倒计时胶囊 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link to="/" className="group flex items-center gap-2 focus:outline-none shrink-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-xs ring-1 ring-rose-200/80 group-hover:scale-105 transition-transform shrink-0">
                <img src="/icon-192.png?v=dango" alt="研核图标" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] sm:text-base tracking-tight text-[#171719]">
                  CoreForge
                </span>
                <span className="text-2xs font-bold text-slate-700 bg-slate-900/[0.06] px-1.5 py-0.5 rounded-md border border-slate-900/[0.08]">
                  研核
                </span>
              </div>
            </Link>

            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-2xs font-semibold text-amber-900">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>
                距 {countdown.targetLabel.split(' ')[0]} 初试仅剩{' '}
                <strong className="font-extrabold text-rose-600 tabular-nums">{countdown.days}</strong> 天
              </span>
            </div>
          </div>

          {/* 中部：桌面端磨砂玻璃胶囊导航（顺序与下方板块严格一致） */}
          <nav
            aria-label="主页分区导航"
            className="hidden lg:flex items-center gap-0.5 px-2 py-1 rounded-2xl bg-white/65 backdrop-blur-md border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.href)
                }}
                className="px-3 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#52525b] hover:text-[#171719] hover:bg-slate-900/[0.05] transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* 右侧：转化动作组 + 移动端折叠导航触发器 */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold bg-[#18181b] text-white hover:bg-[#27272a] transition-all shadow-sm cursor-pointer"
              >
                <span>进入研学空间</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthWithIntent('login')}
                  className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-[#27272a] hover:bg-black/[0.05] transition-colors cursor-pointer"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => openAuthWithIntent('register')}
                  className="landing-cta-primary inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold text-white active:scale-[0.98] cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-300 shrink-0 hidden xs:inline" />
                  <span>免费注册</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label={mobileMenuOpen ? '收起页面导航菜单' : '展开页面导航菜单'}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 flex items-center justify-center text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 移动端展开式快捷导航面板 */}
        {mobileMenuOpen && (
          <div
            id="mobile-site-menu"
            className="lg:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-4 shadow-xl animate-fade-in-up"
          >
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-xs text-amber-950">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{countdown.targetLabel}</span>
              </span>
              <span className="font-extrabold text-rose-600">剩余 {countdown.days} 天</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.href)
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setMobilePreviewOpen(true)
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>免登录手机预览</span>
              </button>
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuthWithIntent('register')}
                  className="py-2.5 px-3 rounded-xl landing-cta-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>免费注册领5积分</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>进入正式空间</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 首屏 Hero 舞台 */}
      <section className="relative z-10 w-full min-w-0 flex flex-col items-center justify-center px-3.5 sm:px-6 pt-5 sm:pt-11 pb-8 sm:pb-14 text-center">
        <div className="mb-4 sm:mb-6 inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-2xs text-2xs sm:text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/70">
            <Clock className="w-3 h-3" />
            <span>考研冲刺倒计时 {countdown.days} 天</span>
          </span>
          <span className="text-slate-600 font-medium">
            新用户免费注册赠 <strong className="text-slate-900 font-bold">5.0 研学积分</strong> · 试玩问答自动继承
          </span>
        </div>

        {/* 3D 镀铬金属硬件药丸切换器 */}
        <div className="relative w-full max-w-full flex justify-center mb-5 sm:mb-9 select-none">
          <div className="metallic-ambient-glow max-w-full" />

          <div className="metallic-housing relative z-10 max-w-full">
            <div className="metallic-bezel flex items-center gap-1 sm:gap-1.5 p-1 max-w-full overflow-x-auto no-scrollbar">
              {[
                { id: '408' as const, label: '408 计算机', mobileLabel: '408', icon: Cpu },
                { id: 'math' as const, label: '考研数学', mobileLabel: '数学', icon: GraduationCap },
                { id: 'politics' as const, label: '考研政治', mobileLabel: '政治', icon: Landmark },
                { id: 'english' as const, label: '考研英语', mobileLabel: '英语', icon: BookOpen },
                { id: 'ai' as const, label: 'AI 导师', mobileLabel: 'AI 导师', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon
                const active = activeMode === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveMode(tab.id)}
                    aria-pressed={active}
                    className={`mode-switch-btn relative flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                      active ? 'metal-tab-active' : 'metal-tab-inactive'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="sm:hidden">{tab.mobileLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <h1 className="landing-hero-title text-[clamp(1.85rem,6vw,4.5rem)] font-extrabold tracking-[-0.04em] leading-[1.12] sm:leading-[1.05] mb-3 sm:mb-4 max-w-4xl mx-auto px-1">
          {modeConfigs[activeMode].title}
        </h1>

        <p className="text-sm sm:text-[22px] md:text-[26px] font-medium tracking-[-0.015em] leading-[1.42] sm:leading-[1.3] text-[#686b73] max-w-[740px] mb-4 sm:mb-6 px-2 sm:px-0 landing-pretty-copy">
          {modeConfigs[activeMode].subtitle}
        </p>

        <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/75 border border-slate-200/90 text-2xs sm:text-xs text-slate-700 max-w-full sm:max-w-2xl shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="min-w-0 truncate font-medium">{modeConfigs[activeMode].badge}</span>
        </div>

        {/* 首屏主次 CTA（明确区分“免登录动手试玩”与“免费注册开启个人空间”） */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3 px-2 mb-7 sm:mb-10">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => scrollToSection('#preview')}
              className="py-3.5 px-6 sm:px-7 rounded-2xl bg-white hover:bg-slate-50 text-[#18181b] text-sm sm:text-[15px] font-bold border border-slate-300/90 shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Play className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>免登录动手试玩</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  navigate(modeConfigs[activeMode].targetPath)
                } else {
                  openAuthWithIntent('register', {
                    path: modeConfigs[activeMode].targetPath,
                    label: modeConfigs[activeMode].targetLabel,
                  })
                }
              }}
              className="landing-cta-primary py-3.5 px-6 sm:px-8 rounded-2xl text-white text-sm sm:text-[15px] font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAuthenticated
                  ? `进入${modeConfigs[activeMode].targetLabel}`
                  : '免费注册开启专属空间'}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>试玩问答与错题注册后自动继承</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>新人立赠 5.0 研学积分</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>标准 Markdown 本地随时导出</span>
            </span>
          </div>
        </div>

        {/* 四大硬核实证数据条 */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 px-1">
          {[
            { value: '1987–2024', label: '统考历年真题覆盖', sub: '数学38年 · 408全套精校' },
            { value: '43 套+', label: '整卷模考与名师密押', sub: '1900+ 道高频精析题' },
            { value: 'SM-2 算法', label: '艾宾浩斯抗遗忘调度', sub: '每日智能推送待复习卡' },
            { value: '100% 导出', label: '云端同步 + 本地主权', sub: '无缝兼容本地 Obsidian' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="landing-bento-card rounded-2xl p-3 sm:p-4 text-left flex flex-col justify-between"
            >
              <div className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1">
                <div className="text-xs sm:text-[13px] font-bold text-slate-800">{stat.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          第二幕：动手试玩（100% 免登录零打扰体验 · 内嵌/全屏/注册后全链路状态继承）
         ===================================================================== */}
      <section id="preview" className="w-full min-w-0 max-w-[1280px] mx-auto px-3.5 sm:px-8 pt-4 pb-16 sm:pb-20">
        {/* 手机端专属沉浸全屏试玩推荐横幅 */}
        <div className="sm:hidden w-full min-w-0 mb-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border border-indigo-400/40 flex items-center justify-between gap-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/25 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Maximize2 className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="truncate">手机端全屏沉浸试玩</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold shrink-0">
                  状态实时同步
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/90 truncate">问答与草稿切换全屏不丢失 · 注册自动继承</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFullScreenSandbox(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            全屏打开
          </button>
        </div>

        {/* 试玩顶部状态与就地切科胶囊栏 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-bold text-emerald-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>免登录互动试玩实验室</span>
            </span>

            {trialSummary.totalFootprints > 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openAuthWithIntent('register')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  已自动暂存 {trialSummary.totalFootprints} 项试玩问答/错题
                  {!isAuthenticated ? '（点击注册即可导入个人空间 →）' : ''}
                </span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 hidden xl:inline">
                · 切换全屏或注册账号时，您在下方产生的问答与错题将自动保留继承
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/85 border border-slate-200/90 shadow-2xs max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: '408' as const, label: '408 仿真' },
              { id: 'math' as const, label: '数学草稿判分' },
              { id: 'english' as const, label: '英语点词升格' },
              { id: 'politics' as const, label: '史纲时空轴' },
              { id: 'ai' as const, label: '双师 AI 答疑' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMode(item.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeMode === item.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 精密视窗外壳 */}
        <div className="w-full min-w-0 rounded-3xl bg-[#e3e4e8] p-2 sm:p-3 shadow-[0_24px_64px_rgba(15,23,42,0.12)] border border-white/80">
          <div className="w-full min-w-0 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.08] overflow-hidden text-left">
            {/* 工作台顶部仿桌面窗口导航条 */}
            <div className="h-10 px-3 sm:px-4 bg-[#fafafa] border-b border-slate-200/80 flex items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="hidden xs:flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-bold text-slate-900 truncate text-xs">
                  CoreForge 免登录沙盒 · {modeConfigs[activeMode].heroSubject}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFullScreenSandbox(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold text-2xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  title="切换至全屏视图，当前问答与草稿进度将自动同步保留"
                >
                  <Maximize2 className="w-3 h-3 text-indigo-600" />
                  <span>全屏试玩 (保留当前进度)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLaunchModule(
                      modeConfigs[activeMode].targetPath,
                      modeConfigs[activeMode].targetLabel
                    )
                  }
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-2xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>{isAuthenticated ? '进入完整舱室' : '登录进入完整舱室'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 免登录动手试玩核心舞台 */}
            <div className="w-full min-w-0 min-h-[500px] bg-slate-950 text-white relative overflow-hidden">
              {activeMode === '408' ? (
                <div className="flex flex-col h-[520px] w-full min-w-0">
                  <div className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
                    <div className="flex items-center gap-2 min-w-0 max-w-full">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold font-mono text-2xs shrink-0">
                        408 数据结构实验室
                      </span>
                      <span className="text-slate-200 font-semibold truncate min-w-0">
                        AVL 平衡二叉树四种自平衡旋转 (LL / RR / LR / RL)
                      </span>
                    </div>
                    <span className="text-2xs text-slate-400">
                      可在下方画布中直接点击插入节点、单步观察旋转平衡因子变化
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
                <PoliticsTrialDemo
                  onEnter={() => handleLaunchModule('/politics', '史纲时空大本营')}
                />
              ) : activeMode === 'math' ? (
                <MathTrialDemo
                  onEnter={() => handleLaunchModule('/quiz?domain=math', '考研数学实战舱')}
                />
              ) : activeMode === 'ai' ? (
                <AgentTrialDemo
                  onEnter={() => handleLaunchModule('/chat', '多智能体伴学工作台')}
                />
              ) : (
                <EnglishTrialDemo
                  onEnter={() => handleLaunchModule('/english', '考研英语作文精批舱')}
                />
              )}
            </div>

            {/* 试玩视窗底部：动态感知试玩足迹的状态继承转化条 */}
            {!isAuthenticated && (
              <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-t border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2.5 text-xs sm:text-[13px]">
                  <span className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    {trialSummary.totalFootprints > 0 ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Gift className="w-4 h-4 text-amber-300" />
                    )}
                  </span>
                  {trialSummary.totalFootprints > 0 ? (
                    <span className="text-slate-100 leading-snug">
                      系统已为您实时暂存 <strong className="text-emerald-300">{trialSummary.totalFootprints} 项试玩成果</strong>！现在注册将自动为您生成<strong className="text-white">首篇双链笔记与个人错题记录</strong>，绝不白做。
                    </span>
                  ) : (
                    <span className="text-slate-200 leading-snug">
                      在上方试玩产生的提问解答与错题，注册后将<strong className="text-white">自动继承至您的专属知识库</strong>，并立赠 <strong className="text-amber-300">5.0 研学积分</strong>！
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openAuthWithIntent('register', {
                      path:
                        trialSummary.aiTurnsCount > 0
                          ? '/chat'
                          : modeConfigs[activeMode].targetPath,
                      label:
                        trialSummary.aiTurnsCount > 0
                          ? 'AI 伴学工作台'
                          : modeConfigs[activeMode].targetLabel,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                >
                  {trialSummary.totalFootprints > 0
                    ? `免费注册并保存这 ${trialSummary.totalFootprints} 项记录 →`
                    : '10 秒免费注册解锁全功能 →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 免登录互动 Bento 体验区 (#features：紧接试玩实验室，强化免登录使用兴趣) */}
      <InteractiveBentoShowcase
        mode="features-only"
        isAuthenticated={isAuthenticated}
        onLaunchModule={handleLaunchModule}
        onOpenRegister={(hint) => openAuthWithIntent('register', undefined, hint)}
      />

      {/* =====================================================================
          第三幕：了解全科覆盖 —— 四大主力科目生态 (#subjects) + 八大功能舱 (#hub)
          （严格置于信任背书与多端下载区上方！）
         ===================================================================== */}
      <section id="subjects" className="w-full min-w-0 pt-16 sm:pt-22 pb-10 sm:pb-14 max-w-[1280px] mx-auto px-3.5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/[0.05] border border-slate-900/[0.08] text-2xs font-bold text-slate-700 mb-2">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>全面覆盖考研四大主力科目</span>
          </span>
          <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
            为每一门统考核心课量身定制的四核生态
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-[#71717a] landing-pretty-copy">
            拒绝泛泛而谈的通用记事本，CoreForge 为 408 计算机、考研数学、考研政治与考研英语提供深度学科工具链。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {[
            {
              mode: '408' as const,
              path: '/quiz?domain=cs_408',
              title: '408 计算机基础综合',
              sub: '数据结构 · 计组 · 操作系统 · 计网',
              desc: '2009–2024 统考真题逐题精析。平衡树旋转、Cache 组相联映射、PV 信号量同步与 TCP 拥塞窗口全链路贯通。',
              icon: Binary,
              badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
              tags: ['树与图算法沙盒', '流水线与存储层次', 'PV 互斥死锁排查', 'TCP/IP 协议栈精解'],
            },
            {
              mode: 'math' as const,
              path: '/quiz?domain=math',
              title: '全国考研数学 (一/二/三)',
              sub: '高等数学 · 线性代数 · 概率统计',
              desc: '原生集成出版级 KaTeX 公式引擎。针对中值定理证明、多元微积分、特征值二次型提供分步踩分启发点拨。',
              icon: Calculator,
              badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
              tags: ['泰勒与中值定理', '特征值空间变换', '多维随机变量分布', '电子草稿分步批改'],
            },
            {
              mode: 'politics' as const,
              path: '/politics',
              title: '考研政治百炼中枢',
              sub: '史纲时空轴 · 肖秀荣千题 · 遮罩背诵',
              desc: '1840–2024 近现代史重大会议与历史转折全屏滑动对照，客观单选多选即做即改，必背框架一键遮罩自测。',
              icon: Landmark,
              badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
              tags: ['1840–2024 时空轴', '重大会议横向对比', '精选千题错项辨析', '核心考点遮罩速记'],
            },
            {
              mode: 'english' as const,
              path: '/english',
              title: '考研英语实战中枢',
              sub: '作文模板 · 20分制精批 · 大纲词库',
              desc: '涵盖英语一图画与英语二图表黄金三段论。AI 秒级识别平庸词汇并给出高阶替换句型，串联 2000+ 真题核心词。',
              icon: Languages,
              badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
              tags: ['图画/图表高分模板', '20 分制四维批改', '长难句语法树拆解', '词根词缀衍生拓扑'],
            },
          ].map((subj) => {
            const Icon = subj.icon
            return (
              <div
                key={subj.mode}
                className="landing-bento-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 text-left"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${subj.badgeBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">{subj.title}</h3>
                      <span className="text-2xs text-slate-500 block truncate">{subj.sub}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 landing-pretty-copy">
                    {subj.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-2xs">
                    {subj.tags.map((t) => (
                      <div
                        key={t}
                        className="px-2.5 py-2 rounded-lg bg-slate-50/90 border border-slate-200/80 font-semibold text-slate-700 truncate"
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode(subj.mode)
                      scrollToSection('#preview')
                    }}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    免登录试玩该科
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchModule(subj.path, subj.title)}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <span>{isAuthenticated ? '进入专区' : '登录进入'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 八大研学功能舱全景导流矩阵 (#hub) */}
      <InteractiveBentoShowcase
        mode="hub-only"
        isAuthenticated={isAuthenticated}
        onLaunchModule={handleLaunchModule}
        onOpenRegister={(hint) => openAuthWithIntent('register', undefined, hint)}
      />

      {/* =====================================================================
          第四幕：信任背书 —— 历年真题年份明细 · 云同步与本地导出 · 学长学姐评价 (#trust)
         ===================================================================== */}
      <TrustAndTestimonialsSection />

      {/* =====================================================================
          第五幕：多端下载与注册转化 (#download) —— 明确免登录预览与登录入口边界
         ===================================================================== */}
      <section
        id="download"
        className="w-full min-w-0 py-16 sm:py-22 border-t border-slate-200/80 bg-[#f1f2f6]/80 relative overflow-hidden"
      >
        <div className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-8 min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
              选择你的备考终端 · 随时随地进入心流
            </h2>
            <p className="mt-2.5 text-xs sm:text-base text-[#71717a] landing-pretty-copy">
              桌面客户端专注深潜，手机端碎片化刷卡，网页版跨设备即开即用，同一账号实时同步。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {/* 1. Windows 桌面独立旗舰端 */}
            <div className="landing-bento-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between relative border-2 border-slate-900/10">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#18181b] text-white text-2xs font-bold tracking-wide shadow-xs">
                书桌深度学习推荐
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {downloadInfo?.desktop?.version ? `客户端 v${downloadInfo.desktop.version}` : '桌面独立版'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Windows 桌面客户端</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-5 landing-pretty-copy">
                  专为书桌长时间沉浸备考打造。独立软件窗口隔绝浏览器娱乐干扰，深度直连本地 Obsidian 知识库目录。
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-7 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>独立应用窗口全屏沉浸复习，告别网页分心</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>本地 Markdown 笔记双向实时监听与一键备份</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>下载安装包直接运行，支持本机智能体桥接</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleDownloadDesktop}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>
                    {downloading
                      ? '正在拉取安装包...'
                      : `直接下载 Windows 安装包${downloadInfo?.desktop?.size ? ` (${downloadInfo.desktop.size})` : ''}`}
                  </span>
                </button>
                <div className="mt-2 text-center text-2xs text-slate-400">
                  免登录即可直接下载安装包 · 支持 Windows 10 / 11 (64位)
                </div>
              </div>
            </div>

            {/* 2. 手机 / 移动伴学端（提供真正的免登录手机端交互预览 + 明确登录入口边界！） */}
            <div className="landing-bento-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between border-2 border-emerald-500/20 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-2xs font-bold tracking-wide shadow-xs">
                支持免登录真机预览
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                    {OFFICIAL_DOMAIN_HOST}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">手机 / 平板随身伴学端</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 landing-pretty-copy">
                  专为排队、通勤与睡前碎片时间打造。可先免登录打开手机预览视图体验单手刷题与背词手感！
                </p>

                {/* 桌面端显示扫码框；手机端显示添加到主屏幕指引 */}
                <div className="hidden sm:flex my-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/90 items-center gap-3.5">
                  <div className="bg-white p-2 rounded-lg shrink-0 border border-slate-200 shadow-2xs">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="手机扫码访问研核官网" className="h-22 w-22 object-contain" />
                    ) : (
                      <div className="h-22 w-22 flex items-center justify-center text-2xs text-slate-400">
                        二维码加载中
                      </div>
                    )}
                  </div>
                  <div className="text-left text-xs space-y-1">
                    <p className="font-bold text-slate-900">手机扫码访问官网：</p>
                    <p className="text-slate-500 text-2xs font-mono">{OFFICIAL_DOMAIN}</p>
                    <p className="text-slate-500 text-2xs">
                      浏览器菜单点 <strong className="text-slate-900">「添加到主屏幕」</strong>
                    </p>
                    <p className="text-emerald-700 text-2xs font-bold">
                      即刻生成桌面图标，畅享全屏刷卡！
                    </p>
                  </div>
                </div>

                <div className="sm:hidden my-4 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-200/80 text-left space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>添加到手机主屏幕（免安装全屏体验）：</span>
                  </div>
                  <p className="text-2xs text-slate-600 leading-relaxed">
                    点击当前浏览器菜单中的 <strong className="text-slate-900">「添加到主屏幕」</strong>，即可在手机桌面生成独立「研核」全屏图标。
                  </p>
                </div>
              </div>

              {/* 边界清晰的双按钮：主按钮 100% 免登录直接打开手机预览器；副按钮明确标注登录/注册 */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 shrink-0" />
                  <span>免登录预览手机伴学界面</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) navigate('/dashboard')
                      else openAuthWithIntent('login', undefined, '登录后自动同步您的手机与电脑研学进度')
                    }}
                    className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-2xs sm:text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    {isAuthenticated ? '进入手机正式版' : '登录 / 注册正式版'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySiteUrl}
                    className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-2xs sm:text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? '已复制官网链接' : '复制官网地址'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 全功能网页在线版（明确标注注册/登录引导文案） */}
            <div className="landing-bento-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60">
                    {downloadInfo?.web?.version ? `在线版 v${downloadInfo.web.version}` : '云端多租户版'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">全功能网页在线空间</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-5 landing-pretty-copy">
                  无需安装软件，在图书馆公用电脑、iPad 或笔记本浏览器访问 <span className="font-mono text-slate-700">{OFFICIAL_DOMAIN_HOST}</span> 登录账号即可开始学习。
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-7 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>10 秒免手机号注册，自动继承上方试玩问答与错题</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>做题进度、错题归因与双链笔记跨设备实时云端同步</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>支持随时一键打包导出个人全部标准 Markdown 笔记</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) navigate('/dashboard')
                    else openAuthWithIntent('register')
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl landing-cta-primary py-3 px-4 text-xs sm:text-sm font-bold text-white cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAuthenticated ? '立即进入我的网页空间' : '注册 / 登录网页研学空间'}</span>
                </button>
                <div className="mt-2 text-center text-2xs text-slate-400">
                  注册即赠 5.0 初始研学积分 · 独立沙盒安全存储
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚前终极冲刺召唤横幅 */}
      <section className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-8 py-12 sm:py-16">
        <div className="rounded-3xl bg-gradient-to-br from-[#12131a] via-[#191c2e] to-[#0f172a] text-white p-6 sm:p-12 shadow-[0_24px_60px_rgba(15,23,42,0.22)] border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2.5 max-w-2xl text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-2xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>每一道弄懂的错题，都是考场上的底气</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              现在开启你的 CoreForge 研核专属备考空间
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed landing-pretty-copy">
              距离 {countdown.targetLabel} 还有 {countdown.days} 天。
              {trialSummary.totalFootprints > 0
                ? `立即注册即可永久保存您刚才产生的 ${trialSummary.totalFootprints} 项试玩问答与错题，并获赠 5.0 初始积分！`
                : '立即用 10 秒钟创建账号，领取 5.0 初始研学积分，把零散的刷题与笔记收拢成无懈可击的知识体系。'}
            </p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full lg:w-auto shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) navigate('/dashboard')
                else openAuthWithIntent('register')
              }}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>
                {isAuthenticated
                  ? '进入研学工作台'
                  : trialSummary.totalFootprints > 0
                  ? `免费注册并继承 ${trialSummary.totalFootprints} 项记录`
                  : '免费注册账号 (赠 5 积分)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>免登录预览手机版</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          品牌权威页脚（含官方品牌域名 https://claudexxb.online）
         ===================================================================== */}
      <footer className="border-t border-slate-200/90 bg-white py-8 sm:py-10 text-slate-500 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
            <div className="w-5 h-5 rounded bg-[#18181b] text-white flex items-center justify-center text-2xs font-bold shrink-0">
              研
            </div>
            <span className="font-bold text-slate-800">CoreForge 研核官网</span>
            <span>·</span>
            <a
              href={OFFICIAL_DOMAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>{OFFICIAL_DOMAIN_HOST}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="hidden sm:inline text-slate-400">
              · 408 计算机与考研数/英/政智能研学操作系统
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-slate-600 font-semibold">
            <a
              href="#preview"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#preview')
              }}
              className="hover:text-slate-900 transition-colors"
            >
              免登录试玩
            </a>
            <a
              href="#subjects"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#subjects')
              }}
              className="hover:text-slate-900 transition-colors"
            >
              考研四核
            </a>
            <a
              href="#trust"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#trust')
              }}
              className="hover:text-slate-900 transition-colors"
            >
              真题年份与导出说明
            </a>
            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#download')
              }}
              className="hover:text-slate-900 transition-colors"
            >
              多端下载
            </a>
            <button
              type="button"
              onClick={() => openAuthWithIntent(isAuthenticated ? 'login' : 'register')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isAuthenticated ? '进入工作台' : '免费注册 / 登录'}
            </button>
          </div>
        </div>
      </footer>

      {/* 移动端滚动感知底部悬浮转化栏 */}
      {!isAuthenticated && showMobileStickyCta && !authModalOpen && !fullScreenSandbox && !mobilePreviewOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] bg-white/92 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] flex items-center gap-2 animate-fade-in-up">
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="px-3 py-2.5 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-200/90 text-xs font-bold flex items-center justify-center gap-1 shrink-0 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>免登录预览</span>
          </button>
          <button
            type="button"
            onClick={() => openAuthWithIntent('register')}
            className="flex-1 py-2.5 px-3.5 rounded-xl landing-cta-primary text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">
              {trialSummary.totalFootprints > 0
                ? `注册并保存 ${trialSummary.totalFootprints} 项试玩`
                : '免费注册领 5 积分'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      )}

      {/* 免登录移动端伴学界面预览模态框 */}
      <MobilePreviewModal
        open={mobilePreviewOpen}
        isAuthenticated={isAuthenticated}
        onClose={() => setMobilePreviewOpen(false)}
        onOpenRegister={(hint) => openAuthWithIntent('register', undefined, hint)}
        onEnterWorkspace={() => navigate('/dashboard')}
      />

      {/* 双栏高转化注册/登录模态框 + 试玩状态继承回执 + 新人救援码备份卡 */}
      {authModalOpen &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && !registeredWelcome) {
                setAuthModalOpen(false)
              }
            }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto modal-scroll-contain overscroll-contain animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-heading"
          >
            <div className="relative w-full max-w-[960px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(92dvh,760px)] rounded-3xl bg-[#e3e4e8] p-2 sm:p-3 shadow-[0_28px_70px_rgba(0,0,0,0.48)] border border-white/70 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              {!registeredWelcome && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 active:scale-90 text-slate-800 flex items-center justify-center transition-all cursor-pointer border border-white/50"
                  title="关闭窗口 (ESC)"
                  aria-label="关闭认证窗口"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* 左栏：注册 / 登录 / 找回密码 / 注册成功欢迎卡 */}
              <div className="lg:col-span-6 bg-[#f6f6f8] rounded-2xl p-4 sm:p-7 flex flex-col justify-between text-left border border-white/90 overflow-y-auto max-h-[calc(100dvh-2.5rem)] lg:max-h-none modal-scroll-contain overscroll-contain">
                {registeredWelcome ? (
                  <div className="space-y-3.5 my-auto py-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>研学空间创建成功 · 已自动登入</span>
                    </div>

                    <div>
                      <h2
                        id="auth-modal-heading"
                        className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
                      >
                        欢迎加入研核，{registeredWelcome.username}！
                      </h2>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        您的独立双链知识库与新人研学礼遇已全部就绪：
                      </p>
                    </div>

                    {/* 若成功继承了试玩成果，展示醒目回执卡片 */}
                    {registeredWelcome.inheritResult?.inherited && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-indigo-800">
                          <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                          <span>已自动继承您的首页试玩学习记录！</span>
                        </div>
                        <p className="text-[11.5px] text-indigo-900/85 leading-relaxed">
                          系统已为您生成首篇双链笔记{' '}
                          <code className="px-1 py-0.5 rounded bg-white border border-indigo-200 text-indigo-800">
                            00-试玩留存笔记/首篇研学试玩精华.md
                          </code>
                          {registeredWelcome.inheritResult.conversationsSynced > 0 && '、同步 AI 导师试玩会话'}
                          {registeredWelcome.inheritResult.errorsSaved > 0 &&
                            `、并录入 ${registeredWelcome.inheritResult.errorsSaved} 道待复盘错题`}
                          。
                        </p>
                      </div>
                    )}

                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/90 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">新人初始研学积分已到账</div>
                          <div className="text-2xs text-slate-500">可用于 AI 导师深度答疑与英语作文精批</div>
                        </div>
                      </div>
                      <span className="text-lg font-extrabold text-emerald-600 tabular-nums">
                        +{registeredWelcome.points.toFixed(1)} 积分
                      </span>
                    </div>

                    {registeredWelcome.recoveryCode && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300/80 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span>您的专属应急救援码（建议复制保存）</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRecoveryCode(registeredWelcome.recoveryCode!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-2xs font-bold transition-colors cursor-pointer"
                          >
                            {copiedRecovery ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>一键复制</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="py-2 px-3 rounded-xl bg-white border border-amber-200 font-mono text-sm font-extrabold text-slate-900 tracking-wider text-center select-all">
                          {registeredWelcome.recoveryCode}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const dest = registeredWelcome.targetPath
                          setRegisteredWelcome(null)
                          setAuthModalOpen(false)
                          navigate(dest, { replace: true })
                        }}
                        className="py-3 px-4 rounded-xl landing-cta-primary text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="truncate">进入{registeredWelcome.targetLabel}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                      {registeredWelcome.inheritResult?.notesCreated ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRegisteredWelcome(null)
                            setAuthModalOpen(false)
                            navigate('/editor', { replace: true })
                          }}
                          className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>查看首篇试玩笔记</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-2xs ring-1 ring-rose-200/70 shrink-0">
                          <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-extrabold text-sm text-slate-900">CoreForge 研核工作台</span>
                      </div>

                      {contextBannerHint && modalTab !== 'forgot' && (
                        <div className="mb-3.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-medium flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{contextBannerHint}</span>
                        </div>
                      )}

                      {initialized && modalTab !== 'forgot' && (
                        <div className="mb-4 grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#e4e5e9] border border-black/[0.05]">
                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('register')
                              setModalError(null)
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              modalTab === 'register'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                            <span>极速注册 (赠5积分)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('login')
                              setModalError(null)
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              modalTab === 'login'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>已有账号登录</span>
                          </button>
                        </div>
                      )}

                      <h2
                        id="auth-modal-heading"
                        className="text-lg sm:text-[22px] leading-tight tracking-tight font-extrabold text-[#18181b] mb-1"
                      >
                        {!initialized
                          ? '初始化首位管理员空间'
                          : modalTab === 'forgot'
                          ? '安全找回研学密码'
                          : modalTab === 'register'
                          ? '10 秒创建个人专属研学账号'
                          : '欢迎回到研核备考空间'}
                      </h2>
                      <p className="text-xs text-slate-500 mb-4">
                        {modalTab === 'forgot'
                          ? '支持安全密保问答或 8 位专属救援码自助重置'
                          : modalTab === 'register'
                          ? '无需手机号验证，试玩记录自动继承并立赠 5.0 积分'
                          : '登录后自动同步您的刷题记录、错题归因与闪卡进度'}
                      </p>

                      {modalError && (
                        <div
                          role="alert"
                          className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{modalError}</span>
                        </div>
                      )}

                      {resetSuccessMessage && (
                        <div
                          role="status"
                          className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{resetSuccessMessage}</span>
                        </div>
                      )}

                      {modalTab !== 'forgot' ? (
                        <form noValidate onSubmit={handleModalAuthSubmit} className="space-y-3">
                          <div>
                            <label
                              htmlFor="landing-auth-username"
                              className="block text-xs font-bold text-slate-700 mb-1"
                            >
                              研学账号名称 <span aria-hidden="true" className="text-rose-500">*</span>
                            </label>
                            <input
                              id="landing-auth-username"
                              name="username"
                              type="text"
                              required
                              autoComplete="username"
                              autoCorrect="off"
                              autoCapitalize="none"
                              spellCheck={false}
                              value={modalUsername}
                              onChange={(e) => {
                                setModalUsername(e.target.value)
                                if (modalError) setModalError(null)
                              }}
                              placeholder={
                                modalTab === 'register'
                                  ? '字母或数字组合，至少 3 位 (如 kaoyan27)'
                                  : '请输入您的研学账号'
                              }
                              className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300/90 text-[#18181b] placeholder-[#9ca3af] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                            />
                          </div>

                          {(modalTab === 'register' || !initialized) && (
                            <div>
                              <label
                                htmlFor="landing-auth-nickname"
                                className="block text-xs font-bold text-slate-700 mb-1"
                              >
                                研学昵称 <span className="font-normal text-slate-400">(选填，用于伴学称呼)</span>
                              </label>
                              <input
                                id="landing-auth-nickname"
                                name="displayName"
                                type="text"
                                autoComplete="nickname"
                                value={modalDisplayName}
                                onChange={(e) => setModalDisplayName(e.target.value)}
                                placeholder="例如：一战成硕的小研"
                                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300/90 text-[#18181b] placeholder-[#9ca3af] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                              />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label
                                htmlFor="landing-auth-password"
                                className="block text-xs font-bold text-slate-700"
                              >
                                登录密码 <span aria-hidden="true" className="text-rose-500">*</span>
                              </label>
                              {modalTab === 'login' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModalTab('forgot')
                                    setModalError(null)
                                    setForgotStep(1)
                                    setForgotUsername(modalUsername)
                                  }}
                                  className="text-2xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                >
                                  忘记密码？
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                id="landing-auth-password"
                                name="password"
                                type={showModalPassword ? 'text' : 'password'}
                                required
                                autoComplete={modalTab === 'register' ? 'new-password' : 'current-password'}
                                value={modalPassword}
                                onChange={(e) => {
                                  setModalPassword(e.target.value)
                                  if (modalError) setModalError(null)
                                }}
                                placeholder="至少 6 位字符"
                                className="w-full py-2.5 pl-3 pr-10 rounded-xl bg-white border border-slate-300/90 text-[#18181b] placeholder-[#9ca3af] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowModalPassword((v) => !v)}
                                aria-pressed={showModalPassword}
                                aria-label={showModalPassword ? '隐藏密码文本' : '显示密码文本'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                              >
                                {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {modalTab === 'register' && (
                            <div>
                              <label
                                htmlFor="landing-auth-confirm"
                                className="block text-xs font-bold text-slate-700 mb-1"
                              >
                                确认登录密码 <span aria-hidden="true" className="text-rose-500">*</span>
                              </label>
                              <input
                                id="landing-auth-confirm"
                                name="confirmPassword"
                                type={showModalPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={modalConfirmPassword}
                                onChange={(e) => {
                                  setModalConfirmPassword(e.target.value)
                                  if (modalError) setModalError(null)
                                }}
                                placeholder="再次输入登录密码"
                                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300/90 text-[#18181b] placeholder-[#9ca3af] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={modalLoading}
                            className="w-full py-3 px-4 rounded-xl landing-cta-primary text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                          >
                            {modalLoading ? (
                              <span>正在安全处理并同步试玩记录...</span>
                            ) : modalTab === 'register' ? (
                              <>
                                <Gift className="w-4 h-4 text-amber-300" />
                                <span>
                                  {trialSummary.totalFootprints > 0
                                    ? `创建账号 · 继承 ${trialSummary.totalFootprints} 项试玩并领积分`
                                    : '立即创建账号 · 领取 5.0 积分'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>登入并打开{pendingTarget.label}</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          {forgotStep === 1 ? (
                            <form onSubmit={handleQuerySecurityQuestion} className="space-y-3">
                              <div>
                                <label
                                  htmlFor="forgot-username"
                                  className="block text-xs font-bold text-slate-700 mb-1"
                                >
                                  需要找回的账号名称
                                </label>
                                <input
                                  id="forgot-username"
                                  type="text"
                                  required
                                  autoCorrect="off"
                                  autoCapitalize="none"
                                  spellCheck={false}
                                  value={forgotUsername}
                                  onChange={(e) => setForgotUsername(e.target.value)}
                                  placeholder="请输入您的用户名"
                                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-[#18181b] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full py-3 px-4 rounded-xl bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60"
                              >
                                {modalLoading ? '正在检索安全通道...' : '下一步：验证身份'}
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-200/80 text-slate-700 font-semibold">
                                <span>目标账号：{forgotUsername}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForgotStep(1)
                                    setModalError(null)
                                  }}
                                  className="text-indigo-600 hover:underline cursor-pointer text-2xs"
                                >
                                  更换账号
                                </button>
                              </div>

                              {!useRecoveryCodeMode && hasSecurityQuestion ? (
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                                    <span className="font-bold">预设密保问题：</span>
                                    <div className="mt-0.5 font-medium">{securityQuestion}</div>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    placeholder="请输入密保问题答案"
                                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-[#18181b] text-base sm:text-[13px]"
                                  />
                                  <div className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => setUseRecoveryCodeMode(true)}
                                      className="text-2xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                    >
                                      改用 8 位专属救援码验证 →
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs leading-relaxed">
                                    请输入注册时系统颁发的专属救援码（格式如 CF-XXXX-XXXX）：
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    autoCorrect="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    value={recoveryCodeInput}
                                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                                    placeholder="例如 CF-78A9-2B4C"
                                    className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-[#18181b] text-base sm:text-[13px] font-mono uppercase"
                                  />
                                  {hasSecurityQuestion && (
                                    <div className="text-right">
                                      <button
                                        type="button"
                                        onClick={() => setUseRecoveryCodeMode(false)}
                                        className="text-2xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                      >
                                        ← 改用密保问题验证
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                placeholder="设置新密码 (至少 6 位)"
                                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-[#18181b] text-base sm:text-[13px]"
                              />

                              <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="再次输入确认新密码"
                                className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-[#18181b] text-base sm:text-[13px]"
                              />

                              <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60"
                              >
                                {modalLoading ? '正在重置密码...' : '确认重置新密码'}
                              </button>
                            </form>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('login')
                              setModalError(null)
                              setForgotStep(1)
                            }}
                            className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer font-semibold"
                          >
                            ← 返回账号登录
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200/90 mt-4 flex items-center justify-between text-2xs text-slate-500">
                      <span>标准 Markdown 随时导出 · 独立沙盒隔离</span>
                      <span className="font-mono">{OFFICIAL_DOMAIN_HOST}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 右栏：新人注册专属权益与试玩状态继承看板 */}
              <div className="hidden lg:flex lg:col-span-6 flex-col justify-between rounded-2xl bg-gradient-to-br from-[#12141f] via-[#171b2e] to-[#0f172a] text-white p-7 border border-white/10">
                <div className="space-y-5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-2xs font-bold">
                      新用户立享全部核心权益
                    </span>
                    <span className="text-2xs font-mono text-slate-400">
                      距初试 {countdown.days} 天
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-white">
                      试玩成果无缝继承，沉淀终身知识库
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      您在首页试玩实验室产生的提问解答、做题草稿与错因收藏，注册后自动写入个人空间。
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        title: '自动保留试玩首篇笔记与错题记录',
                        desc: '无缝继承刚才的 AI 导师解答、高数判分与闪卡自评，拒绝重头再来',
                      },
                      {
                        title: '立赠 5.0 初始 AI 研学积分',
                        desc: '畅享 408/数学大题逐级启发点拨与考研英语 20 分制智能精批',
                      },
                      {
                        title: '1987–2024 统考真题库 + 艾宾浩斯闪卡',
                        desc: '做错真题自动三维归因，每日按遗忘曲线精准推送待巩固卡片',
                      },
                      {
                        title: '多端云同步 + 100% 本地 Markdown 导出',
                        desc: '手机电脑实时接力，所有笔记随时一键打包导出到本地硬盘或 Obsidian',
                      },
                    ].map((benefit) => (
                      <div
                        key={benefit.title}
                        className="p-3 rounded-xl bg-white/[0.06] border border-white/10 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">{benefit.title}</div>
                          <div className="text-2xs text-slate-300 mt-0.5">{benefit.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-2xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src="/pets/nailong_happy.png"
                      alt="伴学桌宠"
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-slate-300 font-medium">官方认证域名：{OFFICIAL_DOMAIN_HOST}</span>
                  </div>
                  <span className="text-emerald-300 font-bold">免费开放注册</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 全屏沉浸式试玩视窗模态框（与内嵌试玩共享同一份持久化状态，来回切换零丢失！） */}
      {fullScreenSandbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-dvh overflow-hidden select-none animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="全屏沉浸试玩实验室"
          >
            <div className="min-h-12 px-2.5 sm:px-5 py-1.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-1.5 shrink-0 pt-[max(0.375rem,env(safe-area-inset-top,0px))]">
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center overflow-hidden rounded-lg border border-rose-200/30 shadow-xs shrink-0">
                  <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
                </div>
                <span className="hidden sm:inline font-extrabold text-white text-sm whitespace-nowrap">
                  全屏试玩实验室
                </span>
                {trialSummary.totalFootprints > 0 && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-2xs font-bold">
                    <BookmarkCheck className="w-3 h-3" />
                    <span>已同步暂存 {trialSummary.totalFootprints} 项记录</span>
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex justify-center">
                <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-slate-800/90 border border-slate-700 text-2xs sm:text-xs max-w-full overflow-x-auto no-scrollbar">
                  {[
                    { id: '408' as const, short: '408', full: '408 仿真', activeCls: 'bg-indigo-600 text-white' },
                    { id: 'math' as const, short: '数学', full: '数学判分', activeCls: 'bg-pink-600 text-white' },
                    { id: 'english' as const, short: '英语', full: '英语升格', activeCls: 'bg-sky-600 text-white' },
                    { id: 'politics' as const, short: '史纲', full: '史纲时空', activeCls: 'bg-amber-500 text-slate-950 font-black' },
                    { id: 'ai' as const, short: 'AI 导师', full: 'AI 导师', activeCls: 'bg-violet-600 text-white' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMode(tab.id)}
                      className={`px-2 sm:px-3 py-1 rounded-lg font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        activeMode === tab.id ? `${tab.activeCls} shadow-xs` : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="sm:hidden">{tab.short}</span>
                      <span className="hidden sm:inline">{tab.full}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setFullScreenSandbox(false)
                      openAuthWithIntent('register', {
                        path:
                          trialSummary.aiTurnsCount > 0
                            ? '/chat'
                            : modeConfigs[activeMode].targetPath,
                        label:
                          trialSummary.aiTurnsCount > 0
                            ? 'AI 伴学工作台'
                            : modeConfigs[activeMode].targetLabel,
                      })
                    }}
                    className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-2xs sm:text-xs font-extrabold transition-all cursor-pointer"
                  >
                    <span>
                      {trialSummary.totalFootprints > 0
                        ? `注册保存(${trialSummary.totalFootprints})`
                        : '免费注册'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFullScreenSandbox(false)}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-2xs sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                  title="退出全屏返回页面（当前问答与草稿进度自动保留）"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>返回页面</span>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0 bg-slate-950 relative overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom,0px)]">
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
                      handleLaunchModule('/politics', '史纲时空大本营')
                    }}
                  />
                </div>
              ) : activeMode === 'math' ? (
                <div className="w-full h-full flex flex-col overflow-hidden bg-[#0b0f19]">
                  <MathTrialDemo
                    fullscreen
                    onEnter={() => {
                      setFullScreenSandbox(false)
                      handleLaunchModule('/quiz?domain=math', '考研数学实战舱')
                    }}
                  />
                </div>
              ) : activeMode === 'ai' ? (
                <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0f1c]">
                  <AgentTrialDemo
                    fullscreen
                    onEnter={() => {
                      setFullScreenSandbox(false)
                      handleLaunchModule('/chat', '多智能体伴学工作台')
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col overflow-hidden bg-[#0a0f1d]">
                  <EnglishTrialDemo
                    fullscreen
                    onEnter={() => {
                      setFullScreenSandbox(false)
                      handleLaunchModule('/english', '考研英语作文精批舱')
                    }}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
