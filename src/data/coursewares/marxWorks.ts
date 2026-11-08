import type { InteractiveCoursewareItem } from '../interactiveCourseware'
import { POLITICS_BASE_CSS, POLITICS_BASE_JS } from './_politicsShared'

export const marxWorksCourseware: InteractiveCoursewareItem = {
  id: 'cw-marx-classic-works',
  title: '📚 马克思主义经典著作编年图谱（从《手稿》到《实践论》《矛盾论》）',
  domain: 'politics',
  subject: '马克思主义基本原理',
  difficulty: '选择题必背',
  tags: ['考研政治', '马原', '经典著作', '共产党宣言', '资本论', '德意志意识形态', '实践论', '矛盾论', '著作配对'],
  summary:
    '按时间顺序梳理马克思、恩格斯、列宁、毛泽东的 20 部经典著作，支持按作者筛选、点击展开核心观点与考点，并提供“观点配著作”“著作配观点”双向随机自测，攻克马原与毛中特中的著作配对题。',
  learningPoints: [
    '《共产党宣言》（1848）是马克思主义诞生的标志，提出“两个必然”和共产主义理想',
    '《关于费尔巴哈的提纲》与《德意志意识形态》标志唯物史观的创立',
    '《资本论》（第一卷 1867）通过剩余价值学说揭示资本主义剥削的秘密，是马克思主义政治经济学的巨著',
    '《哥达纲领批判》提出共产主义社会两个阶段及按劳分配原则',
    '《实践论》《矛盾论》（1937）是毛泽东哲学思想的代表作，是马克思主义哲学中国化的典范',
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${POLITICS_BASE_CSS}
  .tl { position: relative; padding-left: 22px; border-left: 2px solid var(--border); margin-left: 6px; }
  .node { position: relative; margin-bottom: 10px; }
  .node::before { content: ''; position: absolute; left: -29px; top: 12px; width: 10px; height: 10px; border-radius: 50%; background: var(--red); border: 2px solid var(--bg); }
  .node.en::before { background: var(--blue); } .node.ln::before { background: var(--amber); } .node.mz::before { background: var(--green); }
  .nh { background: #080c14; border: 1px solid var(--border); border-radius: 10px; padding: 9px 12px; cursor: pointer; }
  .nh:hover { border-color: var(--blue); }
  .yr { font-size: 11px; color: var(--amber); font-weight: 700; }
  .nt { font-size: 13px; font-weight: 700; }
  .au { font-size: 11px; color: var(--muted); }
  .nb { display: none; font-size: 12px; color: #cbd5e1; padding: 8px 12px 2px; }
  .nb b { color: var(--amber); }
</style>
</head>
<body>
<header>
  <h1>📚 经典著作编年图谱</h1>
  <span class="badge">马原 · 经典著作</span>
</header>
<div class="tabs">
  <div class="tab active" id="t1" onclick="show(1)">时间轴</div>
  <div class="tab" id="t2" onclick="show(2)">配对自测</div>
</div>

<div id="v1">
  <div class="tabs" id="filters"></div>
  <div class="tl" id="tl"></div>
</div>
<div id="v2" style="display:none">
  <div class="panel"><span class="score" id="score"></span>
    <button class="act" style="margin-left:8px" onclick="startQuiz()">重新抽题</button></div>
  <div id="quizBox"></div>
</div>

<script>
${POLITICS_BASE_JS}
function $(id) { return document.getElementById(id); }
var WORKS = [
  { y: '1843', a: 'M', au: '马克思', t: '《黑格尔法哲学批判》导言', k: '“理论一经掌握群众，也会变成物质力量”；指出无产阶级是实现人类解放的物质武器，哲学找到了无产阶级作为自己的物质武器。' },
  { y: '1844', a: 'M', au: '马克思', t: '《1844年经济学哲学手稿》', k: '提出异化劳动理论，早期从人本主义视角批判资本主义私有制，思想尚未完全成熟。' },
  { y: '1845', a: 'M', au: '马克思', t: '《关于费尔巴哈的提纲》', k: '批判旧唯物主义直观性，强调实践观点；“哲学家们只是用不同的方式解释世界，而问题在于改变世界”。被恩格斯称为“包含着新世界观的天才萌芽的第一个文件”。' },
  { y: '1845—46', a: 'ME', au: '马克思、恩格斯', t: '《德意志意识形态》', k: '第一次系统阐述历史唯物主义基本原理，标志唯物史观的创立。' },
  { y: '1847', a: 'M', au: '马克思', t: '《哲学的贫困》', k: '批判蒲鲁东的小资产阶级观点，较系统阐述唯物史观，首次公开表述科学社会主义的基本思想。' },
  { y: '1848', a: 'ME', au: '马克思、恩格斯', t: '《共产党宣言》', k: '马克思主义诞生的标志，第一个科学社会主义的纲领性文献。提出“两个必然”、阶级斗争推动历史发展，“两个决裂”，“自由人联合体”。' },
  { y: '1852', a: 'M', au: '马克思', t: '《路易·波拿巴的雾月十八日》', k: '分析法国阶级斗争，指出“人们自己创造自己的历史，但是他们并不是随心所欲地创造”。' },
  { y: '1859', a: 'M', au: '马克思', t: '《政治经济学批判》序言', k: '对唯物史观作出经典表述：生产力与生产关系、经济基础与上层建筑的矛盾运动。' },
  { y: '1867', a: 'M', au: '马克思', t: '《资本论》（第一卷）', k: '创立剩余价值学说，揭示资本主义剥削的秘密，论证资本主义必然灭亡。第二、三卷由恩格斯整理出版（1885、1894）。' },
  { y: '1871', a: 'M', au: '马克思', t: '《法兰西内战》', k: '总结巴黎公社经验，指出工人阶级不能简单地掌握现成的国家机器，必须打碎旧的国家机器。' },
  { y: '1875', a: 'M', au: '马克思', t: '《哥达纲领批判》', k: '科学预见共产主义社会两个阶段（第一阶段、高级阶段），提出按劳分配与按需分配；论述无产阶级专政是过渡时期的国家形式。' },
  { y: '1878', a: 'E', au: '恩格斯', t: '《反杜林论》', k: '全面系统阐述马克思主义哲学、政治经济学、科学社会主义三个组成部分。' },
  { y: '1880', a: 'E', au: '恩格斯', t: '《社会主义从空想到科学的发展》', k: '阐明社会主义从空想发展为科学的过程，以唯物史观和剩余价值学说为两大理论基石。' },
  { y: '1884', a: 'E', au: '恩格斯', t: '《家庭、私有制和国家的起源》', k: '以唯物史观考察家庭、私有制和国家的起源与发展，论述国家的本质。' },
  { y: '1886', a: 'E', au: '恩格斯', t: '《路德维希·费尔巴哈和德国古典哲学的终结》', k: '总结马克思主义哲学同德国古典哲学的关系，提出哲学基本问题（思维和存在的关系问题）。' },
  { y: '1916', a: 'L', au: '列宁', t: '《帝国主义是资本主义的最高阶段》', k: '系统分析垄断资本主义的基本特征，指出帝国主义是垄断的、腐朽的、垂死的资本主义。' },
  { y: '1917', a: 'L', au: '列宁', t: '《国家与革命》', k: '系统阐述马克思主义国家学说，论证无产阶级专政。' },
  { y: '1937', a: 'Z', au: '毛泽东', t: '《实践论》', k: '论述认识与实践的辩证关系，批判教条主义，是马克思主义认识论中国化的典范。' },
  { y: '1937', a: 'Z', au: '毛泽东', t: '《矛盾论》', k: '系统阐述对立统一规律，尤其是矛盾的特殊性与主要矛盾，批判教条主义，是马克思主义辩证法中国化的典范。' }
];
var AUTH = { all: '全部', M: '马克思', E: '恩格斯', ME: '合著', L: '列宁', Z: '毛泽东' };
var CUR = 'all';
function cls(a) { return a === 'E' ? 'en' : a === 'L' ? 'ln' : a === 'Z' ? 'mz' : ''; }
function buildFilters() {
  var f = $('filters'); f.innerHTML = '';
  Object.keys(AUTH).forEach(function (k) {
    var c = document.createElement('div'); c.className = 'chip' + (CUR === k ? ' active' : '');
    c.textContent = AUTH[k];
    c.onclick = function () { CUR = k; buildFilters(); buildTl(); };
    f.appendChild(c);
  });
}
function buildTl() {
  var tl = $('tl'); tl.innerHTML = '';
  WORKS.filter(function (w) { return CUR === 'all' || w.a === CUR; }).forEach(function (w) {
    var n = document.createElement('div'); n.className = 'node ' + cls(w.a);
    var h = document.createElement('div'); h.className = 'nh';
    h.innerHTML = '<div class="yr">' + w.y + '</div><div class="nt">' + w.t + '</div><div class="au">' + w.au + '</div>';
    var b = document.createElement('div'); b.className = 'nb'; b.innerHTML = '<b>核心：</b>' + w.k;
    h.onclick = function () { b.style.display = b.style.display === 'block' ? 'none' : 'block'; };
    n.appendChild(h); n.appendChild(b); tl.appendChild(n);
  });
}
function show(n) {
  $('v1').style.display = n === 1 ? 'block' : 'none';
  $('v2').style.display = n === 2 ? 'block' : 'none';
  $('t1').className = 'tab' + (n === 1 ? ' active' : '');
  $('t2').className = 'tab' + (n === 2 ? ' active' : '');
  if (n === 2 && !$('quizBox').firstChild) startQuiz();
}
function startQuiz() {
  var pool = shuffle(WORKS).slice(0, 6);
  var items = pool.map(function (w, i) {
    var others = shuffle(WORKS.filter(function (x) { return x.t !== w.t; })).slice(0, 3).map(function (x) { return x.t; });
    if (i % 2 === 0) {
      return { q: '下列观点最可能出自哪部著作？ ' + w.k, opts: [w.t].concat(others), exp: w.t + '（' + w.au + '，' + w.y + '）。' };
    }
    var ks = shuffle(WORKS.filter(function (x) { return x.t !== w.t; })).slice(0, 3).map(function (x) { return x.k; });
    return { q: '关于 ' + w.t + ' 的正确表述是：', opts: [w.k].concat(ks), exp: '作者：' + w.au + '，成书于 ' + w.y + ' 年。' };
  });
  renderQuiz('quizBox', items, 'score');
}
buildFilters(); buildTl();
</script>
</body>
</html>`,
}
