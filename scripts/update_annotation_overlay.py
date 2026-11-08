with open('obsidian-viz/src/components/InteractiveAnnotationOverlay.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 优化未激活时的胶囊透明度与边框呼吸感
old_cls = "className={`w-fit max-w-[98vw] flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl text-xs select-none transition-[opacity,box-shadow] duration-200"
new_cls = "className={`w-fit max-w-[98vw] flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.08)] text-xs select-none transition-all duration-200 ${!isAnnotationActive ? 'opacity-85 hover:opacity-100' : ''}"

text = text.replace(old_cls, new_cls)

# 优化未激活时的按钮样式：无生硬描边，轻巧色阶
old_btn = '''                {!isAnnotationActive ? (
                  <button
                    type="button"
                    onClick={() => onToggleAnnotation(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-accent-orange hover:text-white transition-all shadow-xs touch-manipulation"
                    title="提笔在当前页面任意处就地批注"
                  >
                    <MousePointer className="w-4 h-4 text-accent-orange" />
                    <span>提笔批注</span>
                  </button>'''

new_btn = '''                {!isAnnotationActive ? (
                  <button
                    type="button"
                    onClick={() => onToggleAnnotation(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-all duration-150 shadow-2xs touch-manipulation group cursor-pointer"
                    title="提笔在当前页面任意处就地批注 (可按住左侧手柄自由拖拽)"
                  >
                    <PenTool className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white transition-colors" />
                    <span>提笔批注</span>
                  </button>'''

text = text.replace(old_btn, new_btn)

with open('obsidian-viz/src/components/InteractiveAnnotationOverlay.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("InteractiveAnnotationOverlay updated!")
