file_path = 'obsidian-viz/src/data/coursewares/avlTree.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 升级 grid-template-columns 为 340px 1fr
text = text.replace(
    'grid-template-columns: 280px 1fr;',
    'grid-template-columns: 340px 1fr;'
)

# 增加代码高亮样式
code_styles = """
  .code-viewer {
    background: #060911;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.6;
    color: #94a3b8;
    overflow-x: auto;
  }
  .code-line {
    padding: 1px 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }
  .code-line.active {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    font-weight: bold;
    border-left: 2.5px solid #38bdf8;
  }
  .code-kw { color: #f43f5e; font-weight: 600; }
  .code-fn { color: #38bdf8; font-weight: 600; }
  .code-cm { color: #64748b; font-style: italic; }
"""

if '.code-viewer' not in text:
    text = text.replace('svg { width: 100%; height: 100%; }', code_styles + '\n  svg { width: 100%; height: 100%; }')

# 在控制组中增加代码步进演示区域
old_panel_controls = """    <div class="controls-group">
      <div class="label">旋转调优过程日志</div>
      <div class="log-box" id="logBox">准备就绪，请插入节点或点击预设。</div>
    </div>"""

new_panel_controls = """    <div class="controls-group">
      <div class="label">408 核心算法步进代码</div>
      <div class="code-viewer" id="codeBox">
        <div class="code-line" id="line1"><span class="code-cm">// 最小失衡子树 A 自平衡调整</span></div>
        <div class="code-line" id="line2"><span class="code-kw">AVLNode*</span> <span class="code-fn">RotateRight</span>(A) {</div>
        <div class="code-line" id="line3">&nbsp;&nbsp;B = A->left;</div>
        <div class="code-line" id="line4">&nbsp;&nbsp;A->left = B->right;</div>
        <div class="code-line" id="line5">&nbsp;&nbsp;B->right = A;</div>
        <div class="code-line" id="line6">&nbsp;&nbsp;UpdateHeight(A); UpdateHeight(B);</div>
        <div class="code-line" id="line7">&nbsp;&nbsp;<span class="code-kw">return</span> B; <span class="code-cm">// 新根</span></div>
        <div class="code-line" id="line8">}</div>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">旋转调优实时追踪日志</div>
      <div class="log-box" id="logBox">准备就绪，请插入节点或点击上方预设。</div>
    </div>"""

text = text.replace(old_panel_controls, new_panel_controls)

# 在 JavaScript 旋转函数中联动高亮对应代码行
old_rotate_right_fn = """function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  log(`【LL型调整】对节点 <b>${y.val}</b> 执行右单旋 (以 <b>${x.val}</b> 为新根)`);
  x.right = y;
  y.left = T2;
  updateHeightAndBF(y);
  updateHeightAndBF(x);
  return x;
}"""

new_rotate_right_fn = """function highlightLine(lineNum) {
  for (let i = 1; i <= 8; i++) {
    const el = document.getElementById('line' + i);
    if (el) el.classList.remove('active');
  }
  const target = document.getElementById('line' + lineNum);
  if (target) target.classList.add('active');
}

function rotateRight(y) {
  const x = y.left;
  const T2 = x.right;
  highlightLine(2);
  log(`【LL型调整】对节点 <b>${y.val}</b> 执行右单旋 (以 <b>${x.val}</b> 为新根)`);
  setTimeout(() => highlightLine(3), 200);
  setTimeout(() => highlightLine(4), 400);
  x.right = y;
  y.left = T2;
  setTimeout(() => highlightLine(5), 600);
  updateHeightAndBF(y);
  updateHeightAndBF(x);
  setTimeout(() => highlightLine(7), 800);
  setTimeout(() => highlightLine(0), 1600);
  return x;
}"""

text = text.replace(old_rotate_right_fn, new_rotate_right_fn)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("avlTree.ts updated with workbench code stepping and modern styling!")
