import type { InteractiveCoursewareItem } from '../interactiveCourseware'
import { POLITICS_BASE_CSS, POLITICS_BASE_JS } from './_politicsShared'

export const surplusValueCourseware: InteractiveCoursewareItem = {
  id: 'cw-marx-surplus-value',
  title: '💰 马原政治经济学 · 剩余价值生产模拟器（绝对 / 相对剩余价值与资本构成）',
  domain: 'politics',
  subject: '马克思主义基本原理',
  difficulty: '每年必考',
  tags: ['考研政治', '马原', '政治经济学', '剩余价值', '绝对剩余价值', '相对剩余价值', '资本有机构成', '利润率'],
  summary:
    '拖动工作日长度、必要劳动时间与不变资本，实时观察 c、v、m 的价值构成变化，直观区分“延长工作日=绝对剩余价值”与“缩短必要劳动时间=相对剩余价值”，并同步计算剩余价值率 m′、利润率 p′ 与资本有机构成 c:v。',
  learningPoints: [
    '商品价值 W = c + v + m；c 转移旧价值，v 再生产劳动力价值，m 是工人创造的被无偿占有的价值',
    '剩余价值率 m′ = m / v = 剩余劳动时间 / 必要劳动时间；利润率 p′ = m / (c + v)，p′ 永远小于 m′',
    '绝对剩余价值：必要劳动时间不变，延长工作日；相对剩余价值：工作日不变，缩短必要劳动时间（依赖生产生活资料部门劳动生产率提高）',
    '超额剩余价值：个别企业率先提高劳动生产率，个别价值低于社会价值的差额，是相对剩余价值的直接动力',
    '资本有机构成 c:v 提高是资本主义积累的一般趋势，导致平均利润率下降趋势与相对过剩人口',
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${POLITICS_BASE_CSS}
  .bar { display: flex; height: 46px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); margin: 8px 0; }
  .seg { display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0b0f19; transition: width .25s; white-space: nowrap; overflow: hidden; }
  .seg.c { background: #64748b; color: #fff; } .seg.v { background: #38bdf8; } .seg.m { background: #f59e0b; }
  .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  input[type=range] { width: 100%; accent-color: #ef4444; cursor: pointer; }
  .kpi { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .kpi div { background: #080c14; border: 1px solid var(--border); border-radius: 8px; padding: 8px; text-align: center; font-size: 11px; color: var(--muted); }
  .kpi b { display: block; font-size: 17px; color: var(--amber); }
  .day { display: flex; height: 26px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border); margin-top: 4px; }
  .day .n { background: #38bdf8; } .day .s { background: #f59e0b; }
  .day span { display: flex; align-items: center; justify-content: center; font-size: 11px; color: #0b0f19; font-weight: 700; overflow: hidden; transition: width .25s; }
</style>
</head>
<body>
<header>
  <h1>💰 剩余价值生产模拟器</h1>
  <span class="badge">马原 · 政治经济学</span>
</header>

<div class="tabs">
  <div class="tab active" id="tabSim" onclick="showTab('sim')">实验模拟</div>
  <div class="tab" id="tabQuiz" onclick="showTab('quiz')">随堂自测</div>
</div>

<div id="viewSim">
<div class="grid2">
  <div class="panel">
    <h2>调节参数</h2>
    <div class="row"><span>工作日长度 L</span><b id="lVal">10 小时</b></div>
    <input type="range" id="L" min="6" max="16" step="1" value="10" oninput="update()">
    <div class="row" style="margin-top:10px"><span>必要劳动时间 t</span><b id="tVal">5 小时</b></div>
    <input type="range" id="T" min="2" max="8" step="1" value="5" oninput="update()">
    <div class="row" style="margin-top:10px"><span>不变资本 c（元/日）</span><b id="cVal">300</b></div>
    <input type="range" id="C" min="50" max="800" step="10" value="300" oninput="update()">
    <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
      <button class="act" onclick="absolute()">⏱ 延长工作日 +2h</button>
      <button class="act" onclick="relative()">⚙ 必要时间 -1h</button>
      <button class="act" onclick="resetAll()">重置</button>
    </div>
    <div class="tips" style="margin-top:12px">
      假设：工人每小时创造新价值 10 元，日工资等于劳动力价值 = 必要劳动时间 × 10。
    </div>
  </div>
  <div class="panel">
    <h2>价值构成 W = c + v + m</h2>
    <div class="bar"><div class="seg c" id="sc"></div><div class="seg v" id="sv"></div><div class="seg m" id="sm"></div></div>
    <div style="font-size:11px;color:var(--muted)">灰=不变资本 c　蓝=可变资本 v　橙=剩余价值 m</div>
    <h2 style="margin-top:12px">工作日结构</h2>
    <div class="day"><span class="n" id="dn"></span><span class="s" id="ds"></span></div>
    <div class="kpi">
      <div>剩余价值率 m′<b id="kM"></b></div>
      <div>利润率 p′<b id="kP"></b></div>
      <div>有机构成 c:v<b id="kO"></b></div>
    </div>
    <div class="tips" style="margin-top:12px" id="note"></div>
  </div>
</div>
</div>

<div id="viewQuiz" style="display:none">
  <div class="panel"><span class="score" id="score"></span> <button class="act" style="margin-left:8px" onclick="startQuiz()">重新作答</button></div>
  <div id="quizBox"></div>
</div>

<script>
${POLITICS_BASE_JS}
var UNIT = 10;
function $(id) { return document.getElementById(id); }
function showTab(t) {
  $('viewSim').style.display = t === 'sim' ? 'block' : 'none';
  $('viewQuiz').style.display = t === 'quiz' ? 'block' : 'none';
  $('tabSim').className = 'tab' + (t === 'sim' ? ' active' : '');
  $('tabQuiz').className = 'tab' + (t === 'quiz' ? ' active' : '');
  if (t === 'quiz' && !$('quizBox').firstChild) startQuiz();
}
function update(note) {
  var L = +$('L').value, T = +$('T').value, C = +$('C').value;
  if (T >= L) { T = L - 1; $('T').value = T; }
  var v = T * UNIT, m = (L - T) * UNIT, W = C + v + m;
  $('lVal').textContent = L + ' 小时'; $('tVal').textContent = T + ' 小时'; $('cVal').textContent = C;
  $('sc').style.width = (C / W * 100) + '%'; $('sc').textContent = 'c=' + C;
  $('sv').style.width = (v / W * 100) + '%'; $('sv').textContent = 'v=' + v;
  $('sm').style.width = (m / W * 100) + '%'; $('sm').textContent = 'm=' + m;
  $('dn').style.width = (T / L * 100) + '%'; $('dn').textContent = '必要 ' + T + 'h';
  $('ds').style.width = ((L - T) / L * 100) + '%'; $('ds').textContent = '剩余 ' + (L - T) + 'h';
  $('kM').textContent = Math.round(m / v * 100) + '%';
  $('kP').textContent = (m / (C + v) * 100).toFixed(1) + '%';
  $('kO').textContent = (C / v).toFixed(2) + ' : 1';
  $('note').innerHTML = note || '拖动滑块或点击按钮，观察 m′ 与 p′ 的变化。注意：p′ = m/(c+v) 恒小于 m′，因为分母多了 c。';
}
function absolute() {
  var L = Math.min(16, +$('L').value + 2); $('L').value = L;
  update('<b>绝对剩余价值生产</b>：必要劳动时间 t 不变，仅延长工作日，剩余劳动时间增加。它是资本主义生产的一般基础，受工作日生理与道德界限制约，引发工人为缩短工作日的斗争。');
}
function relative() {
  var T = Math.max(2, +$('T').value - 1); $('T').value = T;
  update('<b>相对剩余价值生产</b>：工作日长度不变，因生产生活资料的部门劳动生产率提高，劳动力价值下降，必要劳动时间缩短。它是资本主义发展的主要手段，由追逐超额剩余价值驱动。');
}
function resetAll() { $('L').value = 10; $('T').value = 5; $('C').value = 300; update(); }
function startQuiz() {
  renderQuiz('quizBox', [
    { q: '资本家通过延长工作日获得的剩余价值属于：', opts: ['绝对剩余价值', '相对剩余价值', '超额剩余价值', '平均利润'], exp: '必要劳动时间不变、延长工作日所得为绝对剩余价值。' },
    { q: '相对剩余价值生产得以实现的前提是：', opts: ['生产生活资料的部门劳动生产率提高，劳动力价值下降', '工人工资被压低到劳动力价值以下', '延长工人劳动时间', '提高商品的市场价格'], exp: '劳动力价值降低，必要劳动时间缩短，剩余劳动时间相对延长。' },
    { q: '某企业 c=400，v=100，m=100，则剩余价值率与利润率分别为：', opts: ['100% 与 20%', '25% 与 100%', '100% 与 25%', '20% 与 100%'], exp: "m′ = m/v = 100%；p′ = m/(c+v) = 100/500 = 20%。" },
    { q: '个别企业率先提高劳动生产率所获得的超额剩余价值，其来源是：', opts: ['商品个别价值低于社会价值的差额', '商品价格高于价值的部分', '流通环节的欺诈', '企业家的管理劳动'], exp: '超额剩余价值 = 社会价值 − 个别价值，一旦技术普及即消失。' },
    { q: '剩余价值的真正来源是：', opts: ['雇佣工人在剩余劳动时间内创造的价值', '资本家的资本本身', '生产资料的转移价值', '商品流通中的买卖差价'], exp: '劳动力商品的使用价值是价值的源泉，且能创造大于自身价值的价值。' },
    { q: '资本有机构成是指：', opts: ['由资本技术构成决定并反映技术构成变化的价值构成 c:v', '固定资本与流动资本之比', '生产资本与商品资本之比', '资本总额与利润之比'], exp: '有机构成 = 由技术构成决定、反映其变化的价值构成。' },
  ], 'score');
}
update();
</script>
</body>
</html>`,
}
