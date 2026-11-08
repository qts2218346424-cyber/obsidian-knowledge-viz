import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const normalDistribution2DCourseware: InteractiveCoursewareItem = {
  id: 'cw-normal-2d',
  title: '📊 二维正态分布等高线与相关系数 (ρ) 动态实验室',
  domain: 'math',
  subject: '概率论与数理统计',
  difficulty: '核心大题考点',
  tags: ['考研数学', '概率论', '二维正态分布', '相关系数', '独立性', '等高线', '协方差'],
  summary: '直观揭开二维正态分布 N(μ1, μ2, σ1², σ2², ρ) 的几何投影图景！通过滑块动态调节相关系数 ρ（-0.95 到 +0.95），Canvas 实时绘制概率密度曲面的等高线倾斜椭圆族，直观验证当且仅当 ρ=0 时椭圆主轴垂直于坐标轴、两随机变量相互独立！',
  learningPoints: [
    '核心几何对应：ρ > 0 时等高线椭圆主轴沿一三象限倾斜（正相关）；ρ < 0 时沿二四象限倾斜（负相关）',
    '二维正态分布独特性质：对于二维正态分布而言，【X 与 Y 相互独立】充要等价于【X 与 Y 不相关 (ρ = 0)】！',
    '当 ρ = 0 且 σ1 = σ2 时，等高线由椭圆退化为完美的同心圆，代表全向同性无偏独立分布',
    '边缘分布性质：二维正态分布的边缘分布必定是一维正态分布 X ~ N(μ1, σ1²)，反之不成立（边缘正态不代表联合正态）'
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
    --ellipse-color: #ec4899;
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
  .slider-box {
    background: #080c14;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--ellipse-color);
    cursor: pointer;
    margin-top: 4px;
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
  <h1><span>📊</span> 考研概率论 · 二维正态分布等高线与相关系数仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">概率论必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">ρ=0 与 X,Y 相互独立的充要几何印证</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">调节相关系数 ρ (-1 &lt; ρ &lt; 1)</div>
      <div class="slider-box">
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span>相关系数 ρ:</span>
          <b id="rhoVal" style="color:var(--ellipse-color); font-size:14px;">0.65</b>
        </div>
        <input type="range" id="rangeRho" min="-0.95" max="0.95" step="0.05" value="0.65" oninput="updateAll()">
      </div>
    </div>

    <div class="controls-group">
      <div class="label">快捷预设状态一键切换</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <button onclick="setRho(0)" style="background:#1e293b; color:#fff; border:1px solid var(--border-color); padding:6px; border-radius:6px; font-size:11px; cursor:pointer;">🟢 ρ = 0 (独立正圆)</button>
        <button onclick="setRho(0.8)" style="background:#1e293b; color:#fff; border:1px solid var(--border-color); padding:6px; border-radius:6px; font-size:11px; cursor:pointer;">📈 ρ = +0.8 (强正相关)</button>
        <button onclick="setRho(-0.8)" style="background:#1e293b; color:#fff; border:1px solid var(--border-color); padding:6px; border-radius:6px; font-size:11px; cursor:pointer;">📉 ρ = -0.8 (强负相关)</button>
        <button onclick="setRho(0.95)" style="background:#1e293b; color:#fff; border:1px solid var(--border-color); padding:6px; border-radius:6px; font-size:11px; cursor:pointer;">⚡ ρ → 1 (线形退化)</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">二维概率密度等高方程</div>
      <div class="formula-card" id="rhoInfo">
        计算中...
      </div>
    </div>

    <div class="tips-card">
      <b>💡 考研概率论必背黄金定理：</b><br>
      • <b>一般二维随机变量</b>：独立 ⇒ 不相关 (Cov=0, ρ=0)；但不相关 ⇏ 独立！<br>
      • <b>二维正态随机变量 (特权)</b>：<b>相互独立 ⟺ 不相关 (ρ = 0)！</b><br>
      • 在等高线图上，当且仅当 ρ = 0 时，椭圆对称轴平行于 x、y 坐标轴，互不干扰！
    </div>
  </div>

  <div class="panel canvas-panel">
    <div style="position: absolute; top: 12px; left: 16px; z-index: 10; font-size: 11px; color: var(--text-secondary); background: rgba(18,24,39,0.85); padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
      ● 概率密度曲面投影等高线族：高度 f(x,y) = const 对应的等概率椭圆环
    </div>
    <canvas id="normCanvas"></canvas>
  </div>
</div>

<script>
const canvas = document.getElementById('normCanvas');
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

function setRho(v) {
  document.getElementById('rangeRho').value = v;
  updateAll();
}

function updateAll() {
  const rho = parseFloat(document.getElementById('rangeRho').value);
  document.getElementById('rhoVal').innerText = rho.toFixed(2);

  const info = document.getElementById('rhoInfo');
  let stateDesc = '';
  if (Math.abs(rho) < 0.05) {
    stateDesc = '<span style="color:#10b981; font-weight:bold;">✅ X 与 Y 不相关 ⟺ 相互独立！</span>';
  } else if (rho > 0) {
    stateDesc = '<span style="color:#ec4899;">正相关：Y 随 X 同步增大，长轴倾角 45°</span>';
  } else {
    stateDesc = '<span style="color:#38bdf8;">负相关：Y 随 X 反向减小，长轴倾角 135°</span>';
  }

  info.innerHTML = \`
    <div>• 协方差 Cov(X, Y) = \${(rho * 1.0 * 1.0).toFixed(2)}</div>
    <div>• 状态判定: \${stateDesc}</div>
    <div style="color:var(--text-secondary); margin-top:4px; font-size:11px;">
      指数项 Q(x,y) = [x² - 2ρxy + y²] / (1 - ρ²)
    </div>
  \`;
  draw();
}

function draw() {
  const w = logicW;
  const h = logicH;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scale = Math.min(54, Math.max(28, Math.min(w, h) / 7.2));

  // 1. 坐标轴
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  const rho = parseFloat(document.getElementById('rangeRho').value);

  // 2. 绘制 4 层同心等高线椭圆
  const levels = [1.0, 1.8, 2.6, 3.4];
  const rotAngle = Math.PI / 4; // 对称情况旋转 45 度

  levels.forEach((c, idx) => {
    ctx.save();
    ctx.translate(cx, cy);

    // 倾角为 45° 或 135°
    if (rho >= 0) {
      ctx.rotate(-rotAngle);
    } else {
      ctx.rotate(rotAngle);
    }

    // 椭圆半长轴与半短轴
    const a = c * Math.sqrt(1 + Math.abs(rho)) * scale * 0.7;
    const b = c * Math.sqrt(Math.max(1 - Math.abs(rho), 0.05)) * scale * 0.7;

    ctx.beginPath();
    ctx.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);

    ctx.strokeStyle = \`rgba(236, 72, 153, \${0.85 - idx * 0.15})\`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = \`rgba(236, 72, 153, \${0.08 - idx * 0.015})\`;
    ctx.fill();

    ctx.restore();
  });
}

updateAll();
setTimeout(resize, 100);
</script>
</body>
</html>`
}
