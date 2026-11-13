// Usage: node tools/shot.mjs <name> [--mobile] [--js "code run in page with __t"] [--wait ms] [--menu]
import { createRequire } from 'module'; const { chromium, devices } = createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright');
const a = process.argv.slice(2), name = a[0], get = (k) => { const i = a.indexOf(k); return i > 0 ? a[i + 1] : null; };
const mobile = a.includes('--mobile'), js = get('--js'), wait = +(get('--wait') || 1500), url = get('--url') || 'http://127.0.0.1:5188/?debug&q=' + (get('--q') || 'high') + '&skipintro';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext(mobile ? { ...devices['iPhone 13 landscape'] } : { viewport: { width: +(get('--w') || 960), height: +(get('--h') || 540) }, deviceScaleFactor: 1 });
const page = await ctx.newPage(); if (!mobile) await page.addInitScript(() => { Element.prototype.requestPointerLock = () => Promise.resolve(); }); const errs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errs.push('[pageerror] ' + e.message));
await page.goto(url); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
if (a.includes('--title')) { await page.waitForTimeout(1500); }
else {
  await page.click('#press'); await page.waitForTimeout(1200);
  if (!a.includes('--menu')) { await page.evaluate(() => window.__t.startRun(0)); await page.waitForFunction(() => window.__t.state === 'playing', null, { timeout: 30000 }); await page.waitForTimeout(1000); await page.evaluate(() => window.__t.settle()); }
}
if (js) { const r = await page.evaluate(js); if (r !== undefined) console.log('js ->', JSON.stringify(r)); }
await page.waitForTimeout(wait);
await page.evaluate(() => window.__t.freeze(true)); await page.waitForTimeout(1200);
await page.screenshot({ path: `shots/${name}.png`, timeout: 120000 });
console.log(name, errs.length ? errs.join('\n') : 'no console errors');
await browser.close();
