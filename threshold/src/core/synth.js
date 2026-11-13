// Procedural fallback sounds, rendered lazily into AudioBuffers. Any id that has a real file
// listed in public/audio/manifest.json is loaded from disk instead and never synthesised.
const SR = 44100;
function buf(ctx, sec, fn, ch = 1) {
  const n = Math.floor(sec * SR), b = ctx.createBuffer(ch, n, SR);
  for (let c = 0; c < ch; c++) fn(b.getChannelData(c), n, c);
  return b;
}
let seed = 1234567; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;
function lp(d, cut) { const a = 1 - Math.exp(-6.283 * cut / SR); let y = 0; for (let i = 0; i < d.length; i++) { y += a * (d[i] - y); d[i] = y; } }
function hp(d, cut) { const a = 1 - Math.exp(-6.283 * cut / SR); let y = 0; for (let i = 0; i < d.length; i++) { y += a * (d[i] - y); d[i] -= y; } }
function norm(d, peak = 0.9) { let m = 0; for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i])); if (m > 0) for (let i = 0; i < d.length; i++) d[i] *= peak / m; }
function loopFade(d, sec = 0.4) { const n = Math.floor(sec * SR), L = d.length; for (let i = 0; i < n; i++) { const k = i / n; d[i] = d[i] * k + d[L - n + i] * (1 - k); } return d.subarray(0, L - n); }
function looped(ctx, sec, fill, fade = 0.5) { const tmp = new Float32Array(Math.floor((sec + fade) * SR)); fill(tmp); const out = loopFade(tmp, fade); const b = ctx.createBuffer(1, out.length, SR); b.copyToChannel(out, 0); return b; }
const step = (v) => (ctx) => buf(ctx, 0.2, (d, n) => {
  for (let i = 0; i < n; i++) { const t = i / SR; d[i] = noise() * Math.exp(-t * (38 + v * 6)) * 0.7; }
  lp(d, 1500 + v * 420);
  for (let i = 0; i < n; i++) { const t = i / SR; d[i] += Math.sin(6.283 * (118 - v * 9) * t) * Math.exp(-t * 46) * 0.5 + (t > 0.045 ? noise() * Math.exp(-(t - 0.045) * 90) * 0.1 : 0); }
  norm(d, 0.8);
});

export const SYNTH = {
  amb_hum: (ctx) => buf(ctx, 4, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR; d[i] = Math.sin(6.283 * 100 * t) * 0.3 + Math.sin(6.283 * 200 * t) * 0.14 + Math.sin(6.283 * 300 * t + 1) * 0.07 + Math.sin(6.283 * 3100 * t) * 0.006 + noise() * 0.02; } }),
  amb_vent: (ctx) => looped(ctx, 7, (d) => { for (let i = 0; i < d.length; i++) d[i] = noise(); lp(d, 420); lp(d, 700); hp(d, 50); for (let i = 0; i < d.length; i++) d[i] *= 0.8 + 0.2 * Math.sin(i / SR * 0.9); norm(d, 0.7); }),
  amb_room: (ctx) => looped(ctx, 9, (d) => { for (let i = 0; i < d.length; i++) d[i] = noise(); lp(d, 140); lp(d, 220); for (let i = 0; i < d.length; i++) { const t = i / SR; d[i] = d[i] * (0.75 + 0.25 * Math.sin(t * 0.7)) + Math.sin(6.283 * 41 * t) * 0.02; } norm(d, 0.7); }, 1),
  train: (ctx) => buf(ctx, 11, (d, n) => { for (let i = 0; i < n; i++) d[i] = noise(); lp(d, 110); lp(d, 160); for (let i = 0; i < n; i++) { const t = i / SR, e = Math.pow(Math.sin(Math.PI * t / 11), 2.2); d[i] = (d[i] * (0.8 + 0.3 * Math.sin(t * 14.5) * Math.sin(t * 3.1)) + Math.sin(6.283 * 36 * t) * 0.05) * e; } norm(d, 0.85); }),
  drip: (ctx) => buf(ctx, 0.3, (d, n) => { let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR, f = 1500 * Math.exp(-t * 16) + 620; ph += 6.283 * f / SR; d[i] = Math.sin(ph) * Math.exp(-t * 26) * 0.6 + (t > 0.05 ? Math.sin(ph * 1.9) * Math.exp(-(t - 0.05) * 40) * 0.15 : 0); } }),
  step1: step(0), step2: step(1), step3: step(2), step4: step(3),
  door: (ctx) => buf(ctx, 1.5, (d, n) => { const fs = [143, 311, 487, 742, 1130, 1790]; for (let i = 0; i < n; i++) { const t = i / SR; let s = noise() * Math.exp(-t * 28) * 0.7; fs.forEach((f, k) => { s += Math.sin(6.283 * f * t + k) * Math.exp(-t * (3.2 + k * 1.6)) * 0.16; }); d[i] = s; } norm(d, 0.85); }),
  flick: (ctx) => buf(ctx, 0.3, (d, n) => { for (const t0 of [0, 0.07, 0.19]) for (let i = Math.floor(t0 * SR); i < n; i++) { const t = i / SR - t0; d[i] += Math.sin(6.283 * 4300 * t) * Math.exp(-t * 300) * 0.4 + noise() * Math.exp(-t * 500) * 0.2; } }),
  zap: (ctx) => buf(ctx, 0.55, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR, g = Math.sin(6.283 * 50 * t) > 0.2 ? 1 : 0.1; d[i] = (noise() * 0.5 + Math.sign(Math.sin(6.283 * 100 * t)) * 0.3) * g * Math.exp(-t * 5.5) + Math.sin(6.283 * 62 * t) * Math.exp(-t * 9) * 0.6; } hp(d, 40); norm(d, 0.85); }),
  whisper: (ctx) => buf(ctx, 3, (d, n) => { for (let i = 0; i < n; i++) d[i] = noise(); hp(d, 1100); lp(d, 3600); for (let i = 0; i < n; i++) { const t = i / SR; const syl = Math.pow(Math.max(0, Math.sin(t * 9.5 + Math.sin(t * 2.3) * 2.5)), 1.6); d[i] *= syl * Math.sin(Math.PI * t / 3) * (0.6 + 0.4 * Math.sin(t * 31)); } norm(d, 0.6); }),
  heart: (ctx) => buf(ctx, 0.9, (d, n) => { for (const [t0, a] of [[0, 1], [0.27, 0.7]]) for (let i = Math.floor(t0 * SR); i < n; i++) { const t = i / SR - t0; d[i] += Math.sin(6.283 * (58 - t * 60) * t) * Math.exp(-t * 17) * a; } norm(d, 0.9); }),
  screech: (ctx) => buf(ctx, 2.2, (d, n) => { let p1 = 0, p2 = 0; for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t * 30) * Math.exp(-t * 1.3); const f1 = 1180 + Math.sin(t * 37) * 160 + t * 520, f2 = 1730 + Math.sin(t * 53) * 240 - t * 200; p1 += 6.283 * f1 / SR; p2 += 6.283 * f2 / SR; d[i] = (Math.sin(p1 + Math.sin(p2) * 2.6) * 0.5 + Math.sign(Math.sin(p2)) * 0.16 + noise() * 0.22) * e; } hp(d, 500); norm(d, 0.9); }),
  thud: (ctx) => buf(ctx, 1.3, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR; d[i] = Math.sin(6.283 * (64 * Math.exp(-t * 3.2) + 30) * t) * Math.exp(-t * 3.8) + noise() * Math.exp(-t * 40) * 0.25; } lp(d, 900); norm(d, 0.9); }),
  ui_click: (ctx) => buf(ctx, 0.08, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR; d[i] = Math.sin(6.283 * 880 * t) * Math.exp(-t * 90) * 0.35 + noise() * Math.exp(-t * 400) * 0.12; } }),
  ui_hover: (ctx) => buf(ctx, 0.05, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR; d[i] = Math.sin(6.283 * 1320 * t) * Math.exp(-t * 130) * 0.14; } }),
  found: (ctx) => buf(ctx, 1.6, (d, n) => { for (let i = 0; i < n; i++) { const t = i / SR; d[i] = (Math.sin(6.283 * 293.66 * t) + Math.sin(6.283 * 440 * t) * 0.6 + Math.sin(6.283 * 587.3 * t) * 0.3) * Math.min(1, t * 12) * Math.exp(-t * 2.6) * 0.2; } }),
  music_menu: (ctx) => buf(ctx, 24, (d, n, c) => {
    const notes = [[2, 587.33], [7, 698.46], [11, 554.37], [16, 659.26], [20, 466.16]];
    for (let i = 0; i < n; i++) {
      const t = i / SR, sw = 0.5 + 0.5 * Math.sin(6.283 * t / 24 - 1.57);
      let s = Math.sin(6.283 * 73.375 * t) * 0.28 + Math.sin(6.283 * (73.375 + 1 / 3 + c / 6) * t) * 0.22 + Math.sin(6.283 * 110 * t + c) * 0.1 * sw + Math.sin(6.283 * 146.875 * t) * 0.06 + Math.sin(6.283 * 155.5 * t + 2) * 0.035 * (1 - sw);
      for (const [t0, f] of notes) { const u = t - t0; if (u > 0 && u < 4.5) s += Math.sin(6.283 * f * u + Math.sin(6.283 * 4.6 * u) * 0.35) * Math.min(1, u * 1.4) * Math.exp(-u * 0.95) * 0.05 * (c ? 0.7 : 1); }
      d[i] = s * 0.75;
    }
  }, 2),
  sting_end: (ctx) => buf(ctx, 9, (d, n, c) => { const fs = [146.83, 220, 293.66, 369.99, 440, 554.37]; for (let i = 0; i < n; i++) { const t = i / SR, e = Math.min(1, t / 2.4) * Math.min(1, (9 - t) / 3.5); let s = 0; fs.forEach((f, k) => { s += Math.sin(6.283 * f * (1 + (c ? 0.002 : -0.002)) * t + k) * Math.min(1, Math.max(0, (t - k * 0.5) / 1.6)) / (1 + k * 0.45); }); d[i] = s * e * 0.2; } }, 2),
  run: (ctx) => buf(ctx, 0.56, (d, n) => { for (const t0 of [0, 0.28]) for (let i = Math.floor(t0 * SR); i < n; i++) { const t = i / SR - t0; d[i] += noise() * Math.exp(-t * 45) * 0.5 + Math.sin(6.283 * 96 * t) * Math.exp(-t * 40) * 0.6; } lp(d, 2200); norm(d, 0.9); }),
};
