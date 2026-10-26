// metro-fare-bd \u2014 UI logic: calculator, fare chart, pass savings, line map.
// Zero network requests; state persisted in localStorage.
'use strict';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
function toBnDigits(str) {
  return String(str).replace(/[0-9]/g, d => BN_DIGITS[+d]);
}
const I18N = {
  en: {
    tagline: 'Dhaka Metro Rail (MRT Line 6) fares \u2014 offline, no data needed',
    tabCalc: 'Fare Calculator', tabChart: 'Full Fare Chart', tabPass: 'Pass Savings', tabLine: 'Line Map',
    from: 'From station', to: 'To station', swap: 'Swap stations',
    ticket: 'Ticket type', single: 'Single Journey Ticket', pass: 'MRT / Rapid Pass (10% off)',
    conc: 'Special needs (15% off, with ID)',
    calcBtn: 'Calculate fare', sameErr: 'Pick two different stations.',
    fare: 'Fare', passFare: 'With MRT / Rapid Pass', concFare: 'Special-needs fare',
    stops: 'stations', direction: 'Direction', north: 'Northbound (towards Uttara North)',
    south: 'Southbound (towards Motijheel)', via: 'Route', est: 'Estimated travel time (about)',
    min: 'min', result: 'Your trip', roundTrip: 'Return trip (same fare)',
    chartHint: 'Tap a station name to highlight its row. All fares in BDT (\u09f3).',
    search: 'Search station\u2026', passTitle: 'Is a pass worth it for you?',
    tripsDay: 'One-way trips per day', daysWeek: 'Travel days per week',
    weeklySingle: 'Weekly cost, single tickets', weeklyPass: 'Weekly cost, with pass',
    monthlySave: 'You save per month (approx.)', passNote: 'Pass fares are exactly 10% off. A pass itself costs \u09f3500 (MRT Pass, \u09f3200 refundable deposit) or \u09f3400 (Rapid Pass, \u09f3200 deposit).',
    lineHint: 'Tap a station to use it as From, then tap another for To.',
    setFrom: 'Set as From', setTo: 'Set as To',
    footer1: 'Fares: DMTCL station-by-station table (5 BDT/km, min \u09f320, max \u09f3100). Cross-checked against published tables in October 2026.',
    footer2: 'Kamalapur station is not yet in passenger service, so it is not included. Fares can change \u2014 check the station fare chart before travelling.',
    footer3: 'Unofficial app. Not affiliated with DMTCL.',
    emptyChart: 'No station matches your search.',
    perMonth: '/ month',
  },
  bn: {
    tagline: '\u09a2\u09be\u0995\u09be \u09ae\u09c7\u099f\u09cd\u09b0\u09cb\u09b0\u09c7\u09b2 (\u098f\u09ae\u0986\u09b0\u099f\u09bf \u09b2\u09be\u0987\u09a8 \u09ec) \u09ad\u09be\u09a1\u09bc\u09be \u2014 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7 \u099a\u09b2\u09c7',
    tabCalc: '\u09ad\u09be\u09a1\u09bc\u09be \u09b9\u09bf\u09b8\u09be\u09ac', tabChart: '\u09aa\u09c2\u09b0\u09cd\u09a3 \u09ad\u09be\u09a1\u09bc\u09be \u09a4\u09be\u09b2\u09bf\u0995\u09be', tabPass: '\u09aa\u09be\u09b8\u09c7 \u09b8\u09be\u09b6\u09cd\u09b0\u09af\u09bc', tabLine: '\u09b2\u09be\u0987\u09a8 \u09ae\u09cd\u09af\u09be\u09aa',
    from: '\u09af\u09be\u09a4\u09cd\u09b0\u09be \u09b6\u09c1\u09b0\u09c1', to: '\u0997\u09a8\u09cd\u09a4\u09ac\u09cd\u09af', swap: '\u0985\u09a6\u09b2\u09ac\u09a6\u09b2',
    ticket: '\u099f\u09bf\u0995\u09bf\u099f\u09c7\u09b0 \u09a7\u09b0\u09a8', single: '\u09b8\u09bf\u0999\u09cd\u0997\u09c7\u09b2 \u099c\u09be\u09b0\u09cd\u09a8\u09bf \u099f\u09bf\u0995\u09bf\u099f', pass: '\u098f\u09ae\u0986\u09b0\u099f\u09bf / \u09b0\u200d\u09cd\u09af\u09be\u09aa\u09bf\u09a1 \u09aa\u09be\u09b8 (\u09e7\u09e6% \u099b\u09be\u09a1\u09bc)',
    conc: '\u09ac\u09bf\u09b6\u09c7\u09b7 \u099a\u09be\u09b9\u09bf\u09a6\u09be (\u09e7\u09eb% \u099b\u09be\u09a1\u09bc, \u0986\u0987\u09a1\u09bf \u09b8\u09b9)',
    calcBtn: '\u09ad\u09be\u09a1\u09bc\u09be \u09a6\u09c7\u0996\u09c1\u09a8', sameErr: '\u09a6\u09c1\u099f\u09bf \u0986\u09b2\u09be\u09a6\u09be \u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u0964',
    fare: '\u09ad\u09be\u09a1\u09bc\u09be', passFare: '\u098f\u09ae\u0986\u09b0\u099f\u09bf / \u09b0\u200d\u09cd\u09af\u09be\u09aa\u09bf\u09a1 \u09aa\u09be\u09b8\u09c7', concFare: '\u09ac\u09bf\u09b6\u09c7\u09b7 \u099a\u09be\u09b9\u09bf\u09a6\u09be\u09b0 \u09ad\u09be\u09a1\u09bc\u09be',
    stops: '\u099f\u09bf \u09b8\u09cd\u099f\u09c7\u09b6\u09a8', direction: '\u09a6\u09bf\u0995', north: '\u0989\u09a4\u09cd\u09a4\u09b0\u09ae\u09c1\u0996\u09c0 (\u0989\u09a4\u09cd\u09a4\u09b0\u09be \u0989\u09a4\u09cd\u09a4\u09b0\u09c7\u09b0 \u09a6\u09bf\u0995\u09c7)',
    south: '\u09a6\u0995\u09cd\u09b7\u09bf\u09a3\u09ae\u09c1\u0996\u09c0 (\u09ae\u09a4\u09bf\u099d\u09bf\u09b2\u09c7\u09b0 \u09a6\u09bf\u0995\u09c7)', via: '\u09b0\u09c1\u099f', est: '\u0986\u09a8\u09c1\u09ae\u09be\u09a8\u09bf\u0995 \u09ad\u09cd\u09b0\u09ae\u09a3 \u09b8\u09ae\u09af\u09bc',
    min: '\u09ae\u09bf\u09a8\u09bf\u099f', result: '\u0986\u09aa\u09a8\u09be\u09b0 \u09af\u09be\u09a4\u09cd\u09b0\u09be', roundTrip: '\u09ab\u09c7\u09b0\u09a4 \u09af\u09be\u09a4\u09cd\u09b0\u09be (\u098f\u0995\u0987 \u09ad\u09be\u09a1\u09bc\u09be)',
    chartHint: '\u0995\u09cb\u09a8\u09cb \u09b8\u09cd\u099f\u09c7\u09b6\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09b2\u09c7 \u09a4\u09be\u09b0 \u09b8\u09be\u09b0\u09bf \u09b9\u09be\u0987\u09b2\u09be\u0987\u099f \u09b9\u09ac\u09c7\u0964 \u09b8\u09ac \u09ad\u09be\u09a1\u09bc\u09be \u099f\u09be\u0995\u09be\u09af\u09bc (\u09f3)\u0964',
    search: '\u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u0996\u09c1\u0981\u099c\u09c1\u09a8\u2026', passTitle: '\u09aa\u09be\u09b8 \u0995\u09bf \u0986\u09aa\u09a8\u09be\u09b0 \u099c\u09a8\u09cd\u09af \u09b2\u09be\u09ad\u099c\u09a8\u0995?',
    tripsDay: '\u09a6\u09bf\u09a8\u09c7 \u098f\u0995\u09ae\u09c1\u0996\u09c0 \u09af\u09be\u09a4\u09cd\u09b0\u09be', daysWeek: '\u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7 \u09af\u09be\u09a4\u09be\u09af\u09bc\u09be\u09a4\u09c7\u09b0 \u09a6\u09bf\u09a8',
    weeklySingle: '\u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u0996\u09b0\u099a, \u09b8\u09bf\u0999\u09cd\u0997\u09c7\u09b2 \u099f\u09bf\u0995\u09bf\u099f\u09c7', weeklyPass: '\u09b8\u09be\u09aa\u09cd\u09a4\u09be\u09b9\u09bf\u0995 \u0996\u09b0\u099a, \u09aa\u09be\u09b8\u09c7',
    monthlySave: '\u09ae\u09be\u09b8\u09c7 \u09b8\u09be\u09b6\u09cd\u09b0\u09af\u09bc (\u09aa\u09cd\u09b0\u09be\u09af\u09bc)', passNote: '\u09aa\u09be\u09b8\u09c7 \u09ad\u09be\u09a1\u09bc\u09be \u09a0\u09bf\u0995 \u09e7\u09e6% \u0995\u09ae\u0964 \u09aa\u09be\u09b8\u09c7\u09b0 \u09a6\u09be\u09ae: \u098f\u09ae\u0986\u09b0\u099f\u09bf \u09aa\u09be\u09b8 \u09f3\u09eb\u09e6\u09e6 (\u09f3\u09e8\u09e6\u09e6 \u09ab\u09c7\u09b0\u09a4\u09af\u09cb\u0997\u09cd\u09af \u099c\u09be\u09ae\u09be\u09a8\u09a4) \u09ac\u09be \u09b0\u200d\u09cd\u09af\u09be\u09aa\u09bf\u09a1 \u09aa\u09be\u09b8 \u09f3\u09ea\u09e6\u09e6 (\u09f3\u09e8\u09e6\u09e6 \u099c\u09be\u09ae\u09be\u09a8\u09a4)\u0964',
    lineHint: '\u098f\u0995\u099f\u09bf \u09b8\u09cd\u099f\u09c7\u09b6\u09a8\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09b2\u09c7 \u09a4\u09be From \u09b9\u09ac\u09c7, \u0986\u09b0\u09c7\u0995\u099f\u09bf\u09a4\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09b2\u09c7 To \u09b9\u09ac\u09c7\u0964',
    setFrom: 'From \u0995\u09b0\u09c1\u09a8', setTo: 'To \u0995\u09b0\u09c1\u09a8',
    footer1: '\u09ad\u09be\u09a1\u09bc\u09be: \u09a1\u09bf\u098f\u09ae\u099f\u09bf\u09b8\u09bf\u098f\u09b2\u09c7\u09b0 \u09b8\u09cd\u099f\u09c7\u09b6\u09a8\u09ad\u09bf\u09a4\u09cd\u09a4\u09bf\u0995 \u09a4\u09be\u09b2\u09bf\u0995\u09be (\u09aa\u09cd\u09b0\u09a4\u09bf \u0995\u09bf\u09ae\u09bf \u09eb \u099f\u09be\u0995\u09be, \u09b8\u09b0\u09cd\u09ac\u09a8\u09bf\u09ae\u09cd\u09a8 \u09f3\u09e8\u09e6, \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09f3\u09e7\u09e6\u09e6)\u0964 \u0985\u0995\u09cd\u099f\u09cb\u09ac\u09b0 \u09e8\u09e6\u09e8\u09ec-\u098f \u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09bf\u09a4 \u09a4\u09be\u09b2\u09bf\u0995\u09be\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09ae\u09bf\u09b2\u09bf\u09af\u09bc\u09c7 \u09a6\u09c7\u0996\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
    footer2: '\u0995\u09ae\u09b2\u09be\u09aa\u09c1\u09b0 \u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u098f\u0996\u09a8\u09cb \u09af\u09be\u09a4\u09cd\u09b0\u09c0 \u099a\u09b2\u09be\u099a\u09b2\u09c7 \u099a\u09be\u09b2\u09c1 \u09b9\u09af\u09bc\u09a8\u09bf, \u09a4\u09be\u0987 \u098f\u099f\u09bf \u0985\u09a8\u09cd\u09a4\u09b0\u09cd\u09ad\u09c1\u0995\u09cd\u09a4 \u09a8\u09af\u09bc\u0964 \u09ad\u09be\u09a1\u09bc\u09be \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7 \u2014 \u09af\u09be\u09a4\u09cd\u09b0\u09be\u09b0 \u0986\u0997\u09c7 \u09b8\u09cd\u099f\u09c7\u09b6\u09a8\u09c7\u09b0 \u09ad\u09be\u09a1\u09bc\u09be \u09a4\u09be\u09b2\u09bf\u0995\u09be \u09a6\u09c7\u0996\u09c7 \u09a8\u09bf\u09a8\u0964',
    footer3: '\u0985\u09a8\u09be\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8\u09bf\u0995 \u0985\u09cd\u09af\u09be\u09aa\u0964 \u09a1\u09bf\u098f\u09ae\u099f\u09bf\u09b8\u09bf\u098f\u09b2\u09c7\u09b0 \u09b8\u0999\u09cd\u0997\u09c7 \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09bf\u09a4 \u09a8\u09af\u09bc\u0964',
    emptyChart: '\u0995\u09cb\u09a8\u09cb \u09b8\u09cd\u099f\u09c7\u09b6\u09a8 \u09ae\u09c7\u09b2\u09c7\u09a8\u09bf\u0964',
    perMonth: '/ \u09ae\u09be\u09b8\u09c7',
  },
};
let lang = 'en';
let fromIdx = 0, toIdx = 15, ticket = 'single';
let linePick = 'from';
try {
  const saved = JSON.parse(localStorage.getItem('metro-fare-bd') || '{}');
  if (saved.lang === 'bn' || saved.lang === 'en') lang = saved.lang;
  if (Number.isInteger(saved.from) && saved.from >= 0 && saved.from < 16) fromIdx = saved.from;
  if (Number.isInteger(saved.to) && saved.to >= 0 && saved.to < 16) toIdx = saved.to;
  if (['single', 'pass', 'conc'].includes(saved.ticket)) ticket = saved.ticket;
} catch (e) {}
function save() {
  try { localStorage.setItem('metro-fare-bd', JSON.stringify({ lang, from: fromIdx, to: toIdx, ticket })); } catch (e) {}
}
function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }
function fmt(n) { return lang === 'bn' ? toBnDigits(n.toLocaleString('en-US')) : n.toLocaleString('en-US'); }
function stationName(i) { return lang === 'bn' ? STATIONS[i].bn : STATIONS[i].en; }
function money(n) { return '\u09f3' + fmt(n); }

function fillSelects() {
  ['#fromSel', '#toSel'].forEach(id => {
    const sel = $(id);
    sel.innerHTML = '';
    STATIONS.forEach((s, i) => {
      const o = document.createElement('option');
      o.value = i; o.textContent = stationName(i);
      sel.appendChild(o);
    });
  });
  $('#fromSel').value = fromIdx; $('#toSel').value = toIdx;
}
function renderStaticText() {
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $('#langBtn').textContent = lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
  document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
}
function routeStations(a, b) {
  const out = [];
  const step = a < b ? 1 : -1;
  for (let i = a; step > 0 ? i <= b : i >= b; i += step) out.push(i);
  return out;
}
function calculate() {
  const a = fromIdx, b = toIdx;
  const err = $('#calcErr');
  if (a === b) { err.textContent = t('sameErr'); err.hidden = false; $('#result').hidden = true; return; }
  err.hidden = true;
  const single = fareBetween(a, b);
  const res = $('#result');
  res.hidden = false;
  $('#resTitle').textContent = stationName(a) + ' \u2192 ' + stationName(b);
  const rows = [
    [t('fare'), money(single)],
    [t('passFare'), money(passFare(single))],
    [t('concFare'), money(concessionFare(single))],
  ];
  $('#resRows').innerHTML = rows.map(r => '<div class="res-row"><span>' + r[0] + '</span><strong>' + r[1] + '</strong></div>').join('');
  $('#resMeta').innerHTML =
    t('direction') + ': ' + (b > a ? t('south') : t('north')) + '<br>' +
    Math.abs(b - a) + ' ' + t('stops') + ' \u00b7 ' + t('est') + ' ' + fmt(estimateMinutes(a, b)) + ' ' + t('min') + '<br>' +
    t('roundTrip') + ': ' + money(single * 2);
  $('#resVia').textContent = t('via') + ': ' + routeStations(a, b).map(stationName).join(' \u203a ');
  save();
}
function renderChart() {
  const q = ($('#chartSearch').value || '').trim().toLowerCase();
  const head = '<tr><th></th>' + STATIONS.map((s, i) => '<th data-col="' + i + '">' + stationName(i) + '</th>').join('') + '</tr>';
  let body = '';
  let any = false;
  STATIONS.forEach((s, i) => {
    if (q && !(stationName(i).toLowerCase().includes(q) || s.en.toLowerCase().includes(q) || s.bn.includes(q))) return;
    any = true;
    body += '<tr><th class="rowhead" data-row="' + i + '">' + stationName(i) + '</th>' +
      STATIONS.map((_, j) => '<td class="' + (i === j ? 'diag' : '') + '">' + (i === j ? '\u2014' : fmt(FARES[i][j])) + '</td>').join('') + '</tr>';
  });
  $('#chartTable').innerHTML = head + body;
  $('#chartEmpty').hidden = any;
  $$('#chartTable th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      $$('#chartTable td, #chartTable th').forEach(c => c.classList.remove('hl'));
      const c = +th.dataset.col;
      $$('#chartTable tr').forEach(tr => { const cell = tr.children[c + 1]; if (cell) cell.classList.add('hl'); });
      th.classList.add('hl');
    });
  });
}
function renderLine() {
  const wrap = $('#lineMap');
  wrap.innerHTML = '';
  STATIONS.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'station' + (i === fromIdx ? ' is-from' : '') + (i === toIdx ? ' is-to' : '');
    d.type = 'button';
    d.innerHTML = '<span class="dot"></span><span class="sname">' + stationName(i) + '</span>' +
      '<span class="stag">' + (i === fromIdx ? t('setFrom') : i === toIdx ? t('setTo') : '') + '</span>';
    d.addEventListener('click', () => {
      if (linePick === 'from') { fromIdx = i; linePick = 'to'; }
      else { toIdx = i; linePick = 'from'; }
      if (fromIdx === toIdx) { toIdx = (toIdx + 1) % 16; }
      $('#fromSel').value = fromIdx; $('#toSel').value = toIdx;
      renderLine(); calculate(); save();
    });
    wrap.appendChild(d);
  });
}
function renderPass() {
  const trips = Math.max(1, Math.min(10, parseInt($('#tripsDay').value, 10) || 2));
  const days = Math.max(1, Math.min(7, parseInt($('#daysWeek').value, 10) || 5));
  const single = fareBetween(fromIdx, toIdx);
  const wSingle = single * trips * days;
  const wPass = passFare(single) * trips * days;
  const mSave = Math.round((wSingle - wPass) * 4.33);
  $('#passOut').innerHTML =
    '<div class="res-row"><span>' + t('weeklySingle') + '</span><strong>' + money(wSingle) + '</strong></div>' +
    '<div class="res-row"><span>' + t('weeklyPass') + '</span><strong>' + money(wPass) + '</strong></div>' +
    '<div class="res-row"><span>' + t('monthlySave') + '</span><strong class="save">' + money(mSave) + '</strong></div>';
}
function showTab(id) {
  $$('.tabbtn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  $$('.tab').forEach(s => s.hidden = s.id !== 'tab-' + id);
  if (id === 'chart') renderChart();
  if (id === 'line') renderLine();
  if (id === 'pass') renderPass();
}
function init() {
  fillSelects();
  renderStaticText();
  $$('.tabbtn').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'en' ? 'bn' : 'en';
    fillSelects(); renderStaticText(); renderLine(); calculate(); save();
  });
  $('#fromSel').addEventListener('change', e => { fromIdx = +e.target.value; renderLine(); calculate(); });
  $('#toSel').addEventListener('change', e => { toIdx = +e.target.value; renderLine(); calculate(); });
  $$('input[name="ticket"]').forEach(r => {
    r.checked = r.value === ticket;
    r.addEventListener('change', e => { ticket = e.target.value; calculate(); });
  });
  $('#swapBtn').addEventListener('click', () => {
    const tmp = fromIdx; fromIdx = toIdx; toIdx = tmp;
    $('#fromSel').value = fromIdx; $('#toSel').value = toIdx;
    renderLine(); calculate();
  });
  $('#calcBtn').addEventListener('click', calculate);
  $('#chartSearch').addEventListener('input', renderChart);
  $('#tripsDay').addEventListener('input', renderPass);
  $('#daysWeek').addEventListener('input', renderPass);
  $('#calcTripBtn').addEventListener('click', () => showTab('calc'));
  calculate();
}
document.addEventListener('DOMContentLoaded', init);
