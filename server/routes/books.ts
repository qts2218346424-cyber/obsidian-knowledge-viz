import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'

export const booksRouter = Router()

// Configure multer for file uploads into raw-sources
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const domain = (req.body.domain as string) || 'math' // 'math' | 'cs_408'
    const category = (req.body.category as string) || '教材' // '教材' | '真题' | '辅导讲义' | '模拟题'
    
    let subDir = domain === 'cs_408' ? '408计算机' : '考研数学'
    let fullDest = path.join(config.vaultPath, 'raw-sources', subDir, category)
    
    if (!fs.existsSync(fullDest)) {
      fs.mkdirSync(fullDest, { recursive: true })
    }
    cb(null, fullDest)
  },
  filename: (_req, file, cb) => {
    // Handle UTF-8 encoding for Chinese filenames
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, originalName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

export interface BookItem {
  id: string
  name: string
  relativePath: string
  fullPath: string
  domain: 'cs_408' | 'math'
  category: string
  size: number
  ext: string
  lastModified: string
  isTextReadable: boolean
  isPdf: boolean
  isHtml: boolean
  fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text'
}

/**
 * Helper to generate a valid minimal PDF buffer
 */
function createSamplePdfBuffer(title: string, subtitle: string, bullets: string[]): Buffer {
  const contentStream = `BT
/F1 20 Tf
50 730 Td
(${title.replace(/[()]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(${subtitle.replace(/[()]/g, '')}) Tj
0 -40 Td
${bullets.map((b, i) => `(${i + 1}. ${b.replace(/[()]/g, '')}) Tj 0 -24 Td`).join('\n')}
ET`

  const body = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Length ${Buffer.byteLength(contentStream)} >>
stream
${contentStream}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000227 00000 n 
0000000305 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + Buffer.byteLength(contentStream)}
%%EOF`

  return Buffer.from(body, 'utf-8')
}

/**
 * Initialize high-yield courseware, handouts and PDFs if raw-sources is empty
 */
function ensureRawSourcesInitialized(vaultPath: string) {
  const rawSourcesDir = path.join(vaultPath, 'raw-sources')
  if (!fs.existsSync(rawSourcesDir)) {
    fs.mkdirSync(rawSourcesDir, { recursive: true })
  }

  // 1. CPU Pipeline Simulator HTML
  const cpuSimPath = path.join(rawSourcesDir, '408计算机', '交互课件', 'CPU五级流水线冲突与冒险仿真.html')
  if (!fs.existsSync(cpuSimPath)) {
    fs.mkdirSync(path.dirname(cpuSimPath), { recursive: true })
    fs.writeFileSync(cpuSimPath, `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>CPU 五级指令流水线冒险与冲突动态仿真</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body { background: #0b0f19; color: #f1f5f9; padding: 24px; min-height: 100vh; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
  h1 { font-size: 20px; color: #38bdf8; }
  .badge { background: #0369a1; color: #e0f2fe; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
  .controls { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
  button { background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s; }
  button:hover { background: #1d4ed8; }
  button.secondary { background: #334155; }
  button.secondary:hover { background: #475569; }
  .toggle-label { font-size: 13px; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #94a3b8; }
  .grid { display: grid; grid-template-columns: 160px repeat(8, 1fr); gap: 6px; margin-top: 16px; font-size: 13px; }
  .cell { padding: 12px 8px; border-radius: 6px; text-align: center; border: 1px solid #1e293b; background: #0f172a; }
  .cell.header { background: #1e293b; color: #94a3b8; font-weight: 600; }
  .stage-if { background: #1e3a8a; color: #93c5fd; border-color: #3b82f6; }
  .stage-id { background: #065f46; color: #6ee7b7; border-color: #10b981; }
  .stage-ex { background: #854d0e; color: #fde047; border-color: #eab308; }
  .stage-mem { background: #7c2d12; color: #fdba74; border-color: #f97316; }
  .stage-wb { background: #581c87; color: #d8b4fe; border-color: #a855f7; }
  .stage-stall { background: #450a0a; color: #fca5a5; border-color: #ef4444; }
  .info-box { margin-top: 24px; padding: 16px; border-radius: 10px; background: #1e293b/60; border: 1px solid #334155; }
  .info-title { font-size: 14px; font-weight: 600; color: #38bdf8; margin-bottom: 8px; }
  .info-desc { font-size: 13px; color: #94a3b8; line-height: 1.6; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>💻 CPU 五级指令流水线冲突与数据冒险动态模拟</h1>
    <p style="font-size: 12px; color: #64748b; margin-top: 4px;">408计算机组成原理必考重难点：RAW 数据相关与流水线气泡插入</p>
  </div>
  <span class="badge">408 交互仿真课件</span>
</div>

<div class="controls">
  <button id="stepBtn" onclick="nextCycle()">单步执行 (Next Cycle)</button>
  <button class="secondary" onclick="resetSim()">重置复位</button>
  <label class="toggle-label">
    <input type="checkbox" id="forwarding" onchange="resetSim()"> 开启数据旁路 (Data Forwarding)
  </label>
  <span id="cycleLabel" style="margin-left: auto; font-size: 13px; color: #38bdf8; font-weight: 600;">当前时钟周期: CC 1</span>
</div>

<div class="grid" id="pipelineGrid"></div>

<div class="info-box">
  <div class="info-title" id="hazardTitle">考点剖析：RAW (Read After Write) 数据相关</div>
  <div class="info-desc" id="hazardDesc">
    指令 1: <code>ADD R1, R2, R3</code> 在 WB 阶段写回 R1；<br>
    指令 2: <code>SUB R4, R1, R5</code> 在 ID 阶段就需要读取 R1。<br>
    在不开启 Forwarding 情况下，硬件必须插入 2 个 Stalls (气泡) 阻塞流水线；开启 Forwarding 后，数据在 EX 或 MEM 阶段直接旁路输入，仅需 0-1 拍延时！
  </div>
</div>

<script>
let currentCycle = 1;
const maxCycles = 8;
const instructions = [
  { name: 'I1: ADD R1, R2, R3', type: 'alu' },
  { name: 'I2: SUB R4, R1, R5', type: 'raw' },
  { name: 'I3: AND R6, R1, R7', type: 'alu' },
  { name: 'I4: OR  R8, R9, R10', type: 'alu' },
];

function renderGrid() {
  const grid = document.getElementById('pipelineGrid');
  grid.innerHTML = '';
  grid.appendChild(createCell('指令 / 周期', 'header'));
  for (let c = 1; c <= maxCycles; c++) {
    grid.appendChild(createCell('CC ' + c, 'header'));
  }

  const forwarding = document.getElementById('forwarding').checked;

  instructions.forEach((ins, idx) => {
    grid.appendChild(createCell(ins.name, 'header'));
    for (let c = 1; c <= maxCycles; c++) {
      let stage = '';
      let cls = '';
      if (!forwarding) {
        if (idx === 0) {
          if (c === 1) { stage = 'IF'; cls = 'stage-if'; }
          else if (c === 2) { stage = 'ID'; cls = 'stage-id'; }
          else if (c === 3) { stage = 'EX'; cls = 'stage-ex'; }
          else if (c === 4) { stage = 'MEM'; cls = 'stage-mem'; }
          else if (c === 5) { stage = 'WB'; cls = 'stage-wb'; }
        } else if (idx === 1) {
          if (c === 2) { stage = 'IF'; cls = 'stage-if'; }
          else if (c === 3) { stage = 'ID'; cls = 'stage-id'; }
          else if (c === 4 || c === 5) { stage = 'STALL'; cls = 'stage-stall'; }
          else if (c === 6) { stage = 'EX'; cls = 'stage-ex'; }
          else if (c === 7) { stage = 'MEM'; cls = 'stage-mem'; }
          else if (c === 8) { stage = 'WB'; cls = 'stage-wb'; }
        } else if (idx === 2) {
          if (c >= 4 && c <= 5) { stage = 'STALL'; cls = 'stage-stall'; }
          else if (c === 6) { stage = 'IF'; cls = 'stage-if'; }
          else if (c === 7) { stage = 'ID'; cls = 'stage-id'; }
          else if (c === 8) { stage = 'EX'; cls = 'stage-ex'; }
        }
      } else {
        const start = idx + 1;
        const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'];
        const stageIdx = c - start;
        if (stageIdx >= 0 && stageIdx < 5) {
          stage = stages[stageIdx];
          cls = 'stage-' + stage.toLowerCase();
        }
      }

      const isCurrent = (c === currentCycle);
      const cell = createCell(c <= currentCycle ? stage : '', cls);
      if (isCurrent && stage) {
        cell.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.8)';
        cell.style.fontWeight = 'bold';
      }
      grid.appendChild(cell);
    }
  });
}

function createCell(text, className) {
  const div = document.createElement('div');
  div.className = 'cell ' + (className || '');
  div.innerText = text;
  return div;
}

function nextCycle() {
  if (currentCycle < maxCycles) {
    currentCycle++;
    document.getElementById('cycleLabel').innerText = '当前时钟周期: CC ' + currentCycle;
    renderGrid();
  }
}

function resetSim() {
  currentCycle = 1;
  document.getElementById('cycleLabel').innerText = '当前时钟周期: CC 1';
  renderGrid();
}

renderGrid();
</script>
</body>
</html>`, 'utf-8')
  }

  // 2. Taylor Polynomial Interactive HTML
  const taylorSimPath = path.join(rawSourcesDir, '考研数学', '交互课件', '泰勒展开式多项式拟合阶数动态可视化.html')
  if (!fs.existsSync(taylorSimPath)) {
    fs.mkdirSync(path.dirname(taylorSimPath), { recursive: true })
    fs.writeFileSync(taylorSimPath, `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>泰勒展开式多项式逼近动态可视化</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body { background: #0b0f19; color: #f1f5f9; padding: 24px; min-height: 100vh; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 16px; }
  h1 { font-size: 20px; color: #ec4899; }
  .badge { background: #831843; color: #fbcfe8; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
  .controls { display: flex; gap: 20px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
  select, input { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; font-size: 13px; }
  canvas { background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; display: block; width: 100%; height: 380px; }
  .formula-box { margin-top: 16px; padding: 14px; background: #1e293b/80; border: 1px solid #334155; border-radius: 8px; font-size: 13px; color: #cbd5e1; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>📐 考研高等数学 · 麦克劳林/泰勒多项式局部动态逼近</h1>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">考研极限计算第一杀器：阶数越高，逼近范围越宽，佩亚诺余项 o(x^n) 误差越小</p>
  </div>
  <span class="badge">高等数学 核心课件</span>
</div>

<div class="controls">
  <label>目标函数:
    <select id="funcSelect" onchange="draw()">
      <option value="sin">sin(x)</option>
      <option value="cos">cos(x)</option>
      <option value="exp">e^x</option>
    </select>
  </label>
  <label>泰勒展开阶数 n: <span id="nVal" style="color: #ec4899; font-weight: bold;">3</span>
    <input type="range" id="orderRange" min="1" max="9" step="2" value="3" oninput="updateOrder()">
  </label>
</div>

<canvas id="plotCanvas" width="800" height="380"></canvas>

<div class="formula-box">
  <strong>核心考点公式：</strong>
  <span id="formulaText" style="color: #38bdf8; font-family: monospace;">sin(x) = x - x^3/3! + o(x^3)</span>
  <br>
  <span style="color: #94a3b8; font-size: 12px; margin-top: 4px; display: inline-block;">
    【做题准则】分子分母“同阶展开原则”：上下同阶展开到第一不为零的最低非零项！若减法抵消，必须往后多展一阶！
  </span>
</div>

<script>
const canvas = document.getElementById('plotCanvas');
const ctx = canvas.getContext('2d');

function updateOrder() {
  document.getElementById('nVal').innerText = document.getElementById('orderRange').value;
  draw();
}

function factorial(k) {
  let res = 1;
  for (let i = 2; i <= k; i++) res *= i;
  return res;
}

function taylorVal(fn, n, x) {
  let sum = 0;
  if (fn === 'sin') {
    for (let k = 0; 2*k + 1 <= n; k++) {
      const p = 2*k + 1;
      sum += (k % 2 === 0 ? 1 : -1) * Math.pow(x, p) / factorial(p);
    }
  } else if (fn === 'cos') {
    for (let k = 0; 2*k <= n; k++) {
      const p = 2*k;
      sum += (k % 2 === 0 ? 1 : -1) * Math.pow(x, p) / factorial(p);
    }
  } else if (fn === 'exp') {
    for (let k = 0; k <= n; k++) {
      sum += Math.pow(x, k) / factorial(k);
    }
  }
  return sum;
}

function realVal(fn, x) {
  if (fn === 'sin') return Math.sin(x);
  if (fn === 'cos') return Math.cos(x);
  if (fn === 'exp') return Math.exp(x);
  return 0;
}

function draw() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const scaleX = 60;
  const scaleY = 60;

  // Draw axes
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cy); ctx.lineTo(w, cy);
  ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
  ctx.stroke();

  const fn = document.getElementById('funcSelect').value;
  const n = parseInt(document.getElementById('orderRange').value, 10);

  // Update formula text
  if (fn === 'sin') {
    document.getElementById('formulaText').innerText = 'sin(x) = x - x^3/6 + x^5/120 - ... + o(x^' + n + ')';
  } else if (fn === 'cos') {
    document.getElementById('formulaText').innerText = 'cos(x) = 1 - x^2/2 + x^4/24 - ... + o(x^' + n + ')';
  } else {
    document.getElementById('formulaText').innerText = 'e^x = 1 + x + x^2/2! + ... + x^' + n + '/' + n + '! + o(x^' + n + ')';
  }

  // Draw Real Curve (Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let px = 0; px <= w; px += 2) {
    const x = (px - cx) / scaleX;
    const y = realVal(fn, x);
    const py = cy - y * scaleY;
    if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Draw Taylor Approximation Curve (Pink)
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let px = 0; px <= w; px += 2) {
    const x = (px - cx) / scaleX;
    const y = taylorVal(fn, n, x);
    const py = cy - y * scaleY;
    if (py < -200 || py > h + 200) continue;
    if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Legend
  ctx.fillStyle = '#10b981';
  ctx.fillText('真实函数 f(x)', 20, 25);
  ctx.fillStyle = '#ec4899';
  ctx.fillText('n = ' + n + ' 阶泰勒多项式 P_n(x)', 130, 25);
}

draw();
</script>
</body>
</html>`, 'utf-8')
  }

  // 3. High-Yield Markdown Handout for 408
  const csHandoutPath = path.join(rawSourcesDir, '408计算机', '辅导讲义', '408计算机系统全科高频必考讲义.md')
  if (!fs.existsSync(csHandoutPath)) {
    fs.mkdirSync(path.dirname(csHandoutPath), { recursive: true })
    fs.writeFileSync(csHandoutPath, `---
title: 408 计算机统考四大基础核心讲义精选
type: lecture_handout
domain: cs_408
subject: 综合
tags: [408, 讲义, 数据结构, 操作系统, 计组, 计网]
date: 2026-09-18
---

# 408 计算机统考四大核心科目高频讲义

> **导学提示**：本讲义提炼自全国统考历年真题核心高频考点，专为冲刺 120+ 分设计。

---

## 模块一：数据结构与算法精要

### 1. 树与二叉树的核心遍历与性质
- **二叉树节点度数公式**：
  $$n = n_0 + n_1 + n_2 = n_1 + 2n_2 + 1 \implies n_0 = n_2 + 1$$
  *叶子节点数永远比双分支节点数多 1*！
- **平衡二叉树 (AVL)**：
  任一节点左子树与右子树高度差绝对值不超过 1。调整包括 LL, RR, LR, RL 旋转。
  - $N_h$ 为高度为 $h$ 的 AVL 树所含的最少节点数：
    $$N_h = N_{h-1} + N_{h-2} + 1 \quad (N_0 = 0, N_1 = 1, N_2 = 2, N_3 = 4)$$

### 2. 经典内部排序算法时空复杂度对决
| 排序算法 | 平均时间 | 最坏时间 | 空间复杂度 | 稳定性 |
| :--- | :--- | :--- | :--- | :--- |
| **快速排序 (Quick Sort)** | $O(n\\log n)$ | $O(n^2)$ | $O(\\log n)$ | 不稳定 |
| **归并排序 (Merge Sort)** | $O(n\\log n)$ | $O(n\\log n)$ | $O(n)$ | 稳定 |
| **堆排序 (Heap Sort)** | $O(n\\log n)$ | $O(n\\log n)$ | $O(1)$ | 不稳定 |

---

## 模块二：操作系统并发与内存管理

### 1. 经典进程同步 PV 信号量机制
- **互斥信号量**：初值置为 1，\`P(mutex)\` 与 \`V(mutex)\` 必须成对出现；
- **同步信号量**：初值置为资源初始数量，前驱操作后 \`V(S)\`，后继操作前 \`P(S)\`。

### 2. 请求分页虚拟内存与页面置换
- **逻辑地址转换为物理地址**：
  - 页号 $P = \\lfloor A / L \\rfloor$，页内偏移量 $W = A \\% L$；
  - 查快表 (TLB) $\\to$ 查页表 (Page Table) $\\to$ 缺页中断 (Page Fault) $\\to$ 页面置换。
- **经典算法**：
  - **FIFO**：先进先出（会出现 Belady 异常，即分配物理块增多缺页次数反而增加）；
  - **LRU**：最近最久未使用（基于局部性原理，性能最接近理论最优 OPT）。

---

## 模块三：计算机组成原理流水线与Cache

### 1. 指令流水线相关与冒险
- **RAW (Read After Write) 数据相关**：后一条指令需读取前一条尚未写回的目标寄存器；
- **解决方案**：
  1. 硬件插入流水线气泡 (Stall)；
  2. 编译器延迟调度指令重排；
  3. **数据旁路 (Forwarding)**：直接将 ALU 计算结果送入下一指令输入端。

### 2. Cache-主存映射机制
- **直接映射**：主存块号 $\\bmod$ Cache总行数；
- **全相联映射**：主存块可调入 Cache 任一行，命中率最高但硬件比较代价昂贵；
- **组相联映射**：主存块号 $\\bmod$ Cache组数，组内自由存放。

---

## 模块四：计算机网络高频必考协议

### 1. TCP 三次握手与四次挥手状态机
- **三次握手**：
  1. 客户端发送 \`SYN=1, seq=x\` $\\to$ 客户端进入 \`SYN-SENT\`；
  2. 服务端回复 \`SYN=1, ACK=1, seq=y, ack=x+1\` $\\to$ 服务端进入 \`SYN-RCVD\`；
  3. 客户端回复 \`ACK=1, seq=x+1, ack=y+1\` $\\to$ 双方进入 \`ESTABLISHED\`。
- **四次挥手 TIME-WAIT 状态**：
  客户端在收到服务端最后的 FIN 并发送 ACK 后，必须等待 **2MSL**（最大报文段生存时间）才能完全关闭。
`, 'utf-8')
  }

  // 4. High-Yield Markdown Handout for Math
  const mathHandoutPath = path.join(rawSourcesDir, '考研数学', '辅导讲义', '考研高等数学泰勒展开与极限求解七大武器.md')
  if (!fs.existsSync(mathHandoutPath)) {
    fs.mkdirSync(path.dirname(mathHandoutPath), { recursive: true })
    fs.writeFileSync(mathHandoutPath, `---
title: 考研数学高等数学：极限计算七种武器与泰勒精要
type: lecture_handout
domain: math
subject: 高等数学
tags: [考研数学, 高等数学, 泰勒公式, 极限, 讲义]
date: 2026-09-18
---

# 考研数学极限求解“七种武器”与泰勒公式核心讲义

> **导学提示**：极限是考研高等数学的基石，占分 10~15 分，也是后续连续、导数与积分的前提。

---

## 武器一：常用等价无穷小代换体系 ($x \\to 0$)

- $\\sin x \\sim x$
- $\\tan x \\sim x$
- $\\arcsin x \\sim x$
- $\\arctan x \\sim x$
- $e^x - 1 \\sim x$
- $\\ln(1+x) \\sim x$
- $1 - \\cos x \\sim \\frac{1}{2}x^2$
- $(1+x)^\\alpha - 1 \\sim \\alpha x$

> **⚠️ 易错防坑定律**：
> 等价无穷小代换**只能在乘除因式中自由使用**！在加减项中代换必须满足 $\\lim \\frac{A-B}{A'-B'} = 1$，否则会造成严重丢项错误！

---

## 武器二：泰勒展开式核心七大公式 (麦克劳林展开)

当 $x \\to 0$ 时，必须熟记到 $x^3$ 或 $x^4$ 阶：

1. **正弦展开**：
   $$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} + o(x^5)$$
2. **余弦展开**：
   $$\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} + o(x^4)$$
3. **正切展开**：
   $$\\tan x = x + \\frac{x^3}{3} + o(x^3)$$
4. **反切展开**：
   $$\\arctan x = x - \\frac{x^3}{3} + o(x^3)$$
5. **对数展开**：
   $$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + o(x^4)$$
6. **指数展开**：
   $$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3)$$
7. **二项式展开**：
   $$(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + o(x^2)$$

---

## 武器三：洛必达法则的使用准则
1. 必须是 $\\frac{0}{0}$ 或 $\\frac{\\infty}{\\infty}$ 型；
2. 分子分母导数在去心邻域内存在，且分母导数不为 0；
3. **优先化简再求导**：先提取非零极限因子，先代换乘除项，切忌盲目暴力连求导！

---

## 武器四：$1^\\infty$ 型重要极限通解模板

若 $\\lim u(x) = 1, \\lim v(x) = \\infty$，则：
$$\\lim [u(x)]^{v(x)} = e^{\\lim [u(x)-1] \\cdot v(x)}$$

**秒杀三步走**：
1. 识别底数趋向 1，指数趋向无穷；
2. 写成 $e^{\\dots}$ 形式；
3. 计算 $[u(x)-1] \\cdot v(x)$ 的极限。
`, 'utf-8')
  }

  // 5. Seed sample PDF guides
  const csPdfPath = path.join(rawSourcesDir, '408计算机', '经典教材', '408计算机统考高频考点必背手册.pdf')
  if (!fs.existsSync(csPdfPath)) {
    fs.mkdirSync(path.dirname(csPdfPath), { recursive: true })
    const pdfBuf = createSamplePdfBuffer(
      'CoreForge 408 Syllabus & High-Frequency Exam Guide',
      'Computer Systems & Core Data Structures (National Exam 408)',
      [
        'Data Structures: Balanced Trees, Hash Tables and Graph Traversal',
        'Computer Architecture: Pipelining Hazards and Cache Coherence',
        'Operating Systems: Concurrency Semaphores and Virtual Memory',
        'Computer Networks: TCP/IP Stack, Subnetting and Congestion Control'
      ]
    )
    fs.writeFileSync(csPdfPath, pdfBuf)
  }

  const mathPdfPath = path.join(rawSourcesDir, '考研数学', '经典教材', '考研高等数学核心公式与定理推导手册.pdf')
  if (!fs.existsSync(mathPdfPath)) {
    fs.mkdirSync(path.dirname(mathPdfPath), { recursive: true })
    const pdfBuf = createSamplePdfBuffer(
      'CoreForge Advanced Math Exam & Formula Handbook',
      'Calculus, Linear Algebra and Probability Theory',
      [
        'Limits and Taylor Expansion Seven Fundamental Formulas',
        'Differential Mean Value Theorems: Rolle, Lagrange and Cauchy',
        'Multiple Integrals, Symmetry Simplification and Polar Transformations',
        'Linear Algebra: Matrix Rank, Eigenvalues and Diagonalization'
      ]
    )
    fs.writeFileSync(mathPdfPath, pdfBuf)
  }
}

/**
 * Scan raw-sources directory for reference books, past papers and materials
 */
booksRouter.get('/books/list', (_req, res) => {
  try {
    ensureRawSourcesInitialized(config.vaultPath)
    const rawSourcesDir = path.join(config.vaultPath, 'raw-sources')
    if (!fs.existsSync(rawSourcesDir)) {
      res.json({ books: [] })
      return
    }

    const books: BookItem[] = []
    const readableExts = new Set(['.md', '.txt', '.markdown'])

    function scan(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scan(fullPath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          const stat = fs.statSync(fullPath)
          const relPath = path.relative(config.vaultPath, fullPath).replace(/\\/g, '/')
          
          let domain: 'cs_408' | 'math' = 'math'
          if (relPath.includes('408') || relPath.includes('数据结构') || relPath.includes('计算机') || relPath.includes('cs_408')) {
            domain = 'cs_408'
          }

          let category = '辅导讲义'
          if (relPath.includes('真题')) category = '历年真题'
          else if (relPath.includes('教材')) category = '经典教材'
          else if (relPath.includes('交互课件') || ext === '.html') category = '交互课件'
          else if (relPath.includes('辅导讲义') || relPath.includes('讲义')) category = '辅导讲义'
          else if (relPath.includes('模拟题')) category = '模拟题卷'

          const isPdf = ext === '.pdf'
          const isHtml = ext === '.html' || ext === '.htm'
          const isText = readableExts.has(ext)

          let fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text' = 'text'
          if (isPdf) fileType = 'pdf'
          else if (isHtml) fileType = 'html'
          else if (ext === '.md') fileType = 'handout'

          books.push({
            id: relPath,
            name: entry.name,
            relativePath: relPath,
            fullPath,
            domain,
            category,
            size: stat.size,
            ext,
            lastModified: stat.mtime.toISOString(),
            isTextReadable: isText,
            isPdf,
            isHtml,
            fileType,
          })
        }
      }
    }

    scan(rawSourcesDir)
    res.json({ books })
  } catch (err: any) {
    console.error('Failed to list books:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Raw file stream endpoint for PDF and HTML preview
 */
booksRouter.get('/books/raw', (req, res) => {
  try {
    const relPath = (req.query.path as string) || ''
    if (!relPath) {
      res.status(400).json({ error: 'Missing path parameter' })
      return
    }

    const fullPath = path.resolve(config.vaultPath, relPath)
    if (!fullPath.startsWith(path.resolve(config.vaultPath)) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'File not found' })
      return
    }

    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.html': 'text/html; charset=utf-8',
      '.htm': 'text/html; charset=utf-8',
      '.md': 'text/markdown; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(path.basename(fullPath))}"`)
    fs.createReadStream(fullPath).pipe(res)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Upload reference book / notes into raw-sources
 */
booksRouter.post('/books/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未选择任何上传文件' })
      return
    }

    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const relPath = path.relative(config.vaultPath, req.file.path).replace(/\\/g, '/')

    invalidateCache()
    res.json({
      success: true,
      file: {
        name: originalName,
        relativePath: relPath,
        size: req.file.size
      }
    })
  } catch (err: any) {
    console.error('Upload book error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Read text content from a readable material
 */
booksRouter.post('/books/read', (req, res) => {
  try {
    const { relativePath } = req.body as { relativePath: string }
    if (!relativePath) {
      res.status(400).json({ error: 'Missing relativePath' })
      return
    }

    const fullPath = path.resolve(config.vaultPath, relativePath)
    if (!fullPath.startsWith(path.resolve(config.vaultPath)) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'File not found' })
      return
    }

    const stat = fs.statSync(fullPath)
    // Only read if < 5MB text
    if (stat.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: '文件过大，不支持直接全文文本加载' })
      return
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    res.json({ content, name: path.basename(fullPath) })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * AI Extract: Read content, extract core concepts to wiki note, and generate practice questions
 */
booksRouter.post('/books/extract-ai', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { text, bookName, domain, subject } = req.body as {
      text: string
      bookName?: string
      domain: 'cs_408' | 'math'
      subject?: string
    }

    if (!text || text.trim().length < 10) {
      res.status(400).json({ error: '提取内容过短，请输入或提供有效的材料文本' })
      return
    }

    const prompt = `你是一个深谙全国硕士研究生招生考试（408计算机综合 与 考研数学）的顶级名师与命题专家。
请深度阅读以下提供的教材/真题/讲义文本片段，完成两项核心任务：

【输入资料】：
来源参考书：${bookName || '考研参考资料'}
学科领域：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'}（${subject || '综合'}）
文本内容：
"""
${text.slice(0, 6000)}
"""

【任务要求】：
1. 提炼 1 篇符合规范的高质量 Obsidian 知识库笔记 Markdown。
   - 包含准确的 YAML frontmatter (type: theorem / concept, tags, created)
   - 严谨的知识点讲解，数学公式必须使用标准的 KaTeX LaTeX 格式（行内 $...$，独立公式块 $$...$$）
   - 标注考研重难点、直观理解与典型易错点
2. 根据提炼的核心考点，命制 3 道高质量真题风格的选择题或填空题。
   - 每题必须包含：question, type (choice / blank), options (A, B, C, D 选项，如果是选择题), correctAnswer, explanation (分步深度推导), difficulty (简单/中等/困难)

请严格输出合法的 JSON 格式，不要添加任何 markdown 代码块标记以外的杂质：
{
  "note": {
    "title": "笔记标题（不含扩展名）",
    "suggestedPath": "wiki/建议存放子路径（例如：wiki/01-考研数学/高等数学/xxx.md 或 wiki/02-408计算机/数据结构/xxx.md）",
    "content": "完整的 Markdown 笔记正文（含frontmatter）"
  },
  "questions": [
    {
      "id": "gen-${Date.now()}-1",
      "domain": "${domain}",
      "subject": "${subject || (domain === 'cs_408' ? '数据结构' : '高等数学')}",
      "chapter": "提炼的章节名",
      "type": "choice",
      "difficulty": "中等",
      "question": "题干（支持LaTeX公式 $...$）",
      "options": {
        "A": "选项A内容",
        "B": "选项B内容",
        "C": "选项C内容",
        "D": "选项D内容"
      },
      "answer": "A",
      "explanation": "深度标准解析与定理推导",
      "tags": ["考研真题", "${subject || '核心考点'}"]
    }
  ]
}`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '你是一个严格输出结构化 JSON 的考研知识提炼引擎。必须只输出纯 JSON 对象，格式必须符合要求，严禁包含任何前缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const rawText = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    
    // Parse JSON
    let parsed: any = {}
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(rawText)
      }
    } catch (parseErr: any) {
      console.error('Failed to parse AI extraction JSON:', parseErr.message, rawText)
      res.status(500).json({ error: 'AI 响应解析失败，请重试', raw: rawText })
      return
    }

    // Automatically save note to user's Vault if requested
    let savedNotePath = ''
    if (parsed.note && parsed.note.suggestedPath && parsed.note.content) {
      try {
        const destPath = parsed.note.suggestedPath
        createFile(config.vaultPath, destPath, parsed.note.content)
        markSelfWrite(destPath)
        invalidateCache()
        savedNotePath = destPath
      } catch (saveErr: any) {
        console.warn('Note write warn:', saveErr.message)
      }
    }

    res.json({
      success: true,
      note: parsed.note,
      questions: parsed.questions || [],
      savedNotePath
    })
  } catch (err: any) {
    console.error('AI book extract error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
