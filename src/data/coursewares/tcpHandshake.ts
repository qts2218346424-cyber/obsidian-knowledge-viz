import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const tcpHandshakeCourseware: InteractiveCoursewareItem = {
  id: 'cw-tcp-protocol',
  title: '🌐 TCP 三次握手与四次挥手状态机全景时序仿真器',
  domain: 'cs_408',
  subject: '计算机网络',
  difficulty: '每年必考大题',
  tags: ['408', '计网', 'TCP', '三次握手', '四次挥手', 'TIME_WAIT', 'seq/ack', '状态机'],
  summary: '交互式仿真 TCP 连接建立（三次握手）与连接释放（四次挥手）全流程。动态模拟报文飞行、标志位 (SYN/ACK/FIN)、序号 seq 与确认号 ack 的严格数学计算，以及双方 11 种状态迁移变化。',
  learningPoints: [
    '握手 seq 与 ack 准则：SYN 报文不携带数据但消耗 1 个序号；ack = 对方 seq + 1',
    '四次挥手 FIN 报文同样消耗 1 个序号；服务器确认后进入 CLOSE_WAIT，仍可继续单向传输剩余数据',
    'TIME_WAIT 状态必须停留 2MSL：确保最后的 ACK 能到达服务端，并使本连接产生的所有网络残存报文消逝',
    '考场失分陷阱：第三次握手报文可以携带应用层数据，且若不带数据则不消耗序号'
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
    --client-color: #3b82f6;
    --server-color: #10b981;
    --warning: #f59e0b;
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
  .mode-switch {
    display: flex;
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 3px;
    gap: 4px;
  }
  .mode-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    padding: 6px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .mode-btn.active {
    background: var(--client-color);
    color: #fff;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }
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
  .tips-card {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #34d399;
    line-height: 1.6;
  }
  .hosts-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .host-card {
    width: 200px;
    background: #0d1322;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px;
    text-align: center;
  }
  .host-title { font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .state-badge {
    margin-top: 6px;
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    font-family: monospace;
    border: 1px solid;
    transition: all 0.3s;
  }
  .flow-track {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 10px 0;
    position: relative;
  }
  .flow-item {
    display: flex;
    align-items: center;
    position: relative;
    opacity: 0.35;
    transition: all 0.4s ease;
  }
  .flow-item.active { opacity: 1; transform: scale(1.01); }
  .flow-item.done { opacity: 0.85; }
  .arrow-line {
    flex: 1;
    height: 2px;
    background: #334155;
    position: relative;
    margin: 0 10px;
  }
  .arrow-line.active {
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
  }
  .arrow-head {
    position: absolute;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    top: -4px;
  }
  .arrow-right { right: 0; border-left: 8px solid #38bdf8; }
  .arrow-left { left: 0; border-right: 8px solid #38bdf8; }
  .packet-box {
    background: #182238;
    border: 1px solid #38bdf8;
    border-radius: 8px;
    padding: 8px 14px;
    font-family: monospace;
    font-size: 12px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    min-width: 250px;
    text-align: center;
  }
  .flags { color: #f59e0b; font-weight: bold; margin-bottom: 2px; }
  .seq-info { color: #38bdf8; font-size: 11px; }
  .step-desc {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }
</style>
</head>
<body>

<header>
  <h1><span>🌐</span> TCP 传输层协议状态时钟仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 计网必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">全景覆盖 11 种状态与序号确认号计算</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">仿真协议阶段</div>
      <div class="mode-switch">
        <button class="mode-btn active" id="btnHandshake" onclick="switchMode('handshake')">🤝 三次握手 (连接)</button>
        <button class="mode-btn" id="btnWave" onclick="switchMode('wave')">👋 四次挥手 (释放)</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">步进演练控制</div>
      <button class="primary" onclick="stepNext()">▶️ 单步执行下一阶段</button>
      <button onclick="autoPlay()">⏩ 自动完整演练</button>
      <button onclick="resetSim()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🔄 重置回初始状态</button>
    </div>

    <div class="controls-group">
      <div class="label">当前步骤考点剖析</div>
      <div id="stepExplanation" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 12px; color: #cbd5e1; line-height: 1.6; min-height: 100px;">
        准备就绪，点击【单步执行】开始三次握手。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 计网答题必背采分点：</b><br>
      • <b>消耗序号原则</b>：SYN=1 或 FIN=1 的报文段哪怕不带任何数据，也强制消耗 1 个 seq！<br>
      • <b>确认号计算</b>：ack 永远等于收到的 seq + 1（表示期待对方下次发送的序号）。<br>
      • <b>TIME_WAIT 为何要等 2MSL？</b><br>
      ① 保证客户端发送的最后一个 ACK 报文能够到达服务器（防止丢失重传）；<br>
      ② 让本连接产生的所有网络报文都从网络中完全消失，防止“迷失报文”干扰新连接。
    </div>
  </div>

  <div class="panel sim-panel">
    <div class="hosts-header">
      <div class="host-card" style="border-color: rgba(59,130,246,0.4);">
        <div class="host-title" style="color: #60a5fa;">💻 客户端 (Client)</div>
        <div class="state-badge" id="clientState" style="color: #94a3b8; border-color: #475569; background: #0f172a;">CLOSED</div>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span style="font-size: 11px; color: var(--text-secondary);">全双工双向报文交互通道</span>
        <span style="font-size: 18px; margin-top: 2px;">⚡</span>
      </div>

      <div class="host-card" style="border-color: rgba(16,185,129,0.4);">
        <div class="host-title" style="color: #34d399;">🖥️ 服务器 (Server)</div>
        <div class="state-badge" id="serverState" style="color: #34d399; border-color: #059669; background: rgba(16,185,129,0.1);">LISTEN</div>
      </div>
    </div>

    <div class="flow-track" id="flowTrack"></div>
  </div>
</div>

<script>
let currentMode = 'handshake';
let currentStep = 0;
let autoTimer = null;

const HANDSHAKE_STEPS = [
  {
    from: 'client', to: 'server',
    flags: 'SYN = 1, ACK = 0',
    seq: 'seq = x (初始序号, 例: 100)',
    ack: '无 ack',
    clientStateAfter: 'SYN_SENT',
    serverStateAfter: 'LISTEN',
    desc: '<b>第 1 次握手：</b>客户端发起连接请求。<br>发送连接请求报文段：SYN=1，选择初始序号 seq=x。此时客户端由 CLOSED 转入 <span style="color:#60a5fa">SYN_SENT</span> 状态。'
  },
  {
    from: 'server', to: 'client',
    flags: 'SYN = 1, ACK = 1',
    seq: 'seq = y (例: 300)',
    ack: 'ack = x + 1 (例: 101)',
    clientStateAfter: 'SYN_SENT',
    serverStateAfter: 'SYN_RCVD',
    desc: '<b>第 2 次握手：</b>服务器同意建立连接。<br>发送确认报文：SYN=1, ACK=1，确认号 ack=x+1（消耗了客户的一个序号），服务器自己选择初始序号 seq=y。服务器转入 <span style="color:#34d399">SYN_RCVD</span> 状态。'
  },
  {
    from: 'client', to: 'server',
    flags: 'SYN = 0, ACK = 1',
    seq: 'seq = x + 1 (例: 101)',
    ack: 'ack = y + 1 (例: 301)',
    clientStateAfter: 'ESTABLISHED',
    serverStateAfter: 'ESTABLISHED',
    desc: '<b>第 3 次握手：</b>客户端给出最后确认。<br>发送确认报文段：ACK=1，seq=x+1，ack=y+1。此时客户端与服务端先后进入 <span style="color:#10b981; font-weight:bold;">ESTABLISHED (已建立连接)</span> 状态，全双工通信正式开始！注意：此报文段可携带应用层数据，若不带数据则不消耗序号。'
  }
];

const WAVE_STEPS = [
  {
    from: 'client', to: 'server',
    flags: 'FIN = 1, ACK = 1',
    seq: 'seq = u (例: 500)',
    ack: 'ack = v (例: 700)',
    clientStateAfter: 'FIN_WAIT_1',
    serverStateAfter: 'ESTABLISHED',
    desc: '<b>第 1 次挥手：</b>客户端通知释放连接。<br>发送释放报文：FIN=1，seq=u。客户端停止发送数据，进入 <span style="color:#60a5fa">FIN_WAIT_1</span> 状态。单向关闭！'
  },
  {
    from: 'server', to: 'client',
    flags: 'ACK = 1',
    seq: 'seq = v (例: 700)',
    ack: 'ack = u + 1 (例: 501)',
    clientStateAfter: 'FIN_WAIT_2',
    serverStateAfter: 'CLOSE_WAIT',
    desc: '<b>第 2 次挥手：</b>服务端给出确认。<br>发送 ACK=1，ack=u+1，seq=v。服务端转入 <span style="color:#f59e0b">CLOSE_WAIT</span> 状态。此时处于半关闭状态，服务器若有剩余数据仍可单向发给客户端！客户端收到后转入 <span style="color:#60a5fa">FIN_WAIT_2</span> 状态。'
  },
  {
    from: 'server', to: 'client',
    flags: 'FIN = 1, ACK = 1',
    seq: 'seq = w (例: 750)',
    ack: 'ack = u + 1 (例: 501)',
    clientStateAfter: 'FIN_WAIT_2',
    serverStateAfter: 'LAST_ACK',
    desc: '<b>第 3 次挥手：</b>服务端数据发完，通知关闭。<br>服务端发送 FIN=1, ACK=1，seq=w，ack=u+1。服务端进入 <span style="color:#ef4444">LAST_ACK</span> 状态，等待客户端最后确认。'
  },
  {
    from: 'client', to: 'server',
    flags: 'ACK = 1',
    seq: 'seq = u + 1 (例: 501)',
    ack: 'ack = w + 1 (例: 751)',
    clientStateAfter: 'TIME_WAIT (2MSL)',
    serverStateAfter: 'CLOSED',
    desc: '<b>第 4 次挥手：</b>客户端确认释放，进入 2MSL 倒计时。<br>发送 ACK=1，ack=w+1。客户端必须进入 <span style="color:#ec4899; font-weight:bold;">TIME_WAIT (等待 2MSL)</span> 状态！服务端收到后彻底 CLOSED。待 2MSL 定时器结束后，客户端才彻底进入 CLOSED。'
  }
];

function getSteps() {
  return currentMode === 'handshake' ? HANDSHAKE_STEPS : WAVE_STEPS;
}

function updateStates(cState, sState) {
  const c = document.getElementById('clientState');
  const s = document.getElementById('serverState');
  c.innerText = cState;
  s.innerText = sState;

  if (cState === 'ESTABLISHED') {
    c.style.color = '#10b981'; c.style.borderColor = '#059669'; c.style.background = 'rgba(16,185,129,0.15)';
  } else if (cState.includes('TIME_WAIT')) {
    c.style.color = '#ec4899'; c.style.borderColor = '#db2777'; c.style.background = 'rgba(236,72,153,0.15)';
  } else {
    c.style.color = '#60a5fa'; c.style.borderColor = '#3b82f6'; c.style.background = 'rgba(59,130,246,0.1)';
  }

  if (sState === 'ESTABLISHED') {
    s.style.color = '#10b981'; s.style.borderColor = '#059669'; s.style.background = 'rgba(16,185,129,0.15)';
  } else if (sState === 'CLOSED') {
    s.style.color = '#94a3b8'; s.style.borderColor = '#475569'; s.style.background = '#0f172a';
  } else {
    s.style.color = '#34d399'; s.style.borderColor = '#059669'; s.style.background = 'rgba(16,185,129,0.1)';
  }
}

function renderTrack() {
  const track = document.getElementById('flowTrack');
  track.innerHTML = '';
  const steps = getSteps();

  steps.forEach((st, idx) => {
    const isClientToServer = st.from === 'client';
    const item = document.createElement('div');
    item.className = 'flow-item' + (idx < currentStep ? ' done' : (idx === currentStep ? ' active' : ''));

    let html = '';
    if (isClientToServer) {
      html = \`
        <div style="width: 40px; font-weight:bold; color:#60a5fa; font-size:11px;">#\${idx+1}</div>
        <div class="packet-box">
          <div class="flags">\${st.flags}</div>
          <div class="seq-info">\${st.seq} | \${st.ack}</div>
        </div>
        <div class="arrow-line \${idx <= currentStep ? 'active' : ''}">
          <div class="arrow-head arrow-right"></div>
        </div>
        <div style="width: 40px;"></div>
      \`;
    } else {
      html = \`
        <div style="width: 40px;"></div>
        <div class="arrow-line \${idx <= currentStep ? 'active' : ''}">
          <div class="arrow-head arrow-left"></div>
        </div>
        <div class="packet-box" style="border-color: #34d399;">
          <div class="flags" style="color:#34d399">\${st.flags}</div>
          <div class="seq-info">\${st.seq} | \${st.ack}</div>
        </div>
        <div style="width: 40px; font-weight:bold; color:#34d399; font-size:11px; text-align:right;">#\${idx+1}</div>
      \`;
    }
    item.innerHTML = html;
    track.appendChild(item);
  });
}

function stepNext() {
  const steps = getSteps();
  if (currentStep >= steps.length) {
    document.getElementById('stepExplanation').innerHTML = '✅ <b>' + (currentMode === 'handshake' ? '三次握手' : '四次挥手') + ' 已全部演示完成！</b>';
    return;
  }
  const st = steps[currentStep];
  document.getElementById('stepExplanation').innerHTML = st.desc;
  updateStates(st.clientStateAfter, st.serverStateAfter);
  currentStep++;
  renderTrack();
}

function resetSim() {
  clearInterval(autoTimer);
  currentStep = 0;
  if (currentMode === 'handshake') {
    updateStates('CLOSED', 'LISTEN');
    document.getElementById('stepExplanation').innerHTML = '准备就绪，点击【单步执行】开始三次握手。';
  } else {
    updateStates('ESTABLISHED', 'ESTABLISHED');
    document.getElementById('stepExplanation').innerHTML = '准备就绪，双方均处于 ESTABLISHED，点击【单步执行】开始四次挥手。';
  }
  renderTrack();
}

function switchMode(m) {
  clearInterval(autoTimer);
  currentMode = m;
  document.getElementById('btnHandshake').className = 'mode-btn' + (m === 'handshake' ? ' active' : '');
  document.getElementById('btnWave').className = 'mode-btn' + (m === 'wave' ? ' active' : '');
  resetSim();
}

function autoPlay() {
  resetSim();
  const steps = getSteps();
  autoTimer = setInterval(() => {
    if (currentStep < steps.length) {
      stepNext();
    } else {
      clearInterval(autoTimer);
    }
  }, 1200);
}

resetSim();
</script>
</body>
</html>`
}
