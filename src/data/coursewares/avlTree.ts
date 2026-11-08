import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const avlTreeCourseware: InteractiveCoursewareItem = {
  id: 'cw-avl-tree',
  title: '🌳 AVL 平衡二叉树四种自平衡旋转 (LL/RR/LR/RL) 动态实验室',
  domain: 'cs_408',
  subject: '数据结构',
  difficulty: '每年必考大题',
  tags: ['408', '数据结构', '树', 'AVL树', '平衡二叉树', 'LL旋转', 'RR旋转', 'LR旋转', 'RL旋转'],
  summary: '单步仿真 AVL 树节点插入与自平衡调整全过程。动态计算每个节点的平衡因子 (BF=hL-hR)，高亮寻找“最小不平衡子树的根”，可视化演示 LL 单右旋、RR 单左旋、LR 先左后右双旋、RL 先右后左双旋。',
  learningPoints: [
    '平衡因子 BF = 左子树高度 - 右子树高度，合法取值为 -1, 0, 1',
    '插入节点后，从插入点向根回溯，第一个 |BF| > 1 的节点即为“最小不平衡子树的根 A”',
    '旋转前后二叉排序树的【中序遍历次序恒定不变】',
    'LL 型在 A 处做右单旋；RR 型在 A 处做左单旋；LR 型先对左孩子做左旋，再对 A 做右旋；RL 型先对右孩子做右旋，再对 A 做左旋'
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
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
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
    grid-template-columns: 280px 1fr;
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
    position: relative;
    background: radial-gradient(circle at 50% 50%, #151d30 0%, #0c111d 100%);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
  .controls-group { display: flex; flex-direction: column; gap: 8px; }
  .label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
  .input-row { display: flex; gap: 8px; }
  input[type="number"] {
    background: #080c14;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: #fff;
    padding: 8px 10px;
    font-size: 13px;
    width: 100%;
    outline: none;
  }
  input[type="number"]:focus { border-color: var(--accent); }
  button {
    background: #1e293b;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 7px 12px;
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
  .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .log-box {
    background: #080d18;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px;
    font-family: monospace;
    font-size: 11px;
    color: #38bdf8;
    max-height: 140px;
    overflow-y: auto;
    line-height: 1.5;
  }
  .tips-card {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #fbbf24;
    line-height: 1.6;
  }
  svg { width: 100%; height: 100%; }
  .node-circle {
    fill: #1e293b;
    stroke: #38bdf8;
    stroke-width: 2.5px;
    transition: all 0.4s ease;
    cursor: pointer;
  }
  .node-circle.unbalanced {
    stroke: #ef4444;
    fill: rgba(239, 68, 68, 0.2);
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.6));
  }
  .node-text { fill: #f1f5f9; font-size: 13px; font-weight: 700; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
  .bf-pill { font-size: 10px; font-weight: 700; text-anchor: middle; dominant-baseline: central; fill: #fbbf24; }
  .tree-line { stroke: #334155; stroke-width: 2px; transition: all 0.4s ease; }
  .stats-bar {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    z-index: 10;
  }
  .stat-pill {
    background: rgba(18, 24, 39, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    color: var(--text-secondary);
  }
  .stat-pill b { color: var(--accent); }
</style>
</head>
<body>

<header>
  <h1><span>🌳</span> AVL 平衡二叉树四种自平衡旋转仿真实验</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 高频必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">节点旁黄色为平衡因子 BF (hL - hR)</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">插入新键值</div>
      <div class="input-row">
        <input type="number" id="nodeValue" placeholder="如 25" value="15" min="1" max="999">
        <button class="primary" onclick="insertFromInput()">插入</button>
      </div>
    </div>

    <div class="controls-group">
      <div class="label">4 种经典失衡旋转预设</div>
      <div class="preset-grid">
        <button onclick="runPreset('LL')">🔄 LL 型 (右旋)</button>
        <button onclick="runPreset('RR')">🔄 RR 型 (左旋)</button>
        <button onclick="runPreset('LR')">🔁 LR 型 (先左后右)</button>
        <button onclick="runPreset('RL')">🔁 RL 型 (先右后左)</button>
      </div>
      <button onclick="resetTree()" style="margin-top: 4px; color: #ef4444; border-color: rgba(239,68,68,0.3);">🗑️ 清空重置树</button>
    </div>

    <div class="controls-group">
      <div class="label">旋转调优过程日志</div>
      <div class="log-box" id="logBox">准备就绪，请插入节点或点击预设。</div>
    </div>

    <div class="tips-card">
      <b>💡 408 考场秒杀口诀：</b><br>
      • 寻找最小失衡节点 A（回溯首个 |BF| > 1 处）<br>
      • LL型：在 A 处做【右单旋】<br>
      • RR型：在 A 处做【左单旋】<br>
      • LR型：左孩子左旋，A 处右旋<br>
      • RL型：右孩子右旋，A 处左旋<br>
      • 牢记：<b>旋转前后中序遍历次序永不改变！</b>
    </div>
  </div>

  <div class="panel canvas-panel">
    <div class="stats-bar">
      <div class="stat-pill">节点数: <b id="statCount">0</b></div>
      <div class="stat-pill">树高度: <b id="statHeight">0</b></div>
      <div class="stat-pill">平衡状态: <b id="statStatus" style="color: #10b981;">平衡</b></div>
    </div>
    <svg id="treeSvg"></svg>
  </div>
</div>

<script>
class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.bf = 0;
    this.x = 0;
    this.y = 0;
  }
}

let root = null;
const logBox = document.getElementById('logBox');

function log(msg) {
  logBox.innerHTML += '<div>> ' + msg + '</div>';
  logBox.scrollTop = logBox.scrollHeight;
}

function clearLog() {
  logBox.innerHTML = '';
}

function getHeight(node) {
  return node ? node.height : 0;
}

function updateNodeProps(node) {
  if (!node) return;
  const hl = getHeight(node.left);
  const hr = getHeight(node.right);
  node.height = Math.max(hl, hr) + 1;
  node.bf = hl - hr;
}

function rightRotate(y) {
  log('<span style="color: #fbbf24;">⚡ [右单旋]</span> 围绕节点 ' + y.val + ' 向右旋转');
  const x = y.left;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateNodeProps(y);
  updateNodeProps(x);
  return x;
}

function leftRotate(x) {
  log('<span style="color: #fbbf24;">⚡ [左单旋]</span> 围绕节点 ' + x.val + ' 向左旋转');
  const y = x.right;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateNodeProps(x);
  updateNodeProps(y);
  return y;
}

function insertNode(node, val) {
  if (!node) {
    log('➕ 创建新节点 [' + val + ']');
    return new AVLNode(val);
  }
  if (val < node.val) {
    node.left = insertNode(node.left, val);
  } else if (val > node.val) {
    node.right = insertNode(node.right, val);
  } else {
    log('⚠️ 节点 [' + val + '] 已存在，跳过');
    return node;
  }

  updateNodeProps(node);
  const balance = node.bf;

  // 1. LL 型
  if (balance > 1 && node.left && val < node.left.val) {
    log('🚨 检测到节点 ' + node.val + ' (BF=' + balance + ') 发生 <b style="color:#ef4444">LL 型失衡</b>！执行右单旋');
    return rightRotate(node);
  }
  // 2. RR 型
  if (balance < -1 && node.right && val > node.right.val) {
    log('🚨 检测到节点 ' + node.val + ' (BF=' + balance + ') 发生 <b style="color:#ef4444">RR 型失衡</b>！执行左单旋');
    return leftRotate(node);
  }
  // 3. LR 型
  if (balance > 1 && node.left && val > node.left.val) {
    log('🚨 检测到节点 ' + node.val + ' (BF=' + balance + ') 发生 <b style="color:#ef4444">LR 型失衡</b>！先左旋其左孩子，再右旋根');
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }
  // 4. RL 型
  if (balance < -1 && node.right && val < node.right.val) {
    log('🚨 检测到节点 ' + node.val + ' (BF=' + balance + ') 发生 <b style="color:#ef4444">RL 型失衡</b>！先右旋其右孩子，再左旋根');
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }

  return node;
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

function assignCoordinates(node, x, y, spread) {
  if (!node) return;
  node.x = x;
  node.y = y;
  const nextSpread = Math.max(spread * 0.52, 28);
  if (node.left) assignCoordinates(node.left, x - spread, y + 64, nextSpread);
  if (node.right) assignCoordinates(node.right, x + spread, y + 64, nextSpread);
}

function renderTree() {
  const svg = document.getElementById('treeSvg');
  svg.innerHTML = '';
  if (!root) {
    document.getElementById('statCount').innerText = '0';
    document.getElementById('statHeight').innerText = '0';
    document.getElementById('statStatus').innerText = '空树';
    document.getElementById('statStatus').style.color = '#94a3b8';
    return;
  }

  const hTree = getHeight(root);
  const vWidth = Math.max(520, svg.clientWidth || 600);
  const vHeight = Math.max(280, hTree * 68 + 60);
  svg.setAttribute('viewBox', '0 0 ' + vWidth + ' ' + vHeight);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  assignCoordinates(root, vWidth / 2, 48, vWidth * 0.22);

  // 绘制连线
  function drawLines(node) {
    if (!node) return;
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', node.left.x);
      line.setAttribute('y2', node.left.y);
      line.setAttribute('class', 'tree-line');
      svg.appendChild(line);
      drawLines(node.left);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x);
      line.setAttribute('y1', node.y);
      line.setAttribute('x2', node.right.x);
      line.setAttribute('y2', node.right.y);
      line.setAttribute('class', 'tree-line');
      svg.appendChild(line);
      drawLines(node.right);
    }
  }
  drawLines(root);

  // 绘制节点
  function drawNodes(node) {
    if (!node) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '18');
    const isUnbalanced = Math.abs(node.bf) > 1;
    circle.setAttribute('class', 'node-circle' + (isUnbalanced ? ' unbalanced' : ''));
    g.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y);
    text.setAttribute('class', 'node-text');
    text.textContent = node.val;
    g.appendChild(text);

    // BF 标记角标
    const bfText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    bfText.setAttribute('x', node.x + 18);
    bfText.setAttribute('y', node.y - 14);
    bfText.setAttribute('class', 'bf-pill');
    bfText.textContent = (node.bf > 0 ? '+' : '') + node.bf;
    g.appendChild(bfText);

    svg.appendChild(g);
    drawNodes(node.left);
    drawNodes(node.right);
  }
  drawNodes(root);

  const total = countNodes(root);
  const h = getHeight(root);
  document.getElementById('statCount').innerText = total;
  document.getElementById('statHeight').innerText = h;
  document.getElementById('statStatus').innerText = '已保持平衡 (AVL)';
  document.getElementById('statStatus').style.color = '#10b981';
}

function insertVal(v) {
  root = insertNode(root, v);
  renderTree();
}

function insertFromInput() {
  const inp = document.getElementById('nodeValue');
  const v = parseInt(inp.value, 10);
  if (isNaN(v)) return;
  insertVal(v);
  inp.value = Math.floor(Math.random() * 90) + 10;
}

function resetTree() {
  root = null;
  clearLog();
  log('已清空平衡树');
  renderTree();
}

function runPreset(type) {
  resetTree();
  log('<b>🚀 正在演示 ' + type + ' 型失衡旋转过程...</b>');
  let seq = [];
  if (type === 'LL') seq = [30, 20, 10];
  else if (type === 'RR') seq = [10, 20, 30];
  else if (type === 'LR') seq = [30, 10, 20];
  else if (type === 'RL') seq = [10, 30, 20];

  seq.forEach((val, idx) => {
    setTimeout(() => {
      insertVal(val);
    }, idx * 400);
  });
}

window.addEventListener('resize', renderTree);
runPreset('LR');
</script>
</body>
</html>`
}
