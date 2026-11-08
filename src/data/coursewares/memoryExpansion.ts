import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const memoryExpansionCourseware: InteractiveCoursewareItem = {
  id: 'cw-memory-expansion',
  title: '💾 存储器扩展：字位扩展与 74LS138 译码器片选逻辑实验室',
  domain: 'cs_408',
  subject: '计算机组成原理',
  difficulty: '高频大题与核心设计',
  tags: ['408', '计算机组成原理', '存储系统', '存储器扩展', '位扩展', '字扩展', '74LS138', '译码器', '片选信号'],
  summary: '计算机硬件经典设计题存储器扩展与 74LS138 译码器电路全景动态仿真。直观演示位扩展数据线拼接、字扩展高位地址线片选译码、使能端 G1/G2A/G2B 逻辑与芯片矩阵阵列实时寻址点亮，攻克 408 计组芯片连接图终极难关。',
  learningPoints: [
    '位扩展：芯片字数相同但位数不足，数据线分别连接（如两片 4 位芯片并联接 D0~D3 和 D4~D7），地址线和片选线并联',
    '字扩展：芯片位数相同但字数不足，高位地址线通过译码器（如 74LS138）产生片选信号 CS，分时选通不同芯片组',
    '74LS138 译码器工作条件：使能端 G1=1，~G2A=0，~G2B=0；由 C,B,A 三位二进制输入译出 8 选 1 低电平有效输出 (~Y0 ~ ~Y7)',
    '芯片总数计算法则：总片数 = (目标容量 / 芯片容量) = (目标字数/芯片字数) × (目标位数/芯片位数)'
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
    --chip-bg: #1e293b;
    --chip-active: #047857;
    --wire: #64748b;
    --wire-active: #38bdf8;
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
    gap: 14px;
  }
  .input-group { display: flex; flex-direction: column; gap: 6px; }
  label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
  input[type="text"] {
    background: #0b0f19;
    border: 1px solid var(--border-color);
    color: #38bdf8;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 15px;
    font-weight: 700;
    outline: none;
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

  /* 74LS138 与电路可视化 */
  .circuit-box {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 16px;
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 16px;
  }

  .chip-138 {
    background: #1e293b;
    border: 2px solid #475569;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }
  .chip-138-title {
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    color: #f59e0b;
    border-bottom: 1px solid #334155;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .pin-row {
    display: flex;
    justify-content: space-between;
    font-family: monospace;
    font-size: 11px;
    margin: 3px 0;
  }
  .pin-active { color: #38bdf8; font-weight: 700; }
  .pin-out-low { color: #10b981; font-weight: 700; text-shadow: 0 0 8px rgba(16,185,129,0.8); }

  /* 存储芯片矩阵 */
  .mem-matrix {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 8px;
  }
  .mem-chip {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 6px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 11px;
    position: relative;
    transition: all 0.2s ease;
  }
  .mem-chip.active {
    background: rgba(16,185,129,0.25);
    border-color: #10b981;
    box-shadow: 0 0 12px rgba(16,185,129,0.4);
  }
  .mem-chip .chip-name { font-weight: 700; color: #cbd5e1; }
  .mem-chip.active .chip-name { color: #34d399; }
  .mem-chip .chip-cs { font-size: 9px; color: #64748b; font-family: monospace; }
  .mem-chip.active .chip-cs { color: #10b981; font-weight: 700; }

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
  <h1>💾 408 计组 · 存储器字位扩展与 74LS138 译码器逻辑仿真器 <span class="badge">全国统考核心电路题</span></h1>
  <div style="font-size:12px; color:#94a3b8;">以 8 片 8K×4位 芯片组成 32K×8位 主存系统为例</div>
</header>

<div class="layout">
  <!-- 左侧控制器 -->
  <div class="panel">
    <div class="input-group">
      <label>16位 CPU 访存地址 (Hex)</label>
      <input type="text" id="addrInput" value="0x4520">
    </div>

    <div class="btn-row">
      <button class="primary" id="btnAccess">⚡ 产生片选寻址</button>
      <button id="btnReset">↺ 重置测试</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <label>📌 典型真题地址快速测试</label>
      <button id="btnCase0">芯片组 0: 0x0100 (0000H~1FFFH)</button>
      <button id="btnCase1">芯片组 1: 0x2400 (2000H~3FFFH)</button>
      <button id="btnCase2">芯片组 2: 0x4800 (4000H~5FFFH)</button>
      <button id="btnCase3">芯片组 3: 0x6C00 (6000H~7FFFH)</button>
    </div>

    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:10px; font-size:12px;">
      <div style="font-weight:700; color:#38bdf8; margin-bottom:6px;">📐 芯片矩阵规格速算</div>
      <div>目标容量: <b style="color:#e2e8f0;">32K × 8 位 (32KB)</b></div>
      <div>芯片规格: <b style="color:#e2e8f0;">8K × 4 位</b></div>
      <div>位扩展倍数: 8位 / 4位 = <b style="color:#10b981;">2 列 (并联)</b></div>
      <div>字扩展倍数: 32K / 8K = <b style="color:#38bdf8;">4 行 (级联)</b></div>
      <div>总芯片数: 4 × 2 = <b style="color:#a855f7; font-size:14px;">8 片</b></div>
    </div>

    <div class="tip-card">
      <b>💡 408 考场连线大题口诀：</b><br>
      1. <b>片内寻址线</b>：单片 $8K = 2^{13}$，故低 13 位 $A_{12} \sim A_0$ 并联直通每片芯片；<br>
      2. <b>片选译码线</b>：高位 $A_{14}, A_{13}$（加接 $A_{15}=0$）接入 74LS138 译码器输入端 C, B, A；<br>
      3. <b>数据线</b>：位扩展必须将两片的数据引脚分别接 CPU 数据总线 $D_7 \sim D_4$ 与 $D_3 \sim D_0$！
    </div>
  </div>

  <!-- 右侧电路仿真舞台 -->
  <div class="sim-panel">
    <!-- 地址总线拆解卡 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:10px; padding:12px;">
      <div style="font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:8px;">
        1️⃣ 地址总线 A15~A0 信号拆解
      </div>
      <div style="display:flex; border:1px solid #1f293d; border-radius:6px; overflow:hidden; font-family:monospace; text-align:center;">
        <div style="flex:1; background:rgba(239,68,68,0.15); padding:8px; border-right:1px solid #1f293d;">
          <div style="font-size:10px; color:#f87171;">A15 (高阻/使能)</div>
          <div id="bitA15" style="font-size:13px; font-weight:700; color:#ef4444;">0</div>
        </div>
        <div style="flex:2; background:rgba(56,189,248,0.15); padding:8px; border-right:1px solid #1f293d;">
          <div style="font-size:10px; color:#38bdf8;">A14, A13 (138 译码输入 C, B)</div>
          <div id="bitA14_13" style="font-size:13px; font-weight:700; color:#38bdf8;">10</div>
        </div>
        <div style="flex:13; background:rgba(16,185,129,0.15); padding:8px;">
          <div style="font-size:10px; color:#34d399;">A12 ~ A0 (13位片内地址偏移, 8K)</div>
          <div id="bitOffset" style="font-size:13px; font-weight:700; color:#10b981;">0010100100000</div>
        </div>
      </div>
    </div>

    <!-- 74LS138 与存储矩阵电路图 -->
    <div class="circuit-box">
      <!-- 74LS138 译码器芯片模块 -->
      <div class="chip-138">
        <div class="chip-138-title">⚡ 74LS138 译码器</div>
        <div style="font-size:10px; color:#64748b; text-align:center; margin-bottom:6px;">使能端: G1=1, ~G2A=0, ~G2B=0</div>

        <div class="pin-row"><span>输入 C (A14)</span><span id="pinC" class="pin-active">1</span></div>
        <div class="pin-row"><span>输入 B (A13)</span><span id="pinB" class="pin-active">0</span></div>
        <div class="pin-row"><span>输入 A (接地0)</span><span>0</span></div>

        <div style="border-top:1px dashed #334155; margin:6px 0;"></div>

        <div class="pin-row"><span>输出 ~Y0</span><span id="outY0">1 (无效)</span></div>
        <div class="pin-row"><span>输出 ~Y1</span><span id="outY1">1 (无效)</span></div>
        <div class="pin-row"><span>输出 ~Y2</span><span id="outY2">1 (无效)</span></div>
        <div class="pin-row"><span>输出 ~Y3</span><span id="outY3">1 (无效)</span></div>
      </div>

      <!-- 4行2列 存储芯片阵列 -->
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#94a3b8;">
          <span>高4位数据 D7~D4</span>
          <span>低4位数据 D3~D0</span>
        </div>

        <div class="mem-matrix">
          <!-- 行 0: ~Y0 选通 -->
          <div class="mem-chip" id="chip0_0">
            <div class="chip-name">芯片 1 (8K×4)</div>
            <div class="chip-cs">CS = ~Y0</div>
          </div>
          <div class="mem-chip" id="chip0_1">
            <div class="chip-name">芯片 2 (8K×4)</div>
            <div class="chip-cs">CS = ~Y0</div>
          </div>

          <!-- 行 1: ~Y1 选通 -->
          <div class="mem-chip" id="chip1_0">
            <div class="chip-name">芯片 3 (8K×4)</div>
            <div class="chip-cs">CS = ~Y1</div>
          </div>
          <div class="mem-chip" id="chip1_1">
            <div class="chip-name">芯片 4 (8K×4)</div>
            <div class="chip-cs">CS = ~Y1</div>
          </div>

          <!-- 行 2: ~Y2 选通 -->
          <div class="mem-chip" id="chip2_0">
            <div class="chip-name">芯片 5 (8K×4)</div>
            <div class="chip-cs">CS = ~Y2</div>
          </div>
          <div class="mem-chip" id="chip2_1">
            <div class="chip-name">芯片 6 (8K×4)</div>
            <div class="chip-cs">CS = ~Y2</div>
          </div>

          <!-- 行 3: ~Y3 选通 -->
          <div class="mem-chip" id="chip3_0">
            <div class="chip-name">芯片 7 (8K×4)</div>
            <div class="chip-cs">CS = ~Y3</div>
          </div>
          <div class="mem-chip" id="chip3_1">
            <div class="chip-name">芯片 8 (8K×4)</div>
            <div class="chip-cs">CS = ~Y3</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 运行结果与总线流向报告 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:10px; padding:12px; font-size:12px; color:#cbd5e1; line-height:1.7;">
      <b style="color:#38bdf8;">📊 硬件选通信号流向分析：</b>
      <div id="busReport">请输入十六进制地址并点击“产生片选寻址”。</div>
    </div>
  </div>
</div>

<script>
  function parseAddr(hexStr) {
    let clean = hexStr.trim();
    if (clean.startsWith("0x") || clean.startsWith("0X")) clean = clean.substring(2);
    let val = parseInt(clean, 16);
    if (isNaN(val)) val = 0;
    val = val & 0xFFFF; // 16位地址
    return val;
  }

  function simulate() {
    const addr = parseAddr(document.getElementById("addrInput").value);
    const a15 = (addr >> 15) & 1;
    const a14 = (addr >> 14) & 1;
    const a13 = (addr >> 13) & 1;
    const offset = addr & 0x1FFF; // 低 13 位片内地址

    document.getElementById("bitA15").innerText = a15;
    document.getElementById("bitA14_13").innerText = \`\${a14}\${a13}\`;
    document.getElementById("bitOffset").innerText = offset.toString(2).padStart(13, '0') + \` (0x\${offset.toString(16).toUpperCase()})\`;

    document.getElementById("pinC").innerText = a14;
    document.getElementById("pinB").innerText = a13;

    // 清空高亮
    document.querySelectorAll(".mem-chip").forEach(c => c.classList.remove("active"));
    for (let i = 0; i < 4; i++) {
      const out = document.getElementById("outY" + i);
      out.className = "";
      out.innerText = "1 (高电平/无效)";
    }

    // 计算译码行号
    const group = (a14 << 1) | a13; // 0, 1, 2, 3
    const selectedY = document.getElementById("outY" + group);
    if (selectedY) {
      selectedY.className = "pin-out-low";
      selectedY.innerText = "0 (低电平选通!)";
    }

    // 激活对应行的两片芯片
    const c0 = document.getElementById(\`chip\${group}_0\`);
    const c1 = document.getElementById(\`chip\${group}_1\`);
    if (c0 && c1) {
      c0.classList.add("active");
      c1.classList.add("active");
    }

    const startAddrHex = (group * 0x2000).toString(16).toUpperCase().padStart(4, '0') + "H";
    const endAddrHex = ((group + 1) * 0x2000 - 1).toString(16).toUpperCase().padStart(4, '0') + "H";

    document.getElementById("busReport").innerHTML = \`1. CPU 输出物理地址 <b>0x\${addr.toString(16).toUpperCase().padStart(4, '0')}</b>；<br>
2. 高位 <b>A14=\${a14}, A13=\${a13}</b> 经 74LS138 译码，使输出端 <b>~Y\${group} = 0 (低电平)</b> 唯一有效选通！<br>
3. 选通第 <b>\${group}</b> 组存储芯片（芯片 \${group*2+1} 与 芯片 \${group*2+2}），对应地址空间 <b>\${startAddrHex} ~ \${endAddrHex}</b>；<br>
4. 低 13 位地址 <b>A12~A0 = 0x\${offset.toString(16).toUpperCase()}</b> 送入片内寻址；<br>
5. 芯片 \${group*2+1} 驱动高 4 位数据总线 <b>D7~D4</b>，芯片 \${group*2+2} 驱动低 4 位数据总线 <b>D3~D0</b>，完成一次 8 位字节读写！\`;
  }

  document.getElementById("btnAccess").addEventListener("click", simulate);
  document.getElementById("btnReset").addEventListener("click", () => {
    document.getElementById("addrInput").value = "0x4520";
    simulate();
  });

  document.getElementById("btnCase0").addEventListener("click", () => {
    document.getElementById("addrInput").value = "0x0100";
    simulate();
  });
  document.getElementById("btnCase1").addEventListener("click", () => {
    document.getElementById("addrInput").value = "0x2400";
    simulate();
  });
  document.getElementById("btnCase2").addEventListener("click", () => {
    document.getElementById("addrInput").value = "0x4800";
    simulate();
  });
  document.getElementById("btnCase3").addEventListener("click", () => {
    document.getElementById("addrInput").value = "0x6C00";
    simulate();
  });

  simulate();
</script>
</body>
</html>`
}
