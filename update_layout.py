# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'e:\知识库项目\obsidian-viz\src\components\Layout.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 增加 open-ai-assistant 事件监听
old_guide = '// 新用户首次登录智能唤起指引'
new_guide = '''const onOpenAIAssistant = () => openModal('ai-assistant')
    window.addEventListener('open-ai-assistant', onOpenAIAssistant)

    // 新用户首次登录智能唤起指引'''

if old_guide in content and 'open-ai-assistant' not in content:
    content = content.replace(old_guide, new_guide, 1)

# 2. 增加 ⌘J / Ctrl+J 快捷键
old_key = "if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {"
new_key = '''if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') ||
          ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a')) {'''

if old_key in content:
    content = content.replace(old_key, new_key, 1)

# 3. 移除事件监听
old_remove = "window.removeEventListener('open-quick-note', onOpenQuickNote)"
new_remove = '''window.removeEventListener('open-ai-assistant', onOpenAIAssistant)
      window.removeEventListener('open-quick-note', onOpenQuickNote)'''

if old_remove in content and "removeEventListener('open-ai-assistant'" not in content:
    content = content.replace(old_remove, new_remove, 1)

# 4. 顶栏添加 AI 伴学按钮
old_quicknote_btn = 'aria-label="随手记"'
# 找到随手记按钮结束的 </button>
idx = content.find(old_quicknote_btn)
if idx != -1:
    btn_end = content.find('</button>', idx)
    if btn_end != -1 and 'aria-label="双核 AI 伴学抽屉"' not in content:
        insert_code = '''

            {/* AI 伴学舱全局抽屉触发按钮 */}
            <button
              onClick={() => {
                if (activeModals['ai-assistant']) {
                  closeModal('ai-assistant')
                } else {
                  openModal('ai-assistant')
                }
              }}
              aria-label="双核 AI 伴学抽屉"
              title="唤起双核 AI 伴学抽屉（快捷键 ⌘J / Ctrl+J）"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200/90 bg-indigo-50/80 px-2 sm:px-2.5 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">AI 伴学</span>
              <kbd className="hidden lg:inline-flex items-center text-[9px] font-mono text-indigo-500 bg-white/80 border border-indigo-200 rounded px-1 py-0.2 shrink-0">
                ⌘J
              </kbd>
            </button>'''
        content = content[:btn_end + 9] + insert_code + content[btn_end + 9:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Layout.tsx 成功更新完毕！')
