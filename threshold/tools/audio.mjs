// Verifies every sound loads from its real file (not the synth fallback) and that playback wiring runs.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PWG + '/playwright');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ viewport: { width: 320, height: 180 } })).newPage(); const errs = [], bad = [];
page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text()); });
page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
await page.goto(process.argv[2] || 'http://127.0.0.1:5188/?debug&skipintro&q=low'); await page.waitForFunction(() => document.body.dataset.state === 'title', null, { timeout: 100000 });
await page.click('#press'); await page.waitForTimeout(1500);
const r = await page.evaluate(() => { const a = window.__t.audio; return { ctx: a.ctx.state, loops: a.loops.size, durs: Object.fromEntries(Object.entries(a.buffers).map(([k, b]) => [k, +b.duration.toFixed(2)])) }; });
console.log('context', r.ctx, '| active loops (menu):', r.loops); console.log(JSON.stringify(r.durs));
await page.click('[data-act=start]'); await page.waitForFunction(() => window.__t.state === 'playing' && window.__t.input.enabled, null, { timeout: 60000 });
const p = await page.evaluate(() => { const t = window.__t; let n = 0; const orig = t.audio.play.bind(t.audio); const ids = {}; t.audio.play = (id, o) => { ids[id] = (ids[id] || 0) + 1; return orig(id, o); }; t.director.force('door-ajar'); t.sim(2.1, 0, 1); t.player.yaw = 0; t.sim(11.5, 0, 1); t.director.force('runner'); t.sim(4, 0, 1); return { played: ids, loops: t.audio.loops.size }; });
console.log('played during sim:', JSON.stringify(p)); console.log('bad responses:', bad.length ? bad.join(' ') : 'none', '| errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
