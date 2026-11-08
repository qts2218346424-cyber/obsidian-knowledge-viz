import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const cacheMappingCourseware: InteractiveCoursewareItem = {
  id: 'cw-cache-mapping',
  title: '⚡ Cache 高速缓存映射机制与主存地址拆解仿真器',
  domain: 'cs_408',
  subject: '计算机组成原理',
  difficulty: '每年必考大题',
  tags: ['408', '计组', 'Cache', '直接映射', '组相联', '全相联', 'Tag', '命中率', '地址拆解'],
  summary: '深度仿真主存地址拆解（主存字块标记 Tag、Cache 组号 Index、块内偏移 Offset）与 Cache 命中比对过程。支持直接映射、2路组相联、4路组相联与全相联映射动态切换，可视化高亮 Valid 有效位、Tag 比对与替换。',
  learningPoints: [
    '主存地址三段式：[Tag 主存字块标记] + [Index Cache 组号] + [Offset 块内字节偏移]',
    '直接映射：每块只能放在固定行号 i = 主存块号 mod Cache行数，容易发生同组抖动',
    '组相联映射：组号 = 主存块号 mod Cache组数；每组内可以存放 r 个块，组内采用 LRU 或 FIFO 替换',
    '全相联映射：没有 Index 字段，可以放入 Cache 任意空闲行，灵活但查找需要昂贵的相联比较器'
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
    --accent-glow: rgba(56, 189, 248, 0.2);
    --tag-color: #ec4899;
    --index-color: #8b5cf6;
    --offset-color: #10b981;
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
  select, input[type="text"] {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #fff;
    padding: 8px 10px;
    font-size: 13px;
    font-family: monospace;
    width: 100%;
    outline: none;
  }
  select:focus, input[type="text"]:focus { border-color: var(--accent); }
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
  .addr-split-bar {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    height: 48px;
    margin: 10px 0;
    border: 1px solid var(--border-color);
    text-align: center;
    font-family: monospace;
  }
  .addr-part {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 4px;
    transition: all 0.3s;
  }
  .addr-part .title { font-size: 10px; font-weight: bold; }
  .addr-part .bits { font-size: 12px; font-weight: bold; margin-top: 2px; }
  .addr-part.tag { background: rgba(236, 72, 153, 0.2); color: #f472b6; border-right: 1px solid rgba(236, 72, 153, 0.4); }
  .addr-part.index { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border-right: 1px solid rgba(139, 92, 246, 0.4); }
  .addr-part.offset { background: rgba(16, 185, 129, 0.2); color: #34d399; }
  .cache-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 12px;
    font-family: monospace;
  }
  .cache-table th {
    background: #0d1424;
    color: var(--text-secondary);
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    text-align: left;
  }
  .cache-table td {
    padding: 7px 10px;
    border: 1px solid var(--border-color);
    background: #080c16;
  }
  .cache-row.active {
    background: rgba(56, 189, 248, 0.15) !important;
    border-left: 3px solid var(--accent);
  }
  .cache-row.hit {
    background: rgba(16, 185, 129, 0.2) !important;
    animation: flashGreen 0.6s ease;
  }
  .cache-row.miss {
    background: rgba(239, 68, 68, 0.2) !important;
    animation: flashRed 0.6s ease;
  }
  @keyframes flashGreen {
    0% { background: rgba(16, 185, 129, 0.6); }
    100% { background: rgba(16, 185, 129, 0.2); }
  }
  @keyframes flashRed {
    0% { background: rgba(239, 68, 68, 0.6); }
    100% { background: rgba(239, 68, 68, 0.2); }
  }
  .valid-tag {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
  }
  .tips-card {
    background: rgba(139, 92, 246, 0.08);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #c084fc;
    line-height: 1.6;
  }
</style>
</head>
<body>

<header>
  <h1><span>⚡</span> Cache 映射方式与主存地址拆解仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 计组每年必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">主存 64KB (16位) | Cache 8行 | 块大 16B (4位)</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">选择 Cache 映射模式</div>
      <select id="mappingMode" onchange="onModeChange()">
        <option value="direct">直接映射 (Direct Mapped)</option>
        <option value="2way" selected>2 路组相联 (2-Way Set Associative)</option>
        <option value="4way">4 路组相联 (4-Way Set Associative)</option>
        <option value="full">全相联映射 (Fully Associative)</option>
      </select>
    </div>

    <div class="controls-group">
      <div class="label">输入 16 位主存地址 (十六进制)</div>
      <div style="display: flex; gap: 6px;">
        <input type="text" id="hexAddr" value="0x2B48" placeholder="0x0000 - 0xFFFF">
        <button class="primary" onclick="simulateAccess()">访问 Cache</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">经典考题测试地址快速体验</div>
      <div class="preset-row">
        <button onclick="setAddr('0x2B48')">📌 访问 0x2B48</button>
        <button onclick="setAddr('0x2B4C')">🎯 同块命中 0x2B4C</button>
        <button onclick="setAddr('0x6B48')">💥 同组冲突 0x6B48</button>
        <button onclick="setAddr('0xAB48')">🔁 再次冲突 0xAB48</button>
      </div>
      <button onclick="resetCache()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🗑️ 清空重置 Cache 阵列</button>
    </div>

    <div class="controls-group">
      <div class="label">本次访存诊断报告</div>
      <div id="diagBox" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 100px;">
        准备就绪，点击【访问 Cache】开始比对。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 计组考场算位速成口诀：</b><br>
      • <b>Offset 块内偏移位数</b> = log₂(块大小 B)。例：16B 占 4 位。<br>
      • <b>Index 组号位数</b> = log₂(Cache 组数)。<br>
      • <b>Tag 标记位数</b> = 主存总位数 - Index位数 - Offset位数。<br>
      • <b>全相联</b> 无 Index 位（组数=1，位数=0），Tag 最长；<b>直接映射</b> Index 位最多，Tag 最短。
    </div>
  </div>

  <div class="sim-panel">
    <div>
      <div class="label">主存 16 位逻辑地址动态拆解 (二进制映射)</div>
      <div class="addr-split-bar" id="splitBar"></div>
      <div style="font-size: 11px; font-family: monospace; color: var(--text-secondary); text-align: center;" id="binDisplay"></div>
    </div>

    <div style="margin-top: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="label">Cache 阵列行结构 (共 8 行)</div>
        <div style="font-size: 11px; color: var(--text-secondary);">
          命中次数: <b id="hitCount" style="color:#10b981;">0</b> | 缺失次数: <b id="missCount" style="color:#ef4444;">0</b>
        </div>
      </div>

      <table class="cache-table">
        <thead>
          <tr>
            <th style="width: 70px;">行号</th>
            <th style="width: 80px;">所属组号</th>
            <th style="width: 70px;">有效位 (V)</th>
            <th style="width: 140px;">主存标记 (Tag)</th>
            <th>数据块状态 (Block Data)</th>
          </tr>
        </thead>
        <tbody id="cacheTbody"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
// 系统配置：16位主存地址 (64KB)
// Cache 共 8 行，块大小 16B (offset = 4位)
const TOTAL_BITS = 16;
const OFFSET_BITS = 4;
const TOTAL_LINES = 8;

let cache = [];
let hits = 0;
let misses = 0;

function resetCache() {
  cache = [];
  for (let i = 0; i < TOTAL_LINES; i++) {
    cache.push({
      line: i,
      valid: 0,
      tag: '-',
      data: '空闲未装入',
      lastUsed: 0
    });
  }
  hits = 0; misses = 0;
  document.getElementById('hitCount').innerText = hits;
  document.getElementById('missCount').innerText = misses;
  document.getElementById('diagBox').innerHTML = 'Cache 阵列已清空重置。';
  render();
}

function getModeConfig() {
  const mode = document.getElementById('mappingMode').value;
  if (mode === 'direct') {
    // 8 组，每组 1 行
    return { name: '直接映射', ways: 1, sets: 8, indexBits: 3, tagBits: 9 };
  } else if (mode === '2way') {
    // 4 组，每组 2 行
    return { name: '2 路组相联', ways: 2, sets: 4, indexBits: 2, tagBits: 10 };
  } else if (mode === '4way') {
    // 2 组，每组 4 行
    return { name: '4 路组相联', ways: 4, sets: 2, indexBits: 1, tagBits: 11 };
  } else {
    // 全相联：1 组，8 行
    return { name: '全相联映射', ways: 8, sets: 1, indexBits: 0, tagBits: 12 };
  }
}

function parseAddress(hexStr) {
  let val = parseInt(hexStr.trim(), 16);
  if (isNaN(val)) val = 0;
  val = val & 0xFFFF; // 16 位截断

  const cfg = getModeConfig();
  const offset = val & 0xF; // 低 4 位
  const index = cfg.indexBits > 0 ? ((val >> OFFSET_BITS) & ((1 << cfg.indexBits) - 1)) : 0;
  const tag = val >> (OFFSET_BITS + cfg.indexBits);

  const binStr = val.toString(2).padStart(16, '0');
  const tagBin = binStr.substring(0, cfg.tagBits);
  const indexBin = cfg.indexBits > 0 ? binStr.substring(cfg.tagBits, cfg.tagBits + cfg.indexBits) : '';
  const offsetBin = binStr.substring(cfg.tagBits + cfg.indexBits);

  return { val, hex: '0x' + val.toString(16).toUpperCase().padStart(4, '0'), offset, index, tag, tagBin, indexBin, offsetBin, binStr };
}

function onModeChange() {
  resetCache();
}

function setAddr(h) {
  document.getElementById('hexAddr').value = h;
  simulateAccess();
}

let accessCounter = 0;
function simulateAccess() {
  accessCounter++;
  const addrStr = document.getElementById('hexAddr').value;
  const parsed = parseAddress(addrStr);
  const cfg = getModeConfig();

  // 找到目标组所在的行范围
  const targetSet = parsed.index;
  const startLine = targetSet * cfg.ways;
  const endLine = startLine + cfg.ways;

  let hitIndex = -1;
  for (let i = startLine; i < endLine; i++) {
    if (cache[i].valid === 1 && cache[i].tag === parsed.tag) {
      hitIndex = i;
      break;
    }
  }

  const diag = document.getElementById('diagBox');
  let resultHtml = '';

  if (hitIndex !== -1) {
    hits++;
    cache[hitIndex].lastUsed = accessCounter;
    resultHtml = \`
      <div style="color: #10b981; font-weight: bold; font-size: 13px;">✅ 缓存命中 (Cache Hit)！</div>
      <div>主存地址: \${parsed.hex} | 目标组: <b>\${cfg.indexBits > 0 ? '第 ' + targetSet + ' 组' : '全相联任意组'}</b></div>
      <div>匹配到第 <b>\${hitIndex}</b> 行：Tag 标记 \${parsed.tag} 完全一致且 Valid=1。</div>
      <div style="color: #94a3b8; margin-top: 4px;">无需访问主存，以纳秒级高速向 CPU 提供字块数据！</div>
    \`;
  } else {
    misses++;
    // 缺失：需要装入或替换
    // 先找空闲行
    let victimIndex = -1;
    for (let i = startLine; i < endLine; i++) {
      if (cache[i].valid === 0) {
        victimIndex = i;
        break;
      }
    }
    // 若没有空闲行，用 LRU 替换最久未使用的行
    if (victimIndex === -1) {
      let minUsed = Infinity;
      for (let i = startLine; i < endLine; i++) {
        if (cache[i].lastUsed < minUsed) {
          minUsed = cache[i].lastUsed;
          victimIndex = i;
        }
      }
    }

    const wasValid = cache[victimIndex].valid === 1;
    const oldTag = cache[victimIndex].tag;
    cache[victimIndex].valid = 1;
    cache[victimIndex].tag = parsed.tag;
    cache[victimIndex].data = '主存块 #' + Math.floor(parsed.val / 16);
    cache[victimIndex].lastUsed = accessCounter;

    resultHtml = \`
      <div style="color: #ef4444; font-weight: bold; font-size: 13px;">❌ 缓存缺失 (Cache Miss)！</div>
      <div>主存地址: \${parsed.hex} | 目标映射组: <b>\${cfg.indexBits > 0 ? '第 ' + targetSet + ' 组' : '全相联'}</b></div>
      <div>\${wasValid ? '发生冲突！组内无空闲行，根据 LRU 算法淘汰第 ' + victimIndex + ' 行 (原 Tag: ' + oldTag + ')' : '组内第 ' + victimIndex + ' 行空闲，直接装入'}。</div>
      <div style="color: #94a3b8; margin-top: 4px;">从慢速主存调取 16B 数据块写入 Cache 第 \${victimIndex} 行，有效位置 1，更新 Tag=\${parsed.tag}。</div>
    \`;
  }

  document.getElementById('hitCount').innerText = hits;
  document.getElementById('missCount').innerText = misses;
  diag.innerHTML = resultHtml;
  render(parsed, hitIndex !== -1 ? hitIndex : -1, hitIndex === -1 ? targetSet : -1);
}

function render(parsed, hitLine = -1, targetSet = -1) {
  const cfg = getModeConfig();
  if (!parsed) parsed = parseAddress(document.getElementById('hexAddr').value);

  // 1. 渲染地址拆解彩虹条
  const bar = document.getElementById('splitBar');
  bar.innerHTML = \`
    <div class="addr-part tag" style="flex: \${cfg.tagBits};">
      <div class="title">Tag 主存标记</div>
      <div class="bits">\${cfg.tagBits} 位 (\${parsed.tag})</div>
    </div>
    \${cfg.indexBits > 0 ? \`
    <div class="addr-part index" style="flex: \${cfg.indexBits};">
      <div class="title">Index 组号</div>
      <div class="bits">\${cfg.indexBits} 位 (\${parsed.index})</div>
    </div>
    \` : ''}
    <div class="addr-part offset" style="flex: \${OFFSET_BITS};">
      <div class="title">Offset 块内偏</div>
      <div class="bits">\${OFFSET_BITS} 位 (\${parsed.offset})</div>
    </div>
  \`;

  document.getElementById('binDisplay').innerHTML = \`
    二进制分段：<span style="color:#f472b6;">\${parsed.tagBin}</span> \${parsed.indexBin ? '<span style="color:#a78bfa;">' + parsed.indexBin + '</span> ' : ''}<span style="color:#34d399;">\${parsed.offsetBin}</span>
  \`;

  // 2. 渲染 Cache 表格
  const tbody = document.getElementById('cacheTbody');
  tbody.innerHTML = '';

  for (let i = 0; i < TOTAL_LINES; i++) {
    const item = cache[i];
    const setNum = Math.floor(i / cfg.ways);
    const tr = document.createElement('tr');
    tr.className = 'cache-row';

    if (i === hitLine) {
      tr.className += ' hit';
    } else if (setNum === targetSet && item.valid === 1) {
      tr.className += ' active';
    }

    tr.innerHTML = \`
      <td><b>行 \${i}</b></td>
      <td>\${cfg.indexBits > 0 ? '组 ' + setNum : '任意'}</td>
      <td>
        <span class="valid-tag" style="background: \${item.valid === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(148,163,184,0.1)'}; color: \${item.valid === 1 ? '#34d399' : '#64748b'};">
          \${item.valid}
        </span>
      </td>
      <td style="color: #f472b6; font-weight: bold;">\${item.tag !== '-' ? '0x' + item.tag.toString(16).toUpperCase() + ' (' + item.tag + ')' : '-'}</td>
      <td style="color: var(--text-secondary);">\${item.data}</td>
    \`;
    tbody.appendChild(tr);
  }
}

resetCache();
</script>
</body>
</html>`
}
