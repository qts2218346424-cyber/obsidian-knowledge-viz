import { useState, useEffect } from 'react'
import {
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Bot,
  Loader2,
  Volume2,
  AlertCircle,
} from 'lucide-react'
import type { EnglishTranslationExam, TranslationSentenceItem } from '../../data/englishPracticeData'
import { authService } from '../../services/auth'
import MarkdownRenderer from '../MarkdownRenderer'
import WordLookupPopover, {
  useEnglishWordLookup,
  speakEnglishText,
} from './WordLookupPopover'

interface EnglishTranslationViewerProps {
  exam: EnglishTranslationExam
  onBack?: () => void
}

type FontScale = 'sm' | 'md' | 'lg'

const STORAGE_KEY_TRANS_PREFIX = 'coreforge_english_trans_record_'

export default function EnglishTranslationViewer({ exam, onBack }: EnglishTranslationViewerProps) {
  const [userInputs, setUserInputs] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({})
  const [fontScale, setFontScale] = useState<FontScale>('md')

  // AI 采分点流式批改状态（按题号独立管理）
  const [aiGradingLoading, setAiGradingLoading] = useState<Record<number, boolean>>({})
  const [aiGradingText, setAiGradingText] = useState<Record<number, string>>({})
  const [aiGradingError, setAiGradingError] = useState<Record<number, string | null>>({})

  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`)
      setUserInputs(saved ? JSON.parse(saved) : {})
    } catch {
      setUserInputs({})
    }
    setRevealedAnswers({})
    setAiGradingText({})
    setAiGradingError({})
  }, [exam.id])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`, JSON.stringify(userInputs))
    } catch {
      // ignore
    }
  }, [userInputs, exam.id])

  const handleInputChange = (num: number, val: string) => {
    setUserInputs((prev) => ({ ...prev, [num]: val }))
  }

  const toggleReveal = (num: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [num]: !prev[num] }))
  }

  const handleReset = () => {
    if (window.confirm('确定要清空翻译作答内容吗？')) {
      setUserInputs({})
      setRevealedAnswers({})
      setAiGradingText({})
      setAiGradingError({})
      try {
        localStorage.removeItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`)
      } catch {
        // ignore
      }
    }
  }

  // 调用 /api/local-agents/chat 流式对照官方采分点批改考生译文
  const handleAiGradeTranslation = async (item: TranslationSentenceItem) => {
    const draft = (userInputs[item.number] || '').trim()
    if (!draft) {
      setAiGradingError((prev) => ({
        ...prev,
        [item.number]: '请先在上方输入框填写您的中文译文草稿，再启动 AI 采分点批改。',
      }))
      return
    }

    const maxScore = exam.examType === 'english_1' ? '2.0' : '15.0'
    const scoringRubric = (item.scoringPoints || [])
      .map((sp, idx) => `${idx + 1}. ${sp.point}（+${sp.score} 分）`)
      .join('\n')

    const promptMessage = `【考研英语英译汉 AI 采分点精准阅卷请求】
试卷来源：${exam.year} 年 ${exam.examType === 'english_1' ? '考研英语(一)' : '考研英语(二)'} · 第 ${item.number} 题（本题满分 ${maxScore} 分）

【英文原句】：
"${item.en}"

【官方标准参考译文】：
"${item.zhRef}"

【官方阅卷采分点细则】：
${scoringRubric || '按主干准确度、从句逻辑转换、核心熟词生义精准度及中文通顺度综合给分'}

【考生提交的中文译文】：
"""
${draft}
"""

请你作为考研英语阅卷组专家，严格对照官方采分点对考生译文进行逐点批改，按以下结构清晰输出：
1. **🎯 阅卷建议得分**：给出具体得分（如 \`1.5 / ${maxScore} 分\`，精确到 0.5 分）与一句话总体评价；
2. **⚖️ 采分点逐条核验**：逐一核对上述官方采分点，标明 \`✅ 已命中\` 或 \`⚠️ 漏译/误译/欠妥\` 并指出具体扣分原因；
3. **✨ 基于考生译文的语序优化定稿**：保留考生合理表达的基础上，修正错漏与西化翻译腔，给出顺畅地道的满分修改示范。`

    setAiGradingLoading((prev) => ({ ...prev, [item.number]: true }))
    setAiGradingError((prev) => ({ ...prev, [item.number]: null }))
    setAiGradingText((prev) => ({ ...prev, [item.number]: '' }))

    try {
      const res = await fetch('/api/local-agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          message: promptMessage,
          agentId: 'mojuan',
          history: [],
          projectName: '考研英语研学中枢 · 英译汉精批',
          pageContext: '英译汉对照采分点 AI 流式阅卷',
        }),
      })

      if (!res.ok) {
        if (res.status === 402) {
          throw new Error('伴学积分不足（单次批改消耗 0.1 积分），请先每日签到领取积分。')
        }
        throw new Error(`AI 阅卷服务响应异常 (HTTP ${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('流式读取器不可用')
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          try {
            const payload = JSON.parse(trimmed.replace(/^data:\s*/, ''))
            if (payload.type === 'delta' && payload.text) {
              accumulated += payload.text
              setAiGradingText((prev) => ({ ...prev, [item.number]: accumulated }))
            } else if (payload.type === 'error') {
              setAiGradingError((prev) => ({
                ...prev,
                [item.number]: payload.message || 'AI 点评过程中出现异常',
              }))
            }
          } catch {
            // ignore malformed JSON chunk
          }
        }
      }
    } catch (err: any) {
      setAiGradingError((prev) => ({
        ...prev,
        [item.number]: err?.message || '网络连接波动，请稍后重试',
      }))
    } finally {
      setAiGradingLoading((prev) => ({ ...prev, [item.number]: false }))
    }
  }

  const typographyClass =
    fontScale === 'sm'
      ? 'font-serif text-[15px] sm:text-[16px] leading-[1.82] tracking-[0.01em]'
      : fontScale === 'lg'
      ? 'font-serif text-[17.5px] sm:text-[18.5px] leading-[1.92] tracking-[0.012em]'
      : 'font-serif text-[16px] sm:text-[17px] leading-[1.86] tracking-[0.01em]'

  return (
    <div className="space-y-5 animate-fade-in">
      <WordLookupPopover state={lookupState} onClose={closeLookup} />

      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ← 返回题库
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              {exam.examType === 'english_1' ? '英语(一)' : '英语(二)'}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {exam.year} 年真题 · 英译汉翻译专项
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* 字号微调 */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/70 dark:border-slate-700">
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontScale(sz)}
                className={`px-2 py-1 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
                  fontScale === sz
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空作答</span>
          </button>
        </div>
      </div>

      <div
        onClick={handleWordLookupClick}
        onDoubleClick={handleWordLookupDoubleClick}
        className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-6"
      >
        <div>
          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            {exam.source}
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-1 leading-snug">
            {exam.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 leading-relaxed">
            📖 <strong>考查与训练闭环：</strong> 先独立切分从句并输入中文译文草稿，点击 <strong>「🤖 AI 对照采分点批改我的译文」</strong> 获取精确到 0.5 分的漏译词诊断与语序润色；点击原句任意英文生词可即点即查并写入艾宾浩斯词库。
          </p>
        </div>

        {/* 逐题翻译卡片 */}
        <div className="space-y-6">
          {exam.items.map((item) => {
            const isRevealed = revealedAnswers[item.number]
            const userText = userInputs[item.number] || ''
            const isGrading = Boolean(aiGradingLoading[item.number])
            const aiReport = aiGradingText[item.number] || ''
            const aiErr = aiGradingError[item.number]

            return (
              <div
                key={item.number}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/45 dark:bg-slate-800/35 space-y-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {item.number}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      第 {item.number} 题 · 英文划线原句
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakEnglishText(item.en, 'en-US', 0.9)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      title="朗读英文长难句"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>朗读原句</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      满分 {exam.examType === 'english_1' ? '2.0' : '15.0'} 分
                    </span>
                  </div>
                </div>

                {/* 学术衬线英文原句 */}
                <div
                  className={`p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 select-text cursor-text ${typographyClass}`}
                >
                  {item.en}
                </div>

                {/* 考生作答输入框 */}
                <div className="space-y-1.5" data-no-word-lookup="true">
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>我的中文翻译草稿:</span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {userText.length} 字
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={userText}
                    onChange={(e) => handleInputChange(item.number, e.target.value)}
                    placeholder="在此输入您的中文译文草稿（完成后可一键调用 AI 对照官方采分点逐词批改）..."
                    className="w-full p-3.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 outline-none leading-relaxed text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* 操作按钮栏：官方译文对照 + AI 对照采分点流式批改 */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.number)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRevealed
                        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/70'
                    }`}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? '收起官方译文' : '核对参考译文与采分点'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGrading}
                    onClick={() => handleAiGradeTranslation(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-55 cursor-pointer active:scale-98"
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI 正在逐点核验采分点...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-amber-300" />
                        <span>🤖 AI 对照采分点批改我的译文</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI 错误提示 */}
                {aiErr && (
                  <div
                    data-no-word-lookup="true"
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{aiErr}</span>
                  </div>
                )}

                {/* AI 流式阅卷点评卡片 */}
                {(isGrading || aiReport) && (
                  <div
                    data-no-word-lookup="true"
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/70 space-y-2.5 animate-fade-in shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-800/60">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>墨卷阅卷组 · 采分点对照精批报告</span>
                      </span>
                      {isGrading && (
                        <span className="text-[10.5px] font-mono text-indigo-600 dark:text-indigo-300 animate-pulse">
                          实时流式评阅中...
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {aiReport ? (
                        <MarkdownRenderer content={aiReport} />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          正在比对您的译文与官方 {item.scoringPoints?.length || 4} 项采分细则...
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 参考译文与采分点折叠 */}
                {isRevealed && (
                  <div
                    data-no-word-lookup="true"
                    className="p-4 rounded-2xl bg-amber-50/55 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-3 animate-fade-in text-xs font-sans"
                  >
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200 block mb-1">
                        🎯 官方权威标准参考译文:
                      </span>
                      <p className="text-slate-800 dark:text-slate-100 bg-white/85 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/50 leading-relaxed font-sans">
                        {item.zhRef}
                      </p>
                    </div>

                    {item.scoringPoints && item.scoringPoints.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                          ⚖️ 阅卷采分要点分步对照:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.scoringPoints.map((sp, spIdx) => (
                            <div
                              key={spIdx}
                              className="p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-700 dark:text-slate-200">{sp.point}</span>
                              <span className="font-mono font-bold text-amber-700 dark:text-amber-300 shrink-0 ml-2">
                                +{sp.score} 分
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.analysis && (
                      <div className="text-[11.5px] text-slate-700 dark:text-slate-300 bg-white/75 dark:bg-slate-900/70 p-3 rounded-xl border border-amber-100 dark:border-amber-800/40">
                        <strong className="text-slate-900 dark:text-slate-100">
                          🔍 语法结构与翻译策略:{' '}
                        </strong>
                        <span>{item.analysis}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
