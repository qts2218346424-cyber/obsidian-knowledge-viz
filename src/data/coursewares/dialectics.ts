import type { InteractiveCoursewareItem } from '../interactiveCourseware'
import { POLITICS_BASE_CSS, POLITICS_BASE_JS } from './_politicsShared'

export const dialecticsCourseware: InteractiveCoursewareItem = {
  id: 'cw-marx-dialectics',
  title: '🧭 马原唯物辩证法 · 三大规律与矛盾分析法情景闯关',
  domain: 'politics',
  subject: '马克思主义基本原理',
  difficulty: '选择题高频',
  tags: ['考研政治', '马原', '唯物辩证法', '对立统一', '质量互变', '否定之否定', '矛盾分析法', '主要矛盾', '易混辨析'],
  summary:
    '把三大规律、矛盾的普遍性与特殊性、主要矛盾与次要矛盾、实践与认识等马原高频考点做成点击展开的知识卡，并配合成语俗语“情景闯关”与易混概念对比表，用生活化情境训练选择题的快速归类能力。',
  learningPoints: [
    '对立统一规律是唯物辩证法的实质与核心，揭示事物发展的动力和源泉',
    '质量互变规律揭示发展的状态：量变是质变的必要准备，质变是量变的必然结果，二者相互渗透',
    '否定之否定规律揭示发展的方向和道路：前进性与曲折性的统一，“螺旋式上升、波浪式前进”',
    '矛盾的普遍性与特殊性的辩证关系是马克思主义活的灵魂（具体问题具体分析）的哲学基础',
    '两点论与重点论相统一：既全面看待矛盾双方，又抓住主要矛盾与矛盾的主要方面',
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${POLITICS_BASE_CSS}
  .kcard { background: #080c14; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
  .kh { padding: 10px 12px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; }
  .kh:hover { background: rgba(56,189,248,.06); }
  .kb { display: none; padding: 4px 12px 12px; font-size: 12px; color: #cbd5e1; }
  .kb li { margin: 4px 0 4px 16px; }
  .kb .key { color: var(--amber); font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid var(--border); padding: 7px 9px; text-align: left; vertical-align: top; }
  th { background: #0f1524; color: var(--amber); }
</style>
</head>
<body>
<header>
  <h1>🧭 唯物辩证法 · 情景闯关</h1>
  <span class="badge">马原 · 哲学</span>
</header>
<div class="tabs">
  <div class="tab active" id="t1" onclick="show(1)">知识卡</div>
  <div class="tab" id="t2" onclick="show(2)">情景闯关</div>
  <div class="tab" id="t3" onclick="show(3)">易混辨析</div>
</div>

<div id="v1"></div>

<div id="v2" style="display:none">
  <div class="panel"><span class="score" id="score"></span>
    <button class="act" style="margin-left:8px" onclick="startQuiz()">重新抽题</button></div>
  <div id="quizBox"></div>
</div>

<div id="v3" style="display:none">
  <div class="panel" style="overflow-x:auto">
    <table>
      <tr><th>易混对象</th><th>区分要点</th></tr>
      <tr><td>量变 vs 质变</td><td>量变是数量增减与场所变更，事物保持原有质；质变是根本性变化。“度”是质与量的统一，把握适度原则。</td></tr>
      <tr><td>矛盾普遍性 vs 特殊性</td><td>普遍性指矛盾无处不在、无时不有（共性）；特殊性指各矛盾及各方面各有特点（个性）。二者相互联结、相互转化，不能割裂。</td></tr>
      <tr><td>辩证否定 vs 形而上学否定</td><td>辩证否定即“扬弃”：既克服又保留，是联系和发展的环节；形而上学否定是简单抛弃、全盘否定。</td></tr>
      <tr><td>两点论 vs 均衡论</td><td>两点论不是平均用力。必须与重点论统一，“眉毛胡子一把抓”属于均衡论。</td></tr>
      <tr><td>主要矛盾 vs 矛盾的主要方面</td><td>主要矛盾是矛盾体系中起领导和决定作用的矛盾；矛盾的主要方面是一对矛盾中居支配地位的一方，决定事物性质。</td></tr>
      <tr><td>绝对真理 vs 相对真理</td><td>真理既有绝对性（客观内容、无条件）也有相对性（认识有限、有条件），二者辩证统一，真理在发展中不断被超越。</td></tr>
      <tr><td>感性认识 vs 理性认识</td><td>感性认识是现象，具有直接性；理性认识反映本质和规律，具有间接性。二者相互渗透、相互依赖，必须上升到理性。</td></tr>
    </table>
  </div>
</div>

<script>
${POLITICS_BASE_JS}
function $(id) { return document.getElementById(id); }
function show(n) {
  for (var i = 1; i <= 3; i++) {
    $('v' + i).style.display = i === n ? 'block' : 'none';
    $('t' + i).className = 'tab' + (i === n ? ' active' : '');
  }
  if (n === 2 && !$('quizBox').firstChild) startQuiz();
}
var CARDS = [
  { t: '⚖️ 对立统一规律（实质与核心）', b: [
    '<span class="key">地位</span>：唯物辩证法的实质与核心，揭示事物发展的源泉与动力。',
    '矛盾的同一性：相互依存、相互贯通、相互包含、相互转化；斗争性：相互排斥、相互分离。',
    '同一性使事物凝聚、吸取对方有利因素；斗争性推动事物量变与质变。二者相结合推动事物发展。',
    '方法论：坚持矛盾分析法，一分为二；既看对立又看统一。' ] },
  { t: '📈 质量互变规律（发展的状态）', b: [
    '<span class="key">质</span>：事物成为其自身、区别于他事物的内在规定性；<span class="key">量</span>：事物存在和发展的规模、程度、速度等；<span class="key">度</span>：保持事物质的量的界限。',
    '量变是质变的必要准备，质变是量变的必然结果，质变又为新的量变开辟道路。',
    '方法论：重视量的积累，坚持适度原则，抓住时机促成飞跃，防止“左”右倾向。' ] },
  { t: '🌀 否定之否定规律（发展的方向与道路）', b: [
    '辩证否定观：事物内部矛盾引起的自我否定，是联系的环节和发展的环节，其实质是扬弃。',
    '发展的过程是肯定、否定、否定之否定，呈现波浪式前进、螺旋式上升。',
    '方法论：树立辩证否定观，坚信前途光明，正视道路曲折。' ] },
  { t: '🔎 矛盾的普遍性与特殊性', b: [
    '普遍性与特殊性即共性与个性、一般与个别，相互联结、相互包含，在一定条件下相互转化。',
    '它是马克思主义普遍原理同各国具体实际相结合的哲学基础，是正确认识矛盾、解决矛盾的重要方法。' ] },
  { t: '🎯 主要矛盾与次要矛盾 / 两点论与重点论', b: [
    '主要矛盾处于支配地位、对事物发展起决定作用；次要矛盾处于从属地位。二者在一定条件下可以相互转化。',
    '两点论：全面看待矛盾双方；重点论：着重把握主要矛盾与矛盾主要方面。<span class="key">两点论与重点论的统一</span>。' ] },
  { t: '🛠 实践与认识', b: [
    '实践是认识的来源、动力、检验标准与目的。',
    '认识发展：实践→认识→再实践→再认识，循环往复以至无穷。',
    '真理的客观性、绝对性与相对性；检验真理的唯一标准是社会实践（实践标准既确定又不确定）。' ] }
];
(function buildCards() {
  var root = $('v1');
  CARDS.forEach(function (c) {
    var d = document.createElement('div'); d.className = 'kcard';
    var h = document.createElement('div'); h.className = 'kh';
    h.innerHTML = '<span>' + c.t + '</span><span>＋</span>';
    var b = document.createElement('ul'); b.className = 'kb';
    b.innerHTML = c.b.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    h.onclick = function () {
      var open = b.style.display === 'block';
      b.style.display = open ? 'none' : 'block';
      h.lastChild.textContent = open ? '＋' : '－';
    };
    d.appendChild(h); d.appendChild(b); root.appendChild(d);
  });
})();

var BANK = [
  { q: '“不积跬步，无以至千里”蕴含的哲理是：', opts: ['量变是质变的必要准备', '矛盾双方相互转化', '否定之否定', '实践是认识来源'], exp: '强调量的积累，属质量互变规律。' },
  { q: '“千里之堤，溃于蚁穴”说明：', opts: ['量变达到一定程度必然引起质变', '要抓主要矛盾', '真理有相对性', '联系具有普遍性'], exp: '微小量变积累突破度的界限引发质变。' },
  { q: '“福兮祸之所伏，祸兮福之所倚”体现的是：', opts: ['矛盾双方相互依存、相互转化', '质量互变', '事物发展的曲折性', '主次矛盾转化'], exp: '祸福对立面在一定条件下相互转化，属对立统一。' },
  { q: '事物发展“螺旋式上升、波浪式前进”所依据的规律是：', opts: ['否定之否定规律', '对立统一规律', '质量互变规律', '因果联系规律'], exp: '体现发展的前进性与曲折性统一。' },
  { q: '“具体问题具体分析”的哲学依据是：', opts: ['矛盾的特殊性原理', '量变引起质变', '实践是检验真理的标准', '意识的能动作用'], exp: '针对不同矛盾采取不同方法，建立在矛盾特殊性基础上。' },
  { q: '“弹钢琴要十个指头都动作，不能只动某几个指头”侧重说明：', opts: ['两点论与重点论的统一，统筹兼顾', '均衡论', '质变是量变结果', '否定之否定'], exp: '毛泽东“弹钢琴”比喻强调全面统筹兼顾，仍需抓重点。' },
  { q: '“纸上得来终觉浅，绝知此事要躬行”强调：', opts: ['实践是认识的来源', '真理的相对性', '意识的反作用', '感性认识不可靠'], exp: '直接经验与实践是认识来源。' },
  { q: '“新事物必然战胜旧事物”表明：', opts: ['发展的前进性', '发展的曲折性', '量变先于质变', '矛盾斗争绝对性'], exp: '新事物合乎规律、有强大生命力，但其成长道路曲折。' },
  { q: '扬弃的含义是：', opts: ['既克服又保留', '全盘否定', '全盘肯定', '简单地抛弃'], exp: '辩证否定的实质即扬弃，克服消极因素、保留积极因素。' },
  { q: '“眉毛胡子一把抓”的错误在于：', opts: ['没有坚持重点论，陷入均衡论', '没有坚持两点论', '否认矛盾存在', '否认量变'], exp: '没有抓住主要矛盾，平均用力。' }
];
function startQuiz() { renderQuiz('quizBox', shuffle(BANK).slice(0, 6), 'score'); }
</script>
</body>
</html>`,
}
