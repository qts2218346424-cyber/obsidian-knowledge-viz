import type { InteractiveCoursewareItem } from '../interactiveCourseware'

export const historyTimelineCourseware: InteractiveCoursewareItem = {
  id: 'cw-history-timeline',
  title: '🏛️ 考研政治史纲编年时空轴 (1840–2024 重要会议与重大事件动态演进)',
  domain: 'politics',
  subject: '政治史纲',
  difficulty: '大纲核心必背',
  tags: ['考研政治', '史纲', '重要会议', '中共党史', '近代史', '土地政策', '时间轴', '逢五逢十周年'],
  summary: '拖动历史时空轴进度条逐年透视 1840–2024 近代以来所有重要政治会议、核心著作文献、重大历史事件与土地统战路线。内置四大历史分期导航、考点吸附双模式、逢五逢十周年命题热点雷达、主动回忆背诵遮罩自测及横向易混对比表。',
  learningPoints: [
    '掌握旧民主、新民主、社革建设、改革开放与新时代四大时期的社会主要矛盾与核心历史任务转变',
    '熟记中共一大至二十届三中全会历次重要政治会议的“首次提出、历史标志、根本转折”核心定性',
    '精准区分近代土地政策演变：太平天国《天朝田亩制度》→ 土地革命《井冈山/兴国土地法》→ 抗战减租减息 → 解放战争《中国土地法大纲》→ 建国初期《土地改革法》（保存富农经济）',
    '牢记党史三个历史决议、马克思主义中国化理论飞跃与单多选命题易混陷阱排雷',
  ],
  embedHtml: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>考研政治史纲编年时空轴</title>
<style>
  :root {
    --bg-color: #0b0f19;
    --card-bg: #121827;
    --border-color: #1f293d;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent-red: #ef4444;
    --accent-amber: #f59e0b;
    --accent-blue: #38bdf8;
    --accent-indigo: #818cf8;
    --accent-emerald: #10b981;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--bg-color);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Noto Sans SC", sans-serif;
    padding: 14px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 10px;
    flex-shrink: 0;
  }
  h1 { font-size: 15px; font-weight: 700; color: #f87171; display: flex; align-items: center; gap: 8px; }
  .badge { background: rgba(239,68,68,0.15); color: #f87171; font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(239,68,68,0.3); }
  .layout {
    display: grid;
    grid-template-columns: 290px 1fr;
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
    background: radial-gradient(circle at 50% 30%, #151e32 0%, #0b0f1b 100%);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }
  .label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  button {
    background: #1e293b;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  button:hover { background: #334155; border-color: var(--accent-blue); }
  button.active { background: rgba(239,68,68,0.22); border-color: #ef4444; color: #fca5a5; }
  button.active-amber { background: rgba(245,158,11,0.22); border-color: #f59e0b; color: #fcd34d; }
  button.primary { background: #b91c1c; border-color: #ef4444; color: #fff; }
  button.primary:hover { background: #991b1b; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }

  /* 原生 range 滑块定制 */
  input[type="range"].history-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 36px;
    background: transparent;
    cursor: pointer;
    margin: 4px 0;
  }
  input[type="range"].history-slider::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(to right, var(--track-fill, #ef4444) var(--prog, 40%), #1e293b var(--prog, 40%));
    border: 1px solid #334155;
  }
  input[type="range"].history-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--track-fill, #ef4444);
    box-shadow: 0 0 12px rgba(239,68,68,0.6);
    margin-top: -8px;
    transition: transform 0.15s ease;
  }
  input[type="range"].history-slider:hover::-webkit-slider-thumb { transform: scale(1.15); }
  input[type="range"].history-slider:focus-visible { outline: 2px solid #ef4444; outline-offset: 4px; }

  .year-display-box {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 10px 14px;
    background: rgba(8, 12, 20, 0.75);
    border: 1px solid var(--border-color);
    border-radius: 10px;
  }
  .year-num {
    font-size: 42px;
    font-weight: 900;
    font-family: monospace;
    line-height: 1;
    color: #ef4444;
  }
  .pills-bar {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    overflow-x: auto;
    padding: 8px 0 4px;
  }
  .pills-bar::-webkit-scrollbar { height: 4px; }
  .pills-bar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  .year-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 6px;
    border-radius: 6px;
    background: #0f172a;
    border: 1px solid var(--border-color);
    font-size: 11px;
    font-family: monospace;
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }
  .year-pill.active {
    background: rgba(239,68,68,0.2);
    border-color: #ef4444;
    color: #fca5a5;
    font-weight: bold;
  }
  .year-pill .bar {
    width: 4px;
    background: #475569;
    border-radius: 2px;
    margin-bottom: 4px;
  }
  .year-pill.active .bar { background: #ef4444; }

  .event-card {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-left: 4px solid #ef4444;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all 0.2s ease;
  }
  .event-card:hover {
    border-color: rgba(239,68,68,0.4);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }
  .keytag-banner {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: rgba(239,68,68,0.18);
    border: 1px solid rgba(239,68,68,0.35);
    color: #fca5a5;
    font-size: 12px;
    font-weight: 700;
  }
  .detail-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 12px;
    line-height: 1.6;
  }
  .sub-box {
    background: #090d16;
    border: 1px solid #1a2336;
    border-radius: 8px;
    padding: 10px;
  }
  .sub-box .sub-t {
    font-weight: 700;
    color: #cbd5e1;
    margin-bottom: 4px;
  }
  .pitfall-box {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
    color: #fca5a5;
    line-height: 1.6;
  }
  .mask-placeholder {
    background: #080c14;
    border: 2px dashed #334155;
    border-radius: 8px;
    padding: 14px;
    text-align: center;
    color: #94a3b8;
    font-size: 12px;
    cursor: pointer;
  }
  .mask-placeholder:hover {
    border-color: #38bdf8;
    color: #38bdf8;
  }
  .matrix-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    text-align: left;
  }
  .matrix-table th, .matrix-table td {
    border: 1px solid #1f293d;
    padding: 8px 10px;
  }
  .matrix-table th { background: #121827; color: #94a3b8; font-weight: 700; }
  .matrix-table td { color: #cbd5e1; }
</style>
</head>
<body>
<header>
  <h1><span>🏛️</span> 考研政治史纲编年时空轴 (1840–2024)</h1>
  <div style="display:flex; gap:8px; align-items:center;">
    <span class="badge">史纲大纲考点全覆盖</span>
    <span style="font-size:11px; color:var(--text-secondary);">拖动进度条 / 按键盘 ← → 键逐年检索</span>
  </div>
</header>

<div class="layout">
  <!-- 左侧控制面板 -->
  <div class="panel">
    <div>
      <div class="label">1. 历史分期速达</div>
      <div class="grid-2">
        <button id="era-old" class="active" onclick="setEra(0)">旧民主 (1840–1919)</button>
        <button id="era-new" onclick="setEra(1)">新民主 (1919–1949)</button>
        <button id="era-soc" onclick="setEra(2)">社革建设 (1949–1978)</button>
        <button id="era-ref" onclick="setEra(3)">改革与新时代 (1978起)</button>
      </div>
    </div>

    <div>
      <div class="label">2. 轴线类型过滤</div>
      <div class="grid-2">
        <button id="cat-all" class="active" onclick="setCat('all')">全部考点</button>
        <button id="cat-meeting" onclick="setCat('meeting')">🏛️ 政治会议</button>
        <button id="cat-event" onclick="setCat('event')">🔥 重大事件</button>
        <button id="cat-work" onclick="setCat('work')">📜 著作文献</button>
        <button id="cat-policy" onclick="setCat('policy')">🌾 土地路线</button>
        <button id="cat-pitfall" onclick="toggleOnlyPitfall()">⚠️ 仅看易错</button>
      </div>
    </div>

    <div>
      <div class="label">3. 命题雷达 & 背诵自测</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button id="btn-anniv" onclick="toggleAnniv()" style="color:#fcd34d; border-color:rgba(245,158,11,0.4);">
          🔥 2026/2027 逢五逢十周年热点
        </button>
        <button id="btn-mask" onclick="toggleMask()">
          🙈 开启背诵遮罩 (主动回忆自测)
        </button>
        <button id="btn-matrix" onclick="toggleMatrix()">
          📊 横向易混对比表 (土地/决议/首次)
        </button>
      </div>
    </div>

    <div>
      <div class="label">4. 巡航演练</div>
      <div class="grid-2">
        <button id="btn-prev" onclick="stepYear(-1)">◀ 上一节点</button>
        <button id="btn-next" onclick="stepYear(1)">下一节点 ▶</button>
      </div>
      <button id="btn-play" onclick="togglePlay()" style="width:100%; margin-top:6px;" class="primary">
        ▶ 自动演进巡航
      </button>
    </div>

    <div style="background:#090d16; border:1px solid #1a2336; border-radius:8px; padding:10px; font-size:11px; color:#94a3b8; line-height:1.6;">
      <b style="color:#fca5a5;">💡 史纲选择题高频排雷：</b><br>
      • 遵义会议【仅解决军事与组织问题】，政治路线解决于瓦窑堡，思想路线解决于延安整风。<br>
      • 1938年六届六中全会【首提马克思主义中国化】；1945年七大【确立为指导思想写入党章】。<br>
      • 1949建国进入的是【新民主主义社会】，1956底三大改造完成才确立社会主义基本制度！
    </div>
  </div>

  <!-- 右侧交互面板 -->
  <div class="sim-panel" id="mainSimPanel">
    <!-- 顶部年份仪表盘 -->
    <div class="year-display-box">
      <div>
        <div style="display:flex; align-items:baseline; gap:8px;">
          <span class="year-num" id="yearNum">1921</span>
          <span style="font-size:16px; font-weight:700; color:#cbd5e1;">年</span>
          <span id="eraBadge" class="badge">新民主主义革命</span>
        </div>
        <div id="eraSummary" style="font-size:12px; color:#94a3b8; margin-top:4px;">
          推翻帝国主义、封建主义、官僚资本主义，开辟农村包围城市道路
        </div>
      </div>
      <div id="annivTag" style="display:none; padding:4px 10px; border-radius:6px; background:#f59e0b; color:#000; font-size:11px; font-weight:800;">
        🔥 逢整周年热点
      </div>
    </div>

    <!-- 交互进度条 -->
    <div style="background:#080c14; border:1px solid var(--border-color); border-radius:10px; padding:10px 14px;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:2px;">
        <span>拖动进度条跳转：</span>
        <span id="itemsCount">当年考点：1 项</span>
      </div>
      <input type="range" id="yearSlider" class="history-slider" min="0" max="40" step="1" value="15" oninput="onSliderMove(this.value)">
      <div style="display:flex; justify-content:space-between; font-size:10px; font-family:monospace; color:#64748b;">
        <span>1840鸦片战争</span>
        <span>1919五四</span>
        <span>1921建党</span>
        <span>1935遵义</span>
        <span>1949建国</span>
        <span>1978改开</span>
        <span>2024二十届三中</span>
      </div>

      <!-- 年份热力标尺 -->
      <div class="pills-bar" id="pillsBar"></div>
    </div>

    <!-- 当年考点卡片区 -->
    <div id="cardsBox" style="display:flex; flex-direction:column; gap:10px;"></div>

    <!-- 横向易混对比矩阵浮层（默认隐藏） -->
    <div id="matrixBox" style="display:none; background:#080c14; border:1px solid var(--border-color); border-radius:10px; padding:14px; margin-top:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="font-size:13px; color:#fca5a5;">📊 史纲核心专题横向对比矩阵</h3>
        <button onclick="toggleMatrix()" style="padding:2px 8px; font-size:11px;">关闭对比</button>
      </div>
      <div style="display:flex; gap:6px; margin-bottom:10px;">
        <button id="m-tab-land" class="active" onclick="switchMatrix('land')">土地政策演变</button>
        <button id="m-tab-meet" onclick="switchMatrix('meet')">会议“首次/转折”</button>
        <button id="m-tab-res" onclick="switchMatrix('res')">三个历史决议</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="matrix-table" id="matrixTable"></table>
      </div>
    </div>
  </div>
</div>

<script>
const ERAS = [
  { key: 'old', name: '旧民主主义革命', start: 1840, end: 1919, color: '#f59e0b', desc: '主要矛盾：帝国主义与中华民族（最主要）、封建主义与人民大众。各阶级救亡探索相继失败。' },
  { key: 'new', name: '新民主主义革命', start: 1919, end: 1949, color: '#ef4444', desc: '无产阶级领导人民推翻三座大山，完成反帝反封建任务，建立新中国。' },
  { key: 'soc', name: '社会主义革命与建设', start: 1949, end: 1978, color: '#818cf8', desc: '完成一化三改确立社会主义制度；以苏为鉴独立探索建设道路。' },
  { key: 'ref', name: '改革开放与新时代', start: 1978, end: 2026, color: '#38bdf8', desc: '十一届三中全会伟大转折；十八大进入新时代，全面推进中国式现代化。' }
];

const ITEMS = [
  { id: '1840', year: 1840, date: '1840年6月', loc: '广东沿海', title: '第一次鸦片战争爆发', cat: 'event', keyTag: '中国近代史的开端', content: '英国发动侵华战争；1841年三元里人民抗英斗争是中国近代史上中国人民第一次大规模的反侵略武装斗争。', sig: '中国社会性质开始发生根本变化，开始沦为半殖民地半封建社会，是中国近代史的起点。', pitfall: '林则徐是近代睁眼看世界第一人；但鸦片战争后只是少数人觉醒，1895甲午战后才是民族意识普遍觉醒！' },
  { id: '1842', year: 1842, date: '1842年8月', loc: '南京', title: '《南京条约》签订 & 魏源《海国图志》', cat: 'work', keyTag: '近代第一个不平等条约 / 师夷长技以制夷', content: '割让香港岛、赔款2100万银元、五口通商、协定关税。次年魏源编成《海国图志》明确提出“师夷长技以制夷”。', sig: '中国主权和领土完整遭到破坏；开创向西方学习新风。', pitfall: '割让的是“香港岛”而非整个香港地区。' },
  { id: '1851', year: 1851, date: '1851年1月', loc: '广西金田村', title: '金田起义与太平天国运动爆发', cat: 'event', keyTag: '旧式农民战争的最高峰', content: '洪秀全发动金田起义建号太平天国，沉重打击封建统治阶级与外国侵略势力。', sig: '展现了农民阶级反封建反侵略的坚强意志，但无法克服农民小生产者局限性。', pitfall: '农民阶级不是新的生产力和生产关系的代表，无法领导反帝反封建斗争取得胜利。' },
  { id: '1853', year: 1853, date: '1853年3月', loc: '天京（南京）', title: '颁布《天朝田亩制度》（附1859《资政新篇》）', cat: 'policy', keyTag: '以解决土地问题为中心 / 资本主义方案', content: '《天朝田亩制度》确立“有田同耕有饭同食”平均分地方案；1859年洪仁玕提出《资政新篇》。', sig: '《天朝田亩制度》是最能体现太平天国社会理想的纲领；《资政新篇》是近代首个系统的发展资本主义方案。', pitfall: '《天朝田亩制度》是绝对平均主义空想，未真正实行；《资政新篇》未涉及农民土地问题。' },
  { id: '1861', year: 1861, date: '1861年起', loc: '全国', title: '洋务运动兴起（自强、求富）', cat: 'event', keyTag: '中学为体，西学为用 / 近代教育开端', content: '奕䜣、曾国藩、李鸿章等兴办近代军工、民用企业、新式学堂与北洋水师。', sig: '客观上促进了中国早期工业和民族资本主义的发展。', pitfall: '洋务派根本目的是“维护封建统治”而非发展资本主义；甲午战败标志其彻底破产。' },
  { id: '1894', year: 1894, date: '1894年', loc: '檀香山', title: '甲午中日战争爆发 & 孙中山组建兴中会', cat: 'event', keyTag: '首个资产阶级革命团体 / 振兴中华', content: '孙中山在檀香山组建兴中会，立誓“驱除鞑虏，恢复中国，创立合众政府”，喊出“振兴中华”时代最强音。', sig: '兴中会是中国近代第一个资产阶级革命团体。', pitfall: '兴中会是革命“团体”，1905同盟会才是第一个全国性资产阶级革命“政党”！' },
  { id: '1895', year: 1895, date: '1895年4月', loc: '马关 / 北京', title: '《马关条约》签订、公车上书与《救亡决论》', cat: 'event', keyTag: '中华民族民族意识开始普遍觉醒', content: '割辽东、台湾全岛及附属各岛屿、澎湖列岛，赔银2亿两，允许在华设厂。严复发表《救亡决论》喊出“救亡”口号。', sig: '列强掀起瓜分中国狂潮；甲午战后中国人民的民族意识开始普遍觉醒！', pitfall: '必背单选：民族意识开始“普遍觉醒”是在1895甲午战后！' },
  { id: '1898', year: 1898, date: '1898年6—9月', loc: '北京', title: '戊戌维新运动（百日维新）', cat: 'event', keyTag: '资产阶级性质政治改良 + 思想启蒙', content: '康梁与守旧派展开三大论战；光绪帝颁布“明定国是”诏书，历时103天被慈禧政变扼杀（仅保留京师大学堂）。', sig: '是一场爱国救亡运动、资产阶级政治改良运动和思想启蒙运动。', pitfall: '失败根本原因在于民族资产阶级的软弱性与妥协性。' },
  { id: '1900', year: 1900, date: '1900年', loc: '京津冀', title: '义和团运动与八国联军侵华', cat: 'event', keyTag: '粉碎帝国主义瓜分中国的重大历史力量', content: '义和团提出“扶清灭洋”口号，沉重打击八国联军侵略军。', sig: '展现了中国人民不甘屈服的反侵略精神。', pitfall: '帝国主义列强未能瓜分中国的“最根本原因”是中华民族进行的不屈不挠的反侵略斗争！' },
  { id: '1901', year: 1901, date: '1901年9月', loc: '北京', title: '《辛丑条约》签订', cat: 'work', keyTag: '完全沦为半殖民地半封建社会', content: '赔款4.5亿两，划定使馆界驻兵，清政府承诺严禁中国人民反帝。', sig: '清政府甘当“洋人的朝廷”，中国完全陷入半殖民地半封建社会深渊。' },
  { id: '1905', year: 1905, date: '1905年8月', loc: '东京', title: '中国同盟会成立 & 提出三民主义', cat: 'meeting', keyTag: '首个资产阶级革命政党 / 三民主义', content: '确立“驱除鞑虏，恢复中华，创立民国，平均地权”纲领，概括为民族、民权、民生三大主义。', sig: '标志着中国资产阶级民主革命进入了一个新的阶段。', pitfall: '平均地权（核定地价）没有正面触及封建土地所有制，不能满足农民的土地要求。' },
  { id: '1911', year: 1911, date: '1911年10月10日', loc: '武昌', title: '武昌起义爆发（辛亥革命高潮）', cat: 'event', keyTag: '结束两千多年封建君主专制制度', content: '武昌新军打响第一枪，各省相继独立响应。', sig: '推翻清王朝统治，结束了统治中国两千多年的封建君主专制制度，建立了第一个共和政府。', pitfall: '结束的是两千多年“封建君主专制（帝制）”，绝非结束了“封建制度”，也未改变半殖民地半封建社会性质！' },
  { id: '1912', year: 1912, date: '1912年1—3月', loc: '南京', title: '中华民国临时政府成立 &《中华民国临时约法》', cat: 'work', keyTag: '首部资产阶级共和国宪法性质法典', content: '孙中山就任临时大总统；颁布《临时约法》，确立主权在民与三权分立。', sig: '以根本大法形式废除了封建君主专制制度。' },
  { id: '1915', year: 1915, date: '1915年9月', loc: '上海/北京', title: '新文化运动兴起', cat: 'event', keyTag: '民主与科学 / 空前深刻的思想解放', content: '陈独秀创办《青年杂志》，高举民主与科学旗帜，提倡白话文批判封建礼教。', sig: '为马克思主义在中国的传播创造了有利条件。', pitfall: '五四前属于资产阶级民主主义新文化；五四后发展到以传播马克思主义为主流。' },
  { id: '1919', year: 1919, date: '1919年5月4日', loc: '北京/上海', title: '五四运动爆发 &《我的马克思主义观》', cat: 'event', keyTag: '中国新民主主义革命的开端', content: '巴黎和会外交失败引发；6.5后工人阶级作为独立政治力量登上舞台。李大钊发表《我的马克思主义观》。', sig: '彻底反帝反封建爱国革命运动；标志马克思主义在中国进入系统传播阶段，在思想上干部上准备了建党。', pitfall: '中国新民主主义革命的伟大开端是【五四运动】。' },
  { id: '1921', year: 1921, date: '1921年7月23日', loc: '上海/嘉兴', title: '中国共产党第一次全国代表大会（中共一大）', cat: 'meeting', keyTag: '开天辟地的大事变 / 伟大建党精神', content: '确定党的名称为中国共产党，通过第一个党纲，宣告中国共产党正式成立。', sig: '中国共产党的成立是开天辟地的大事变！形成了32字伟大建党精神。', pitfall: '一大尚未区分最高纲领与最低纲领，未提出明确反帝反封建民主革命纲领（这是二大完成的）！' },
  { id: '1922', year: 1922, date: '1922年7月', loc: '上海', title: '中国共产党第二次全国代表大会（中共二大）', cat: 'meeting', keyTag: '首次提出明确的反帝反封建民主革命纲领', content: '揭示半殖民地半封建社会性质，制定最低纲领（消除内乱打倒军阀、推翻帝国主义压迫统一中国）与最高纲领。', sig: '近代史上首次明确提出反帝反封建民主革命纲领；开始采取群众路线方法。' },
  { id: '1923', year: 1923, date: '1923年6月', loc: '广州', title: '中国共产党第三次全国代表大会', cat: 'meeting', keyTag: '决定以个人身份加入国民党（党内合作）', content: '总结二七惨案经验，决定全体共产党员以个人名义加入国民党建立统一战线，同时保持独立性。', sig: '确立了国共合作方针。' },
  { id: '1924', year: 1924, date: '1924年1月', loc: '广州', title: '中国国民党第一次全国代表大会召开', cat: 'policy', keyTag: '第一次国共合作正式形成的标志', content: '重新解释三民主义（新三民主义），确定联俄、联共、扶助农工三大政策。', sig: '新三民主义成为国共合作政治基础，第一次国共合作正式形成。', pitfall: '合作正式形成的标志是【国民党一大】，非中共三大！' },
  { id: '1925', year: 1925, date: '1925年1月', loc: '上海', title: '中国共产党第四次全国代表大会 & 五卅运动', cat: 'meeting', keyTag: '首次明确提出无产阶级领导权和工农联盟', content: '讨论党如何领导革命高潮，首提无产阶级在民主革命中的领导权和工农联盟问题；五卅运动掀起大革命风暴。', sig: '为大革命高潮作了理论思想准备。' },
  { id: '1927a', year: 1927, date: '1927年8月1日 / 8月7日', loc: '南昌 / 汉口', title: '南昌起义 & 八七会议（百年大热点）', cat: 'meeting', keyTag: '武装反抗第一枪 / 失败到兴起的历史转折', content: '8.1南昌起义；8.7汉口紧急会议彻底清算陈独秀右倾机会主义错误，确立土地革命和武装反抗国民党反动统治总方针，毛泽东提出“枪杆子里面出政权”。', sig: '南昌起义打响武装反抗第一枪；八七会议是由大革命失败到土地革命战争兴起的历史性转折！', pitfall: '八七会议反右时未能注意防止“左”倾盲动错误滋生。' },
  { id: '1927b', year: 1927, date: '1927年9—10月', loc: '湘赣 / 井冈山', title: '秋收起义、三湾改编与井冈山根据地创建', cat: 'event', keyTag: '支部建在连上 / 新型人民军队开端 / 农村包围城市起点', content: '秋收起义打出工农革命军旗帜；三湾改编确立支部建在连上；10月创建井冈山根据地。', sig: '三湾改编是建设新型人民军队的重要开端；点燃工农武装割据星火。' },
  { id: '1928', year: 1928, date: '1928年', loc: '莫斯科/井冈山', title: '中共六大、工农武装割据思想与《井冈山土地法》', cat: 'work', keyTag: '首部土地法 / 工农武装割据提出', content: '毛泽东撰写《中国的红色政权为什么能够存在？》《井冈山的斗争》；制定首个土地法。', sig: '阐述土地革命为中心、武装斗争为主要形式、根据地为战略阵地。', pitfall: '《井冈山土地法》存在“没收一切土地、禁止土地买卖”的初期局限。' },
  { id: '1929', year: 1929, date: '1929年4月 / 12月', loc: '兴国 / 古田', title: '《兴国土地法》与古田会议（红四军九大）', cat: 'meeting', keyTag: '思想建党、政治建军原则确立 / 保护中农利益改正', content: '兴国土地法改为“没收一切公共土地及地主阶级土地”；古田会议确立红军是执行革命政治任务的武装集团。', sig: '确立“思想建党、政治建军”原则，新型人民军队由此定型！' },
  { id: '1930', year: 1930, date: '1930年1月 / 5月', loc: '古田 / 寻乌', title: '《星星之火，可以燎原》 & 《反对本本主义》', cat: 'work', keyTag: '以农村为中心思想确立 / 没有调查没有发言权', content: '回答红旗到底打得多久；《反对本本主义》首提党的思想路线。', sig: '标志着以农村为中心、农村包围城市道路思想基本形成；蕴含毛泽东思想活的灵魂雏形。' },
  { id: '1931', year: 1931, date: '1931年9月18日 / 11月', loc: '沈阳 / 瑞金', title: '九一八事变 & 中华苏维埃共和国临时政府成立', cat: 'event', keyTag: '抗日战争起点 / 局部执政伟大尝试', content: '九一八事变爆发；一苏大会在瑞金召开成立中华苏维埃共和国。', sig: '九一八事变是中国抗日战争的起点（14年抗战），揭开反法西斯战争序幕。' },
  { id: '1935a', year: 1935, date: '1935年1月', loc: '贵州遵义', title: '遵义会议（中央政治局扩大会议）', cat: 'meeting', keyTag: '生死攸关的转折点 / 走向成熟的标志', content: '集中解决军事问题和组织问题，肯定毛泽东正确主张，增选为政治局常委。', sig: '开始确立毛泽东为核心的党中央领导，最危急关头挽救了党、红军和中国革命；标志党在政治上开始走向成熟！', pitfall: '极高频陷阱：遵义会议【仅解决军事与组织问题】，未解决政治路线与思想路线！' },
  { id: '1935b', year: 1935, date: '1935年12月', loc: '北平 / 瓦窑堡', title: '一二·九运动 & 瓦窑堡会议', cat: 'meeting', keyTag: '救亡新高潮 / 抗日民族统一战线新方针', content: '北平学生掀起一二·九救亡运动；瓦窑堡会议批判左倾关门主义，提出建立抗日民族统一战线。', sig: '解决了遵义会议来不及解决的政治路线问题！' },
  { id: '1936', year: 1936, date: '1936年10月 / 12月12日', loc: '会宁 / 西安', title: '红军长征胜利会师 & 西安事变和平解决', cat: 'event', keyTag: '时局转换的枢纽 / 十年内战基本结束', content: '三大主力会宁会师；西安事变和平解决促使蒋介石答应停止内战一致抗日。', sig: '西安事变和平解决成为时局转换的枢纽，十年内战局面基本结束，抗日民族统一战线初步形成！' },
  { id: '1937', year: 1937, date: '1937年7—9月', loc: '卢沟桥 / 洛川', title: '卢沟桥事变、洛川会议与第二次国共合作正式形成', cat: 'meeting', keyTag: '全民族抗战开端 / 全面抗战路线与减租减息', content: '7.7卢沟桥事变；8月洛川会议通过《抗日救国十大纲领》推行减租减息；9月国共合作宣言发表；平型关大捷。', sig: '抗日民族统一战线正式形成；平型关大捷粉碎日军不可战胜神话！', pitfall: '抗战土地政策是【地主减租减息、农民交租交息】，未废除地主所有制。' },
  { id: '1938', year: 1938, date: '1938年5月 / 9月', loc: '延安', title: '《论持久战》发表 & 六届六中全会', cat: 'meeting', keyTag: '首提“马克思主义中国化” / 预测抗战三阶段', content: '《论持久战》阐明防御、相持、反攻三阶段；六届六中全会毛泽东首次明确提出“马克思主义中国化”重大命题。', sig: '坚定了全国军民抗战必胜信念；开启马克思主义中国化自觉。', pitfall: '首提在1938六届六中全会，写入党章确立为指导思想在1945中共七大！' },
  { id: '1939', year: 1939, date: '1939—1940年', loc: '延安', title: '《〈共产党人〉发刊词》《新民主主义论》', cat: 'work', keyTag: '三大法宝提出 / 新民主主义理论体系成熟', content: '总结三大法宝（统一战线、武装斗争、党的建设）；完整阐明新民主主义政治经济文化纲领。', sig: '标志着毛泽东思想得到多方面展开而趋于成熟。' },
  { id: '1942', year: 1942, date: '1941—1942年', loc: '延安', title: '延安整风运动（《改造我们的学习》等）', cat: 'event', keyTag: '主观主义以整顿学风 / 确立实事求是思想路线', content: '学风、党风、文风三整顿，惩前毖后治病救人方针，彻底清算教条主义。', sig: '伟大的马克思主义思想解放运动，使实事求是思想路线在全党确立。', pitfall: '整风最主要任务是反对主观主义以整顿学风，核心是反对【教条主义】！' },
  { id: '1945', year: 1945, date: '1945年4—10月', loc: '延安 / 重庆', title: '六届七中全会、中共七大与抗战伟大胜利', cat: 'meeting', keyTag: '首个历史决议 / 确立毛泽东思想为指导思想 / 完全胜利', content: '通过首个历史决议；七大作《论联合政府》概括三大作风，写入党章；抗战胜利台湾光复；赴渝谈判签《双十协定》。', sig: '近代以来反抗外敌入侵第一次完全胜利；中共发挥中流砥柱关键作用！' },
  { id: '1946', year: 1946, date: '1946年5月 / 6月', loc: '延安', title: '《五四指示》与全面内战爆发', cat: 'policy', keyTag: '由减租减息转变为实现“耕者有其田”', content: '决定将减租减息改变为实现耕者有其田；国民党大举围攻中原解放区挑起全面内战。', sig: '拉开全国解放区土地制度改革序幕。' },
  { id: '1947', year: 1947, date: '1947年6—9月', loc: '大别山 / 西柏坡', title: '千里跃进大别山 & 《中国土地法大纲》', cat: 'policy', keyTag: '解放战争历史性转折 / 彻底废除封建土地制度', content: '刘邓大军挺进大别山揭开战略进攻序幕；全国土地会议制定《中国土地法大纲》。', sig: '耕者有其田激发亿万农民磅礴伟力，加速全国解放胜利。' },
  { id: '1948', year: 1948, date: '1948年4月 / 9月起', loc: '晋绥 / 各战场', title: '晋绥讲话、“五一口号”与三大战役决战', cat: 'event', keyTag: '新民主主义总路线完整表述 / 摧毁国民党主力', content: '把官僚资本主义列为革命对象；五一口号开启协商建国；三大战役消灭国民党主力。', sig: '奠定全国解放与筹建新政权胜利基石。' },
  { id: '1949', year: 1949, date: '1949年3月 / 10月1日', loc: '西柏坡 → 北京', title: '七届二中全会、《论人民民主专政》与新中国诞生', cat: 'meeting', keyTag: '乡村转向城市 / 两个务必 / 结束半殖民地半封建', content: '二中全会指明工作重心转移与两个务必；政协通过《共同纲领》；10月1日开国大典。', sig: '彻底结束半殖民地半封建历史，新民主主义革命取得基本胜利，进入新民主主义社会！', pitfall: '1949年进入的是【新民主主义社会】（过渡性质），1956底三大改造完成才确立社会主义基本制度！' },
  { id: '1950', year: 1950, date: '1950年6月 / 10月', loc: '北京 / 朝鲜', title: '《土地改革法》颁布 & 抗美援朝战争', cat: 'policy', keyTag: '保存富农经济 / 新中国立国之战', content: '新解放区土改实行“保存富农经济”政策；志愿军抗美援朝保家卫国。', sig: '彻底消灭两千多年封建剥削土地制；拼来山河无恙，打出新中国国威军威。' },
  { id: '1953', year: 1953, date: '1953年', loc: '北京', title: '过渡时期总路线（“一化三改”）与“一五”计划', cat: 'policy', keyTag: '一体两翼 / 适合中国特点的改造道路', content: '工业化为主体，农业、手工业、资本主义工商业改造为两翼。', sig: '和平赎买实现深刻社会变革。' },
  { id: '1954', year: 1954, date: '1954年9月', loc: '北京', title: '一届全国人大一次会议 & “五四宪法”', cat: 'meeting', keyTag: '根本政治制度正式确立 / 首部社会主义宪法', content: '通过1954年宪法，确立人民代表大会制度为国家根本政治制度。', sig: '奠定社会主义民主法治坚实基石。' },
  { id: '1956', year: 1956, date: '1956年4月 / 9月 / 底', loc: '北京', title: '《论十大关系》、中共八大与确立社会主义基本制度', cat: 'meeting', keyTag: '以苏为鉴探索开篇 / 国内主要矛盾转化 / 基本制度确立', content: '毛泽东发表《论十大关系》；八大正确分析国内主要矛盾变化；年底三大改造完成。', sig: '社会主义基本制度在我国全面确立，中国进入社会主义初级阶段！' },
  { id: '1957', year: 1957, date: '1957年2月', loc: '北京', title: '发表《关于正确处理人民内部矛盾的问题》', cat: 'work', keyTag: '正确处理人民内部矛盾为国家政治生活主题', content: '阐明社会主义基本矛盾非对抗性，严格区分敌我与人民内部两类矛盾。', sig: '创造性发展马克思主义国家学说。' },
  { id: '1971', year: 1971, date: '1971年10月', loc: '联合国', title: '恢复在联合国一切合法权利（附两弹一星）', cat: 'event', keyTag: '第26届联大2758号决议 / 大国外交与工业体系', content: '1964原子弹、1967氢弹、1970人造卫星；1971恢复联合国席位。', sig: '打破大国核垄断，奠定独立完整的现代工业与国防体系。' },
  { id: '1978', year: 1978, date: '1978年5月 / 12月', loc: '北京', title: '真理标准大讨论 & 中共十一届三中全会', cat: 'meeting', keyTag: '新中国成立以来具有深远意义的伟大转折', content: '彻底否定两个凡是，结束以阶级斗争为纲，重心转移到经济建设上来实行改革开放。', sig: '开启改革开放和社会主义现代化建设历史新时期！' },
  { id: '1981', year: 1981, date: '1981年6月', loc: '北京', title: '中共十一届六中全会（第二个历史决议）', cat: 'meeting', keyTag: '科学评价毛泽东 / 指导思想拨乱反正胜利完成', content: '通过历史决议，概括毛泽东思想活的灵魂（实事求是、群众路线、独立自主）。', sig: '标志着党在指导思想上的拨乱反正胜利完成！' },
  { id: '1982', year: 1982, date: '1982年9月', loc: '北京', title: '中共十二大 & 八二宪法通过', cat: 'meeting', keyTag: '首提“建设有中国特色的社会主义”重大命题', content: '邓小平开幕词提出“建设有中国特色的社会主义”；12月通过现行宪法。', sig: '确立改革开放和现代化建设凝聚全党的伟大旗帜。' },
  { id: '1987', year: 1987, date: '1987年10月', loc: '北京', title: '中国共产党第十三次全国代表大会（中共十三大）', cat: 'meeting', keyTag: '初级阶段理论 / 一个中心两个基本点', content: '系统阐述初级阶段理论，概括党的基本路线，制定“三步走”发展战略。', sig: '标志着邓小平理论轮廓形成。' },
  { id: '1992', year: 1992, date: '1992年1—2月 / 10月', loc: '南方/北京', title: '邓小平南方谈话 & 中共十四大', cat: 'meeting', keyTag: '社会主义本质论 / 确立建立社会主义市场经济体制目标', content: '南方谈话阐明本质与三个有利于；十四大确立社会主义市场经济体制改革目标。', sig: '南方谈话与十四大标志邓小平理论走向成熟。' },
  { id: '1997', year: 1997, date: '1997年7月 / 9月', loc: '香港/北京', title: '香港回归祖国 & 中共十五大', cat: 'meeting', keyTag: '确立邓小平理论为指导思想 / 基本经济制度确立', content: '恢复行使主权；十五大将邓小平理论写入党章，确立公有制为主体多种所有制共同发展。', sig: '把建设有中国特色社会主义全面推向21世纪。' },
  { id: '2001', year: 2001, date: '2001年12月', loc: '多哈/北京', title: '加入世贸组织（WTO）& 中共十六大', cat: 'event', keyTag: '对外开放新阶段 / 确立“三个代表”重要思想', content: '加入WTO；十六大确立“三个代表”重要思想为指导思想，提出全面建设小康社会目标。', sig: '标志我国对外开放进入全新阶段。' },
  { id: '2012', year: 2012, date: '2012年11月', loc: '北京', title: '中国共产党第十八次全国代表大会 & “中国梦”', cat: 'meeting', keyTag: '中国特色社会主义进入新时代 / 伟大复兴中国梦', content: '确立五位一体总体布局；首次提出并阐述中华民族伟大复兴的中国梦。', sig: '标定我国发展新的历史方位——中国特色社会主义进入新时代！' },
  { id: '2013', year: 2013, date: '2013年11月', loc: '北京', title: '中共十八届三中全会', cat: 'meeting', keyTag: '也是划时代的会议 / 新时代全面深化改革新征程', content: '审议通过深化改革决定，使市场在资源配置中起决定性作用和更好发挥政府作用。', sig: '与十一届三中全会并称两个划时代的三中全会！' },
  { id: '2017', year: 2017, date: '2017年10月', loc: '北京', title: '中国共产党第十九次全国代表大会（中共十九大）', cat: 'meeting', keyTag: '社会主要矛盾转化 / 确立习近平新时代中国特色社会主义思想', content: '主要矛盾转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾；确立指导思想写入党章；两步走战略。', sig: '深刻回答新时代坚持和发展什么样的中国特色社会主义、怎样坚持和发展。', pitfall: '主要矛盾变了，但“我国处于社会主义初级阶段基本国情没变、最大发展中国家国际地位没变”！' },
  { id: '2021', year: 2021, date: '2021年7月 / 11月', loc: '北京', title: '庆祝建党百年大会 & 十九届六中全会（第三个决议）', cat: 'meeting', keyTag: '全面建成小康社会 / “两个确立”决定性意义', content: '庄严宣告全面建成小康社会；六中全会通过百年奋斗历史决议，提出“两个确立”决定性意义。', sig: '实现中华民族伟大复兴进入不可逆转的历史进程！' },
  { id: '2022', year: 2022, date: '2022年10月', loc: '北京', title: '中国共产党第二十次全国代表大会（中共二十大）', cat: 'meeting', keyTag: '以中国式现代化全面推进中华民族伟大复兴', content: '明确新时代新征程中心任务，阐述中国式现代化的5大特色、9条本质要求与重大原则。', sig: '全面建设社会主义现代化国家新征程的纲领性文献。' },
  { id: '2024', year: 2024, date: '2024年7月', loc: '北京', title: '中共二十届三中全会', cat: 'meeting', keyTag: '进一步全面深化改革、推进中国式现代化', content: '通过进一步全面深化改革决定，提出“六个坚持”原则，到2029年建国80周年完成改革任务。', sig: '既是十八届三中全会以来全面深化改革的实践续篇，也是新征程推进中国式现代化的时代新篇。' }
];

const MATRIX_DATA = {
  land: {
    headers: ['历史时期', '代表文献 / 标志', '核心土地政策', '主要矛盾背景与考向排雷'],
    rows: [
      ['太平天国 (1853)', '《天朝田亩制度》', '按人口年龄平均分配土地（“有田同耕”）', '否定封建地主土地制，但属绝对平均主义空想，未真正实行'],
      ['旧民主革命 (1905)', '同盟会“民生主义”', '平均地权（核定地价，增价归公）', '并非平分土地，未正面触及封建剥削土地制，缺乏农民动员力'],
      ['土地革命 (1928–29)', '《井冈山》→《兴国土地法》', '由“没收一切土地”改为“没收公共及地主土地”', '兴国法作出保护中农利益的原则性改正；依靠贫雇农、联合中农、限制富农、消灭地主'],
      ['全面抗战 (1937–45)', '洛川会议十大纲领', '地主减租减息、农民交租交息', '中日民族矛盾为主要矛盾：调动农民积极性同时团结开明地主抗日（未废除地主所有制）'],
      ['解放战争 (1946–47)', '《五四指示》→《中国土地法大纲》', '废除封建剥削土地制，实行耕者有其田（征收富农多余土地）', '阶级矛盾上升为主要矛盾：由减租减息转向耕者有其田，彻底消灭封建剥削制度'],
      ['建国初期 (1950)', '《中华人民共和国土地改革法》', '废除地主剥削土地制，【保存富农经济】', '核心区别：由征收富农多余土地改为保存富农经济，孤立地主稳定中农，恢复农业生产'],
      ['改开新时期 (1978起)', '家庭联产承包责任制', '土地公有制（集体所有）性质不变，包产到户', '绝非土地私有化！所有权与承包经营权分离，解放农村生产力']
    ]
  },
  meet: {
    headers: ['会议名称', '时间地点', '核心“首次/转折/标志”关键词', '常见干扰项排雷'],
    rows: [
      ['中共一大', '1921.7 上海/嘉兴', '开天辟地的大事变；确定党的名称与最高理想，伟大建党精神', '尚未提出明确的反帝反封建民主革命纲领'],
      ['中共二大', '1922.7 上海', '【首次】提出明确的反帝反封建民主革命纲领（区分最高与最低纲领）', '不是中共一大，也不是同盟会'],
      ['中共三大 vs 国民党一大', '1923.6 / 1924.1 广州', '三大决定个人身份加入国民党；国民党一大【标志第一次国共合作正式形成】', '合作正式形成标志是国民党一大，非中共三大'],
      ['中共四大', '1925.1 上海', '【首次】明确提出无产阶级领导权和工农联盟问题', '严防与二大（纲领）混淆'],
      ['八七会议', '1927.8 汉口', '“枪杆子出政权”；【大革命失败到土地革命兴起的历史转折】', '未彻底防止左倾盲动滋生；未提农村包围城市'],
      ['遵义会议', '1935.1 遵义', '集中解决【军事问题和组织问题】；【生死攸关的转折点】；走向成熟', '没有解决政治路线（瓦窑堡）和思想路线（整风）'],
      ['瓦窑堡 vs 洛川', '1935.12 / 1937.8', '瓦窑堡确立【抗日民族统一战线】新方针；洛川制定《抗日救国十大纲领》全面抗战路线', '统战方针在瓦窑堡，全面抗战路线在洛川'],
      ['六届六中 vs 中共七大', '1938 / 1945 延安', '六届六中【首提“马克思主义中国化”】；七大【确立毛泽东思想为指导思想写入党章】', '首提命题在1938，写入党章在1945七大'],
      ['中共七届二中全会', '1949.3 西柏坡', '工作重心【由乡村转移到城市】；两个转变总任务；提出“两个务必”', '1927是由城转乡，1949是由乡转城'],
      ['中共八大', '1956.9 北京', '分析国内主要矛盾变化；综合平衡稳步前进', '陈云在八大提出“三个主体三个补充”'],
      ['十一届三中 vs 十八届三中', '1978.12 / 2013.11', '两个“划时代”：前者开启改开新时期；后者开启新时代全面深化改革新征程', '二十届三中（2024.7）紧扣推进中国式现代化深化改革']
    ]
  },
  res: {
    headers: ['历史决议名称', '通过会议与时间', '核心解决的历史问题与主题', '历史标志意义'],
    rows: [
      ['《关于若干历史问题的决议》', '1945年4月 · 六届七中全会', '系统总结建党至抗战经验，清算王明左倾教条主义，高度评价毛泽东卓越贡献', '统一全党认识，为中共七大确立毛泽东思想为指导思想奠定坚实基础'],
      ['《关于建国以来党的若干历史问题的决议》', '1981年6月 · 十一届六中全会', '科学评价毛泽东和毛泽东思想历史地位（功绩第一、错误第二），首次概括活的灵魂', '标志着党在指导思想上的拨乱反正胜利完成！'],
      ['《关于党的百年奋斗重大成就和历史经验的决议》', '2021年11月 · 十九届六中全会', '建党百年总结四个时期伟大成就与飞跃，鲜明提出“两个确立”，概括十个坚持', '马克思主义纲领性文献，新时代全面推进强国建设民族复兴的行动指南']
    ]
  }
};

let curYear = 1921;
let curCat = 'all';
let curEraIdx = 1;
let onlyPitfall = false;
let onlyAnniv = false;
let maskMode = false;
let revealed = {};
let isPlaying = false;
let playTimer = null;
let showMatrix = false;
let curMatrix = 'land';

function getAnnivInfo(y) {
  const d26 = 2026 - y;
  const d27 = 2027 - y;
  const tags = [];
  if (d26 > 0 && d26 % 5 === 0) tags.push('2026逢' + d26 + '周年');
  if (d27 > 0 && d27 % 5 === 0) tags.push('2027考研' + d27 + '周年');
  return tags;
}

function getFilteredList() {
  return ITEMS.filter(it => {
    if (curCat !== 'all' && it.cat !== curCat) return false;
    if (onlyPitfall && !it.pitfall) return false;
    if (onlyAnniv && getAnnivInfo(it.year).length === 0) return false;
    return true;
  });
}

function getYearsList(filtered) {
  const set = Array.from(new Set(filtered.map(i => i.year))).sort((a,b) => a - b);
  return set.length > 0 ? set : [1921];
}

function render() {
  const filtered = getFilteredList();
  const years = getYearsList(filtered);

  if (!years.includes(curYear)) {
    curYear = years.reduce((p, c) => Math.abs(c - curYear) < Math.abs(p - curYear) ? c : p);
  }

  // 计算当前时期
  const era = ERAS.find(e => curYear >= e.start && curYear <= e.end) || ERAS[1];
  curEraIdx = ERAS.indexOf(era);

  // 1. 更新顶部数值
  document.getElementById('yearNum').innerText = curYear;
  document.getElementById('yearNum').style.color = era.color;
  document.getElementById('eraBadge').innerText = era.name;
  document.getElementById('eraSummary').innerText = era.desc;

  const annivs = getAnnivInfo(curYear);
  const annivTag = document.getElementById('annivTag');
  if (annivs.length) {
    annivTag.style.display = 'block';
    annivTag.innerText = '🔥 ' + annivs.join(' · ');
  } else {
    annivTag.style.display = 'none';
  }

  // 2. 更新按钮高亮
  ERAS.forEach((e, idx) => {
    const btn = document.getElementById('era-' + e.key);
    if (btn) btn.className = idx === curEraIdx ? 'active' : '';
  });
  ['all', 'meeting', 'event', 'work', 'policy'].forEach(c => {
    const btn = document.getElementById('cat-' + c);
    if (btn) btn.className = curCat === c ? 'active' : '';
  });
  document.getElementById('cat-pitfall').className = onlyPitfall ? 'active' : '';
  document.getElementById('btn-anniv').className = onlyAnniv ? 'active-amber' : '';
  document.getElementById('btn-mask').className = maskMode ? 'active' : '';

  // 3. 同步滑块
  const slider = document.getElementById('yearSlider');
  const idx = Math.max(0, years.indexOf(curYear));
  slider.max = Math.max(0, years.length - 1);
  slider.value = idx;
  const pct = years.length > 1 ? (idx / (years.length - 1)) * 100 : 0;
  slider.style.setProperty('--prog', pct + '%');
  slider.style.setProperty('--track-fill', era.color);

  // 4. 渲染年份热力标尺
  const pBar = document.getElementById('pillsBar');
  pBar.innerHTML = years.map(y => {
    const act = y === curYear;
    const cnt = filtered.filter(i => i.year === y).length;
    const h = Math.min(22, 6 + cnt * 6);
    const ann = getAnnivInfo(y).length > 0;
    return '<div class="year-pill ' + (act ? 'active' : '') + '" onclick="selectYear(' + y + ')">' +
      '<div class="bar" style="height:' + h + 'px;' + (ann ? 'background:#f59e0b;' : '') + '"></div>' +
      '<span>' + y + '</span>' +
      '</div>';
  }).join('');

  // 自动将选中的标尺滚动到视口中央
  const actPill = pBar.querySelector('.year-pill.active');
  if (actPill) {
    pBar.scrollTo({ left: Math.max(0, actPill.offsetLeft - pBar.clientWidth / 2 + 20), behavior: 'smooth' });
  }

  // 5. 渲染卡片
  const yearItems = filtered.filter(i => i.year === curYear);
  document.getElementById('itemsCount').innerText = '当年考点：' + yearItems.length + ' 项';

  const cBox = document.getElementById('cardsBox');
  if (yearItems.length === 0) {
    cBox.innerHTML = '<div style="background:#0f172a; border:1px solid var(--border-color); border-radius:10px; padding:20px; text-align:center; color:#94a3b8;">' +
      '当年份暂无独立大纲考点，点击下方左右按钮推进。' +
      '</div>';
  } else {
    cBox.innerHTML = yearItems.map(it => {
      const isMasked = maskMode && !revealed[it.id];
      const itAnn = getAnnivInfo(it.year);

      return '<div class="event-card" style="border-left-color:' + era.color + '">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">' +
          '<div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-bottom:4px;">' +
              '<span class="badge" style="border-color:#334155; color:#cbd5e1;">' + (it.cat === 'meeting' ? '🏛️ 政治会议' : it.cat === 'event' ? '🔥 历史事件' : it.cat === 'work' ? '📜 核心文献' : '🌾 土地路线') + '</span>' +
              '<span style="font-size:11px; font-family:monospace; color:#94a3b8;">' + it.date + '</span>' +
              (it.loc ? '<span style="font-size:11px; color:#38bdf8;">📍 ' + it.loc + '</span>' : '') +
              (itAnn.length ? '<span style="font-size:11px; font-weight:700; color:#f59e0b;">🔥 ' + itAnn.join(' / ') + '</span>' : '') +
            '</div>' +
            '<h2 style="font-size:16px; font-weight:800; color:#fff;">' + it.title + '</h2>' +
          '</div>' +
          (maskMode ? '<button onclick="toggleCardMask(\\'' + it.id + '\\')" style="font-size:11px; padding:3px 8px;">' + (isMasked ? '👁️ 揭晓' : '🙈 遮挡') + '</button>' : '') +
        '</div>' +

        (isMasked
          ? '<div class="mask-placeholder" onclick="toggleCardMask(\\'' + it.id + '\\')">💡 <b>主动回忆遮罩已开启：</b>请先在脑海中默背【核心定性词】、【决议主要内容】与【常见干扰项】，点击揭晓核对。</div>'
          : '<div class="keytag-banner"><span>🔑 核心定性：</span><span>' + it.keyTag + '</span></div>' +
            '<div class="detail-box">' +
              '<div class="sub-box"><div class="sub-t">📋 核心内容与决议</div><p style="color:#cbd5e1;">' + it.content + '</p></div>' +
              '<div class="sub-box"><div class="sub-t">🌟 考研标准历史意义</div><p style="color:#cbd5e1;">' + it.sig + '</p></div>' +
            '</div>' +
            (it.pitfall ? '<div class="pitfall-box"><b>⚠️ 命题陷阱与易混辨析：</b>' + it.pitfall + '</div>' : '')
        ) +
      '</div>';
    }).join('');
  }
}

function onSliderMove(val) {
  stopPlay();
  const filtered = getFilteredList();
  const years = getYearsList(filtered);
  const targetYear = years[Number(val)];
  if (targetYear !== undefined) {
    curYear = targetYear;
    render();
  }
}

function selectYear(y) {
  stopPlay();
  curYear = y;
  render();
}

function setEra(idx) {
  stopPlay();
  const era = ERAS[idx];
  const filtered = getFilteredList();
  const years = getYearsList(filtered);
  const target = years.find(y => y >= era.start && y <= era.end);
  curYear = target !== undefined ? target : era.start;
  render();
}

function setCat(c) {
  stopPlay();
  curCat = c;
  render();
}

function toggleOnlyPitfall() {
  stopPlay();
  onlyPitfall = !onlyPitfall;
  render();
}

function toggleAnniv() {
  stopPlay();
  onlyAnniv = !onlyAnniv;
  render();
}

function toggleMask() {
  maskMode = !maskMode;
  revealed = {};
  render();
}

function toggleCardMask(id) {
  revealed[id] = !revealed[id];
  render();
}

function stepYear(delta) {
  stopPlay();
  const years = getYearsList(getFilteredList());
  const idx = years.indexOf(curYear);
  const nextIdx = idx + delta;
  if (nextIdx >= 0 && nextIdx < years.length) {
    curYear = years[nextIdx];
    render();
  }
}

function stopPlay() {
  isPlaying = false;
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  document.getElementById('btn-play').innerText = '▶ 自动演进巡航';
  document.getElementById('btn-play').classList.remove('active');
  document.getElementById('btn-play').classList.add('primary');
}

function togglePlay() {
  if (isPlaying) {
    stopPlay();
  } else {
    isPlaying = true;
    document.getElementById('btn-play').innerText = '⏸ 暂停演进';
    document.getElementById('btn-play').classList.add('active');
    document.getElementById('btn-play').classList.remove('primary');
    playTimer = setInterval(() => {
      const years = getYearsList(getFilteredList());
      const idx = years.indexOf(curYear);
      if (idx + 1 < years.length) {
        curYear = years[idx + 1];
        render();
      } else {
        curYear = years[0];
        stopPlay();
        render();
      }
    }, 3200);
  }
}

function toggleMatrix() {
  showMatrix = !showMatrix;
  document.getElementById('matrixBox').style.display = showMatrix ? 'block' : 'none';
  if (showMatrix) renderMatrix();
}

function switchMatrix(mKey) {
  curMatrix = mKey;
  ['land', 'meet', 'res'].forEach(k => {
    document.getElementById('m-tab-' + k).className = k === mKey ? 'active' : '';
  });
  renderMatrix();
}

function renderMatrix() {
  const m = MATRIX_DATA[curMatrix];
  const tbl = document.getElementById('matrixTable');
  let html = '<thead><tr>' + m.headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>';
  m.rows.forEach(r => {
    html += '<tr>' + r.map((c, i) => '<td style="' + (i === 0 ? 'font-weight:700;color:#fff;white-space:nowrap;' : i === 1 ? 'color:#38bdf8;' : i === 3 ? 'color:#fca5a5;' : '') + '">' + (maskMode && i >= 2 ? '🙈 [背诵遮罩中]' : c) + '</td>').join('') + '</tr>';
  });
  html += '</tbody>';
  tbl.innerHTML = html;
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') stepYear(-1);
  if (e.key === 'ArrowRight') stepYear(1);
  if (e.key === ' ') {
    e.preventDefault();
    togglePlay();
  }
});

render();
</script>
</body>
</html>`,
}
