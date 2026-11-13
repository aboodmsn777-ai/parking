// Desktop end-to-end: real keyboard + mouse, pause, then a bot plays a full run to the ending and back to the menu.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 640, height: 360 } })).newPage(); const errs = [];
page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
await page.goto(process.argv[2] || 'http://127.0.0.1:5188/?debug&skipintro&q=low'); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
await page.click('#press'); await page.waitForTimeout(800); await page.click('[data-act=start]');
await page.waitForFunction(() => window.__t.state === 'playing' && window.__t.input.enabled, null, { timeout: 60000 });
const pos = () => page.evaluate(() => ({ x: +window.__t.player.pos.x.toFixed(2), z: +window.__t.player.pos.z.toFixed(2), yaw: +window.__t.player.yaw.toFixed(2), locked: document.pointerLockElement === document.getElementById('view') }));
const a = await pos(); await page.keyboard.down('KeyW'); await page.waitForTimeout(3500); await page.keyboard.up('KeyW');
await page.mouse.move(300, 180); await page.mouse.move(380, 180, { steps: 8 }); await page.waitForTimeout(600); const b = await pos();
console.log('keyboard W moved', (b.x - a.x).toFixed(2) + 'm', '| mouse yaw delta', (b.yaw - a.yaw).toFixed(3), '| pointerLock', b.locked);
await page.keyboard.press('Escape'); await page.waitForTimeout(500); console.log('Esc ->', await page.evaluate(() => window.__t.state));
await page.click('#pause [data-act=resume]'); await page.waitForTimeout(500); console.log('resume ->', await page.evaluate(() => window.__t.state));
const run = await page.evaluate(() => {
  const t = window.__t, { player: P, director: D } = t; t.settle(); const log = [];
  const fwd = () => { D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(17.8, 0, 1); P.yaw = -Math.PI / 2; t.sim(3.2, 0, 1); };
  const back = () => { D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(3.5, 0, 1); P.yaw = Math.PI; t.sim(4.2, 0, 1); P.yaw = Math.PI / 2; t.sim(3.4, 0, 1); };
  let guard = 0; while (D.threshold < 7 && guard++ < 40) { const an = D.current?.id || null; (an ? back : fwd)(); log.push((an || 'normal') + '>' + D.threshold); }
  D.spawn(); t.sim(2.1, 0, 1); P.yaw = 0; t.sim(17.8, 0, 1); P.yaw = -Math.PI / 2; t.sim(4.6, 0, 1); P.yaw = 0; t.sim(3, 0, 1);
  return { log: log.join(' '), th: D.threshold, busy: D.busy, found: t.save.data.discovered.length, stats: D.stats };
});
console.log('bot run:', run.log); console.log('threshold', run.th, 'ending triggered', run.busy, 'discovered', run.found, 'loops', run.stats.loops, 'resets', run.stats.resets);
await page.waitForFunction(() => window.__t.state === 'ending', null, { timeout: 30000 }); await page.waitForTimeout(2600);
await page.screenshot({ path: 'shots/e2e-ending.png', timeout: 120000 });
await page.click('#ending [data-act=menu]'); await page.waitForTimeout(1500);
console.log('after ending ->', await page.evaluate(() => ({ state: window.__t.state, cont: !document.querySelector('[data-act=continue]').hidden, normalEnding: window.__t.save.data.endings.normal, th: window.__t.save.data.threshold })));
await page.click('[data-act=anomalies]'); await page.waitForTimeout(900); await page.screenshot({ path: 'shots/e2e-anomalies.png', timeout: 120000 });
console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await browser.close();
