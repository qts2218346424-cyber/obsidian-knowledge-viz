import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const kmpMatchCourseware: InteractiveCoursewareItem = {
  id: 'cw-kmp-match',
  title: '🔍 KMP 算法：模式匹配与 next / nextval 动态推导实验室',
  domain: 'cs_408',
  subject: '数据结构',
  difficulty: '高频核心难点',
  tags: ['408', '数据结构', '串', 'KMP算法', '模式匹配', 'next数组', 'nextval数组', '前缀表'],
  summary: '数据结构经典难点 KMP 算法全景动态仿真。可视化推导最长公共前后缀、next 数组与 nextval 修正数组；支持真题经典用例单步对比匹配过程，直观呈现“主串指针永不回溯，模式串依据前缀自动滑动”的精妙机理。',
  learningPoints: [
    '传统朴素模式匹配时间复杂度 O(n×m)，KMP 消除主串指针回溯，时间复杂度降至 O(n+m)',
    'next[j] 的本质：模式串第 j 个字符失配时，模式串应该回退到的位置，取决于已匹配子串的最大公共前后缀长度',
    '408 考卷标准：next 数组通常下标从 1 开始，next[1]=0, next[2]=1；考题中若有不同基准需注意下标约定',
    'nextval 优化：当模式串失配跳转位置的字符与当前失配字符相同时（T[j] == T[next[j]]），必然会再次失配，因此递归继承 nextval[next[j]]，避免无谓比较'
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  :root {
    --bg-color: #0b0f19;
    --card-bg: #121827;
    --border-color: #1f293d;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent: #38bdf8;
    --match: #10b981;
    --mismatch: #ef4444;
    --highlight: #f59e0b;
    --purple: #8b5cf6;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg-color);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    padding: 16px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 12px;
    flex-shrink: 0;
  }
  h1 { font-size: 16px; font-weight: 700; color: var(--accent); display: flex; align-items: center; gap: 8px; }
  .badge { background: rgba(56,189,248,0.15); color: #38bdf8; font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(56,189,248,0.3); }
  .layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }
  .panel {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }
  .sim-panel {
    background: radial-gradient(circle at 50% 50%, #131b2e 0%, #0a0e1a 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow-y: auto;
    gap: 16px;
  }
  .input-group { display: flex; flex-direction: column; gap: 6px; }
  label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
  input[type="text"] {
    background: #0b0f19;
    border: 1px solid var(--border-color);
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 14px;
    letter-spacing: 2px;
    outline: none;
  }
  input[type="text"]:focus { border-color: var(--accent); }
  button {
    background: #1e293b;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  button:hover { background: #334155; border-color: var(--accent); }
  button.primary { background: #0284c7; border-color: #38bdf8; color: #fff; }
  button.primary:hover { background: #0369a1; }
  .btn-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

  /* 表格样式 */
  .table-box {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    overflow-x: auto;
  }
  .table-title { font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 8px; }
  table { border-collapse: collapse; width: 100%; font-family: monospace; font-size: 13px; text-align: center; }
  th, td { border: 1px solid #1e293b; padding: 6px 8px; }
  th { background: #1e293b; color: var(--text-secondary); font-size: 11px; }
  .curr-col { background: rgba(56,189,248,0.2) !important; font-weight: bold; color: #38bdf8; }

  /* 动画串展示区域 */
  .string-stage {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    overflow-x: auto;
  }
  .char-row {
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    min-height: 44px;
  }
  .row-label {
    width: 60px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    flex-shrink: 0;
  }
  .cells-container {
    display: flex;
    gap: 6px;
    position: relative;
    transition: transform 0.3s ease;
  }
  .char-cell {
    width: 36px;
    height: 40px;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    font-size: 15px;
    font-weight: 700;
    position: relative;
    transition: all 0.2s;
  }
  .char-cell .idx {
    font-size: 9px;
    color: #64748b;
    position: absolute;
    top: 2px;
  }
  .char-cell.matched { background: rgba(16,185,129,0.25); border-color: #10b981; color: #34d399; }
  .char-cell.mismatched { background: rgba(239,68,68,0.25); border-color: #ef4444; color: #f87171; }
  .char-cell.active-compare { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56,189,248,0.5); transform: scale(1.08); z-index: 5; }

  .pointer-box {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    background: #1e293b;
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid var(--accent);
  }
  .info-val { font-weight: 700; color: #38bdf8; font-family: monospace; }
  .tip-card {
    background: rgba(56,189,248,0.05);
    border: 1px dashed rgba(56,189,248,0.3);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  .tip-card b { color: #38bdf8; }
</style>
</head>
<body>

<header>
  <h1>🔍 408 数据结构 · KMP 算法模式匹配与 next/nextval 动态实验室 <span class="badge">全国统考核心考点</span></h1>
  <div style="font-size:12px; color:#94a3b8;">主串永不回溯 · 依据前缀智能滑动</div>
</header>

<div class="layout">
  <!-- 左侧控制面板 -->
  <div class="panel">
    <div class="input-group">
      <label>主串 S (目标串)</label>
      <input type="text" id="mainStr" value="ababaaababaa">
    </div>
    <div class="input-group">
      <label>模式串 T (匹配串)</label>
      <input type="text" id="patStr" value="ababaa">
    </div>

    <div class="btn-row">
      <button class="primary" id="btnStep">▶ 单步匹配</button>
      <button id="btnAuto">⚡ 自动播放</button>
    </div>
    <div class="btn-row">
      <button id="btnReset">↺ 重置匹配</button>
      <button id="btnPreset">📌 408经典用例</button>
    </div>

    <!-- 匹配状态看板 -->
    <div class="pointer-box">
      <div>主串指针 i = <span class="info-val" id="ptrI">1</span></div>
      <div>模式串 j = <span class="info-val" id="ptrJ">1</span></div>
      <div>比较次数: <span class="info-val" id="compCount">0</span></div>
    </div>

    <!-- 模式串 next 数组解析卡片 -->
    <div class="table-box">
      <div class="table-title">📐 模式串下标基准 (从 1 开始)</div>
      <table id="nextTable">
        <!-- 动态生成 -->
      </table>
    </div>

    <div class="tip-card">
      <b>💡 408 考场秒杀口诀：</b><br>
      1. <b>next[1] = 0, next[2] = 1</b>（先无脑写出前两位）；<br>
      2. 序号 <b>j</b> 的 <b>next[j]</b> 取决于前 <b>j-1</b> 位字符的最长相等前后缀长度 <b>L</b>，则 <b>next[j] = L + 1</b>；<br>
      3. <b>nextval 优化</b>：若回退后的字符与当前字符相等（<b>T[j] == T[next[j]]</b>），则发生重复失配，直接继承 <b>nextval[next[j]]</b>！
    </div>
  </div>

  <!-- 右侧动态仿真舞台 -->
  <div class="sim-panel">
    <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; justify-content:space-between;">
      <span>🎬 模式匹配滑动对比视窗</span>
      <span id="matchStatus" style="color:#94a3b8;">就绪，点击“单步匹配”开始</span>
    </div>

    <!-- 匹配动画条 -->
    <div class="string-stage">
      <!-- 主串 -->
      <div class="char-row">
        <div class="row-label">主串 S</div>
        <div class="cells-container" id="mainContainer"></div>
      </div>

      <!-- 模式串 -->
      <div class="char-row">
        <div class="row-label">模式串 T</div>
        <div class="cells-container" id="patContainer"></div>
      </div>
    </div>

    <!-- 执行解析面板 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
      <div style="font-size:12px; font-weight:700; color:#94a3b8;">📝 当前步骤解析：</div>
      <div id="stepDetail" style="font-size:13px; color:#e2e8f0; line-height:1.6; font-family:sans-serif;">
        等待开始。KMP 特性：匹配过程中主串指针 i 绝不往左回退，只有模式串指针 j 根据失配处的 next[j] 发生滑动。
      </div>
    </div>
  </div>
</div>

<script>
  let S = "";
  let T = "";
  let nextArr = [];
  let nextvalArr = [];

  let i = 1; // 1-based
  let j = 1;
  let compCount = 0;
  let timer = null;
  let isFinished = false;

  const presets = [
    { s: "ababaaababaa", t: "ababaa" },
    { s: "abaabcacaba", t: "abaabcac" },
    { s: "aaaaabaaaaa", t: "aaaaa" }
  ];
  let presetIdx = 0;

  function computeKmpTables() {
    S = document.getElementById("mainStr").value.trim();
    T = document.getElementById("patStr").value.trim();
    const m = T.length;
    nextArr = new Array(m + 1).fill(0);
    nextvalArr = new Array(m + 1).fill(0);

    // 标准 408 从 1 开始
    nextArr[1] = 0;
    let k = 0, p = 1;
    while (p < m) {
      if (k === 0 || T[p - 1] === T[k - 1]) {
        ++p;
        ++k;
        nextArr[p] = k;
      } else {
        k = nextArr[k];
      }
    }

    // nextval 优化
    nextvalArr[1] = 0;
    for (let idx = 2; idx <= m; idx++) {
      if (T[idx - 1] === T[nextArr[idx] - 1]) {
        nextvalArr[idx] = nextvalArr[nextArr[idx]];
      } else {
        nextvalArr[idx] = nextArr[idx];
      }
    }

    renderTable();
    initStage();
  }

  function renderTable() {
    const tbl = document.getElementById("nextTable");
    const m = T.length;
    let h1 = "<tr><th>序号 j</th>", h2 = "<tr><th>模式串</th>", h3 = "<tr><th>next[j]</th>", h4 = "<tr><th>nextval</th>";
    for (let c = 1; c <= m; c++) {
      const isCur = (c === j);
      const cls = isCur ? "class='curr-col'" : "";
      h1 += \`<th \${cls}>\${c}</th>\`;
      h2 += \`<td \${cls}>\${T[c-1]}</td>\`;
      h3 += \`<td \${cls}>\${nextArr[c]}</td>\`;
      h4 += \`<td \${cls}>\${nextvalArr[c]}</td>\`;
    }
    tbl.innerHTML = h1 + "</tr>" + h2 + "</tr>" + h3 + "</tr>" + h4 + "</tr>";
  }

  function initStage() {
    const mainBox = document.getElementById("mainContainer");
    const patBox = document.getElementById("patContainer");
    mainBox.innerHTML = "";
    patBox.innerHTML = "";

    for (let idx = 0; idx < S.length; idx++) {
      const cell = document.createElement("div");
      cell.className = "char-cell";
      cell.id = "s-cell-" + (idx + 1);
      cell.innerHTML = \`<span class="idx">\${idx+1}</span>\${S[idx]}\`;
      mainBox.appendChild(cell);
    }

    for (let idx = 0; idx < T.length; idx++) {
      const cell = document.createElement("div");
      cell.className = "char-cell";
      cell.id = "t-cell-" + (idx + 1);
      cell.innerHTML = \`<span class="idx">\${idx+1}</span>\${T[idx]}\`;
      patBox.appendChild(cell);
    }

    resetState();
  }

  function resetState() {
    if (timer) { clearInterval(timer); timer = null; }
    i = 1;
    j = 1;
    compCount = 0;
    isFinished = false;
    updatePointers();
    updateVisuals(null, null, "ready");
    document.getElementById("matchStatus").innerText = "就绪，点击“单步匹配”开始";
    document.getElementById("matchStatus").style.color = "#94a3b8";
    document.getElementById("stepDetail").innerText = "匹配已就绪。主串与模式串对齐初始位置。";
  }

  function updatePointers() {
    document.getElementById("ptrI").innerText = i;
    document.getElementById("ptrJ").innerText = j;
    document.getElementById("compCount").innerText = compCount;
    renderTable();

    // 移动模式串容器偏移量
    const patBox = document.getElementById("patContainer");
    // 每个单元格宽 36px + 间距 6px = 42px
    const shift = (i - j) * 42;
    patBox.style.transform = \`translateX(\${shift}px)\`;
  }

  function updateVisuals(activeI, activeJ, status) {
    // 清除原高亮
    document.querySelectorAll(".char-cell").forEach(c => {
      c.classList.remove("active-compare", "matched", "mismatched");
    });

    if (activeI && activeJ) {
      const sc = document.getElementById("s-cell-" + activeI);
      const tc = document.getElementById("t-cell-" + activeJ);
      if (sc && tc) {
        sc.classList.add("active-compare");
        tc.classList.add("active-compare");
        if (status === "match") {
          sc.classList.add("matched");
          tc.classList.add("matched");
        } else if (status === "mismatch") {
          sc.classList.add("mismatched");
          tc.classList.add("mismatched");
        }
      }
    }
  }

  function stepMatch() {
    if (isFinished) return;
    if (i > S.length) {
      isFinished = true;
      document.getElementById("matchStatus").innerText = "匹配完成：未在主串中完全匹配到模式串";
      document.getElementById("matchStatus").style.color = "#ef4444";
      document.getElementById("stepDetail").innerText = "主串已扫描至末尾，本次搜索无完全匹配。";
      return;
    }

    compCount++;
    const curI = i, curJ = j;

    if (j === 0 || S[i - 1] === T[j - 1]) {
      if (j === 0) {
        // 首字符直接失配后的特殊推进
        i++;
        j = 1;
        updatePointers();
        updateVisuals(null, null, "ready");
        document.getElementById("stepDetail").innerText = \`模式串首字符失配，模式串向右平移 1 位，主串指针推进到 i = \${i}，j 恢复为 1。\`;
      } else {
        // 匹配成功
        updateVisuals(curI, curJ, "match");
        document.getElementById("stepDetail").innerText = \`对比: S[\${curI}]('\${S[curI-1]}') == T[\${curJ}]('\${T[curJ-1]}')，字符匹配成功！指针同步递增 i++, j++。\`;
        i++;
        j++;
        updatePointers();

        if (j > T.length) {
          isFinished = true;
          const matchPos = i - T.length;
          document.getElementById("matchStatus").innerText = \`🎉 模式匹配成功！命中起始位置 S[\${matchPos}]\`;
          document.getElementById("matchStatus").style.color = "#10b981";
          document.getElementById("stepDetail").innerText = \`模式串全部 \${T.length} 个字符已完全匹配！在主串中的起始下标为 \${matchPos}。总比较次数: \${compCount} 次。\`;
          if (timer) clearInterval(timer);
        }
      }
    } else {
      // 失配
      updateVisuals(curI, curJ, "mismatch");
      const nextJ = nextArr[curJ];
      document.getElementById("stepDetail").innerText = \`失配: S[\${curI}]('\${S[curI-1]}') != T[\${curJ}]('\${T[curJ-1]}')！主串指针 i 保持不动 (\${curI})，模式串查表 next[\${curJ}] = \${nextJ}，j 跳转到 \${nextJ}！\`;
      j = nextJ;
      updatePointers();
    }
  }

  document.getElementById("btnStep").addEventListener("click", () => {
    stepMatch();
  });

  document.getElementById("btnAuto").addEventListener("click", () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
      document.getElementById("btnAuto").innerText = "⚡ 自动播放";
    } else {
      document.getElementById("btnAuto").innerText = "⏸ 暂停播放";
      timer = setInterval(() => {
        if (isFinished) {
          clearInterval(timer);
          timer = null;
          document.getElementById("btnAuto").innerText = "⚡ 自动播放";
        } else {
          stepMatch();
        }
      }, 700);
    }
  });

  document.getElementById("btnReset").addEventListener("click", () => {
    resetState();
  });

  document.getElementById("btnPreset").addEventListener("click", () => {
    presetIdx = (presetIdx + 1) % presets.length;
    document.getElementById("mainStr").value = presets[presetIdx].s;
    document.getElementById("patStr").value = presets[presetIdx].t;
    computeKmpTables();
  });

  document.getElementById("mainStr").addEventListener("input", computeKmpTables);
  document.getElementById("patStr").addEventListener("input", computeKmpTables);

  computeKmpTables();
</script>
</body>
</html>`
}
