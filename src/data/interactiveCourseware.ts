export interface InteractiveCoursewareItem {
  id: string
  title: string
  domain: 'cs_408' | 'math'
  subject: string
  difficulty: string
  tags: string[]
  summary: string
  embedHtml?: string
  rawPath?: string
  learningPoints: string[]
}

export const INTERACTIVE_COURSEWARES: InteractiveCoursewareItem[] = [
  {
    id: 'cw-cpu-pipeline',
    title: '💻 CPU 五级指令流水线冲突与冒险动态仿真',
    domain: 'cs_408',
    subject: '计算机组成原理',
    difficulty: '高频重难点',
    tags: ['408', '计组', '流水线', 'RAW冒险', 'Forwarding', '仿真'],
    summary: '单步仿真 MIPS 五级指令流水线（IF-ID-EX-MEM-WB），动态观察 RAW 数据冲突、Stall 气泡插入与数据旁路 (Forwarding) 消除延迟效果。',
    rawPath: 'raw-sources/408计算机/交互课件/CPU五级流水线冲突与冒险仿真.html',
    learningPoints: [
      'RAW (写后读) 是真实数据依赖，必须保证写回或转发',
      '无旁路时硬件必须插入 2 拍气泡',
      '开启 Forwarding 后结果直接从 ALU 或 MEM 级旁路输入下一指令'
    ]
  },
  {
    id: 'cw-taylor-approx',
    title: '📐 考研高等数学 · 麦克劳林/泰勒多项式局部动态逼近',
    domain: 'math',
    subject: '高等数学',
    difficulty: '核心考点',
    tags: ['考研数学', '高等数学', '泰勒公式', '逼近', '极限'],
    summary: '调节多项式阶数 n（1 到 9 阶），在 Canvas 上实时对比 sin(x)、cos(x)、e^x 真实曲线与泰勒近似曲线，深刻直观理解佩亚诺余项 o(x^n) 的收敛范围。',
    rawPath: 'raw-sources/考研数学/交互课件/泰勒展开式多项式拟合阶数动态可视化.html',
    learningPoints: [
      '展开阶数越高，多项式吻合真实函数曲线的区间半径越大',
      '做题时分子分母需“上下同阶展开到第一非零最低阶”',
      '差式中若首项抵消，必须向后多展一阶方可保证精度'
    ]
  },
  {
    id: 'cw-page-replacement',
    title: '🔄 虚拟内存页面置换算法动态模拟 (LRU vs FIFO)',
    domain: 'cs_408',
    subject: '操作系统',
    difficulty: '真题必考',
    tags: ['408', '操作系统', '虚拟内存', 'LRU', 'FIFO', '缺页异常'],
    summary: '动态演练访问序列 [7, 0, 1, 2, 0, 3, 0, 4, 2, 3] 在 3 个物理块中的分配过程，实时高亮命中与缺页中断，直观揭示 Belady 异常。',
    embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  body { background: #0b0f19; color: #f1f5f9; font-family: -apple-system, sans-serif; padding: 20px; }
  h2 { font-size: 18px; color: #38bdf8; margin-bottom: 12px; }
  .controls { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }
  button { background: #2563eb; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover { background: #1d4ed8; }
  .frames { display: flex; gap: 8px; margin-top: 16px; }
  .frame-box { width: 60px; height: 60px; border: 2px dashed #475569; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #38bdf8; background: #0f172a; }
  .frame-box.hit { border-color: #10b981; color: #10b981; background: #064e3b/30; }
  .frame-box.miss { border-color: #ef4444; color: #fca5a5; background: #450a0a/30; }
  .stats { margin-top: 20px; font-size: 13px; color: #94a3b8; }
</style>
</head>
<body>
<h2>🔄 虚拟内存请求分页置换动态演练</h2>
<div class="controls">
  <button onclick="stepNext()">单步访问下一个页面</button>
  <button onclick="reset()">重置</button>
  <span id="pageInfo" style="font-size: 13px; color: #f59e0b;">准备就绪</span>
</div>
<div style="font-size: 13px; color: #94a3b8;">访问串: <span id="seqText">7, 0, 1, 2, 0, 3, 0, 4, 2, 3</span></div>
<div class="frames" id="framesContainer"></div>
<div class="stats" id="statsInfo">缺页次数: 0 | 缺页率: 0%</div>

<script>
const seq = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3];
let currentStep = 0;
let frames = [null, null, null];
let misses = 0;

function render() {
  const c = document.getElementById('framesContainer');
  c.innerHTML = '';
  frames.forEach((val, i) => {
    const div = document.createElement('div');
    div.className = 'frame-box';
    div.innerText = val !== null ? val : '-';
    c.appendChild(div);
  });
}

function stepNext() {
  if (currentStep >= seq.length) {
    document.getElementById('pageInfo').innerText = '访问串已演示完毕！';
    return;
  }
  const page = seq[currentStep];
  const hit = frames.includes(page);
  if (!hit) {
    misses++;
    frames.shift();
    frames.push(page);
    document.getElementById('pageInfo').innerText = '访问页面 ' + page + ' ❌ 缺页中断！淘汰旧页，换入 ' + page;
  } else {
    document.getElementById('pageInfo').innerText = '访问页面 ' + page + ' ✅ 快表/页表命中！无需置换';
  }
  currentStep++;
  render();
  const rate = Math.round((misses / currentStep) * 100);
  document.getElementById('statsInfo').innerText = '当前步数: ' + currentStep + '/' + seq.length + ' | 缺页次数: ' + misses + ' | 缺页率: ' + rate + '%';
}

function reset() {
  currentStep = 0;
  frames = [null, null, null];
  misses = 0;
  document.getElementById('pageInfo').innerText = '已重置';
  document.getElementById('statsInfo').innerText = '缺页次数: 0 | 缺页率: 0%';
  render();
}

render();
</script>
</body>
</html>`,
    learningPoints: [
      'FIFO 队列先进先出，实现最简单但缺页率通常偏高',
      'LRU 优先淘汰最久未被访问的页面，命中率最优但需硬件栈或时间戳支持',
      '通过仿真可亲眼看到哪些页面引发了缺页中断与淘汰'
    ]
  }
]
