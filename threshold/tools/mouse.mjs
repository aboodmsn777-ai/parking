import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 480, height: 270 } })).newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
await page.goto('http://127.0.0.1:5189/?debug&skipintro&q=low'); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
await page.click('#press'); await page.waitForTimeout(600); await page.click('[data-act=start]'); await page.waitForFunction(() => window.__t.state === 'playing' && window.__t.input.enabled, null, { timeout: 60000 });
await page.waitForTimeout(600);
const r = await page.evaluate(async () => { const t = window.__t, y0 = t.player.yaw, p0 = t.player.pitch; for (let i = 0; i < 10; i++) document.dispatchEvent(new MouseEvent('mousemove', { movementX: 20, movementY: -8 })); await new Promise((r) => setTimeout(r, 1500)); return { locked: !!document.pointerLockElement, dyaw: +(t.player.yaw - y0).toFixed(3), dpitch: +(t.player.pitch - p0).toFixed(3), loops: 'first=' + (t.director.current?.id || 'normal') }; });
console.log(JSON.stringify(r), 'errors:', errs.length ? errs.join('|') : 'none'); await browser.close();
