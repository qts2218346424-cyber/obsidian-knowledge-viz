file_path = 'obsidian-viz/src/components/chat/ChatMessageItem.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. 助手消息主卡片去粗描边，增加 Surface Elevation 微阴影与 1.75 舒适行高
old_bubble = "w-full bg-white border border-neutral-200/80 text-neutral-900 rounded-2xl rounded-tl-xs shadow-xs"
new_bubble = "w-full bg-white border border-slate-200/60 text-slate-900 rounded-2xl rounded-tl-xs shadow-[0_2px_10px_rgba(0,0,0,0.02)] leading-[1.75] academic-body"
text = text.replace(old_bubble, new_bubble)

# 2. 双导师卡片去套娃与微阴影
old_dual_b = "className=\"flex flex-col bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-purple-300/80 transition-all min-w-0\""
new_dual_b = "className=\"flex flex-col bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-indigo-300/60 transition-all min-w-0 leading-[1.75] academic-body\""
text = text.replace(old_dual_b, new_dual_b)

old_dual_a = "className=\"flex flex-col bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-amber-300/80 transition-all min-w-0\""
new_dual_a = "className=\"flex flex-col bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-amber-300/60 transition-all min-w-0 leading-[1.75] academic-body\""
text = text.replace(old_dual_a, new_dual_a)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("ChatMessageItem.tsx updated with surface elevation!")
