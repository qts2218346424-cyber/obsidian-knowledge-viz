import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const taylorApproxCourseware: InteractiveCoursewareItem = {
  id: 'cw-taylor-approx',
  title: '📐 考研高等数学 · 麦克劳林/泰勒多项式局部动态逼近',
  domain: 'math',
  subject: '高等数学',
  difficulty: '核心考点',
  tags: ['考研数学', '高等数学', '泰勒公式', '麦克劳林', '局部逼近', '佩亚诺余项', '极限'],
  summary: '调节多项式阶数 n（1 到 9 阶），在 Canvas 上实时对比 sin(x)、cos(x)、e^x 真实函数曲线与泰勒近似曲线，深刻直观理解佩亚诺余项 o(x^n) 的局部有效收敛半径与上下同阶展开做题准则。',
  learningPoints: [
    '泰勒公式本质：用多项式在局部点 x0 处逼近复杂函数的极限工具',
    '阶数 n 越高，拟合曲线与真实函数重合的区间越宽广',
    '考研求极限上下同阶原则：“分子分母展开到第一非零最低同阶项”',
    '经典易错点：差式中若首项相减抵消（如 x - sin(x)），必须向后展开到 x^3/6 方可保证精度'
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
    --real-func: #3b82f6;
    --taylor-func: #ec4899;
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
  select {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #fff;
    padding: 8px 10px;
    font-size: 13px;
    width: 100%;
    outline: none;
  }
  select:focus { border-color: var(--accent); }
  .slider-box {
    background: #080c14;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--taylor-func);
    cursor: pointer;
    margin-top: 6px;
  }
  .formula-card {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
    line-height: 1.6;
    font-family: monospace;
  }
  .tips-card {
    background: rgba(236, 72, 153, 0.08);
    border: 1px solid rgba(236, 72, 153, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #f472b6;
    line-height: 1.6;
  }
  canvas { width: 100%; height: 100%; }
</style>
</head>
<body>

<header>
  <h1><span>📐</span> 考研高数 · 泰勒/麦克劳林展开式动态逼近实验室</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">高数核心基础</span>
    <span style="font-size: 11px; color: var(--text-secondary);">佩亚诺余项 o(x^n) 的有效吻合范围直观验证</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">选择目标函数 f(x)</div>
      <select id="funcSelect" onchange="updateAll()">
        <option value="sin" selected>f(x) = sin(x)</option>
        <option value="cos">f(x) = cos(x)</option>
        <option value="exp">f(x) = e^x</option>
        <option value="ln">f(x) = ln(1 + x)</option>
      </select>
    </div>

    <div class="controls-group">
      <div class="label">调节展开阶数 n</div>
      <div class="slider-box">
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span>当前展开多项式最高阶:</span>
          <b id="nVal" style="color: var(--taylor-func); font-size: 14px;">3</b>
        </div>
        <input type="range" id="orderRange" min="1" max="9" step="1" value="3" oninput="updateAll()">
      </div>
    </div>

    <div class="controls-group">
      <div class="label">当前麦克劳林展开公式</div>
      <div class="formula-card" id="formulaBox">计算中...</div>
    </div>

    <div class="tips-card">
      <b>💡 考研高数求极限同阶原则：</b><br>
      • <b>首项抵消必展开</b>：若直接代等价无穷小导致相减为 0（如 x - sin(x)），必须向后多展一项得到 x - (x - x³/6) = x³/6！<br>
      • <b>上下同阶原则</b>：分母为 x^k 时，分子所有展开项必须齐刷刷保留到 x^k，更高阶项全部打包丢入 o(x^k) 中。
    </div>
  </div>

  <div class="panel canvas-panel">
    <div style="position: absolute; top: 12px; left: 16px; z-index: 10; font-size: 11px; color: var(--text-secondary); background: rgba(18,24,39,0.85); padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border-color); display: flex; gap: 14px;">
      <span style="color: #60a5fa;">● 蓝色曲线: 真实函数 f(x)</span>
      <span style="color: #f472b6;">● 粉色曲线: n阶泰勒多项式 P_n(x)</span>
    </div>
    <canvas id="mathCanvas"></canvas>
  </div>
</div>

<script>
const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');

let logicW = 400, logicH = 320;
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

function factorial(k) {
  let res = 1;
  for (let i = 2; i <= k; i++) res *= i;
  return res;
}

function getTaylorSin(x, n) {
  let sum = 0;
  for (let k = 1; k <= n; k += 2) {
    const sign = ((k - 1) / 2) % 2 === 0 ? 1 : -1;
    sum += sign * Math.pow(x, k) / factorial(k);
  }
  return sum;
}

function getTaylorCos(x, n) {
  let sum = 0;
  for (let k = 0; k <= n; k += 2) {
    const sign = (k / 2) % 2 === 0 ? 1 : -1;
    sum += sign * Math.pow(x, k) / factorial(k);
  }
  return sum;
}

function getTaylorExp(x, n) {
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    sum += Math.pow(x, k) / factorial(k);
  }
  return sum;
}

function getTaylorLn(x, n) {
  let sum = 0;
  for (let k = 1; k <= n; k++) {
    const sign = (k - 1) % 2 === 0 ? 1 : -1;
    sum += sign * Math.pow(x, k) / k;
  }
  return sum;
}

function updateAll() {
  const n = parseInt(document.getElementById('orderRange').value, 10);
  document.getElementById('nVal').innerText = n;
  const fType = document.getElementById('funcSelect').value;

  const fBox = document.getElementById('formulaBox');
  if (fType === 'sin') {
    let s = 'sin(x) ≈ x';
    if (n >= 3) s += ' - x³/6';
    if (n >= 5) s += ' + x⁵/120';
    if (n >= 7) s += ' - x⁷/5040';
    if (n >= 9) s += ' + x⁹/362880';
    s += ' + o(x^' + n + ')';
    fBox.innerHTML = s;
  } else if (fType === 'cos') {
    let s = 'cos(x) ≈ 1';
    if (n >= 2) s += ' - x²/2';
    if (n >= 4) s += ' + x⁴/24';
    if (n >= 6) s += ' - x⁶/720';
    if (n >= 8) s += ' + x⁸/40320';
    s += ' + o(x^' + n + ')';
    fBox.innerHTML = s;
  } else if (fType === 'exp') {
    let s = 'e^x ≈ 1 + x';
    if (n >= 2) s += ' + x²/2';
    if (n >= 3) s += ' + x³/6';
    if (n >= 4) s += ' + x⁴/24';
    if (n >= 5) s += ' + ... + x^' + n + '/' + n + '!';
    s += ' + o(x^' + n + ')';
    fBox.innerHTML = s;
  } else {
    let s = 'ln(1+x) ≈ x';
    if (n >= 2) s += ' - x²/2';
    if (n >= 3) s += ' + x³/3';
    if (n >= 4) s += ' - x⁴/4';
    if (n >= 5) s += ' + ...';
    s += ' + o(x^' + n + ')';
    fBox.innerHTML = s;
  }
  draw();
}

function draw() {
  const w = logicW;
  const h = logicH;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scale = Math.min(62, Math.max(34, Math.min(w / 8.5, h / 6.5)));

  // 1. 背景网格
  ctx.strokeStyle = '#182030';
  ctx.lineWidth = 1;
  for (let x = cx % scale; x < w; x += scale) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = cy % scale; y < h; y += scale) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. 坐标轴
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  const fType = document.getElementById('funcSelect').value;
  const n = parseInt(document.getElementById('orderRange').value, 10);

  // 3. 画真实函数曲线 (蓝色)
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  let first = true;
  for (let px = 0; px < w; px += 2) {
    const x = (px - cx) / scale;
    let y = 0;
    if (fType === 'sin') y = Math.sin(x);
    else if (fType === 'cos') y = Math.cos(x);
    else if (fType === 'exp') y = Math.exp(x);
    else if (fType === 'ln') {
      if (x <= -1) continue;
      y = Math.log(1 + x);
    }
    const py = cy - y * scale;
    if (first) { ctx.moveTo(px, py); first = false; }
    else { ctx.lineTo(px, py); }
  }
  ctx.stroke();

  // 4. 画泰勒展开多项式曲线 (粉色)
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  first = true;
  for (let px = 0; px < w; px += 2) {
    const x = (px - cx) / scale;
    let y = 0;
    if (fType === 'sin') y = getTaylorSin(x, n);
    else if (fType === 'cos') y = getTaylorCos(x, n);
    else if (fType === 'exp') y = getTaylorExp(x, n);
    else if (fType === 'ln') y = getTaylorLn(x, n);

    const py = cy - y * scale;
    if (py < -200 || py > h + 200) {
      first = true;
      continue;
    }
    if (first) { ctx.moveTo(px, py); first = false; }
    else { ctx.lineTo(px, py); }
  }
  ctx.stroke();
}

updateAll();
setTimeout(resize, 100);
</script>
</body>
</html>`
}
