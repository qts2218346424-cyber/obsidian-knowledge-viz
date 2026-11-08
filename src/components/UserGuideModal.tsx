import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Network,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Compass,
  ArrowRight,
} from 'lucide-react'

interface UserGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartInteractiveTour?: () => void
}

interface TourScene {
  id: number
  title: string
  subtitle: string
  badge: string
  icon: any
  colorText: string
  colorBg: string
  colorBorder: string
  description: string
  highlights: string[]
  route: string
  routeText: string
}

const TOUR_SCENES: TourScene[] = [
  {
    id: 1,
    title: '为什么是 CoreForge 研核？',
    subtitle: '408 计算机综合 + 考研数学 · 智能双核研学体系',
    badge: '初衷与定位',
    icon: Sparkles,
    colorText: 'text-indigo-600',
    colorBg: 'bg-indigo-50/80',
    colorBorder: 'border-indigo-200/80',
    description:
      '考研并非孤立的背题过程。CoreForge 将您的本地 Obsidian Markdown 知识库与全真历年真题库无缝联结，打破笔记与刷题的物理隔阂，构建网状拓扑知识体系。',
    highlights: [
      '双核联动：深度适配 408 计组/操作系统/计网/数据结构与高数/线代/概率论',
      '本地优先：纯本地 Markdown 存储，永不被任何第三方云端格式绑架',
      '多端协同：支持局域网多设备、平板与手机浏览器即插即用协同复习',
    ],
    route: '/dashboard',
    routeText: '查看备考驾驶舱',
  },
  {
    id: 2,
    title: '全真真题演练与错题智能诊断',
    subtitle: '做题、评分、归因与复盘一步到位',
    badge: '刷题中心 /quiz',
    icon: ClipboardList,
    colorText: 'text-amber-600',
    colorBg: 'bg-amber-50/80',
    colorBorder: 'border-amber-200/80',
    description:
      '内置历年 408 统考真题与考研数学精选题库，支持高质量 KaTeX 公式渲染与智能评分。答错题目自动沉淀进入错题档案，支持细粒度错因归因。',
    highlights: [
      '全真 LaTeX 排版：严谨还原真题排版与推导演算，支持分步深度对照',
      '错题智能归因：精准分类「概念混淆 / 审题疏漏 / 计算失误 / 综合推导」，直击盲点',
      '笔记双向追溯：答题解析可一键跳转对应的知识库讲义笔记，闭环巩固',
    ],
    route: '/quiz',
    routeText: '进入真题刷题中心',
  },
  {
    id: 3,
    title: '全库双链网络图谱与盲区雷达',
    subtitle: '从宏观上帝视角透视全科目考点联系',
    badge: '知识图谱 /graph',
    icon: Network,
    colorText: 'text-purple-600',
    colorBg: 'bg-purple-50/80',
    colorBorder: 'border-purple-200/80',
    description:
      '基于 D3 力导向物理引擎，自动提取所有笔记的双链（[[链接]]）与标签体系。直观识别高频枢纽核心概念，实时排查无连接的孤立节点（Orphan Notes）。',
    highlights: [
      '动态拓扑漫游：自由缩放拖拽知识网络，感受考点之间的脉络互联',
      '孤立笔记雷达：红绿警示快速发现未建立关联的遗漏死角，二轮复盘神器',
      '标签与学科分层：408 四大模块与数学科目色彩分明，宏观把握知识密度',
    ],
    route: '/graph',
    routeText: '打开知识图谱',
  },
  {
    id: 4,
    title: 'SM-2 艾宾浩斯闪卡与科学抗遗忘',
    subtitle: '在临界点抗遗忘巩固，配合安全权限管理',
    badge: '学习中心 /study',
    icon: ShieldCheck,
    colorText: 'text-emerald-600',
    colorBg: 'bg-emerald-50/80',
    colorBorder: 'border-emerald-200/80',
    description:
      '内置基于认知负荷理论的 SM-2 间隔重复算法，在即将遗忘的黄金临界点自动推送复习。全面支持超级管理员、助教编辑与学生只读角色分权。',
    highlights: [
      'SM-2 记忆曲线：自适应评估掌握度，高频核心概念定理永不生疏',
      '学生只读防篡改：学生账号可全量查阅与刷题，修改笔记受只读安全锁拦截',
      'AI 深度推导伴学：按下 Ctrl+Shift+A 随时唤起导师，解答疑难大题推导',
    ],
    route: '/study',
    routeText: '体验艾宾浩斯闪卡',
  },
]

export default function UserGuideModal({ isOpen, onClose, onStartInteractiveTour }: UserGuideModalProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'tour' | 'doc'>('tour')
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  // 视频/巡礼自动轮播定时器
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'tour') return
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % TOUR_SCENES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isOpen, isPlaying, activeTab])

  if (!isOpen) return null

  const scene = TOUR_SCENES[currentSceneIndex]

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      } catch {}
    }
    onClose()
  }

  const handleSkipTour = () => {
    try {
      localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      localStorage.setItem('coreforge_tour_skipped', 'true')
    } catch {}
    onClose()
  }

  const handleStartTour = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      } catch {}
    }
    onClose()
    if (onStartInteractiveTour) {
      onStartInteractiveTour()
    } else {
      window.dispatchEvent(new CustomEvent('start-interactive-tour'))
    }
  }

  const handleNavigate = (path: string) => {
    handleClose()
    navigate(path)
  }

  const handleOpenDocInEditor = () => {
    handleClose()
    navigate('/editor?file=💡 新手指引 · CoreForge 研核完全使用手册.md')
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm animate-fade-in font-sans"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col max-h-[90vh] text-neutral-900"
      >
        
        {/* Top Header - Subframe 纯净浅色玻璃风格 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 px-5 sm:px-6 py-4 bg-white/95">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 p-2 text-white shadow-xs">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight truncate">
                    CoreForge 研核 · 新手巡礼指南
                  </h3>
                  <span className="hidden md:inline-flex px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/70 shrink-0">
                    全景导览
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                  带您 3 分钟快速熟悉核心功能与每日研学闭环
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="sm:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Tab Switch - Subframe 极简微胶囊 */}
            <div className="flex w-full sm:w-auto p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                功能巡礼导览
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'doc'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                图文使用手册
              </button>
            </div>

            <button
              onClick={handleClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tour' ? (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Feature Preview Card - 统一 Subframe 高级浅灰卡片 */}
              <div className="relative rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-5 sm:p-7 overflow-hidden transition-all duration-300">
                {/* 顶部控制栏 */}
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} whitespace-nowrap`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>第 {scene.id}/4 幕 · {scene.badge}</span>
                  </span>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
                    title={isPlaying ? '暂停自动演播' : '继续自动演播'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3 shrink-0" />
                        <span>自动演示中</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 shrink-0" />
                        <span>已暂停</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 核心内容展示区 */}
                <div className="my-5 relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-xl border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} shadow-2xs`}>
                      <scene.icon className="h-4 w-4" />
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                      {scene.title}
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-600">
                    {scene.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="mt-4 space-y-1.5">
                    {scene.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部时间线与直达体验按钮 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 relative z-10">
                  {/* 时间线微指示点 */}
                  <div className="flex items-center gap-1.5">
                    {TOUR_SCENES.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentSceneIndex(idx)
                          setIsPlaying(false)
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSceneIndex
                            ? 'w-6 bg-neutral-900'
                            : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                        }`}
                        title={s.title}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleNavigate(scene.route)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white hover:bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{scene.routeText}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* 每日研学 4 步通关指南 - 统一浅色卡片群 */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                  <span>每日研学 4 步通关指南</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => handleNavigate('/dashboard')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-indigo-600">第一步 · 驾驶舱</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      查看备考倒计时
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      掌握初试剩余天数，全面评估笔记健康度与真题掌握率。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/quiz')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-amber-600">第二步 · 刷真题</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                      专项模拟与错因归因
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      做 408 与考研数学历年真题，错题自动收录并对比解题步骤。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/study')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-emerald-600">第三步 · 间隔记忆</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                      SM-2 艾宾浩斯闪卡
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      早晚各 15 分钟抗遗忘复盘，强化专业课定理与高频英语词根。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/graph')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-purple-600">第四步 · 图谱漫游</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-purple-600 transition-colors">
                      双链梳理消灭盲区
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      高亮排查孤立笔记，用双向链接织就坚不可摧的知识网。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Document Manual Tab - 统一浅色高品质排版 */
            <div className="p-5 sm:p-7 space-y-5 text-neutral-600 text-xs sm:text-sm leading-relaxed">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900">官方使用手册笔记已就绪</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    该手册已作为 Markdown 文件保存在您的知识库根目录下，支持随时编辑或双链索引。
                  </p>
                </div>
                <button
                  onClick={handleOpenDocInEditor}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>在笔记编辑器中打开</span>
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-neutral-900">一、系统全貌与核心价值</h4>
                <p>
                  CoreForge 研核专为 408 计算机统考与考研数学研发，核心在于实现<strong>「笔记输入 ➔ 真题演练 ➔ 错因归因 ➔ 闪卡抗遗忘 ➔ 图谱全局透视」</strong>的完整备考闭环。
                </p>

                <h4 className="text-sm font-bold text-neutral-900 pt-2">二、多用户权限与角色说明</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-neutral-900">超级管理员 (admin)</strong>：拥有全部读写权限，可管理知识库路径、配置 AI 密钥、重构标签与分配用户。
                  </li>
                  <li>
                    <strong className="text-neutral-900">研学编辑者 (editor)</strong>：具备笔记阅读、编辑与做题权限，无法更改系统核心设置。
                  </li>
                  <li>
                    <strong className="text-neutral-900">学生只读 (student)</strong>：自主注册默认角色。可自由刷题做题、查阅所有笔记与图谱；知识库笔记修改将自动受系统防篡改保护。
                  </li>
                </ul>

                <h4 className="text-sm font-bold text-neutral-900 pt-2">三、高效提效快捷键速查</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">全局智能搜索</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-neutral-200 font-mono text-[10.5px] font-bold text-neutral-800 shadow-2xs">Ctrl + K</kbd>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">召唤 AI 伴学导师</span>
                    <kbd className="px-2 py-0.5 rounded bg-white border border-neutral-200 font-mono text-[10.5px] font-bold text-neutral-800 shadow-2xs">Ctrl + Shift + A</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - 明确提供【开启实战引导】与【跳过新手教程】 */}
        <div className="border-t border-neutral-100 px-5 sm:px-6 py-3.5 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-neutral-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3.5 w-3.5"
            />
            <span>不再自动弹出新手巡礼（可在导航栏随时点击「指引」图标再次打开）</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* 一键跳过新手教程 */}
            <button
              onClick={handleSkipTour}
              className="px-3 py-1.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              跳过新手教程
            </button>

            {/* 开启沉浸交互实战漫游 */}
            <button
              onClick={handleStartTour}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>开始沉浸体验 (实战引导)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
