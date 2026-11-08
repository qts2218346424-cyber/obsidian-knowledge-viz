# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'e:\知识库项目\obsidian-viz\src\pages\Quiz.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 移除第一处冲突的 keydown 监听 (418-445 行)
old_shortcut_block = """  // ── Keyboard Shortcuts (Linear-style) ──────────────────────────────────────

  useEffect(() => {
    if (view !== 'quiz' || questions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleOptionSelect(key)
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const map: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
        handleOptionSelect(map[e.key])
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (mode === 'practice' && showFeedback) {
          advanceQuestion()
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) goToQuestion(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, questions, currentIndex, mode, showFeedback, answers])"""

if old_shortcut_block in content:
    content = content.replace(old_shortcut_block, "  // (键盘快捷键流已统一定义在下方，包含 A/B/C/D、1/2/3/4、方向键翻题与 Enter 展开解析)")
    print("成功移除第一处冗余快捷键监听")
else:
    print("警告：第一处快捷键监听未精确匹配，稍后检查")

# 2. 插入 handleAskAI 函数以及统一的键盘监听
old_advance_block = """  const advanceQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1)
    } else {
      finishQuiz()
    }
  }, [currentIndex, questions, answers, mode])"""

new_advance_and_ask_block = """  const advanceQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1)
    } else {
      finishQuiz()
    }
  }, [currentIndex, questions, answers, mode])

  // 原地闭环唤起双核 AI 伴学舱追问当前题目
  const handleAskAI = useCallback((q: ActiveQuizQuestion) => {
    const userAns = answers[q.id]
    const subjectInfo = ALL_SUBJECTS.find(s => s.key === q.subject)?.name || q.subject || '考研真题'
    
    let optionsText = ''
    if (q.options) {
      optionsText = Object.entries(q.options)
        .filter(([_, text]) => Boolean(text))
        .map(([key, text]) => `   ${key}. ${text}`)
        .join('\\n')
    }
    
    const contextPrompt = [
      `【当前考研科目与考点】：${subjectInfo} · ${q.chapter || '考点演练'} · ${q.topic || '真题解析'}`,
      `【题型与题号】：${q.type === 'blank' ? '填空/计算题' : '单项选择题'} (题号 #${q.id})`,
      `【完整题干】：\\n${q.question}`,
      optionsText ? `【题目选项】：\\n${optionsText}` : null,
      `【我的作答】：${userAns ? userAns : '（尚未作答 / 存在疑惑）'}`,
      q.answer ? `【标准答案】：${q.answer}` : null,
      q.explanation ? `【参考解析与定理】：\\n${q.explanation}` : null
    ].filter(Boolean).join('\\n\\n')

    const defaultInput = userAns && q.answer && userAns.toUpperCase() !== q.answer.toUpperCase()
      ? `为什么我的选项 ${userAns} 不对？请结合考研定理与本题陷阱详细剖析：`
      : `请针对这道题的核心考点与解题突破口，为我详细拆解思维推导过程：`

    window.dispatchEvent(new CustomEvent('open-ai-assistant', {
      detail: {
        contextPrompt,
        defaultInput
      }
    }))
  }, [answers])"""

if old_advance_block in content:
    content = content.replace(old_advance_block, new_advance_and_ask_block, 1)
    print("成功注入 handleAskAI 函数")

# 3. 替换第二处键盘监听为全局高内聚键盘优先流
old_second_keydown = """  // UI/UX Pro Max · 极速刷题无障碍键盘监听 (A/B/C/D 选答，方向键翻题)
  useEffect(() => {
    if (view !== 'quiz') return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框、文本域或按下修饰键，不劫持
      const activeEl = document.activeElement
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement
      if (isInput || e.ctrlKey || e.metaKey || e.altKey) return

      const upperKey = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(upperKey)) {
        const q = questions[currentIndex]
        if (q && q.options && (q.options as any)[upperKey]) {
          e.preventDefault()
          handleOptionSelect(upperKey)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        advanceQuestion()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0) {
          goToQuestion(currentIndex - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, currentIndex, questions, handleOptionSelect, advanceQuestion])"""

new_second_keydown = """  // UI/UX Pro Max · 全面补齐键盘快捷键流 (Keyboard-First 体验)
  // 支持 A/B/C/D 或 1/2/3/4 直接选答案；←/→ 翻题；Enter 展开/收起解析
  useEffect(() => {
    if (view !== 'quiz' || questions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 遇到系统级修饰键 (Ctrl/Cmd/Alt) 时不拦截，方便用户触发 ⌘J / Ctrl+J
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // 如果焦点在输入框、文本域或可编辑区域，不劫持
      const activeEl = document.activeElement as HTMLElement | null
      const isInput = activeEl instanceof HTMLInputElement || 
                      activeEl instanceof HTMLTextAreaElement || 
                      (activeEl && activeEl.isContentEditable)
      if (isInput) return

      const curQ = questions[currentIndex]
      if (!curQ) return

      const upperKey = e.key.toUpperCase()
      // 1. A / B / C / D 直接选答案
      if (['A', 'B', 'C', 'D'].includes(upperKey)) {
        if (curQ.options && (curQ.options as any)[upperKey]) {
          e.preventDefault()
          handleOptionSelect(upperKey)
        }
      }
      // 2. 1 / 2 / 3 / 4 选答案
      else if (['1', '2', '3', '4'].includes(e.key)) {
        const numToOpt: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
        const targetOpt = numToOpt[e.key]
        if (curQ.options && (curQ.options as any)[targetOpt]) {
          e.preventDefault()
          handleOptionSelect(targetOpt)
        }
      }
      // 3. 方向键 ← 上一题
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0) {
          goToQuestion(currentIndex - 1)
        }
      }
      // 4. 方向键 → 下一题
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        advanceQuestion()
      }
      // 5. Enter 展开 / 收起解析 (原地秒查定理)
      else if (e.key === 'Enter') {
        e.preventDefault()
        setShowFeedback(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, currentIndex, questions, handleOptionSelect, advanceQuestion, goToQuestion])"""

if old_second_keydown in content:
    content = content.replace(old_second_keydown, new_second_keydown, 1)
    print("成功替换第二处键盘监听为统一高内聚键盘优先流")

# 4. 题目卡片右上角增加【✨ 追问 AI (⌘J)】
old_top_bookmark = """                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  title={isBookmarked ? '取消标星' : '标星关注此题'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Star size={17} className={isBookmarked ? 'fill-amber-500' : ''} />
                </button>"""

new_top_bookmark = """                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAskAI(currentQ)}
                    title="唤起双核 AI 伴学抽屉追问此题（快捷键 ⌘J / Ctrl+J）"
                    className="p-1.5 px-2.5 rounded-xl text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>✨ 追问 AI</span>
                    <kbd className="hidden sm:inline-block text-[9px] font-mono text-indigo-500 bg-white/90 border border-indigo-200 rounded px-1 py-0.2">⌘J</kbd>
                  </button>

                  <button
                    onClick={() => toggleBookmark(currentQ.id)}
                    title={isBookmarked ? '取消标星' : '标星关注此题'}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Star size={17} className={isBookmarked ? 'fill-amber-500' : ''} />
                  </button>
                </div>"""

if old_top_bookmark in content:
    content = content.replace(old_top_bookmark, new_top_bookmark, 1)
    print("成功在题目卡片右上角增加追问 AI 按钮")

# 5. 选项卡片快捷键提示优化 (A/1, B/2 等)
old_kbd = """                        {/* 快捷键提示徽章 */}
                        <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200/80 bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:border-slate-300 transition-colors shrink-0 mt-0.5">
                          {key}
                        </kbd>"""

new_kbd = """                        {/* 键盘快捷键提示徽章 */}
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200/80 bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:border-slate-300 transition-colors shrink-0 mt-0.5">
                          <span>{key}</span>
                          <span className="text-slate-300">/</span>
                          <span>{key === 'A' ? '1' : key === 'B' ? '2' : key === 'C' ? '3' : '4'}</span>
                        </kbd>"""

if old_kbd in content:
    content = content.replace(old_kbd, new_kbd, 1)
    print("成功升级选项卡片按键徽标")

# 6. 底部导航栏增加 [←]、[→]、[Enter] 与追问 AI 按钮
old_bottom_nav = """              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>上一题</span>
                </button>

                <div className="hidden md:block text-xs text-slate-400">
                  键盘快捷键：<kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">A/B/C/D</kbd> 作答 · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">Enter</kbd> 下一题
                </div>

                <WarmButton
                  onClick={advanceQuestion}
                  disabled={mode === 'practice' && !showFeedback && currentIndex < questions.length - 1}
                  className="bg-accent-orange text-white px-6 cursor-pointer"
                >
                  <span>{currentIndex < questions.length - 1 ? '下一题 →' : '交卷结算'}</span>
                </WarmButton>
              </div>"""

new_bottom_nav = """              {/* Bottom Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-slate-100/70"
                  title="上一题（快捷键 ←）"
                >
                  <ArrowLeft size={14} />
                  <span>上一题</span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.2 rounded border border-slate-200 bg-slate-100 text-slate-400">
                    ←
                  </kbd>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedback(prev => !prev)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="按 Enter 键展开/收起解析"
                  >
                    <BookOpen size={13} className="text-indigo-600" />
                    <span>{showFeedback ? '收起解析' : '展开解析'}</span>
                    <kbd className="text-[10px] font-mono px-1 py-0.2 rounded border border-slate-200 bg-slate-100 text-slate-400">
                      Enter
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAI(currentQ)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200/90 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
                    title="唤起双核 AI 伴学舱追问（快捷键 ⌘J / Ctrl+J）"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>✨ 追问 AI</span>
                    <kbd className="text-[10px] font-mono px-1 py-0.2 rounded border border-indigo-200 bg-white/80 text-indigo-500">
                      ⌘J
                    </kbd>
                  </button>
                </div>

                <WarmButton
                  onClick={advanceQuestion}
                  disabled={mode === 'practice' && !showFeedback && currentIndex < questions.length - 1}
                  className="bg-accent-orange text-white px-5 cursor-pointer flex items-center gap-1.5"
                  title="下一题（快捷键 →）"
                >
                  <span>{currentIndex < questions.length - 1 ? '下一题' : '交卷结算'}</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-white/30 bg-black/20 text-white">
                    →
                  </kbd>
                </WarmButton>
              </div>"""

if old_bottom_nav in content:
    content = content.replace(old_bottom_nav, new_bottom_nav, 1)
    print("成功升级底部导航按键与追问 AI 按钮")

# 7. 交卷报告页错题卡片增加【✨ 追问 AI (⌘J)】
old_report_variant_btn = """                        <button
                          onClick={() => handleGenerateVariants(q)}
                          disabled={generatingVariants}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl subframe-btn-secondary px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >"""

new_report_variant_btn = """                        <button
                          type="button"
                          onClick={() => handleAskAI(q)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="唤起双核 AI 伴学抽屉深度答疑此错题（快捷键 ⌘J / Ctrl+J）"
                        >
                          <Sparkles size={13} className="text-indigo-600" />
                          <span>✨ 追问 AI (⌘J)</span>
                        </button>

                        <button
                          onClick={() => handleGenerateVariants(q)}
                          disabled={generatingVariants}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl subframe-btn-secondary px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >"""

if old_report_variant_btn in content:
    content = content.replace(old_report_variant_btn, new_report_variant_btn, 1)
    print("成功在交卷报告错题卡片上增加追问 AI 按钮")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Quiz.tsx 全部升级完成！")
