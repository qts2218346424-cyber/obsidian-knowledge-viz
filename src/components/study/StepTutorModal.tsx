import { useState, useEffect } from 'react'
import {
  X, Lightbulb, ShieldAlert, BookOpen, Sparkles, Loader2,
  Copy, Check, RefreshCw
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import { api } from '../../services/api'

interface StepTutorModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuestion?: string
  initialSubject?: string
  initialOptions?: string
  syllabusId?: string
}

type TutorMode = 'hint' | 'audit' | 'formula'

export default function StepTutorModal({
  isOpen,
  onClose,
  initialQuestion = '',
  initialSubject = '',
  initialOptions = '',
}: StepTutorModalProps) {
  const [mode, setMode] = useState<TutorMode>('hint')
  const [questionText, setQuestionText] = useState(initialQuestion)
  const [studentSteps, setStudentSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    content: string
    engineUsed?: string
    syllabusMatch?: { id: string; subject: string; level1: string; level2: string; level3: string }
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [provider, setProvider] = useState<'codex' | 'claude-code' | 'web'>('claude-code')

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion)
    }
  }, [initialQuestion])

  if (!isOpen) return null

  const handleRunTutor = async (targetMode: TutorMode = mode) => {
    if (!questionText.trim()) return
    setLoading(true)
    setMode(targetMode)
    try {
      const res = await api.askStepTutor({
        mode: targetMode,
        questionText: questionText.trim(),
        subject: initialSubject || undefined,
        studentSteps: targetMode === 'audit' ? studentSteps.trim() : undefined,
        optionsText: initialOptions || undefined,
        provider,
      })
      setResult({
        content: res.content,
        engineUsed: res.engineUsed,
        syllabusMatch: res.syllabusMatch,
      })
    } catch (err: any) {
      setResult({
        content: `❌ **请求辅导失败**: ${err.message || '网络连接或服务异常'}`,
        engineUsed: '异常',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result?.content) return
    navigator.clipboard.writeText(result.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-surface border border-cream-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-warm-900">启发式多轮分步辅导 (Step-by-Step CoT)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  绝不直接剧透答案
                </span>
              </div>
              <p className="text-xs text-warm-500">
                针对 408 计算机与考研数学大题：思路引导 · 草稿步骤挑刺 · 核心公式反查
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Engine Switcher */}
        <div className="px-6 py-3 border-b border-cream-200 bg-surface/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-cream-200/50 rounded-xl">
            <button
              onClick={() => { setMode('hint'); handleRunTutor('hint') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'hint'
                  ? 'bg-surface text-accent-orange shadow-xs font-bold'
                  : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              第一步思路提示
            </button>
            <button
              onClick={() => setMode('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'audit'
                  ? 'bg-surface text-rose-600 shadow-xs font-bold'
                  : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              解题步骤挑刺
            </button>
            <button
              onClick={() => { setMode('formula'); handleRunTutor('formula') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'formula'
                  ? 'bg-surface text-accent-sage shadow-xs font-bold'
                  : 'text-warm-600 hover:text-warm-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              公式定理反查
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-warm-400">调度引擎:</span>
            <div className="flex items-center gap-1 p-0.5 bg-cream-200/60 rounded-lg">
              <button
                onClick={() => setProvider('claude-code')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  provider === 'claude-code' ? 'bg-surface text-warm-900 shadow-xs' : 'text-warm-500'
                }`}
                title="本地 Claude Code CLI"
              >
                ⚡ Claude
              </button>
              <button
                onClick={() => setProvider('codex')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  provider === 'codex' ? 'bg-surface text-warm-900 shadow-xs' : 'text-warm-500'
                }`}
                title="本地 OpenAI Codex CLI"
              >
                🤖 Codex
              </button>
              <button
                onClick={() => setProvider('web')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  provider === 'web' ? 'bg-surface text-warm-900 shadow-xs' : 'text-warm-500'
                }`}
                title="云端 DeepSeek / OpenAI API"
              >
                🌐 DeepSeek
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-warm-700 flex items-center justify-between">
              <span>考研题面内容:</span>
              {initialSubject && (
                <span className="text-[11px] text-accent-orange font-normal">科目：{initialSubject}</span>
              )}
            </label>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="请输入您正在推导的 408 或考研数学题目内容..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl bg-cream-100/50 border border-cream-300 focus:outline-hidden focus:border-accent-orange/60 resize-none leading-relaxed text-warm-800"
            />
          </div>

          {/* Audit mode: student steps input */}
          {mode === 'audit' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-rose-700 flex items-center justify-between">
                <span>你的草稿演算步骤（供导师逐行挑刺）:</span>
                <span className="text-[10px] text-warm-400">可贴上已写出的推导过程或逻辑断点</span>
              </label>
              <textarea
                value={studentSteps}
                onChange={e => setStudentSteps(e.target.value)}
                placeholder="例如：第一步我令 f(x)=x-sin x，求导得到 f'(x)=1-cos x >= 0，但后面二阶导数符号判定时卡住了..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 focus:outline-hidden focus:border-rose-500 resize-none leading-relaxed text-warm-800"
              />
              <button
                onClick={() => handleRunTutor('audit')}
                disabled={loading || !questionText.trim()}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                开始步骤逻辑挑刺与排查
              </button>
            </div>
          )}

          {/* Result view */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-warm-500">
              <Loader2 className="w-6 h-6 animate-spin text-accent-orange" />
              <div className="text-xs font-medium">正在调取导师思维链，进行深度启发分析...</div>
            </div>
          ) : result ? (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-warm-800">导师启发指导：</span>
                  {result.engineUsed && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-cream-200 text-warm-600">
                      引擎：{result.engineUsed}
                    </span>
                  )}
                  {result.syllabusMatch && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent-sage/10 text-accent-sage border border-accent-sage/20">
                      考点：{result.syllabusMatch.level3}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-warm-500 hover:text-warm-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-accent-sage" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制思路'}
                  </button>
                  <button
                    onClick={() => handleRunTutor(mode)}
                    className="p-1 text-warm-400 hover:text-warm-700 transition-colors"
                    title="重新生成"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200/80 text-xs leading-relaxed text-warm-900 prose prose-sm max-w-none">
                <MarkdownRenderer content={result.content} />
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-warm-400 text-xs">
              点击上方按钮开始获取思路提示、步骤挑刺或公式反查
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between text-xs text-warm-500">
          <span>💡 提示：尝试自己动笔推导第一步，若卡壳可随时切换至“解题步骤挑刺”</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-warm-700 font-semibold transition-colors"
          >
            完成关闭
          </button>
        </div>
      </div>
    </div>
  )
}
