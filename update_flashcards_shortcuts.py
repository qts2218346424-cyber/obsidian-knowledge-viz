# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'e:\知识库项目\obsidian-viz\src\components\study\FlashcardsTab.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 在 handleReviewStep 之后增加键盘监听 useEffect
target_step = """    if (currentReviewIdx + 1 < nextQueue.length) {
      setReviewQueue(nextQueue)
      setCurrentReviewIdx(prev => prev + 1)
      setIsReviewFlipped(false)
    } else {
      // 队列全部通关
      alert(`🎉 恭喜！本轮记忆攻坚已全部通关！共强化复习了 ${sessionReviewedCount + 1} 次知识点！`)
      setReviewModalOpen(false)
      loadCards()
    }
  }"""

new_shortcut_effect = """    if (currentReviewIdx + 1 < nextQueue.length) {
      setReviewQueue(nextQueue)
      setCurrentReviewIdx(prev => prev + 1)
      setIsReviewFlipped(false)
    } else {
      // 队列全部通关
      alert(`🎉 恭喜！本轮记忆攻坚已全部通关！共强化复习了 ${sessionReviewedCount + 1} 次知识点！`)
      setReviewModalOpen(false)
      loadCards()
    }
  }

  // 极速背诵沉浸式键盘流 (Keyboard-First 体验)
  // Space 翻转卡片，翻面后 1 代表“模糊重来”，2 代表“掌握记住”
  useEffect(() => {
    if (!reviewModalOpen || reviewQueue.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 遇到系统级修饰键 (Ctrl/Cmd/Alt) 时不拦截
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // 如果焦点在输入框或文本域，不劫持
      const activeEl = document.activeElement as HTMLElement | null
      const isInput = activeEl instanceof HTMLInputElement || 
                      activeEl instanceof HTMLTextAreaElement || 
                      (activeEl && activeEl.isContentEditable)
      if (isInput) return

      // Space 键：翻转卡片
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        setIsReviewFlipped(prev => !prev)
      }
      // 翻面后支持按 1 (模糊重来) 或 2 (记住过)
      else if (isReviewFlipped) {
        if (e.key === '1') {
          e.preventDefault()
          handleReviewStep(false)
        } else if (e.key === '2') {
          e.preventDefault()
          handleReviewStep(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [reviewModalOpen, reviewQueue, currentReviewIdx, isReviewFlipped, sessionReviewedCount])"""

if target_step in content:
    content = content.replace(target_step, new_shortcut_effect, 1)
    print("成功为 FlashcardsTab 添加沉浸式背卡键盘流")
else:
    print("未找到 target_step，请检查")

# 2. 升级翻转卡片按钮视觉与角标
old_flip_btn = """                      <div className="text-center py-8">
                        <button
                          onClick={() => setIsReviewFlipped(true)}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span>翻转查看考点答案与记忆口诀 (空格键)</span>
                        </button>
                      </div>"""

new_flip_btn = """                      <div className="text-center py-8">
                        <button
                          onClick={() => setIsReviewFlipped(true)}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 mx-auto active:scale-95"
                          title="按空格键翻转卡片 [Space]"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span>翻转查看考点答案与记忆口诀</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-white/20 border border-white/30 text-[10px] font-mono text-white">
                            Space
                          </kbd>
                        </button>
                      </div>"""

if old_flip_btn in content:
    content = content.replace(old_flip_btn, new_flip_btn, 1)
    print("成功升级翻转按钮与 Space 角标")

# 3. 升级底部评估按钮 (1 模糊 / 2 掌握)
old_eval_buttons = """            {/* 底部评估按钮栏 */}
            {isReviewFlipped && (
              <div className="p-4 border-t border-cream-200 bg-cream-50/80 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleReviewStep(false)}
                  className="flex-1 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Frown className="w-4 h-4" />
                  <span>仍很模糊 / 记不清 (加入本轮再背)</span>
                </button>

                <button
                  onClick={() => handleReviewStep(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Smile className="w-4 h-4" />
                  <span>已熟练掌握 / 记住了 (下一张)</span>
                </button>
              </div>
            )}"""

new_eval_buttons = """            {/* 底部评估按钮栏 */}
            {isReviewFlipped && (
              <div className="p-4 border-t border-cream-200 bg-cream-50/80 flex items-center justify-between gap-4">
                <button
                  onClick={() => handleReviewStep(false)}
                  className="flex-1 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  title="标记为模糊并重新记忆（快捷键 1）"
                >
                  <Frown className="w-4 h-4" />
                  <span>模糊 / 重来</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-300 text-[10px] font-mono text-rose-800">
                    1
                  </kbd>
                </button>

                <button
                  onClick={() => handleReviewStep(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  title="标记为熟练掌握并进入下一张（快捷键 2）"
                >
                  <Smile className="w-4 h-4" />
                  <span>记住 / 通过</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/25 border border-white/35 text-[10px] font-mono text-white">
                    2
                  </kbd>
                </button>
              </div>
            )}"""

if old_eval_buttons in content:
    content = content.replace(old_eval_buttons, new_eval_buttons, 1)
    print("成功升级底部 1 / 2 评估快捷键按钮")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("FlashcardsTab.tsx 全部升级完成！")
