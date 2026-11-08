import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const pageReplacementCourseware: InteractiveCoursewareItem = {
  id: 'cw-page-replacement',
  title: '🔄 虚拟内存页面置换算法实验室 (FIFO / LRU / OPT 与 Belady 异常)',
  domain: 'cs_408',
  subject: '操作系统',
  difficulty: '真题必考',
  tags: ['408', '操作系统', '虚拟内存', 'LRU', 'FIFO', 'OPT', 'Belady异常', '缺页中断'],
  summary: '同台动态演练 FIFO、LRU、OPT 三大页面置换算法在任意物理块数与页面访问串下的分配轨迹矩阵，高亮命中与淘汰路径，一键复现经典的 Belady 异常。',
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
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
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
    grid-template-columns: 300px 1fr;
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
    background: radial-gradient(circle at 50% 40%, #151e32 0%, #0b0f1b 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
  }
  .label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .seg-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  button {
    background: #1e293b;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  button:hover { background: #334155; border-color: var(--accent); }
  button.active { background: rgba(56,189,248,0.2); border-color: #38bdf8; color: #38bdf8; }
  button.primary { background: #0284c7; border-color: #38bdf8; color: #fff; }
  button.primary:hover { background: #0369a1; }
  input[type="text"] {
    width: 100%;
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #38bdf8;
    padding: 8px 10px;
    font-family: monospace;
    font-size: 13px;
    font-weight: 700;
    outline: none;
  }
  .frames-stage {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    background: rgba(8, 12, 20, 0.7);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 12px 14px;
  }
  .frame-card {
    width: 68px;
    height: 68px;
    border-radius: 10px;
    border: 2px solid #334155;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.2s ease;
  }
  .frame-card .f-idx { font-size: 10px; color: #64748b; position: absolute; top: 4px; left: 6px; }
  .frame-card .f-val { font-size: 22px; font-weight: 800; color: #e2e8f0; margin-top: 6px; }
  .frame-card.hit { border-color: var(--green); background: rgba(16,185,129,0.16); box-shadow: 0 0 14px rgba(16,185,129,0.25); }
  .frame-card.hit .f-val { color: #34d399; }
  .frame-card.miss { border-color: var(--red); background: rgba(239,68,68,0.16); box-shadow: 0 0 14px rgba(239,68,68,0.25); }
  .frame-card.miss .f-val { color: #fca5a5; }
  .matrix-wrap { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 10px; background: #080c14; }
  table.matrix { width: 100%; border-collapse: collapse; text-align: center; font-family: monospace; font-size: 12px; }
  table.matrix th, table.matrix td { border: 1px solid #1a2436; padding: 6px 8px; min-width: 34px; }
  table.matrix th { background: #101726; color: #94a3b8; font-weight: 700; }
  table.matrix th.cur { background: rgba(56,189,248,0.25); color: #fff; }
  td.cell-hit { color: #34d399; font-weight: 800; background: rgba(16,185,129,0.1); }
  td.cell-miss { color: #f87171; font-weight: 800; background: rgba(239,68,68,0.1); }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat-box { background: #0b111e; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 10px; text-align: center; }
  .stat-box .v { font-size: 18px; font-weight: 800; color: var(--accent); margin-top: 2px; }
  .tips-card {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #fcd34d;
    line-height: 1.6;
  }
</style>
</head>
<body>
<header>
  <h1><span>🔄</span> 虚拟内存页面置换算法动态实验室</h1>
  <div style="display:flex; gap:8px; align-items:center;">
    <span class="badge">408 操作系统必考</span>
    <span style="font-size:11px; color:var(--text-secondary);">FIFO · LRU · OPT 与 Belady 异常全景对比</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div>
      <div class="label">1. 选择置换算法</div>
      <div class="seg-row">
        <button id="alg-LRU" class="active" onclick="setAlgo('LRU')">LRU (最久未用)</button>
        <button id="alg-FIFO" onclick="setAlgo('FIFO')">FIFO (队列)</button>
        <button id="alg-OPT" onclick="setAlgo('OPT')">OPT (理想最优)</button>
      </div>
    </div>

    <div>
      <div class="label">2. 分配物理块数 (页框 M)</div>
      <div class="seg-row">
        <button id="fr-3" class="active" onclick="setFrameCount(3)">3 个物理块</button>
        <button id="fr-4" onclick="setFrameCount(4)">4 个物理块</button>
        <button id="fr-5" onclick="setFrameCount(5)">5 个物理块</button>
      </div>
    </div>

    <div>
      <div class="label">3. 页面访问序列 (逗号分隔)</div>
      <input type="text" id="seqInput" value="7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2" onchange="rebuildSim()">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
        <button onclick="loadClassic()">📘 教材经典序列</button>
        <button onclick="loadBelady()" style="color:#fbbf24; border-color:rgba(245,158,11,0.4);">⚡ Belady 异常序列</button>
      </div>
    </div>

    <div>
      <div class="label">4. 演练控制</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <button class="primary" onclick="stepNext()">▶ 单步推进</button>
        <button onclick="runAll()">⏭ 一键跑完</button>
      </div>
      <button onclick="resetSim()" style="width:100%; margin-top:6px;">↺ 重置回起点</button>
    </div>

    <div class="tips-card">
      <b>💡 408 考场秒杀铁律：</b><br>
      • <b>OPT</b> 向后看（淘汰未来最迟访问页），缺页最少但无法实际实现，用作性能上界基准。<br>
      • <b>LRU</b> 向前看（淘汰过去最久未访问页），属于栈类算法，<b>绝不会出现 Belady 异常</b>！<br>
      • 点击上方【⚡ Belady 异常序列】切换 3块/4块：见证 <b>FIFO</b> 在 3 块缺页 9 次，增至 4 块反而缺页 10 次！
    </div>
  </div>

  <div class="sim-panel">
    <div class="stat-grid">
      <div class="stat-box">
        <div style="font-size:11px; color:var(--text-secondary);">当前访问进度</div>
        <div class="v" id="stStep">0 / 13</div>
      </div>
      <div class="stat-box">
        <div style="font-size:11px; color:var(--text-secondary);">缺页中断次数</div>
        <div class="v" id="stMiss" style="color:#f87171;">0</div>
      </div>
      <div class="stat-box">
        <div style="font-size:11px; color:var(--text-secondary);">缺页率 / 命中率</div>
        <div class="v" id="stRate" style="color:#34d399;">0% / 0%</div>
      </div>
    </div>

    <div>
      <div class="label">当前物理内存页框状态 & 置换诊断</div>
      <div class="frames-stage">
        <div id="framesRow" style="display:flex; gap:10px; flex-wrap:wrap;"></div>
        <div id="stepExplain" style="font-size:12px; color:#cbd5e1; line-height:1.6; flex:1; min-width:180px;">
          点击【▶ 单步推进】或【⏭ 一键跑完】观察物理页框装入与淘汰全过程。
        </div>
      </div>
    </div>

    <div>
      <div class="label">时空分配轨迹表（考场大题标准作答表格）</div>
      <div class="matrix-wrap">
        <table class="matrix" id="traceTable"></table>
      </div>
    </div>

    <div id="compareBar" style="background:#080c14; border:1px solid var(--border-color); border-radius:10px; padding:10px 12px; font-size:12px; color:#94a3b8; display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
    </div>
  </div>
</div>

<script>
let algo = 'LRU';
let frameCount = 3;
let seq = [];
let history = [];
let curStep = 0;

function parseSeq() {
  const raw = document.getElementById('seqInput').value;
  const arr = raw.split(/[,，\\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  return arr.length > 0 ? arr : [7, 0, 1, 2, 0, 3, 0, 4];
}

function simulate(sequence, m, mode) {
  const steps = [];
  const frames = new Array(m).fill(null);
  const fifoQueue = [];
  const lastUsed = new Map();
  let misses = 0;

  for (let i = 0; i < sequence.length; i++) {
    const p = sequence[i];
    const hitIdx = frames.indexOf(p);
    let evicted = null;
    let targetIdx = hitIdx;
    const hit = hitIdx !== -1;

    if (!hit) {
      misses++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        targetIdx = emptyIdx;
        frames[targetIdx] = p;
        fifoQueue.push(p);
      } else {
        let victimPage = null;
        if (mode === 'FIFO') {
          victimPage = fifoQueue.shift();
          fifoQueue.push(p);
        } else if (mode === 'LRU') {
          let oldestTime = Infinity;
          frames.forEach(fp => {
            const t = lastUsed.has(fp) ? lastUsed.get(fp) : -1;
            if (t < oldestTime) { oldestTime = t; victimPage = fp; }
          });
        } else {
          let farthest = -1;
          frames.forEach(fp => {
            let nextPos = sequence.slice(i + 1).indexOf(fp);
            if (nextPos === -1) nextPos = Infinity;
            if (nextPos > farthest) { farthest = nextPos; victimPage = fp; }
          });
        }
        evicted = victimPage;
        targetIdx = frames.indexOf(victimPage);
        frames[targetIdx] = p;
      }
    }
    lastUsed.set(p, i);
    steps.push({
      step: i + 1,
      page: p,
      hit,
      targetIdx,
      evicted,
      frames: [...frames],
      misses
    });
  }
  return steps;
}

function rebuildSim(keepProgress) {
  seq = parseSeq();
  history = simulate(seq, frameCount, algo);
  if (!keepProgress) curStep = history.length;
  else curStep = Math.min(curStep, history.length);
  render();
}

function setAlgo(a) {
  algo = a;
  ['LRU', 'FIFO', 'OPT'].forEach(k => {
    document.getElementById('alg-' + k).classList.toggle('active', k === a);
  });
  rebuildSim(true);
}

function setFrameCount(m) {
  frameCount = m;
  [3, 4, 5].forEach(k => {
    document.getElementById('fr-' + k).classList.toggle('active', k === m);
  });
  rebuildSim(true);
}

function loadClassic() {
  document.getElementById('seqInput').value = '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2';
  setAlgo('LRU');
  setFrameCount(3);
  curStep = 6;
  rebuildSim(true);
}

function loadBelady() {
  document.getElementById('seqInput').value = '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5';
  algo = 'FIFO';
  ['LRU', 'FIFO', 'OPT'].forEach(k => document.getElementById('alg-' + k).classList.toggle('active', k === 'FIFO'));
  seq = parseSeq();
  history = simulate(seq, frameCount, algo);
  curStep = history.length;
  render();
}

function resetSim() {
  curStep = 0;
  render();
}

function stepNext() {
  if (curStep < history.length) curStep++;
  render();
}

function runAll() {
  curStep = history.length;
  render();
}

function render() {
  const cur = curStep > 0 ? history[curStep - 1] : null;
  const misses = cur ? cur.misses : 0;
  const missRate = curStep > 0 ? Math.round((misses / curStep) * 100) : 0;
  const hitRate = curStep > 0 ? (100 - missRate) : 0;

  document.getElementById('stStep').innerText = curStep + ' / ' + seq.length;
  document.getElementById('stMiss').innerText = misses + ' 次';
  document.getElementById('stRate').innerText = missRate + '% / ' + hitRate + '%';

  // 渲染当前页框卡片
  const fRow = document.getElementById('framesRow');
  fRow.innerHTML = '';
  const curFrames = cur ? cur.frames : new Array(frameCount).fill(null);
  for (let r = 0; r < frameCount; r++) {
    const div = document.createElement('div');
    let cls = 'frame-card';
    if (cur && cur.targetIdx === r) cls += cur.hit ? ' hit' : ' miss';
    div.className = cls;
    div.innerHTML = '<span class="f-idx">块#' + r + '</span><span class="f-val">' + (curFrames[r] !== null ? curFrames[r] : '-') + '</span>';
    fRow.appendChild(div);
  }

  const exp = document.getElementById('stepExplain');
  if (!cur) {
    exp.innerHTML = '已就绪：共 <b>' + seq.length + '</b> 次页面访问请求，点击【▶ 单步推进】开始演示。';
  } else if (cur.hit) {
    exp.innerHTML = '第 <b>' + cur.step + '</b> 步访问页 <b>[' + cur.page + ']</b>：<span style="color:#34d399;font-weight:700;">✅ 命中物理块 #' + cur.targetIdx + '</span>，无需访盘置换！';
  } else if (cur.evicted === null) {
    exp.innerHTML = '第 <b>' + cur.step + '</b> 步访问页 <b>[' + cur.page + ']</b>：<span style="color:#f87171;font-weight:700;">❌ 缺页中断</span>，存在空闲块，直接装入物理块 #' + cur.targetIdx + '。';
  } else {
    exp.innerHTML = '第 <b>' + cur.step + '</b> 步访问页 <b>[' + cur.page + ']</b>：<span style="color:#f87171;font-weight:700;">❌ 缺页置换</span>（' + algo + ' 策略淘汰页 <b style="color:#fbbf24;">[' + cur.evicted + ']</b>，装入块 #' + cur.targetIdx + '）。';
  }

  // 渲染轨迹矩阵表
  const tbl = document.getElementById('traceTable');
  let html = '<thead><tr><th>访问页</th>';
  for (let i = 0; i < seq.length; i++) {
    html += '<th class="' + (i === curStep - 1 ? 'cur' : '') + '">' + seq[i] + '</th>';
  }
  html += '</tr></thead><tbody>';
  for (let r = 0; r < frameCount; r++) {
    html += '<tr><td style="color:#64748b;font-weight:700;">物理块' + r + '</td>';
    for (let i = 0; i < seq.length; i++) {
      if (i >= curStep) {
        html += '<td style="color:#334155;">·</td>';
      } else {
        const st = history[i];
        const val = st.frames[r] !== null ? st.frames[r] : '';
        const activeCell = st.targetIdx === r ? (st.hit ? 'cell-hit' : 'cell-miss') : '';
        html += '<td class="' + activeCell + '">' + val + '</td>';
      }
    }
    html += '</tr>';
  }
  html += '<tr><td style="color:#94a3b8;font-weight:700;">缺页?</td>';
  for (let i = 0; i < seq.length; i++) {
    if (i >= curStep) html += '<td></td>';
    else {
      const st = history[i];
      html += st.hit
        ? '<td style="color:#10b981;font-weight:700;">✓</td>'
        : '<td style="color:#ef4444;font-weight:700;" title="' + (st.evicted !== null ? '淘汰 ' + st.evicted : '冷启动装入') + '">F' + (st.evicted !== null ? '(-' + st.evicted + ')' : '') + '</td>';
    }
  }
  html += '</tr></tbody>';
  tbl.innerHTML = html;

  // 同序列三算法完整缺页横评对比
  const fMiss = simulate(seq, frameCount, 'FIFO').slice(-1)[0]?.misses || 0;
  const lMiss = simulate(seq, frameCount, 'LRU').slice(-1)[0]?.misses || 0;
  const oMiss = simulate(seq, frameCount, 'OPT').slice(-1)[0]?.misses || 0;
  const f3 = simulate(seq, 3, 'FIFO').slice(-1)[0]?.misses || 0;
  const f4 = simulate(seq, 4, 'FIFO').slice(-1)[0]?.misses || 0;
  const beladyTag = f4 > f3 ? '<span style="color:#fbbf24;font-weight:700;">⚡ 检测到 Belady 异常：FIFO 在 3块缺页 ' + f3 + ' 次 < 4块缺页 ' + f4 + ' 次！</span>' : '<span>当前序列在 ' + frameCount + ' 个物理块下三算法完整总缺页对比：</span>';
  document.getElementById('compareBar').innerHTML =
    beladyTag +
    '<div style="display:flex;gap:14px;">' +
    '<span>FIFO: <b style="color:#f87171;">' + fMiss + '次</b></span>' +
    '<span>LRU: <b style="color:#38bdf8;">' + lMiss + '次</b></span>' +
    '<span>OPT(最优): <b style="color:#34d399;">' + oMiss + '次</b></span>' +
    '</div>';
}

loadClassic();
</script>
</body>
</html>`,
  learningPoints: [
    'OPT（最佳置换）淘汰未来最长时间不再访问的页面，缺页率最低，作为理论性能基准',
    'FIFO（先进先出）队列实现最简单，但存在著名的 Belady 异常（分配物理块增多，缺页次数反而上升）',
    'LRU（最近最久未使用）基于局部性原理，属于栈类算法，绝不会发生 Belady 异常，工程近似实现为 CLOCK 时钟算法',
  ],
}
