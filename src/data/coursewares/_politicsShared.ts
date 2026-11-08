/**
 * 政治类交互课件共享的基础样式与脚本（嵌入各课件 iframe 的 srcdoc 中）。
 * 注意：脚本内禁止使用反引号与模板插值，以免破坏外层模板字符串。
 */
export const POLITICS_BASE_CSS = `
  :root {
    --bg: #0b0f19; --card: #121827; --border: #1f293d;
    --text: #f1f5f9; --muted: #94a3b8;
    --red: #ef4444; --amber: #f59e0b; --blue: #38bdf8; --green: #10b981; --indigo: #818cf8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); padding: 14px; line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Noto Sans SC", sans-serif; }
  header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
    padding-bottom: 10px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
  h1 { font-size: 15px; font-weight: 700; color: #f87171; }
  h2 { font-size: 13px; font-weight: 700; color: var(--amber); margin-bottom: 8px; }
  .badge { background: rgba(239,68,68,.15); color: #f87171; font-size: 11px; padding: 2px 8px;
    border-radius: 999px; border: 1px solid rgba(239,68,68,.3); }
  .panel { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
  .grid2 { display: grid; grid-template-columns: 300px 1fr; gap: 12px; }
  @media (max-width: 760px) { .grid2 { grid-template-columns: 1fr; } }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .tab, .chip { background: #080c14; border: 1px solid var(--border); color: var(--muted); font-size: 12px;
    padding: 5px 12px; border-radius: 8px; cursor: pointer; }
  .tab.active, .chip.active { background: rgba(239,68,68,.15); color: #fca5a5; border-color: rgba(239,68,68,.45); }
  .tips { background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.28); border-radius: 8px;
    padding: 10px; font-size: 12px; color: #fcd34d; }
  .qcard { background: #080c14; border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 10px; }
  .qtext { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
  .opt { display: block; width: 100%; text-align: left; background: #0f1524; color: var(--text);
    border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;
    font-size: 12px; cursor: pointer; font-family: inherit; }
  .opt:hover:not(:disabled) { border-color: var(--blue); }
  .opt.right { background: rgba(16,185,129,.18); border-color: var(--green); }
  .opt.wrong { background: rgba(239,68,68,.18); border-color: var(--red); }
  .qfb { display: none; font-size: 12px; color: #cbd5e1; background: rgba(56,189,248,.08);
    border-left: 3px solid var(--blue); padding: 8px 10px; border-radius: 4px; margin-top: 4px; }
  .score { font-size: 12px; color: var(--green); font-weight: 600; }
  button.act { background: #1e293b; color: var(--text); border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 12px; font-size: 12px; cursor: pointer; font-family: inherit; }
  button.act:hover { border-color: var(--blue); }
`

export const POLITICS_BASE_JS = `
function shuffle(a) {
  var b = a.slice();
  for (var i = b.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}
// items: [{ q: 题干, opts: [正确项, 干扰项...], exp: 解析 }]
function renderQuiz(boxId, items, scoreId) {
  var box = document.getElementById(boxId);
  var sc = document.getElementById(scoreId);
  box.innerHTML = '';
  var done = 0, right = 0;
  function upd() { sc.textContent = '已答 ' + done + '/' + items.length + ' · 正确 ' + right; }
  upd();
  items.forEach(function (it, idx) {
    var card = document.createElement('div'); card.className = 'qcard';
    var h = document.createElement('div'); h.className = 'qtext';
    h.textContent = (idx + 1) + '. ' + it.q; card.appendChild(h);
    var fb = document.createElement('div'); fb.className = 'qfb';
    var answered = false;
    shuffle(it.opts).forEach(function (o) {
      var b = document.createElement('button'); b.className = 'opt'; b.textContent = o;
      b.onclick = function () {
        if (answered) return;
        answered = true; done++;
        var ok = (o === it.opts[0]);
        if (ok) right++;
        Array.prototype.forEach.call(card.querySelectorAll('.opt'), function (x) {
          x.disabled = true;
          if (x.textContent === it.opts[0]) x.classList.add('right');
        });
        if (!ok) b.classList.add('wrong');
        fb.textContent = (ok ? '✅ 正确。' : '❌ 错误。') + it.exp;
        fb.style.display = 'block';
        upd();
      };
      card.appendChild(b);
    });
    card.appendChild(fb); box.appendChild(card);
  });
}
`
