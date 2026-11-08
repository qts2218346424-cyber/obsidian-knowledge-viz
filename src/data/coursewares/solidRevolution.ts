import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const solidRevolutionCourseware: InteractiveCoursewareItem = {
  id: 'cw-solid-revolution',
  title: '🌀 定积分几何应用：旋转体体积（圆盘法 vs 柱壳法）动态实验室',
  domain: 'math',
  subject: '高等数学',
  difficulty: '每年必考大题',
  tags: ['考研数学', '高等数学', '定积分应用', '旋转体体积', '圆盘法', '柱壳法', '微元法', '切片积分'],
  summary: '考研高数必考大题“旋转体体积与侧面积”全景动态仿真。可视化展示绕 x 轴或绕 y 轴旋转生成的立体形状；支持在“圆盘切片微元法 (Disc Method)”与“同心柱壳微元法 (Shell Method)”之间平滑切换与动画剖切，直观透析微元 dV 的几何本质。',
  learningPoints: [
    '微元法思想：以直代曲、无限分割、积分求和',
    '圆盘切片法（微元垂直于旋转轴）：绕 x 轴旋转时，微元体积 dV = π [f(x)]² dx；绕 y 轴旋转时，dV = π [g(y)]² dy',
    '柱壳法（微元平行于旋转轴）：绕 y 轴旋转但被积函数为 y = f(x) 时，展开后底面周长 2πx、高 f(x)、厚度 dx，微元 dV = 2πx f(x) dx',
    '考场选法秘诀：如果函数改写为反函数 x = g(y) 极其困难（如 y = x·sin(x) 或三次方程），果断采用柱壳法！'
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
    --cyan: #06b6d4;
    --emerald: #10b981;
    --amber: #f59e0b;
    --rose: #f43f5e;
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
  select, input[type="range"] { width: 100%; accent-color: var(--accent); }
  select {
    background: #0f172a;
    border: 1px solid var(--border-color);
    color: #fff;
    padding: 8px;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
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
  button.primary { background: #0284c7; border-color: #38bdf8; color: #fff; }
  button.primary:hover { background: #0369a1; }
  .btn-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

  .formula-card {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    font-family: serif;
    font-size: 13px;
    line-height: 1.6;
    color: #e2e8f0;
  }
  .formula-card b { color: #38bdf8; font-family: sans-serif; }

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
  <h1>🌀 考研高数 · 旋转体体积（圆盘法 vs 柱壳法）动态实验室 <span class="badge">全国统考核心大题</span></h1>
  <div style="font-size:12px; color:#94a3b8;">定积分几何应用 · 微元剖切透视</div>
</header>

<div class="layout">
  <!-- 左侧控制面板 -->
  <div class="panel">
    <div class="ctrl-label">典型考题母题函数</div>
    <select id="funcSelect">
      <option value="parabola">母题 1: y = x² (0 ≤ x ≤ 2)</option>
      <option value="sqrt">母题 2: y = √x (0 ≤ x ≤ 4)</option>
      <option value="sin">母题 3: y = sin(x) (0 ≤ x ≤ π)</option>
      <option value="linear">母题 4: y = 2 - x (0 ≤ x ≤ 2)</option>
    </select>

    <div class="ctrl-label">旋转轴与切片法则</div>
    <select id="methodSelect">
      <option value="disc_x">圆盘切片法 (绕 X 轴旋转, dV = π y² dx)</option>
      <option value="shell_y">同心柱壳法 (绕 Y 轴旋转, dV = 2π x y dx)</option>
    </select>

    <div>
      <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
        <span class="ctrl-label">切片微元数量 N: <b id="nVal" style="color:#38bdf8;">16</b></span>
      </div>
      <input type="range" id="nSlider" min="4" max="64" value="16">
    </div>

    <div>
      <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
        <span class="ctrl-label">旋转展开角度: <b id="angleVal" style="color:#10b981;">360°</b></span>
      </div>
      <input type="range" id="angleSlider" min="30" max="360" value="360">
    </div>

    <!-- 积分推导公式卡片 -->
    <div class="formula-card" id="formulaCard">
      <b>📐 理论精确体积计算：</b><br>
      <span id="formulaDetail">V = π ∫₀² (x²)² dx = π [x⁵/5]₀² = 32π/5 ≈ 20.106</span>
    </div>

    <div class="tip-card">
      <b>💡 考场秒杀选法法则：</b><br>
      1. <b>切片垂直于轴用圆盘</b>：绕 x 轴积分选 dx，微元是圆盘薄片；<br>
      2. <b>切片平行于轴用柱壳</b>：绕 y 轴积分仍对 x 积分选 dx，微元展开是矩形薄片（长 $2\pi x$、宽 $y$、厚 $dx$）；<br>
      3. 柱壳法极大化解了反函数难求的积分绝境！
    </div>
  </div>

  <!-- 右侧立体画布舞台 -->
  <div class="sim-panel">
    <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; justify-content:space-between; flex-shrink:0;">
      <span>🎬 旋转立体伪 3D 透视投影与微元薄片</span>
      <span id="numericVolume" style="color:#10b981;">黎曼和近似体积: 计算中...</span>
    </div>

    <div style="flex:1; min-height:0; position:relative;">
      <canvas id="viewCanvas"></canvas>
    </div>

    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:10px; font-size:12px; color:#cbd5e1; flex-shrink:0;">
      <b style="color:#38bdf8;">📝 几何直观透析：</b>
      <span id="explanation">当前使用圆盘切片法，将区间均分为 N 个小区间，每个小区间绕 X 轴扫出一个半径为 f(x) 的圆柱薄片，体积总和即为旋转体体积的黎曼和逼近。</span>
    </div>
  </div>
</div>

<script>
  const canvas = document.getElementById("viewCanvas");
  const ctx = canvas.getContext("2d");

  let logicW = 420, logicH = 320;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    logicW = canvas.clientWidth || canvas.parentElement.clientWidth || 360;
    logicH = canvas.clientHeight || canvas.parentElement.clientHeight || 300;
    canvas.width = Math.round(logicW * dpr);
    canvas.height = Math.round(logicH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  window.addEventListener("resize", resize);

  function getFunc(type) {
    if (type === "parabola") return { f: (x) => x * x, a: 0, b: 2, name: "y = x²", exactV_x: Math.PI * 32 / 5, exactV_y: 2 * Math.PI * 4 };
    if (type === "sqrt") return { f: (x) => Math.sqrt(x), a: 0, b: 4, name: "y = √x", exactV_x: Math.PI * 8, exactV_y: 2 * Math.PI * 128 / 15 };
    if (type === "sin") return { f: (x) => Math.sin(x), a: 0, b: Math.PI, name: "y = sin(x)", exactV_x: Math.PI * Math.PI / 2, exactV_y: 2 * Math.PI * Math.PI };
    return { f: (x) => 2 - x, a: 0, b: 2, name: "y = 2 - x", exactV_x: Math.PI * 8 / 3, exactV_y: 2 * Math.PI * 4 / 3 };
  }

  function draw() {
    const w = logicW, h = logicH;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.36, cy = h * 0.55;

    const funcType = document.getElementById("funcSelect").value;
    const method = document.getElementById("methodSelect").value;
    const n = parseInt(document.getElementById("nSlider").value);
    const rotAngle = parseInt(document.getElementById("angleSlider").value) * Math.PI / 180;

    const cfg = getFunc(funcType);
    const a = cfg.a, b = cfg.b;
    const dx = (b - a) / n;

    // 绘制坐标轴 (倾斜 3D 轴)
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    // X 轴
    ctx.beginPath(); ctx.moveTo(cx - 200, cy); ctx.lineTo(cx + 250, cy); ctx.stroke();
    // Y 轴
    ctx.beginPath(); ctx.moveTo(cx, cy + 180); ctx.lineTo(cx, cy - 200); ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "11px monospace";
    ctx.fillText("X", cx + 255, cy + 4);
    ctx.fillText("Y", cx + 4, cy - 205);

    const scaleX = Math.min(80, Math.max(36, w * 0.135));
    const scaleY = Math.min(70, Math.max(32, h * 0.18));

    let riemannSum = 0;

    if (method === "disc_x") {
      // 圆盘切片法绕 X 轴
      for (let i = 0; i < n; i++) {
        const xMid = a + (i + 0.5) * dx;
        const radius = cfg.f(xMid);
        const diskV = Math.PI * radius * radius * dx;
        riemannSum += diskV;

        const px = cx + xMid * scaleX;
        const ry = radius * scaleY;
        const rx = ry * 0.35; // 椭圆透视压缩比

        // 绘制圆盘切片
        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.ellipse(px, cy, rx, ry, 0, 0, rotAngle);
        ctx.fill();
        ctx.stroke();

        // 边缘轮廓
        ctx.beginPath();
        ctx.moveTo(px, cy - ry);
        ctx.lineTo(px + dx * scaleX * 0.7, cy - ry);
        ctx.stroke();
      }

      document.getElementById("formulaDetail").innerHTML = \`V = π ∫ \${cfg.name}² dx<br>理论精确值: \${cfg.exactV_x.toFixed(4)}<br>当前黎曼和: \${riemannSum.toFixed(4)}\`;
      document.getElementById("explanation").innerText = \`圆盘法：切片垂直于 X 轴。将区间 [\${a}, \${b}] 切割为 \${n} 个圆柱薄片，每个圆盘半径为 y = f(x)，厚度为 dx。\`;
    } else {
      // 柱壳法绕 Y 轴
      for (let i = 0; i < n; i++) {
        const xMid = a + (i + 0.5) * dx;
        const height = cfg.f(xMid);
        const shellV = 2 * Math.PI * xMid * height * dx;
        riemannSum += shellV;

        const rx = xMid * scaleX;
        const ry = rx * 0.35;
        const sh = height * scaleY;

        ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
        ctx.lineWidth = 1.2;

        // 绘制柱壳底圆
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, rotAngle);
        ctx.stroke();

        // 绘制柱壳顶圆
        ctx.beginPath();
        ctx.ellipse(cx, cy - sh, rx, ry, 0, 0, rotAngle);
        ctx.stroke();

        // 母线
        ctx.beginPath();
        ctx.moveTo(cx + rx, cy);
        ctx.lineTo(cx + rx, cy - sh);
        ctx.stroke();
      }

      document.getElementById("formulaDetail").innerHTML = \`V = 2π ∫ x · (\${cfg.name}) dx<br>理论精确值: \${cfg.exactV_y.toFixed(4)}<br>当前黎曼和: \${riemannSum.toFixed(4)}\`;
      document.getElementById("explanation").innerText = \`柱壳法：切片平行于 Y 轴（旋转轴）。底面圆周长 2πx，高度 y = f(x)，薄壳厚度 dx。展开为长方体薄片积分！\`;
    }

    document.getElementById("numericVolume").innerText = \`黎曼和近似体积: \${riemannSum.toFixed(4)}\`;
  }

  document.getElementById("nSlider").addEventListener("input", (e) => {
    document.getElementById("nVal").innerText = e.target.value;
    draw();
  });
  document.getElementById("angleSlider").addEventListener("input", (e) => {
    document.getElementById("angleVal").innerText = e.target.value + "°";
    draw();
  });
  document.getElementById("funcSelect").addEventListener("change", draw);
  document.getElementById("methodSelect").addEventListener("change", draw);

  setTimeout(resize, 50);
</script>
</body>
</html>`
}
