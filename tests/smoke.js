// metro-fare-bd — headless-Chrome smoke test via raw CDP (Node 24 global WebSocket).
// No npm dependencies. Run: node tests/smoke.js
'use strict';
const { spawn } = require('child_process');
const FILE = 'file:///home/hatch/workspace/muse-project-factory/builds/metro-fare-bd/index.html';
const CHROME = '/opt/meta-chromium/chrome';
const PORT = 9224;
let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ok:', label); }
  else { fail++; console.error('FAIL:', label, extra !== undefined ? '(' + extra + ')' : ''); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = [];
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error))); else res(msg.result);
      } else if (msg.method) { for (const h of this.handlers) h(msg); }
    };
  }
  send(method, params) {
    const id = this.nextId++;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  on(fn) { this.handlers.push(fn); }
  async evalExpr(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}
async function waitForDebugger() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/version'); if (r.ok) return; } catch (e) {}
    await sleep(200);
  }
  throw new Error('chrome debugger port did not come up');
}
(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + PORT, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  const errors = [];
  try {
    await waitForDebugger();
    const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/new?file://', { method: 'PUT' })).json();
    const cdp = new CDP(tabs.webSocketDebuggerUrl);
    await cdp.ready;
    cdp.on(m => {
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
      if (m.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(m.params.exceptionDetails));
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
    });
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: FILE });
    await sleep(1500);
    ok(await cdp.evalExpr(`document.title.includes('Metro Fare BD')`), 'page title');
    ok(await cdp.evalExpr(`document.querySelectorAll('#fromSel option').length === 16`), 'from select has 16 stations');
    ok(await cdp.evalExpr(`document.querySelectorAll('#toSel option').length === 16`), 'to select has 16 stations');
    // Default trip: Uttara North (0) -> Motijheel (15) = 100
    const defFare = await cdp.evalExpr(`document.getElementById('resRows').textContent`);
    ok(defFare.includes('100') && defFare.includes('90'), 'default trip shows 100 single / 90 pass (got: ' + defFare.trim().slice(0, 80) + ')');
    // Change to Agargaon -> Farmgate = 20 / pass 18
    await cdp.evalExpr(`document.getElementById('fromSel').value = '8'; document.getElementById('fromSel').dispatchEvent(new Event('change')); document.getElementById('toSel').value = '10'; document.getElementById('toSel').dispatchEvent(new Event('change'));`);
    await sleep(300);
    const ag = await cdp.evalExpr(`document.getElementById('resRows').textContent`);
    ok(ag.includes('20') && ag.includes('18'), 'Agargaon->Farmgate shows 20 / 18');
    const via = await cdp.evalExpr(`document.getElementById('resVia').textContent`);
    ok(via.includes('Agargaon') && via.includes('Farmgate') && via.includes('Bijoy Sarani'), 'route strip lists intermediate stations');
    // Swap
    await cdp.evalExpr(`document.getElementById('swapBtn').click();`);
    await sleep(200);
    ok(await cdp.evalExpr(`document.getElementById('fromSel').value === '10' && document.getElementById('toSel').value === '8'`), 'swap exchanges from/to');
    // Same-station error
    await cdp.evalExpr(`document.getElementById('toSel').value = '10'; document.getElementById('toSel').dispatchEvent(new Event('change'));`);
    await sleep(200);
    ok(await cdp.evalExpr(`!document.getElementById('calcErr').hidden`), 'same-station inline error shown');
    // Chart tab: 16 rows
    await cdp.evalExpr(`document.querySelector('[data-tab="chart"]').click();`);
    await sleep(300);
    ok(await cdp.evalExpr(`document.querySelectorAll('#chartTable tr').length === 17`), 'chart renders header + 16 rows');
    ok(await cdp.evalExpr(`document.getElementById('chartTable').textContent.includes('Motijheel')`), 'chart contains Motijheel');
    // Chart search filter
    await cdp.evalExpr(`document.getElementById('chartSearch').value = 'Farmgate'; document.getElementById('chartSearch').dispatchEvent(new Event('input'));`);
    await sleep(200);
    ok(await cdp.evalExpr(`document.querySelectorAll('#chartTable tr').length === 2`), 'chart search narrows to 1 row + header');
    // Pass tab math: default trip now Farmgate->Farmgate? reset to 0->15 first
    await cdp.evalExpr(`document.querySelector('[data-tab="calc"]').click(); document.getElementById('fromSel').value = '0'; document.getElementById('fromSel').dispatchEvent(new Event('change')); document.getElementById('toSel').value = '15'; document.getElementById('toSel').dispatchEvent(new Event('change')); document.querySelector('[data-tab="pass"]').click();`);
    await sleep(300);
    const passOut = await cdp.evalExpr(`document.getElementById('passOut').textContent`);
    ok(passOut.includes('1,000') && passOut.includes('900'), 'pass tab: 2 trips x 5 days x 100 = 1000 single / 900 pass');
    // BN toggle
    await cdp.evalExpr(`document.getElementById('langBtn').click();`);
    await sleep(300);
    ok(await cdp.evalExpr(`document.querySelector('[data-tab="calc"]').textContent.includes('ভাড়া')`), 'BN toggle renders Bengali labels');
    ok(await cdp.evalExpr(`document.getElementById('resRows').textContent.includes('১০০')`), 'BN digits render ১০০ for 100');
    // Line tab
    await cdp.evalExpr(`document.querySelector('[data-tab="line"]').click();`);
    await sleep(300);
    ok(await cdp.evalExpr(`document.querySelectorAll('#lineMap .station').length === 16`), 'line map has 16 stations');
    // 390px mobile: no horizontal overflow
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    ok(await cdp.evalExpr(`document.documentElement.scrollWidth <= 390`), '390px viewport: no horizontal overflow');
    ok(errors.length === 0, 'zero console/page errors', errors.slice(0, 3).join(' | '));
    cdp.close();
  } finally {
    chrome.kill('SIGKILL');
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(1); });
