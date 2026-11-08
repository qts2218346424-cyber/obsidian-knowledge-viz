import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const pvSyncMutexCourseware: InteractiveCoursewareItem = {
  id: 'cw-pv-sync-mutex',
  title: '🚦 进程同步与互斥：经典 PV 操作与信号量死锁仿真器',
  domain: 'cs_408',
  subject: '操作系统',
  difficulty: '每年必考大题',
  tags: ['408', '操作系统', '进程管理', '同步互斥', 'PV操作', '信号量', '生产者消费者', '死锁'],
  summary: '经典有界缓冲区生产者-消费者模型动态仿真。可视化展示互斥信号量 mutex 与资源信号量 empty、full 的动态增减；支持切换“正序（安全）”与“逆序（颠倒 P 操作死锁）”模式，直观揭秘 408 考场大题核心致命陷阱。',
  learningPoints: [
    '互斥信号量 mutex 初始值为 1，保护临界资源缓冲区独占访问',
    '资源信号量 empty 初始为 N（空闲槽位），full 初始为 0（已填充产品数）',
    '考场一票否决陷阱：P(empty) 与 P(mutex) 的顺序绝对不能颠倒！若先 P(mutex) 后 P(empty)，缓冲区满时生产者占有互斥锁进入等待，消费者无法获取互斥锁取货，瞬间发生死锁！',
    'V 操作释放资源的顺序通常可以任意，不会引发死锁'
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
    --prod-color: #10b981;
    --cons-color: #ec4899;
    --deadlock: #ef4444;
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
  button.prod { background: #059669; border-color: #10b981; color: #fff; }
  button.prod:hover { background: #047857; }
  button.cons { background: #db2777; border-color: #ec4899; color: #fff; }
  button.cons:hover { background: #be185d; }
  .buffer-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
  }
  .slot-box {
    width: 60px;
    height: 60px;
    border: 2px dashed #475569;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: #080c14;
    transition: all 0.3s;
  }
  .slot-box.filled {
    border-style: solid;
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
    filter: drop-shadow(0 0 8px rgba(16,185,129,0.3));
  }
  .sema-bar {
    display: flex;
    gap: 12px;
    background: #080c14;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    justify-content: space-around;
  }
  .sema-chip {
    text-align: center;
    font-family: monospace;
    font-size: 13px;
  }
  .sema-chip b { font-size: 16px; margin-left: 4px; }
  .tips-card {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    border-radius: 8px;
    padding: 10px;
    font-size: 11px;
    color: #f87171;
    line-height: 1.6;
  }
</style>
</head>
<body>

<header>
  <h1><span>🚦</span> 生产者-消费者 PV 操作与死锁避坑动态仿真器</h1>
  <div style="display: flex; gap: 8px; align-items: center;">
    <span class="badge">408 操作系统必考</span>
    <span style="font-size: 11px; color: var(--text-secondary);">缓冲区容量 N=5 · 信号量互斥与同步协同</span>
  </div>
</header>

<div class="layout">
  <div class="panel">
    <div class="controls-group">
      <div class="label">P 操作顺序模式</div>
      <select id="pOrder" onchange="resetAll()" style="background:#080c14; color:#fff; border:1px solid var(--border-color); padding:8px; border-radius:6px; font-size:12px;">
        <option value="safe" selected>✅ 正确顺序：先 P(empty) 后 P(mutex)</option>
        <option value="bug">❌ 错误顺序：先 P(mutex) 后 P(empty) (致命死锁)</option>
      </select>
    </div>

    <div class="controls-group">
      <div class="label">进程动作触发</div>
      <button class="prod" onclick="produce()">📦 生产者发起生产 (Produce)</button>
      <button class="cons" onclick="consume()">🛒 消费者发起消费 (Consume)</button>
      <button onclick="fillBuffer()" style="margin-top: 4px;">⚡ 快速填满缓冲区至 5/5</button>
      <button onclick="resetAll()" style="color:#ef4444; border-color:rgba(239,68,68,0.3);">🔄 重置系统</button>
    </div>

    <div class="controls-group">
      <div class="label">PV 操作时序与状态诊断</div>
      <div id="logBox" style="background: #080c14; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 11px; color: #cbd5e1; line-height: 1.6; min-height: 110px;">
        系统就绪。缓冲区空闲容量 empty=5，已填产品 full=0，互斥信号量 mutex=1。
      </div>
    </div>

    <div class="tips-card">
      <b>⚠️ 408 考场大题一票否决踩坑点：</b><br>
      • <b>死锁场景重现</b>：若先申请互斥锁 P(mutex)，当缓冲区已满时，生产者成功拿到锁进入临界区，接着执行 P(empty) 被挂起阻塞！<br>
      • 消费者想去取货释放 empty，却因为生产者拿着 mutex 无法进入临界区！双方互相死等，系统瞬间死锁！
    </div>
  </div>

  <div class="sim-panel">
    <div class="label">系统当前信号量实时数值状态</div>
    <div class="sema-bar">
      <div class="sema-chip" style="color:#38bdf8;">mutex: <b id="valMutex" style="color:#38bdf8;">1</b></div>
      <div class="sema-chip" style="color:#10b981;">empty: <b id="valEmpty" style="color:#10b981;">5</b></div>
      <div class="sema-chip" style="color:#ec4899;">full: <b id="valFull" style="color:#ec4899;">0</b></div>
    </div>

    <div style="margin-top: 24px;">
      <div class="label" style="text-align: center;">共享循环缓冲区 (Bounded Buffer · 5 个槽位)</div>
      <div class="buffer-row" id="slotsRow"></div>
    </div>

    <div id="deadlockBanner" style="display: none; margin-top: 20px; background: rgba(239,68,68,0.2); border: 1px solid #ef4444; border-radius: 10px; padding: 14px; text-align: center; color: #fca5a5;">
      <div style="font-size: 16px; font-weight: bold; color: #ef4444;">🚨 系统发生死锁 (DEADLOCK DETECTED)！</div>
      <div style="font-size: 12px; margin-top: 6px;">生产者占有 mutex 阻塞在 empty 上，消费者被 mutex 拦截在门外无法消费，系统陷入永久死等！</div>
    </div>
  </div>
</div>

<script>
const CAPACITY = 5;
let buffer = 0; // 当前存放的产品数
let mutex = 1;
let isDeadlocked = false;

function render() {
  document.getElementById('valMutex').innerText = mutex;
  document.getElementById('valEmpty').innerText = CAPACITY - buffer;
  document.getElementById('valFull').innerText = buffer;

  const row = document.getElementById('slotsRow');
  row.innerHTML = '';
  for (let i = 0; i < CAPACITY; i++) {
    const div = document.createElement('div');
    div.className = 'slot-box' + (i < buffer ? ' filled' : '');
    div.innerText = i < buffer ? '📦' : '';
    row.appendChild(div);
  }

  document.getElementById('deadlockBanner').style.display = isDeadlocked ? 'block' : 'none';
}

function resetAll() {
  buffer = 0;
  mutex = 1;
  isDeadlocked = false;
  document.getElementById('logBox').innerHTML = '系统已重置。缓冲区空闲。';
  render();
}

function produce() {
  if (isDeadlocked) return;
  const order = document.getElementById('pOrder').value;
  const log = document.getElementById('logBox');

  if (order === 'safe') {
    // 正确顺序：先 P(empty) 后 P(mutex)
    if (buffer >= CAPACITY) {
      log.innerHTML = '<span style="color:#f59e0b;">⏳ 生产者执行 P(empty) 阻塞！</span> 缓冲区已满 (empty=0)，等待消费者取货。';
      return;
    }
    // P(empty) -> P(mutex)
    mutex = 0;
    buffer++;
    // V(mutex) -> V(full)
    mutex = 1;
    log.innerHTML = '<span style="color:#10b981; font-weight:bold;">✅ 生产者成功生产一件产品！</span> 放入槽位 #' + buffer + '，并执行 V(full) 唤醒可能等待的消费者。';
  } else {
    // 错误顺序：先 P(mutex) 后 P(empty)
    if (buffer >= CAPACITY) {
      // 致命死锁触发！
      mutex = 0; // 抢占了锁
      isDeadlocked = true;
      log.innerHTML = '<span style="color:#ef4444; font-weight:bold;">🚨 触发致命死锁！</span><br>生产者先执行 P(mutex) 成功锁死临界区，接着执行 P(empty) 发现已满阻塞！锁未释放，消费者进不来，产生死锁！';
    } else {
      buffer++;
      log.innerHTML = '<span style="color:#10b981;">生产者暂未填满，侥幸未死锁。</span> 放入槽位 #' + buffer;
    }
  }
  render();
}

function consume() {
  if (isDeadlocked) {
    document.getElementById('logBox').innerHTML = '<span style="color:#ef4444; font-weight:bold;">❌ 消费者被堵在门外！</span> 生产者持有着互斥锁 mutex=0，消费者执行 P(mutex) 无法进入，死锁无法解开！';
    return;
  }
  const log = document.getElementById('logBox');
  if (buffer <= 0) {
    log.innerHTML = '<span style="color:#f59e0b;">⏳ 消费者执行 P(full) 阻塞！</span> 缓冲区为空 (full=0)，等待生产者供货。';
    return;
  }
  buffer--;
  log.innerHTML = '<span style="color:#ec4899; font-weight:bold;">🛒 消费者成功取走一件产品！</span> 释放槽位，并执行 V(empty) 通知生产者。';
  render();
}

function fillBuffer() {
  buffer = CAPACITY;
  render();
  document.getElementById('logBox').innerHTML = '⚡ 已将缓冲区全部塞满 (5/5)。此时可切换至错误顺序测试死锁！';
}

resetAll();
</script>
</body>
</html>`
}
