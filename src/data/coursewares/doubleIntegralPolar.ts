import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const doubleIntegralPolarCourseware: InteractiveCoursewareItem = {
  id: 'cw-double-integral-polar',
  title: '📐 二重积分极坐标变换面积微元 (r dr dθ) 几何实验室',
  domain: 'math',
  subject: '高等数学',
  difficulty: '每年必考大题',
  tags: ['考研数学', '高等数学', '二重积分', '极坐标', '面积微元', 'rdrdθ', '对称性'],
  summary: '交互式探究二重积分极坐标下 dxdy = r dr dθ 的几何物理内涵。通过在 Canvas 上动态调节扇形环微元的极角 dθ 与极径 dr，直观展现弧长为 r·dθ、微元面积矩形化为 (dr) × (r dθ) = r dr dθ，彻底告别公式死记硬背！',
  learningPoints: [
    '为什么必须多乘一个 r？因为极坐标下角度微元 dθ 对应的弧长是 r * dθ，半径越大弧长越长，因此面积微元 dA = (dr) * (r dθ) = r dr dθ',
    '适用场景：积分区域含有圆、圆环、扇形或被积函数含有 x^2 + y^2 时，首选极坐标变换',
    '极坐标穿线法：“射线穿入为下限 r_1(θ)，穿出为上限 r_2(θ)”；θ 的范围由区域包含的夹角确定',
    '对称性简化：若被积函数关于 x 或 y 具有奇偶性，或区域关于原点对称，善用二重积分奇偶对称性直接将结果降维或化为 0'
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
    --sector-color: #ec4899;
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
    accent-color: var(--accent);
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
  <h1><span>📐</span> 考研数学 · 二重积分极坐标面积微元几何实验室</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">高数大题必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">直观验证 dxdy = r dr dθ 的几何成因</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">调节微元位置与尺度</div>
      <div class="slider-box">
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span>极径 r:</span>
          <b id="rVal" style="color:var(--accent);">2.2</b>
        </div>
        <input type="range" id="rangeR" min="0.5" max="4.0" step="0.1" value="2.2" oninput="updateAll()">
      </div>

      <div class="slider-box" style="margin-top:6px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <span>极角 θ:</span>
          <b id="thetaVal" style="color:#fbbf24;">45°</b>
        </div>
        <input type="range" id="rangeTheta" min="0" max="90" step="1" value="45" oninput="updateAll()">
      </div>
    </div>

    <div class="controls-group">
      <div class="label">微元面积公式解析</div>
      <div class="formula-card" id="areaInfo">
        计算中...
      </div>
    </div>

    <div class="tips-card">
      <b>💡 考研高数秒杀解密：</b><br>
      • <b>扇形微元高</b> = dr<br>
      • <b>扇形微元底 (弧长)</b> = r · dθ（半径 r 越大，底边被拉得越长！）<br>
      • <b>微元面积</b> dA = 底 × 高 = (r dθ) × dr = <b>r dr dθ</b>！<br>
      • 永远不要漏掉被积函数里的那个因子 <b>r</b>！
    </div>
  </div>

  <div class="panel canvas-panel">
    <div style="position: absolute; top: 12px; left: 16px; z-index: 10; font-size: 11px; color: var(--text-secondary); background: rgba(18,24,39,0.85); padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border-color); display: flex; gap: 14px;">
      <span style="color: #ec4899;">● 粉色区域: 面积微元 dA = r dr dθ</span>
      <span style="color: #38bdf8;">● 蓝色射线: 极轴射线与穿线路径</span>
    </div>
    <canvas id="polarCanvas"></canvas>
  </div>
</div>

<script>
const canvas = document.getElementById('polarCanvas');
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

function updateAll() {
  const r = parseFloat(document.getElementById('rangeR').value);
  const th = parseFloat(document.getElementById('rangeTheta').value);
  document.getElementById('rVal').innerText = r.toFixed(1);
  document.getElementById('thetaVal').innerText = th + '°';

  const dr = 0.5;
  const dThetaRad = 0.25;
  const arcLength = (r * dThetaRad).toFixed(2);
  const area = (r * dr * dThetaRad).toFixed(3);

  document.getElementById('areaInfo').innerHTML = \`
    <div>• 径向微元高 dr = \${dr}</div>
    <div>• 弧长底边 r·dθ = \${r} × \${dThetaRad} = <b style="color:#fbbf24;">\${arcLength}</b></div>
    <div style="margin-top:4px; color:#ec4899; font-weight:bold;">微元面积 dA = r dr dθ ≈ \${area}</div>
  \`;
  draw();
}

function draw() {
  const w = logicW;
  const h = logicH;
  ctx.clearRect(0, 0, w, h);

  const cx = Math.max(36, Math.min(54, w * 0.12));
  const cy = h - Math.max(34, Math.min(48, h * 0.13));
  const scale = Math.min(82, Math.max(38, (Math.min(w - cx - 16, cy - 28)) / 5.1));

  // 1. 坐标轴
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(w - 20, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 20); ctx.stroke();

  // 极坐标同心圆弧网格
  ctx.strokeStyle = '#182030';
  ctx.lineWidth = 1;
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * scale, 0, -Math.PI / 2, true);
    ctx.stroke();
  }

  const r = parseFloat(document.getElementById('rangeR').value);
  const thDeg = parseFloat(document.getElementById('rangeTheta').value);
  const th = (thDeg * Math.PI) / 180;
  const dr = 0.5;
  const dTh = 0.25;

  // 2. 绘制微元环形面片 (粉色)
  ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(cx, cy, (r + dr) * scale, -th, -(th + dTh), true);
  ctx.arc(cx, cy, r * scale, -(th + dTh), -th, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. 绘制射线 (蓝色)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r + dr + 0.8) * scale * Math.cos(th), cy - (r + dr + 0.8) * scale * Math.sin(th));
  ctx.stroke();
  ctx.setLineDash([]);
}

updateAll();
setTimeout(resize, 100);
</script>
</body>
</html>`
}
