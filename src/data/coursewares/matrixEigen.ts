import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const matrixEigenCourseware: InteractiveCoursewareItem = {
  id: 'cw-matrix-eigen',
  title: '📐 矩阵特征值、特征向量与二维空间几何变换动态实验室',
  domain: 'math',
  subject: '线性代数',
  difficulty: '核心考点',
  tags: ['考研数学', '线性代数', '特征值', '特征向量', '空间变换', '几何意义', '对角化'],
  summary: '互动探究 Ax = λx 的几何物理内涵！通过调节 2x2 变换矩阵参数，Canvas 实时动态展示二维网格空间的拉伸、剪切与旋转，高亮标出特征向量所在的特征主轴方向与特征值缩放倍数。',
  learningPoints: [
    '特征向量的几何直观：经过矩阵 A 空间变换后，【空间指向保持在同一直线上不发生偏转】的特殊方向即为特征向量 v',
    '特征值的几何直观：该特征向量在变换后的【长度伸缩比例】即为特征值 λ（若 λ < 0 则反向拉伸）',
    '实对称矩阵必可正交对角化：两个特征向量方向在空间中严格正交垂直（夹角 90°）',
    '若 det(A) = 0 则空间被压缩降维到一条直线或原点，至少有一个特征值为 0'
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
    --eigen1: #ec4899;
    --eigen2: #10b981;
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
    padding: 0;
    overflow: hidden;
  }
  .controls-group { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
  .matrix-input-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #080c14;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  .bracket { font-size: 32px; font-weight: 200; color: var(--accent); }
  .m-grid { display: grid; grid-template-columns: 50px 50px; gap: 6px; }
  .m-grid input {
    background: #1e293b;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: #fff;
    padding: 6px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    outline: none;
    font-family: monospace;
  }
  .m-grid input:focus { border-color: var(--accent); }
  button {
    background: #1e293b;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  button:hover { background: #334155; border-color: var(--accent); }
  .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .result-card {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
    line-height: 1.6;
    font-family: monospace;
  }
  .tips-card {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #34d399;
    line-height: 1.6;
  }
  canvas { width: 100%; height: 100%; }
</style>
</head>
<body>

<header>
  <h1><span>📐</span> 考研线性代数 · 特征值与特征向量几何直观实验室</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">线代核心考点</span>
    <span style="font-size: 11px; color: var(--text-secondary);">Ax = λx: 变换后方向不变的直线即为特征轴</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">设定变换矩阵 A</div>
      <div class="matrix-input-box">
        <span class="bracket">[</span>
        <div class="m-grid">
          <input type="number" id="mA" value="2" step="0.5" onchange="updateMatrix()">
          <input type="number" id="mB" value="1" step="0.5" onchange="updateMatrix()">
          <input type="number" id="mC" value="1" step="0.5" onchange="updateMatrix()">
          <input type="number" id="mD" value="2" step="0.5" onchange="updateMatrix()">
        </div>
        <span class="bracket">]</span>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">经典变换矩阵预设</div>
      <div class="preset-grid">
        <button onclick="setMatrix(2, 1, 1, 2)">✨ 实对称矩阵 (正交)</button>
        <button onclick="setMatrix(2, 0, 0, 0.5)">↔️ 纯伸缩对角阵</button>
        <button onclick="setMatrix(1, 1, 0, 1)">📐 水平剪切变换</button>
        <button onclick="setMatrix(0, -1, 1, 0)">🔄 旋转90°(无实特征)</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">特征方程与代数解析解</div>
      <div class="result-card" id="mathResult">计算中...</div>
    </div>

    <div class="tips-card">
      <b>💡 考研线代几何直观灵魂提问：</b><br>
      • <b>什么是特征向量？</b> 在矩阵将整个网格任意拉伸、扭曲变形后，<b>只有特定方向上的向量没有发生偏转弯曲</b>，仍然停留在原来的同一直线上！<br>
      • <b>什么是特征值？</b> 就是该方向上的拉伸倍数！<br>
      • <b>实对称矩阵 (A = A^T)</b>：其特征值必为实数，且不同特征值对应的特征向量在空间中<b>严格垂直 (90°)</b>！
    </div>
  </div>

  <div class="panel canvas-panel">
    <div style="position: absolute; top: 12px; left: 16px; z-index: 10; font-size: 11px; color: var(--text-secondary); background: rgba(18,24,39,0.8); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-color);">
      🖱️ 鼠标可在画布上随意移动：黄色带圆点为测试向量 <b>x</b>，青色箭头为其变换结果 <b>Ax</b>
    </div>
    <canvas id="gridCanvas"></canvas>
  </div>
</div>

<script>
let A = 2, B = 1, C = 1, D = 2;
let mouseX = 1.5, mouseY = 1.0;

function updateMatrix() {
  A = parseFloat(document.getElementById('mA').value) || 0;
  B = parseFloat(document.getElementById('mB').value) || 0;
  C = parseFloat(document.getElementById('mC').value) || 0;
  D = parseFloat(document.getElementById('mD').value) || 0;
  computeEigen();
  draw();
}

function setMatrix(a, b, c, d) {
  document.getElementById('mA').value = a;
  document.getElementById('mB').value = b;
  document.getElementById('mC').value = c;
  document.getElementById('mD').value = d;
  updateMatrix();
}

function computeEigen() {
  // det(A - lambda*I) = lambda^2 - (A+D)*lambda + (AD - BC) = 0
  const tr = A + D; // 迹
  const det = A * D - B * C; // 行列式
  const delta = tr * tr - 4 * det;

  const resBox = document.getElementById('mathResult');

  let html = \`<div>特征方程: λ² - (\${tr})λ + (\${det}) = 0</div>\`;
  html += \`<div>判别式 Δ = \${delta.toFixed(2)}</div>\`;

  if (delta < 0) {
    html += \`<div style="color: #f59e0b; margin-top: 4px;">无实特征值（空间发生纯旋转，不存在方向不变的实向量）</div>\`;
  } else {
    const l1 = (tr + Math.sqrt(delta)) / 2;
    const l2 = (tr - Math.sqrt(delta)) / 2;

    html += \`
      <div style="color: var(--eigen1); margin-top: 4px;">λ₁ = <b>\${l1.toFixed(2)}</b> (粉色特征轴)</div>
      <div style="color: var(--eigen2);">λ₂ = <b>\${l2.toFixed(2)}</b> (绿色特征轴)</div>
      <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">矩阵行列式 det(A) = λ₁·λ₂ = \${det.toFixed(2)}</div>
    \`;
  }
  resBox.innerHTML = html;
}

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let logicW = 400, logicH = 320;
function getScale() {
  return Math.min(52, Math.max(28, Math.min(logicW, logicH) / 8.2));
}
function resize() {
  const dpr = window.devicePixelRatio || 1;
  logicW = canvas.clientWidth || canvas.parentElement.clientWidth || 360;
  logicH = canvas.clientHeight || canvas.parentElement.clientHeight || 300;
  canvas.width = Math.round(logicW * dpr);
  canvas.height = Math.round(logicH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}
window.addEventListener('resize', resize);

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = logicW / 2;
  const cy = logicH / 2;
  const scale = getScale();
  mouseX = (e.clientX - rect.left - cx) / scale;
  mouseY = -(e.clientY - rect.top - cy) / scale;
  draw();
});

function draw() {
  const w = logicW;
  const h = logicH;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scale = getScale();

  // 1. 绘制背景微弱网格
  ctx.strokeStyle = '#1a2336';
  ctx.lineWidth = 1;
  for (let x = cx % scale; x < w; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = cy % scale; y < h; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. 绘制原坐标轴
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  // 3. 绘制变换后的变形网格（青色虚线网格）
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.lineWidth = 1;
  for (let i = -8; i <= 8; i++) {
    // 垂直网格线变换
    const p1x = cx + (A * i + B * -8) * scale;
    const p1y = cy - (C * i + D * -8) * scale;
    const p2x = cx + (A * i + B * 8) * scale;
    const p2y = cy - (C * i + D * 8) * scale;
    ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke();

    // 水平网格线变换
    const h1x = cx + (A * -8 + B * i) * scale;
    const h1y = cy - (C * -8 + D * i) * scale;
    const h2x = cx + (A * 8 + B * i) * scale;
    const h2y = cy - (C * 8 + D * i) * scale;
    ctx.beginPath(); ctx.moveTo(h1x, h1y); ctx.lineTo(h2x, h2y); ctx.stroke();
  }

  // 4. 绘制特征值主轴（若有实特征值）
  const tr = A + D;
  const det = A * D - B * C;
  const delta = tr * tr - 4 * det;

  if (delta >= 0) {
    const l1 = (tr + Math.sqrt(delta)) / 2;
    const l2 = (tr - Math.sqrt(delta)) / 2;

    function drawEigenLine(l, color) {
      let vx = 1, vy = 0;
      if (Math.abs(B) > 0.001) {
        vx = 1; vy = (l - A) / B;
      } else if (Math.abs(C) > 0.001) {
        vy = 1; vx = (l - D) / C;
      } else {
        vx = l === A ? 1 : 0;
        vy = l === D ? 1 : 0;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(cx - vx * 500, cy + vy * 500);
      ctx.lineTo(cx + vx * 500, cy - vy * 500);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawEigenLine(l1, '#ec4899');
    drawEigenLine(l2, '#10b981');
  }

  // 5. 绘制当前测试向量 x 与变换后向量 Ax
  const x0 = cx, y0 = cy;
  const x1 = cx + mouseX * scale;
  const y1 = cy - mouseY * scale;

  const ax = A * mouseX + B * mouseY;
  const ay = C * mouseX + D * mouseY;
  const x2 = cx + ax * scale;
  const y2 = cy - ay * scale;

  // 画向量 x (黄色)
  ctx.strokeStyle = '#fbbf24';
  ctx.fillStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.beginPath(); ctx.arc(x1, y1, 5, 0, Math.PI * 2); ctx.fill();

  // 画向量 Ax (青色)
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x2, y2, 6, 0, Math.PI * 2); ctx.fill();
}

updateMatrix();
setTimeout(resize, 100);
</script>
</body>
</html>`
}
