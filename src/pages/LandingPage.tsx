import { avlTreeCourseware } from '../data/coursewares/avlTree'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  Download,
  Laptop,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  X,
  KeyRound,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Menu,
  Eye,
  EyeOff,
  Copy,
  Check,
  Binary,
  Calculator,
  Landmark,
  Languages,
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
import { prefetchRoute, safeLazy } from '../app/routes'
import {
  getTrialActivitySummary,
  inheritTrialDataToUserWorkspace,
  subscribeTrialBridge,
  type InheritResult,
  type TrialActivitySummary,
} from '../utils/trialStateBridge'

const UserGuideModal = safeLazy(() => import('../components/UserGuideModal'), 'landing-user-guide')

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

// 严格对齐页面从上到下的明暗节奏：试玩巨幕 -> 全景导航 -> 四核学科 -> 黑科技深空剧场 -> 权威题库 -> 多端下载
const NAV_LINKS = [
  { href: '#preview', label: '试玩舞台' },
  { href: '#hub', label: '全景导航' },
  { href: '#subjects', label: '四核学科' },
  { href: '#features', label: '互动体验' },
  { href: '#trust', label: '真题与安全' },
  { href: '#download', label: '多端下载' },
] as const

const FLYWHEEL_STEPS: Array<{
  step: string
  shortLabel: string
  title: string
  painPoint: string
  solution: string
  trialMode: ModeType
  manualCategory: string
  manualFeatureId: string
}> = [
  {
    step: '01',
    shortLabel: 'PDF 双栏精读',
    title: '讲义精读与双链沉淀合一',
    painPoint: '电子讲义与笔记软件频繁切屏，微积分与矩阵公式手敲繁琐，阅读时还容易误触改乱排版。',
    solution: '左看高清 PDF 讲义、右写双链笔记，Σ 一键插入公式并自动抽取闪卡，实时同步本地 Obsidian。',
    trialMode: 'math',
    manualCategory: 'system_collab',
    manualFeatureId: 'pdf-reader-extract',
  },
  {
    step: '02',
    shortLabel: '动态仿真推演',
    title: '22+ 算法与高数机理单步交互',
    painPoint: 'AVL 平衡旋转、页面置换、TCP 拥塞窗口与泰勒余项仅靠静态书本插图死记硬背，极易遗忘。',
    solution: '单步回放指针变换与函数逼近过程，支持自定义测试序列，把抽象原理转化为直觉记忆。',
    trialMode: '408',
    manualCategory: 'courseware_tools',
    manualFeatureId: 'interactive-courseware',
  },
  {
    step: '03',
    shortLabel: '整卷模考精批',
    title: '真题整卷演草与启发式点拨',
    painPoint: '普通题库只有冷冰冰的对错判定，大题卡壳无人引导破题思路，英语大小作文难以客观自评。',
    solution: '配备分色答题卡与顺滑演草白板，随时唤起分科 AI 导师逐级点拨，作文 1.2 秒四维批改升格。',
    trialMode: 'english',
    manualCategory: 'quick_start',
    manualFeatureId: 'quiz-modes',
  },
  {
    step: '04',
    shortLabel: '热力靶向急救',
    title: '掌握度拓扑与 5 题定点清零',
    painPoint: '中后期复习容易陷入低效重复，熟题反复刷，真正考场失分的高危盲区却藏在视野死角。',
    solution: '三维掌握度星图自动定位薄弱红点，单击即刻开启“看错题 → 看仿真 → 练 5 题”靶向抢救。',
    trialMode: 'ai',
    manualCategory: 'spectrum_graph',
    manualFeatureId: 'mastery-spectrum',
  },
  {
    step: '05',
    shortLabel: 'SM-2 抗遗忘',
    title: '艾宾浩斯排期与双宠语音伴学',
    painPoint: '史纲会议、408 协议细节与核心词汇背了又忘，数百天独自冲刺枯燥漫长、难以维持心流。',
    solution: '每日清晨精准推送处于遗忘临界点的卡片，搭配大肥鱼与奶龙真人语音陪伴直至考前最后一刻。',
    trialMode: 'politics',
    manualCategory: 'ai_agent',
    manualFeatureId: 'dual-pet-companion',
  },
]

export default function LandingPage() {
  const { isAuthenticated, login, register, initAdmin, initialized } = useAuth()
  const navigate = useNavigate()
  const countdown = useExamCountdown()

  const [activeMode, setActiveMode] = useState<ModeType>('408')
  const [trialSummary, setTrialSummary] = useState<TrialActivitySummary>(() =>
    getTrialActivitySummary()
  )

  useEffect(() => {
    return subscribeTrialBridge((next) => {
      setTrialSummary(getTrialActivitySummary(next))
    })
  }, [])

  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [fullScreenSandbox, setFullScreenSandbox] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [guideModalConfig, setGuideModalConfig] = useState<{
    tab: 'tour' | 'doc' | 'roadmap'
    category?: string
    featureId?: string
  }>({ tab: 'tour' })
  const [flywheelIdx, setFlywheelIdx] = useState(0)

  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [shareSiteUrl, setShareSiteUrl] = useState<string>(OFFICIAL_DOMAIN)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const downloadSectionRef = useRef<HTMLElement | null>(null)
  const downloadInfoFetchedRef = useRef(false)

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

  const [registeredWelcome, setRegisteredWelcome] = useState<RegisteredWelcomeInfo | null>(null)
  const [copiedRecovery, setCopiedRecovery] = useState(false)

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

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3000)
  }

  const [activeSectionHref, setActiveSectionHref] = useState<string>('')

  useEffect(() => {
    const sectionIds = ['preview', 'hub', 'subjects', 'features', 'trust', 'download']
    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 12)
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 260
      setShowMobileStickyCta(y > 420 && !nearBottom)

      if (y < 220) {
        setActiveSectionHref('')
        return
      }
      let current = ''
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.getBoundingClientRect().top
          if (top <= 160) {
            current = `#${id}`
          }
        }
      }
      setActiveSectionHref(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const loadDownloadInfo = useCallback(() => {
    if (downloadInfoFetchedRef.current) return
    downloadInfoFetchedRef.current = true
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
          web: { available: true, version: '1.5.0' },
        })
      })
  }, [])

  useEffect(() => {
    const origin = window.location.origin
    const isLocalDev = /localhost|127\.0\.0\.1/.test(origin)
    const targetQrUrl = isLocalDev ? origin : OFFICIAL_DOMAIN
    setShareSiteUrl(targetQrUrl)
    QRCode.toDataURL(targetQrUrl, {
      width: 176,
      margin: 1,
      color: {
        dark: '#1d1d1f',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const targetEl = downloadSectionRef.current
    if (!targetEl) return
    if (typeof IntersectionObserver === 'undefined') {
      loadDownloadInfo()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadDownloadInfo()
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(targetEl)
    return () => observer.disconnect()
  }, [loadDownloadInfo])

  useEffect(() => {
    if (!isAuthenticated) return
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => prefetchRoute('/dashboard'), { timeout: 2500 })
      return () => win.cancelIdleCallback?.(id)
    }
    const timer = window.setTimeout(() => prefetchRoute('/dashboard'), 1500)
    return () => window.clearTimeout(timer)
  }, [isAuthenticated])

  const openAuthWithIntent = (
    tab: 'login' | 'register',
    target: PendingTarget = { path: '/dashboard', label: '研核全景工作台' },
    hint?: string
  ) => {
    prefetchRoute(target.path)
    const footprints = getTrialActivitySummary().totalFootprints
    const defaultHint =
      footprints > 0
        ? `检测到您有 ${footprints} 项试玩记录，完成后将自动同步至个人空间`
        : undefined
    setModalTab(tab)
    setPendingTarget(target)
    setContextBannerHint(hint || defaultHint || null)
    setModalError(null)
    setRegisteredWelcome(null)
    setMobileMenuOpen(false)
    setAuthModalOpen(true)
  }

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id.replace('#', ''))
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCopySiteUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareSiteUrl)
      setCopiedUrl(true)
      showToast(`已复制官方网址 ${shareSiteUrl}`)
      setTimeout(() => setCopiedUrl(false), 2400)
    } catch {
      showToast(`请手动复制官方域名：${OFFICIAL_DOMAIN}`)
    }
  }

  const handleCopyRecoveryCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedRecovery(true)
      showToast('专属应急救援码已复制到剪贴板')
      setTimeout(() => setCopiedRecovery(false), 2500)
    } catch {
      showToast('复制失败，请手动记录该救援码')
    }
  }

  const handleDownloadDesktop = () => {
    setDownloading(true)
    showToast('正在为您拉取 Windows 客户端安装包...')
    const link = document.createElement('a')
    link.href = '/api/downloads/desktop'
    link.download = downloadInfo?.desktop?.filename || 'Knowledge-Viz-Setup-1.5.0.exe'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setDownloading(false), 2600)
  }

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
            ? '账号创建成功，已为您自动导入试玩问答与错题笔记'
            : '账号创建成功，欢迎开启纯净开源研学空间'
        )
      } else {
        await login(cleanUser, modalPassword)
        const stored = getStoredUser()
        const inheritRes = await inheritTrialDataToUserWorkspace(stored?.id)
        showToast(
          inheritRes.inherited
            ? '验证通过，已将刚才的试玩问答与错题同步至您的空间'
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

  const modeConfigs: Record<
    ModeType,
    {
      title: string
      subtitle: string
      heroSubject: string
      targetPath: string
      targetLabel: string
    }
  > = {
    '408': {
      title: '研你所学，核力致胜。',
      subtitle:
        '专为 408 计算机与考研全科打造的本地优先智能工作台。历年真题推演、动态算法仿真与双链笔记无缝合一。',
      heroSubject: '408 计算机学科专业基础综合',
      targetPath: '/quiz?domain=cs_408',
      targetLabel: '408 计算机真题实战舱',
    },
    math: {
      title: '定理推导，一步不漏。',
      subtitle:
        '出版级 KaTeX 公式排版与顺滑演草白板。覆盖 1987–2024 年统考数学真题，为大题证明提供苏格拉底式逐级启发。',
      heroSubject: '全国硕士研究生考研数学（数一/二/三）',
      targetPath: '/quiz?domain=math',
      targetLabel: '考研数学推导实战舱',
    },
    politics: {
      title: '时空浩瀚，史纲通达。',
      subtitle:
        '高精度中国历史地图串联 1839–2026 核心史实，涵盖同城多史实对比、十五五时政要点与精选千题遮罩自测。',
      heroSubject: '考研政治 · 1839–2026 史纲全景大本营',
      targetPath: '/politics',
      targetLabel: '考研政治史纲大本营',
    },
    english: {
      title: '笔耕不辍，下笔有神。',
      subtitle:
        '完形、阅读与新题型全真排版点词即查，大小作文约 1.2 秒四维阅卷精批，配齐拼写默写与耳机巡航背词系统。',
      heroSubject: '考研英语 · 全题型研学与智能批改舱',
      targetPath: '/english',
      targetLabel: '考研英语作文精批舱',
    },
    ai: {
      title: '四科导师，思考可见。',
      subtitle:
        '内置研小核、数小通、英小研、政小思专属智能体，DeepSeek 破题思考流逐字直出，更有双宠语音温暖伴学。',
      heroSubject: '分科专属 AI 导师协同工作台',
      targetPath: '/chat',
      targetLabel: '多智能体伴学工作台',
    },
  }

  const activeFlywheel = FLYWHEEL_STEPS[flywheelIdx] || FLYWHEEL_STEPS[0]

  return (
    <div
      className={`min-h-dvh apple-page-canvas font-sans flex flex-col selection:bg-[#0071e3] selection:text-white relative w-full max-w-full ${
        !isAuthenticated ? 'pb-20 md:pb-0' : ''
      }`}
    >
      {/* 浮动吐司通知 */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[130] flex items-center gap-2.5 bg-[#1d1d1f] text-[#f5f5f7] text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 animate-fade-in-up max-w-[calc(100vw-2rem)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] shrink-0" />
          <span className="break-words">{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          Apple Global Nav 极简冰晶磨砂顶栏
         ===================================================================== */}
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-200 pt-[env(safe-area-inset-top,0px)] ${
          isScrolled || mobileMenuOpen ? 'apple-glass-nav' : 'bg-[#fbfbfd]/90 backdrop-blur-md'
        }`}
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 min-h-12 sm:min-h-[52px] flex items-center justify-between gap-4">
          {/* 左侧：克制纯净的品牌标识 */}
          <Link to="/" className="group flex items-center gap-2.5 focus:outline-none shrink-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center ring-1 ring-black/[0.08] shrink-0">
              <img src="/icon-192.png?v=dango" alt="研核图标" className="h-full w-full object-cover" />
            </div>
            <span className="font-semibold text-[15px] tracking-[-0.02em] text-[#1d1d1f]">
              CoreForge <span className="text-[#6e6e73] font-normal">研核</span>
            </span>
          </Link>

          {/* 中部：Apple 纯文字章节导航（带 aria-current 与底部微点指示） */}
          <nav aria-label="主页分区导航" className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isCurrent = activeSectionHref === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrent ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveSectionHref(link.href)
                    scrollToSection(link.href)
                  }}
                  className={`relative py-1 text-xs transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#1d1d1f] font-semibold'
                      : 'text-[#515154] hover:text-[#1d1d1f] font-normal'
                  }`}
                >
                  {link.label}
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-1 -bottom-1 h-[2px] rounded-full bg-[#1d1d1f]"
                    />
                  )}
                </a>
              )
            })}
          </nav>

          {/* 右侧：干净利落的文字链 + Apple Blue 胶囊按钮 */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                setGuideModalConfig({ tab: 'tour' })
                setGuideModalOpen(true)
              }}
              className="hidden sm:inline-flex items-center text-xs font-normal text-[#515154] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            >
              产品导览
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="min-h-8 px-4 py-1.5 rounded-full text-xs font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white transition-colors cursor-pointer"
              >
                进入工作台
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthWithIntent('login')}
                  className="text-xs font-normal text-[#515154] hover:text-[#1d1d1f] transition-colors cursor-pointer px-1"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => openAuthWithIntent('register')}
                  className="min-h-8 px-4 py-1.5 rounded-full text-xs font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white transition-colors cursor-pointer"
                >
                  免费开始
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label={mobileMenuOpen ? '收起导航菜单' : '展开导航菜单'}
              className="lg:hidden w-9 h-9 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-[#1d1d1f] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 移动端极简下拉面板 */}
        {mobileMenuOpen && (
          <div
            id="mobile-site-menu"
            className="lg:hidden border-t border-black/[0.06] bg-[#fbfbfd]/98 backdrop-blur-2xl px-6 py-5 shadow-lg animate-fade-in-up"
          >
            <div className="divide-y divide-black/[0.06] mb-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(link.href)
                  }}
                  className="py-3 text-sm font-medium text-[#1d1d1f] flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#86868b]" />
                </a>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setGuideModalConfig({ tab: 'tour' })
                  setGuideModalOpen(true)
                }}
                className="min-h-10 py-2.5 px-3 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium cursor-pointer"
              >
                1 分钟产品导览
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setMobilePreviewOpen(true)
                }}
                className="min-h-10 py-2.5 px-3 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium cursor-pointer"
              >
                预览手机界面
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          第一幕：Apple Hero 居中大留白舞台 + Studio Display 真机试玩巨幕 (#preview)
         ===================================================================== */}
      <section className="w-full min-w-0 flex flex-col items-center px-4 sm:px-8 pt-12 sm:pt-20 pb-8 sm:pb-12 text-center">
        {/* 克制清雅的倒计时眉标 */}
        <p className="text-xs sm:text-[13px] font-medium tracking-wide text-[#6e6e73] mb-5">
          <span>{countdown.targetLabel.split(' ')[0]} 初试冲刺</span>
          <span className="mx-2 text-[#d2d2d7]">·</span>
          <span>
            剩余 <strong className="font-semibold text-[#1d1d1f] tabular-nums">{countdown.days}</strong> 天
          </span>
        </p>

        {/* Apple 原生滑动质感五核分段胶囊 */}
        <div
          role="group"
          aria-label="切换预览学科模式"
          className="apple-segmented-track max-w-full overflow-x-auto no-scrollbar mb-7 sm:mb-9"
        >
          {[
            { id: '408' as const, label: '408 计算机', mobileLabel: '408' },
            { id: 'math' as const, label: '考研数学', mobileLabel: '数学' },
            { id: 'politics' as const, label: '考研政治', mobileLabel: '政治' },
            { id: 'english' as const, label: '考研英语', mobileLabel: '英语' },
            { id: 'ai' as const, label: 'AI 导师', mobileLabel: 'AI 导师' },
          ].map((tab) => {
            const active = activeMode === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMode(tab.id)}
                aria-pressed={active}
                className={`apple-segmented-pill whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'apple-segmented-pill-active' : ''
                }`}
              >
                <span className="sm:hidden">{tab.mobileLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Apple Display 锋利大标题 */}
        <h1 className="apple-display-hero max-w-4xl mx-auto px-1 mb-4 sm:mb-5">
          {modeConfigs[activeMode].title}
        </h1>

        {/* 清透副标题（控制在 60 字符最佳阅读行宽内） */}
        <p className="text-[15px] sm:text-[19px] md:text-[21px] font-normal tracking-[-0.012em] text-[#6e6e73] max-w-[58ch] mx-auto mb-8 sm:mb-9 landing-pretty-copy">
          {modeConfigs[activeMode].subtitle}
        </p>

        {/* Apple 标志性双圆角胶囊行动组 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 mb-5">
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
            className="apple-btn-blue cursor-pointer"
          >
            <span>
              {isAuthenticated
                ? `进入${modeConfigs[activeMode].targetLabel}`
                : '免费开启专属空间'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('#preview')}
            className="apple-btn-outline cursor-pointer"
          >
            <span>免登录试玩体验</span>
          </button>
        </div>

        {/* 次级导览文字链 */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-[13px] text-[#6e6e73]">
          <button
            type="button"
            onClick={() => {
              setGuideModalConfig({ tab: 'tour' })
              setGuideModalOpen(true)
            }}
            className="inline-flex items-center gap-0.5 text-[#0066cc] hover:underline font-medium cursor-pointer"
          >
            <span>观看 1 分钟视觉功能巡礼</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="hidden sm:inline text-[#d2d2d7]">|</span>
          <span>免手机号 10 秒注册 · 试玩记录自动继承 · 本地 Markdown 自由导出</span>
        </div>
      </section>

      {/* Studio Display 阳极氧化黑窄边框免登录真机试玩巨幕 */}
      <section id="preview" className="w-full min-w-0 max-w-[1200px] mx-auto px-3.5 sm:px-8 pt-2 pb-20 sm:pb-28">
        {/* 手机端极简全屏切换条 */}
        <div className="sm:hidden w-full min-w-0 mb-3 px-4 py-3 rounded-2xl bg-[#1d1d1f] text-[#f5f5f7] flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <div className="text-xs font-semibold">全屏沉浸试玩模式</div>
            <div className="text-[11px] text-[#a1a1a6] truncate">问答与演草进度实时同步保留</div>
          </div>
          <button
            type="button"
            onClick={() => setFullScreenSandbox(true)}
            className="min-h-8 px-3.5 py-1.5 rounded-full bg-[#0071e3] text-white text-xs font-medium shrink-0 cursor-pointer"
          >
            全屏展开
          </button>
        </div>

        {/* 视窗顶栏状态行 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 px-1">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6e6e73]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#1d1d1f]">
              <span className="w-2 h-2 rounded-full bg-[#30d158]" />
              <span>免登录互动沙盒</span>
            </span>
            {trialSummary.totalFootprints > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openAuthWithIntent('register')
                }}
                className="inline-flex items-center gap-1 text-[#0066cc] hover:underline font-medium cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  已暂存 {trialSummary.totalFootprints} 项试玩记录
                  {!isAuthenticated ? '，注册即自动归档 ›' : ''}
                </span>
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#f5f5f7] max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: '408' as const, label: '408 仿真' },
              { id: 'math' as const, label: '数学判分' },
              { id: 'english' as const, label: '英语精批' },
              { id: 'politics' as const, label: '史纲地图' },
              { id: 'ai' as const, label: 'AI 导师' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMode(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeMode === item.id
                    ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Display 深空黑硬件窄边框视窗 */}
        <div className="cinema-dark-lock w-full min-w-0 rounded-[28px] bg-[#1d1d1f] p-1.5 sm:p-2.5 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.22)]">
          <div className="w-full min-w-0 rounded-[20px] bg-[#0b0d13] border border-white/[0.08] overflow-hidden text-left">
            {/* macOS 深空窗口标题栏 */}
            <div className="min-h-11 px-4 bg-[#161618] border-b border-white/[0.07] flex items-center justify-between gap-2 text-xs text-[#a1a1a6]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="hidden xs:flex items-center gap-1.5 shrink-0 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="font-medium text-[#f5f5f7] truncate text-xs">
                  {modeConfigs[activeMode].heroSubject}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setFullScreenSandbox(true)}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] font-medium text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>全屏展开</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleLaunchModule(
                      modeConfigs[activeMode].targetPath,
                      modeConfigs[activeMode].targetLabel
                    )
                  }
                  className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[11px] transition-colors cursor-pointer"
                >
                  <span>{isAuthenticated ? '进入完整舱室' : '开启完整舱室'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 免登录动手试玩核心舞台 */}
            <div className="w-full min-w-0 min-h-[500px] bg-slate-950 text-white relative overflow-hidden">
              {activeMode === '408' ? (
                <div className="flex flex-col h-[520px] w-full min-w-0">
                  <div className="px-4 py-2.5 bg-[#121318] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 max-w-full">
                      <span className="text-[#2997ff] font-medium shrink-0">数据结构动态仿真</span>
                      <span className="text-[#d2d2d7] truncate min-w-0">
                        AVL 平衡二叉树自平衡旋转（LL / RR / LR / RL）
                      </span>
                    </div>
                    <span className="text-[11px] text-[#86868b]">
                      点击下方画布插入节点，单步观察平衡因子变化
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

            {/* 视窗底部：克制的深空状态继承条 */}
            {!isAuthenticated && (
              <div className="px-5 sm:px-6 py-3.5 bg-[#161618] border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#f5f5f7]">
                <div className="text-xs sm:text-[13px] text-[#a1a1a6]">
                  {trialSummary.totalFootprints > 0 ? (
                    <span>
                      已实时暂存 <strong className="text-[#f5f5f7] font-semibold">{trialSummary.totalFootprints} 项试玩成果</strong>，创建账号后将自动生成首篇双链笔记与错题记录。
                    </span>
                  ) : (
                    <span>
                      在上方产生的提问、演草与错题，注册后将<strong className="text-[#f5f5f7] font-medium">自动同步至个人知识库</strong>，永久保存在本地。
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
                  className="min-h-8 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  {trialSummary.totalFootprints > 0
                    ? `保存这 ${trialSummary.totalFootprints} 项记录`
                    : '免费创建专属账号'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          第二幕：全景工作台导览 (#hub · Apple Highlights 非对称 Bento 导航墙)
         ===================================================================== */}
      <InteractiveBentoShowcase
        mode="hub-only"
        isAuthenticated={isAuthenticated}
        onLaunchModule={handleLaunchModule}
        onOpenRegister={(hint) => openAuthWithIntent('register', undefined, hint)}
      />

      {/* =====================================================================
          第三幕：考研四核产品阵列 (#subjects · 纯白 #FFFFFF 画布 + 无框钛灰长卡)
         ===================================================================== */}
      <section id="subjects" className="w-full min-w-0 apple-section-white py-20 sm:py-28">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 space-y-16 sm:space-y-22">
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#6e6e73] mb-2.5">
                四大统考核心科目
              </p>
              <h2 className="apple-section-headline text-[#1d1d1f]">
                为每一门硬仗，量身定制专业工具链。
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-[#6e6e73] landing-pretty-copy">
                告别泛泛而谈的通用记事本，针对 408 计算机、数学、政治与英语的学科特性深度打磨。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                {
                  mode: '408' as const,
                  eyebrow: 'CS · 408 统考综合',
                  path: '/quiz?domain=cs_408',
                  title: '计算机专业基础',
                  desc: '2009–2024 年真题逐题精析，将平衡树旋转、Cache 映射、PV 信号量与 TCP 拥塞窗口全链路贯通。',
                  icon: Binary,
                  specs: ['树与图动态算法沙盒', '指令流水线与存储层次', 'PV 同步死锁推演', 'TCP/IP 协议栈精解'],
                },
                {
                  mode: 'math' as const,
                  eyebrow: 'MATH · 数一 / 二 / 三',
                  path: '/quiz?domain=math',
                  title: '全国考研数学',
                  desc: '原生出版级 KaTeX 公式引擎，针对中值定理证明、多元微积分与特征值二次型提供按步踩分启发。',
                  icon: Calculator,
                  specs: ['38 年统考整卷精校', '泰勒与中值定理仿真', '特征值空间变换推演', '屏幕演草分步启发'],
                },
                {
                  mode: 'politics' as const,
                  eyebrow: 'POLITICS · 1839–2026',
                  path: '/politics',
                  title: '考研思想政治',
                  desc: '高精度矢量中国地图同城史实循环联动，涵盖“史上第一次”汇总、十五五时政热点与千题遮罩自测。',
                  icon: Landmark,
                  specs: ['1839–2026 史纲全景图', '同城多史实循环联动', '十五五规划时政要点', '精选千题错项排雷'],
                },
                {
                  mode: 'english' as const,
                  eyebrow: 'ENGLISH · 英一 / 英二',
                  path: '/english',
                  title: '全国考研英语',
                  desc: '完形、阅读、新题型与翻译整卷点词即查，大小作文约 1.2 秒四维批改升格，配默写与巡航词库。',
                  icon: Languages,
                  specs: ['真题整卷点词生词本', '20 分制四维阅卷精批', '拼写默写与耳机巡航', '5 阶词根衍生色谱'],
                },
              ].map((subj) => {
                const Icon = subj.icon
                return (
                  <div
                    key={subj.mode}
                    className="apple-tile-gray p-7 sm:p-8 flex flex-col justify-between gap-7 text-left"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-2xl bg-white text-[#1d1d1f] shadow-2xs flex items-center justify-center mb-5">
                        <Icon className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                      </div>

                      <p className="text-[11px] font-semibold tracking-wider text-[#86868b]">
                        {subj.eyebrow}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold tracking-[-0.022em] text-[#1d1d1f]">
                        {subj.title}
                      </h3>
                      <p className="mt-2.5 text-[13px] text-[#6e6e73] leading-relaxed landing-pretty-copy">
                        {subj.desc}
                      </p>

                      <ul className="mt-5 divide-y divide-black/[0.06] border-t border-black/[0.06] text-xs text-[#1d1d1f]/85 font-medium">
                        {subj.specs.map((sp) => (
                          <li key={sp} className="py-2.5">
                            {sp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => handleLaunchModule(subj.path, subj.title)}
                        className="min-h-9 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        {isAuthenticated ? '进入专区' : '开启学习'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode(subj.mode)
                          scrollToSection('#preview')
                        }}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0066cc] hover:underline cursor-pointer"
                      >
                        <span>试玩体验</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 极简五步提分闭环流转台（Apple Editorial Stepper） */}
          <div className="apple-tile-gray p-7 sm:p-10 text-left">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-7 border-b border-black/[0.06]">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#6e6e73] mb-1.5">
                  五步提分闭环
                </p>
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                  从啃透讲义到考场抢分，环环相扣。
                </h3>
              </div>

              <div
                role="tablist"
                aria-label="备考闭环五步切换"
                className="apple-segmented-track max-w-full overflow-x-auto no-scrollbar self-start lg:self-auto"
              >
                {FLYWHEEL_STEPS.map((st, idx) => {
                  const active = flywheelIdx === idx
                  return (
                    <button
                      key={st.step}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFlywheelIdx(idx)}
                      className={`apple-segmented-pill whitespace-nowrap cursor-pointer ${
                        active ? 'apple-segmented-pill-active' : ''
                      }`}
                    >
                      {st.step} {st.shortLabel}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-7 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-5 space-y-2">
                <p className="text-xs font-semibold text-[#86868b]">传统碎片化备考瓶颈</p>
                <p className="text-sm text-[#6e6e73] leading-relaxed landing-pretty-copy">
                  {activeFlywheel.painPoint}
                </p>
              </div>

              <div className="lg:col-span-5 space-y-2 lg:border-l lg:border-black/[0.08] lg:pl-8">
                <p className="text-xs font-semibold text-[#0066cc]">
                  CoreForge 研核 · {activeFlywheel.title}
                </p>
                <p className="text-sm sm:text-[15px] font-medium text-[#1d1d1f] leading-relaxed landing-pretty-copy">
                  {activeFlywheel.solution}
                </p>
              </div>

              <div className="lg:col-span-2 flex flex-row lg:flex-col items-center lg:items-end justify-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode(activeFlywheel.trialMode)
                    scrollToSection('#preview')
                  }}
                  className="min-h-9 px-4 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  试玩该环节
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuideModalConfig({
                      tab: 'doc',
                      category: activeFlywheel.manualCategory,
                      featureId: activeFlywheel.manualFeatureId,
                    })
                    setGuideModalOpen(true)
                  }}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0066cc] hover:underline cursor-pointer whitespace-nowrap"
                >
                  <span>查阅图文说明</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          第四幕：交互黑科技深空剧场 (#features · 纯黑 #000000 沉浸交互画廊)
         ===================================================================== */}
      <InteractiveBentoShowcase
        mode="features-only"
        isAuthenticated={isAuthenticated}
        onLaunchModule={handleLaunchModule}
        onOpenRegister={(hint) => openAuthWithIntent('register', undefined, hint)}
      />

      {/* =====================================================================
          第五幕：权威题库规格与真实口碑 (#trust · 浅钛灰 #F5F5F7 画布)
         ===================================================================== */}
      <TrustAndTestimonialsSection />

      {/* =====================================================================
          第六幕：多端无缝接力与终极召唤 (#download · 纯白 #FFFFFF 画布)
         ===================================================================== */}
      <section
        id="download"
        ref={downloadSectionRef}
        className="w-full min-w-0 apple-section-white py-20 sm:py-28"
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 space-y-16 sm:space-y-22">
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#6e6e73] mb-2.5">
                多端无缝协同
              </p>
              <h2 className="apple-section-headline text-[#1d1d1f]">
                全场景终端，随时切入心流。
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-[#6e6e73] landing-pretty-copy">
                书桌客户端专注深潜，手机端通勤刷卡，网页端即开即用，同一账号进度实时接力。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              {/* 1. Windows 桌面客户端 */}
              <div className="apple-tile-gray p-7 sm:p-9 flex flex-col justify-between gap-8 text-left">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1d1d1f] shadow-2xs flex items-center justify-center shrink-0">
                      <Laptop className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono text-[#6e6e73]">
                      {downloadInfo?.desktop?.version
                        ? `Windows v${downloadInfo.desktop.version}`
                        : 'Windows 64 位'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                    书桌深度备考首选
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                    Windows 桌面端
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#6e6e73] leading-relaxed landing-pretty-copy">
                    独立原生窗口隔绝浏览器娱乐干扰，支持直连本机 Obsidian 知识库目录与本地 CLI 智能体。
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#1d1d1f]/85 border-t border-black/[0.06] pt-5">
                    <li>· 独立全屏专注窗口，告别网页标签页分心</li>
                    <li>· 本地 Markdown 笔记实时双向同步与备份</li>
                    <li>· 支持桥接本机 Claude Code 与 Codex CLI</li>
                  </ul>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleDownloadDesktop}
                    disabled={downloading}
                    className="w-full min-h-11 rounded-full bg-[#1d1d1f] hover:bg-[#333336] py-3 px-5 text-xs sm:text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {downloading
                        ? '正在拉取安装包...'
                        : `下载 Windows 安装包${
                            downloadInfo?.desktop?.size ? ` (${downloadInfo.desktop.size})` : ''
                          }`}
                    </span>
                  </button>
                  <p className="mt-2.5 text-center text-[11px] text-[#86868b]">
                    免登录直接下载 · 支持 Windows 10 / 11
                  </p>
                </div>
              </div>

              {/* 2. 手机 / 平板随身端 */}
              <div className="apple-tile-gray p-7 sm:p-9 flex flex-col justify-between gap-8 text-left">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1d1d1f] shadow-2xs flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono text-[#6e6e73]">{OFFICIAL_DOMAIN_HOST}</span>
                  </div>

                  <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                    通勤与睡前碎片刷卡
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                    手机与平板随身端
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#6e6e73] leading-relaxed landing-pretty-copy">
                    支持免安装添加到主屏幕全屏运行，单手即可流畅刷闪卡、做 5 题急救与耳机巡航听单词。
                  </p>

                  {/* 桌面端显示纯净二维码卡；手机端显示主屏幕添加提示 */}
                  <div className="hidden sm:flex mt-5 rounded-2xl bg-white p-3.5 items-center gap-4 border border-black/[0.04]">
                    <div className="p-1.5 rounded-xl bg-white shrink-0 border border-black/[0.06]">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="手机扫码访问研核官网"
                          className="h-20 w-20 object-contain"
                        />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center text-xs text-[#86868b]">
                          加载中
                        </div>
                      )}
                    </div>
                    <div className="text-xs space-y-1 text-[#6e6e73]">
                      <div className="font-semibold text-[#1d1d1f]">扫码在手机打开</div>
                      <div className="font-mono text-[11px]">{OFFICIAL_DOMAIN_HOST}</div>
                      <div>浏览器菜单选择「添加到主屏幕」即可生成独立全屏图标</div>
                    </div>
                  </div>

                  <div className="sm:hidden mt-5 rounded-2xl bg-white p-4 border border-black/[0.04] text-xs text-[#6e6e73] leading-relaxed">
                    点击当前浏览器菜单中的 <strong className="text-[#1d1d1f]">「添加到主屏幕」</strong>，即可在手机桌面生成独立全屏应用图标。
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setMobilePreviewOpen(true)}
                    className="w-full min-h-11 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3 px-5 text-xs sm:text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>免登录预览手机界面</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isAuthenticated) navigate('/dashboard')
                        else openAuthWithIntent('login', undefined, '登录后自动同步手机与电脑进度')
                      }}
                      className="min-h-9 py-2 px-3 rounded-full bg-white hover:bg-black/[0.03] border border-black/[0.08] text-xs font-medium text-[#1d1d1f] transition-colors cursor-pointer"
                    >
                      {isAuthenticated ? '进入正式版' : '登录正式版'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySiteUrl}
                      className="min-h-9 py-2 px-3 rounded-full bg-white hover:bg-black/[0.03] border border-black/[0.08] text-xs font-medium text-[#1d1d1f] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedUrl ? (
                        <Check className="w-3.5 h-3.5 text-[#30d158]" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-[#6e6e73]" />
                      )}
                      <span>{copiedUrl ? '已复制链接' : '复制网址'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Web 云端空间 */}
              <div className="apple-tile-gray p-7 sm:p-9 flex flex-col justify-between gap-8 text-left">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1d1d1f] shadow-2xs flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-xs font-mono text-[#6e6e73]">
                      {downloadInfo?.web?.version ? `Cloud v${downloadInfo.web.version}` : '即开即用'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                    跨设备零安装启动
                  </p>
                  <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
                    全功能网页在线空间
                  </h3>
                  <p className="mt-2.5 text-[13.5px] text-[#6e6e73] leading-relaxed landing-pretty-copy">
                    在图书馆电脑、Mac 或 iPad 浏览器打开官网登录账号，所有笔记、错题与闪卡即刻就位。
                  </p>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#1d1d1f]/85 border-t border-black/[0.06] pt-5">
                    <li>· 10 秒免手机号创建账号，自动继承试玩记录</li>
                    <li>· 独立多租户存储空间，跨设备实时云端接力</li>
                    <li>· 支持随时一键打包导出全部标准 Markdown 笔记</li>
                  </ul>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) navigate('/dashboard')
                      else openAuthWithIntent('register')
                    }}
                    className="w-full min-h-11 rounded-full bg-[#0071e3] hover:bg-[#0077ed] py-3 px-5 text-xs sm:text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{isAuthenticated ? '进入我的网页空间' : '免费开启网页空间'}</span>
                  </button>
                  <p className="mt-2.5 text-center text-[11px] text-[#86868b]">
                    完全开源 · 本地优先 · 数据随时可导出
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 页脚前曜石黑收官横幅 */}
          <div className="cinema-dark-lock apple-tile-dark p-8 sm:p-14 text-center flex flex-col items-center justify-center gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                每一道吃透的错题，都是考场上的底气
              </p>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#f5f5f7]">
                现在开启你的 CoreForge 研核备考空间。
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed landing-pretty-copy">
                距离 {countdown.targetLabel} 还有 {countdown.days} 天。
                {trialSummary.totalFootprints > 0
                  ? `立即创建账号即可永久保存刚才产生的 ${trialSummary.totalFootprints} 项试玩成果，完全开源本地私密存储。`
                  : '用 10 秒钟创建专属账号，将零散的刷题与笔记收拢为清晰坚固的知识体系。'}
              </p>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 w-full xs:w-auto">
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) navigate('/dashboard')
                  else openAuthWithIntent('register')
                }}
                className="min-h-11 px-7 py-3 rounded-full bg-[#f5f5f7] hover:bg-white text-[#1d1d1f] font-semibold text-sm transition-colors cursor-pointer"
              >
                {isAuthenticated
                  ? '进入研学工作台'
                  : trialSummary.totalFootprints > 0
                  ? `免费注册并继承 ${trialSummary.totalFootprints} 项记录`
                  : '免费创建账号'}
              </button>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(true)}
                className="min-h-11 px-6 py-3 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-[#f5f5f7] font-medium text-sm transition-colors cursor-pointer"
              >
                预览移动端界面
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Apple 风格极简细字页脚
         ===================================================================== */}
      <footer className="border-t border-black/[0.08] apple-section-gray py-8 sm:py-10 text-[#6e6e73] text-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center md:text-left">
            <span className="font-semibold text-[#1d1d1f]">CoreForge 研核</span>
            <span className="text-[#d2d2d7]">|</span>
            <a
              href={OFFICIAL_DOMAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[#515154] hover:text-[#1d1d1f]"
            >
              <span>{OFFICIAL_DOMAIN_HOST}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="hidden sm:inline text-[#86868b]">
              · 408 计算机与考研全科智能研学工作台
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[#515154]">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(item.href)
                }}
                className="hover:text-[#1d1d1f] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => openAuthWithIntent(isAuthenticated ? 'login' : 'register')}
              className="text-[#0066cc] hover:underline font-medium cursor-pointer"
            >
              {isAuthenticated ? '进入工作台' : '登录 / 注册'}
            </button>
          </div>
        </div>
      </footer>

      {/* 移动端底部极简磨砂转化栏 */}
      {!isAuthenticated &&
        showMobileStickyCta &&
        !authModalOpen &&
        !fullScreenSandbox &&
        !mobilePreviewOpen && (
          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] apple-glass-nav border-t border-black/[0.08] flex items-center gap-2.5 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="min-h-10 px-4 py-2 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium shrink-0 cursor-pointer"
            >
              手机预览
            </button>
            <button
              type="button"
              onClick={() => openAuthWithIntent('register')}
              className="flex-1 min-h-10 py-2 px-4 rounded-full bg-[#0071e3] text-white text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="truncate">
                {trialSummary.totalFootprints > 0
                  ? `免费注册并继承 ${trialSummary.totalFootprints} 项记录`
                  : '免费开启专属空间'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
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

      {/* 免登录视觉使用手册模态框 */}
      {guideModalOpen && (
        <Suspense fallback={null}>
          <UserGuideModal
            isOpen={guideModalOpen}
            onClose={() => setGuideModalOpen(false)}
            initialTab={guideModalConfig.tab}
            initialCategory={guideModalConfig.category}
            initialFeatureId={guideModalConfig.featureId}
            isGuestMode={!isAuthenticated}
            onRequireAuth={(targetPath, targetLabel) => {
              setGuideModalOpen(false)
              handleLaunchModule(targetPath, targetLabel)
            }}
          />
        </Suspense>
      )}

      {/* Apple Sheet 风格纯净双栏认证模态框 */}
      {authModalOpen &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && !registeredWelcome) {
                setAuthModalOpen(false)
              }
            }}
            className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto modal-scroll-contain overscroll-contain animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-heading"
          >
            <div className="relative w-full max-w-[920px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(92dvh,740px)] rounded-[28px] bg-white shadow-[0_32px_80px_rgba(0,0,0,0.32)] border border-black/[0.06] grid grid-cols-1 lg:grid-cols-12 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              {!registeredWelcome && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/[0.12] lg:bg-white/[0.12] lg:hover:bg-white/[0.2] text-[#1d1d1f] lg:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="关闭窗口 (ESC)"
                  aria-label="关闭认证窗口"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* 左栏：注册 / 登录 / 找回密码 / 注册成功欢迎回执 */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-9 flex flex-col justify-between text-left overflow-y-auto max-h-[calc(100dvh-2rem)] lg:max-h-none modal-scroll-contain overscroll-contain">
                {registeredWelcome ? (
                  <div className="space-y-4 my-auto py-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#248a3d]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>空间创建成功 · 已自动登入</span>
                    </div>

                    <div>
                      <h2
                        id="auth-modal-heading"
                        className="text-2xl font-semibold tracking-[-0.025em] text-[#1d1d1f]"
                      >
                        欢迎加入研核，{registeredWelcome.username}。
                      </h2>
                      <p className="mt-1 text-xs text-[#6e6e73]">
                        您的独立双链知识库与初始研学礼遇已准备就绪：
                      </p>
                    </div>

                    {registeredWelcome.inheritResult?.inherited && (
                      <div className="p-4 rounded-2xl bg-[#f5f5f7] text-xs text-[#1d1d1f] space-y-1">
                        <div className="font-semibold flex items-center gap-1.5 text-[#0066cc]">
                          <BookmarkCheck className="w-4 h-4" />
                          <span>已自动继承您的试玩学习记录</span>
                        </div>
                        <p className="text-[11.5px] text-[#6e6e73] leading-relaxed">
                          系统已生成首篇笔记{' '}
                          <code className="px-1.5 py-0.5 rounded bg-white text-[#1d1d1f]">
                            00-试玩留存笔记/首篇研学试玩精华.md
                          </code>
                          {registeredWelcome.inheritResult.conversationsSynced > 0 &&
                            '、同步 AI 导师会话'}
                          {registeredWelcome.inheritResult.errorsSaved > 0 &&
                            `、录入 ${registeredWelcome.inheritResult.errorsSaved} 道错题`}
                          。
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-[#f5f5f7] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#1d1d1f]">开源纯净特权已就绪</div>
                        <div className="text-[11px] text-[#6e6e73] mt-0.5">
                          纯本地优先 · 自由接入本地智能体与云端大模型
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        无限畅享
                      </span>
                    </div>

                    {registeredWelcome.recoveryCode && (
                      <div className="p-4 rounded-2xl bg-[#f5f5f7] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f]">
                            <KeyRound className="w-3.5 h-3.5 text-[#6e6e73]" />
                            <span>专属应急救援码（建议复制保存）</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRecoveryCode(registeredWelcome.recoveryCode!)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-[11px] font-medium text-[#1d1d1f] cursor-pointer"
                          >
                            {copiedRecovery ? (
                              <>
                                <Check className="w-3 h-3 text-[#248a3d]" />
                                <span>已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>复制</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="py-2 px-3 rounded-xl bg-white border border-black/[0.06] font-mono text-sm font-semibold text-[#1d1d1f] tracking-wider text-center select-all">
                          {registeredWelcome.recoveryCode}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const dest = registeredWelcome.targetPath
                          setRegisteredWelcome(null)
                          setAuthModalOpen(false)
                          navigate(dest, { replace: true })
                        }}
                        className="apple-btn-blue text-xs sm:text-sm cursor-pointer"
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
                          className="min-h-11 py-2.5 px-4 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          查看首篇试玩笔记
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-black/[0.08] shrink-0">
                          <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-semibold text-sm text-[#1d1d1f]">CoreForge 研核</span>
                      </div>

                      {contextBannerHint && modalTab !== 'forgot' && (
                        <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] text-xs leading-relaxed">
                          {contextBannerHint}
                        </div>
                      )}

                      {initialized && modalTab !== 'forgot' && (
                        <div className="mb-5 grid grid-cols-2 gap-1 p-1 rounded-full bg-[#f5f5f7]">
                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('register')
                              setModalError(null)
                            }}
                            className={`min-h-9 py-1.5 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              modalTab === 'register'
                                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                            }`}
                          >
                            创建新账号
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalTab('login')
                              setModalError(null)
                            }}
                            className={`min-h-9 py-1.5 px-3 rounded-full text-xs font-medium transition-all cursor-pointer ${
                              modalTab === 'login'
                                ? 'bg-white text-[#1d1d1f] font-semibold shadow-2xs'
                                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                            }`}
                          >
                            已有账号登录
                          </button>
                        </div>
                      )}

                      <h2
                        id="auth-modal-heading"
                        className="text-xl sm:text-2xl tracking-[-0.025em] font-semibold text-[#1d1d1f] mb-1"
                      >
                        {!initialized
                          ? '初始化管理员空间'
                          : modalTab === 'forgot'
                          ? '找回研学密码'
                          : modalTab === 'register'
                          ? '创建个人专属空间'
                          : '登录研核备考空间'}
                      </h2>
                      <p className="text-xs text-[#6e6e73] mb-5">
                        {modalTab === 'forgot'
                          ? '支持安全密保问答或 8 位专属救援码自助重置'
                          : modalTab === 'register'
                          ? '免手机号注册，试玩记录自动继承，无限制自由使用'
                          : '登录后自动同步您的刷题进度、错题本与闪卡队列'}
                      </p>

                      {modalError && (
                        <div
                          role="alert"
                          className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{modalError}</span>
                        </div>
                      )}

                      {resetSuccessMessage && (
                        <div
                          role="status"
                          className="mb-4 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{resetSuccessMessage}</span>
                        </div>
                      )}

                      {modalTab !== 'forgot' ? (
                        <form noValidate onSubmit={handleModalAuthSubmit} className="space-y-3.5">
                          <div>
                            <label
                              htmlFor="landing-auth-username"
                              className="block text-xs font-medium text-[#1d1d1f] mb-1.5"
                            >
                              账号名称
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
                                  ? '字母或数字组合，至少 3 位'
                                  : '请输入您的账号名称'
                              }
                              className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] placeholder-[#86868b] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                            />
                          </div>

                          {(modalTab === 'register' || !initialized) && (
                            <div>
                              <label
                                htmlFor="landing-auth-nickname"
                                className="block text-xs font-medium text-[#1d1d1f] mb-1.5"
                              >
                                伴学昵称 <span className="text-[#86868b]">(选填)</span>
                              </label>
                              <input
                                id="landing-auth-nickname"
                                name="displayName"
                                type="text"
                                autoComplete="nickname"
                                value={modalDisplayName}
                                onChange={(e) => setModalDisplayName(e.target.value)}
                                placeholder="用于工作台与伴学称呼"
                                className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] placeholder-[#86868b] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                              />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label
                                htmlFor="landing-auth-password"
                                className="block text-xs font-medium text-[#1d1d1f]"
                              >
                                登录密码
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
                                  className="text-xs font-normal text-[#0066cc] hover:underline cursor-pointer"
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
                                autoComplete={
                                  modalTab === 'register' ? 'new-password' : 'current-password'
                                }
                                value={modalPassword}
                                onChange={(e) => {
                                  setModalPassword(e.target.value)
                                  if (modalError) setModalError(null)
                                }}
                                placeholder="至少 6 位字符"
                                className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] placeholder-[#86868b] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowModalPassword((v) => !v)}
                                aria-pressed={showModalPassword}
                                aria-label={showModalPassword ? '隐藏密码' : '显示密码'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center cursor-pointer"
                              >
                                {showModalPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {modalTab === 'register' && (
                            <div>
                              <label
                                htmlFor="landing-auth-confirm"
                                className="block text-xs font-medium text-[#1d1d1f] mb-1.5"
                              >
                                确认密码
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
                                className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] placeholder-[#86868b] text-base sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={modalLoading}
                            className="w-full apple-btn-blue text-sm cursor-pointer disabled:opacity-60 mt-2"
                          >
                            {modalLoading ? (
                              <span>正在处理并同步记录...</span>
                            ) : modalTab === 'register' ? (
                              <span>
                                {trialSummary.totalFootprints > 0
                                  ? `创建账号并继承 ${trialSummary.totalFootprints} 项试玩记录`
                                  : '立即创建专属账号'}
                              </span>
                            ) : (
                              <span>登录并打开{pendingTarget.label}</span>
                            )}
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-3.5">
                          {forgotStep === 1 ? (
                            <form onSubmit={handleQuerySecurityQuestion} className="space-y-3.5">
                              <div>
                                <label
                                  htmlFor="forgot-username"
                                  className="block text-xs font-medium text-[#1d1d1f] mb-1.5"
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
                                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] text-base sm:text-[13px] focus:outline-none"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full apple-btn-blue text-sm cursor-pointer disabled:opacity-60"
                              >
                                {modalLoading ? '正在检索安全通道...' : '下一步：验证身份'}
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                              <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] font-medium">
                                <span>目标账号：{forgotUsername}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForgotStep(1)
                                    setModalError(null)
                                  }}
                                  className="text-[#0066cc] hover:underline cursor-pointer text-xs"
                                >
                                  更换
                                </button>
                              </div>

                              {!useRecoveryCodeMode && hasSecurityQuestion ? (
                                <div className="space-y-2">
                                  <div className="p-3 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] text-xs">
                                    <span className="text-[#6e6e73]">密保问题：</span>
                                    <div className="mt-0.5 font-medium">{securityQuestion}</div>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    placeholder="请输入密保答案"
                                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] text-base sm:text-[13px] focus:outline-none"
                                  />
                                  <div className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => setUseRecoveryCodeMode(true)}
                                      className="text-xs text-[#0066cc] hover:underline cursor-pointer"
                                    >
                                      改用 8 位救援码验证 ›
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="p-3 rounded-xl bg-[#f5f5f7] text-[#6e6e73] text-xs leading-relaxed">
                                    请输入注册时生成的专属救援码（如 CF-XXXX-XXXX）：
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    autoCorrect="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    value={recoveryCodeInput}
                                    onChange={(e) => setRecoveryCodeInput(e.target.value)}
                                    placeholder="CF-78A9-2B4C"
                                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] text-base sm:text-[13px] font-mono uppercase focus:outline-none"
                                  />
                                  {hasSecurityQuestion && (
                                    <div className="text-right">
                                      <button
                                        type="button"
                                        onClick={() => setUseRecoveryCodeMode(false)}
                                        className="text-xs text-[#0066cc] hover:underline cursor-pointer"
                                      >
                                        ‹ 改用密保问题验证
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
                                className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] text-base sm:text-[13px] focus:outline-none"
                              />

                              <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="再次输入确认新密码"
                                className="w-full py-2.5 px-3.5 rounded-xl bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-[#0071e3] text-[#1d1d1f] text-base sm:text-[13px] focus:outline-none"
                              />

                              <button
                                type="submit"
                                disabled={modalLoading}
                                className="w-full apple-btn-blue text-sm cursor-pointer disabled:opacity-60"
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
                            className="text-xs text-[#0066cc] hover:underline cursor-pointer font-medium"
                          >
                            ‹ 返回账号登录
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-black/[0.06] mt-5 flex items-center justify-between text-[11px] text-[#86868b]">
                      <span>开放标准 Markdown 随时导出</span>
                      <span className="font-mono">{OFFICIAL_DOMAIN_HOST}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 右栏：Apple Pro 深空黑权益展示面 */}
              <div className="cinema-dark-lock hidden lg:flex lg:col-span-6 flex-col justify-between bg-[#161618] text-[#f5f5f7] p-9">
                <div className="space-y-6 text-left">
                  <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                    个人专属研学空间
                  </p>

                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.025em] text-[#f5f5f7] leading-snug">
                      试玩成果无缝继承，
                      <br />
                      沉淀属于你的终身知识库。
                    </h3>
                    <p className="mt-2 text-xs text-[#a1a1a6] leading-relaxed">
                      您在试玩舞台产生的提问、演草与错因收藏，创建账号后将自动归入私有空间。
                    </p>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/[0.08]">
                    {[
                      {
                        title: '自动生成试玩首篇笔记与错题记录',
                        desc: '无缝保留刚才的 AI 导师解答、高数判分与闪卡自评',
                      },
                      {
                        title: '纯净开源零门槛 · 本地优先',
                        desc: '自由调用本地智能体（Claude Code / Antigravity）与离线大模型',
                      },
                      {
                        title: '1987–2024 统考真题库 + SM-2 记忆队列',
                        desc: '做错真题自动三维归因，每日按遗忘曲线精准推送待背卡片',
                      },
                      {
                        title: '多端云同步 + 100% 本地 Markdown 导出',
                        desc: '手机电脑实时接力，所有笔记随时打包下载或直连本地 Obsidian',
                      },
                    ].map((benefit) => (
                      <div key={benefit.title} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[13px] font-semibold text-[#f5f5f7]">
                            {benefit.title}
                          </div>
                          <div className="text-xs text-[#86868b] mt-0.5">{benefit.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#86868b]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-1.5">
                      <img
                        src="/pets/feiyu_happy.webp"
                        alt="大肥鱼伴学桌宠"
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-full bg-white/95 p-0.5 object-contain"
                      />
                      <img
                        src="/pets/nailong_happy.webp"
                        alt="奶龙伴学桌宠"
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-full bg-white/95 p-0.5 object-contain"
                      />
                    </div>
                    <span className="text-[#d2d2d7]">大肥鱼 × 奶龙伴学</span>
                  </div>
                  <span>距初试 {countdown.days} 天</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 全屏沉浸式试玩视窗模态框 */}
      {fullScreenSandbox &&
        createPortal(
          <div
            className="cinema-dark-lock fixed inset-0 z-[100] bg-[#0b0d13] flex flex-col w-screen h-dvh overflow-hidden select-none animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="全屏沉浸试玩实验室"
          >
            <div className="min-h-12 px-3 sm:px-5 py-1.5 bg-[#161618] border-b border-white/[0.08] flex items-center justify-between gap-2 shrink-0 pt-[max(0.375rem,env(safe-area-inset-top,0px))]">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md ring-1 ring-white/15 shrink-0">
                  <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
                </div>
                <span className="hidden sm:inline font-semibold text-[#f5f5f7] text-xs whitespace-nowrap">
                  全屏试玩舞台
                </span>
                {trialSummary.totalFootprints > 0 && (
                  <span className="hidden md:inline text-[11px] text-[#30d158] font-medium">
                    · 已暂存 {trialSummary.totalFootprints} 项记录
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex justify-center">
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.08] text-xs max-w-full overflow-x-auto no-scrollbar">
                  {[
                    { id: '408' as const, short: '408', full: '408 仿真' },
                    { id: 'math' as const, short: '数学', full: '数学判分' },
                    { id: 'english' as const, short: '英语', full: '英语精批' },
                    { id: 'politics' as const, short: '史纲', full: '史纲地图' },
                    { id: 'ai' as const, short: 'AI 导师', full: 'AI 导师' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMode(tab.id)}
                      className={`px-3 py-1 rounded-full font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        activeMode === tab.id
                          ? 'bg-[#f5f5f7] text-[#1d1d1f] font-semibold'
                          : 'text-[#a1a1a6] hover:text-white'
                      }`}
                    >
                      <span className="sm:hidden">{tab.short}</span>
                      <span className="hidden sm:inline">{tab.full}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
                    className="hidden xs:inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    {trialSummary.totalFootprints > 0
                      ? `注册并保存 (${trialSummary.totalFootprints})`
                      : '免费注册'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFullScreenSandbox(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-[#f5f5f7] text-xs font-medium transition-colors cursor-pointer shrink-0"
                  title="退出全屏返回页面（当前进度自动保留）"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>退出全屏</span>
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
