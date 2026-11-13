// All authored props + their graphics. Everything anomalies touch is exposed on world.props.
import * as THREE from 'three';
import { panel, rng, FONT } from './textures.js';
import { makeFigure, poseWalk } from './figure.js';

const HW = 2, H = 3, L = 52;
const S = THREE.MeshStandardMaterial;
const isAr = (s) => /[؀-ۿ]/.test(s);
function text(ctx, str, x, y, size, color, { weight = 600, align = 'center', spacing = 0 } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.direction = isAr(str) ? 'rtl' : 'ltr'; ctx.letterSpacing = isAr(str) ? '0px' : `${spacing}px`; ctx.fillText(str, x, y); ctx.letterSpacing = '0px';
}
function wear(ctx, w, h, seed, amt = 1) {
  const r = rng(seed);
  for (let i = 0; i < 260 * amt; i++) { ctx.globalAlpha = 0.05 + r() * 0.16; ctx.fillStyle = r() < 0.6 ? '#1a1712' : '#cfc8b8'; ctx.beginPath(); ctx.arc(r() * w, r() * h, 0.6 + r() * 2.4, 0, 6.3); ctx.fill(); }
  for (let i = 0; i < 9 * amt; i++) { const x = r() * w, y = r() * h * 0.5, g = ctx.createLinearGradient(0, y, 0, y + 200); g.addColorStop(0, 'rgba(40,30,15,0.16)'); g.addColorStop(1, 'rgba(40,30,15,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x, y, 4 + r() * 14, 200); }
  ctx.globalAlpha = 1;
}
const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
const lit = (t, k = 0.42) => new S({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: k, roughness: 0.3 });
function box(parent, mat, w, h, d, x, y, z, cast = true) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.userData.cast = cast; parent.add(m); return m; }
function mount(parent, g, side, z, y = 0) { g.position.set(side === 'E' ? HW : -HW, y, z); g.rotation.y = side === 'E' ? -Math.PI / 2 : Math.PI / 2; parent.add(g); return g; }
const wallCol = (side, z, w, d) => ({ minX: side === 'E' ? HW - d : -HW, maxX: side === 'E' ? HW : -HW + d, minZ: z - w / 2, maxZ: z + w / 2, on: true });

// ---------- graphics
function drawThreshold(ctx, w, h, n, mirror) {
  ctx.fillStyle = '#d2a008'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 14; rr(ctx, 22, 22, w - 44, h - 44, 18); ctx.stroke();
  text(ctx, 'العتبة', w / 2, 122, 78, '#111', { weight: 700 });
  ctx.save(); ctx.translate(w / 2, 0); if (mirror) ctx.scale(-1, 1); text(ctx, String(n), 0, 372, 270, '#111', { weight: 700 }); ctx.restore();
  text(ctx, 'THRESHOLD', w / 2 + 5, 452, 42, '#111', { weight: 600, spacing: 10 });
  wear(ctx, w, h, 21);
}
function drawBoard(ctx, w, h, typo) {
  ctx.fillStyle = '#10304a'; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#e9eef0'; ctx.lineWidth = 6; rr(ctx, 20, 20, w - 40, h - 40, 10); ctx.stroke();
  ctx.fillStyle = '#e9eef0'; ctx.fillRect(20, 20, w - 40, 120);
  text(ctx, typo ? 'إرشادات القبور' : 'إرشادات العبور', w / 2, 104, 66, '#10304a', { weight: 700 });
  const ar = ['١.  لا تتجاهل ما تغيَّر.', '٢.  إن رأيتَ ما لا ينبغي، عُد من حيث أتيت.', '٣.  إن لم ترَ شيئًا، امضِ قُدُمًا.', '٤.  اخرج عند العتبة ٧.'];
  ar.forEach((s, i) => text(ctx, s, w - 60, 220 + i * 74, 36, '#f1f4f5', { weight: 400, align: 'right' }));
  ctx.fillStyle = '#e9eef0'; ctx.fillRect(60, 520, w - 120, 3);
  text(ctx, 'PASSAGE GUIDANCE', 60, 600, 42, '#e9eef0', { weight: 600, align: 'left', spacing: 4 });
  const en = ['1.  Do not overlook what has changed.', '2.  If something is not as it should be,', '     turn back at once.', `3.  If nothing is wrong, keep ${typo ? 'waking' : 'walking'}.`, '4.  Leave at Threshold 7.'];
  en.forEach((s, i) => text(ctx, s, 60, 668 + i * 56, 30, '#f1f4f5', { weight: 400, align: 'left' }));
  text(ctx, 'هيئة النقل · الخط ٣', w - 60, h - 56, 24, '#8fb0c4', { weight: 400, align: 'right' });
  text(ctx, 'TRANSIT AUTHORITY · LINE 3', 60, h - 56, 20, '#8fb0c4', { weight: 400, align: 'left', spacing: 2 });
  wear(ctx, w, h, 33, 1.4);
}
function drawOptics(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f4a50'); g.addColorStop(1, '#d9d2c0'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2a2622'; ctx.beginPath(); ctx.ellipse(w / 2, 300, 150, 190, 0, 0, 6.3); ctx.fill();            // hair
  ctx.fillStyle = '#c9a182'; ctx.fillRect(w / 2 - 50, 440, 100, 120);                                               // neck
  ctx.fillStyle = '#24424a'; ctx.beginPath(); ctx.ellipse(w / 2, 640, 230, 110, 0, Math.PI, 0); ctx.fill();         // shoulders
  ctx.fillStyle = '#d8b292'; ctx.beginPath(); ctx.ellipse(w / 2, 330, 118, 160, 0, 0, 6.3); ctx.fill();            // face
  ctx.fillStyle = '#2a2622'; ctx.beginPath(); ctx.ellipse(w / 2, 205, 124, 70, 0, Math.PI, 0); ctx.fill();          // fringe
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.ellipse(w / 2 + s * 52, 312, 30, 17, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#141414'; ctx.lineWidth = 7; rr(ctx, w / 2 + s * 52 - 42, 284, 84, 58, 14); ctx.stroke();
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w / 2 + s * 24, 268); ctx.lineTo(w / 2 + s * 86, 262); ctx.stroke();
  }
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(w / 2 - 10, 306); ctx.lineTo(w / 2 + 10, 306); ctx.stroke();
  ctx.strokeStyle = '#a07a60'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w / 2, 330); ctx.lineTo(w / 2 - 8, 382); ctx.lineTo(w / 2 + 8, 384); ctx.stroke();
  ctx.strokeStyle = '#8a4f44'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w / 2 - 34, 428); ctx.quadraticCurveTo(w / 2, 438, w / 2 + 34, 428); ctx.stroke();
  ctx.fillStyle = '#0c2b30'; ctx.fillRect(0, 0, w, 120);
  text(ctx, 'بصريات النور', w / 2, 82, 62, '#f2ead8', { weight: 700 });
  text(ctx, 'نراكَ بوضوح', w / 2, h - 96, 56, '#0c2b30', { weight: 700 });
  text(ctx, 'AL NOOR OPTICS — WE SEE YOU CLEARLY', w / 2, h - 44, 22, '#0c2b30', { weight: 600, spacing: 2 });
  wear(ctx, w, h, 44, 0.6);
}
function drawCoast(ctx, w, h, eye) {
  const g = ctx.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, '#f2a24a'); g.addColorStop(1, '#f6d9a0'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, 470);
  if (eye) {
    ctx.fillStyle = '#fdf6e6'; ctx.beginPath(); ctx.ellipse(w / 2, 300, 112, 62, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#a3261c'; ctx.beginPath(); ctx.arc(w / 2, 300, 50, 0, 6.3); ctx.fill(); ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(w / 2, 300, 22, 0, 6.3); ctx.fill();
  } else { ctx.fillStyle = '#fdf0c8'; ctx.beginPath(); ctx.arc(w / 2, 300, 96, 0, 6.3); ctx.fill(); }
  ['#1c6e7a', '#18606b', '#13525c', '#0f444d'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 430 + i * 44); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, 430 + i * 44 + Math.sin(x * 0.03 + i * 2) * 7); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill(); });
  ctx.fillStyle = '#10262a'; ctx.fillRect(86, 300, 9, 170);
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(90 + Math.cos(k * 1.05) * 44, 300 + Math.sin(k * 1.05) * 22, 52, 9, k * 1.05, 0, 6.3); ctx.fill(); }
  text(ctx, 'اكتشف الساحل الشرقي', w / 2, 116, 54, '#5a1f10', { weight: 700 });
  text(ctx, 'VISIT THE EAST COAST', w / 2, 166, 28, '#5a1f10', { weight: 600, spacing: 5 });
  text(ctx, 'قطار كل ٣٠ دقيقة · من الرصيف ٢', w / 2, h - 70, 30, '#f4ead2', { weight: 400 });
  text(ctx, 'A TRAIN EVERY 30 MINUTES', w / 2, h - 34, 20, '#f4ead2', { weight: 400, spacing: 3 });
  wear(ctx, w, h, 55, 0.6);
}
function drawMap(ctx, w, h) {
  ctx.fillStyle = '#ece8dc'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#12324a'; ctx.fillRect(0, 0, w, 110);
  text(ctx, 'خريطة المترو', w - 30, 72, 50, '#fff', { weight: 700, align: 'right' }); text(ctx, 'METRO MAP', 30, 70, 30, '#fff', { weight: 600, align: 'left', spacing: 4 });
  const lines = [['#c0392b', [[60, 220], [200, 220], [300, 330], [300, 560], [440, 680]]], ['#0d6a61', [[60, 600], [180, 480], [300, 480], [450, 330], [450, 190]]], ['#d2a008', [[110, 700], [110, 400], [230, 280], [470, 280]]]];
  for (const [c, pts] of lines) {
    ctx.strokeStyle = c; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke();
    for (const p of pts) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, 6.3); ctx.fill(); ctx.stroke(); }
  }
  ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(300, 480, 20, 0, 6.3); ctx.fill();
  text(ctx, 'أنت هنا', 300, 446, 28, '#c0392b', { weight: 700 }); text(ctx, 'YOU ARE HERE', 300, 530, 16, '#c0392b', { weight: 600, spacing: 2 });
  [['الميناء', 60, 196], ['السوق القديم', 214, 196], ['الجامعة', 450, 166], ['المطار', 478, 258], ['الحديقة', 96, 740], ['المستشفى', 440, 716]].forEach(([s, x, y]) => text(ctx, s, x, y, 20, '#222', { weight: 400 }));
  wear(ctx, w, h, 66, 0.8);
}
function drawExit(ctx, w, h, wrong) {
  ctx.fillStyle = '#0b7a3b'; ctx.fillRect(0, 0, w, h);
  ctx.save(); if (wrong) { ctx.translate(w, 0); ctx.scale(-1, 1); }
  text(ctx, 'مخرج', w * 0.3, h * 0.72, h * 0.62, '#f4fff4', { weight: 700 }); text(ctx, 'EXIT', w * 0.63, h * 0.7, h * 0.5, '#f4fff4', { weight: 700, spacing: 4 });
  ctx.fillStyle = '#f4fff4'; const ax = w * 0.87, ay = h / 2; ctx.beginPath(); ctx.moveTo(ax + 34, ay); ctx.lineTo(ax, ay - 30); ctx.lineTo(ax, ay - 11); ctx.lineTo(ax - 36, ay - 11); ctx.lineTo(ax - 36, ay + 11); ctx.lineTo(ax, ay + 11); ctx.lineTo(ax, ay + 30); ctx.fill();
  ctx.restore();
}
function drawVending(ctx, w, h) {
  ctx.fillStyle = '#0d1b33'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#c62f2a'; ctx.fillRect(0, 0, w, 64);
  text(ctx, 'مرطبات', w * 0.32, 46, 34, '#fff', { weight: 700 }); text(ctx, 'DRINKS', w * 0.74, 44, 24, '#fff', { weight: 600, spacing: 3 });
  ctx.fillStyle = '#dfeaf0'; ctx.fillRect(14, 78, 170, 300);
  const r = rng(9), cols = ['#c62f2a', '#1f6fb2', '#e0a40f', '#2f8f4e', '#e8e8e8', '#7a3fa0', '#e86a1c'];
  for (let j = 0; j < 5; j++) { ctx.fillStyle = '#9fb0b8'; ctx.fillRect(14, 78 + j * 60 + 54, 170, 6); for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[(r() * cols.length) | 0]; ctx.fillRect(22 + i * 27, 86 + j * 60, 20, 46); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(25 + i * 27, 98 + j * 60, 14, 9); } }
  ctx.fillStyle = '#05080f'; ctx.fillRect(196, 90, 48, 22); text(ctx, '0.00', 220, 107, 14, '#3dff7a', { weight: 600 });
  ctx.fillStyle = '#1b2a44'; for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) ctx.fillRect(196 + i * 17, 124 + j * 17, 13, 13);
  ctx.fillStyle = '#05080f'; ctx.fillRect(200, 210, 40, 8); ctx.fillRect(30, 410, 150, 50);
  text(ctx, 'ادفع هنا · PAY', 220, 250, 9, '#9fb0b8', { weight: 400 });
}
function drawLed(ctx, w, h, str) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, h);
  ctx.font = `700 ${h * 0.72}px ui-monospace, "Courier New", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
  ctx.fillStyle = '#3a0a06'; ctx.fillText('88:88:88', w / 2, h / 2 + 3); ctx.fillStyle = '#ff3b22'; ctx.shadowColor = '#ff2a10'; ctx.shadowBlur = 10; ctx.fillText(str, w / 2, h / 2 + 3); ctx.shadowBlur = 0;
}
function drawPlate(ctx, w, h, ar, en, bg = '#d2a008', fg = '#111', arrow = false) {
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = fg; ctx.lineWidth = 6; ctx.strokeRect(8, 8, w - 16, h - 16);
  const cx = arrow ? w * 0.42 : w / 2; text(ctx, ar, cx, h * 0.5, h * 0.36, fg, { weight: 700 }); text(ctx, en, cx, h * 0.84, h * 0.19, fg, { weight: 600, spacing: 3 });
  if (arrow) { ctx.fillStyle = fg; const ax = w * 0.84, ay = h / 2; ctx.beginPath(); ctx.moveTo(ax + 40, ay); ctx.lineTo(ax, ay - 36); ctx.lineTo(ax, ay - 13); ctx.lineTo(ax - 44, ay - 13); ctx.lineTo(ax - 44, ay + 13); ctx.lineTo(ax, ay + 13); ctx.lineTo(ax, ay + 36); ctx.fill(); }
  wear(ctx, w, h, 77, 0.5);
}
function drawNotice(ctx, w, h) {
  ctx.fillStyle = '#5b4a36'; ctx.fillRect(0, 0, w, h);
  const r = rng(12), sheet = (x, y, sw, sh, rot, c, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c; ctx.fillRect(0, 0, sw, sh); fn(); ctx.restore(); };
  sheet(26, 24, 220, 300, -0.02, '#eee9da', () => { text(ctx, 'إعلان', 110, 52, 36, '#a3261c', { weight: 700 }); text(ctx, 'المحطة مغلقة للصيانة', 110, 104, 20, '#222', { weight: 600 }); text(ctx, 'حتى إشعار آخر', 110, 136, 18, '#222', { weight: 400 }); text(ctx, 'STATION CLOSED', 110, 196, 18, '#222', { weight: 600, spacing: 1 }); text(ctx, 'FOR MAINTENANCE', 110, 222, 16, '#222', { weight: 400, spacing: 1 }); text(ctx, 'UNTIL FURTHER NOTICE', 110, 262, 12, '#555', { weight: 400 }); });
  sheet(268, 40, 210, 150, 0.03, '#d9e2e6', () => { text(ctx, 'مفقودات', 105, 44, 28, '#12324a', { weight: 700 }); text(ctx, 'LOST PROPERTY', 105, 76, 15, '#12324a', { weight: 600, spacing: 1 }); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a959b'; ctx.fillRect(20, 96 + i * 14, 170 - r() * 60, 4); } });
  sheet(280, 210, 190, 120, -0.04, '#efe2a8', () => { text(ctx, 'آخر قطار ٠٠:٤٠', 95, 50, 24, '#222', { weight: 700 }); text(ctx, 'LAST TRAIN 00:40', 95, 86, 15, '#222', { weight: 600 }); });
  wear(ctx, w, h, 88, 0.8);
}
function drawHands(ctx, w, h) {
  const r = rng(31);
  for (let k = 0; k < 7; k++) {
    ctx.save(); ctx.translate(40 + r() * (w - 80), 50 + r() * (h - 110)); ctx.rotate((r() - 0.5) * 0.9); ctx.scale(k % 2 ? 1 : -1, 1); ctx.fillStyle = `rgba(215,225,225,${0.18 + r() * 0.2})`; ctx.filter = 'blur(1.2px)';
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 21, 0, 0, 6.3); ctx.fill();
    [[-15, -30, -0.35, 22], [-6, -38, -0.1, 26], [4, -39, 0.08, 27], [13, -34, 0.28, 23], [23, -6, 1.1, 18]].forEach(([x, y, a, len]) => { ctx.beginPath(); ctx.ellipse(x, y, 4.6, len / 2, a, 0, 6.3); ctx.fill(); });
    ctx.fillRect(-6, 14, 12, 40 + r() * 50); ctx.restore();
  }
}
function drawShadow(ctx, w, h) {
  ctx.clearRect(0, 0, w, h); ctx.filter = 'blur(9px)'; ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.beginPath(); ctx.ellipse(w / 2, h * 0.11, w * 0.14, h * 0.07, 0, 0, 6.3); ctx.fill();
  rr(ctx, w * 0.27, h * 0.19, w * 0.46, h * 0.36, 30); ctx.fill();
  ctx.fillRect(w * 0.3, h * 0.5, w * 0.17, h * 0.47); ctx.fillRect(w * 0.53, h * 0.5, w * 0.17, h * 0.47);
  ctx.fillRect(w * 0.14, h * 0.2, w * 0.1, h * 0.38); ctx.fillRect(w * 0.76, h * 0.2, w * 0.1, h * 0.38);
}

// ---------- builders
function lightbox(tex, w, h, mats) {
  const g = new THREE.Group(); box(g, mats.alu, w + 0.12, h + 0.12, 0.09, 0, 0, 0.045);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lit(tex)); p.position.z = 0.092; g.add(p); g.userData.panel = p; return g;
}
function door(mats, label) {
  const g = new THREE.Group(), paint = new S({ color: 0x51605a, roughness: 0.55, metalness: 0.3 });
  box(g, mats.dark, 1.16, 0.09, 0.14, 0, 2.2, 0.05); box(g, mats.dark, 0.09, 2.2, 0.14, -0.535, 1.1, 0.05); box(g, mats.dark, 0.09, 2.2, 0.14, 0.535, 1.1, 0.05);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 2.15), mats.black); hole.position.set(0, 1.08, 0.006); g.add(hole);
  const leaf = new THREE.Group(); leaf.position.set(-0.49, 0, 0.05); g.add(leaf);
  box(leaf, paint, 0.98, 2.15, 0.05, 0.49, 1.08, 0); box(leaf, mats.steel, 0.98, 0.26, 0.006, 0.49, 0.15, 0.028);
  box(leaf, mats.steel, 0.04, 0.16, 0.05, 0.88, 1.05, 0.04); box(leaf, mats.steel, 0.14, 0.03, 0.03, 0.83, 1.1, 0.075);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.17), new S({ map: panel(256, 96, (c, w, h) => drawPlate(c, w, h, label[0], label[1], '#e9eef0', '#12324a')), roughness: 0.4 })); pl.position.set(0.49, 1.62, 0.027); leaf.add(pl);
  g.userData.leaf = leaf; return g;
}

export function buildProps(world) {
  const { mats } = world, props = world.props, colliders = [], updaters = [];
  const texExitWall = panel(512, 160, (c, w, h) => drawPlate(c, w, h, 'مخرج', 'EXIT', '#d2a008', '#111', true));
  const texNotice = panel(512, 352, drawNotice);
  world.decorateHalf = (g) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new S({ map: texExitWall, roughness: 0.35 })); s.position.set(8, 1.95, 1.985); s.rotation.y = Math.PI; g.add(s);
    const n = new THREE.Group(); box(n, mats.alu, 1.5, 1.04, 0.04, 0, 0, 0.02, false); const np = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.96), new S({ map: texNotice, roughness: 0.8 })); np.position.z = 0.042; n.add(np);
    n.position.set(3, 1.55, 2); n.rotation.y = Math.PI; g.add(n);
  };

  function buildHallProps() {
    const R = world.root;
    // threshold sign
    const signTex = panel(512, 512, (c, w, h) => drawThreshold(c, w, h, 0, false));
    const sign = new THREE.Group(); box(sign, mats.dark, 1.16, 1.16, 0.03, 0, 0, 0.015, false);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new S({ map: signTex, roughness: 0.32, metalness: 0.1 })); sp.position.z = 0.032; sign.add(sp);
    mount(R, sign, 'E', -8.5, 1.72);
    props.sign = { n: 0, mirror: false };
    world.setNumber = (n, mirror = false) => { props.sign.n = n; props.sign.mirror = mirror; const c = signTex.userData.canvas; drawThreshold(c.getContext('2d'), 512, 512, n, mirror); signTex.needsUpdate = true; };
    // guidance board
    const bN = panel(768, 1024, (c, w, h) => drawBoard(c, w, h, false)), bT = panel(768, 1024, (c, w, h) => drawBoard(c, w, h, true));
    const board = new THREE.Group(); box(board, mats.alu, 1.5, 1.96, 0.04, 0, 0, 0.02, false);
    const bm = new S({ map: bN, roughness: 0.3, metalness: 0.1 }); const bp = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.89), bm); bp.position.z = 0.042; board.add(bp);
    mount(R, board, 'W', -8.5, 1.5); props.board = { setTypo: (v) => { bm.map = v ? bT : bN; } };
    // posters
    const optics = lightbox(panel(512, 768, drawOptics), 1.25, 1.875, mats); mount(R, optics, 'W', -13.5, 1.45);
    const pup = [], pm = new THREE.MeshBasicMaterial({ color: 0x0b0b0b });
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), pm); p.position.set(s * 0.127, 0.176, 0.095); p.userData.bx = p.position.x; p.userData.by = p.position.y; optics.add(p); pup.push(p); }
    props.eyes = { track: false };
    const lp = new THREE.Vector3();
    updaters.push((dt, t, player) => {
      let ox = 0, oy = 0;
      if (props.eyes.track && player) { lp.copy(player.pos); optics.worldToLocal(lp); const d = Math.max(0.6, lp.z); ox = THREE.MathUtils.clamp((lp.x / d) * 0.03, -0.03, 0.03); oy = THREE.MathUtils.clamp(((lp.y - 0.176) / d) * 0.02, -0.01, 0.01); }
      for (const p of pup) { p.position.x += (p.userData.bx + ox - p.position.x) * Math.min(1, dt * 7); p.position.y += (p.userData.by + oy - p.position.y) * Math.min(1, dt * 7); }
    });
    const cN = panel(512, 768, (c, w, h) => drawCoast(c, w, h, false)), cE = panel(512, 768, (c, w, h) => drawCoast(c, w, h, true));
    const coast = lightbox(cN, 1.25, 1.875, mats); mount(R, coast, 'W', -18.5, 1.45);
    props.coast = { panel: coast.userData.panel, setEye: (v) => { const m = coast.userData.panel.material; m.map = m.emissiveMap = v ? cE : cN; } };
    mount(R, lightbox(panel(512, 768, drawMap), 1.25, 1.875, mats), 'W', -23.5, 1.45);
    // vending machine
    const vend = new THREE.Group(), vBody = new S({ color: 0x101c33, roughness: 0.45, metalness: 0.4 });
    box(vend, vBody, 0.98, 1.86, 0.74, 0, 0.93, 0.37); const vm = lit(panel(256, 512, drawVending), 0.6);
    const vp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.74), vm); vp.position.set(0, 0.95, 0.745); vend.add(vp);
    mount(R, vend, 'E', -13.5); colliders.push(wallCol('E', -13.5, 1.0, 0.76)); props.vending = { setOn: (v) => { vm.emissiveIntensity = v ? 0.6 : 0.0; vm.color.setScalar(v ? 1 : 0.25); } };
    // bin
    const bin = new THREE.Group(); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.2, 0.78, 20), mats.steel); cyl.position.y = 0.39; cyl.userData.cast = true;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.022, 8, 20), mats.dark); rim.rotation.x = Math.PI / 2; rim.position.y = 0.78;
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.21, 20), mats.black); top.rotation.x = -Math.PI / 2; top.position.y = 0.76; bin.add(cyl, rim, top);
    bin.position.set(HW - 0.32, 0, -15.2); R.add(bin); const binCol = { minX: HW - 0.56, maxX: HW, minZ: -15.44, maxZ: -14.96, on: true }; colliders.push(binCol);
    props.bin = { group: bin, collider: binCol };
    // benches
    const bench = (z) => {
      const g = new THREE.Group(); box(g, mats.steel, 1.8, 0.04, 0.46, 0, 0.45, 0.3);
      const back = box(g, mats.steel, 1.8, 0.42, 0.035, 0, 0.78, 0.08); back.rotation.x = -0.14;
      for (const x of [-0.78, 0, 0.78]) { box(g, mats.dark, 0.05, 0.45, 0.05, x, 0.225, 0.12); box(g, mats.dark, 0.05, 0.45, 0.05, x, 0.225, 0.48); box(g, mats.dark, 0.05, 0.04, 0.44, x, 0.02, 0.3); }
      for (const x of [-0.9, 0.9]) box(g, mats.dark, 0.04, 0.03, 0.4, x, 0.66, 0.3);
      const pivot = new THREE.Group(); pivot.position.z = 0.3; g.position.z = -0.3; pivot.add(g);
      const m = new THREE.Group(); m.add(pivot); mount(R, m, 'E', z); colliders.push(wallCol('E', z, 1.84, 0.58)); return pivot;
    };
    bench(-18.5); props.bench2 = bench(-28.5);
    // clock
    const clock = new THREE.Group(), clkTex = panel(256, 80, (c, w, h) => drawLed(c, w, h, '03:14:00')), cm = lit(clkTex, 1.3);
    box(clock, mats.dark, 0.92, 0.32, 0.12, 0, 0, 0); for (const x of [-0.36, 0.36]) box(clock, mats.dark, 0.02, 0.36, 0.02, x, 0.33, 0);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.26), cm); f.position.z = s * 0.061; if (s < 0) f.rotation.y = Math.PI; clock.add(f); }
    clock.position.set(0, 2.5, -21); R.add(clock);
    props.clock = { dir: 1, value: 3 * 3600 + 14 * 60 }; let shown = -1;
    updaters.push((dt) => {
      const c = props.clock; c.value += c.dir * dt; const v = ((Math.floor(c.value) % 86400) + 86400) % 86400;
      if (v !== shown) { shown = v; const p = (n) => String(n).padStart(2, '0'); drawLed(clkTex.userData.canvas.getContext('2d'), 256, 80, `${p((v / 3600) | 0)}:${p(((v / 60) | 0) % 60)}:${p(v % 60)}`); clkTex.needsUpdate = true; }
    });
    // cctv
    const cam = new THREE.Group(); cam.position.set(1.55, 2.62, -26); R.add(cam);
    box(cam, mats.dark, 0.06, 0.38, 0.06, 0, 0.19, 0, false);
    const head = new THREE.Group(); cam.add(head); box(head, new S({ color: 0xd8dadb, roughness: 0.45 }), 0.13, 0.12, 0.34, 0, 0, 0.05);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 14), mats.black); lens.rotation.x = Math.PI / 2; lens.position.z = 0.235; head.add(lens);
    box(head, mats.dark, 0.15, 0.015, 0.2, 0, 0.068, 0.16);
    const ledM = new THREE.MeshBasicMaterial({ color: 0xff2010 }); const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), ledM); led.position.set(0.04, -0.03, 0.222); head.add(led);
    props.cctv = { track: false }; const tgt = new THREE.Object3D(); cam.add(tgt); const rest = new THREE.Vector3(-0.6, 0.6, -16), wp = new THREE.Vector3();
    updaters.push((dt, t, player) => {
      const tr = props.cctv.track && player; wp.copy(tr ? player.pos : rest); if (tr) wp.y -= 0.1;
      tgt.lookAt(wp); head.quaternion.slerp(tgt.quaternion, Math.min(1, dt * (tr ? 5 : 2)));
      ledM.color.setRGB((Math.sin(t * (tr ? 14 : 2.2)) > 0 ? 6 : 0.2), 0.05, 0.02);
    });
    // doors
    const svc = door(mats, ['خدمة', 'STAFF ONLY']); mount(R, svc, 'E', -33.5); props.door = { leaf: svc.userData.leaf };
    const extra = door(mats, ['مخزن', 'STORAGE']); mount(R, extra, 'W', -28.5); extra.visible = false; props.extraDoor = extra;
    // kiosk with dark glass (stencil window for the reflection)
    const kiosk = new THREE.Group(), KW = 2.7;
    box(kiosk, mats.alu, KW + 0.16, 0.08, 0.1, 0, 2.38, 0.05); box(kiosk, mats.alu, KW + 0.16, 0.08, 0.1, 0, 0.98, 0.05);
    for (const x of [-KW / 2 - 0.04, 0, KW / 2 + 0.04]) box(kiosk, mats.alu, 0.08, 1.4, 0.1, x, 1.68, 0.05);
    box(kiosk, mats.steel, KW + 0.16, 0.05, 0.3, 0, 0.93, 0.15); box(kiosk, mats.dark, KW + 0.16, 0.86, 0.06, 0, 0.5, 0.03);
    const glassM = new S({ color: 0x06090b, roughness: 0.06, metalness: 0.7, envMapIntensity: 2.2, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(KW, 1.32), glassM); glass.position.set(0, 1.68, 0.06); glass.renderOrder = 1; kiosk.add(glass);
    const closed = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19), new S({ map: panel(256, 96, (c, w, h) => drawPlate(c, w, h, 'مغلق', 'CLOSED', '#a3261c', '#f4ead2')), roughness: 0.5 })); closed.position.set(-0.7, 1.25, 0.066); kiosk.add(closed);
    const hands = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.1), new THREE.MeshBasicMaterial({ map: panel(512, 432, drawHands), transparent: true, opacity: 0.8, depthWrite: false })); hands.position.set(0.66, 1.66, 0.064); hands.visible = false; hands.renderOrder = 3; kiosk.add(hands);
    mount(R, kiosk, 'W', -33.5); props.hands = hands;
    // reflection
    const GX = -HW + 0.06, KZ = -33.5;
    const refMat = new THREE.MeshBasicMaterial({ color: 0x20262a, fog: false, depthTest: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.EqualStencilFunc });
    const ref = makeFigure({ mat: refMat }); ref.traverse((o) => { if (o.isMesh) { o.renderOrder = 2; o.userData.cast = false; o.castShadow = false; } }); R.add(ref); ref.visible = false;
    props.reflection = { delay: 0 }; const hist = [];
    updaters.push((dt, t, player) => {
      if (!player || Math.abs(player.pos.z - KZ) > 9) { ref.visible = false; hist.length = 0; return; }
      hist.push({ t, x: player.pos.x, z: player.pos.z, ph: player.bobPhase, yaw: player.yaw, mv: player.speed });
      while (hist.length > 2 && hist[1].t <= t - props.reflection.delay) hist.shift();
      const h = hist[0]; ref.visible = true; ref.position.set(2 * GX - h.x, 0, h.z); ref.rotation.y = Math.PI - h.yaw; poseWalk(ref, h.ph, Math.min(1, h.mv / 3) * 0.6);
      const k = THREE.MathUtils.clamp(1.25 - (h.x - GX) / 3.6, 0.35, 1); refMat.color.setRGB(0.05 * k, 0.062 * k, 0.07 * k);
    });
    // fire cabinet, vent
    const fire = new THREE.Group(); box(fire, new S({ color: 0x9c1d16, roughness: 0.4, metalness: 0.3 }), 0.6, 0.82, 0.2, 0, 0, 0.1);
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.16), new S({ map: panel(256, 96, (c, w, h) => drawPlate(c, w, h, 'حريق', 'FIRE', '#f1f1f1', '#9c1d16')), roughness: 0.5 })); fp.position.set(0, 0.24, 0.202); fire.add(fp);
    box(fire, new S({ color: 0x0a0c0e, roughness: 0.1, metalness: 0.5 }), 0.44, 0.44, 0.01, 0, -0.12, 0.2); mount(R, fire, 'E', -38.5, 1.25);
    const vent = new THREE.Group(); box(vent, mats.dark, 0.9, 0.46, 0.04, 0, 0, 0.02, false); for (let i = 0; i < 7; i++) { const sl = box(vent, mats.alu, 0.82, 0.012, 0.05, 0, -0.18 + i * 0.06, 0.05, false); sl.rotation.x = 0.5; }
    mount(R, vent, 'W', -38.5, 2.1); props.ventPos = new THREE.Vector3(-HW + 0.1, 2.1, -38.5);
    // hanging exit sign
    const eN = panel(512, 128, (c, w, h) => drawExit(c, w, h, false)), eW = panel(512, 128, (c, w, h) => drawExit(c, w, h, true)), em = lit(eN, 0.9);
    const ex = new THREE.Group(); box(ex, mats.dark, 1.5, 0.4, 0.1, 0, 0, 0); for (const x of [-0.6, 0.6]) box(ex, mats.dark, 0.02, 0.3, 0.02, x, 0.35, 0);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.34), em); f.position.z = s * 0.051; if (s < 0) f.rotation.y = Math.PI; ex.add(f); }
    ex.position.set(0, 2.5, -41); R.add(ex); props.exitSign = { setWrong: (v) => { em.map = em.emissiveMap = v ? eW : eN; } };
    // puddle + drip
    const pudM = new S({ color: 0x0b0d0e, roughness: 0.04, metalness: 0.35, transparent: true, opacity: 0.82, envMapIntensity: 2 });
    const pud = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), pudM); pud.rotation.x = -Math.PI / 2; pud.scale.set(1.35, 0.9, 1); pud.position.set(-0.95, 0.006, -31); R.add(pud);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), new S({ color: 0x99aab0, roughness: 0.1, metalness: 0.6 })); drop.position.set(-0.95, 3, -31); R.add(drop);
    props.puddle = { mesh: pud, mat: pudM, pos: pud.position }; let dT = 2, dV = 0, falling = false;
    updaters.push((dt) => {
      if (!falling) { dT -= dt; drop.visible = false; if (dT < 0) { falling = true; dV = 0; drop.position.y = 2.98; drop.visible = true; } return; }
      dV += 9.8 * dt; drop.position.y -= dV * dt; if (drop.position.y < 0.02) { falling = false; dT = 1.8 + Math.random() * 3.5; world.events.drip?.(pud.position); }
    });
    // orphan shadow decal
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 2.3), new THREE.MeshBasicMaterial({ map: panel(128, 320, drawShadow), transparent: true, opacity: 0.62, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.rotation.z = Math.PI / 2 + 0.25; sh.position.set(0.55, 0.008, -23.2); sh.visible = false; R.add(sh); props.shadow = sh;
    R.traverse((o) => { if (o.isMesh && o.userData.cast === undefined) o.userData.cast = false; });
  }
  return { buildHallProps, colliders, update: (dt, t, player) => { for (const u of updaters) u(dt, t, player); } };
}
