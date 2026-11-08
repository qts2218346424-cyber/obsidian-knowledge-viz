import re

file_path = 'obsidian-viz/src/pages/Politics.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. 顶部驾驶舱：去除杂色渐变与过粗边框，采用 Linear 质感纯净白底与微阴影
old_header = '''      {/* ── 顶部统一政治专区导航驾驶舱 ── */}
      <section className="bento-card rounded-3xl p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-r from-white via-white to-rose-50/40">'''

new_header = '''      {/* ── 顶部统一政治专区导航驾驶舱 (Linear 极简微阴影与克制色阶) ── */}
      <section className="rounded-3xl p-4 sm:p-5 relative overflow-hidden bg-white border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">'''

text = text.replace(old_header, new_header)

# 2. 顶部胶囊标签收敛为 Indigo 与 Amber 语义色
old_tags = '''              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-rose-700">
                <Landmark className="w-3.5 h-3.5 text-rose-600" />
                <span>2026/2027 考研政治总攻专区</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>全屏史纲时空轴 · 肖秀荣1000题 · 知识点收藏</span>
              </span>'''

new_tags = '''              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-[11px] font-semibold text-indigo-700">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>2026/2027 考研政治专攻</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/60">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>史纲时空轴 · 肖秀荣 1000 题 · 易混对比</span>
              </span>'''

text = text.replace(old_tags, new_tags)

# 3. 肖秀荣 1000 题做题卡片与选项去套娃、正文行高拉至 1.75
old_card_outer = '<div className="bento-card rounded-3xl p-5 sm:p-7 space-y-5">'
new_card_outer = '<div className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">'
text = text.replace(old_card_outer, new_card_outer)

old_question_text = '<div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">'
new_question_text = '<div className="text-base sm:text-lg font-bold text-slate-900 leading-[1.75] tracking-tight">'
text = text.replace(old_question_text, new_question_text)

# 4. 肖秀荣名师深度解析区域去套娃：用极淡色阶替代深色嵌套描边
old_analysis_box = '<div className="rounded-2xl p-4 sm:p-5 bg-slate-50 border border-slate-200 space-y-3.5 animate-fade-in-up">'
new_analysis_box = '<div className="rounded-2xl p-4 sm:p-5 bg-slate-50/70 border border-slate-200/50 space-y-3.5 animate-fade-in-up leading-[1.75]">'
text = text.replace(old_analysis_box, new_analysis_box)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Politics.tsx surface elevation and border de-nesting updated!")
