import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const gramSchmidtCourseware: InteractiveCoursewareItem = {
  id: 'cw-gram-schmidt',
  title: '📐 施密特正交化：向量正交投影与规范正交基几何实验室',
  domain: 'math',
  subject: '线性代数',
  difficulty: '每年必考大题',
  tags: ['考研数学', '线性代数', '施密特正交化', '正交基', '向量投影', '内积', '规范正交化', '实对称矩阵对角化'],
  summary: '考研线代二次型与实对称矩阵正交相似对角化核心工具“施密特正交化 (Gram-Schmidt)”全景动态仿真。直观演示从线性无关向量组通过投影消除分量、构造两两正交基（内积为0）并最终单位化的完整几何过程。',
  learningPoints: [
    '正交投影本质：将向量 α 沿已有正交基 β 投影，减去投影分量后剩下的残差向量必与基底垂直',
    '二步公式：β₁ = α₁；β₂ = α₂ - [(α₂, β₁) / (β₁, β₁)] β₁',
    '三步公式：β₃ = α₃ - [(α₃, β₁) / (β₁, β₁)] β₁ - [(α₃, β₂) / (β₂, β₂)] β₂',
    '单位化规范正交基：ηᵢ = βᵢ / ‖βᵢ‖，组成的正交矩阵 Q 满足 QᵀQ = E，其行列式 |Q| = ±1'
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
    --orig: #f59e0b;
    --ortho: #10b981;
    --proj: #a855f7;
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
  input[type="text"] {
    background: #0b0f19;
    border: 1px solid var(--border-color);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 13px;
    outline: none;
    width: 100%;
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

  .step-box {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  .step-box b { color: #38bdf8; font-family: sans-serif; }

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
  <h1>📐 考研线代 · 施密特正交化与正交投影动态实验室 <span class="badge">全国统考核心大题</span></h1>
  <div style="font-size:12px; color:#94a3b8;">内积消除投影 · 规范正交基构建</div>
</header>

<div class="layout">
  <!-- 左侧控制面板 -->
  <div class="panel">
    <div class="ctrl-label">初始线性无关向量组</div>
    <div>
      <div style="font-size:11px; color:#f59e0b; margin-bottom:2px;">向量 α₁ (x, y):</div>
      <input type="text" id="vecA1" value="3, 1">
    </div>
    <div>
      <div style="font-size:11px; color:#f59e0b; margin-bottom:2px;">向量 α₂ (x, y):</div>
      <input type="text" id="vecA2" value="1, 3">
    </div>

    <div class="btn-row">
      <button class="primary" id="btnCompute">⚡ 施密特正交化推导</button>
      <button id="btnPreset">📌 408考研母题预设</button>
    </div>

    <!-- 正交化演算过程卡片 -->
    <div class="step-box" id="calcLog">
      <b>演算过程：</b><br>
      等待执行...
    </div>

    <div class="tip-card">
      <b>💡 考场正交化提速心法：</b><br>
      1. <b>基准向量选择</b>：若向量组中有含 0 较多的向量，优先选为 $\beta_1$，极大简化后续内积计算；<br>
      2. <b>随时做内积验算</b>：每求出一个 $\beta_k$，立即与前面的基底计算 $(\beta_k, \beta_1) \stackrel{?}{=} 0$，若不为 0 立即重做，切勿错到最后；<br>
      3. <b>成比例放大</b>：中间计算若出现分数（如 $\beta_2 = (1/3, -2/3)$），可先乘以公倍数 3（正交性不变），最后再统一单位化！
    </div>
  </div>

  <!-- 右侧几何投影画布 -->
  <div class="sim-panel">
    <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; justify-content:space-between; flex-shrink:0;">
      <span>🎬 向量正交投影几何图解</span>
      <span id="dotProductStatus" style="color:#10b981;">两两正交验证: (β₁, β₂) = 0</span>
    </div>

    <div style="flex:1; min-height:0; position:relative;">
      <canvas id="vecCanvas"></canvas>
    </div>

    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:10px; font-size:12px; color:#cbd5e1; flex-shrink:0;">
      <b style="color:#38bdf8;">📝 几何本质剖析：</b>
      <span>黄色虚线表示原向量 α₂；紫色箭头表示 α₂ 在 β₁ 上的正交投影分量 proj(α₂)；绿色实线箭头表示残差向量 β₂ = α₂ - proj(α₂)，两向量夹角严格为 90° 垂直！</span>
    </div>
  </div>
</div>

<script>
  const canvas = document.getElementById("vecCanvas");
  const ctx = canvas.getContext("2d");

  let logicW = 400, logicH = 320;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    logicW = canvas.clientWidth || canvas.parentElement.clientWidth || 360;
    logicH = canvas.clientHeight || canvas.parentElement.clientHeight || 300;
    canvas.width = Math.round(logicW * dpr);
    canvas.height = Math.round(logicH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computeAndDraw();
  }
  window.addEventListener("resize", resize);

  function parseVec(str) {
    const parts = str.split(",").map(p => parseFloat(p.trim()));
    return [parts[0] || 0, parts[1] || 0];
  }

  function dot(u, v) { return u[0]*v[0] + u[1]*v[1]; }

  function computeAndDraw() {
    const a1 = parseVec(document.getElementById("vecA1").value);
    const a2 = parseVec(document.getElementById("vecA2").value);

    // 施密特计算
    // 1. β1 = α1
    const b1 = [a1[0], a1[1]];
    const b1DotB1 = dot(b1, b1);

    // 2. 投影 proj = (α2, β1) / (β1, β1) * β1
    const a2DotB1 = dot(a2, b1);
    const coef = b1DotB1 !== 0 ? (a2DotB1 / b1DotB1) : 0;
    const proj = [coef * b1[0], coef * b1[1]];

    // 3. β2 = α2 - proj
    const b2 = [a2[0] - proj[0], a2[1] - proj[1]];

    // 内积验算
    const innerProd = dot(b1, b2);

    // 更新日志
    document.getElementById("calcLog").innerHTML = \`<b>第 1 步: 基底设定</b><br>
β₁ = α₁ = (\${b1[0]}, \${b1[1]})<br>
(β₁, β₁) = \${b1DotB1.toFixed(2)}<br><br>
<b>第 2 步: 投影计算</b><br>
(α₂, β₁) = \${a2DotB1.toFixed(2)}<br>
投影系数 k = \${coef.toFixed(3)}<br>
投影向量 proj = (\${proj[0].toFixed(2)}, \${proj[1].toFixed(2)})<br><br>
<b>第 3 步: 残差正交基 β₂</b><br>
β₂ = α₂ - proj = (\${b2[0].toFixed(2)}, \${b2[1].toFixed(2)})<br>
正交性内积: (β₁, β₂) = \${Math.abs(innerProd) < 1e-4 ? "0.000 (严格垂直!)" : innerProd.toFixed(4)}\`;

    // 绘制几何图
    const w = logicW, h = logicH;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const scale = Math.min(54, Math.max(28, Math.min(w, h) / 8.2));

    // 坐标网格
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();

    function drawArrow(vx, vy, color, label, isDash = false) {
      const tx = cx + vx * scale;
      const ty = cy - vy * scale;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      if (isDash) ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // 箭头尖端
      const angle = Math.atan2(cy - ty, tx - cx);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - 10 * Math.cos(angle - Math.PI/6), ty + 10 * Math.sin(angle - Math.PI/6));
      ctx.lineTo(tx - 10 * Math.cos(angle + Math.PI/6), ty + 10 * Math.sin(angle + Math.PI/6));
      ctx.fill();

      // 标签
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(label, tx + 8, ty - 6);
      ctx.restore();
    }

    // 绘制原始 α2 (虚线黄色)
    drawArrow(a2[0], a2[1], "#f59e0b", "α₂ (原始)", true);
    // 绘制投影 proj (紫色虚线)
    drawArrow(proj[0], proj[1], "#a855f7", "proj(α₂)", true);
    // 绘制正交基 β1 (蓝色实线)
    drawArrow(b1[0], b1[1], "#38bdf8", "β₁ (基底1)");
    // 绘制正交基 β2 (绿色实线)
    drawArrow(b2[0], b2[1], "#10b981", "β₂ (正交基2)");

    // 绘制直角标志
    if (Math.abs(innerProd) < 1e-4) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      const s1 = [b1[0] / Math.hypot(b1[0], b1[1]) * 15, b1[1] / Math.hypot(b1[0], b1[1]) * 15];
      const s2 = [b2[0] / Math.hypot(b2[0], b2[1]) * 15, b2[1] / Math.hypot(b2[0], b2[1]) * 15];
      ctx.beginPath();
      ctx.moveTo(cx + s1[0], cy - s1[1]);
      ctx.lineTo(cx + s1[0] + s2[0], cy - s1[1] - s2[1]);
      ctx.lineTo(cx + s2[0], cy - s2[1]);
      ctx.stroke();
    }
  }

  document.getElementById("btnCompute").addEventListener("click", computeAndDraw);
  document.getElementById("btnPreset").addEventListener("click", () => {
    document.getElementById("vecA1").value = "4, 0";
    document.getElementById("vecA2").value = "2, 3";
    computeAndDraw();
  });

  setTimeout(resize, 50);
</script>
</body>
</html>`
}
