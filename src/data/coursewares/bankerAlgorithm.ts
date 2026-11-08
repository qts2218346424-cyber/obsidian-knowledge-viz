import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const bankerAlgorithmCourseware: InteractiveCoursewareItem = {
  id: 'cw-banker-algorithm',
  title: '🏦 死锁避免：银行家算法 (Banker) 安全性检查仿真器',
  domain: 'cs_408',
  subject: '操作系统',
  difficulty: '每年必考大题',
  tags: ['408', '操作系统', '死锁', '银行家算法', '安全性检查', 'Need矩阵', 'Allocation', '安全序列'],
  summary: '经典 5 进程 (P0-P4) 与 3 类资源 (A,B,C) 的资源分配与死锁避免全流程仿真。动态展示 Max、Allocation、Need 与 Available 矩阵计算，支持单步执行安全性检查算法（Safety Check），推导安全进程序列。',
  learningPoints: [
    '核心矩阵恒等式：Need[i][j] = Max[i][j] - Allocation[i][j]',
    '申请资源三关核验：① Request <= Need（需求合法性）；② Request <= Available（系统现存能力）；③ 试探性分配后系统必须处于安全状态',
    '安全状态定义：存在至少一个安全序列 <P_1, P_2, ..., P_n>，使得每个进程在获得所需剩余资源后都能顺利执行完毕并释放已占资源',
    '不安全状态并不等于死锁，但死锁一定源于不安全状态'
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
    --accent-glow: rgba(56, 189, 248, 0.2);
    --success: #10b981;
    --danger: #ef4444;
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
  }
  .controls-group { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
  select, input[type="number"] {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #fff;
    padding: 7px 10px;
    font-size: 13px;
    outline: none;
  }
  select:focus, input[type="number"]:focus { border-color: var(--accent); }
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
  button.primary { background: #0284c7; border-color: #0ea5e9; color: #fff; }
  button.primary:hover { background: #0369a1; }
  .req-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
  .matrix-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    font-family: monospace;
    text-align: center;
    margin-top: 8px;
  }
  .matrix-table th {
    background: #0d1424;
    color: var(--text-secondary);
    padding: 8px 6px;
    border: 1px solid var(--border-color);
    font-size: 11px;
  }
  .matrix-table td {
    padding: 7px 6px;
    border: 1px solid var(--border-color);
    background: #080c16;
  }
  .matrix-table tr.finished {
    background: rgba(16, 185, 129, 0.15) !important;
  }
  .avail-bar {
    display: flex;
    gap: 12px;
    background: #080c14;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    align-items: center;
  }
  .avail-chip {
    background: #1e293b;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-family: monospace;
    color: var(--accent);
  }
  .seq-badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: bold;
    font-family: monospace;
    display: inline-block;
    margin-top: 6px;
  }
  .tips-card {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #fbbf24;
    line-height: 1.6;
  }
</style>
</head>
<body>

<header>
  <h1><span>🏦</span> 操作系统银行家算法 (Banker's Algorithm) 仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 必考大题</span>
    <span style="font-size: 11px; color: var(--text-secondary);">经典 5 进程 (P0-P4) 与 3 类资源 (A,B,C)</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">模拟进程申请资源</div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <span style="font-size: 12px; color: var(--text-secondary);">申请进程:</span>
        <select id="selProc" style="flex: 1;">
          <option value="1" selected>P1</option>
          <option value="4">P4</option>
          <option value="0">P0</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
        </select>
      </div>

      <div class="label" style="margin-top: 4px;">Request 申请向量 (A, B, C)</div>
      <div class="req-inputs">
        <input type="number" id="reqA" value="1" min="0" max="10">
        <input type="number" id="reqB" value="0" min="0" max="10">
        <input type="number" id="reqC" value="2" min="0" max="10">
      </div>
      <button class="primary" onclick="requestResource()">🚀 发起申请并安全检查</button>
    </div>

    <div class="controls-group">
      <div class="label">典型考题案例一键测试</div>
      <button onclick="loadClassicPass()">📌 经典考题真题：P1 申请 [1, 0, 2] (安全通过)</button>
      <button onclick="loadClassicFail()">💥 经典死锁拦截：P4 申请 [3, 3, 0] (拒绝分配)</button>
      <button onclick="resetData()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🔄 恢复经典 T0 时刻状态</button>
    </div>

    <div class="controls-group">
      <div class="label">算法推导过程与诊断结果</div>
      <div id="resultBox" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 120px;">
        当前处于 T0 初始时刻。点击【发起申请】或选择考题案例开始推导。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 考场大题答题得分模板：</b><br>
      ① <b>第一关</b>：检查 Request_i <= Need_i，若否报错“超量索取”；<br>
      ② <b>第二关</b>：检查 Request_i <= Available，若否进程需等待；<br>
      ③ <b>第三关</b>：系统试探分配，置 Work = Available，逐个寻找满足 Need_i <= Work 的进程加入安全序列，释放资源 Work += Allocation_i。<br>
      ④ <b>结论</b>：找到安全序列则正式分配，否则回滚拒绝！
    </div>
  </div>

  <div class="sim-panel">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="label">系统当前可用资源向量 (Available)</div>
      <div class="avail-bar">
        <span>可用:</span>
        <div class="avail-chip">A: <b id="avA">3</b></div>
        <div class="avail-chip">B: <b id="avB">3</b></div>
        <div class="avail-chip">C: <b id="avC">2</b></div>
      </div>
    </div>

    <div style="margin-top: 14px;">
      <div class="label">进程资源矩阵全景表 (Max / Allocation / Need)</div>
      <table class="matrix-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 60px;">进程</th>
            <th colspan="3" style="color: #60a5fa;">最大需求 (Max)</th>
            <th colspan="3" style="color: #34d399;">已分配 (Allocation)</th>
            <th colspan="3" style="color: #f472b6;">还需 (Need = Max-Alloc)</th>
          </tr>
          <tr>
            <th>A</th><th>B</th><th>C</th>
            <th>A</th><th>B</th><th>C</th>
            <th>A</th><th>B</th><th>C</th>
          </tr>
        </thead>
        <tbody id="matrixTbody"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
// 经典 408 T0 时刻题设：
// 进程数 5，资源 A=10, B=5, C=7
let maxM = [
  [7, 5, 3],
  [3, 2, 2],
  [9, 0, 2],
  [2, 2, 2],
  [4, 3, 3]
];

let allocM = [
  [0, 1, 0],
  [2, 0, 0],
  [3, 0, 2],
  [2, 1, 1],
  [0, 0, 2]
];

let avail = [3, 3, 2];

function getNeed() {
  const need = [];
  for (let i = 0; i < 5; i++) {
    need.push([
      maxM[i][0] - allocM[i][0],
      maxM[i][1] - allocM[i][1],
      maxM[i][2] - allocM[i][2]
    ]);
  }
  return need;
}

function render() {
  const need = getNeed();
  document.getElementById('avA').innerText = avail[0];
  document.getElementById('avB').innerText = avail[1];
  document.getElementById('avC').innerText = avail[2];

  const tbody = document.getElementById('matrixTbody');
  tbody.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement('tr');
    tr.id = 'rowP' + i;
    tr.innerHTML = \`
      <td><b>P\${i}</b></td>
      <td>\${maxM[i][0]}</td><td>\${maxM[i][1]}</td><td>\${maxM[i][2]}</td>
      <td style="color:#34d399">\${allocM[i][0]}</td><td style="color:#34d399">\${allocM[i][1]}</td><td style="color:#34d399">\${allocM[i][2]}</td>
      <td style="color:#f472b6; font-weight:bold;">\${need[i][0]}</td>
      <td style="color:#f472b6; font-weight:bold;">\${need[i][1]}</td>
      <td style="color:#f472b6; font-weight:bold;">\${need[i][2]}</td>
    \`;
    tbody.appendChild(tr);
  }
}

function checkSafety(curAvail, curAlloc, curNeed) {
  const work = [...curAvail];
  const finish = [false, false, false, false, false];
  const safeSeq = [];
  const logSteps = [];

  let found = true;
  while (found) {
    found = false;
    for (let i = 0; i < 5; i++) {
      if (!finish[i]) {
        // 检查 Need[i] <= Work
        if (curNeed[i][0] <= work[0] && curNeed[i][1] <= work[1] && curNeed[i][2] <= work[2]) {
          work[0] += curAlloc[i][0];
          work[1] += curAlloc[i][1];
          work[2] += curAlloc[i][2];
          finish[i] = true;
          safeSeq.push('P' + i);
          logSteps.push('找到进程 <b>P' + i + '</b> 满足 Need <= Work，执行后释放，新可用 Work=[' + work.join(',') + ']');
          found = true;
          break;
        }
      }
    }
  }

  const allFinish = finish.every(f => f);
  return { safe: allFinish, safeSeq, logSteps };
}

function requestResource() {
  const p = parseInt(document.getElementById('selProc').value, 10);
  const req = [
    parseInt(document.getElementById('reqA').value, 10) || 0,
    parseInt(document.getElementById('reqB').value, 10) || 0,
    parseInt(document.getElementById('reqC').value, 10) || 0
  ];

  const need = getNeed();
  const resBox = document.getElementById('resultBox');

  // 1. 检查 Request <= Need
  if (req[0] > need[p][0] || req[1] > need[p][1] || req[2] > need[p][2]) {
    resBox.innerHTML = \`<div style="color:#ef4444; font-weight:bold;">❌ 拒绝申请：出错！</div><div>P\${p} 申请的资源量超过了其声明的最大还需量 Need[\${need[p].join(',')}]。</div>\`;
    return;
  }

  // 2. 检查 Request <= Available
  if (req[0] > avail[0] || req[1] > avail[1] || req[2] > avail[2]) {
    resBox.innerHTML = \`<div style="color:#f59e0b; font-weight:bold;">⏳ 进程必须等待！</div><div>系统当前可用资源 Available[\${avail.join(',')}] 不足，P\${p} 进入阻塞等待。</div>\`;
    return;
  }

  // 3. 试探性分配
  const testAvail = [avail[0] - req[0], avail[1] - req[1], avail[2] - req[2]];
  const testAlloc = allocM.map(r => [...r]);
  testAlloc[p][0] += req[0];
  testAlloc[p][1] += req[1];
  testAlloc[p][2] += req[2];

  const testNeed = need.map(r => [...r]);
  testNeed[p][0] -= req[0];
  testNeed[p][1] -= req[1];
  testNeed[p][2] -= req[2];

  const safetyResult = checkSafety(testAvail, testAlloc, testNeed);

  if (safetyResult.safe) {
    // 正式分配
    avail = testAvail;
    allocM = testAlloc;
    render();
    resBox.innerHTML = \`
      <div style="color: #10b981; font-weight:bold; font-size: 13px;">✅ 安全性检查通过！准予分配。</div>
      <div style="margin-top: 4px;">推导出的安全序列：</div>
      <div class="seq-badge">&lt; \${safetyResult.safeSeq.join(' → ')} &gt;</div>
      <div style="font-size: 10px; color: var(--text-secondary); margin-top: 6px;">系统状态安全，绝不会发生死锁。已更新资源分配矩阵！</div>
    \`;
  } else {
    resBox.innerHTML = \`
      <div style="color: #ef4444; font-weight:bold; font-size: 13px;">🚫 安全性检查失败！拒绝分配！</div>
      <div style="margin-top: 4px;">若将资源分配给 P\${p}，系统剩余可用资源将无法满足任何剩余进程的运行要求，系统陷入<b>不安全状态</b>，有死锁风险！</div>
      <div style="color: #f59e0b; margin-top: 4px;">系统执行回滚撤销试探分配，P\${p} 继续等待。</div>
    \`;
  }
}

function loadClassicPass() {
  resetData();
  document.getElementById('selProc').value = '1';
  document.getElementById('reqA').value = '1';
  document.getElementById('reqB').value = '0';
  document.getElementById('reqC').value = '2';
  requestResource();
}

function loadClassicFail() {
  resetData();
  document.getElementById('selProc').value = '4';
  document.getElementById('reqA').value = '3';
  document.getElementById('reqB').value = '3';
  document.getElementById('reqC').value = '0';
  requestResource();
}

function resetData() {
  maxM = [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3]
  ];
  allocM = [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2]
  ];
  avail = [3, 3, 2];
  document.getElementById('resultBox').innerHTML = '已恢复经典 T0 初始时刻状态。';
  render();
}

resetData();
</script>
</body>
</html>`
}
