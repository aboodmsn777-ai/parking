// Headless gameplay test: drives the real director/player through the debug sim hook.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 320, height: 180 } })).newPage(); const errs = [];
page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(() => { Element.prototype.requestPointerLock = () => Promise.resolve(); localStorage.clear(); });
await page.goto('http://127.0.0.1:5188/?debug&skipintro&q=low'); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
await page.click('#press'); await page.evaluate(() => window.__t.startRun(0)); await page.waitForFunction(() => window.__t.state === 'playing', null, { timeout: 60000 });
const out = await page.evaluate(async () => {
  const t = window.__t, { player: P, director: D, world: W } = t, r = {}; t.settle(); t.freeze(true);
  const fwd = () => { D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(17.5, 0, 1); P.yaw = -Math.PI / 2; return t.sim(3.2, 0, 1); };
  const back = () => { D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(3.5, 0, 1); P.yaw = Math.PI; t.sim(4.2, 0, 1); P.yaw = Math.PI / 2; return t.sim(3.4, 0, 1); };
  r.A_forward_normal = fwd();
  D.force('bin-missing'); r.B_forward_on_anomaly = fwd();
  D.threshold = 2; D.force('extra-door'); r.C_back_on_anomaly = back(); r.C_discovered = t.save.data.discovered.slice();
  D.force(null); D.threshold = 3; D.setLoop(null); r.D_back_on_normal = back();
  D.threshold = 1; D.force('corridor-longer'); r.G_longer = fwd(); r.G_extra_after = W.extra;
  const ids = []; for (const m of Object.values(await import('/src/anomalies/index.js')).filter(Array.isArray)[0]) { try { D.force(m.id); D.spawn(); t.sim(1.2, 0, 1); P.place(0, -20, 0); t.sim(0.6, 0, 1); ids.push(m.id); } catch (e) { ids.push(m.id + ' FAILED ' + e.message); } }
  r.E_all = ids.length + ' ok; failed: ' + ids.filter((x) => x.includes('FAILED')).join(',');
  D.force(null); D.busy = false; D.threshold = 5; D.force('runner'); D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(6, 0, 1); const s1 = t.sim(9, 0, 0); r.F_runner = { ...s1, busy: D.busy };
  D.busy = false; D.threshold = 5; D.force('lights-out-chase'); D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(6, 0, 1); const s2 = t.sim(16, 0, 0); r.F_lights = { ...s2, busy: D.busy };
  D.busy = false; D.threshold = 5; D.force('runner'); D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(3.6, 0, 1); P.yaw = Math.PI; t.sim(3.6, 0, 1); P.yaw = Math.PI / 2; r.F_runner_escape = { ...t.sim(3.4, 0, 1), busy: D.busy };
  D.busy = false; D.threshold = 7; D.setLoop(null); D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(17.5, 0, 1); P.yaw = -Math.PI / 2; t.sim(4.6, 0, 1); P.yaw = 0; r.H_final = { ...t.sim(3, 0, 1), ground: +P.ground.toFixed(2), busy: D.busy, final: W.final };
  return r;
});
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v));
await page.waitForTimeout(500); console.log('state', await page.evaluate(() => window.__t.state), '| errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
