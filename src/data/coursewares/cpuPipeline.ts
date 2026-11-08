import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const cpuPipelineCourseware: InteractiveCoursewareItem = {
  id: 'cw-cpu-pipeline',
  title: '💻 CPU 五级指令流水线冲突与冒险动态仿真',
  domain: 'cs_408',
  subject: '计算机组成原理',
  difficulty: '高频重难点',
  tags: ['408', '计组', '流水线', 'RAW冒险', 'Forwarding', '仿真'],
  summary: '单步仿真 MIPS 五级指令流水线（IF-ID-EX-MEM-WB），动态观察 RAW 数据冲突、Stall 气泡插入与数据旁路 (Forwarding) 消除延迟效果。',
  learningPoints: [
    'RAW (写后读) 是真实数据依赖，必须保证写回或转发后才能读到正确的新值',
    '无 Forwarding 旁路时硬件必须在 ID 级插入 2 拍 Stall 气泡暂停后续指令',
    '开启 Forwarding (数据旁路) 后，ALU 运算结果可直接从 EX 或 MEM 级旁路输入下一指令的 ALU，彻底消除 RAW 停顿（Load-Use 仍需 1 拍停顿）'
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
    --stage-if: #3b82f6;
    --stage-id: #8b5cf6;
    --stage-ex: #ec4899;
    --stage-mem: #f59e0b;
    --stage-wb: #10b981;
    --stall: #ef4444;
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
    grid-template-columns: 290px 1fr;
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
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #080c14;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    font-size: 12px;
  }
  .pipeline-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    font-family: monospace;
    text-align: center;
    margin-top: 12px;
  }
  .pipeline-table th {
    background: #0d1424;
    color: var(--text-secondary);
    padding: 8px 6px;
    border: 1px solid var(--border-color);
    font-size: 11px;
  }
  .pipeline-table td {
    padding: 6px 4px;
    border: 1px solid var(--border-color);
    background: #080c16;
  }
  .stage-badge {
    padding: 3px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 11px;
    display: inline-block;
  }
  .stage-IF { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid #3b82f6; }
  .stage-ID { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid #8b5cf6; }
  .stage-EX { background: rgba(236, 72, 153, 0.2); color: #f472b6; border: 1px solid #ec4899; }
  .stage-MEM { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
  .stage-WB { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
  .stage-STALL { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
  .tips-card {
    background: rgba(56, 189, 248, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #38bdf8;
    line-height: 1.6;
  }
</style>
</head>
<body>

<header>
  <h1><span>💻</span> CPU 五级指令流水线 RAW 冲突与转发仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 计组重难点</span>
    <span style="font-size: 11px; color: var(--text-secondary);">经典 MIPS 五级架构：IF-ID-EX-MEM-WB</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">数据旁路 (Forwarding) 开关</div>
      <div class="switch-row">
        <span>启用 Forwarding 转发通路</span>
        <input type="checkbox" id="chkForward" checked onchange="resetSim()">
      </div>
    </div>

    <div class="controls-group">
      <div class="label">时钟周期推进</div>
      <button class="primary" onclick="stepClock()">⏱️ 推进下一个时钟周期 (Clock +1)</button>
      <button onclick="autoPlay()">⏩ 自动推演全部周期</button>
      <button onclick="resetSim()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🔄 重置回时钟周期 0</button>
    </div>

    <div class="controls-group">
      <div class="label">当前周期流水线状态分析</div>
      <div id="diagBox" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 110px;">
        准备就绪。点击【推进下一个时钟周期】观察指令流水线推进。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 计组考题精要：</b><br>
      • <b>RAW (写后读) 数据冒险</b>：I1 写寄存器 R1，I2 紧接着要读 R1。<br>
      • <b>无转发时</b>：I1 必须到 WB 阶段结束才写回 R1，I2 在 ID 阶段必须暂停（插入 2 个 Stall 气泡）！<br>
      • <b>有转发时</b>：I1 的 ALU 结果在 EX 阶段末直接通过内部数据旁路送入 I2 的 ALU 输入端，<b>0 气泡直接连续执行！</b>
    </div>
  </div>

  <div class="sim-panel">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="label">时钟周期时空甘特图 (Space-Time Chart)</div>
      <div style="font-size: 12px; color: var(--text-secondary);">
        当前时钟周期: <b id="clockVal" style="color: var(--accent); font-size: 14px;">0</b>
      </div>
    </div>

    <table class="pipeline-table">
      <thead>
        <tr>
          <th style="width: 140px; text-align: left;">指令流序列</th>
          <th>T1</th><th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>T8</th><th>T9</th>
        </tr>
      </thead>
      <tbody id="pipeBody"></tbody>
    </table>
  </div>
</div>

<script>
let currentClock = 0;
let timer = null;

// 指令集
const INSTRUCTIONS = [
  { name: 'I1: ADD R1, R2, R3', write: 'R1' },
  { name: 'I2: SUB R4, R1, R5', read: 'R1' },
  { name: 'I3: AND R6, R1, R7', read: 'R1' },
  { name: 'I4: OR  R8, R9, R10' }
];

function getSchedule(forwarding) {
  if (forwarding) {
    // 有 forwarding: 0 stall
    return [
      ['IF', 'ID', 'EX', 'MEM', 'WB', '', '', '', ''],
      ['', 'IF', 'ID', 'EX', 'MEM', 'WB', '', '', ''],
      ['', '', 'IF', 'ID', 'EX', 'MEM', 'WB', '', ''],
      ['', '', '', 'IF', 'ID', 'EX', 'MEM', 'WB', '']
    ];
  } else {
    // 无 forwarding: 插入 2 个 stall
    return [
      ['IF', 'ID', 'EX', 'MEM', 'WB', '', '', '', ''],
      ['', 'IF', 'ID', 'STALL', 'STALL', 'EX', 'MEM', 'WB', ''],
      ['', '', 'IF', 'STALL', 'STALL', 'ID', 'EX', 'MEM', 'WB'],
      ['', '', '', '', '', 'IF', 'ID', 'EX', 'MEM']
    ];
  }
}

function render() {
  document.getElementById('clockVal').innerText = currentClock;
  const forward = document.getElementById('chkForward').checked;
  const sched = getSchedule(forward);

  const tbody = document.getElementById('pipeBody');
  tbody.innerHTML = '';

  sched.forEach((row, i) => {
    const tr = document.createElement('tr');
    let html = \`<td style="text-align: left; font-weight: bold; color: #fff;">\${INSTRUCTIONS[i].name}</td>\`;
    for (let c = 1; c <= 9; c++) {
      const stage = row[c - 1];
      const isVisible = c <= currentClock && stage !== '';
      const isCurrent = c === currentClock;

      let cellContent = '';
      if (isVisible) {
        cellContent = \`<span class="stage-badge stage-\${stage}">\${stage}</span>\`;
      }
      html += \`<td style="\${isCurrent ? 'background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.4);' : ''}">\${cellContent}</td>\`;
    }
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

function stepClock() {
  if (currentClock >= 9) return;
  currentClock++;
  const forward = document.getElementById('chkForward').checked;
  const diag = document.getElementById('diagBox');

  if (currentClock === 3) {
    if (forward) {
      diag.innerHTML = '<b>周期 T3:</b> I1 在 EX 计算出 R1 结果，同时 I2 处于 ID。检测到 RAW 冲突，但<b>Forwarding 转发器使能</b>，I1 结果在下一个时钟直接旁路送给 I2 的 ALU，<b>无需停顿！</b>';
    } else {
      diag.innerHTML = '<b>周期 T3:</b> I2 在 ID 需要读 R1，但 I1 刚进 EX，R1 尚未写回！<b>无 Forwarding，硬件逻辑插入 STALL 气泡！</b>';
    }
  } else if (currentClock === 5) {
    if (forward) {
      diag.innerHTML = '<b>周期 T5:</b> I1 已经写回 (WB)，I2 已在 MEM，流水线全速饱和推进！';
    } else {
      diag.innerHTML = '<b>周期 T5:</b> I1 在此周期结束完成 WB 写回寄存器堆。下一周期 T6，I2 终于可以从 ID 推进到 EX 执行！损失了 2 个时钟周期！';
    }
  } else {
    diag.innerHTML = '时钟周期 T' + currentClock + ' 正常推进中...';
  }
  render();
}

function resetSim() {
  clearInterval(timer);
  currentClock = 0;
  document.getElementById('diagBox').innerHTML = '已重置流水线，准备就绪。';
  render();
}

function autoPlay() {
  resetSim();
  timer = setInterval(() => {
    if (currentClock < 9) {
      stepClock();
    } else {
      clearInterval(timer);
    }
  }, 900);
}

resetSim();
</script>
</body>
</html>`
}
