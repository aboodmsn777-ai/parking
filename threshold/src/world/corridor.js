// Corridor shell: a hall with a Z-bend at each end. Both end complexes are identical and
// 180°-symmetric about their centre, which is what makes the loop teleports invisible.
import * as THREE from 'three';
import { tileSet, floorSet, concreteSet, tactileSet } from './textures.js';
import { buildProps } from './props.js';

export const L = 52, HW = 2, H = 3;            // hall length, half width, height
export const ENTRY = new THREE.Vector3(-8, 0, 2);
export const HALL_Z0 = -5, HALL_LEN = L - 10;   // main (stretchable) shell
export const LIGHT_Z = [-8.5, -13.5, -18.5, -23.5, -28.5, -33.5, -38.5, -43.5];
const LIGHT_COLOR = 0xdcefe6;

const lerp = (a, b, t) => a + (b - a) * t;
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const h = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
}

export function makeMats() {
  const S = THREE.MeshStandardMaterial;
  const tile = tileSet(), floor = floorSet(), conc = concreteSet(), paint = concreteSet([150, 153, 144], 9, false), tac = tactileSet();
  const m = {};
  m.tile = new S({ ...tile, vertexColors: true, roughness: 1, metalness: 0, normalScale: new THREE.Vector2(0.9, 0.9) });
  m.tileLong = m.tile.clone();
  for (const k of ['map', 'normalMap', 'roughnessMap']) { const t = tile[k].clone(); t.repeat.set(0.5, 1); t.needsUpdate = true; m.tileLong[k] = t; }
  m.floor = new S({ ...floor, roughness: 1, metalness: 0 });
  m.ceil = new S({ ...conc, color: 0x9a9d9b, roughness: 1 });
  m.paint = new S({ ...paint, vertexColors: true, roughness: 1 });
  m.conc = new S({ ...conc, roughness: 1 });
  m.skirt = new S({ color: 0x232525, roughness: 0.6 });
  m.stripe = new S({ color: 0x0d6a61, roughness: 0.3 });
  m.steel = new S({ color: 0x9da2a6, metalness: 0.92, roughness: 0.36 });
  m.alu = new S({ color: 0x7d8286, metalness: 0.85, roughness: 0.5 });
  m.dark = new S({ color: 0x1c1e20, metalness: 0.6, roughness: 0.55 });
  m.black = new THREE.MeshBasicMaterial({ color: 0x000000 });
  m.tactile = new S({ ...tac, roughness: 1 });
  return m;
}

function wallPlane(len, y0, y1, mat, seed) {
  const g = new THREE.PlaneGeometry(len, y1 - y0, Math.max(1, Math.round(len / 0.45)), Math.max(1, Math.round((y1 - y0) / 0.4)));
  const p = g.attributes.position, uv = g.attributes.uv, col = new Float32Array(p.count * 3), mid = (y0 + y1) / 2;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + len / 2, y = p.getY(i) + mid;
    uv.setXY(i, x / 1.2, y / 1.2);
    let k = 1 - 0.34 * Math.max(0, 1 - y / 0.7) - 0.2 * vnoise(x * 0.5 + seed, y * 0.9) - 0.1 * vnoise(x * 1.9 + seed, y * 2.3);
    k -= 0.18 * Math.max(0, (y - 2.2) / 0.8);
    col[i * 3] = k; col[i * 3 + 1] = k * 0.985; col[i * 3 + 2] = k * 0.94;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, mat); m.position.y = mid; return m;
}

// Wall from a to b (xz); it faces (dz,-dx).
export function addWall(parent, mats, a, b, seed = 0, collide = true) {
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), nx = dz / len, nz = -dx / len;
  const g = new THREE.Group();
  g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); g.rotation.y = Math.atan2(nx, nz);
  const tile = wallPlane(len, 0.1, 2.5, mats.tile, seed + a[0] * 0.37 + a[1] * 0.91);
  const band = wallPlane(len, 2.5, H, mats.paint, seed + 40);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.03), mats.skirt); skirt.position.set(0, 0.05, 0.015);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(len, 0.09, 0.016), mats.stripe); stripe.position.set(0, 2.5, 0.008);
  g.add(tile, band, skirt, stripe); g.userData.tile = tile; parent.add(g);
  if (collide) (parent.userData.walls ||= []).push({ a, b });
  return g;
}
function flat(parent, x0, z0, x1, z1, y, mat, up = true, s = 1.2) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0), p = g.attributes.position, uv = g.attributes.uv, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + cx) / s, (p.getY(i) * (up ? -1 : 1) + cz) / s);
  const m = new THREE.Mesh(g, mat); m.rotation.x = up ? -Math.PI / 2 : Math.PI / 2; m.position.set(cx, y, cz); parent.add(m); return m;
}
function strip(parent, mats, x0, z0, x1, z1) {
  const w = Math.abs(x1 - x0) || 0.3, d = Math.abs(z1 - z0) || 0.3, alongX = w > d;
  const g = new THREE.PlaneGeometry(w, d), uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < p.count; i++) alongX ? uv.setXY(i, p.getY(i) / 0.3 + 0.5, p.getX(i) / 0.3) : uv.setXY(i, p.getX(i) / 0.3 + 0.5, p.getY(i) / 0.3);
  const m = new THREE.Mesh(g, mats.tactile); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.004, (z0 + z1) / 2); parent.add(m); return m;
}

function fixture(world, parent, x, z, alongZ, kind, shadow) {
  const g = new THREE.Group(); g.position.set(x, 0, z); if (!alongZ) g.rotation.y = Math.PI / 2;
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 1.5), world.mats.dark); housing.position.y = H - 0.035;
  const mat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: LIGHT_COLOR, emissiveIntensity: 3, roughness: 0.6 });
  const tube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 1.4), mat); tube.position.y = H - 0.085;
  g.add(housing, tube); parent.add(g);
  let light;
  if (kind === 'hall') {
    light = new THREE.SpotLight(LIGHT_COLOR, 52, 12, 1.28, 0.8, 1.7);
    light.position.set(0, H - 0.13, 0); light.target.position.set(0, 0, 0); g.add(light.target);
    light.castShadow = shadow; light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.0006; light.shadow.normalBias = 0.03;
    light.shadow.camera.near = 0.3; light.shadow.camera.far = 7; light.shadow.autoUpdate = false; light.shadow.needsUpdate = true;
  } else {
    light = new THREE.PointLight(LIGHT_COLOR, kind === 'stub' ? 15 : 17, 9.5, 1.8); light.position.set(0, H - 0.25, 0);
  }
  g.add(light);
  const e = { light, mat, kind, z, x, base: light.intensity, mul: 1, flick: 1, color: new THREE.Color(LIGHT_COLOR), group: g };
  world.lights.push(e); return e;
}

function buildHalf(world, fake) {
  const { mats } = world, g = new THREE.Group(), piece = new THREE.Group(); g.add(piece);
  addWall(g, mats, [0, 2], [10, 2], 1);
  addWall(g, mats, [6, -2], [0, -2], 2);
  addWall(g, mats, [10, 2], [10, -2], 3);
  addWall(piece, mats, [10, -2], [10, -7], 4);
  addWall(piece, mats, [6, -7], [6, -2], 5);
  flat(g, 0, -2, 10, 2, 0, mats.floor); flat(piece, 6, -7, 10, -2, 0, mats.floor);
  flat(g, 0, -2, 10, 2, H, mats.ceil, false, 2.4); flat(piece, 6, -7, 10, -2, H, mats.ceil, false, 2.4);
  strip(g, mats, 0, 0, 8.15, 0); strip(g, mats, 8, 0.15, 8, -2); strip(piece, mats, 8, -2, 8, -7);
  fixture(world, g, 8, 0, true, 'corner', false);
  const pil = new THREE.Mesh(new THREE.BoxGeometry(0.34, H, 0.34), mats.paint.clone()); pil.material.vertexColors = false; pil.material.color.set(0x8f928c);
  pil.position.set(6, H / 2, -2); g.add(pil); // inner corner column
  world.decorateHalf(g);
  if (fake) {
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(4, H), mats.black); cap.position.set(8, H / 2, -7); piece.add(cap);
    piece.userData.walls.push({ a: [10, -7], b: [6, -7] });
  }
  g.userData.piece = piece; return g;
}

function buildStairs(world) {
  const { mats } = world, g = new THREE.Group(), rise = 0.16, run = 0.3;
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(4, rise * (i + 1), run), mats.conc);
    s.position.set(8, rise * (i + 1) / 2, -2.3 - run * (i + 0.5)); g.add(s);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(4, 0.012, 0.05), mats.tactile); nose.position.set(8, rise * (i + 1) + 0.006, -2.3 - run * i - 0.03); g.add(nose);
  }
  for (const x of [6, 10]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 7), mats.conc); w.position.set(x, 3.5, -5.1); w.rotation.y = x === 6 ? Math.PI / 2 : -Math.PI / 2; g.add(w);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 6.2), mats.steel);
    rail.rotation.x = Math.PI / 2 + Math.atan2(rise, run); rail.position.set(x + (x === 6 ? 0.12 : -0.12), 2.45, -5.1); g.add(rail);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(4, 7), mats.conc); ceil.rotation.x = Math.PI / 2 + Math.atan2(rise, run); ceil.position.set(8, 4.55, -5.1); g.add(ceil);
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.6, 4.8), fog: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), glowMat); glow.position.set(8, 4.6, -7.9); g.add(glow);
  const light = new THREE.PointLight(0xfff0d8, 0, 14, 1.6); light.position.set(8, 4.2, -7); g.add(light);
  g.userData = { glowMat, light }; g.visible = false; return g;
}

export function buildWorld(scene, { shadows }) {
  const world = { scene, root: new THREE.Group(), lights: [], colliders: [], props: {}, extra: 0, final: false, mats: makeMats(), shadows, events: {} };
  scene.add(world.root);
  const { mats } = world;
  const P = buildProps(world); // registers world.decorateHalf + hall props builder

  // --- end complexes
  const mkComplex = (fakeEast) => {
    const c = new THREE.Group(), a = buildHalf(world, fakeEast), b = buildHalf(world, !fakeEast);
    b.rotation.y = Math.PI; c.add(a, b); fixture(world, c, 0, 0, false, 'stub', false);
    c.userData = { a, b }; world.root.add(c); return c;
  };
  world.entry = mkComplex(false); world.entry.position.copy(ENTRY);
  world.exit = mkComplex(true); world.exit.position.set(8, 0, -L - 2);
  world.stairs = buildStairs(world); world.exit.userData.a.add(world.stairs);

  // --- main hall (scaled in z for the "longer corridor" anomaly)
  const hall = world.hall = new THREE.Group(); hall.position.z = HALL_Z0; world.root.add(hall);
  const brk = [0, -1]; for (let z = -6; z >= -HALL_LEN + 1; z -= 5) brk.push(z); brk.push(-HALL_LEN);
  world.bays = { east: [], west: [] }; world.strips = [];
  for (let i = 0; i < brk.length - 1; i++) {
    world.bays.east.push(addWall(hall, mats, [HW, brk[i]], [HW, brk[i + 1]], 10 + i, false));
    world.bays.west.push(addWall(hall, mats, [-HW, brk[i + 1]], [-HW, brk[i]], 30 + i, false));
    world.strips.push(strip(hall, mats, 0, brk[i], 0, brk[i + 1]));
  }
  const pilMat = mats.paint.clone(); pilMat.vertexColors = false; pilMat.color.set(0x8f928c);
  for (let z = -1; z >= -HALL_LEN; z -= 5) for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, H, 0.5), pilMat); p.position.set(s * (HW - 0.06), H / 2, z); hall.add(p);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * HW, 0.16, 0.5), pilMat); if (s > 0) { beam.position.set(0, H - 0.08, z); hall.add(beam); }
  }
  flat(hall, -HW, -HALL_LEN, HW, 0, 0, mats.floor); flat(hall, -HW, -HALL_LEN, HW, 0, H, mats.ceil, false, 2.4);
  for (const [x, y, r] of [[1.62, 2.74, 0.055], [1.78, 2.6, 0.035], [-1.7, 2.78, 0.03]]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(r, r, HALL_LEN - 0.4, 10), x > 0 ? mats.alu : mats.dark);
    pipe.rotation.x = Math.PI / 2; pipe.position.set(x, y, -HALL_LEN / 2); hall.add(pipe);
  }
  for (let z = -3.5; z > -HALL_LEN; z -= 5) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.05), mats.dark); br.position.set(1.7, 2.84, z); hall.add(br); }
  world.hallLights = LIGHT_Z.map((z) => fixture(world, world.root, 0, z, true, 'hall', shadows));
  P.buildHallProps();

  // --- colliders
  const baseCol = [], exitCol = [];
  world.root.updateMatrixWorld(true);
  const A = new THREE.Vector3(), B = new THREE.Vector3();
  world.root.traverse((o) => {
    if (!o.userData.walls) return;
    let inExit = false; o.traverseAncestors((p) => { if (p === world.exit) inExit = true; });
    for (const w of o.userData.walls) {
      A.set(w.a[0], 0, w.a[1]).applyMatrix4(o.matrixWorld); B.set(w.b[0], 0, w.b[1]).applyMatrix4(o.matrixWorld);
      const len = A.distanceTo(B), nx = (B.z - A.z) / len, nz = -(B.x - A.x) / len;
      const c = { minX: Math.min(A.x, B.x, A.x - nx * 0.5, B.x - nx * 0.5), maxX: Math.max(A.x, B.x, A.x - nx * 0.5, B.x - nx * 0.5),
        minZ: Math.min(A.z, B.z, A.z - nz * 0.5, B.z - nz * 0.5), maxZ: Math.max(A.z, B.z, A.z - nz * 0.5, B.z - nz * 0.5), on: true };
      (inExit ? exitCol : baseCol).push(c);
    }
  });
  baseCol.push({ minX: HW, maxX: HW + 0.5, minZ: -L, maxZ: HALL_Z0, on: true }, { minX: -HW - 0.5, maxX: -HW, minZ: -L, maxZ: HALL_Z0, on: true });
  world.propColliders = P.colliders;
  const exitBase = exitCol.map((c) => ({ ...c }));
  world.setHallExtra = (d) => {
    world.extra = d; hall.scale.z = (HALL_LEN + d) / HALL_LEN; world.exit.position.z = -L - 2 - d;
    exitCol.forEach((c, i) => { c.minZ = exitBase[i].minZ - d; c.maxZ = exitBase[i].maxZ - d; });
    baseCol[baseCol.length - 1].minZ = baseCol[baseCol.length - 2].minZ = -L - d;
    world.refreshShadows();
  };
  world.colliders = [...baseCol, ...exitCol, ...P.colliders];
  world.exitCentre = () => ({ x: 8, z: -L - 2 - world.extra });

  world.setFinal = (on, secret = false) => {
    world.final = on; world.stairs.visible = on; world.exit.userData.a.userData.piece.visible = !on;
    const { glowMat, light } = world.stairs.userData;
    light.intensity = on ? (secret ? 12 : 60) : 0; light.color.set(secret ? 0xff3020 : 0xfff0d8);
    glowMat.color.setRGB(...(secret ? [1.6, 0.12, 0.06] : [6, 5.6, 4.8]));
    if (P.setFinal) P.setFinal(on, secret);
  };
  world.groundHeight = (x, z) => {
    if (!world.final) return 0;
    const e = world.exitCentre(), lz = z - e.z, lx = x - e.x;
    if (lx < 6 || lz > -2.3) return 0;
    return Math.min(18 * 0.16, (-2.3 - lz) * (0.16 / 0.3));
  };
  world.applyLights = () => {
    for (const e of world.lights) {
      const k = e.mul * e.flick; e.light.intensity = e.base * k; e.light.color.copy(e.color);
      e.mat.emissive.copy(e.color); e.mat.emissiveIntensity = 3 * k;
    }
  };
  world.resetLights = () => { for (const e of world.lights) { e.mul = 1; e.color.set(LIGHT_COLOR); } };
  world.dynamicShadows = false;
  world.refreshShadows = () => { for (const e of world.hallLights) e.light.shadow.needsUpdate = true; };
  world.setShadows = (on) => { world.shadows = on; for (const e of world.hallLights) e.light.castShadow = on; world.refreshShadows(); };

  // idle flicker on one tube
  let fT = 4, fBurst = 0;
  world.update = (dt, t, player) => {
    const fl = world.hallLights[2];
    fT -= dt;
    if (fT < 0 && fBurst <= 0) { fBurst = 0.25 + Math.random() * 0.5; fT = 5 + Math.random() * 11; world.events.flick?.(fl); }
    if (fBurst > 0) { fBurst -= dt; fl.flick = Math.random() < 0.5 ? 0.25 + Math.random() * 0.3 : 1; } else fl.flick = 1;
    P.update(dt, t, player);
    world.applyLights();
    if (world.dynamicShadows && world.shadows) world.refreshShadows();
  };
  world.bakeEnv = (renderer) => {
    const rt = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType });
    const cc = new THREE.CubeCamera(0.1, 60, rt); cc.position.set(0, 1.5, -21); scene.add(cc); cc.update(renderer, scene); scene.remove(cc);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromCubemap(rt.texture).texture; scene.environmentIntensity = 0.5;
    pm.dispose(); rt.dispose();
  };
  world.root.traverse((o) => { if (o.isMesh) { o.receiveShadow = true; if (o.userData.cast) o.castShadow = true; } });
  world.applyLights();
  return world;
}
