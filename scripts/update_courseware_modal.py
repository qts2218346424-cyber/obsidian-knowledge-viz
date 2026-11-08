file_path = 'obsidian-viz/src/components/CoursewareViewerModal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 升级 Modal 容器为 90%~94% 视口宽高的全屏沉浸式工作台
old_modal_box = """        className={`dark bg-[#0d111d] border-0 sm:border sm:border-white/12 flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-dvh rounded-none'
            : 'w-full h-dvh sm:w-[96vw] sm:max-w-[1440px] sm:h-[92dvh] sm:rounded-2xl'
        }`}"""

new_modal_box = """        className={`dark bg-[#0a0e17] border-0 sm:border sm:border-white/10 flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-dvh rounded-none'
            : 'w-full h-dvh sm:w-[94vw] sm:h-[90vh] sm:max-w-[1720px] sm:rounded-2xl ring-1 ring-white/10'
        }`}"""

text = text.replace(old_modal_box, new_modal_box)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("CoursewareViewerModal updated to 90% immersive workbench!")
