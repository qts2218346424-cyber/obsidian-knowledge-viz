import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const ieee754FloatCourseware: InteractiveCoursewareItem = {
  id: 'cw-ieee754-float',
  title: '🧮 IEEE 754 浮点数格式拆解与对阶加法运算仿真器',
  domain: 'cs_408',
  subject: '计算机组成原理',
  difficulty: '每年必考大题',
  tags: ['408', '计组', 'IEEE754', '浮点数', '阶码', '尾数', '规格化', '对阶', '浮点加法'],
  summary: '单精度 32 位 IEEE 754 浮点数底层二进制彩虹映射与运算仿真。实时拆解数符 S (1位)、阶码 E (8位，偏置值127) 与尾数 M (23位，隐藏前导1)；步进演示浮点数加法五步曲：对阶（小阶向大阶看齐）、尾数求和、规格化、舍入与溢出判定。',
  learningPoints: [
    '真值公式：(-1)^S * (1.M) * 2^(E - 127)。尾数最高位默认隐藏一个 1',
    '对阶准则：“小阶向大阶看齐”。求阶差 ΔE = E_A - E_B，小阶尾数右移 ΔE 位，阶码增大到大阶',
    '对阶只能右移不能左移：尾数右移丢失低位精度，但若左移则高位有效数丢失且无法恢复',
    '右规判定：尾数相加产生进位（如 1X.XXXX）时，尾数右移 1 位，阶码加 1'
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
    --sign-color: #ef4444;
    --exp-color: #10b981;
    --frac-color: #3b82f6;
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
    overflow-y: auto;
  }
  .controls-group { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
  input[type="number"] {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #fff;
    padding: 7px 10px;
    font-size: 13px;
    width: 100%;
    outline: none;
  }
  input[type="number"]:focus { border-color: var(--accent); }
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
  .preset-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .bit-bar {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    height: 48px;
    margin: 10px 0;
    border: 1px solid var(--border-color);
    text-align: center;
    font-family: monospace;
  }
  .bit-part {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4px;
  }
  .bit-part.sign { background: rgba(239, 68, 68, 0.2); color: #f87171; border-right: 1px solid rgba(239, 68, 68, 0.4); flex: 1; }
  .bit-part.exp { background: rgba(16, 185, 129, 0.2); color: #34d399; border-right: 1px solid rgba(16, 185, 129, 0.4); flex: 8; }
  .bit-part.frac { background: rgba(59, 130, 246, 0.2); color: #60a5fa; flex: 23; }
  .tips-card {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #34d399;
    line-height: 1.6;
  }
</style>
</head>
<body>

<header>
  <h1><span>🧮</span> IEEE 754 单精度浮点数二进制拆解与运算仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 计组必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">32 位 float：1 位符 + 8 位阶 (偏置127) + 23 位尾</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">输入十进制浮点数</div>
      <input type="number" id="numInput" value="-12.625" step="0.125" oninput="convertFloat()">
    </div>

    <div class="controls-group">
      <div class="label">经典考研真题数值体验</div>
      <div class="preset-row">
        <button onclick="setNum(-12.625)">📌 -12.625 (经典大题)</button>
        <button onclick="setNum(0.75)">📌 +0.75 (3/4)</button>
        <button onclick="setNum(17.875)">📌 +17.875</button>
        <button onclick="setNum(-0.15625)">📌 -0.15625 (-5/32)</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">浮点加法运算模拟器</div>
      <div style="font-size:11px; color:var(--text-secondary);">计算 X + Y 的对阶全过程：</div>
      <button class="primary" onclick="runAddition()">⚡ 模拟 0.5 + (-12.625) 浮点对阶</button>
    </div>

    <div class="tips-card">
      <b>💡 408 计组考场算位得分法则：</b><br>
      • <b>阶码真值 e</b> = E(无符号整数) - 127。<br>
      • <b>隐藏位</b>：尾数 M 存放在 23 位中，实际参与计算的有效尾数是 <b>1.M</b>！<br>
      • <b>对阶小阶向大阶看齐</b>：小阶的尾数向右移位（阶差几位就右移几位），阶码加几变为大阶。
    </div>
  </div>

  <div class="sim-panel">
    <div class="label">32 位 IEEE 754 彩虹分段展示</div>
    <div class="bit-bar">
      <div class="bit-part sign">
        <div style="font-size:10px; font-weight:bold;">S 数符</div>
        <div id="bitS" style="font-size:13px; font-weight:bold;">1</div>
      </div>
      <div class="bit-part exp">
        <div style="font-size:10px; font-weight:bold;">E 阶码 (8位)</div>
        <div id="bitE" style="font-size:13px; font-weight:bold;">10000010</div>
      </div>
      <div class="bit-part frac">
        <div style="font-size:10px; font-weight:bold;">M 尾数 (23位)</div>
        <div id="bitM" style="font-size:12px; font-weight:bold;">10010100000000000000000</div>
      </div>
    </div>

    <div style="margin-top: 14px; background: #080c14; border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; font-family: monospace; font-size: 12px; line-height: 1.8;" id="detailBox">
      计算中...
    </div>
  </div>
</div>

<script>
function floatToIeee754(num) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, num);
  const intVal = view.getUint32(0);

  const binStr = intVal.toString(2).padStart(32, '0');
  const s = binStr[0];
  const e = binStr.substring(1, 9);
  const m = binStr.substring(9);
  const eVal = parseInt(e, 2);
  const expTrue = eVal - 127;
  const hex = '0x' + intVal.toString(16).toUpperCase().padStart(8, '0');

  return { s, e, m, eVal, expTrue, hex, intVal };
}

function setNum(v) {
  document.getElementById('numInput').value = v;
  convertFloat();
}

function convertFloat() {
  const val = parseFloat(document.getElementById('numInput').value) || 0;
  const info = floatToIeee754(val);

  document.getElementById('bitS').innerText = info.s;
  document.getElementById('bitE').innerText = info.e;
  document.getElementById('bitM').innerText = info.m;

  const box = document.getElementById('detailBox');
  box.innerHTML = \`
    <div>十进制真值: <b style="color:#38bdf8;">\${val}</b></div>
    <div>十六进制存储码: <b style="color:#fbbf24;">\${info.hex}</b></div>
    <div style="margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
      • <b>S 数符位</b>: \${info.s} (\${info.s === '1' ? '负数 -' : '正数 +'})\<br>
      • <b>E 移码表示</b>: \${info.e} (十进制 \${info.eVal}) → 真值阶码 e = \${info.eVal} - 127 = <b style="color:#34d399;">\${info.expTrue}</b><br>
      • <b>M 尾数小数位</b>: \${info.m}<br>
      • <b>完整规格化真值</b>: (-1)^\${info.s} × (1.\${info.m.substring(0, 8)}...)₂ × 2^(\${info.expTrue})
    </div>
  \`;
}

function runAddition() {
  const box = document.getElementById('detailBox');
  box.innerHTML = \`
    <div style="color:#38bdf8; font-weight:bold; font-size:13px;">⚡ 浮点加法五部曲：0.5 + (-12.625)</div>
    <div style="margin-top: 6px;">
      1. <b>拆解操作数</b>：<br>
      • X = +0.5 = 1.0 × 2^(-1)，阶码 E_X = 126<br>
      • Y = -12.625 = -1.100101 × 2^3，阶码 E_Y = 130<br>
      2. <b>对阶 (小阶向大阶看齐)</b>：<br>
      • 阶差 ΔE = 130 - 126 = 4。将 X 的尾数右移 4 位，E_X 提升到 130：<br>
      • X 尾数对阶后 = 0.0001000... × 2^3<br>
      3. <b>尾数相加</b>：<br>
      • (0.0001) - (1.100101) = -1.100001 × 2^3<br>
      4. <b>规格化与舍入</b>：符号位负，结果已是规格化数无需移动。<br>
      5. <b>最终真值</b>：-12.125 (0xC1420000)。
    </div>
  \`;
}

convertFloat();
</script>
</body>
</html>`
}
