import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const dijkstraGraphCourseware: InteractiveCoursewareItem = {
  id: 'cw-dijkstra-graph',
  title: '🗺️ Dijkstra 最短路径算法与松弛过程动态实验室',
  domain: 'cs_408',
  subject: '数据结构',
  difficulty: '每年必考大题',
  tags: ['408', '数据结构', '图', '最短路径', 'Dijkstra', '贪心算法', 'Dist数组', 'Path前驱'],
  summary: '单步仿真 Dijkstra 单源最短路径求解全过程。可视化展示集合 S（已确定）与 V-S（未确定）的迁移，动态更新 Dist[] 距离数组与 Path[] 前驱指针，直观演示对相邻顶点的“松弛 (Relaxation)”操作。',
  learningPoints: [
    '核心贪心思想：每次从未确定集合 V-S 中挑选当前 Dist 最小的顶点 u 加入已确定集合 S',
    '松弛准则：对于 u 的所有邻接点 v，若 Dist[u] + w(u, v) < Dist[v]，则更新 Dist[v] = Dist[u] + w(u, v) 并将 Path[v] 置为 u',
    '考场必考避坑：Dijkstra 算法【绝对不能处理含负权边的图】（贪心选择不可撤回，负权边会推翻之前的最优解）',
    '时间复杂度：普通邻接矩阵为 O(V²)，使用小顶堆/优先队列优化邻接表可达 O((V+E)logV)'
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
    --success: #10b981;
    --current-node: #ec4899;
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
  .table-box {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    font-family: monospace;
    text-align: center;
    margin-top: 6px;
  }
  .table-box th {
    background: #0d1424;
    color: var(--text-secondary);
    padding: 6px 4px;
    border: 1px solid var(--border-color);
    font-size: 11px;
  }
  .table-box td {
    padding: 6px 4px;
    border: 1px solid var(--border-color);
    background: #080c16;
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
  svg { width: 100%; height: 100%; }
  .graph-node {
    fill: #1e293b;
    stroke: #38bdf8;
    stroke-width: 2.5px;
    transition: all 0.3s;
    cursor: pointer;
  }
  .graph-node.visited { fill: rgba(16, 185, 129, 0.25); stroke: #10b981; }
  .graph-node.current { fill: rgba(236, 72, 153, 0.3); stroke: #ec4899; filter: drop-shadow(0 0 8px #ec4899); }
  .node-label { fill: #fff; font-size: 13px; font-weight: bold; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  .edge-line { stroke: #334155; stroke-width: 2px; transition: all 0.3s; }
  .edge-line.active { stroke: #ec4899; stroke-width: 3.5px; filter: drop-shadow(0 0 6px #ec4899); }
  .edge-weight { fill: #f59e0b; font-size: 11px; font-weight: bold; text-anchor: middle; dominant-baseline: central; background: #0b0f19; }
</style>
</head>
<body>

<header>
  <h1><span>🗺️</span> Dijkstra 单源最短路径与松弛算法动态实验室</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 数据结构高频考点</span>
    <span style="font-size: 11px; color: var(--text-secondary);">起点为 V0 · 贪心策略逐步确定</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">步进执行控制</div>
      <button class="primary" onclick="stepDijkstra()">▶️ 执行下一步松弛 (Relaxation)</button>
      <button onclick="autoRun()">⏩ 自动推演至终点</button>
      <button onclick="resetGraph()" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">🔄 重置回初始状态</button>
    </div>

    <div class="controls-group">
      <div class="label">Dist 距离与 Path 前驱数组动态表</div>
      <table class="table-box">
        <thead>
          <tr>
            <th>顶点</th>
            <th>V0</th><th>V1</th><th>V2</th><th>V3</th><th>V4</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="color:var(--text-secondary);">Dist</td>
            <td id="d0">0</td><td id="d1">∞</td><td id="d2">∞</td><td id="d3">∞</td><td id="d4">∞</td>
          </tr>
          <tr>
            <td style="color:var(--text-secondary);">Path</td>
            <td id="p0">-1</td><td id="p1">-1</td><td id="p2">-1</td><td id="p3">-1</td><td id="p4">-1</td>
          </tr>
          <tr>
            <td style="color:var(--text-secondary);">S集</td>
            <td id="s0" style="color:#10b981;">是</td><td id="s1">否</td><td id="s2">否</td><td id="s3">否</td><td id="s4">否</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="controls-group">
      <div class="label">本步推导诊断分析</div>
      <div id="stepLog" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 90px;">
        初始时刻：将起点 V0 加入集合 S。点击【执行下一步】开始松弛相邻顶点。
      </div>
    </div>

    <div class="tips-card">
      <b>💡 408 考场大题核心考点：</b><br>
      • <b>松弛公式</b>：Dist[v] = min(Dist[v], Dist[u] + weight(u, v))。<br>
      • <b>不可逆性</b>：一旦一个顶点加入集合 S，它的最短路径值就彻底敲定，后续绝不再修改。<br>
      • <b>若存在负权边</b>：后续可能会通过负权边找出更小路径，导致贪心策略彻底失效！
    </div>
  </div>

  <div class="panel canvas-panel">
    <div style="position: absolute; top: 12px; left: 16px; z-index: 10; font-size: 11px; color: var(--text-secondary); background: rgba(18,24,39,0.85); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border-color);">
      🟢 绿色节点: 已确定最短路径 (S集合) | 🌸 粉色节点: 当前松弛支点 u
    </div>
    <svg id="graphSvg" viewBox="0 0 460 300" preserveAspectRatio="xMidYMid meet"></svg>
  </div>
</div>

<script>
// 5 个顶点图
const NODES = [
  { id: 0, label: 'V0', x: 80, y: 150 },
  { id: 1, label: 'V1', x: 220, y: 70 },
  { id: 2, label: 'V2', x: 220, y: 230 },
  { id: 3, label: 'V3', x: 380, y: 90 },
  { id: 4, label: 'V4', x: 380, y: 220 }
];

const EDGES = [
  { u: 0, v: 1, w: 10 },
  { u: 0, v: 2, w: 5 },
  { u: 1, v: 2, w: 2 },
  { u: 1, v: 3, w: 1 },
  { u: 2, v: 1, w: 3 },
  { u: 2, v: 3, w: 9 },
  { u: 2, v: 4, w: 2 },
  { u: 3, v: 4, w: 4 },
  { u: 4, v: 3, w: 6 }
];

let dist = [0, Infinity, Infinity, Infinity, Infinity];
let path = [-1, -1, -1, -1, -1];
let inS = [false, false, false, false, false];
let currentNode = -1;
let finished = false;

function resetGraph() {
  dist = [0, Infinity, Infinity, Infinity, Infinity];
  path = [-1, -1, -1, -1, -1];
  inS = [false, false, false, false, false];
  currentNode = -1;
  finished = false;
  document.getElementById('stepLog').innerHTML = '已重置图状态。准备就绪。';
  render();
}

function stepDijkstra() {
  if (finished) return;

  // 1. 在不在 S 中的节点中选一个 dist 最小的
  let minD = Infinity;
  let u = -1;
  for (let i = 0; i < 5; i++) {
    if (!inS[i] && dist[i] < minD) {
      minD = dist[i];
      u = i;
    }
  }

  if (u === -1) {
    finished = true;
    document.getElementById('stepLog').innerHTML = '<span style="color:#10b981; font-weight:bold;">✅ 所有可达顶点最短路径已全部求解完成！</span>';
    currentNode = -1;
    render();
    return;
  }

  inS[u] = true;
  currentNode = u;

  // 2. 对 u 的所有出边进行松弛
  let logText = '<b>第 ' + (inS.filter(Boolean).length) + ' 轮：</b>挑选未确定节点中距离最小的 <b style="color:#ec4899">V' + u + '</b> (Dist=' + dist[u] + ') 加入 S 集合。<br>执行出边松弛：';
  let relaxedAny = false;

  EDGES.forEach(e => {
    if (e.u === u && !inS[e.v]) {
      if (dist[u] + e.w < dist[e.v]) {
        relaxedAny = true;
        const old = dist[e.v] === Infinity ? '∞' : dist[e.v];
        dist[e.v] = dist[u] + e.w;
        path[e.v] = u;
        logText += '<br>• 松弛 V' + e.v + '：原Dist=' + old + ' > 新Dist=' + dist[e.v] + ' (经V' + u + ')，前驱置为 V' + u;
      }
    }
  });

  if (!relaxedAny) logText += '<br>• 无邻接顶点距离得到更新。';
  document.getElementById('stepLog').innerHTML = logText;
  render();
}

function render() {
  // 更新表格
  for (let i = 0; i < 5; i++) {
    document.getElementById('d' + i).innerText = dist[i] === Infinity ? '∞' : dist[i];
    document.getElementById('p' + i).innerText = path[i] === -1 ? '-' : 'V' + path[i];
    const sEl = document.getElementById('s' + i);
    sEl.innerText = inS[i] ? '是' : '否';
    sEl.style.color = inS[i] ? '#10b981' : '#64748b';
  }

  // 绘制 SVG
  const svg = document.getElementById('graphSvg');
  svg.innerHTML = '';

  // 连线
  EDGES.forEach(e => {
    const from = NODES[e.u];
    const to = NODES[e.v];
    const isRelaxed = currentNode === e.u;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'edge-line' + (isRelaxed ? ' active' : ''));
    svg.appendChild(line);

    // 权值文本
    const midX = (from.x * 0.4 + to.x * 0.6);
    const midY = (from.y * 0.4 + to.y * 0.6) - 5;
    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', midX);
    txt.setAttribute('y', midY);
    txt.setAttribute('class', 'edge-weight');
    txt.textContent = e.w;
    svg.appendChild(txt);
  });

  // 节点
  NODES.forEach(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', n.x);
    c.setAttribute('cy', n.y);
    c.setAttribute('r', '18');

    let cls = 'graph-node';
    if (inS[n.id]) cls += ' visited';
    if (n.id === currentNode) cls += ' current';
    c.setAttribute('class', cls);
    g.appendChild(c);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', n.x);
    t.setAttribute('y', n.y);
    t.setAttribute('class', 'node-label');
    t.textContent = n.label;
    g.appendChild(t);

    svg.appendChild(g);
  });
}

function autoRun() {
  const timer = setInterval(() => {
    if (!finished) {
      stepDijkstra();
    } else {
      clearInterval(timer);
    }
  }, 900);
}

resetGraph();
</script>
</body>
</html>`
}
