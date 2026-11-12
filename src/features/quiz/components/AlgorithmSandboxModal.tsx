import { createPortal } from 'react-dom'
import React, { useState, useMemo } from 'react'
import {
  X,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  HardDrive,
  Copy,
  ChevronRight,
  RefreshCw,
  Terminal,
  BookOpen,
  Award,
  Flame,
  Check, Laptop as IcLaptop, Lightbulb as IcLightbulb } from 'lucide-react'
import MarkdownRenderer from '../../../components/MarkdownRenderer'
import { ALGORITHM_QUESTIONS_408, type AlgorithmQuestion } from '../../../data/algorithmQuestions'
import { getAuthHeaders } from '../../../services/auth'

interface AlgorithmSandboxModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuestionId?: string
}

export default function AlgorithmSandboxModal({
  isOpen,
  onClose,
  initialQuestionId,
}: AlgorithmSandboxModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialQuestionId || ALGORITHM_QUESTIONS_408[0].id
  )

  const activeQuestion = useMemo(() => {
    return ALGORITHM_QUESTIONS_408.find((q) => q.id === selectedId) || ALGORITHM_QUESTIONS_408[0]
  }, [selectedId])

  // 作答状态（各题目独立草稿）
  const [userIdeas, setUserIdeas] = useState<Record<string, string>>({})
  const [userCodes, setUserCodes] = useState<Record<string, string>>({
    [activeQuestion.id]: activeQuestion.starterCode,
  })
  const [userComplexities, setUserComplexities] = useState<Record<string, string>>({})

  // 判分结果与加载状态
  const [isGrading, setIsGrading] = useState(false)
  const [gradeResults, setGradeResults] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState<'editor' | 'review'>('editor')
  const [copiedCode, setCopiedCode] = useState(false)

  if (!isOpen) return null

  const currentIdea = userIdeas[activeQuestion.id] ?? ''
  const currentCode = userCodes[activeQuestion.id] ?? activeQuestion.starterCode
  const currentComplexity = userComplexities[activeQuestion.id] ?? ''
  const currentResult = gradeResults[activeQuestion.id]

  const handleSelectQuestion = (q: AlgorithmQuestion) => {
    setSelectedId(q.id)
    if (!userCodes[q.id]) {
      setUserCodes((prev) => ({ ...prev, [q.id]: q.starterCode }))
    }
    setActiveTab(gradeResults[q.id] ? 'review' : 'editor')
  }

  const handleStartGrade = async () => {
    if (!currentCode.trim()) {
      alert('请先编写核心算法代码')
      return
    }
    setIsGrading(true)
    try {
      const res = await fetch('/api/quiz/grade-algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          questionTitle: `${activeQuestion.year}年统考第42题: ${activeQuestion.title}`,
          questionPrompt: activeQuestion.fullPrompt,
          designIdea: currentIdea,
          code: currentCode,
          complexity: currentComplexity,
          standardAnswer: activeQuestion.optimalCode,
        }),
      })
      const data = await res.json()
      setGradeResults((prev) => ({ ...prev, [activeQuestion.id]: data }))
      setActiveTab('review')
    } catch (err: any) {
      alert('判分异常: ' + (err.message || String(err)))
    } finally {
      setIsGrading(false)
    }
  }

  const handleCopyOptimal = () => {
    navigator.clipboard?.writeText?.(activeQuestion.optimalCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
        {/* ── 顶部 Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  408 算法设计大题冲刺 · 第42题专属沙箱
                </h2>
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-xs">
                  全国统考真题
                </span>
                <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200">
                  满分 {activeQuestion.score} 分
                </span>
              </div>
              <p className="text-2xs text-slate-300 mt-0.5">
                历年经典算法设计真题全收录 · 智能阅卷专家三步踩分（设计思想4分+代码实现8分+复杂度3分）
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 年份快捷选单 ── */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            历年真题库:
          </span>
          {ALGORITHM_QUESTIONS_408.map((q) => {
            const isSelected = q.id === activeQuestion.id
            const hasGraded = Boolean(gradeResults[q.id])
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestion(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{q.year}年</span>
                <span className="text-2xs opacity-80">{q.title.slice(0, 8)}...</span>
                {hasGraded && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>
            )
          })}
        </div>

        {/* ── 主体双栏内容 ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* 左侧：题干要求与结构体规范 (5列) */}
          <div className="lg:col-span-5 border-r border-slate-200/80 bg-slate-50/50 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeQuestion.year} 年统考第 42 题
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  {activeQuestion.dataStructureType}专项
                </span>
                <span className="text-2xs font-mono text-slate-400">
                  分值：{activeQuestion.score} 分
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {activeQuestion.title}
              </h3>
            </div>

            {/* 完整题干 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>全国统考题干与作答要求</span>
              </span>
              <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                {activeQuestion.fullPrompt}
              </div>
            </div>

            {/* 结构体与函数声明预置 */}
            {activeQuestion.headerDef && (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-xs space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>C/C++ 数据结构定义 (不可修改)</span>
                </span>
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto">
                  {activeQuestion.headerDef}
                </pre>
              </div>
            )}

            {/* 典型测试用例 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>命题考察输入与输出示例</span>
              </span>
              <div className="space-y-1.5">
                {activeQuestion.keyTestCases.map((tc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono">
                    <div className="text-slate-500">{tc.input}</div>
                    <div className="text-indigo-600 font-bold mt-0.5">{tc.output}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 阅卷踩分警示 */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900 leading-relaxed">
              <div className="font-bold flex items-center gap-1 mb-1 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>408 阅卷踩分潜规则提醒</span>
              </div>
              {activeQuestion.bruteForceAnalysis}
            </div>
          </div>

          {/* 右侧：代码编辑与阅卷批改台 (7列) */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-white">
            {/* 子选项卡切换 */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'editor'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <IcLaptop className="emoji-icon" aria-hidden="true" />答题编辑台 (思想/代码/复杂度)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('review')}
                  disabled={!currentResult}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1 ${
                    activeTab === 'review'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>阅卷专家评分卡 {currentResult ? `(${currentResult.totalScore}/${activeQuestion.score}分)` : ''}</span>
                </button>
              </div>

              {activeTab === 'editor' && (
                <button
                  type="button"
                  onClick={handleStartGrade}
                  disabled={isGrading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGrading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>408 阅卷老师正在采点评分...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>提交考研阅卷专家判分</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 选项卡 1: 编辑器与作答区 */}
            {activeTab === 'editor' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* 1. 算法基本设计思想 (4分) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>(1) 算法基本设计思想阐述</span>
                      <span className="text-2xs text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">满分 4 分</span>
                    </label>
                    <span className="text-2xs text-slate-400">清晰阐述双指针、折半或数学原理</span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentIdea}
                    onChange={(e) => setUserIdeas((prev) => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                    placeholder="请简要写出你的解题思路，例如：采用双指针同步向前推进，先让指针 p 走 k 步..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {/* 2. 核心 C/C++ 代码手写区 (8分) */}
                <div className="flex-1 flex flex-col min-h-[260px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>(2) 核心算法 C / C++ 代码实现</span>
                      <span className="text-2xs text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">满分 8 分</span>
                    </label>
                    <span className="text-2xs text-slate-400">注意边界条件（NULL、极端数据）</span>
                  </div>
                  <div className="flex-1 relative rounded-2xl border border-slate-300 bg-slate-950 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-2xs text-slate-400 font-mono">
                      <span>C / C++ 标准算法答题纸</span>
                      <span>Tab 键缩进</span>
                    </div>
                    <textarea
                      value={currentCode}
                      onChange={(e) => setUserCodes((prev) => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                      placeholder="// 在此键入核心代码..."
                      className="flex-1 w-full p-4 font-mono text-xs text-emerald-300 bg-transparent resize-none focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* 3. 时空复杂度说明 (3分) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>(3) 时间与空间复杂度分析</span>
                      <span className="text-2xs text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">满分 3 分</span>
                    </label>
                    <span className="text-2xs text-slate-400">给出大 O 渐近复杂度并说明理由</span>
                  </div>
                  <input
                    type="text"
                    value={currentComplexity}
                    onChange={(e) => setUserComplexities((prev) => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                    placeholder="如：时间复杂度 O(n)，只需单趟遍历链表；空间复杂度 O(1)，仅使用常数个指针。"
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* 选项卡 2: 阅卷专家评分卡与官方满分标答 */}
            {activeTab === 'review' && currentResult && (
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* 综合得分大奖章 */}
                <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/30 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-xl shadow-indigo-600/30">
                      <span className="text-lg font-black font-mono leading-none">{currentResult.totalScore}</span>
                      <span className="text-2xs opacity-80">/{activeQuestion.score}分</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {currentResult.isOptimal ? '🏅 达到统考最优解标准' : '⚠️ 算法解法存在优化空间'}
                        </h4>
                        <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${
                          currentResult.totalScore >= 12
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {currentResult.totalScore >= 12 ? '高分档位' : '中分档位'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {currentResult.optimalComparison}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    修改继续重写
                  </button>
                </div>

                {/* 三大踩分点明细条 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">① 设计思想</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {currentResult.dimensions?.designIdea?.score ?? 3} / 4 分
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 leading-snug">
                      {currentResult.dimensions?.designIdea?.comment}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">② 代码实现</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {currentResult.dimensions?.codeImplementation?.score ?? 7} / 8 分
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 leading-snug">
                      {currentResult.dimensions?.codeImplementation?.comment}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">③ 复杂度说明</span>
                      <span className="font-mono font-bold text-indigo-600">
                        {currentResult.dimensions?.complexityAnalysis?.score ?? 2.5} / 3 分
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 leading-snug">
                      {currentResult.dimensions?.complexityAnalysis?.comment}
                    </p>
                  </div>
                </div>

                {/* 扣分项与考研避坑指南 */}
                {currentResult.deductions && currentResult.deductions.length > 0 && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>阅卷专家扣分点诊断 ({currentResult.deductions.length} 处)</span>
                    </span>
                    <ul className="text-xs text-rose-900 space-y-1 list-disc list-inside">
                      {currentResult.deductions.map((d: string, idx: number) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 阅卷老师冲刺叮嘱 */}
                {currentResult.examinerNotes && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">
                      <IcLightbulb className="emoji-icon" aria-hidden="true" />408 考研名师复盘点拨：
                    </span>
                    {currentResult.examinerNotes}
                  </div>
                )}

                {/* 官方满分标准实现代码 */}
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>全国统考大纲官方满分标准实现 (C/C++)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOptimal}
                      className="text-2xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? '已复制' : '复制标准答案'}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950 rounded-xl leading-relaxed">
                    {activeQuestion.optimalCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
