import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
page.on('console', (m) => console.log('[' + m.type() + ']', m.text().slice(0, 300))); page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const t0 = Date.now(); await page.goto('http://127.0.0.1:5188/?debug&q=' + (process.argv[2] || 'high') + '&skipintro');
for (let i = 0; i < 12; i++) { await page.waitForTimeout(5000); const s = await page.evaluate(() => ({ st: document.body.dataset.state, pct: document.getElementById('pct').textContent })).catch((e) => ({ err: e.message })); console.log((Date.now() - t0) / 1000 | 0, JSON.stringify(s)); if (s.st === 'title') break; }
await browser.close();
