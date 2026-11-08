import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const csmaCdCourseware: InteractiveCoursewareItem = {
  id: 'cw-csma-cd',
  title: '📡 CSMA/CD 协议碰撞检测与二进制指数退避算法仿真器',
  domain: 'cs_408',
  subject: '计算机网络',
  difficulty: '每年必考大题',
  tags: ['408', '计网', '以太网', 'CSMA/CD', '争用期', '碰撞检测', '退避算法', '最小帧长'],
  summary: '以太网总线型介质访问控制核心仿真。动态模拟主机 A 与 B 发送信号在总线上的双向电磁波传播、冲突碰撞产生与强化碰撞 Jam 信号；单步演练截断二进制指数退避算法的时间槽选择与重传计时。',
  learningPoints: [
    '争用期（冲突窗口）= 2τ（两倍端到端单程传播时延），在争用期内未检测到碰撞方可保证本次发送不发生冲突',
    '最小帧长公式：L_min = 2τ * 数据传输速率 C。若帧长小于 L_min，则发送完毕前无法检测到远端冲突',
    '截断二进制指数退避算法：基本退避时间为 2τ，退避次数 k = min(重传次数, 10)，从 [0, 2^k - 1] 随机选取整数 r，等待 r * 2τ',
    '当重传达 16 次仍不成功时，判定网络故障并抛弃此帧向上层报错'
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
    --host-a: #3b82f6;
    --host-b: #ec4899;
    --collision: #ef4444;
    --success: #10b981;
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
    grid-template-columns: 310px 1fr;
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
  .canvas-panel {
    background: radial-gradient(circle at 50% 50%, #151d30 0%, #0c111d 100%);
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
  .bus-container {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px;
    margin-top: 10px;
    position: relative;
  }
  .bus-line {
    height: 6px;
    background: #334155;
    border-radius: 3px;
    position: relative;
    margin: 40px 0;
  }
  .signal {
    position: absolute;
    top: -4px;
    height: 14px;
    border-radius: 7px;
    transition: all 0.05s linear;
  }
  .signal.a { background: rgba(59, 130, 246, 0.7); box-shadow: 0 0 10px #3b82f6; }
  .signal.b { background: rgba(236, 72, 153, 0.7); box-shadow: 0 0 10px #ec4899; }
  .signal.collision { background: rgba(239, 68, 68, 0.9); box-shadow: 0 0 14px #ef4444; }
  .host-node {
    position: absolute;
    top: -36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .host-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: 1px solid;
  }
  .backoff-box {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    font-family: monospace;
    line-height: 1.6;
  }
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
  <h1><span>📡</span> CSMA/CD 协议碰撞检测与指数退避算法仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 计网必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">争用期 2τ 与截断二进制指数退避动态仿真</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">碰撞仿真演练触发</div>
      <button class="primary" onclick="startSim()">⚡ 模拟 A 与 B 同时发帧 (触发碰撞)</button>
      <button onclick="startSingleA()">🟢 仅主机 A 发送 (无冲突成功)</button>
      <button onclick="resetSim()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🔄 重置回初始状态</button>
    </div>

    <div class="controls-group">
      <div class="label">退避算法计算器 (Backoff Calculator)</div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <span style="font-size: 11px; color: var(--text-secondary);">当前冲突次数:</span>
        <select id="colCount" onchange="calcBackoff()" style="background:#080c14; color:#fff; border:1px solid var(--border-color); padding:4px 8px; border-radius:6px; flex:1;">
          <option value="1">第 1 次冲突 (k=1)</option>
          <option value="2">第 2 次冲突 (k=2)</option>
          <option value="3">第 3 次冲突 (k=3)</option>
          <option value="4">第 4 次冲突 (k=4)</option>
          <option value="10">第 10 次冲突 (截断 k=10)</option>
          <option value="16">第 16 次冲突 (超限报错)</option>
        </select>
      </div>
      <div class="backoff-box" id="backoffResult">计算中...</div>
    </div>

    <div class="controls-group">
      <div class="label">网络事件状态日志</div>
      <div id="logBox" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 100px;">
        准备就绪。点击按钮模拟总线传输。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 考场大题核心计算公式：</b><br>
      • <b>争用期 (Contention Period)</b> = 2τ = 2 × (L / v)<br>
      • <b>最小帧长 L_min</b> = 2τ × 数据速率 C<br>
      • <b>为什么会有最小帧长限制？</b> 确保发送端在发完该帧之前，一定能收到总线上任何可能的碰撞信号；若帧太短发完了才撞上，发送端误以为发送成功，无法执行重传！
    </div>
  </div>

  <div class="canvas-panel">
    <div class="label">以太网 10Base-T 总线物理信号动态仿真</div>
    <div class="bus-container">
      <!-- 主机 A -->
      <div class="host-node" style="left: 20px;">
        <div class="host-icon" style="color:#60a5fa; border-color:#3b82f6; background:rgba(59,130,246,0.1);">💻</div>
        <span style="font-size: 11px; font-weight: bold; color:#60a5fa;">主机 A</span>
        <span id="stateA" style="font-size: 10px; color:#94a3b8;">空闲</span>
      </div>

      <!-- 主机 B -->
      <div class="host-node" style="right: 20px;">
        <div class="host-icon" style="color:#f472b6; border-color:#ec4899; background:rgba(236,72,153,0.1);">🖥️</div>
        <span style="font-size: 11px; font-weight: bold; color:#f472b6;">主机 B</span>
        <span id="stateB" style="font-size: 10px; color:#94a3b8;">空闲</span>
      </div>

      <!-- 共享总线 -->
      <div class="bus-line" id="busLine">
        <div class="signal a" id="sigA" style="left: 20px; width: 0; display: none;"></div>
        <div class="signal b" id="sigB" style="right: 20px; width: 0; display: none;"></div>
      </div>
    </div>

    <div style="margin-top: 16px; background: #080c14; border: 1px solid var(--border-color); border-radius: 10px; padding: 12px;">
      <div class="label" style="color: var(--accent);">时序演进示意图 (t0 → t_collision → 2τ)</div>
      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.6;" id="timelineText">
        ① t=0: 主机 A 侦听到信道空闲，开始发送数据帧；<br>
        ② t=τ-δ: 信号尚未到达 B，主机 B 误以为信道空闲，也开始发送；<br>
        ③ t=τ/2: 两路电磁信号在总线中央激烈碰撞，电压倍增；<br>
        ④ t=τ: 主机 A 与 B 相继检测到冲突，立即停止发帧并发出人为干扰信号 (Jamming Signal 32~48bit)，转入退避等待！
      </div>
    </div>
  </div>
</div>

<script>
let animId = null;
let posA = 0;
let posB = 0;

function resetSim() {
  cancelAnimationFrame(animId);
  document.getElementById('sigA').style.display = 'none';
  document.getElementById('sigB').style.display = 'none';
  document.getElementById('sigA').className = 'signal a';
  document.getElementById('sigB').className = 'signal b';
  document.getElementById('stateA').innerText = '空闲';
  document.getElementById('stateB').innerText = '空闲';
  document.getElementById('stateA').style.color = '#94a3b8';
  document.getElementById('stateB').style.color = '#94a3b8';
  document.getElementById('logBox').innerText = '已重置总线状态。';
}

function startSim() {
  resetSim();
  const sigA = document.getElementById('sigA');
  const sigB = document.getElementById('sigB');
  sigA.style.display = 'block';
  sigB.style.display = 'block';
  sigA.style.width = '0px';
  sigB.style.width = '0px';

  document.getElementById('stateA').innerText = '正在发送...';
  document.getElementById('stateA').style.color = '#38bdf8';
  document.getElementById('stateB').innerText = '正在发送...';
  document.getElementById('stateB').style.color = '#ec4899';
  document.getElementById('logBox').innerHTML = 't=0: A 与 B 同时监听信道并开始发帧...';

  const busWidth = document.getElementById('busLine').clientWidth - 40;
  let progress = 0;

  function step() {
    progress += 3;
    sigA.style.width = progress + 'px';
    sigB.style.width = progress + 'px';

    if (progress >= busWidth / 2) {
      // 发生碰撞！
      sigA.className = 'signal collision';
      sigB.className = 'signal collision';
      document.getElementById('stateA').innerText = '🚨 碰撞检测！';
      document.getElementById('stateA').style.color = '#ef4444';
      document.getElementById('stateB').innerText = '🚨 碰撞检测！';
      document.getElementById('stateB').style.color = '#ef4444';
      document.getElementById('logBox').innerHTML = \`
        <span style="color:#ef4444; font-weight:bold;">💥 发生冲突 (Collision Detected)！</span><br>
        在 t = τ/2 时两股电磁信号相撞！双方硬件检测到电压超过门限，立即停止传输数据，并在总线上广播 48bit Jam 人为干扰信号，随后启动<b>二进制指数退避算法</b>等待重传！
      \`;
      return;
    }
    animId = requestAnimationFrame(step);
  }
  animId = requestAnimationFrame(step);
}

function startSingleA() {
  resetSim();
  const sigA = document.getElementById('sigA');
  sigA.style.display = 'block';
  sigA.style.width = '0px';

  document.getElementById('stateA').innerText = '独占发送中...';
  document.getElementById('stateA').style.color = '#38bdf8';
  document.getElementById('logBox').innerHTML = 't=0: 主机 A 独占信道发送，无其他主机竞争...';

  const busWidth = document.getElementById('busLine').clientWidth - 40;
  let progress = 0;

  function step() {
    progress += 4;
    sigA.style.width = progress + 'px';
    if (progress >= busWidth) {
      document.getElementById('stateA').innerText = '✅ 发送成功';
      document.getElementById('stateA').style.color = '#10b981';
      document.getElementById('stateB').innerText = '接收到帧';
      document.getElementById('logBox').innerHTML = '<span style="color:#10b981; font-weight:bold;">✅ 超过争用期 2τ，顺利传送完毕！</span> 数据帧完整被 B 接收。';
      return;
    }
    animId = requestAnimationFrame(step);
  }
  animId = requestAnimationFrame(step);
}

function calcBackoff() {
  const c = parseInt(document.getElementById('colCount').value, 10);
  const res = document.getElementById('backoffResult');

  if (c >= 16) {
    res.innerHTML = \`<span style="color:#ef4444; font-weight:bold;">❌ 重传 16 次全部失败！</span><br>网络拥塞严重，CSMA/CD 宣告失败，丢弃此帧并向高层 (IP层) 报错！\`;
    return;
  }

  const k = Math.min(c, 10);
  const maxR = Math.pow(2, k) - 1;
  const picked = Math.floor(Math.random() * (maxR + 1));

  res.innerHTML = \`
    <div>退避次数 k = min(\${c}, 10) = <b>\${k}</b></div>
    <div>离散整数集合: [0, 1, ..., \${maxR}] (共 \${maxR + 1} 个选择)</div>
    <div style="color:#38bdf8; margin-top:2px;">🎲 随机抽取等待槽数 r = <b>\${picked}</b></div>
    <div style="color:#10b981; font-weight:bold;">实际等待时间 = \${picked} × 2τ (\${picked * 51.2} μs)</div>
  \`;
}

calcBackoff();
</script>
</body>
</html>`
}
