import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const q of ['high', 'medium', 'low']) {
  const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
  await page.goto('http://127.0.0.1:5188/?debug&skipintro&q=' + q); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 90000 });
  await page.click('#press'); await page.evaluate(() => window.__t.startRun(0)); await page.waitForFunction(() => window.__t.state === 'playing', null, { timeout: 60000 });
  const r = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); (function f() { n++; if (performance.now() - t0 > 4000) res({ fps: +(n / 4).toFixed(1), calls: window.__t.gfx.renderer.info.render.calls, tris: window.__t.gfx.renderer.info.render.triangles, progs: window.__t.gfx.renderer.info.programs.length }); else requestAnimationFrame(f); })(); }));
  console.log(q, JSON.stringify(r)); await page.close();
}
await browser.close();
