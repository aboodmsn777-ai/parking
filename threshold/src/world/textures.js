// Procedural PBR texture sets (albedo / normal / roughness) drawn on canvas.
import * as THREE from 'three';

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const FONT = '"IBM Plex Sans Arabic", system-ui, sans-serif';

export function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function tex(c, { srgb = true, repeat = true } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}
function normalFromHeight(hc, strength) {
  const w = hc.width, h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = mk(w, h), octx = out.getContext('2d'), img = octx.createImageData(w, h), d = img.data;
  const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength;
    const l = 1 / Math.hypot(dx, dy, 1), i = (y * w + x) * 4;
    d[i] = (-dx * l * 0.5 + 0.5) * 255; d[i + 1] = (dy * l * 0.5 + 0.5) * 255; d[i + 2] = (l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}
function speckle(ctx, w, h, n, r, color, s0, s1, a0, a1) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = a0 + r() * (a1 - a0);
    ctx.fillStyle = typeof color === 'function' ? color(r) : color;
    const s = s0 + r() * (s1 - s0);
    ctx.beginPath(); ctx.arc(r() * w, r() * h, s, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function blotches(ctx, w, h, n, r, color, s0, s1, a) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, s = s0 + r() * (s1 - s0);
    for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, s);
      g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0));
      ctx.fillStyle = g; ctx.fillRect(x + ox - s, y + oy - s, s * 2, s * 2);
    }
  }
}
const set = (a, hgt, ro, ns) => ({ map: tex(a), normalMap: tex(normalFromHeight(hgt, ns), { srgb: false }), roughnessMap: tex(ro, { srgb: false }) });

// White ceramic wall tiles: nx*ny tiles per texture.
export function tileSet(nx = 8, ny = 8, seed = 7) {
  const S = 512, r = rng(seed), a = mk(S, S), h = mk(S, S), ro = mk(S, S);
  const ac = a.getContext('2d'), hc = h.getContext('2d'), rc = ro.getContext('2d');
  const tw = S / nx, th = S / ny, g = 2.5;
  ac.fillStyle = '#57544c'; ac.fillRect(0, 0, S, S);
  hc.fillStyle = '#404040'; hc.fillRect(0, 0, S, S);
  rc.fillStyle = '#e8e8e8'; rc.fillRect(0, 0, S, S);
  speckle(ac, S, S, 2500, r, '#2e2c28', 0.5, 1.6, 0.2, 0.6);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = i * tw + g / 2, y = j * th + g / 2, w = tw - g, hh = th - g;
    const v = (r() - 0.5) * 12, odd = r() < 0.05, yel = r() < 0.07;
    const R = 226 + v - (odd ? 22 : 0), G = 228 + v - (odd ? 20 : 0) - (yel ? 6 : 0), B = 220 + v - (odd ? 14 : 0) - (yel ? 22 : 0);
    ac.fillStyle = `rgb(${R | 0},${G | 0},${B | 0})`; ac.fillRect(x, y, w, hh);
    hc.fillStyle = '#9a9a9a'; hc.fillRect(x, y, w, hh);
    hc.fillStyle = '#c8c8c8'; hc.fillRect(x + 1.5, y + 1.5, w - 3, hh - 3);
    hc.fillStyle = '#d6d6d6'; hc.fillRect(x + 3, y + 3, w - 6, hh - 6);
    const rv = 40 + r() * 28; rc.fillStyle = `rgb(${rv},${rv},${rv})`; rc.fillRect(x, y, w, hh);
    if (r() < 0.06) { // chipped corner
      ac.fillStyle = '#6b665c'; ac.beginPath(); ac.moveTo(x, y); ac.lineTo(x + 6 + r() * 6, y); ac.lineTo(x, y + 5 + r() * 6); ac.fill();
    }
  }
  blotches(ac, S, S, 26, r, 'rgba(92,80,54,A)', 20, 90, 0.10);
  blotches(rc, S, S, 30, r, 'rgba(210,210,210,A)', 20, 80, 0.35);
  for (let i = 0; i < 26; i++) { // vertical dirt streaks
    const x = r() * S, y = r() * S, len = 40 + r() * 160, w = 2 + r() * 7;
    const gr = ac.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, 'rgba(70,60,40,0.22)'); gr.addColorStop(1, 'rgba(70,60,40,0)');
    ac.fillStyle = gr; ac.fillRect(x, y, w, len);
    rc.fillStyle = 'rgba(200,200,200,0.25)'; rc.fillRect(x, y, w, len * 0.7);
  }
  speckle(ac, S, S, 500, r, '#4a4336', 0.4, 1.3, 0.15, 0.45);
  return set(a, h, ro, 2.2);
}

// Speckled stone floor tiles.
export function floorSet(seed = 11) {
  const S = 512, r = rng(seed), a = mk(S, S), h = mk(S, S), ro = mk(S, S);
  const ac = a.getContext('2d'), hc = h.getContext('2d'), rc = ro.getContext('2d');
  ac.fillStyle = '#6a6b69'; ac.fillRect(0, 0, S, S);
  hc.fillStyle = '#b0b0b0'; hc.fillRect(0, 0, S, S);
  rc.fillStyle = '#7c7c7c'; rc.fillRect(0, 0, S, S);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const v = (r() - 0.5) * 14; ac.fillStyle = `rgba(${128 + v},${128 + v},${124 + v},0.35)`; ac.fillRect(i * 256, j * 256, 256, 256);
  }
  speckle(ac, S, S, 9000, r, (q) => ['#3a3b3c', '#8f8f8a', '#a39d8f', '#2b2c2e', '#77726a'][(q() * 5) | 0], 0.5, 2.2, 0.35, 0.9);
  speckle(hc, S, S, 2500, r, '#8c8c8c', 0.6, 1.8, 0.3, 0.6);
  blotches(ac, S, S, 22, r, 'rgba(30,28,24,A)', 30, 110, 0.22);
  blotches(rc, S, S, 26, r, 'rgba(40,40,40,A)', 25, 120, 0.5);
  blotches(rc, S, S, 20, r, 'rgba(200,200,200,A)', 20, 90, 0.35);
  for (const c of [ac, hc, rc]) {
    c.fillStyle = c === ac ? '#262626' : c === hc ? '#505050' : '#d8d8d8';
    for (let i = 0; i < 2; i++) { c.fillRect(i * 256 - 1.5, 0, 3, S); c.fillRect(0, i * 256 - 1.5, S, 3); }
    c.fillRect(S - 1.5, 0, 1.5, S); c.fillRect(0, S - 1.5, S, 1.5);
  }
  for (let i = 0; i < 40; i++) { // scuffs
    ac.strokeStyle = `rgba(20,20,20,${0.08 + r() * 0.14})`; ac.lineWidth = 1 + r() * 2;
    const x = r() * S, y = r() * S; ac.beginPath(); ac.moveTo(x, y); ac.quadraticCurveTo(x + r() * 60 - 30, y + r() * 60 - 30, x + r() * 120 - 60, y + r() * 120 - 60); ac.stroke();
  }
  return set(a, h, ro, 1.4);
}

export function concreteSet(base = [112, 114, 112], seed = 3, panel = true) {
  const S = 512, r = rng(seed), a = mk(S, S), h = mk(S, S), ro = mk(S, S);
  const ac = a.getContext('2d'), hc = h.getContext('2d'), rc = ro.getContext('2d');
  ac.fillStyle = `rgb(${base})`; ac.fillRect(0, 0, S, S);
  hc.fillStyle = '#909090'; hc.fillRect(0, 0, S, S);
  rc.fillStyle = '#d2d2d2'; rc.fillRect(0, 0, S, S);
  blotches(ac, S, S, 40, r, 'rgba(30,30,28,A)', 30, 140, 0.2);
  blotches(ac, S, S, 30, r, 'rgba(190,190,180,A)', 30, 120, 0.12);
  blotches(hc, S, S, 40, r, 'rgba(60,60,60,A)', 20, 90, 0.3);
  speckle(ac, S, S, 5000, r, (q) => (q() < 0.5 ? '#3c3c3a' : '#b4b4ac'), 0.4, 1.4, 0.15, 0.5);
  speckle(hc, S, S, 700, r, '#303030', 0.8, 2.6, 0.5, 0.9);
  for (let i = 0; i < 14; i++) { // water stains
    const x = r() * S, y = r() * S, len = 60 + r() * 200, w = 6 + r() * 26;
    const gr = ac.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, 'rgba(25,24,20,0.3)'); gr.addColorStop(1, 'rgba(25,24,20,0)');
    ac.fillStyle = gr; ac.fillRect(x, y, w, len);
  }
  if (panel) for (const c of [ac, hc]) { c.fillStyle = c === ac ? 'rgba(20,20,20,0.6)' : '#404040'; c.fillRect(0, 0, S, 3); c.fillRect(0, 0, 3, S); }
  return set(a, h, ro, 2.0);
}

// Yellow tactile paving strip.
export function tactileSet() {
  const S = 128, a = mk(S, S), h = mk(S, S), ro = mk(S, S), r = rng(5);
  const ac = a.getContext('2d'), hc = h.getContext('2d'), rc = ro.getContext('2d');
  ac.fillStyle = '#b08a1c'; ac.fillRect(0, 0, S, S); hc.fillStyle = '#606060'; hc.fillRect(0, 0, S, S); rc.fillStyle = '#b0b0b0'; rc.fillRect(0, 0, S, S);
  for (let i = 0; i < 4; i++) {
    ac.fillStyle = '#c59b22'; ac.fillRect(i * 32 + 8, 4, 16, S - 8);
    hc.fillStyle = '#e0e0e0'; hc.fillRect(i * 32 + 9, 5, 14, S - 10);
  }
  blotches(ac, S, S, 14, r, 'rgba(40,30,10,A)', 10, 40, 0.35);
  speckle(ac, S, S, 300, r, '#4a3a10', 0.5, 1.5, 0.2, 0.5);
  return set(a, h, ro, 2.5);
}

// Generic text/graphic panel (non-repeating).
export function panel(w, h, draw) { const c = mk(w, h); draw(c.getContext('2d'), w, h); const t = tex(c, { repeat: false }); t.userData.canvas = c; return t; }
