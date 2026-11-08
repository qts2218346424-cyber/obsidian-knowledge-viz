import type { InteractiveCoursewareItem } from '../interactiveCourseware'
import { POLITICS_BASE_CSS, POLITICS_BASE_JS } from './_politicsShared'

export const currentAffairsCourseware: InteractiveCoursewareItem = {
  id: 'cw-current-affairs-cards',
  title: '📰 考研政治时政热点翻转卡（理论创新 / 经济 / 制度 / 外交）',
  domain: 'politics',
  subject: '时事政治',
  difficulty: '考前必背',
  tags: ['考研政治', '时政', '中国式现代化', '新质生产力', '二十届三中全会', '全过程人民民主', '人类命运共同体', '十五五'],
  summary:
    '把近年中央重大会议与理论创新提炼为 20 张可翻转的知识卡，按理论、经济、制度、外交四类筛选，翻面查看提出时间、核心内涵与命题角度，并配随机自测。适合碎片时间主动回忆。',
  learningPoints: [
    '中国式现代化的五个中国特色：人口规模巨大、全体人民共同富裕、物质文明和精神文明相协调、人与自然和谐共生、走和平发展道路',
    '新质生产力以劳动者、劳动资料、劳动对象及其优化组合的跃升为基本内涵，以全要素生产率大幅提升为核心标志',
    '“两个结合”：马克思主义基本原理同中国具体实际、同中华优秀传统文化相结合，“第二个结合”是又一次思想解放',
    '全过程人民民主是社会主义民主政治的本质属性，是最广泛、最真实、最管用的民主',
    '时政复习原则：以教材和官方权威文件表述为准，抓“提出时间、核心内涵、实践要求”三要素',
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${POLITICS_BASE_CSS}
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
  .fc { height: 170px; perspective: 800px; cursor: pointer; }
  .fi { position: relative; width: 100%; height: 100%; transition: transform .45s; transform-style: preserve-3d; }
  .fc.flip .fi { transform: rotateY(180deg); }
  .face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; padding: 12px;
    border: 1px solid var(--border); background: #080c14; overflow-y: auto; font-size: 12px; }
  .front { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  .front .ct { font-size: 10px; color: var(--amber); margin-bottom: 8px; }
  .front .tt { font-size: 15px; font-weight: 700; }
  .front .hint { font-size: 10px; color: var(--muted); margin-top: 10px; }
  .back { transform: rotateY(180deg); background: #0f1524; color: #cbd5e1; line-height: 1.55; }
  .back b { color: var(--amber); }
  .note { font-size: 11px; color: var(--muted); margin-top: 12px; }
</style>
</head>
<body>
<header>
  <h1>📰 时政热点翻转卡</h1>
  <span class="badge">时事政治</span>
</header>
<div class="tabs">
  <div class="tab active" id="t1" onclick="show(1)">翻转卡</div>
  <div class="tab" id="t2" onclick="show(2)">时政自测</div>
</div>
<div id="v1">
  <div class="tabs" id="filters"></div>
  <div class="cards" id="cards"></div>
  <p class="note">提示：点击卡片翻面。具体表述、数据与最新进展请以新华社、人民日报及教育部考试中心发布的最新材料为准。</p>
</div>
<div id="v2" style="display:none">
  <div class="panel"><span class="score" id="score"></span>
    <button class="act" style="margin-left:8px" onclick="startQuiz()">重新抽题</button></div>
  <div id="quizBox"></div>
</div>

<script>
${POLITICS_BASE_JS}
function $(id) { return document.getElementById(id); }
var CATS = { all: '全部', theory: '理论创新', eco: '经济发展', sys: '制度改革', intl: '外交国际' };
var CARDS = [
  { c: 'theory', t: '中国式现代化', b: '<b>来源</b>：党的二十大系统阐述。<br><b>五个特色</b>：人口规模巨大；全体人民共同富裕；物质文明和精神文明相协调；人与自然和谐共生；走和平发展道路。<br><b>考法</b>：五大特色辨析、与西方现代化的区别。' },
  { c: 'theory', t: '“两个结合”', b: '<b>内容</b>：把马克思主义基本原理同中国具体实际相结合、同中华优秀传统文化相结合。<br><b>要点</b>：“第二个结合”是又一次思想解放，让马克思主义成为中国的，也让中华优秀传统文化成为现代的。' },
  { c: 'theory', t: '习近平文化思想', b: '<b>提出</b>：2023 年 10 月全国宣传思想文化工作会议。<br><b>意义</b>：党的创新理论在文化建设领域的重大成果，是新时代党的文化建设的根本遵循。' },
  { c: 'theory', t: '“两个确立”', b: '<b>内容</b>：确立习近平同志党中央的核心、全党的核心地位，确立习近平新时代中国特色社会主义思想的指导地位。<br><b>评价</b>：决定党和国家前途命运的重大政治成果。' },
  { c: 'theory', t: '新时代主要矛盾', b: '<b>表述</b>：人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。<br><b>注意</b>：社会主义初级阶段基本国情没有变，我国是世界最大发展中国家的国际地位没有变。' },
  { c: 'eco', t: '新质生产力', b: '<b>提出</b>：2023 年 9 月在黑龙江考察时首次提出。<br><b>特点</b>：创新起主导作用，摆脱传统经济增长方式和生产力发展路径。<br><b>核心标志</b>：全要素生产率大幅提升。' },
  { c: 'eco', t: '高质量发展', b: '<b>定位</b>：全面建设社会主义现代化国家的首要任务。<br><b>要求</b>：新发展理念——创新、协调、绿色、开放、共享。' },
  { c: 'eco', t: '新发展格局', b: '<b>表述</b>：以国内大循环为主体、国内国际双循环相互促进。<br><b>关键</b>：加快构建，核心在于科技自立自强与扩大内需。' },
  { c: 'eco', t: '共同富裕', b: '<b>定位</b>：社会主义的本质要求，中国式现代化的重要特征。<br><b>路径</b>：做大蛋糕与分好蛋糕，完善初次分配、再分配、三次分配协调配套的基础性制度安排。' },
  { c: 'eco', t: '乡村振兴', b: '<b>总要求</b>：产业兴旺、生态宜居、乡风文明、治理有效、生活富裕。<br><b>底线</b>：守住不发生规模性返贫底线。' },
  { c: 'sys', t: '全过程人民民主', b: '<b>性质</b>：社会主义民主政治的本质属性，最广泛、最真实、最管用的民主。<br><b>特征</b>：全链条、全方位、全覆盖。' },
  { c: 'sys', t: '二十届三中全会', b: '<b>时间</b>：2024 年 7 月。<br><b>主题</b>：进一步全面深化改革、推进中国式现代化。<br><b>总目标</b>：继续完善和发展中国特色社会主义制度，推进国家治理体系和治理能力现代化。<br><b>任务时限</b>：到 2029 年中华人民共和国成立 80 周年时完成改革任务。' },
  { c: 'sys', t: '全面依法治国', b: '<b>总目标</b>：建设中国特色社会主义法治体系，建设社会主义法治国家。<br><b>重点</b>：科学立法、严格执法、公正司法、全民守法。' },
  { c: 'sys', t: '全面从严治党', b: '<b>要求</b>：党的自我革命永远在路上。<br><b>命题关键</b>：自我革命是我们党跳出历史周期率的第二个答案。' },
  { c: 'sys', t: '总体国家安全观', b: '<b>要义</b>：以人民安全为宗旨，以政治安全为根本，以经济安全为基础，以军事、科技、文化、社会安全为保障，以促进国际安全为依托。' },
  { c: 'intl', t: '人类命运共同体', b: '<b>提出</b>：2013 年前后提出，后写入党章与宪法。<br><b>内涵</b>：持久和平、普遍安全、共同繁荣、开放包容、清洁美丽的世界。' },
  { c: 'intl', t: '共建“一带一路”', b: '<b>提出</b>：2013 年（丝绸之路经济带与 21 世纪海上丝绸之路）。<br><b>理念</b>：共商共建共享，走绿色、开放、廉洁之路，实现高标准、可持续、惠民生目标。' },
  { c: 'intl', t: '全球发展倡议', b: '<b>提出</b>：2021 年联合国大会。<br><b>配套</b>：全球安全倡议（2022）、全球文明倡议（2023）。<br><b>提示</b>：后续新增倡议请核对官方最新表述。' },
  { c: 'intl', t: '全人类共同价值', b: '<b>内涵</b>：和平、发展、公平、正义、民主、自由。<br><b>意义</b>：超越西方所谓“普世价值”，体现不同文明的最大公约数。' },
  { c: 'intl', t: '“十五五”开局', b: '<b>时间</b>：“十五五”指 2026—2030 年，2026 年为开局之年。<br><b>复习建议</b>：关注党的全会精神与政府工作报告对发展目标、重点任务的官方表述。' }
];
var CUR = 'all';
function buildFilters() {
  var f = $('filters'); f.innerHTML = '';
  Object.keys(CATS).forEach(function (k) {
    var c = document.createElement('div'); c.className = 'chip' + (CUR === k ? ' active' : '');
    c.textContent = CATS[k];
    c.onclick = function () { CUR = k; buildFilters(); buildCards(); };
    f.appendChild(c);
  });
}
function buildCards() {
  var root = $('cards'); root.innerHTML = '';
  CARDS.filter(function (x) { return CUR === 'all' || x.c === CUR; }).forEach(function (x) {
    var d = document.createElement('div'); d.className = 'fc';
    d.innerHTML = '<div class="fi"><div class="face front"><div class="ct">' + CATS[x.c] + '</div><div class="tt">' + x.t + '</div><div class="hint">先回忆再翻面</div></div><div class="face back">' + x.b + '</div></div>';
    d.onclick = function () { d.classList.toggle('flip'); };
    root.appendChild(d);
  });
}
function show(n) {
  $('v1').style.display = n === 1 ? 'block' : 'none';
  $('v2').style.display = n === 2 ? 'block' : 'none';
  $('t1').className = 'tab' + (n === 1 ? ' active' : '');
  $('t2').className = 'tab' + (n === 2 ? ' active' : '');
  if (n === 2 && !$('quizBox').firstChild) startQuiz();
}
var QS = [
  { q: '新质生产力最早于何时何地被提出？', opts: ['2023 年 9 月，黑龙江考察', '2020 年，深圳经济特区', '2019 年，上海考察', '2022 年，二十大报告'], exp: '2023 年 9 月在黑龙江考察期间首次提出。' },
  { q: '下列不属于中国式现代化五个特色的是：', opts: ['实现个人财富均等化', '人口规模巨大', '人与自然和谐共生', '走和平发展道路'], exp: '共同富裕不是平均主义，更不是财富均等化。' },
  { q: '二十届三中全会召开于：', opts: ['2024 年 7 月', '2022 年 10 月', '2023 年 2 月', '2025 年 3 月'], exp: '2024 年 7 月，主题是进一步全面深化改革、推进中国式现代化。' },
  { q: '“第二个结合”是指：', opts: ['马克思主义基本原理同中华优秀传统文化相结合', '马克思主义同时代特征相结合', '理论与实践相结合', '改革与开放相结合'], exp: '“第二个结合”指同中华优秀传统文化相结合。' },
  { q: '全面建设社会主义现代化国家的首要任务是：', opts: ['高质量发展', '扩大内需', '科技创新', '共同富裕'], exp: '二十大报告明确高质量发展是首要任务。' },
  { q: '全球发展倡议提出的场合是：', opts: ['2021 年联合国大会', '2013 年哈萨克斯坦演讲', '2017 年达沃斯论坛', '2019 年亚太经合组织会议'], exp: '2021 年联合国大会提出。' },
  { q: '习近平文化思想提出的会议是：', opts: ['2023 年全国宣传思想文化工作会议', '2018 年全国宣传思想工作会议', '2016 年文艺工作座谈会', '2021 年党史学习教育动员大会'], exp: '2023 年 10 月全国宣传思想文化工作会议。' }
];
function startQuiz() { renderQuiz('quizBox', shuffle(QS).slice(0, 5), 'score'); }
buildFilters(); buildCards();
</script>
</body>
</html>`,
}
