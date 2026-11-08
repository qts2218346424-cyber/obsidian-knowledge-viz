import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const tcpCongestionCourseware: InteractiveCoursewareItem = {
  id: 'cw-tcp-congestion',
  title: '📈 TCP 拥塞控制：慢开始、拥塞避免、快重传与快恢复全周期仿真器',
  domain: 'cs_408',
  subject: '计算机网络',
  difficulty: '每年必考大题',
  tags: ['408', '计算机网络', '传输层', 'TCP', '拥塞控制', '慢开始', '拥塞避免', '快重传', '快恢复', 'cwnd'],
  summary: 'TCP Reno 经典拥塞控制算法动态全景仿真。以传输轮次 (RTT) 为驱动，实时绘制 cwnd 动态曲线与 ssthresh 门限变动；支持注入“网络超时 (Timeout)”与“3个重复 ACK”突发事件，直观揭示 Reno 算法乘法减小与加法增大机制。',
  learningPoints: [
    '慢开始 (Slow Start)：每经过一个 RTT，拥塞窗口 cwnd 翻倍（指数级增长），直到达到慢开始门限 ssthresh',
    '拥塞避免 (Congestion Avoidance)：当 cwnd >= ssthresh 时，每个 RTT 仅增加 1 MSS（线性增长，加法增大）',
    '超时重传 (Timeout)：表明网络严重拥塞，ssthresh 减半为 cwnd/2，且 cwnd 骤降为 1 MSS，重新进入慢开始',
    '收到 3 个重复 ACK (快重传与快恢复)：表明个别报文丢失但网络并未完全瘫痪，ssthresh 减半为 cwnd/2，cwnd 设为新的 ssthresh，直接进入拥塞避免（加法增大）'
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
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
    --purple: #a855f7;
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
  .sim-panel {
    background: radial-gradient(circle at 50% 50%, #131b2e 0%, #0a0e1a 100%);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
    gap: 12px;
  }
  .ctrl-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
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
  button.warn { background: #991b1b; border-color: #ef4444; color: #fff; }
  button.warn:hover { background: #7f1d1d; }
  button.amber { background: #b45309; border-color: #f59e0b; color: #fff; }
  button.amber:hover { background: #92400e; }
  .btn-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

  /* 状态指示条 */
  .state-badge {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-align: center;
  }
  .state-ss { background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid #38bdf8; }
  .state-ca { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid #10b981; }
  .state-fr { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid #f59e0b; }

  .metric-card {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  .metric-val { font-size: 18px; font-weight: 700; font-family: monospace; }

  canvas {
    width: 100%;
    height: 100%;
    background: #0a0e17;
    border: 1px solid var(--border-color);
    border-radius: 8px;
  }
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
  <h1>📈 408 计网 · TCP 拥塞控制全状态机仿真器 <span class="badge">全国统考每年必考</span></h1>
  <div style="font-size:12px; color:#94a3b8;">TCP Reno 标准算法 · 慢开始 / 拥塞避免 / 快重传 / 快恢复</div>
</header>

<div class="layout">
  <!-- 左侧控制面板 -->
  <div class="panel">
    <div class="ctrl-label">当前运行阶段</div>
    <div class="state-badge state-ss" id="stateLabel">🚀 慢开始 (Slow Start)</div>

    <div class="metric-card">
      <div>
        <div style="font-size:11px; color:#94a3b8;">传输轮次 (RTT)</div>
        <div class="metric-val" id="rttVal" style="color:#e2e8f0;">1</div>
      </div>
      <div>
        <div style="font-size:11px; color:#94a3b8;">拥塞窗口 cwnd</div>
        <div class="metric-val" id="cwndVal" style="color:#38bdf8;">1</div>
      </div>
      <div>
        <div style="font-size:11px; color:#94a3b8;">门限 ssthresh</div>
        <div class="metric-val" id="ssthreshVal" style="color:#a855f7;">16</div>
      </div>
    </div>

    <div class="btn-row">
      <button class="primary" id="btnNextRTT">▶ 下一轮 (RTT+1)</button>
      <button id="btnAutoPlay">⚡ 自动连续运行</button>
    </div>

    <div class="ctrl-label" style="margin-top:4px;">🚨 考场突发事件注入</div>
    <button class="warn" id="btnTimeout">💥 发生超时重传 (Timeout 丢包)</button>
    <button class="amber" id="btnFastRetrans">⚡ 收到 3 个重复 ACK (快重传)</button>

    <div class="btn-row">
      <button id="btnReset">↺ 重置回第 1 轮</button>
      <button id="btnClear">🧹 清空历史曲线</button>
    </div>

    <div class="tip-card">
      <b>💡 408 考场真题秒杀规律：</b><br>
      1. <b>慢开始翻倍</b>：$1 \to 2 \to 4 \to 8 \dots$ 直至达到 $ssthresh$；<br>
      2. <b>超时重传是断崖</b>：$ssthresh = \lfloor cwnd/2 \rfloor$，$cwnd$ <b>重置为 1</b>，重新从慢开始起步；<br>
      3. <b>3 个重复 ACK 是滑梯</b>：$ssthresh = \lfloor cwnd/2 \rfloor$，$cwnd = ssthresh$，直接进入<b>拥塞避免</b>（线性加法增大），不需要降为 1！
    </div>
  </div>

  <!-- 右侧动态折线图舞台 -->
  <div class="sim-panel">
    <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; justify-content:space-between; flex-shrink:0;">
      <span>📊 拥塞窗口 cwnd 随 RTT 演化趋势折线图 (MSS)</span>
      <span id="eventLog" style="color:#94a3b8;">就绪，初始 ssthresh = 16 MSS</span>
    </div>

    <div style="flex:1; min-height:0; position:relative;">
      <canvas id="chartCanvas"></canvas>
    </div>

    <!-- 考题实时问答推导卡片 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:10px; font-size:12px; color:#cbd5e1; flex-shrink:0;">
      <b style="color:#38bdf8;">📝 考题即时剖析：</b>
      <span id="analysisText">第 1 轮次：处于慢开始阶段，cwnd 初始值为 1 MSS。发送 1 个报文段等待确认。</span>
    </div>
  </div>
</div>

<script>
  let rtt = 1;
  let cwnd = 1;
  let ssthresh = 16;
  let state = "SlowStart"; // "SlowStart" | "CongestionAvoid" | "FastRecovery"
  let history = [{ rtt: 1, cwnd: 1, ssthresh: 16, state: "SlowStart" }];
  let autoTimer = null;

  const canvas = document.getElementById("chartCanvas");
  const ctx = canvas.getContext("2d");

  let logicW = 450, logicH = 300;
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    logicW = canvas.clientWidth || canvas.parentElement.clientWidth || 360;
    logicH = canvas.clientHeight || canvas.parentElement.clientHeight || 270;
    canvas.width = Math.round(logicW * dpr);
    canvas.height = Math.round(logicH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawChart();
  }
  window.addEventListener("resize", resizeCanvas);

  function drawChart() {
    const w = logicW, h = logicH;
    ctx.clearRect(0, 0, w, h);
    const padL = 40, padR = 20, padT = 30, padB = 30;

    // 坐标范围
    const maxRTT = Math.max(20, rtt + 2);
    const maxCwnd = 32;

    const scaleX = (x) => padL + (x / maxRTT) * (w - padL - padR);
    const scaleY = (y) => h - padB - (y / maxCwnd) * (h - padT - padB);

    // 绘制坐标网格
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let y = 0; y <= maxCwnd; y += 4) {
      const sy = scaleY(y);
      ctx.beginPath();
      ctx.moveTo(padL, sy);
      ctx.lineTo(w - padR, sy);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.fillText(y, 10, sy + 3);
    }

    for (let x = 0; x <= maxRTT; x += 2) {
      const sx = scaleX(x);
      ctx.beginPath();
      ctx.moveTo(sx, padT);
      ctx.lineTo(sx, h - padB);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.fillText(x, sx - 4, h - 12);
    }

    // 绘制 ssthresh 虚线 (当前门限)
    const curSsthreshY = scaleY(ssthresh);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, curSsthreshY);
    ctx.lineTo(w - padR, curSsthreshY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#a855f7";
    ctx.font = "11px sans-serif";
    ctx.fillText(\`当前门限 ssthresh = \${ssthresh}\`, padL + 10, curSsthreshY - 6);

    // 绘制 cwnd 历史曲线
    if (history.length > 1) {
      ctx.lineWidth = 2.5;
      for (let i = 1; i < history.length; i++) {
        const p1 = history[i - 1];
        const p2 = history[i];

        ctx.beginPath();
        ctx.moveTo(scaleX(p1.rtt), scaleY(p1.cwnd));
        ctx.lineTo(scaleX(p2.rtt), scaleY(p2.cwnd));

        if (p2.event === "timeout") {
          ctx.strokeStyle = "#ef4444";
        } else if (p2.event === "fast") {
          ctx.strokeStyle = "#f59e0b";
        } else if (p1.state === "SlowStart") {
          ctx.strokeStyle = "#38bdf8";
        } else {
          ctx.strokeStyle = "#10b981";
        }
        ctx.stroke();
      }
    }

    // 绘制数据点
    history.forEach(p => {
      const px = scaleX(p.rtt);
      const py = scaleY(p.cwnd);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = (p.state === "SlowStart") ? "#38bdf8" : (p.state === "CongestionAvoid" ? "#10b981" : "#f59e0b");
      ctx.fill();
    });
  }

  function updateUI(eventMsg) {
    document.getElementById("rttVal").innerText = rtt;
    document.getElementById("cwndVal").innerText = cwnd;
    document.getElementById("ssthreshVal").innerText = ssthresh;

    const lbl = document.getElementById("stateLabel");
    if (state === "SlowStart") {
      lbl.className = "state-badge state-ss";
      lbl.innerText = "🚀 慢开始 (Slow Start - 指数翻倍)";
    } else if (state === "CongestionAvoid") {
      lbl.className = "state-badge state-ca";
      lbl.innerText = "🛡️ 拥塞避免 (Congestion Avoidance - 加法增大)";
    } else {
      lbl.className = "state-badge state-fr";
      lbl.innerText = "⚡ 快恢复 (Fast Recovery)";
    }

    if (eventMsg) {
      document.getElementById("eventLog").innerText = eventMsg;
    }

    drawChart();
  }

  function nextRTT() {
    rtt++;
    if (cwnd < ssthresh) {
      state = "SlowStart";
      cwnd = Math.min(cwnd * 2, ssthresh);
      document.getElementById("analysisText").innerText = \`第 \${rtt} 轮：处于慢开始阶段，cwnd 翻倍增长至 \${cwnd} MSS。目标门限为 \${ssthresh}。\`;
    } else {
      state = "CongestionAvoid";
      cwnd += 1;
      document.getElementById("analysisText").innerText = \`第 \${rtt} 轮：cwnd 已达到/超过门限 ssthresh (\${ssthresh})，转入拥塞避免阶段，线性增加 1，当前 cwnd = \${cwnd} MSS。\`;
    }

    history.push({ rtt, cwnd, ssthresh, state });
    updateUI();
  }

  // 超时事件
  document.getElementById("btnTimeout").addEventListener("click", () => {
    rtt++;
    const oldCwnd = cwnd;
    ssthresh = Math.max(2, Math.floor(cwnd / 2));
    cwnd = 1;
    state = "SlowStart";
    history.push({ rtt, cwnd, ssthresh, state, event: "timeout" });
    document.getElementById("analysisText").innerHTML = \`<b style="color:#ef4444;">🚨 发生超时 (Timeout)！</b> 检测到网络严重阻塞！门限减半: ssthresh = \${oldCwnd} / 2 = \${ssthresh} MSS；cwnd 骤降为 1 MSS，重新进入慢开始！\`;
    updateUI("⚠️ 发生超时丢包！窗口降为 1");
  });

  // 快重传事件 (3个重复ACK)
  document.getElementById("btnFastRetrans").addEventListener("click", () => {
    rtt++;
    const oldCwnd = cwnd;
    ssthresh = Math.max(2, Math.floor(cwnd / 2));
    cwnd = ssthresh; // Reno 算法：cwnd = ssthresh
    state = "CongestionAvoid";
    history.push({ rtt, cwnd, ssthresh, state, event: "fast" });
    document.getElementById("analysisText").innerHTML = \`<b style="color:#f59e0b;">⚡ 收到 3 个重复 ACK！</b> 启动快重传与快恢复 (Reno)！门限减半: ssthresh = \${oldCwnd} / 2 = \${ssthresh} MSS；cwnd = \${ssthresh} MSS，直接进入拥塞避免，加法递增！\`;
    updateUI("⚡ 快重传触发：窗口减半后线性递增");
  });

  document.getElementById("btnNextRTT").addEventListener("click", nextRTT);

  document.getElementById("btnAutoPlay").addEventListener("click", () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      document.getElementById("btnAutoPlay").innerText = "⚡ 自动连续运行";
    } else {
      document.getElementById("btnAutoPlay").innerText = "⏸ 暂停自动";
      autoTimer = setInterval(() => {
        if (rtt >= 20) {
          clearInterval(autoTimer);
          autoTimer = null;
          document.getElementById("btnAutoPlay").innerText = "⚡ 自动连续运行";
        } else {
          nextRTT();
        }
      }, 800);
    }
  });

  document.getElementById("btnReset").addEventListener("click", () => {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    rtt = 1;
    cwnd = 1;
    ssthresh = 16;
    state = "SlowStart";
    history = [{ rtt: 1, cwnd: 1, ssthresh: 16, state: "SlowStart" }];
    document.getElementById("analysisText").innerText = "已重置。第 1 轮次：处于慢开始阶段，cwnd = 1 MSS。";
    updateUI("已重置回初始状态");
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    history = [{ rtt, cwnd, ssthresh, state }];
    drawChart();
  });

  setTimeout(resizeCanvas, 50);
  updateUI();
</script>
</body>
</html>`
}
