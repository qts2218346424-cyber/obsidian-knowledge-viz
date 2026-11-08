import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const twoLevelPagingCourseware: InteractiveCoursewareItem = {
  id: 'cw-two-level-paging',
  title: '📑 虚拟内存：两级页表、TLB快表与缺页中断全流程仿真器',
  domain: 'cs_408',
  subject: '操作系统',
  difficulty: '每年必考大题',
  tags: ['408', '操作系统', '内存管理', '虚拟内存', '两级页表', 'TLB', '快表', '缺页中断', '地址转换'],
  summary: '32位虚拟内存两级分页管理与地址翻译全景动态仿真。可视化展示 10-10-12 位虚拟地址二进制切分、TLB 快表命中/缺失判定、两级页表分级查找、缺页异常与物理地址合成全链路，彻底突破 408 综合大题最硬核瓶颈。',
  learningPoints: [
    '32位系统4KB页面标准划分：顶级页号 P1 (10位) + 二级页号 P2 (10位) + 页内偏移 W (12位)',
    'TLB 快表基于相联存储器，按内容并行高速查找，命中只需 1 次内存访问（访存读取物理数据）',
    'TLB 缺失时需遍历多级页表：一级页目录表 (1次访存) -> 二级页表 (1次访存) -> 物理内存 (1次访存)，总共 3 次访存',
    '缺页异常：若页表项有效位 Present=0，触发缺页中断陷入内核态，从磁盘调入页后更新页表并刷新 TLB',
    '物理地址合成公式：物理地址 PA = (物理页框号 PFN << 12) | 页内偏移 W'
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
    grid-template-columns: 320px 1fr;
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

  /* 虚拟地址切分可视化条 */
  .va-bar {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    height: 48px;
  }
  .va-part {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    font-size: 11px;
    font-weight: 700;
  }
  .va-p1 { flex: 10; background: rgba(56,189,248,0.15); border-right: 1px solid var(--border-color); color: #38bdf8; }
  .va-p2 { flex: 10; background: rgba(168,85,247,0.15); border-right: 1px solid var(--border-color); color: #c084fc; }
  .va-w  { flex: 12; background: rgba(16,185,129,0.15); color: #34d399; }

  /* 硬件模块卡片 */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .mod-card {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    transition: all 0.2s ease;
  }
  .mod-card.active { border-color: var(--accent); box-shadow: 0 0 14px rgba(56,189,248,0.3); }
  .mod-card.hit { border-color: var(--green); box-shadow: 0 0 14px rgba(16,185,129,0.3); }
  .mod-card.miss { border-color: var(--amber); }
  .mod-card.fault { border-color: var(--red); box-shadow: 0 0 14px rgba(239,68,68,0.4); }

  .mod-title { font-size: 12px; font-weight: 700; display: flex; justify-content: space-between; align-items: center; }
  .status-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
  .tag-idle { background: #1e293b; color: #64748b; }
  .tag-hit { background: rgba(16,185,129,0.2); color: #10b981; }
  .tag-miss { background: rgba(245,158,11,0.2); color: #f59e0b; }
  .tag-fault { background: rgba(239,68,68,0.2); color: #ef4444; }

  .mem-table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 11px; margin-top: 4px; }
  .mem-table th, .mem-table td { border: 1px solid #1e293b; padding: 4px 6px; text-align: center; }
  .mem-table th { background: #1e293b; color: #94a3b8; font-size: 10px; }
  .row-hl { background: rgba(56,189,248,0.25) !important; color: #38bdf8; font-weight: 700; }

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
  <h1>📑 408 操作系统 · 两级分页、TLB快表与缺页中断全流程仿真器 <span class="badge">全国统考核心综合大题</span></h1>
  <div style="font-size:12px; color:#94a3b8;">32位线性虚拟地址 · 4KB标准页大小</div>
</header>

<div class="layout">
  <!-- 左侧控制器 -->
  <div class="panel">
    <div class="input-group">
      <label>32位 虚拟地址 (Hex)</label>
      <input type="text" id="vaInput" value="0x004031A8">
    </div>

    <div class="btn-row">
      <button class="primary" id="btnTranslate">⚡ 单步/全速翻译</button>
      <button id="btnReset">↺ 重置仿真</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      <label>📌 408 典型真题场景速选</label>
      <button id="case1">用例 1: TLB 命中 (1次访存, 极速)</button>
      <button id="case2">用例 2: TLB 未命中 -> 二级页表命中 (3次访存)</button>
      <button id="case3">用例 3: 缺页异常 (Page Fault, 需磁盘换入)</button>
    </div>

    <!-- 访存开销统计卡片 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:8px; padding:10px; font-size:12px;">
      <div style="font-weight:700; color:#38bdf8; margin-bottom:6px;">⏱ 内存总线延迟统计</div>
      <div>TLB 查询耗时: <b style="color:#10b981;">10 ns</b> (寄存器级)</div>
      <div>物理内存访问: <b style="color:#f59e0b;">100 ns / 次</b></div>
      <div style="margin-top:6px; border-top:1px solid #1e293b; padding-top:6px;">
        本次有效访存次数: <b id="memAccessCount" style="color:#38bdf8; font-size:14px;">0</b> 次<br>
        总耗时折算: <b id="totalLatency" style="color:#a855f7; font-size:14px;">0</b> ns
      </div>
    </div>

    <div class="tip-card">
      <b>💡 408 考场大题采分避坑口诀：</b><br>
      1. <b>虚拟地址拆解</b>：高 10 位是一级页目录号，中 10 位是二级页号，低 12 位是页内偏移（$2^{12}=4KB$）；<br>
      2. <b>TLB 未命中</b>：不是缺页！只需要查一级页表 + 二级页表即可，不需要调页；<br>
      3. <b>缺页中断</b>：只有在二级页表中查找发现<b>有效位 P=0</b>，才是缺页，必须陷入 OS 内核！
    </div>
  </div>

  <!-- 右侧仿真动画舞台 -->
  <div class="sim-panel">
    <!-- 虚拟地址拆解条 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:10px; padding:12px;">
      <div style="font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:8px;">
        1️⃣ 虚拟地址 (VA) 结构拆解 [31:0]
      </div>
      <div class="va-bar">
        <div class="va-part va-p1">
          <span>一级页号 P1 (10位)</span>
          <span id="p1Val" style="font-size:13px;">-</span>
        </div>
        <div class="va-part va-p2">
          <span>二级页号 P2 (10位)</span>
          <span id="p2Val" style="font-size:13px;">-</span>
        </div>
        <div class="va-part va-w">
          <span>页内偏移 W (12位)</span>
          <span id="wVal" style="font-size:13px;">-</span>
        </div>
      </div>
    </div>

    <!-- 硬件模块拓扑网格 -->
    <div class="modules-grid">
      <!-- TLB 快表 -->
      <div class="mod-card" id="cardTLB">
        <div class="mod-title">
          <span>⚡ TLB 快表 (8项相联)</span>
          <span class="status-tag tag-idle" id="tlbTag">空闲</span>
        </div>
        <table class="mem-table">
          <tr><th>虚页号 VPN</th><th>物理页框 PFN</th><th>有效位</th></tr>
          <tr id="tlbRow0"><td>0x00403</td><td>0x1F</td><td>1</td></tr>
          <tr id="tlbRow1"><td>0x00802</td><td>0x3A</td><td>1</td></tr>
          <tr id="tlbRow2"><td>0x00120</td><td>0x0D</td><td>1</td></tr>
        </table>
      </div>

      <!-- 一级页目录表 -->
      <div class="mod-card" id="cardP1">
        <div class="mod-title">
          <span>📁 一级页目录表 (PDE)</span>
          <span class="status-tag tag-idle" id="p1Tag">空闲</span>
        </div>
        <table class="mem-table">
          <tr><th>目录项 P1</th><th>二级页表基址</th></tr>
          <tr id="pdeRow0"><td>0x001 (1)</td><td>0x8000</td></tr>
          <tr id="pdeRow1"><td>0x002 (2)</td><td>0x9000</td></tr>
          <tr id="pdeRow2"><td>0x004 (4)</td><td>0xA000</td></tr>
        </table>
      </div>

      <!-- 二级页表 -->
      <div class="mod-card" id="cardP2">
        <div class="mod-title">
          <span>📄 二级页表 (PTE)</span>
          <span class="status-tag tag-idle" id="p2Tag">空闲</span>
        </div>
        <table class="mem-table">
          <tr><th>页号 P2</th><th>物理页框 PFN</th><th>存在位 P</th></tr>
          <tr id="pteRow0"><td>0x003</td><td>0x1F</td><td>1 (在内存)</td></tr>
          <tr id="pteRow1"><td>0x004</td><td>0x5C</td><td>1 (在内存)</td></tr>
          <tr id="pteRow2"><td>0x008</td><td>--</td><td>0 (缺页!)</td></tr>
        </table>
      </div>
    </div>

    <!-- 地址合成与结果输出 -->
    <div style="background:#0f172a; border:1px solid #1f293d; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">
      <div style="font-size:13px; font-weight:700; color:#38bdf8; display:flex; justify-content:space-between;">
        <span>🎯 物理地址 (PA) 合成与解析结果</span>
        <span id="finalStatus" style="color:#94a3b8;">等待地址输入</span>
      </div>

      <div style="display:flex; align-items:center; gap:16px; background:#1e293b; padding:10px 14px; border-radius:8px;">
        <div style="font-size:12px; color:#94a3b8;">合成公式:</div>
        <div style="font-family:monospace; font-size:14px; color:#e2e8f0;">
          物理地址 PA = <span style="color:#c084fc;">PFN (物理页框)</span> | <span style="color:#34d399;">Offset (页内偏移)</span> = <b id="finalPa" style="color:#38bdf8; font-size:16px;">--</b>
        </div>
      </div>

      <div id="flowLog" style="font-size:12px; color:#cbd5e1; line-height:1.7; background:#0b0f19; padding:10px; border-radius:6px; border:1px solid #1e293d;">
        请输入 32 位十六进制虚拟地址，点击“单步/全速翻译”查看硬件流水线地址转换全过程。
      </div>
    </div>
  </div>
</div>

<script>
  function parseVA(vaStr) {
    let clean = vaStr.trim();
    if (clean.startsWith("0x") || clean.startsWith("0X")) clean = clean.substring(2);
    let val = parseInt(clean, 16);
    if (isNaN(val)) val = 0;

    const p1 = (val >>> 22) & 0x3FF; // 高 10 位
    const p2 = (val >>> 12) & 0x3FF; // 中 10 位
    const w  = val & 0xFFF;          // 低 12 位
    const vpn = (val >>> 12) & 0xFFFFF; // 20 位虚拟页号
    return { val, p1, p2, w, vpn };
  }

  function resetUI() {
    document.querySelectorAll(".mod-card").forEach(c => c.className = "mod-card");
    document.querySelectorAll(".status-tag").forEach(t => { t.className = "status-tag tag-idle"; t.innerText = "空闲"; });
    document.querySelectorAll("tr").forEach(r => r.classList.remove("row-hl"));
    document.getElementById("finalStatus").innerText = "就绪";
    document.getElementById("finalStatus").style.color = "#94a3b8";
    document.getElementById("finalPa").innerText = "--";
    document.getElementById("memAccessCount").innerText = "0";
    document.getElementById("totalLatency").innerText = "0";
  }

  function runSimulation() {
    resetUI();
    const vaText = document.getElementById("vaInput").value;
    const { val, p1, p2, w, vpn } = parseVA(vaText);

    document.getElementById("p1Val").innerText = \`0x\${p1.toString(16).toUpperCase().padStart(3, '0')} (\${p1})\`;
    document.getElementById("p2Val").innerText = \`0x\${p2.toString(16).toUpperCase().padStart(3, '0')} (\${p2})\`;
    document.getElementById("wVal").innerText  = \`0x\${w.toString(16).toUpperCase().padStart(3, '0')} (\${w})\`;

    const cardTLB = document.getElementById("cardTLB");
    const tlbTag = document.getElementById("tlbTag");
    const cardP1 = document.getElementById("cardP1");
    const p1Tag = document.getElementById("p1Tag");
    const cardP2 = document.getElementById("cardP2");
    const p2Tag = document.getElementById("p2Tag");
    const flowLog = document.getElementById("flowLog");

    // 检查 TLB 是否命中 (示例预设 0x00403 -> 0x1F)
    if (vpn === 0x00403) {
      cardTLB.classList.add("hit");
      tlbTag.className = "status-tag tag-hit";
      tlbTag.innerText = "HIT (命中)";
      document.getElementById("tlbRow0").classList.add("row-hl");

      const pfn = 0x1F;
      const pa = (pfn << 12) | w;
      document.getElementById("finalPa").innerText = \`0x\${pa.toString(16).toUpperCase().padStart(8, '0')}\`;
      document.getElementById("finalStatus").innerText = "✅ TLB 极速命中！无需查页表";
      document.getElementById("finalStatus").style.color = "#10b981";
      document.getElementById("memAccessCount").innerText = "1";
      document.getElementById("totalLatency").innerText = "110 (10ns TLB + 100ns 物理访存)";
      flowLog.innerHTML = \`1. CPU 发送虚拟地址 <b>0x\${val.toString(16).toUpperCase()}</b>，硬件并行检索 TLB。<br>
2. <b>TLB 命中！</b> 匹配虚拟页号 VPN=0x00403，直接获取物理页框号 <b>PFN = 0x1F</b>。<br>
3. 绕过一级与二级页表，直接合成物理地址 <b>0x\${pa.toString(16).toUpperCase()}</b>，仅需 1 次物理内存数据访问！\`;
      return;
    }

    // TLB Miss
    cardTLB.classList.add("miss");
    tlbTag.className = "status-tag tag-miss";
    tlbTag.innerText = "MISS (缺失)";

    // 查一级页表
    cardP1.classList.add("active");
    p1Tag.className = "status-tag tag-hit";
    p1Tag.innerText = "查页目录";

    if (p1 === 1) {
      document.getElementById("pdeRow0").classList.add("row-hl");
    } else {
      document.getElementById("pdeRow1").classList.add("row-hl");
    }

    // 查二级页表
    cardP2.classList.add("active");

    if (p2 === 8) {
      // 缺页异常
      cardP2.classList.remove("active");
      cardP2.classList.add("fault");
      p2Tag.className = "status-tag tag-fault";
      p2Tag.innerText = "PAGE FAULT (缺页)";
      document.getElementById("pteRow2").classList.add("row-hl");

      document.getElementById("finalStatus").innerText = "⚠️ 触发缺页异常！陷入内核态调页";
      document.getElementById("finalStatus").style.color = "#ef4444";
      document.getElementById("memAccessCount").innerText = "2 (查表) + OS调页";
      document.getElementById("totalLatency").innerText = "> 10,000,000 (磁盘I/O级别)";
      flowLog.innerHTML = \`1. TLB 查找未命中 (Miss)；<br>
2. 访存第 1 次：查一级页目录表 (PDE)，基址命中；<br>
3. 访存第 2 次：查二级页表项 (PTE)，发现 <b>存在位 Present = 0</b>！目标页面当前不在物理内存中；<br>
4. 硬件触发 <b>缺页中断异常 (Page Fault)</b>，CPU 陷入操作系统内核态，启动磁盘页面换入！\`;
      return;
    }

    // 二级页表命中
    cardP2.classList.add("hit");
    p2Tag.className = "status-tag tag-hit";
    p2Tag.innerText = "HIT (有效)";
    document.getElementById("pteRow0").classList.add("row-hl");

    const pfn = 0x1F;
    const pa = (pfn << 12) | w;
    document.getElementById("finalPa").innerText = \`0x\${pa.toString(16).toUpperCase().padStart(8, '0')}\`;
    document.getElementById("finalStatus").innerText = "✅ 两级页表查表成功！";
    document.getElementById("finalStatus").style.color = "#38bdf8";
    document.getElementById("memAccessCount").innerText = "3";
    document.getElementById("totalLatency").innerText = "310 (10ns TLB + 100ns PDE + 100ns PTE + 100ns 数据)";
    flowLog.innerHTML = \`1. TLB 检索未命中；<br>
2. <b>访存第 1 次</b>：根据 P1 = 0x\${p1.toString(16)} 读取一级页目录表，获取二级页表物理基址；<br>
3. <b>访存第 2 次</b>：根据 P2 = 0x\${p2.toString(16)} 读取二级页表项，获取 <b>PFN = 0x1F</b> (存在位 P=1)；<br>
4. <b>访存第 3 次</b>：将 (0x1F << 12) | 0x\${w.toString(16)} 合成物理地址 <b>0x\${pa.toString(16).toUpperCase()}</b>，读取目标数据；<br>
5. 同时更新 TLB 缓存该映射项，下次访问将提速至极速命中！\`;
  }

  document.getElementById("btnTranslate").addEventListener("click", runSimulation);
  document.getElementById("btnReset").addEventListener("click", () => {
    document.getElementById("vaInput").value = "0x004031A8";
    resetUI();
    document.getElementById("flowLog").innerText = "请输入 32 位十六进制虚拟地址，点击“单步/全速翻译”查看硬件流水线地址转换全过程。";
  });

  document.getElementById("case1").addEventListener("click", () => {
    document.getElementById("vaInput").value = "0x004031A8"; // TLB Hit
    runSimulation();
  });
  document.getElementById("case2").addEventListener("click", () => {
    document.getElementById("vaInput").value = "0x008032C4"; // TLB Miss -> Two Level Hit
    runSimulation();
  });
  document.getElementById("case3").addEventListener("click", () => {
    document.getElementById("vaInput").value = "0x004085D0"; // Page Fault (p2 = 8)
    runSimulation();
  });

  // 初始自动运行一次
  runSimulation();
</script>
</body>
</html>`
}
