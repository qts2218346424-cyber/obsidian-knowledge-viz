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
  Landmark,
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
  KeyRound,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
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
  const [modalTab, setModalTab] = useState<'login' | 'register' | 'forgot'>('login')
  const [modalUsername, setModalUsername] = useState('')
  const [modalPassword, setModalPassword] = useState('')
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
  // 工作台实景与四大学科深度联动配置字典
  const workbenchPreviews: Record<ModeType, {
    sidebarTitle: string
    sidebarItems: Array<{ icon: string; title: string; badge: string; badgeColor: string }>
    mainBadge: string
    difficulty: string
    mainQuestion: string
    aiAnalysisTitle: string
    aiAnalysisDesc: string
    aiAnalysisCode: string
    inspectorTitle: string
    inspectorPercent: number
    inspectorLabel: string
    links: string[]
    errorAnalysis: string
  }> = {
    '408': {
      sidebarTitle: '408 核心真题题库',
      sidebarItems: [
        { icon: '🌲', title: '二叉平衡树 AVL 旋转', badge: '真题', badgeColor: 'text-emerald-600 bg-emerald-50' },
        { icon: '⚙️', title: 'Cache 组相连映射机制', badge: '408', badgeColor: 'text-indigo-600 bg-indigo-50' },
        { icon: '🔒', title: 'PV 原语与哲学家就餐', badge: '操作系统', badgeColor: 'text-amber-600 bg-amber-50' },
        { icon: '🌐', title: 'TCP 拥塞控制慢开始', badge: '计网', badgeColor: 'text-sky-600 bg-sky-50' },
      ],
      mainBadge: '2023 年 408 真题 · 第 41 题',
      difficulty: '⭐⭐⭐⭐',
      mainQuestion: '已知二叉排序树中结点关键码各不相同，若对其进行中序遍历可得到升序序列。试分析 AVL 树插入结点失衡后的四种旋转调整策略。',
      aiAnalysisTitle: 'AI 启发式答疑分析：',
      aiAnalysisDesc: 'LL 旋转只需顺时针单旋一次，关键在于将被破坏平衡的根结点右子树挂接为调整后根结点的左孩子。',
      aiAnalysisCode: '平衡因子 BF = 左子树高度 - 右子树高度 ∈ {-1, 0, 1}',
      inspectorTitle: 'SM-2 艾宾浩斯记忆熟练度',
      inspectorPercent: 82,
      inspectorLabel: '熟练度: 82% · 下次复习: 3 天后',
      links: ['[[平衡二叉树.md]]', '[[红黑树对比要点.md]]'],
      errorAnalysis: '混淆了 LR 旋转的双旋次序（应先对左孩子左旋，再对根节点右旋）。',
    },
    math: {
      sidebarTitle: '考研数学核心真题',
      sidebarItems: [
        { icon: '📐', title: '泰勒公式与高阶无穷小', badge: '高数', badgeColor: 'text-pink-600 bg-pink-50' },
        { icon: '🔢', title: '实对称矩阵正交相似对角化', badge: '线代', badgeColor: 'text-indigo-600 bg-indigo-50' },
        { icon: '🎲', title: '二维正态分布协方差与独立性', badge: '概率', badgeColor: 'text-teal-600 bg-teal-50' },
        { icon: '📈', title: '柯西中值定理与辅助函数构造', badge: '微积分', badgeColor: 'text-orange-600 bg-orange-50' },
      ],
      mainBadge: '2022 年数学一真题 · 第 17 题',
      difficulty: '⭐⭐⭐⭐⭐',
      mainQuestion: '求极限 lim(x→0) [x - sin(x)] / x^3，并分析若使用洛必达法则可能出现的精度丢失与高阶展开陷阱。',
      aiAnalysisTitle: 'AI 分步推导证明提示：',
      aiAnalysisDesc: '由于分母为 x^3，对分子 sin x 必须展开至 x^3 阶：sin x = x - x^3/6 + o(x^3)。展开后直接抵消前导项，秒出结果 1/6。',
      aiAnalysisCode: 'lim(x→0) [x - (x - x³/6 + o(x³))] / x³ = 1/6',
      inspectorTitle: '定理掌握度与步骤熟练度',
      inspectorPercent: 91,
      inspectorLabel: '掌握度: 91% · 高频必考考点',
      links: ['[[泰勒展开经典八大公式.md]]', '[[微分中值定理辅助函数.md]]'],
      errorAnalysis: '误将 sin x 仅展开到一阶 x 导致分子被盲目消零，牢记展开原则“分母是几阶，分子就必须展到几阶”。',
    },
    politics: {
      sidebarTitle: '考研政治考点集萃',
      sidebarItems: [
        { icon: '🏛️', title: '中国近代史四大主要矛盾', badge: '史纲', badgeColor: 'text-amber-600 bg-amber-50' },
        { icon: '📜', title: '中共一大至七大路线演进', badge: '重大会议', badgeColor: 'text-rose-600 bg-rose-50' },
        { icon: '🌾', title: '农村包围城市武装夺取政权', badge: '毛中特', badgeColor: 'text-emerald-600 bg-emerald-50' },
        { icon: '⚖️', title: '矛盾普遍性与特殊性辩证法', badge: '马原', badgeColor: 'text-blue-600 bg-blue-50' },
      ],
      mainBadge: '肖秀荣 1000 题精粹 · 史纲多选',
      difficulty: '⭐⭐⭐',
      mainQuestion: '下列关于遵义会议的表述，正确阐述了其在中国共产党历史上生死攸关转折点意义的选项有哪些？',
      aiAnalysisTitle: 'AI 时空考点穿透点拨：',
      aiAnalysisDesc: '遵义会议集中解决了当时具有决定意义的军事问题和组织问题，结束了王明“左”倾冒险主义统治，确立了毛泽东同志在红军和党中央的领导地位。',
      aiAnalysisCode: '核心采分点：军事与组织问题（思想问题在延安整风解决，政治路线在七大确立）',
      inspectorTitle: '时空轴考点记忆留存率',
      inspectorPercent: 95,
      inspectorLabel: '留存率: 95% · 考前冲刺必备',
      links: ['[[遵义会议历史转折.md]]', '[[中共重大会议全景轴.md]]'],
      errorAnalysis: '误选了“全面解决了党的思想路线问题”。牢记遵义会议因处于长征战时环境，仅着重解决了军事与领导组织问题。',
    },
    english: {
      sidebarTitle: '考研英语写作与长难句',
      sidebarItems: [
        { icon: '✍️', title: '英语一图画作文万能三段论', badge: '大作文', badgeColor: 'text-purple-600 bg-purple-50' },
        { icon: '💌', title: '建议信与道歉信核心书信体', badge: '小作文', badgeColor: 'text-indigo-600 bg-indigo-50' },
        { icon: '📖', title: '真题同位语与倒装长难句拆解', badge: '阅读精读', badgeColor: 'text-blue-600 bg-blue-50' },
        { icon: '🎯', title: '大纲高频生词与熟词生义库', badge: '核心词汇', badgeColor: 'text-rose-600 bg-rose-50' },
      ],
      mainBadge: '历年真题实战演练 · 图画大作文',
      difficulty: '⭐⭐⭐⭐',
      mainQuestion: 'Write an essay based on the cartoon: Two youngsters looking at the mobile phone during dinner. 试对两代人网络生活习惯进行对比论述并给出规范主题句。',
      aiAnalysisTitle: 'AI 智能多维批改得分（18.5 / 20.0）：',
      aiAnalysisDesc: '首段描述生动贴切；二段运用了递进结构 "Not only does it alienate familial bond, but it also..."；建议将平庸词 "bad influence" 升级为 "detrimental repercussion"。',
      aiAnalysisCode: '词汇升级：harmful impact → detrimental repercussion; important → pivotal / paramount',
      inspectorTitle: '高分句型熟练度与语法评级',
      inspectorPercent: 88,
      inspectorLabel: '写作评级: A 等 · 智能批改耗时 ~1.2s',
      links: ['[[考研英语作文三段论.md]]', '[[闪光词汇与高阶表达.md]]'],
      errorAnalysis: '在定语从句中先行词为复数代词时，谓语动词遗漏了主谓一致关系，系统已高亮标出修正建议。',
    },
    ai: {
      sidebarTitle: '本地智能体伴学中枢',
      sidebarItems: [
        { icon: '🤖', title: '本地 Claude / Codex CLI 桥接', badge: '本地优先', badgeColor: 'text-indigo-600 bg-indigo-50' },
        { icon: '🧠', title: '多智能体辩论与答疑推导', badge: 'Agent', badgeColor: 'text-purple-600 bg-purple-50' },
        { icon: '🔍', title: 'Obsidian 库本地向量检索', badge: 'Local-First', badgeColor: 'text-emerald-600 bg-emerald-50' },
        { icon: '⚡', title: '极速离线 Markdown 知识网', badge: '离线就绪', badgeColor: 'text-amber-600 bg-amber-50' },
      ],
      mainBadge: 'CoreForge 多智能体伴学引擎',
      difficulty: '⭐⭐⭐⭐⭐',
      mainQuestion: '多 Agent 协同体系如何深度结合考生个人 Obsidian 笔记库，实现跨学科考点自动串联与错题归因？',
      aiAnalysisTitle: '智能体协作流水线日志：',
      aiAnalysisDesc: '知识检索智能体定位到 3 篇相关讲义，命题预测智能体生成 1 道变式题，批改导师实时审阅答题卡。',
      aiAnalysisCode: 'Agent Pipeline: Retrieval → Deduction → Reasoning → Synthesis (100% 本地优先)',
      inspectorTitle: '智能体健康度与同步状态',
      inspectorPercent: 99,
      inspectorLabel: '响应时间: 120ms · 本地守护进程在线',
      links: ['[[本地优先设计规范.md]]', '[[AgentFederation协议.md]]'],
      errorAnalysis: '未检测到任何逻辑缺陷，全流程推导通畅。',
    },
  }

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
      title: '多 Agent 协同伴学。',
      subtitle: '本地 Claude Code / Codex 与云端大模型无缝联动。',
      badge: '当前模式：本地优先多智能体 —— 支持离线本地知识库检索、Agent 循环推演与沉浸答疑。',
      heroSubject: '本地优先与多 Agent 协同导师',
      cardDetail: '无厂商格式锁定，底层纯净 Markdown，支持本地终端与云端推理双轮驱动。',
    },
  }

  return (
    <div className="min-h-screen subframe-landing-bg text-[#171719] font-sans flex flex-col selection:bg-zinc-900 selection:text-white relative overflow-x-hidden w-full max-w-full">
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
            考研四核
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
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-5 sm:pt-14 pb-8 sm:pb-16 text-center my-auto">
        {/* Subframe 标志性 3D 镀铬金属硬件药丸切换器 (3D Metallic Chrome Switcher) */}
        <div className="relative mb-6 sm:mb-12 select-none">
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
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-2.5 sm:px-6 py-2 sm:py-3 rounded-[12px] text-xs sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
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
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-2.5 sm:px-6 py-2 sm:py-3 rounded-[12px] text-xs sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'math' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>考研数学</span>
              </button>

                            {/* Tab 3: 考研政治 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('politics')
                  showToast('已切换至 考研政治 全屏史纲时空轴模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-1.5 px-2.5 sm:px-5 py-2 sm:py-3 rounded-[12px] text-xs sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'politics' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Landmark className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>考研政治</span>
              </button>

              {/* Tab 4: 考研英语 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('english')
                  showToast('已切换至 考研英语 作文模板与智能批改模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-1.5 px-2.5 sm:px-5 py-2 sm:py-3 rounded-[12px] text-xs sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'english' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <BookOpen className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                <span>考研英语</span>
              </button>

              {/* Tab 5: 本地 AI 伴学 */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ai')
                  showToast('已切换至 本地双核多 Agent 协同模式')
                }}
                className={`mode-switch-btn relative flex items-center justify-center gap-2 px-2.5 sm:px-6 py-2 sm:py-3 rounded-[12px] text-xs sm:text-[14px] font-medium transition-all duration-200 cursor-pointer ${
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
        <h1 className="text-[30px] sm:text-[56px] md:text-[76px] font-bold tracking-[-0.045em] leading-[1.04] text-[#171719] mb-4 max-w-4xl mx-auto">
          {modeConfigs[activeMode].title}
        </h1>

        {/* 细腻质感副标题 */}
        <p className="text-[15px] sm:text-[24px] md:text-[30px] font-normal tracking-[-0.025em] leading-[1.25] text-[#8d9096] max-w-[720px] mb-4 sm:mb-8">
          {modeConfigs[activeMode].subtitle}
        </p>

        {/* Subframe 动态模式状态胶囊 (mode-live-pill) */}
        <div className="mb-6 sm:mb-9 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-[12px] text-[#52525b] max-w-2xl backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 shrink-0" />
          <span className="truncate">{modeConfigs[activeMode].badge}</span>
        </div>

        {/* 📱 移动端专属自适应 CTA 按钮组（免安装网页版置为最显眼主按钮） */}
        <div className="w-full max-w-sm sm:hidden space-y-2.5 px-2">
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard')
              } else {
                setAuthModalOpen(true)
              }
            }}
            className="w-full py-3.5 px-5 rounded-xl bg-[#1c1c1f] hover:bg-black text-white text-[15px] font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-black/15 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>立即开启研学 (免安装网页版)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-zinc-500">
            <button
              type="button"
              onClick={handleDownloadDesktop}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载电脑客户端 ({downloadInfo?.desktop?.size || '109 MB'})</span>
            </button>
            <a
              href="#download"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>扫码说明</span>
            </a>
          </div>
        </div>

        {/* 💻 桌面端 / 平板端 CTA 按钮组（保持电脑端下载为第一视觉） */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
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
            {/* 工作台顶部仿 Chrome 导航条（移动端自适应防挤压） */}
            <div className="h-9 px-3 sm:px-4 bg-[#fafafa] border-b border-zinc-200/80 flex items-center justify-between text-[11px] text-zinc-500 overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3.5 truncate">
                <span className="font-semibold text-zinc-900 truncate">408 · 数学 · 政治 · 英语 全科考研工作台</span>
                <span className="text-zinc-400 hidden sm:inline">·</span>
                <span className="hidden sm:inline">知识拓扑</span>
                <span className="text-zinc-800 font-medium hidden sm:inline">+ 真题导入</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-zinc-800 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] sm:text-[11px]">{modeConfigs[activeMode].heroSubject}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-900 font-medium text-[10px]">
                  沉浸研学
                </span>
                <span className="text-[10px] text-zinc-400">SM-2 调度活跃</span>
              </div>
            </div>

            {/* 三栏式实景编辑器视窗（与顶部选中科目 activeMode 实时联动） */}
            <div className="grid grid-cols-12 min-h-[360px] bg-white text-[11px] transition-all duration-300">
              {/* 左栏：组件库 / 学科章节树 */}
              <div className="col-span-12 md:col-span-3 border-r border-zinc-200/80 p-3 bg-[#fbfbfc] flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3 h-3 text-zinc-400" />
                    <span className="text-[11px]">搜索考点与真题...</span>
                  </div>
                  <span className="text-zinc-400 text-xs">⌘K</span>
                </div>

                <div className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-1 flex items-center justify-between">
                  <span>{workbenchPreviews[activeMode].sidebarTitle}</span>
                  <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-mono">联动实景</span>
                </div>

                <div className="space-y-1">
                  {workbenchPreviews[activeMode].sidebarItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-zinc-800 font-medium flex items-center justify-between transition-colors ${
                        idx === 0 ? 'bg-zinc-100/90 border-zinc-300/80 shadow-2xs' : 'bg-white border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <span className="truncate pr-1">{item.icon} {item.title}</span>
                      <span className={`text-[10px] px-1 rounded shrink-0 ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 中栏：真题演练与 LaTeX 公式推导画板 */}
              <div className="col-span-12 md:col-span-6 p-4 sm:p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-white font-mono text-[10px]">
                      {workbenchPreviews[activeMode].mainBadge}
                    </span>
                    <span className="text-zinc-400 text-[10px]">难度：{workbenchPreviews[activeMode].difficulty}</span>
                    <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">交互实景示意</span>
                  </div>

                  <h3 className="text-[14px] font-semibold text-zinc-900 leading-snug mb-3">
                    {workbenchPreviews[activeMode].mainQuestion}
                  </h3>

                  {/* 步骤启发式点拨卡片 */}
                  <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{workbenchPreviews[activeMode].aiAnalysisTitle}</span>
                    </div>
                    <p className="text-zinc-700 leading-relaxed text-[11px]">
                      {workbenchPreviews[activeMode].aiAnalysisDesc}
                    </p>
                    <div className="p-2 rounded bg-zinc-900 text-emerald-300 font-mono text-[10px] sm:text-[10.5px] overflow-x-auto whitespace-nowrap">
                      {workbenchPreviews[activeMode].aiAnalysisCode}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-zinc-400 text-[11px]">
                  <span>已联动「{modeConfigs[activeMode].heroSubject}」· 按 ⌘+Enter 提交作答</span>
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
                <div className="font-semibold text-zinc-900 pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                  <span>知识点属性检查器</span>
                  <span className="text-[9px] text-zinc-400 font-normal">示意图</span>
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">{workbenchPreviews[activeMode].inspectorTitle}</div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${workbenchPreviews[activeMode].inspectorPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>{workbenchPreviews[activeMode].inspectorLabel}</span>
                  </div>
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">Obsidian 双链网络关联</div>
                  <div className="space-y-1">
                    {workbenchPreviews[activeMode].links.map((link, idx) => (
                      <div key={idx} className="px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700 truncate">
                        🔗 {link}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-400 text-[10px] mb-1">错因归因记录</div>
                  <div className="p-2 rounded bg-amber-50/60 border border-amber-200/80 text-amber-900 text-[10.5px]">
                    {workbenchPreviews[activeMode].errorAnalysis}
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
            QUAD-CORE ECOSYSTEM
          </span>
          <h2 className="mt-1 text-3xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
            全面覆盖考研四大主力科目
          </h2>
          <p className="mt-3 text-sm text-[#71717a]">
            拒绝泛泛的通用笔记本，CoreForge 为 408 计算机、考研数学、考研政治与考研英语量身定制四核研学生态。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

          {/* 3. 考研政治 */}
          <div className="rounded-[16px] bg-white border border-zinc-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                  <Landmark className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">考研政治 史纲时空大本营</h3>
                  <span className="text-xs text-zinc-500">时空轴 · 中国地图 · 肖秀荣1000题</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                阿里 DataV 高精矢量中国地图与球形墨卡托对齐。1840~2024 近代史重要会议与重大事件全屏滑动，肖秀荣 1000 题即时判分与考点遮罩背诵。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🗺️ 高精矢量中国地图
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                ⏱️ 1840~2024 时空大屏
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                📝 肖秀荣 1000 题精粹
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🔒 核心考点遮罩自测
              </div>
            </div>
          </div>

          {/* 4. 考研英语 */}
          <div className="rounded-[16px] bg-white border border-zinc-200/80 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">考研英语 全题型研学中枢</h3>
                  <span className="text-xs text-zinc-500">作文模板 · AI批改 · 真题精读</span>
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                英语一图画与英语二图表黄金三段论模板。考研 20 分四维标准分智能批改，识别平庸词并给出高阶替换卡，历年真题长难句树状语法拆解。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                📜 大小作文高分模板
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                ⚡ 考研标准分 AI 批改
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                🌳 长难句树状语法拆解
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-medium text-zinc-800">
                📈 2000+ 词汇艾宾浩斯
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

            {/* 左栏：身份认证、注册与找回密码 */}
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
                  {modalTab === 'forgot'
                    ? '找回研学密码'
                    : modalTab === 'register'
                    ? '注册研学空间'
                    : '进入研核空间'}
                  <br />
                  <span className="text-[#8d9096] font-normal">
                    {modalTab === 'forgot'
                      ? 'Account Security Recovery'
                      : 'CoreForge Workspace'}
                  </span>
                </h2>

                {modalTab !== 'forgot' && (
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

                {/* 模式一：登录表单 */}
                {modalTab === 'login' && (
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

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setModalTab('forgot')
                          setModalError(null)
                          setForgotStep(1)
                          setForgotUsername(modalUsername)
                        }}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                      >
                        忘记密码？
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full py-2.5 px-4 rounded-[9px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      {modalLoading ? '正在验证...' : '登入研学空间'}
                    </button>
                  </form>
                )}

                {/* 模式二：注册表单 */}
                {modalTab === 'register' && (
                  <form onSubmit={handleModalAuthSubmit} className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        value={modalUsername}
                        onChange={(e) => setModalUsername(e.target.value)}
                        placeholder="设置账号用户名 (如 kaoyan2026)"
                        className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        required
                        value={modalPassword}
                        onChange={(e) => setModalPassword(e.target.value)}
                        placeholder="设置登录密码 (至少 6 位)"
                        className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-200/60 border border-zinc-300/60 text-[11px] text-zinc-600">
                      💡 注册成功后将为您自动颁发专属救援码，支持在遗忘密码时自助找回！
                    </div>

                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="w-full py-2.5 px-4 rounded-[9px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
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
                        <div className="text-xs text-zinc-600 leading-relaxed">
                          请输入您的研学用户名，系统将检索您的安全密保问题或救援通道：
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            value={forgotUsername}
                            onChange={(e) => setForgotUsername(e.target.value)}
                            placeholder="请输入用户名 / 账号"
                            className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={modalLoading}
                          className="w-full py-2.5 px-4 rounded-[9px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                        >
                          {modalLoading ? '正在检索密保...' : '下一步：验证身份'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-zinc-200/80 text-zinc-700 font-medium">
                          <span>账号：{forgotUsername}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep(1)
                              setModalError(null)
                            }}
                            className="text-zinc-500 hover:text-zinc-900 underline cursor-pointer text-[11px]"
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
                              className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                            />
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => setUseRecoveryCodeMode(true)}
                                className="text-[11px] text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
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
                              className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all uppercase"
                            />
                            {hasSecurityQuestion && (
                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() => setUseRecoveryCodeMode(false)}
                                  className="text-[11px] text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
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
                            className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                          />
                        </div>

                        <div>
                          <input
                            type="password"
                            required
                            value={confirmPasswordInput}
                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            placeholder="再次确认新密码"
                            className="w-full py-2 px-3 rounded-[9px] bg-[#e2e2e5] text-[#18181b] placeholder-[#8e9196] text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={modalLoading}
                          className="w-full py-2.5 px-4 rounded-[9px] bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-60"
                        >
                          {modalLoading ? '正在重置密码...' : '确认重置新密码'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 底部模式切换按钮 */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  {modalTab === 'forgot' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('login')
                        setModalError(null)
                        setForgotStep(1)
                      }}
                      className="hover:text-zinc-900 underline cursor-pointer font-medium"
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
                      className="hover:text-zinc-900 underline cursor-pointer"
                    >
                      {modalTab === 'login' ? '没有账号？立即自主注册' : '已有账号？返回登录'}
                    </button>
                  )}

                  <span className="text-zinc-400">本地优先 · 安全隔离</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 mt-4 text-[10.5px] text-zinc-400">
                支持安全密保问答与 8 位应急救援码双轨找回
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