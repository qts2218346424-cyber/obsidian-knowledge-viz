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
  Flame,
  Volume2,
  Tv,
} from 'lucide-react'

interface UserGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

interface TourScene {
  id: number
  title: string
  subtitle: string
  badge: string
  icon: any
  color: string
  description: string
  highlights: string[]
  previewBg: string
  route: string
  routeText: string
}

const TOUR_SCENES: TourScene[] = [
  {
    id: 1,
    title: '为什么是 CoreForge 研核？',
    subtitle: '408 计算机综合 + 考研数学 · 智能双核研学体系',
    badge: '项目初衷与定位',
    icon: Sparkles,
    color: 'from-indigo-600 to-blue-600',
    description:
      '考研并非孤立的背题过程。CoreForge 将您的本地 Obsidian Markdown 知识库与全真历年真题库无缝联结，打破笔记与刷题的物理隔阂，构建网状拓扑知识体系。',
    highlights: [
      '双核联动：深度适配 408 计组/操作系统/计网/数据结构与高数/线代/概率论',
      '本地优先：纯本地 Markdown 存储，永不被任何第三方云端格式绑架',
      '多端协同：支持局域网多设备、平板与手机浏览器即插即用协同复习',
    ],
    previewBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950',
    route: '/dashboard',
    routeText: '查看备考驾驶舱',
  },
  {
    id: 2,
    title: '全真真题演练与错题智能诊断',
    subtitle: '做题、评分、归因与复盘一步到位',
    badge: '刷题中心 /quiz',
    icon: ClipboardList,
    color: 'from-amber-500 to-rose-600',
    description:
      '内置历年 408 统考真题与考研数学精选题库，支持高质量 KaTeX 公式渲染与智能评分。答错题目自动沉淀进入错题档案，支持细粒度错因归因。',
    highlights: [
      '全真 LaTeX 排版：严谨还原真题排版与推导演算，支持分步深度对照',
      '错题智能归因：精准分类「概念混淆 / 审题疏漏 / 计算失误 / 综合推导」，直击盲点',
      '笔记双向追溯：答题解析可一键跳转对应的知识库讲义笔记，闭环巩固',
    ],
    previewBg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950',
    route: '/quiz',
    routeText: '进入真题刷题中心',
  },
  {
    id: 3,
    title: '全库双链网络图谱与盲区雷达',
    subtitle: '从宏观上帝视角透视全科目考点联系',
    badge: '知识图谱 /graph',
    icon: Network,
    color: 'from-emerald-500 to-teal-600',
    description:
      '基于 D3 力导向物理引擎，自动提取所有笔记的双链（[[链接]]）与标签体系。直观识别高频枢纽核心概念，实时排查无连接的孤立节点（Orphan Notes）。',
    highlights: [
      '动态拓扑漫游：自由缩放拖拽知识网络，感受考点之间的脉络互联',
      '孤立笔记雷达：红绿警示快速发现未建立关联的遗漏死角，二轮复盘神器',
      '标签与学科分层：408 四大模块与数学科目色彩分明，宏观把握知识密度',
    ],
    previewBg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950',
    route: '/graph',
    routeText: '打开知识图谱',
  },
  {
    id: 4,
    title: 'SM-2 艾宾浩斯闪卡与多用户权限',
    subtitle: '抗遗忘科学记忆与安全多角色协同',
    badge: '学习中心 & 权限',
    icon: ShieldCheck,
    color: 'from-violet-600 to-purple-600',
    description:
      '内置基于认知负荷理论的 SM-2 间隔重复算法，在即将遗忘的黄金临界点自动推送复习。全面支持超级管理员、助教编辑与学生只读角色分权。',
    highlights: [
      'SM-2 记忆曲线：自适应评估掌握度，高频核心概念定理永不生疏',
      '学生只读防篡改：学生账号可全量查阅与刷题，修改笔记受只读安全锁拦截',
      'AI 深度推导伴学：按下 Ctrl+Shift+A 随时唤起导师，解答疑难大题推导',
    ],
    previewBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950',
    route: '/study',
    routeText: '体验艾宾浩斯闪卡',
  },
]

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
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

  const handleNavigate = (path: string) => {
    handleClose()
    navigate(path)
  }

  const handleOpenDocInEditor = () => {
    handleClose()
    navigate('/editor?file=💡 新手指引 · CoreForge 研核完全使用手册.md')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950/50">
          <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 p-2 text-white shadow-lg shadow-indigo-500/20">
                <Tv className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                    CoreForge 研核 · 新手巡礼指引
                  </h3>
                  <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    全景导览
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                  了解项目核心功能，高效开启每日研学闭环
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="sm:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Tab Switch */}
            <div className="flex w-full sm:w-auto p-0.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                动效巡礼视频
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'doc'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                图文使用手册
              </button>
            </div>

            <button
              onClick={handleClose}
              className="hidden sm:inline-flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tour' ? (
            <div className="p-4 sm:p-7 space-y-5 sm:space-y-6">
              {/* Video Simulation Box */}
              <div className={`relative rounded-3xl border border-slate-700/80 ${scene.previewBg} p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[260px] sm:min-h-[290px] flex flex-col justify-between transition-all duration-500`}>
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md whitespace-nowrap">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>第 {scene.id}/4 幕 · {scene.badge}</span>
                  </span>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                    title={isPlaying ? '暂停自动演播' : '继续自动演播'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 shrink-0" />
                        <span>自动演播中</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 shrink-0" />
                        <span>已暂停</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="my-6 relative z-10 max-w-2xl">
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-xl bg-gradient-to-br ${scene.color} text-white shadow-md`}>
                      <scene.icon className="h-5 w-5" />
                    </span>
                    <span>{scene.title}</span>
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm font-medium text-indigo-200/90">
                    {scene.subtitle}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="mt-4 space-y-1.5">
                    {scene.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Timeline & Navigation Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
                  {/* Timeline Scene Indicators */}
                  <div className="flex items-center gap-2">
                    {TOUR_SCENES.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentSceneIndex(idx)
                          setIsPlaying(false)
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentSceneIndex
                            ? 'w-8 bg-indigo-400'
                            : 'w-2 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={s.title}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleNavigate(scene.route)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 px-4 py-2 text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{scene.routeText}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 4 Steps Quick Start Cards */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>每日研学 4 步通关指南</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div
                    onClick={() => handleNavigate('/dashboard')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-extrabold text-indigo-400">第一步 · 驾驶舱</span>
                    <h6 className="mt-1 text-xs font-bold text-white group-hover:text-indigo-300">
                      查看备考倒计时
                    </h6>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      掌握初试剩余天数，全面评估笔记健康度与真题掌握率。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/quiz')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-extrabold text-amber-400">第二步 · 刷真题</span>
                    <h6 className="mt-1 text-xs font-bold text-white group-hover:text-amber-300">
                      专项模拟与错因归因
                    </h6>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      做 408 与考研数学历年真题，错题自动收录并对比解题步骤。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/study')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-extrabold text-emerald-400">第三步 · 间隔记忆</span>
                    <h6 className="mt-1 text-xs font-bold text-white group-hover:text-emerald-300">
                      SM-2 艾宾浩斯闪卡
                    </h6>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      早晚各 15 分钟抗遗忘复盘，强化专业课定理与高频英语词根。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/graph')}
                    className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-xs font-extrabold text-purple-400">第四步 · 图谱漫游</span>
                    <h6 className="mt-1 text-xs font-bold text-white group-hover:text-purple-300">
                      双链梳理消灭盲区
                    </h6>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      高亮排查孤立笔记，用双向链接织就坚不可摧的知识网。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Document Manual Tab */
            <div className="p-6 sm:p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">官方使用手册笔记已就绪</h4>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    该手册已作为 Markdown 文件保存在您的知识库根目录下，支持随时编辑或双链索引。
                  </p>
                </div>
                <button
                  onClick={handleOpenDocInEditor}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>在笔记编辑器中打开</span>
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-bold text-white">一、系统全貌与核心价值</h4>
                <p>
                  CoreForge 研核专为 408 计算机统考与考研数学研发，核心在于实现<strong>「笔记输入 ➔ 真题演练 ➔ 错因归因 ➔ 闪卡抗遗忘 ➔ 图谱全局透视」</strong>的完整备考闭环。
                </p>

                <h4 className="text-base font-bold text-white pt-2">二、多用户权限与角色说明</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-indigo-400">超级管理员 (admin)</strong>：拥有全部读写权限，可管理知识库路径、配置 AI 密钥、重构标签与分配用户。
                  </li>
                  <li>
                    <strong className="text-amber-400">研学编辑者 (editor)</strong>：具备笔记阅读、编辑与做题权限，无法更改系统核心设置。
                  </li>
                  <li>
                    <strong className="text-emerald-400">学生只读 (student)</strong>：自主注册默认角色。可自由刷题做题、查阅所有笔记与图谱；知识库笔记修改将自动受系统防篡改保护。
                  </li>
                </ul>

                <h4 className="text-base font-bold text-white pt-2">三、高效提效快捷键速查</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <span>全局智能搜索</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-indigo-300">Ctrl + K</kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                    <span>召唤 AI 伴学导师</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-indigo-300">Ctrl + Shift + A</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>不再自动弹出新手巡礼（可在导航栏随时点击「新手指引」再次打开）</span>
          </label>

          <div className="flex items-center gap-2">
            {activeTab === 'tour' && (
              <button
                onClick={() => {
                  setCurrentSceneIndex((prev) => (prev + 1) % TOUR_SCENES.length)
                  setIsPlaying(false)
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
              >
                下一幕
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer"
            >
              我知道了，开始研学
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
