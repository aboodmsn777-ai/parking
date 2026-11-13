// Real touch-input test on an emulated phone: taps the actual UI, drags the virtual stick and the look area.
import { createRequire } from 'module'; const { chromium, devices } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const mode = process.argv[2] || 'portrait';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ ...devices[mode === 'portrait' ? 'iPhone 13' : 'iPhone 13 landscape'] });
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('http://127.0.0.1:5188/?debug&skipintro&q=low'); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
const vp = page.viewportSize(); console.log(mode, vp, 'touchClass', await page.evaluate(() => document.body.classList.contains('touch')));
await page.tap('#press'); await page.waitForFunction(() => document.body.dataset.state === 'menu'); await page.waitForTimeout(1500);
await page.screenshot({ path: `shots/t-${mode}-menu.png`, timeout: 120000 });
await page.tap('[data-act=settings]'); await page.waitForTimeout(900); await page.screenshot({ path: `shots/t-${mode}-settings.png`, timeout: 120000 });
await page.tap('#setLang [data-v=ar]'); await page.tap('#settings [data-act=back]'); await page.waitForTimeout(600);
await page.tap('[data-act=start]'); await page.waitForFunction(() => window.__t.state === 'playing', null, { timeout: 60000 });
await page.waitForFunction(() => window.__t.input.enabled, null, { timeout: 30000 });
const snap = () => page.evaluate(() => ({ x: +window.__t.player.pos.x.toFixed(2), z: +window.__t.player.pos.z.toFixed(2), yaw: +window.__t.player.yaw.toFixed(2), pitch: +window.__t.player.pitch.toFixed(2), stick: getComputedStyle(document.querySelector('.stick-base')).opacity }));
const a = await snap();
const cdp = await ctx.newCDPSession(page), T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
const sx = 90, sy = vp.height - 130, lx = vp.width - 90, ly = vp.height / 2;
await T('touchStart', [{ x: sx, y: sy, id: 1 }]);
await T('touchMove', [{ x: sx, y: sy - 70, id: 1 }]);                                   // stick forward
await T('touchStart', [{ x: sx, y: sy - 70, id: 1 }, { x: lx, y: ly, id: 2 }]);
for (let i = 1; i <= 6; i++) { await T('touchMove', [{ x: sx, y: sy - 70, id: 1 }, { x: lx - i * 12, y: ly + i * 4, id: 2 }]); await page.waitForTimeout(700); }
const mid = await snap(); await page.screenshot({ path: `shots/t-${mode}-play.png`, timeout: 120000 });
await T('touchEnd', []); await page.waitForTimeout(800);
const b = await snap();
console.log('before', JSON.stringify(a)); console.log('during', JSON.stringify(mid)); console.log('after ', JSON.stringify(b));
console.log('MOVED', Math.hypot(b.x - a.x, b.z - a.z).toFixed(2) + 'm', '| LOOKED yaw', (b.yaw - a.yaw).toFixed(2), 'pitch', (b.pitch - a.pitch).toFixed(2), '| stick visible during:', mid.stick, 'after:', b.stick);
await page.tap('#pauseBtn'); await page.waitForTimeout(500); console.log('pause ->', await page.evaluate(() => window.__t.state));
await page.screenshot({ path: `shots/t-${mode}-pause.png`, timeout: 120000 });
await page.tap('#pause [data-act=resume]'); await page.waitForTimeout(500); console.log('resume ->', await page.evaluate(() => window.__t.state));
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
